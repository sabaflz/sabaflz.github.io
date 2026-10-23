/*
  sync.js: admin login, visibility, and saving for the planner.

  How it works
  - Your data lives in planner/data/state.json in this repo. Visitors can only read it,
    and when it's set to "Only me" it's encrypted, so they see a lock screen.
  - You log in with your own admin password. Saving still needs a GitHub token behind the
    scenes, so during one-time setup you paste a token once; it's stored in
    planner/data/admin.json encrypted with your password (AES-GCM, PBKDF2 key, 600k rounds).
    After that, your password alone unlocks it on any device.
  - Admin bar has Download backup / Restore. A backup is your plan as a plain file on your
    own computer, so a forgotten password never means losing your work.
  - "Only me" encrypts state.json with the same password. Nothing unencrypted is stored,
    and your password is kept only for the current tab.
*/
(function () {
  "use strict";

  var CFG = { owner: "sabaflz", repo: "sabaflz.github.io", branch: "main",
              state: "planner/data/state.json", admin: "planner/data/admin.json", seed: "planner/data/seed.js" };
  var API = window.PLANNER_API || "https://api.github.com";
  var STATE_URL = window.PLANNER_STATE_URL || "data/state.json";
  var ADMIN_URL = window.PLANNER_ADMIN_URL || "data/admin.json";
  var SS_TOKEN = "sf_planner_tok", SS_PASS = "sf_planner_pw";
  var ITER = 600000;

  var token = ssGet(SS_TOKEN), password = ssGet(SS_PASS);
  var sha = null, adminSha = null;
  var visibility = null, data = null, keyCache = null;
  var saveTimer = null, saving = false, pending = false;
  try { localStorage.removeItem("sf_planner_admin_token"); } catch (e) {}   // old token-in-browser login

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} }
  var te = new TextEncoder(), td = new TextDecoder();
  function bytesToB64(b) { var s = ""; for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
  function b64ToBytes(s) { s = atob(s.replace(/\s/g, "")); var o = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) o[i] = s.charCodeAt(i); return o; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // ---------- crypto ----------
  async function deriveKey(pass, salt, iter) {
    var base = await crypto.subtle.importKey("raw", te.encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: iter || ITER, hash: "SHA-256" }, base,
      { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function encryptWith(text, pass, cache) {
    var salt, key;
    if (cache && keyCache && keyCache.pass === pass) { salt = keyCache.salt; key = keyCache.key; }
    else { salt = crypto.getRandomValues(new Uint8Array(16)); key = await deriveKey(pass, salt); if (cache) keyCache = { pass: pass, salt: salt, key: key }; }
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, te.encode(text)));
    return { v: 1, kdf: "PBKDF2-SHA256", iter: ITER, salt: bytesToB64(salt), iv: bytesToB64(iv), ct: bytesToB64(ct) };
  }
  async function decryptWith(enc, pass, cache) {
    var salt = b64ToBytes(enc.salt), key = await deriveKey(pass, salt, enc.iter);
    var pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(enc.iv) }, key, b64ToBytes(enc.ct));
    if (cache && (enc.iter || ITER) === ITER) keyCache = { pass: pass, salt: salt, key: key };
    return td.decode(pt);
  }

  // ---------- GitHub API ----------
  function gh(method, path, body, tok) {
    return fetch(API + path, {
      method: method, cache: "no-store",
      headers: { "Authorization": "Bearer " + (tok || token), "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      body: body ? JSON.stringify(body) : undefined
    });
  }
  function cpath(p) { return "/repos/" + CFG.owner + "/" + CFG.repo + "/contents/" + p; }
  async function verifyToken(tok) {
    var r = await gh("GET", "/repos/" + CFG.owner + "/" + CFG.repo, null, tok);
    if (r.status === 401) throw Object.assign(new Error("GitHub didn't accept that token. Check it was copied fully and hasn't expired."), { auth: true });
    if (!r.ok) throw new Error("Couldn't reach GitHub (" + r.status + "). Make sure the token has access to " + CFG.repo + ".");
    var j = await r.json();
    if (!j.permissions || !j.permissions.push) throw new Error("That token can read the repo but can't save. Give it Contents: Read and write.");
  }
  async function readRepoFile(p) {
    var r = await gh("GET", cpath(p) + "?ref=" + CFG.branch);
    if (r.status === 404) return { text: null, sha: null };
    if (!r.ok) throw new Error("Couldn't load from GitHub (" + r.status + ").");
    var j = await r.json();
    return { text: td.decode(b64ToBytes(j.content)), sha: j.sha };
  }
  async function writeRepoFile(p, text, fileSha, message) {
    var body = { message: message, content: bytesToB64(te.encode(text)), branch: CFG.branch };
    if (fileSha) body.sha = fileSha;
    var r = await gh("PUT", cpath(p), body);
    if (r.status === 409 || r.status === 422) {                // changed elsewhere: refresh sha, retry once
      var cur = await readRepoFile(p); body.sha = cur.sha || undefined;
      r = await gh("PUT", cpath(p), body);
    }
    if (!r.ok) throw new Error("GitHub said " + r.status);
    return (await r.json()).content.sha;
  }
  async function deleteSeed() {
    try {
      var r = await gh("GET", cpath(CFG.seed) + "?ref=" + CFG.branch); if (!r.ok) return;
      var j = await r.json();
      await gh("DELETE", cpath(CFG.seed), { message: "Planner: remove seed data (now in state.json)", sha: j.sha, branch: CFG.branch });
    } catch (e) {}
  }

  // ---------- admin.json: your token, locked with your password ----------
  async function fetchAdminFile() {
    try { var r = await fetch(ADMIN_URL + "?t=" + Date.now(), { cache: "no-store" }); return r.ok ? await r.json() : null; }
    catch (e) { return null; }
  }
  async function saveAdminFile(tok, pass) {
    var file = { v: 1, note: "GitHub token for the planner, encrypted with the admin password.", enc: await encryptWith(tok, pass, false) };
    if (!adminSha) adminSha = (await readRepoFile(CFG.admin)).sha;
    adminSha = await writeRepoFile(CFG.admin, JSON.stringify(file, null, 2) + "\n", adminSha, "Planner: admin login key");
  }

  // ---------- saving state ----------
  async function buildState() {
    var file = { visibility: visibility, updated: new Date().toISOString() };
    if (visibility === "private") file.enc = await encryptWith(JSON.stringify(data), password, true);
    else file.data = data;
    return JSON.stringify(file, null, visibility === "private" ? 0 : 2) + "\n";
  }
  function scheduleSave() { setStatus("Unsaved changes…", "mid"); clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 2500); }
  async function saveNow() {
    clearTimeout(saveTimer); saveTimer = null;
    if (saving) { pending = true; return; }
    saving = true; setStatus("Saving…", "mid");
    try {
      sha = await writeRepoFile(CFG.state, await buildState(), sha, "Planner: update (" + (visibility === "private" ? "only me" : "everyone") + ")");
      setStatus("Saved", "good");
    } catch (e) { setStatus("Not saved: " + e.message, "bad"); }
    saving = false;
    if (pending) { pending = false; saveNow(); }
  }
  window.addEventListener("beforeunload", function (e) { if (document.querySelector(".ab-status.mid")) { e.preventDefault(); e.returnValue = ""; } });

  // ---------- backups ----------
  var LS_BACKUP = "sf_planner_last_backup";
  function backupAge() {
    var t = null; try { t = localStorage.getItem(LS_BACKUP); } catch (e) {}
    if (!t) return "never";
    var d = Math.floor((Date.now() - +t) / 86400000);
    return d <= 0 ? "today" : d === 1 ? "yesterday" : d + " days ago";
  }
  function downloadBackup() {
    var file = { type: "sf-planner-backup", v: 1, exported: new Date().toISOString(), visibility: visibility, data: data };
    var blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "planner-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    try { localStorage.setItem(LS_BACKUP, String(Date.now())); } catch (e) {}
    renderAdminBar(); setStatus("Backup downloaded", "good");
  }
  function readBackupFile(fileObj) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () {
        try {
          var j = JSON.parse(r.result);
          var d = j && j.type === "sf-planner-backup" ? j.data : null;
          if (!d || typeof d !== "object" || !d.plans) throw 0;
          resolve(d);
        } catch (e) { reject(new Error("That file isn't a planner backup.")); }
      };
      r.onerror = function () { reject(new Error("Couldn't read that file.")); };
      r.readAsText(fileObj);
    });
  }
  async function restoreInto(d) {
    data = d; await saveNow();
    if (document.querySelector(".ab-status.bad")) return;
    location.reload();
  }

  // ---------- page shell ----------
  function showPlanner(editable) {
    $("locked").hidden = true; closeModal();
    document.querySelectorAll("[data-planner]").forEach(function (el) { el.hidden = false; });
    window.PlannerApp.start(data, { editable: editable, onChange: editable ? function (d) { data = d; scheduleSave(); } : null });
  }
  function showLocked(msg) {
    document.querySelectorAll("[data-planner]").forEach(function (el) { el.hidden = true; });
    $("locked").hidden = false; $("lockedMsg").textContent = msg || "This planner is private.";
  }
  function setStatus(text, kind) { var el = document.querySelector(".ab-status"); if (el) { el.textContent = text; el.className = "ab-status " + (kind || ""); } }
  function renderAdminBar() {
    var bar = $("adminBar"); bar.hidden = false;
    bar.innerHTML = '<span class="ab-badge">Admin</span>' +
      '<span class="ab-vis">Who can see it:' +
        '<button type="button" data-vis="private" aria-pressed="' + (visibility === "private") + '">Only me</button>' +
        '<button type="button" data-vis="public" aria-pressed="' + (visibility === "public") + '">Everyone</button></span>' +
      '<span class="ab-status good">Saved</span>' +
      '<span class="ab-bk">Backup: ' + backupAge() + ' <button type="button" class="ab-out" id="bkBtn">Download</button>' +
        '<label class="ab-out">Restore<input type="file" id="restoreIn" accept="application/json,.json" hidden></label></span>' +
      '<button type="button" class="ab-out" id="pwBtn">Change password</button>' +
      '<button type="button" class="ab-out" id="logoutBtn">Log out</button>';
  }

  document.addEventListener("click", async function (e) {
    var v = e.target.closest && e.target.closest("[data-vis]");
    if (v && token && data) {
      var want = v.getAttribute("data-vis"); if (want === visibility) return;
      if (want === "public" && !confirm("Make the planner visible to everyone? Your plans, check-offs, and to-do list will be readable by anyone with the link. They still can't change anything.")) return;
      visibility = want; renderAdminBar(); saveNow(); return;
    }
    if (e.target.id === "logoutBtn") {
      if (document.querySelector(".ab-status.mid") && !confirm("Changes are still saving. Log out anyway?")) return;
      ssSet(SS_TOKEN, null); ssSet(SS_PASS, null); location.reload(); return;
    }
    if (e.target.id === "pwBtn") { changePassword(); return; }
    if (e.target.id === "bkBtn" && data) { downloadBackup(); return; }
    if (e.target.id === "adminLink" || e.target.id === "lockedLogin") { e.preventDefault(); if (!token) openLogin(); }
  });

  document.addEventListener("change", async function (e) {
    if (e.target.id !== "restoreIn" || !e.target.files[0] || !token) return;
    try {
      var d = await readBackupFile(e.target.files[0]);
      if (!confirm("Replace your current planner with this backup? Download a backup of the current one first if you might want it.")) return;
      await restoreInto(d);
    } catch (err) { alert(err.message); }
    e.target.value = "";
  });

  // ---------- modals ----------
  function modal(html) {
    var m = $("modal"); m.innerHTML = '<div class="mbox" role="dialog" aria-modal="true">' + html + '</div>'; m.hidden = false;
    var f = m.querySelector("input"); if (f) f.focus(); return m;
  }
  function closeModal() { var m = $("modal"); if (m) { m.hidden = true; m.innerHTML = ""; } }
  function onEnter(m, inputSel, btnSel) { m.querySelectorAll(inputSel).forEach(function (i) { i.addEventListener("keydown", function (e) { if (e.key === "Enter") m.querySelector(btnSel).click(); }); }); }
  function busy(btn, label) { btn.disabled = true; btn.textContent = label; }
  var TOKEN_HELP = '<details><summary>How do I make the token?</summary><ol>' +
    '<li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub → New fine-grained token</a>.</li>' +
    '<li>Name it "Planner admin" and pick an expiration (1 year is fine).</li>' +
    '<li>Repository access: <b>Only select repositories</b> → ' + esc(CFG.repo) + '.</li>' +
    '<li>Permissions → Repository → <b>Contents: Read and write</b>. Nothing else.</li>' +
    '<li>Generate, copy, and paste it here. You only do this once.</li></ol></details>';

  async function openLogin(errMsg) {
    var admin = await fetchAdminFile();
    if (!admin) return openSetup();
    var m = modal('<h2>Admin login</h2>' +
      '<label>Password<input id="pwIn" type="password" autocomplete="current-password"></label>' +
      (errMsg ? '<p class="merr">' + esc(errMsg) + '</p>' : "") +
      '<div class="mrow"><button type="button" class="mbtn ghost" id="mCancel">Cancel</button><button type="button" class="mbtn" id="mGo">Log in</button></div>');
    m.querySelector("#mCancel").onclick = closeModal;
    onEnter(m, "#pwIn", "#mGo");
    m.querySelector("#mGo").onclick = async function () {
      var pw = m.querySelector("#pwIn").value; if (!pw) return;
      busy(this, "Checking…");
      var tok;
      try { tok = await decryptWith(admin.enc, pw, false); }
      catch (err) { return openLogin("Wrong password."); }
      try { await verifyToken(tok); }
      catch (err) { if (err.auth) return openRenewToken(pw); return openLogin(err.message); }
      token = tok; password = pw; ssSet(SS_TOKEN, tok); ssSet(SS_PASS, pw);
      bootAdmin();
    };
  }
  function openSetup(errMsg) {
    var m = modal('<h2>Set up admin</h2><p>One-time setup. Choose your admin password, and paste a GitHub token so the planner can save. ' +
      'The token gets locked with your password, so after this you only ever type the password.</p>' +
      '<label>Admin password<input id="p1" type="password" autocomplete="new-password"></label>' +
      '<label>Type it again<input id="p2" type="password" autocomplete="new-password"></label>' +
      '<label>GitHub token<input id="tokIn" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…"></label>' +
      (errMsg ? '<p class="merr">' + esc(errMsg) + '</p>' : "") +
      '<p class="mnote">Use a long password you don\'t use anywhere else, at least 12 characters. It also encrypts your planner when it\'s set to "Only me", and it can\'t be recovered if you forget it.</p>' +
      '<div class="mrow"><button type="button" class="mbtn ghost" id="mCancel">Cancel</button><button type="button" class="mbtn" id="mGo">Set up</button></div>' + TOKEN_HELP);
    m.querySelector("#mCancel").onclick = closeModal;
    m.querySelector("#mGo").onclick = async function () {
      var a = m.querySelector("#p1").value, b = m.querySelector("#p2").value, tok = m.querySelector("#tokIn").value.trim();
      if (a.length < 12) return openSetup("Use at least 12 characters.");
      if (a !== b) return openSetup("The passwords don't match.");
      if (!tok) return openSetup("Paste your GitHub token.");
      busy(this, "Setting up…");
      try { await verifyToken(tok); token = tok; await saveAdminFile(tok, a); }
      catch (err) { token = null; return openSetup(err.message); }
      password = a; ssSet(SS_TOKEN, tok); ssSet(SS_PASS, a);
      bootAdmin();
    };
  }
  function openRenewToken(pw, errMsg) {
    var m = modal('<h2>New token needed</h2><p>Your password is right, but the GitHub token behind it expired or was deleted. Paste a new one and it\'ll be locked with your same password.</p>' +
      '<label>New GitHub token<input id="tokIn" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…"></label>' +
      (errMsg ? '<p class="merr">' + esc(errMsg) + '</p>' : "") +
      '<div class="mrow"><button type="button" class="mbtn ghost" id="mCancel">Cancel</button><button type="button" class="mbtn" id="mGo">Save token</button></div>' + TOKEN_HELP);
    m.querySelector("#mCancel").onclick = closeModal;
    m.querySelector("#mGo").onclick = async function () {
      var tok = m.querySelector("#tokIn").value.trim(); if (!tok) return;
      busy(this, "Checking…");
      try { await verifyToken(tok); token = tok; await saveAdminFile(tok, pw); }
      catch (err) { token = null; return openRenewToken(pw, err.message); }
      password = pw; ssSet(SS_TOKEN, tok); ssSet(SS_PASS, pw); bootAdmin();
    };
  }
  function changePassword(errMsg) {
    var m = modal('<h2>Change password</h2>' +
      '<label>Current password<input id="p0" type="password" autocomplete="current-password"></label>' +
      '<label>New password<input id="p1" type="password" autocomplete="new-password"></label>' +
      '<label>Type it again<input id="p2" type="password" autocomplete="new-password"></label>' +
      (errMsg ? '<p class="merr">' + esc(errMsg) + '</p>' : "") +
      '<div class="mrow"><button type="button" class="mbtn ghost" id="mCancel">Cancel</button><button type="button" class="mbtn" id="mGo">Change</button></div>');
    m.querySelector("#mCancel").onclick = closeModal;
    m.querySelector("#mGo").onclick = async function () {
      var o = m.querySelector("#p0").value, a = m.querySelector("#p1").value, b = m.querySelector("#p2").value;
      if (o !== password) return changePassword("Current password is wrong.");
      if (a.length < 12) return changePassword("Use at least 12 characters.");
      if (a !== b) return changePassword("The new passwords don't match.");
      busy(this, "Re-encrypting…");
      try { await saveAdminFile(token, a); password = a; ssSet(SS_PASS, a); keyCache = null; await saveNow(); closeModal(); setStatus("Password changed", "good"); }
      catch (err) { changePassword(err.message); }
    };
  }
  function askVisibility() {
    return new Promise(function (resolve) {
      var restored = null;
      var m = modal('<h2>Who can see your planner?</h2><p>You can switch this any time from the admin bar.</p>' +
        '<div class="mrow col"><button type="button" class="mbtn" data-first="private">Only me (encrypted)</button>' +
        '<button type="button" class="mbtn ghost" data-first="public">Everyone (read-only for visitors)</button></div>' +
        '<div class="mrestore"><b>Starting over after a reset?</b> <label class="mlink">Restore from a backup file<input type="file" id="firstRestore" accept="application/json,.json" hidden></label>' +
        '<p class="mnote" id="restoreNote">Otherwise you start from the default plan.</p></div>');
      m.querySelector("#firstRestore").addEventListener("change", async function (e) {
        var note = m.querySelector("#restoreNote");
        try { restored = await readBackupFile(e.target.files[0]); note.textContent = "Backup loaded. Now pick who can see it."; note.className = "mnote mok"; }
        catch (err) { restored = null; note.textContent = err.message; note.className = "mnote merr"; }
      });
      m.querySelectorAll("[data-first]").forEach(function (b) { b.onclick = function () { closeModal(); resolve({ vis: b.getAttribute("data-first"), data: restored }); }; });
    });
  }

  // ---------- boot ----------
  function loadScript(src) {
    return new Promise(function (res) { var s = document.createElement("script"); s.src = src + "?t=" + Date.now(); s.onload = s.onerror = function () { res(); }; document.head.appendChild(s); });
  }
  async function bootAdmin() {
    try {
      var f = await readRepoFile(CFG.state);
      if (!f.text) return firstRun();
      sha = f.sha;
      var file = JSON.parse(f.text);
      visibility = file.visibility === "public" ? "public" : "private";
      if (visibility === "public") data = file.data || {};
      else {
        try { data = JSON.parse(await decryptWith(file.enc, password, true)); }
        catch (e) { showLocked("Your password didn't unlock the saved planner."); return; }
      }
      renderAdminBar(); showPlanner(true);
    } catch (e) {
      if (/401/.test(e.message)) { ssSet(SS_TOKEN, null); token = null; bootPublic(); openLogin("Please log in again."); return; }
      showLocked(e.message);
    }
  }
  async function firstRun() {
    await loadScript("data/seed.js");
    data = window.PLANNER_SEED ? clone(window.PLANNER_SEED) : { done: [], plans: {}, manual: {}, todos: [], paths: [] };
    var choice = await askVisibility();
    visibility = choice.vis;
    if (choice.data) data = choice.data;
    renderAdminBar(); showPlanner(true);
    await saveNow();
    deleteSeed();
  }
  async function bootPublic() {
    try {
      var r = await fetch(STATE_URL + "?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) return showLocked("This planner is private.");
      var file = await r.json();
      if (file.visibility === "public" && file.data) { data = file.data; showPlanner(false); }
      else showLocked("This planner is private.");
    } catch (e) { showLocked("This planner is private."); }
  }

  if (token && password) bootAdmin(); else bootPublic();
})();
