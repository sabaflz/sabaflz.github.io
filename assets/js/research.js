/*
  research.js: renders one research project page from its data.js.

  A project folder (research/<id>/) holds:
    index.html          the page shell (copy research-001's, change nothing but the <title>)
    data.js             everything shown: overview, meetings, learning log, to-dos
    private/transcripts.json   meeting transcripts, encrypted with the team passphrase

  Tabs are links (#overview, #meetings, #meetings/<id>, #learned, #todos), so the
  back button and shared links work.

  Transcripts: visitors see a lock. You and your teammate unlock with the team
  passphrase (AES-GCM, PBKDF2 600k rounds, same scheme as the planner). Adding one
  also needs your planner admin password, which unlocks the GitHub token that saves it.
*/
(function () {
  "use strict";
  // Public project: data.js sets window.RESEARCH_DATA.
  // Private project: data.js sets window.RESEARCH_LOCKED = { id, label } and the
  // content lives in data.enc.json, encrypted with the team passphrase.
  var BOOT = window.RESEARCH_DATA || window.RESEARCH_LOCKED;
  if (!BOOT) return;
  var LOCKED = !window.RESEARCH_DATA;
  var D = window.RESEARCH_DATA || null;
  var ID = BOOT.id;

  var CFG = { owner: "sabaflz", repo: "sabaflz.github.io", branch: "main" };
  var API = "https://api.github.com";
  var PRIV_URL = "private/transcripts.json";
  var PRIV_PATH = "research/" + ID + "/private/transcripts.json";
  var DATA_ENC_URL = "data.enc.json";
  var ADMIN_URL = "../../planner/data/admin.json";
  var SS_TEAM = "sf_research_team_" + ID;
  var ITER = 600000;

  var $ = function (id) { return document.getElementById(id); };
  var app = $("app");

  // ---------- text helpers ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  // tiny inline markup: **bold**, *italic*, `code`, [text](https://link)
  function md(s) {
    return esc(s)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function paras(t) {
    if (!t) return "";
    var list = Array.isArray(t) ? t : String(t).split(/\n\s*\n/);
    return list.map(function (p) { return "<p>" + md(p) + "</p>"; }).join("");
  }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function fmtDate(iso, withDay) {
    if (!iso) return "";
    var p = iso.split("-").map(Number), d = new Date(p[0], p[1] - 1, p[2] || 1);
    return (withDay ? DAYS[d.getDay()] + ", " : "") + MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }

  // meetings newest first, numbered oldest first
  var meetings = [], meetingsDesc = [];
  function prep() {
    meetings = (D.meetings || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    meetings.forEach(function (m, i) { m.n = i + 1; });
    meetingsDesc = meetings.slice().reverse();
  }
  function meetingById(id) { for (var i = 0; i < meetings.length; i++) if (meetings[i].id === id) return meetings[i]; return null; }

  // every to-do: standalone ones plus each meeting's action items
  function allTodos() {
    var out = (D.todos || []).map(function (t) { return Object.assign({ from: t.from || null }, t); });
    meetings.forEach(function (m) {
      (m.actions || []).forEach(function (a) { out.push(Object.assign({ from: m.id }, a)); });
    });
    return out;
  }
  function fromLabel(from) {
    var m = meetingById(from);
    if (m) return '<a href="#meetings/' + esc(m.id) + '">Meeting ' + m.n + "</a>";
    return from ? esc(from) : "";
  }

  // ---------- header + tabs ----------
  function renderShell() {
    document.title = D.title + " · Research · Saba Feilizadeh";
    var meta = (D.meta || []).map(function (x) { return "<li><b>" + esc(x.label) + ":</b> " + md(x.value) + "</li>"; }).join("");
    var open = allTodos().filter(function (t) { return !t.done; }).length;
    var learnedN = (D.learned || []).length;
    $("head").innerHTML =
      '<p class="crumbs"><a href="../">Research</a> / ' + esc(D.short || D.title) + "</p>" +
      '<p class="eyebrow">' + esc(D.eyebrow || "Research") + "</p>" +
      "<h1>" + esc(D.title) + "</h1>" +
      '<p class="lede">' + md(D.lede || "") + "</p>" +
      (meta ? '<ul class="meta">' + meta + "</ul>" : "") +
      (LOCKED ? '<p class="small muted" style="margin:14px 0 0">Private to the team · <button type="button" class="linkbtn" id="pageLock">Lock this page</button></p>' : "");
    $("tabs").innerHTML = "<ul>" +
      '<li class="tmenu"><button type="button" id="sideOpen" aria-label="Open contents">☰ Contents</button></li>' +
      tab("overview", "Overview") +
      tab("meetings", "Meetings", meetings.length) +
      tab("learned", "Learning log", learnedN) +
      tab("reading", "Reading", (D.reading || []).length) +
      tab("todos", "To-dos", open) +
      "</ul>";
    $("sideOpen").onclick = openDrawer;
    if (LOCKED) $("pageLock").onclick = function () { ss(SS_TEAM, null); location.hash = ""; location.reload(); };
  }

  // ---------- the lock screen (private projects) ----------
  function renderLockScreen(err) {
    document.title = (BOOT.label || "Research") + " · Research · Saba Feilizadeh";
    $("head").innerHTML =
      '<p class="crumbs"><a href="../">Research</a> / ' + esc(BOOT.label || ID) + "</p>" +
      '<p class="eyebrow">Private</p><h1>' + esc(BOOT.label || "Research") + "</h1>" +
      '<p class="lede">This project page is private to the team.</p>';
    $("tabs").innerHTML = "";
    $("tabs").style.display = "none";
    app.innerHTML = '<div class="vault"><h3>Team only</h3><p>Enter the team passphrase to open the project.</p>' +
      '<div class="vrow"><input id="pgPass" type="password" autocomplete="current-password" placeholder="Team passphrase" aria-label="Team passphrase">' +
      '<button type="button" class="btn" id="pgGo">Unlock</button></div>' +
      (err ? '<p class="err">' + esc(err) + "</p>" : "") + "</div>";
    var go = function () { var p = $("pgPass").value; if (p) unlockPage(p, false); };
    $("pgGo").onclick = go;
    $("pgPass").addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    $("pgPass").focus();
  }
  async function unlockPage(pass, silent) {
    var btn = $("pgGo"); if (btn) { btn.disabled = true; btn.textContent = "Unlocking…"; }
    try {
      var r = await fetch(DATA_ENC_URL + "?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) throw new Error("missing");
      D = JSON.parse(await decrypt(await r.json(), pass));
      ss(SS_TEAM, pass);
      $("tabs").style.display = "";
      start();
    } catch (e) {
      ss(SS_TEAM, null);
      renderLockScreen(silent ? "" : "That passphrase didn't work.");
    }
  }
  function tab(id, label, n) {
    return '<li><a href="#' + id + '" data-tab="' + id + '">' + esc(label) +
      (n != null ? '<span class="n">' + n + "</span>" : "") + "</a></li>";
  }
  function setActive(id) {
    document.querySelectorAll(".tabs a").forEach(function (a) {
      if (a.getAttribute("data-tab") === id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  // ---------- overview ----------
  function renderOverview() {
    var o = D.overview || {};
    var h = "";
    if (o.question) h += '<h2 class="sec" id="s-question">Research question</h2><div class="box question">' + paras(o.question) + "</div>";
    if (o.facts && o.facts.length) {
      h += '<h2 class="sec" id="s-glance">At a glance</h2><dl class="facts">' + o.facts.map(function (f) {
        return '<div class="fact"><dt>' + esc(f.label) + "</dt><dd>" + md(f.value) + (f.note ? "<span>" + md(f.note) + "</span>" : "") + "</dd></div>";
      }).join("") + "</dl>";
    }
    if (o.why) h += '<h2 class="sec" id="s-why">Why it matters</h2><div class="box">' + paras(o.why) + "</div>";
    if (o.approach && o.approach.length) {
      h += '<h2 class="sec" id="s-approach">Approach</h2><ol class="steps">' + o.approach.map(function (s) {
        return "<li><b>" + md(s.title) + "</b>" + md(s.text) + "</li>";
      }).join("") + "</ol>";
    }
    if (o.milestones && o.milestones.length) {
      var label = { done: '<span class="pill ok st">Done</span>', now: '<span class="pill st">In progress</span>' };
      h += '<h2 class="sec" id="s-timeline">Timeline</h2><ul class="timeline">' + o.milestones.map(function (m) {
        return '<li class="' + esc(m.status || "") + '"><div class="when">' + esc(m.when) + "</div>" +
          '<div class="what">' + md(m.what) + (label[m.status] || "") + "</div></li>";
      }).join("") + "</ul>";
    }
    var recent = meetingsDesc[0];
    if (recent) {
      h += '<h2 class="sec" id="s-latest">Latest meeting</h2><div class="cards">' + meetingCard(recent) + "</div>";
    }
    app.innerHTML = h;
    setActive("overview");
  }

  // ---------- meetings ----------
  function meetingCard(m) {
    var n = (m.actions || []).length;
    var chips = "";
    if (m.status === "upcoming") chips += '<span class="pill muted">Upcoming</span>';
    else if (!m.summary) chips += '<span class="pill muted">Notes coming</span>';
    if (n) chips += '<span class="pill">' + n + " action item" + (n > 1 ? "s" : "") + "</span>";
    if (privHas(m.id)) chips += '<span class="pill lock">Transcript · team only</span>';
    return '<a class="card" href="#meetings/' + esc(m.id) + '">' +
      '<div class="ctop"><span class="tag">Meeting ' + m.n + '</span><span class="date">' + esc(fmtDate(m.date)) + "</span></div>" +
      "<h3>" + esc(m.title) + "</h3>" +
      (m.oneLine ? "<p>" + md(m.oneLine) + "</p>" : "") +
      (chips ? '<div class="chips">' + chips + "</div>" : "") + "</a>";
  }
  function renderMeetings() {
    app.innerHTML = meetings.length
      ? '<h2 class="sec">All meetings · newest first</h2><div class="cards">' + meetingsDesc.map(meetingCard).join("") + "</div>"
      : '<p class="empty">No meetings yet.</p>';
    setActive("meetings");
  }
  function renderMeeting(id) {
    var m = meetingById(id);
    if (!m) return renderMeetings();
    var h = '<a class="back" href="#meetings">← All meetings</a>' +
      '<div class="mhead"><p class="eyebrow">Meeting ' + m.n + " · " + esc(fmtDate(m.date, true)) + "</p>" +
      "<h2>" + esc(m.title) + "</h2>" +
      '<ul class="meta">' +
        (m.where ? "<li><b>Where:</b> " + esc(m.where) + "</li>" : "") +
        (m.length ? "<li><b>Length:</b> " + esc(m.length) + "</li>" : "") +
        (m.attendees ? "<li><b>With:</b> " + esc(m.attendees.join(", ")) + "</li>" : "") +
      "</ul></div>";

    if (m.agenda && m.agenda.length) h += '<h2 class="sec" id="s-agenda">Agenda</h2><div class="box"><ul class="points">' + m.agenda.map(function (x) { return "<li>" + md(x) + "</li>"; }).join("") + "</ul></div>";
    if (m.summary) h += '<h2 class="sec" id="s-summary">Summary</h2><div class="box">' + paras(m.summary) + "</div>";
    else if (m.status !== "upcoming") h += '<h2 class="sec" id="s-summary">Summary</h2><div class="box"><p class="muted">Notes are coming once the recording is transcribed.</p></div>';

    var hasKP = m.keyPoints && m.keyPoints.length, hasDec = m.decisions && m.decisions.length;
    if (hasKP || hasDec) {
      h += '<div class="cols">';
      if (hasKP) h += '<div><h2 class="sec" id="s-keypoints">Key points</h2><div class="box"><ul class="points">' + m.keyPoints.map(function (x) { return "<li>" + md(x) + "</li>"; }).join("") + "</ul></div></div>";
      if (hasDec) h += '<div><h2 class="sec" id="s-decisions">Decisions</h2><div class="box"><ul class="points">' + m.decisions.map(function (x) { return "<li>" + md(x) + "</li>"; }).join("") + "</ul></div></div>";
      h += "</div>";
    }
    if (m.analysis) h += '<h2 class="sec" id="s-analysis">Analysis · what this means for us</h2><div class="box">' + paras(m.analysis) + "</div>";
    if (m.actions && m.actions.length) h += '<h2 class="sec" id="s-actions">Action items</h2>' + todoList(m.actions.map(function (a) { return Object.assign({}, a); }), true);
    if (m.learned && m.learned.length) {
      h += '<h2 class="sec" id="s-learned">What we learned</h2><div class="box"><ul class="points">' + m.learned.map(function (lid) {
        var L = (D.learned || []).filter(function (x) { return x.id === lid; })[0];
        return L ? '<li><a href="#learned/' + esc(L.id) + '">' + esc(L.title) + "</a></li>" : "";
      }).join("") + "</ul></div>";
    }
    if (m.status !== "upcoming") h += '<h2 class="sec" id="s-transcript">Transcript</h2><div id="tx"></div>';

    var i = meetings.indexOf(m), prev = meetings[i - 1], next = meetings[i + 1];
    h += '<div class="mnav"><span>' + (prev ? '<a href="#meetings/' + esc(prev.id) + '">← Meeting ' + prev.n + "</a>" : "") + "</span>" +
      "<span>" + (next ? '<a href="#meetings/' + esc(next.id) + '">Meeting ' + next.n + " →</a>" : "") + "</span></div>";
    app.innerHTML = h;
    setActive("meetings");
    if (m.status !== "upcoming") renderTranscript(m);
  }

  // ---------- to-dos ----------
  function todoList(items, hideFrom) {
    if (!items.length) return '<p class="empty">Nothing here.</p>';
    return '<ul class="todos">' + items.map(function (t) {
      var meta = [];
      if (t.owner) meta.push('<span class="who">' + esc(t.owner) + "</span>");
      if (t.due) meta.push("<span>Due " + esc(fmtDate(t.due)) + "</span>");
      if (!hideFrom && t.from) meta.push("<span>From " + fromLabel(t.from) + "</span>");
      if (t.note) meta.push("<span>" + md(t.note) + "</span>");
      return '<li class="todo' + (t.done ? " done" : "") + '"><span class="tick" role="img" aria-label="' + (t.done ? "Done" : "Not done") + '"></span>' +
        '<span class="task">' + md(t.task) + "</span>" +
        (meta.length ? '<span class="tmeta">' + meta.join("") + "</span>" : "") + "</li>";
    }).join("") + "</ul>";
  }
  function renderTodos() {
    var all = allTodos();
    var byDue = function (a, b) { return (a.due || "9999") < (b.due || "9999") ? -1 : 1; };
    var open = all.filter(function (t) { return !t.done; }).sort(byDue);
    var done = all.filter(function (t) { return t.done; });
    app.innerHTML = '<h2 class="sec" id="s-open">Open · ' + open.length + "</h2>" + todoList(open) +
      '<h2 class="sec" id="s-done">Done · ' + done.length + "</h2>" + todoList(done);
    setActive("todos");
  }

  // ---------- reading list: a compact, filterable list + one page per paper ----------
  var RSTATUS = { "to-read": "To read", "reading": "Reading now", "read": "Read" };
  var rq = "", rstatus = "all", rkind = "all", rsort = "added";
  function rlist() {
    var R = (D.reading || []).map(function (x, i) { return Object.assign({ _i: i }, x); });
    var q = rq.trim().toLowerCase();
    R = R.filter(function (x) {
      if (rstatus !== "all" && (x.status || "to-read") !== rstatus) return false;
      if (rkind !== "all" && x.kind !== rkind) return false;
      if (!q) return true;
      return [x.title, x.short, x.authors, x.venue, x.tldr, (x.tags || []).join(" "), (x.summary || []).join(" ")].join(" ").toLowerCase().indexOf(q) !== -1;
    });
    var by = {
      added: function (a, b) { return (a.added || "") === (b.added || "") ? a._i - b._i : (a.added < b.added ? 1 : -1); },
      year: function (a, b) { return (b.year || 0) - (a.year || 0) || a._i - b._i; },
      title: function (a, b) { return (a.short || a.title).localeCompare(b.short || b.title); },
      status: function (a, b) { var o = { "reading": 0, "to-read": 1, "read": 2 }; return (o[a.status] - o[b.status]) || a._i - b._i; }
    };
    return R.sort(by[rsort] || by.added);
  }
  function renderReading(arg) {
    if (arg && arg.indexOf("s:") === 0) { rstatus = arg.slice(2); arg = null; }
    if (arg) return renderPaper(arg);
    var R = D.reading || [];
    var count = function (st) { return R.filter(function (x) { return (x.status || "to-read") === st; }).length; };
    var kinds = [];
    R.forEach(function (x) { if (x.kind && kinds.indexOf(x.kind) === -1) kinds.push(x.kind); });
    var chips = [["all", "All", R.length]].concat(["reading", "to-read", "read"].map(function (st) { return [st, RSTATUS[st], count(st)]; }))
      .filter(function (c) { return c[0] === "all" || c[2]; });
    app.innerHTML =
      '<div class="toolbar">' +
        '<div class="search"><input id="rq" type="search" placeholder="Search titles, authors, tags, summaries" aria-label="Search the reading list" value="' + esc(rq) + '"></div>' +
        '<div class="rbar"><div class="chiprow" id="rchips">' + chips.map(function (c) {
          return '<button type="button" class="chip' + (rstatus === c[0] ? " active" : "") + '" data-s="' + c[0] + '">' + esc(c[1]) + " · " + c[2] + "</button>";
        }).join("") + "</div>" +
        '<div class="rsel"><label>Type <select id="rkind"><option value="all">All</option>' + kinds.map(function (k) {
          return '<option' + (rkind === k ? " selected" : "") + ">" + esc(k) + "</option>";
        }).join("") + '</select></label>' +
        '<label>Sort <select id="rsort">' + [["added", "Newest added"], ["status", "Status"], ["year", "Year"], ["title", "Title"]].map(function (o) {
          return '<option value="' + o[0] + '"' + (rsort === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
        }).join("") + "</select></label></div></div></div>" +
      '<ul class="plist" id="plist"></ul>';
    function draw() {
      var L = rlist();
      $("plist").innerHTML = L.length ? L.map(function (x) {
        var st = x.status || "to-read";
        var meta = [x.authors, x.venue && x.year ? x.venue + " " + x.year : (x.venue || x.year)].filter(Boolean).join(" · ");
        return '<li><a class="prow" href="#reading/' + esc(x.id) + '">' +
          '<span class="pdot ' + st + '" role="img" aria-label="' + RSTATUS[st] + '"></span>' +
          '<span class="pmain"><span class="ptitle">' + esc(x.short || x.title) + '</span>' +
          (x.short && x.short !== x.title ? '<span class="pfull">' + esc(x.title) + "</span>" : "") +
          '<span class="pmeta">' + esc(meta) + "</span></span>" +
          '<span class="pkind">' + esc(x.kind || "") + "</span>" +
          '<span class="pgo" aria-hidden="true">›</span></a></li>';
      }).join("") : '<li class="empty">Nothing matches. Try another word or filter.</li>';
    }
    draw();
    $("rq").addEventListener("input", function () { rq = this.value; draw(); });
    $("rchips").addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      rstatus = b.getAttribute("data-s");
      this.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
      draw(); renderSide();
    });
    $("rkind").onchange = function () { rkind = this.value; draw(); };
    $("rsort").onchange = function () { rsort = this.value; draw(); };
    setActive("reading");
  }
  function renderPaper(id) {
    var x = (D.reading || []).filter(function (p) { return p.id === id; })[0];
    if (!x) { location.hash = "#reading"; return; }
    var st = x.status || "to-read";
    var L = rlist(), i = -1;
    L.forEach(function (p, k) { if (p.id === id) i = k; });
    var prev = i > 0 ? L[i - 1] : null, next = i >= 0 && i < L.length - 1 ? L[i + 1] : null;
    var list = function (arr) { return '<ul class="points">' + arr.map(function (t) { return "<li>" + md(t) + "</li>"; }).join("") + "</ul>"; };
    var h = '<a class="back" href="#reading">← All papers</a>' +
      '<article class="paper"><p class="eyebrow">' + esc(x.kind || "Paper") + (x.year ? " · " + x.year : "") + "</p>" +
      '<h2 class="ptitle-lg">' + esc(x.title) + "</h2>" +
      '<p class="pby">' + esc([x.authors, x.venue].filter(Boolean).join(" · ")) + "</p>" +
      '<div class="pactions"><a class="btn" href="' + esc(x.url) + '" target="_blank" rel="noopener">Open ' + (x.kind === "Tool" ? "site" : "paper") + " ↗</a>" +
        (x.links || []).map(function (l) { return '<a class="btn ghost" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + " ↗</a>"; }).join("") +
        '<span class="pill ' + (st === "read" ? "ok" : st === "reading" ? "" : "muted") + '">' + RSTATUS[st] + "</span></div>" +
      (x.tags && x.tags.length ? '<div class="chips ptags">' + x.tags.map(function (t) { return '<span class="pill muted">' + esc(t) + "</span>"; }).join("") + "</div>" : "") +
      (x.tldr ? '<div class="box tldr"><span class="tag">In one sentence</span><p>' + md(x.tldr) + "</p></div>" : "") +
      (x.summary && x.summary.length ? '<h2 class="sec" id="s-summary">Summary</h2><div class="box">' + paras(x.summary) + "</div>" : "") +
      (x.findings && x.findings.length ? '<h2 class="sec" id="s-findings">Key findings</h2><div class="box">' + list(x.findings) + "</div>" : "") +
      (x.relevance && x.relevance.length ? '<h2 class="sec" id="s-relevance">Why it matters for us</h2><div class="box">' + list(x.relevance) + "</div>" : "") +
      (x.notes && x.notes.length ? '<h2 class="sec" id="s-notes">Our notes</h2><div class="box">' + paras(x.notes) + "</div>" : "") +
      '<p class="pfoot">' + [x.sharedBy ? "Shared by " + esc(x.sharedBy) : "", x.added ? "Added " + esc(fmtDate(x.added)) : "", x.from ? "From " + fromLabel(x.from) : ""].filter(Boolean).join(" · ") + "</p>" +
      "</article>" +
      '<div class="mnav"><span>' + (prev ? '<a href="#reading/' + esc(prev.id) + '">← ' + esc(prev.short || prev.title) + "</a>" : "") + "</span>" +
      "<span>" + (next ? '<a href="#reading/' + esc(next.id) + '">' + esc(next.short || next.title) + " →</a>" : "") + "</span></div>";
    app.innerHTML = h;
    setActive("reading");
  }

  // ---------- learning log ----------
  var lq = "", ltopic = "all";
  function renderLearned(focus) {
    // newest day first; within a day, the order they're written in data.js
    var L = (D.learned || []).map(function (x, i) { return { x: x, i: i }; })
      .sort(function (a, b) { return a.x.date === b.x.date ? a.i - b.i : (a.x.date < b.x.date ? 1 : -1); })
      .map(function (o) { return o.x; });
    var topics = [];
    L.forEach(function (x) { if (x.topic && topics.indexOf(x.topic) === -1) topics.push(x.topic); });
    app.innerHTML =
      '<div class="toolbar"><div class="search"><input id="lq" type="search" placeholder="Search what we\'ve learned" aria-label="Search the learning log" value="' + esc(lq) + '"></div>' +
      '<div class="chiprow" id="lchips">' + ['all'].concat(topics).map(function (t) {
        var n = t === "all" ? L.length : L.filter(function (x) { return x.topic === t; }).length;
        return '<button type="button" class="chip' + (t === ltopic ? " active" : "") + '" data-t="' + esc(t) + '">' + esc(t === "all" ? "All" : t) + " · " + n + "</button>";
      }).join("") + "</div></div>" +
      '<div class="cards" id="lgrid"></div>';
    function draw() {
      var q = lq.trim().toLowerCase();
      var shown = L.filter(function (x) {
        if (ltopic !== "all" && x.topic !== ltopic) return false;
        if (!q) return true;
        return (x.title + " " + x.body + " " + (x.topic || "") + " " + (x.tags || []).join(" ")).toLowerCase().indexOf(q) !== -1;
      });
      $("lgrid").innerHTML = shown.length ? shown.map(function (x) {
        return '<article class="learn" id="L-' + esc(x.id) + '"><span class="tag">' + esc(x.topic || "") + "</span>" +
          "<h3>" + esc(x.title) + "</h3>" + paras(x.body) +
          '<div class="lfoot"><span>' + esc(fmtDate(x.date)) + "</span>" +
          (x.from ? "<span>" + fromLabel(x.from) + "</span>" : "") +
          (x.source ? '<span><a href="' + esc(x.source.url) + '" target="_blank" rel="noopener">' + esc(x.source.label) + "</a></span>" : "") +
          "</div></article>";
      }).join("") : '<p class="empty">Nothing matches. Try another word.</p>';
    }
    draw();
    $("lq").addEventListener("input", function () { lq = this.value; draw(); });
    $("lchips").addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      ltopic = b.getAttribute("data-t");
      this.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
      draw();
    });
    setActive("learned");
    if (focus) {
      var el = $("L-" + focus);
      if (el) { el.scrollIntoView({ block: "center" }); el.style.borderColor = "var(--saffron)"; }
    }
  }

  // ---------- router ----------
  function route() {
    var h = (location.hash || "#overview").slice(1).split("/").map(decodeURIComponent);
    var sub = null;
    if (h[0] === "meetings" && h[1]) { renderMeeting(h[1]); sub = h[2]; }
    else if (h[0] === "meetings") renderMeetings();
    else if (h[0] === "learned") {
      if (h[1] && h[1].indexOf("t:") === 0) { ltopic = h[1].slice(2); renderLearned(); }
      else { if (!h[1]) ltopic = "all"; renderLearned(h[1]); }
    }
    else if (h[0] === "todos") { renderTodos(); sub = h[1]; }
    else if (h[0] === "reading") { renderReading(h[1]); sub = h[2]; }
    else { renderOverview(); sub = h[1]; }
    if (sub) {
      var el = document.getElementById("s-" + sub);
      if (el) setTimeout(function () { el.scrollIntoView({ block: "start" }); }, 0);
    } else if (h[0] !== "learned" || !h[1] || h[1].indexOf("t:") === 0) {
      window.scrollTo({ top: 0 });
    }
    renderSide();
    closeDrawer();
  }

  // ---------- sidebar: every section, collapsible ----------
  var SIDE_KEY = "sf_research_side";
  var sideOpen = {};          // which groups are expanded
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function sideLink(href, label, n, cur, cls) {
    return '<a class="slink' + (cls ? " " + cls : "") + '" href="' + href + '"' + (cur ? ' aria-current="location"' : "") + ">" +
      '<span class="sl">' + esc(label) + "</span>" + (n != null ? '<span class="n">' + n + "</span>" : "") + "</a>";
  }
  function renderSide() {
    var side = $("side"); if (!side || !D) return;
    var hash = location.hash || "#overview";
    var top = hash.slice(1).split("/")[0] || "overview";
    var o = D.overview || {};
    var groups = [];
    groups.push({ id: "overview", label: "Overview", kids: [
      o.question && ["#overview/question", "Research question"],
      o.facts && ["#overview/glance", "At a glance"],
      o.why && ["#overview/why", "Why it matters"],
      o.approach && ["#overview/approach", "Approach"],
      o.milestones && ["#overview/timeline", "Timeline"]
    ].filter(Boolean) });
    groups.push({ id: "meetings", label: "Meetings", n: meetings.length, meetingKids: true });
    var topics = [];
    (D.learned || []).forEach(function (x) { if (x.topic && topics.indexOf(x.topic) === -1) topics.push(x.topic); });
    groups.push({ id: "learned", label: "Learning log", n: (D.learned || []).length,
      kids: topics.map(function (t) { return ["#learned/t:" + encodeURIComponent(t), t, (D.learned || []).filter(function (x) { return x.topic === t; }).length]; }) });
    var R = D.reading || [];
    var rkids = ["reading", "to-read", "read"].map(function (st) {
      var c = R.filter(function (x) { return (x.status || "to-read") === st; }).length;
      return c ? ["#reading/s:" + st, RSTATUS[st], c] : null;
    }).filter(Boolean);
    var hp = hash.split("/");
    if (hp[0] === "#reading" && hp[1] && hp[1].indexOf("s:") !== 0) {
      var cur = R.filter(function (x) { return x.id === decodeURIComponent(hp[1]); })[0];
      if (cur) rkids.push(["#reading/" + cur.id, "▸ " + (cur.short || cur.title)]);
    }
    groups.push({ id: "reading", label: "Reading", n: R.length, kids: rkids });
    var all = allTodos(), open = all.filter(function (t) { return !t.done; }).length;
    groups.push({ id: "todos", label: "To-dos", n: open, kids: [["#todos/open", "Open", open], ["#todos/done", "Done", all.length - open]] });

    var html = '<div class="shead"><span class="stitle">' + esc(D.short || "Contents") + '</span>' +
      '<button type="button" class="sbtn" id="sideFold" aria-label="Collapse the sidebar" title="Collapse">«</button>' +
      '<button type="button" class="sbtn sclose" id="sideClose" aria-label="Close contents">×</button></div><ul class="stree">';
    groups.forEach(function (g) {
      if (sideOpen[g.id] === undefined) sideOpen[g.id] = true;   // all open until you fold one
      var isOpen = sideOpen[g.id];
      var kids = "";
      if (g.meetingKids) {
        kids = meetingsDesc.map(function (m) {
          var base = "#meetings/" + m.id, here = hash.indexOf(base) === 0;
          var inner = "";
          if (here) {
            var secs = [["agenda", "Agenda", m.agenda && m.agenda.length], ["summary", "Summary", m.status !== "upcoming"],
              ["keypoints", "Key points", m.keyPoints && m.keyPoints.length], ["decisions", "Decisions", m.decisions && m.decisions.length],
              ["analysis", "Analysis", m.analysis], ["actions", "Action items", m.actions && m.actions.length],
              ["learned", "What we learned", m.learned && m.learned.length], ["transcript", "Transcript", m.status !== "upcoming"]];
            inner = '<ul class="ssub3">' + secs.filter(function (x) { return x[2]; }).map(function (x) {
              return "<li>" + sideLink(base + "/" + x[0], x[1], null, hash === base + "/" + x[0]) + "</li>";
            }).join("") + "</ul>";
          }
          var label = "Meeting " + m.n + " · " + MONTHS[+m.date.slice(5, 7) - 1] + " " + (+m.date.slice(8, 10));
          return "<li>" + sideLink(base, label, null, hash === base, here ? "on" : "") + inner + "</li>";
        }).join("");
      } else {
        kids = (g.kids || []).map(function (k) { return "<li>" + sideLink(k[0], k[1], k[2], hash === k[0] || decodeURIComponent(hash) === decodeURIComponent(k[0])) + "</li>"; }).join("");
      }
      html += '<li class="sgroup' + (top === g.id ? " on" : "") + '"><div class="srow">' +
        sideLink("#" + g.id, g.label, g.n, hash === "#" + g.id, "top") +
        (kids ? '<button type="button" class="chev" data-g="' + g.id + '" aria-expanded="' + isOpen + '" aria-label="' + (isOpen ? "Hide" : "Show") + " " + esc(g.label) + ' sections">›</button>' : "") +
        "</div>" + (kids ? '<ul class="ssub"' + (isOpen ? "" : " hidden") + ">" + kids + "</ul>" : "") + "</li>";
    });
    html += "</ul>";
    side.innerHTML = html;
    side.querySelectorAll(".chev").forEach(function (b) {
      b.onclick = function () { var g = b.getAttribute("data-g"); sideOpen[g] = !sideOpen[g]; renderSide(); };
    });
    $("sideFold").onclick = function () { setFolded(true); };
    $("sideClose").onclick = closeDrawer;
  }
  function setFolded(f) {
    var grid = $("rgrid"); if (!grid) return;
    grid.classList.toggle("folded", f);
    store(SIDE_KEY, f ? "folded" : "open");
    var rail = $("sideRail"); if (rail) rail.setAttribute("aria-expanded", String(!f));
  }
  function openDrawer() { var g = $("rgrid"); if (g) { g.classList.add("drawer"); var c = $("sideClose"); if (c) c.focus(); } }
  function closeDrawer() { var g = $("rgrid"); if (g) g.classList.remove("drawer"); }
  function setupSide() {
    var grid = $("rgrid"); if (!grid) return;
    grid.classList.add("hasside");
    if (store(SIDE_KEY) === "folded") grid.classList.add("folded");
    $("sideRail").onclick = function () { setFolded(false); };
    $("sideScrim").onclick = closeDrawer;
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
  }

  // =====================================================================
  // Private transcripts
  // =====================================================================
  var te = new TextEncoder(), td = new TextDecoder();
  var priv = null;           // the encrypted file, once loaded
  var plain = {};            // decrypted transcripts this visit
  function b2a(b) { var s = ""; for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
  function a2b(s) { s = atob(String(s).replace(/\s/g, "")); var o = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) o[i] = s.charCodeAt(i); return o; }
  async function deriveKey(pass, salt, iter) {
    var base = await crypto.subtle.importKey("raw", te.encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: iter || ITER, hash: "SHA-256" }, base,
      { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function encrypt(text, pass) {
    var salt = crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey(pass, salt);
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, te.encode(text)));
    return { v: 1, kdf: "PBKDF2-SHA256", iter: ITER, salt: b2a(salt), iv: b2a(iv), ct: b2a(ct) };
  }
  async function decrypt(enc, pass) {
    var key = await deriveKey(pass, a2b(enc.salt), enc.iter);
    return td.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: a2b(enc.iv) }, key, a2b(enc.ct)));
  }
  window.ResearchCrypto = { encrypt: encrypt, decrypt: decrypt };   // used by the self-test only

  async function loadPriv() {
    try {
      var r = await fetch(PRIV_URL + "?t=" + Date.now(), { cache: "no-store" });
      priv = r.ok ? await r.json() : { v: 1, check: null, items: {} };
    } catch (e) { priv = { v: 1, check: null, items: {} }; }
    priv.items = priv.items || {};
  }
  function privHas(id) { return !!(priv && priv.items && priv.items[id]); }
  async function checkTeam(pass) {
    if (!priv.check) return true;
    try { return (await decrypt(priv.check, pass)) === "team-ok"; } catch (e) { return false; }
  }

  function renderTranscript(m) {
    var box = $("tx"); if (!box) return;
    if (!priv) { box.innerHTML = '<p class="muted small">Loading…</p>'; loadPriv().then(function () { renderTranscript(m); }); return; }
    if (plain[m.id] != null) {
      box.innerHTML = '<div class="thead"><span class="pill lock">Team only · unlocked on this tab</span>' +
        '<span><button type="button" class="linkbtn" id="txLock">Lock</button> · <button type="button" class="linkbtn" id="txAdd">Replace</button></span></div>' +
        '<div class="transcript">' + formatTranscript(plain[m.id]) + "</div>";
      $("txLock").onclick = function () { plain = {}; ss(SS_TEAM, null); renderTranscript(m); };
      $("txAdd").onclick = function () { openAdd(m); };
      return;
    }
    if (!privHas(m.id)) {
      box.innerHTML = '<div class="vault"><h3>No transcript yet</h3><p>Transcripts are encrypted and visible only to the team.</p>' +
        '<button type="button" class="btn ghost" id="txAdd">Add transcript</button></div>';
      $("txAdd").onclick = function () { openAdd(m); };
      return;
    }
    var saved = ss(SS_TEAM);
    if (saved) { tryUnlock(m, saved, true); return; }
    box.innerHTML = '<div class="vault"><h3>Private to the team</h3><p>The full transcript is encrypted. Enter the team passphrase to read it.</p>' +
      '<div class="vrow"><input id="txPass" type="password" autocomplete="current-password" placeholder="Team passphrase" aria-label="Team passphrase">' +
      '<button type="button" class="btn" id="txGo">Unlock</button></div><p class="err" id="txErr" hidden></p></div>';
    var go = function () { var p = $("txPass").value; if (p) tryUnlock(m, p, false); };
    $("txGo").onclick = go;
    $("txPass").addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
  }
  async function tryUnlock(m, pass, silent) {
    var btn = $("txGo"); if (btn) { btn.disabled = true; btn.textContent = "Unlocking…"; }
    try {
      plain[m.id] = await decrypt(priv.items[m.id], pass);
      ss(SS_TEAM, pass);
      renderTranscript(m);
    } catch (e) {
      ss(SS_TEAM, null);
      if (silent) { renderTranscript(m); return; }
      if (btn) { btn.disabled = false; btn.textContent = "Unlock"; }
      var er = $("txErr"); if (er) { er.hidden = false; er.textContent = "That passphrase didn't work."; }
    }
  }
  // "Name: words" lines get the name in bold; blank lines split paragraphs
  function formatTranscript(t) {
    return String(t).split(/\n+/).filter(function (l) { return l.trim(); }).map(function (l) {
      var mm = l.match(/^\s*([A-Z][\w .'-]{0,30}?)\s*:\s+(.*)$/);
      if (mm) return "<p><b>" + esc(mm[1]) + ":</b> " + esc(mm[2]) + "</p>";
      return "<p>" + esc(l) + "</p>";
    }).join("");
  }

  // ---------- adding a transcript (Saba only: needs the planner admin password) ----------
  function modal(html) {
    var el = $("modal"); el.innerHTML = '<div class="mcard" role="dialog" aria-modal="true">' + html + "</div>"; el.hidden = false;
    el.onclick = function (e) { if (e.target === el) closeModal(); };
    return el;
  }
  function closeModal() { var el = $("modal"); el.hidden = true; el.innerHTML = ""; }
  function openAdd(m, err) {
    var first = !priv.check;
    var el = modal("<h2>Add transcript · Meeting " + m.n + "</h2>" +
      "<p>It's encrypted in your browser before it's saved, so only someone with the team passphrase can read it. Saving uses the GitHub token behind your planner admin password.</p>" +
      '<label for="aPw">Planner admin password</label><input id="aPw" type="password" autocomplete="current-password">' +
      '<label for="aTeam">' + (first ? "Create a team passphrase <span>(share it with Mobin in person or by text, never in the repo)</span>" : "Team passphrase") + "</label>" +
      '<input id="aTeam" type="password" autocomplete="new-password">' +
      (first ? '<label for="aTeam2">Type it again</label><input id="aTeam2" type="password" autocomplete="new-password">' : "") +
      '<label for="aText">Transcript <span>(paste it here; "Name: what they said" lines are formatted automatically)</span></label>' +
      '<textarea id="aText">' + esc(plain[m.id] || "") + "</textarea>" +
      (err ? '<p class="err">' + esc(err) + "</p>" : "") +
      '<div class="mrow"><button type="button" class="btn ghost" id="aCancel">Cancel</button><button type="button" class="btn" id="aSave">Encrypt and save</button></div>');
    $("aCancel").onclick = closeModal;
    $("aSave").onclick = async function () {
      var pw = $("aPw").value, team = $("aTeam").value, text = $("aText").value.trim();
      if (!pw || !team || !text) return;
      if (first && team !== $("aTeam2").value) return openAdd(m, "The two passphrases don't match.");
      if (first && team.length < 10) return openAdd(m, "Use at least 10 characters for the team passphrase.");
      this.disabled = true; this.textContent = "Saving…";
      try {
        if (!(await checkTeam(team))) throw new Error("That team passphrase doesn't match the one already in use.");
        var tok = await getToken(pw);
        var cur = await readRepo(tok);
        var file = cur.json || { v: 1, items: {} };
        file.note = "Meeting transcripts for " + D.title + ", encrypted with the team passphrase.";
        file.items = file.items || {};
        if (!file.check) file.check = await encrypt("team-ok", team);
        file.items[m.id] = await encrypt(text, team);
        file.updated = new Date().toISOString();
        await writeRepo(tok, JSON.stringify(file, null, 2) + "\n", cur.sha, "Research: transcript for " + D.short + " meeting " + m.n);
        priv = file; plain[m.id] = text; ss(SS_TEAM, team);
        closeModal(); renderTranscript(m);
      } catch (e) {
        openAdd(m, e.message || "Couldn't save.");
      }
    };
  }
  async function getToken(pw) {
    var r = await fetch(ADMIN_URL + "?t=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error("Couldn't find the planner admin setup. Log in to the planner once first.");
    var admin = await r.json();
    try { return await decrypt(admin.enc, pw); } catch (e) { throw new Error("Wrong admin password."); }
  }
  function gh(method, path, body, tok) {
    return fetch(API + path, { method: method, cache: "no-store",
      headers: { "Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      body: body ? JSON.stringify(body) : undefined });
  }
  var cpath = "/repos/" + CFG.owner + "/" + CFG.repo + "/contents/" + PRIV_PATH;
  async function readRepo(tok) {
    var r = await gh("GET", cpath + "?ref=" + CFG.branch, null, tok);
    if (r.status === 404) return { json: null, sha: null };
    if (r.status === 401) throw new Error("The planner's GitHub token has expired. Log in to the planner to renew it.");
    if (!r.ok) throw new Error("Couldn't reach GitHub (" + r.status + ").");
    var j = await r.json();
    return { json: JSON.parse(td.decode(a2b(j.content))), sha: j.sha };
  }
  async function writeRepo(tok, text, sha, msg) {
    var body = { message: msg, content: b2a(te.encode(text)), branch: CFG.branch };
    if (sha) body.sha = sha;
    var r = await gh("PUT", cpath, body, tok);
    if (!r.ok) throw new Error("GitHub didn't accept the save (" + r.status + ").");
  }

  // ---------- go ----------
  // keep the tabs pinned exactly under the menu bar, whatever its height
  var bar = document.querySelector("header.topbar");
  function fitTabs() { if (bar) document.documentElement.style.setProperty("--navh", Math.round(bar.getBoundingClientRect().height) + "px"); }
  if (bar && window.ResizeObserver) new ResizeObserver(fitTabs).observe(bar);
  window.addEventListener("load", fitTabs);
  var started = false;
  function start() {
    prep();
    if (!started) setupSide();
    renderShell();
    route();
    if (started) return;
    started = true;
    window.addEventListener("hashchange", route);
    loadPriv().then(function () {
      var h = (location.hash || "").slice(1).split("/");
      if (h[0] === "meetings" || h[0] === "overview" || !h[0]) route();
    });
  }
  if (!LOCKED) start();
  else {
    var saved = ss(SS_TEAM);
    if (saved) { app.innerHTML = '<p class="muted small">Unlocking…</p>'; unlockPage(saved, true); }
    else renderLockScreen();
  }
})();
