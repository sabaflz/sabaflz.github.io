/* owner.js: "only me" mode for the whole site.

   Public visitors never get private content, because it isn't on this site at all.
   It lives in the private GitHub repo sabaflz/site-private. When you log in with
   your planner admin password, this file unlocks the GitHub token stored
   (encrypted) in planner/data/admin.json and uses it to read that private repo
   straight from GitHub. No token, no content.

   The login is the same one the planner uses, so logging in here also logs you
   into the planner, and the other way round. It lasts until you close the tab.

   Private pages call:   Owner.signedIn()        true when you're logged in
                          Owner.login()           shows the password box
                          Owner.logout()
                          Owner.text(path)        a file from site-private, as text
                          Owner.json(path)        same, parsed as JSON
                          Owner.lockScreen(el, what)   the "this is private" card
   You can also open any page with #owner at the end of the address to log in.
*/
(function () {
  "use strict";
  if (window.Owner) return;

  var PRIVATE = { owner: "sabaflz", repo: "site-private", branch: "main" };
  var ADMIN_URL = "/planner/data/admin.json";
  var SS_TOKEN = "sf_planner_tok", SS_PASS = "sf_planner_pw";   // shared with planner/sync.js

  function ss(k, v) {
    try {
      if (v === undefined) return sessionStorage.getItem(k);
      if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v);
    } catch (e) { return null; }
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function b64(s) { s = atob(String(s).replace(/\s/g, "")); var o = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) o[i] = s.charCodeAt(i); return o; }

  async function decrypt(enc, pass) {
    var te = new TextEncoder();
    var base = await crypto.subtle.importKey("raw", te.encode(pass), "PBKDF2", false, ["deriveKey"]);
    var key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(enc.salt), iterations: enc.iter || 600000, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    var pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(enc.iv) }, key, b64(enc.ct));
    return new TextDecoder().decode(pt);
  }

  function signedIn() { return !!ss(SS_TOKEN); }

  function logout() { ss(SS_TOKEN, null); ss(SS_PASS, null); location.reload(); }

  /* ---- read a file from the private repo ---------------------------------- */
  var cache = {};
  function text(path) {
    var tok = ss(SS_TOKEN);
    if (!tok) return Promise.reject(Object.assign(new Error("Not logged in."), { locked: true }));
    if (cache[path]) return cache[path];
    var url = "https://api.github.com/repos/" + PRIVATE.owner + "/" + PRIVATE.repo + "/contents/" +
      path.split("/").map(encodeURIComponent).join("/") + "?ref=" + PRIVATE.branch;
    cache[path] = fetch(url, {
      cache: "no-store",
      headers: { "Authorization": "Bearer " + tok, "Accept": "application/vnd.github.raw+json", "X-GitHub-Api-Version": "2022-11-28" }
    }).then(function (r) {
      if (r.ok) return r.text();
      delete cache[path];
      if (r.status === 401) { ss(SS_TOKEN, null); throw Object.assign(new Error("Your login expired. Log in again."), { locked: true }); }
      if (r.status === 404) throw new Error("Couldn't find " + path + " in " + PRIVATE.repo + ". Check the file exists and your GitHub token includes that repo.");
      throw new Error("GitHub said " + r.status + " for " + path + ".");
    });
    return cache[path];
  }
  function json(path) { return text(path).then(JSON.parse); }

  /* ---- login box ------------------------------------------------------------ */
  var CSS =
    ".ow-scrim{position:fixed;inset:0;z-index:60;background:rgba(10,12,30,.45);display:grid;place-items:center;padding:16px}" +
    ".ow-box{width:min(380px,100%);background:var(--surface,#fff);color:var(--ink,#16193A);border:1.5px solid var(--line,#D3D6DF);border-radius:16px;padding:24px;box-shadow:0 24px 60px rgba(10,12,30,.25);font:400 16px/1.5 var(--body,system-ui,sans-serif)}" +
    ".ow-box h2{font:700 22px/1.2 var(--display,system-ui,sans-serif);margin:0 0 6px}" +
    ".ow-box p{margin:0 0 14px;color:var(--muted,#555A73);font-size:14.5px}" +
    ".ow-box input{width:100%;box-sizing:border-box;font:inherit;padding:11px 12px;border:1.5px solid var(--line,#D3D6DF);border-radius:10px;background:var(--bg,#EEF0F3);color:inherit}" +
    ".ow-row{display:flex;gap:10px;justify-content:flex-end;margin-top:16px}" +
    ".ow-btn{font:600 15px/1 var(--body,system-ui,sans-serif);padding:11px 16px;border-radius:999px;border:1.5px solid var(--ink,#16193A);background:var(--ink,#16193A);color:var(--bg,#fff);cursor:pointer}" +
    ".ow-btn.ghost{background:transparent;color:var(--ink,#16193A);border-color:var(--line,#D3D6DF)}" +
    ".ow-err{color:#B4531A;font-size:14px;margin:10px 0 0;min-height:1em}" +
    ".ow-lock{text-align:center;max-width:460px;margin:56px auto;padding:36px 24px;background:var(--surface,#fff);border:1.5px solid var(--line,#D3D6DF);border-radius:18px}" +
    ".ow-lock h2{font:700 24px/1.2 var(--display,system-ui,sans-serif);margin:0 0 8px}" +
    ".ow-lock p{color:var(--muted,#555A73);margin:0 0 18px}";
  function injectCss() {
    if (document.getElementById("ow-css")) return;
    var s = document.createElement("style"); s.id = "ow-css"; s.textContent = CSS; document.head.appendChild(s);
  }

  function login() {
    injectCss();
    return new Promise(function (resolve) {
      var scrim = document.createElement("div");
      scrim.className = "ow-scrim";
      scrim.innerHTML = '<form class="ow-box" role="dialog" aria-modal="true" aria-labelledby="owH">' +
        '<h2 id="owH">Owner login</h2><p>Your planner admin password.</p>' +
        '<input id="owPw" type="password" autocomplete="current-password" aria-label="Password" required>' +
        '<p class="ow-err" id="owErr" role="alert"></p>' +
        '<div class="ow-row"><button type="button" class="ow-btn ghost" id="owCancel">Cancel</button>' +
        '<button type="submit" class="ow-btn" id="owGo">Log in</button></div></form>';
      document.body.appendChild(scrim);
      var pw = scrim.querySelector("#owPw"), err = scrim.querySelector("#owErr"), go = scrim.querySelector("#owGo");
      pw.focus();
      function done(ok) { scrim.remove(); resolve(ok); }
      scrim.querySelector("#owCancel").onclick = function () { done(false); };
      scrim.addEventListener("keydown", function (e) { if (e.key === "Escape") done(false); });
      scrim.querySelector("form").onsubmit = async function (e) {
        e.preventDefault();
        go.disabled = true; err.textContent = "Checking…";
        try {
          var r = await fetch(ADMIN_URL + "?t=" + Date.now(), { cache: "no-store" });
          if (!r.ok) throw new Error("setup");
          var file = await r.json();
          var tok = await decrypt(file.enc, pw.value);
          ss(SS_TOKEN, tok); ss(SS_PASS, pw.value);
          done(true);
          location.reload();
        } catch (x) {
          go.disabled = false; pw.select();
          err.textContent = x.message === "setup" ? "Admin isn't set up yet. Open the Planner and choose Admin." : "That password didn't work.";
        }
      };
    });
  }

  /* A standard "this page is private" card, with a login button. */
  function lockScreen(el, what) {
    injectCss();
    el.innerHTML = '<div class="ow-lock"><h2>This page is private</h2><p>' + esc(what || "Only the site owner can see this.") + "</p>" +
      '<button type="button" class="ow-btn">Owner login</button></div>';
    el.querySelector("button").onclick = login;
  }

  window.Owner = { signedIn: signedIn, login: login, logout: logout, text: text, json: json, lockScreen: lockScreen, repo: PRIVATE };

  /* #owner at the end of any address opens the login */
  function checkHash() {
    if (location.hash === "#owner") {
      history.replaceState(null, "", location.pathname + location.search);
      if (!signedIn()) login();
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", checkHash); else checkHash();
})();
