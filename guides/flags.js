/* Page flags for the study guides.
   Every heading in the guide gets a small flag button. Tap it, pick an emoji for
   what went wrong (confused, too hard, ask in office hours...), add a note if you
   want, and the "My flags" button in the corner lists every flag with a link
   straight back to it. Saved in this browser only.

   Load it with <script src="../flags.js" defer></script>. Optional attributes:
     data-scope   CSS selector of the content area (default: main, #main, #content, #stage)
     data-units   CSS selector of the flaggable headings inside it (default: h1, h2, h3)
   A guide can also set window.GuideFlags = { ctx: fn, go: fn, reveal: fn } before this runs:
     ctx()      a string naming what is on screen now, for apps that do not use the URL hash
     go(ctx)    bring that back on screen
     reveal(el) make a hidden heading visible (for example, switch to its slide) */
(function () {
  "use strict";
  var me = document.currentScript;
  var cfg = window.GuideFlags || {};
  var SCOPE = (me && me.getAttribute("data-scope")) || "main, #main, #content, #stage";
  var UNITS = (me && me.getAttribute("data-units")) || "h1, h2, h3";
  var KEY = "guideflags:" + location.pathname.replace(/index\.html$/, "");
  var MARKS = [
    { e: "🚩", l: "Review" }, { e: "😕", l: "Confused" }, { e: "🤯", l: "Too hard" },
    { e: "❓", l: "Ask in office hours" }, { e: "🐢", l: "Slow" }, { e: "🔁", l: "Redo" }, { e: "⭐", l: "Important" }
  ];
  var FLAG = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false"><path d="M6.5 21V3.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 4.2h11.2l-2.9 4.1 2.9 4.1H6.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function label(e) { var m = MARKS.filter(function (x) { return x.e === e; })[0]; return m ? m.l : "Flagged"; }
  function slug(s) { return String(s).toLowerCase().replace(/\s+/g, " ").trim().slice(0, 80); }
  function ctx() { try { return cfg.ctx ? String(cfg.ctx() || "") : ""; } catch (e) { return ""; } }
  function headText(h) { var c = h.cloneNode(true); [].forEach.call(c.querySelectorAll(".gf, button, .sr, .sr-only"), function (x) { x.remove(); }); var w = document.createTreeWalker(c, 4), parts = []; while (w.nextNode()) parts.push(w.currentNode.nodeValue); return parts.join(" ").replace(/\s+/g, " ").replace(/ ([,.;:!?)])/g, "$1").trim(); }
  function where() { return cfg.ctx ? "c:" + ctx() : "h:" + location.hash; }
  function keyOf(h) { return where() + "|" + (h.id ? "#" + h.id : slug(headText(h))); }
  function scopes() {
    var list = [].slice.call(document.querySelectorAll(SCOPE));
    return list.length ? list : [document.body];
  }
  function pageName() {
    var t = null;
    scopes().some(function (s) { var h = s.querySelector("h1"); if (h && h.offsetParent !== null) { t = headText(h); return true; } });
    return t || document.title.split(/ [·|–-] /)[0];
  }

  /* ---------- styles ---------- */
  var css = document.createElement("style");
  css.textContent =
    ".gf{display:inline-block; position:relative; vertical-align:middle; margin-left:8px; font-family:var(--body,system-ui,sans-serif); font-size:14px; font-weight:500; letter-spacing:0; text-transform:none; line-height:1.2}" +
    ".gf-btn{display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border:1.5px dashed var(--line,#ccc); border-radius:999px; background:transparent; color:var(--muted,#666); font:inherit; cursor:pointer; opacity:.55; transition:opacity .15s}" +
    ":hover > .gf .gf-btn, .gf-btn:focus-visible, .gf.open .gf-btn{opacity:1}" +
    "@media (hover:none){.gf-btn{opacity:.8}}" +
    ".gf-btn:hover{border-color:#C0392B; color:var(--ink,#111)}" +
    ".gf.on .gf-btn{opacity:1; border-style:solid; border-color:#C0392B; background:rgba(192,57,43,.1); color:var(--ink,#111)}" +
    ".gf-btn .gf-e{font-size:16px; line-height:1}" +
    ".gf-btn .gf-t{max-width:28ch; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}" +
    ".gf-panel{position:absolute; z-index:10000; top:calc(100% + 6px); left:0; width:min(420px, calc(100vw - 32px)); padding:12px; border:1.5px solid var(--line,#ccc); border-radius:14px; background:var(--surface,#fff); color:var(--ink,#111); box-shadow:0 10px 30px rgba(0,0,0,.18); display:flex; flex-direction:column; gap:10px; text-align:left}" +
    ".gf-q{font-size:14px; color:var(--muted,#666)}" +
    ".gf-emos{display:flex; flex-wrap:wrap; gap:6px}" +
    ".gf-emo{display:inline-flex; align-items:center; gap:5px; padding:5px 9px; border:1.5px solid var(--line,#ccc); border-radius:999px; background:transparent; color:var(--ink,#111); font:500 13px/1 var(--body,system-ui,sans-serif); cursor:pointer}" +
    ".gf-emo span{font-size:17px; line-height:1}" +
    ".gf-emo:hover{border-color:var(--saffron,#E9A400)}" +
    ".gf-emo[aria-pressed=true]{border-color:#C0392B; background:rgba(192,57,43,.1); font-weight:600}" +
    ".gf-note{font:400 15px/1.4 var(--body,system-ui,sans-serif); padding:8px 11px; border:1.5px solid var(--line,#ccc); border-radius:10px; background:var(--bg,#fff); color:var(--ink,#111); width:100%; box-sizing:border-box}" +
    ".gf-note:focus{outline:2px solid var(--saffron,#E9A400); outline-offset:1px}" +
    ".gf-row{display:flex; gap:8px; flex-wrap:wrap}" +
    ".gf-b{padding:8px 14px; border:2px solid var(--ink,#111); border-radius:999px; background:transparent; color:var(--ink,#111); font:600 14px/1 var(--body,system-ui,sans-serif); cursor:pointer}" +
    ".gf-b.quiet{border-color:var(--line,#ccc)}" +
    "#gf-fab{position:fixed; right:16px; bottom:calc(76px + env(safe-area-inset-bottom,0px)); z-index:9998; display:inline-flex; align-items:center; gap:6px; padding:9px 14px; border:1.5px solid var(--line,#ccc); border-radius:999px; background:var(--surface,#fff); color:var(--ink,#111); font:600 14px/1 var(--body,system-ui,sans-serif); cursor:pointer; box-shadow:0 6px 20px rgba(0,0,0,.15)}" +
    "#gf-fab[hidden]{display:none}" +
    "#gf-list{position:fixed; right:16px; bottom:calc(124px + env(safe-area-inset-bottom,0px)); z-index:9999; width:min(400px, calc(100vw - 32px)); max-height:min(60vh, 520px); overflow:auto; padding:14px; border:1.5px solid var(--line,#ccc); border-radius:16px; background:var(--surface,#fff); color:var(--ink,#111); box-shadow:0 12px 36px rgba(0,0,0,.22); font:400 14.5px/1.4 var(--body,system-ui,sans-serif)}" +
    "#gf-list h2{font:700 16px/1.2 var(--display,inherit); margin:0 0 10px}" +
    "#gf-list ul{list-style:none; margin:0; padding:0}" +
    "#gf-list li{display:flex; gap:10px; padding:9px 0; border-top:1px solid var(--line,#ccc)}" +
    "#gf-list li > span{font-size:18px; line-height:1.2}" +
    "#gf-list a{color:var(--ink,#111); font-weight:600; cursor:pointer}" +
    "#gf-list small{display:block; color:var(--muted,#666); font-size:13px}" +
    "#gf-list i{color:var(--ink,#111)}" +
    ".gf-hit{outline:3px solid var(--saffron,#E9A400); outline-offset:4px; border-radius:6px; transition:outline-color 1.5s}";
  document.head.appendChild(css);

  /* ---------- the flag on each heading ---------- */
  var openKey = null;
  function widget(h) {
    var k = keyOf(h), m = store[k], open = openKey === k;
    var w = h.querySelector(":scope > .gf");
    if (!w) { w = document.createElement("span"); w.className = "gf"; h.appendChild(w); }
    w.setAttribute("data-k", k);
    w.className = "gf" + (m ? " on" : "") + (open ? " open" : "");
    var html = '<button type="button" class="gf-btn" data-gf="open" aria-expanded="' + open + '" title="' + (m ? esc(label(m.e) + (m.n ? ": " + m.n : "")) : "Flag this part") + '">' +
      (m ? '<span class="gf-e" aria-hidden="true">' + m.e + '</span><span class="gf-t">' + esc(label(m.e)) + "</span>" : FLAG + '<span class="gf-t">Flag</span>') + "</button>";
    if (open) {
      html += '<span class="gf-panel" role="dialog" aria-label="Flag this part"><span class="gf-q">What was the problem here?</span><span class="gf-emos" role="group" aria-label="Pick an emoji">' +
        MARKS.map(function (x) { return '<button type="button" class="gf-emo" data-gf="set" data-e="' + x.e + '" aria-pressed="' + !!(m && m.e === x.e) + '" title="' + x.l + '"><span aria-hidden="true">' + x.e + "</span>" + x.l + "</button>"; }).join("") +
        '</span><input class="gf-note" data-gf="note" type="text" maxlength="200" placeholder="Note to yourself (optional)" aria-label="Note" value="' + esc(m && m.n || "") + '">' +
        '<span class="gf-row"><button type="button" class="gf-b" data-gf="close">Done</button>' + (m ? '<button type="button" class="gf-b quiet" data-gf="clear">Remove flag</button>' : "") + "</span></span>";
    }
    if (w.innerHTML !== html) w.innerHTML = html;
    return w;
  }
  function headings() {
    var out = [];
    scopes().forEach(function (s) {
      [].forEach.call(s.querySelectorAll(UNITS), function (h) {
        if (h.closest("nav, aside, header, footer, .gf, #gf-list, dialog")) return;
        if (!headText(h)) return;
        out.push(h);
      });
    });
    return out;
  }
  var busy = false;
  function scan() {
    if (busy) return; busy = true;
    try { headings().forEach(widget); fab(); } finally { busy = false; }
  }
  function headingFor(w) { return w.parentNode; }

  /* ---------- the corner button and the list ---------- */
  var fabEl = null, listEl = null;
  function count() { return Object.keys(store).length; }
  function fab() {
    if (!fabEl) {
      fabEl = document.createElement("button"); fabEl.type = "button"; fabEl.id = "gf-fab"; fabEl.setAttribute("data-gf", "list");
      document.body.appendChild(fabEl);
    }
    var n = count();
    fabEl.hidden = !n;
    var t = '<span aria-hidden="true">🚩</span> My flags (' + n + ")";
    if (fabEl.innerHTML !== t) fabEl.innerHTML = t;
    if (!n && listEl) closeList();
  }
  function closeList() { if (listEl) { listEl.remove(); listEl = null; } }
  function openList() {
    closeList();
    var keys = Object.keys(store).sort(function (a, b) { return (store[a].at || 0) - (store[b].at || 0); });
    listEl = document.createElement("div"); listEl.id = "gf-list"; listEl.setAttribute("role", "dialog"); listEl.setAttribute("aria-label", "My flags");
    listEl.innerHTML = "<h2>My flags</h2><ul>" + keys.map(function (k) {
      var m = store[k];
      return '<li><span aria-hidden="true">' + m.e + '</span><span><a data-gf="jump" data-k="' + esc(k) + '" tabindex="0" role="link">' + esc(m.title || "Section") + "</a>" +
        "<small>" + esc(label(m.e)) + (m.page && m.page !== m.title ? " · " + esc(m.page) : "") + "</small>" + (m.n ? "<small><i>" + esc(m.n) + "</i></small>" : "") + "</span></li>";
    }).join("") + "</ul>";
    document.body.appendChild(listEl);
  }
  function findHeading(k) {
    var hs = headings();
    for (var i = 0; i < hs.length; i++) if (keyOf(hs[i]) === k) return hs[i];
    return null;
  }
  function jump(k) {
    var m = store[k]; if (!m) return;
    closeList();
    var w = k.split("|")[0];
    if (w.indexOf("c:") === 0) { if (cfg.go && w.slice(2) !== ctx()) { try { cfg.go(w.slice(2)); } catch (e) {} } }
    else if (w.slice(2) !== location.hash) location.hash = w.slice(2) || "#";
    var tries = 0;
    (function find() {
      scan();
      var h = findHeading(k);
      if (h && cfg.reveal) { try { cfg.reveal(h); } catch (e) {} }
      if (h && h.offsetParent !== null) {
        h.scrollIntoView({ block: "center" }); h.classList.add("gf-hit");
        setTimeout(function () { h.classList.remove("gf-hit"); }, 1800);
        var b = h.querySelector(".gf-btn"); if (b) b.focus({ preventScroll: true });
      } else if (++tries < 20) setTimeout(find, 100);
    })();
  }

  /* ---------- events ---------- */
  function setMark(k, h, m) {
    if (m) { m.title = headText(h); m.page = pageName(); m.at = m.at || Date.now(); store[k] = m; } else delete store[k];
    save();
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-gf]");
    if (!el) {
      if (e.target.closest && e.target.closest(".gf, #gf-list")) { e.stopPropagation(); return; }
      if (listEl && !e.target.closest("#gf-list")) closeList();
      if (openKey && !(e.target.closest && e.target.closest(".gf"))) { openKey = null; scan(); }
      return;
    }
    e.preventDefault(); e.stopPropagation();
    var act = el.getAttribute("data-gf");
    if (act === "list") { listEl ? closeList() : openList(); return; }
    if (act === "jump") { jump(el.getAttribute("data-k")); return; }
    var w = el.closest(".gf"), h = headingFor(w), k = w.getAttribute("data-k"), m = store[k];
    if (act === "open") openKey = openKey === k ? null : k;
    else if (act === "set") setMark(k, h, { e: el.getAttribute("data-e"), n: m && m.n || "", at: m && m.at });
    else if (act === "clear") { setMark(k, h, null); openKey = null; }
    else if (act === "close") openKey = null;
    else return;
    scan();
    var focus = openKey ? h.querySelector('.gf-emo[data-e="' + (store[k] || {}).e + '"]') || h.querySelector(".gf-emo") : h.querySelector(".gf-btn");
    if (focus) focus.focus({ preventScroll: true });
  }, true);
  document.addEventListener("input", function (e) {
    if (!e.target.matches || !e.target.matches(".gf-note")) return;
    e.stopPropagation();
    var w = e.target.closest(".gf"), h = headingFor(w), k = w.getAttribute("data-k"), m = store[k], v = e.target.value;
    if (!m && !v.trim()) return;
    if (!m) {
      setMark(k, h, { e: MARKS[0].e, n: v });
      w.classList.add("on");
      var b = w.querySelector('.gf-emo[data-e="' + MARKS[0].e + '"]'); if (b) b.setAttribute("aria-pressed", "true");
    } else { m.n = v; save(); }
  }, true);
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t && t.closest && t.closest(".gf-panel, #gf-list")) {
      e.stopPropagation();
      if (t.matches(".gf-note") && e.key === "Enter") { e.preventDefault(); var h = t.closest(".gf").parentNode; openKey = null; scan(); var b = h.querySelector(".gf-btn"); if (b) b.focus(); }
      else if (e.key === "Escape") { openKey = null; closeList(); scan(); }
      else if (t.matches("[data-gf=jump]") && e.key === "Enter") { e.preventDefault(); jump(t.getAttribute("data-k")); }
    } else if (e.key === "Escape" && listEl) closeList();
  }, true);
  /* Other keyboard shortcuts on the page (space, arrows) should not fire while typing a note. */
  document.addEventListener("keyup", function (e) { if (e.target && e.target.closest && e.target.closest(".gf-panel")) e.stopPropagation(); }, true);
  document.addEventListener("keypress", function (e) { if (e.target && e.target.closest && e.target.closest(".gf-panel")) e.stopPropagation(); }, true);

  /* Re-scan when the app redraws the page or the route changes. */
  var pending = null;
  function soon() { if (busy || pending) return; pending = setTimeout(function () { pending = null; scan(); }, 60); }
  window.addEventListener("hashchange", function () { openKey = null; soon(); });
  function start() {
    scan();
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var t = list[i].target;
        if (t.nodeType === 3) t = t.parentNode;
        if (!(t.closest && t.closest(".gf, #gf-fab, #gf-list"))) { soon(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
