/*
  sync.js: admin login, visibility, and saving for the planner.

  How it works
  - Your data lives in planner/data/state.json in this repo.
  - Visitors only ever read it. If it's set to "Only me", it's encrypted, so they see a lock screen.
  - Admin = whoever has a GitHub token that can write to this repo. The token stays in
    that browser only. Changes are saved by committing state.json through the GitHub API.
  - "Only me" encrypts with a passphrase (AES-GCM, key from PBKDF2). The passphrase is
    never stored or sent anywhere; it's kept for the current tab session only.
*/
(function () {
  "use strict";

  var CFG = { owner: "sabaflz", repo: "sabaflz.github.io", branch: "main",
              state: "planner/data/state.json", seed: "planner/data/seed.js" };
  var API = window.PLANNER_API || "https://api.github.com";
  var STATE_URL = window.PLANNER_STATE_URL || "data/state.json";
  var TOKEN_KEY = "sf_planner_admin_token", PASS_KEY = "sf_planner_pass";
  var ITER = 250000;

  var token = lsGet(TOKEN_KEY);
  var sha = null;            // current state.json blob sha (admin)
  var visibility = null;     // "public" | "private"
  var data = null;           // decrypted data
  var keyCache = null;       // { salt, key } for private mode
  var saveTimer = null, saving = false, pending = false;

  // ---------- small helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} }
  var te = new TextEncoder(), td = new TextDecoder();
  function bytesToB64(bytes) { var s = ""; for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
  function b64ToBytes(b64) { var s = atob(b64.replace(/\s/g, "")), out = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i); return out; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // ---------- crypto ----------
  async function deriveKey(pass, salt) {
    var base = await crypto.subtle.importKey("raw", te.encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: ITER, hash: "SHA-256" }, base,
      { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function encrypt(obj, pass) {
    if (!keyCache || keyCache.pass !== pass) {
      var salt = crypto.getRandomValues(new Uint8Array(16));
      keyCache = { pass: pass, salt: salt, key: await deriveKey(pass, salt) };
    }
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, keyCache.key, te.encode(JSON.stringify(obj))));
    return { v: 1, kdf: "PBKDF2-SHA256", iter: ITER, salt: bytesToB64(keyCache.salt), iv: bytesToB64(iv), ct: bytesToB64(ct) };
  }
  async function decrypt(enc, pass) {
    var salt = b64ToBytes(enc.salt);
    var key = await deriveKey(pass, salt);
    var pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(enc.iv) }, key, b64ToBytes(enc.ct));
    keyCache = { pass: pass, salt: salt, key: key };
    return JSON.parse(td.decode(pt));
  }

  // ---------- GitHub API ----------
  function gh(method, path, body, tok) {
    return fetch(API + path, {
      method: method,
      headers: { "Authorization": "Bearer " + (tok || token), "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store"
    });
  }
  function contentsPath(p) { return "/repos/" + CFG.owner + "/" + CFG.repo + "/contents/" + p; }
  async function verifyToken(tok) {
    var r = await gh("GET", "/repos/" + CFG.owner + "/" + CFG.repo, null, tok);
    if (r.status === 401) throw new Error("GitHub didn't accept that token. Check it was copied fully and hasn't expired.");
    if (!r.ok) throw new Error("Couldn't reach GitHub (" + r.status + "). Make sure the token has access to " + CFG.repo + ".");
    var j = await r.json();
    if (!j.permissions || !j.permissions.push) throw new Error("That token can read the repo but can't save. Give it Contents: Read and write.");
  }
  async function readState() {
    var r = await gh("GET", contentsPath(CFG.state) + "?ref=" + CFG.branch);
    if (r.status === 404) return null;
    if (r.status === 401) { throw Object.assign(new Error("auth"), { auth: true }); }
    if (!r.ok) throw new Error("Couldn't load your planner from GitHub (" + r.status + ").");
    var j = await r.json();
    sha = j.sha;
    return JSON.parse(td.decode(b64ToBytes(j.content)));
  }
  async function writeFile(path, text, fileSha, message) {
    var body = { message: message, content: bytesToB64(te.encode(text)), branch: CFG.branch };
    if (fileSha) body.sha = fileSha;
    return gh("PUT", contentsPath(path), body);
  }
  async function deleteSeed() {
    try {
      var r = await gh("GET", contentsPath(CFG.seed) + "?ref=" + CFG.branch);
      if (!r.ok) return;
      var j = await r.json();
      await gh("DELETE", contentsPath(CFG.seed), { message: "Planner: remove seed data (now in state.json)", sha: j.sha, branch: CFG.branch });
    } catch (e) {}
  }

  // ---------- saving ----------
  async function buildFile() {
    var file = { visibility: visibility, updated: new Date().toISOString() };
    if (visibility === "private") {
      var pass = ssGet(PASS_KEY);
      if (!pass) throw new Error("Passphrase missing. Reload and unlock again.");
      file.enc = await encrypt(data, pass);
    } else {
      file.data = data;
    }
    return JSON.stringify(file, null, visibility === "private" ? 0 : 2) + "\n";
  }
  function scheduleSave() {
    setStatus("Unsaved changes…", "mid");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 2500);
  }
  async function saveNow() {
    if (saving) { pending = true; return; }
    saving = true; setStatus("Saving…", "mid");
    try {
      var text = await buildFile();
      var r = await writeFile(CFG.state, text, sha, "Planner: update (" + (visibility === "private" ? "private" : "public") + ")");
      if (r.status === 409 || r.status === 422) {          // file changed elsewhere: refresh sha, retry once
        var cur = await gh("GET", contentsPath(CFG.state) + "?ref=" + CFG.branch);
        if (cur.ok) { sha = (await cur.json()).sha; r = await writeFile(CFG.state, text, sha, "Planner: update"); }
      }
      if (!r.ok) throw new Error("GitHub said " + r.status);
      sha = (await r.json()).content.sha;
      setStatus("Saved", "good");
    } catch (e) {
      setStatus("Not saved: " + e.message, "bad");
    }
    saving = false;
    if (pending) { pending = false; saveNow(); }
  }
  window.addEventListener("beforeunload", function (e) { if (saveTimer && document.querySelector(".ab-status.mid")) { e.preventDefault(); e.returnValue = ""; } });

  // ---------- UI: shell ----------
  function showPlanner(editable) {
    $("locked").hidden = true;
    document.querySelectorAll("[data-planner]").forEach(function (el) { el.hidden = false; });
    window.PlannerApp.start(data, { editable: editable, onChange: editable ? function (d) { data = d; scheduleSave(); } : null });
  }
  function showLocked(msg) {
    document.querySelectorAll("[data-planner]").forEach(function (el) { el.hidden = true; });
    $("locked").hidden = false;
    $("lockedMsg").textContent = msg || "This planner is private.";
  }
  function setStatus(text, kind) {
    var el = document.querySelector(".ab-status");
    if (!el) return;
    el.textContent = text; el.className = "ab-status " + (kind || "");
  }
  function renderAdminBar() {
    var bar = $("adminBar");
    bar.hidden = false;
    bar.innerHTML =
      '<span class="ab-badge">Admin</span>' +
      '<span class="ab-vis">Who can see it:' +
        '<button type="button" data-vis="private" aria-pressed="' + (visibility === "private") + '">Only me</button>' +
        '<button type="button" data-vis="public" aria-pressed="' + (visibility === "public") + '">Everyone</button></span>' +
      '<span class="ab-status good">Saved</span>' +
      '<button type="button" class="ab-out" id="logoutBtn">Log out</button>';
  }
  document.addEventListener("click", async function (e) {
    var v = e.target.closest && e.target.closest("[data-vis]");
    if (v && token && data) {
      var want = v.getAttribute("data-vis");
      if (want === visibility) return;
      if (want === "public") {
        if (!confirm("Make the planner visible to everyone? Your plans, check-offs, and to-do list will be readable by anyone with the link.")) return;
        visibility = "public";
      } else {
        var pass = ssGet(PASS_KEY) || await askNewPass();
        if (!pass) return;
        ssSet(PASS_KEY, pass); visibility = "private";
      }
      renderAdminBar(); saveNow();
      return;
    }
    if (e.target.id === "logoutBtn") {
      if (document.querySelector(".ab-status.mid") && !confirm("Changes are still saving. Log out anyway?")) return;
      lsSet(TOKEN_KEY, null); ssSet(PASS_KEY, null); location.reload();
    }
    if (e.target.id === "adminLink" || e.target.id === "lockedLogin") { e.preventDefault(); openLogin(); }
  });

  // ---------- UI: modals ----------
  function modal(html) {
    var m = $("modal");
    m.innerHTML = '<div class="mbox" role="dialog" aria-modal="true">' + html + '</div>';
    m.hidden = false;
    var first = m.querySelector("input"); if (first) first.focus();
    return m;
  }
  function closeModal() { $("modal").hidden = true; $("modal").innerHTML = ""; }

  function openLogin(errMsg) {
    var m = modal(
      '<h2>Admin login</h2>' +
      '<p>Paste a GitHub token that can edit <b>' + esc(CFG.repo) + '</b>. It stays in this browser only.</p>' +
      '<label>GitHub token<input id="tokIn" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…"></label>' +
      (errMsg ? '<p class="merr">' + esc(errMsg) + '</p>' : "") +
      '<div class="mrow"><button type="button" class="mbtn ghost" id="mCancel">Cancel</button><button type="button" class="mbtn" id="mGo">Log in</button></div>' +
      '<details><summary>How do I make a token?</summary><ol>' +
        '<li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub → New fine-grained token</a>.</li>' +
        '<li>Name it "Planner admin", pick an expiration (1 year is fine).</li>' +
        '<li>Repository access: <b>Only select repositories</b> → ' + esc(CFG.repo) + '.</li>' +
        '<li>Permissions → Repository → <b>Contents: Read and write</b>. Nothing else.</li>' +
        '<li>Generate, copy, and paste it here. Don\'t share it with anyone.</li></ol></details>');
    m.querySelector("#mCancel").onclick = closeModal;
    m.querySelector("#mGo").onclick = async function () {
      var tok = m.querySelector("#tokIn").value.trim();
      if (!tok) return;
      this.disabled = true; this.textContent = "Checking…";
      try { await verifyToken(tok); token = tok; lsSet(TOKEN_KEY, tok); closeModal(); bootAdmin(); }
      catch (err) { openLogin(err.message); }
    };
    m.querySelector("#tokIn").addEventListener("keydown", function (e) { if (e.key === "Enter") m.querySelector("#mGo").click(); });
  }

  function askPass(errMsg) {
    return new Promise(function (resolve) {
      var m = modal('<h2>Unlock planner</h2><p>Enter your planner passphrase.</p>' +
        '<label>Passphrase<input id="passIn" type="password" autocomplete="current-password"></label>' +
        (errMsg ? '<p class="merr">' + esc(errMsg) + '</p>' : "") +
        '<div class="mrow"><button type="button" class="mbtn ghost" id="mCancel">Cancel</button><button type="button" class="mbtn" id="mGo">Unlock</button></div>');
      m.querySelector("#mCancel").onclick = function () { closeModal(); resolve(null); };
      m.querySelector("#mGo").onclick = function () { var p = m.querySelector("#passIn").value; if (p) { closeModal(); resolve(p); } };
      m.querySelector("#passIn").addEventListener("keydown", function (e) { if (e.key === "Enter") m.querySelector("#mGo").click(); });
    });
  }
  function askNewPass(intro) {
    return new Promise(function (resolve) {
      var m = modal('<h2>Set a passphrase</h2><p>' + esc(intro || "\"Only me\" encrypts your planner with this passphrase.") +
        ' It isn\'t stored anywhere, so if you forget it, your saved plan can\'t be recovered (you\'d start over from scratch).</p>' +
        '<label>Passphrase<input id="p1" type="password" autocomplete="new-password"></label>' +
        '<label>Type it again<input id="p2" type="password" autocomplete="new-password"></label>' +
        '<p class="merr" id="perr" hidden></p>' +
        '<div class="mrow"><button type="button" class="mbtn ghost" id="mCancel">Cancel</button><button type="button" class="mbtn" id="mGo">Set passphrase</button></div>');
      m.querySelector("#mCancel").onclick = function () { closeModal(); resolve(null); };
      m.querySelector("#mGo").onclick = function () {
        var a = m.querySelector("#p1").value, b = m.querySelector("#p2").value, er = m.querySelector("#perr");
        if (a.length < 8) { er.hidden = false; er.textContent = "Use at least 8 characters."; return; }
        if (a !== b) { er.hidden = false; er.textContent = "Those don't match."; return; }
        closeModal(); resolve(a);
      };
    });
  }
  function askVisibility() {
    return new Promise(function (resolve) {
      var m = modal('<h2>Set up your planner</h2><p>First time here as admin. Who should be able to see the planner? You can switch any time.</p>' +
        '<div class="mrow col"><button type="button" class="mbtn" data-first="private">Only me (encrypted)</button>' +
        '<button type="button" class="mbtn ghost" data-first="public">Everyone (read-only for visitors)</button></div>');
      m.querySelectorAll("[data-first]").forEach(function (b) { b.onclick = function () { closeModal(); resolve(b.getAttribute("data-first")); }; });
    });
  }

  // ---------- boot ----------
  async function bootAdmin() {
    try {
      var file = await readState();
      if (!file) return firstRun();
      visibility = file.visibility === "public" ? "public" : "private";
      if (visibility === "public") data = file.data || {};
      else {
        var err = null;
        while (!data) {
          var pass = ssGet(PASS_KEY) || await askPass(err);
          if (!pass) { showLocked("Locked. Enter your passphrase to unlock."); renderLockedAdmin(); return; }
          try { data = await decrypt(file.enc, pass); ssSet(PASS_KEY, pass); }
          catch (e) { ssSet(PASS_KEY, null); err = "That passphrase didn't unlock it. Try again."; }
        }
      }
      renderAdminBar();
      showPlanner(true);
    } catch (e) {
      if (e.auth) { lsSet(TOKEN_KEY, null); token = null; openLogin("Your token expired or was revoked. Make a new one."); bootPublic(); return; }
      showLocked(e.message);
    }
  }
  function renderLockedAdmin() {
    $("lockedActions").innerHTML = '<button type="button" class="mbtn" id="unlockAgain">Unlock</button> <button type="button" class="mbtn ghost" id="logoutBtn">Log out</button>';
    $("unlockAgain").onclick = function () { bootAdmin(); };
  }
  function loadScript(src) {
    return new Promise(function (res) { var sc = document.createElement("script"); sc.src = src + "?t=" + Date.now(); sc.onload = sc.onerror = function () { res(); }; document.head.appendChild(sc); });
  }
  async function firstRun() {
    await loadScript("data/seed.js");
    data = window.PLANNER_SEED ? clone(window.PLANNER_SEED) : { done: [], plans: {}, manual: {}, todos: [], paths: [] };
    var vis = await askVisibility();
    if (vis === "private") {
      var pass = await askNewPass();
      if (!pass) { data = null; return firstRun(); }
      ssSet(PASS_KEY, pass);
    }
    visibility = vis;
    renderAdminBar();
    showPlanner(true);
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

  if (token) bootAdmin(); else bootPublic();
})();
