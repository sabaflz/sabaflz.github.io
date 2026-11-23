/*
  study.js: the Study tab of the planner. A month/week calendar of study blocks for finals,
  with check-offs, light days, course filters and a day panel.

  StudyApp.start(data, { editable, onChange }) is called by ../sync.js after login or,
  for visitors, only when the study plan is set to "Everyone". Visitors get it read-only.

  data = { v: 1, active: "<term id>", terms: { "<term id>": TERM }, done: { "<term id>": [block ids] },
           light: { "<term id>": ["YYYY-MM-DD"] } }
  A TERM holds everything for one finals season (days, runway, notes, tips). It lives inside the
  encrypted study.json, never in a public file. New semester: restore or import a new TERM,
  ask Claude to build one from the new calendar.
*/
window.StudyApp = { start: function (D, OPTS) {
  "use strict";
  var editable = !!(OPTS && OPTS.editable), onChange = OPTS && OPTS.onChange;
  D.terms = D.terms || {}; D.done = D.done || {}; D.light = D.light || {};
  var ids = Object.keys(D.terms).sort(function (a, b) { return D.terms[a].start < D.terms[b].start ? -1 : 1; });
  if (!ids.length) { $("viewArea").innerHTML = '<p class="sd-empty">No study plan yet. Log in as admin and use Restore to load a plan file.</p>'; return; }
  if (!D.terms[D.active]) D.active = ids[ids.length - 1];

  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var T, S, START, END, done, light, filt, sel, view, weekStart;
  var todayK = key(new Date());

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function key(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function parse(k) { var a = k.split("-").map(Number); return new Date(a[0], a[1] - 1, a[2]); }
  function addD(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function toMin(t) { var a = t.split(":").map(Number); return a[0] * 60 + a[1]; }
  function fmt(t) { var a = t.split(":").map(Number), h = a[0], m = a[1], ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return h + (m ? ":" + String(m).padStart(2, "0") : "") + " " + ap; }
  function inR(k, a, b) { return k >= a && k <= b; }
  function pref(n, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem("sf_study_" + n)); localStorage.setItem("sf_study_" + n, JSON.stringify(v)); } catch (e) { return null; } }
  function col(c) { return (T.courses[c] && T.courses[c].color) || "slate"; }
  function cname(c) { return (T.courses[c] && T.courses[c].name) || c; }
  function isStudy(b) { return !b.fixed && T.study.indexOf(b.c) >= 0; }
  function counts(b) { return !b.fixed && b.c !== "rest"; }
  function visible(k) { return (S[k] || []).filter(function (b) { return filt.has(b.c) && !(light.has(k) && !b.fixed && b.pri > 1); }); }
  function save() { D.done[T.id] = Array.from(done); D.light[T.id] = Array.from(light); if (onChange) onChange(D); }

  function load(id) {
    D.active = id; T = D.terms[id]; S = T.days; START = parse(T.start); END = parse(T.end);
    done = new Set(D.done[id] || []); light = new Set(D.light[id] || []);
    var f = pref("filters_" + id); filt = new Set(Array.isArray(f) ? f : Object.keys(T.courses));
    sel = inR(todayK, T.start, T.end) ? todayK : T.start;
    view = pref("view") === "week" ? "week" : "month";
    weekStart = addD(parse(sel), -parse(sel).getDay());
  }

  /* ---------- term tabs ---------- */
  function renderTerms() {
    var el = $("termTabs");
    if (ids.length < 2) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = ids.map(function (id) {
      return '<button type="button" role="tab" data-term="' + esc(id) + '" aria-selected="' + (id === T.id) + '">' + esc(D.terms[id].name) + "</button>";
    }).join("");
  }

  /* ---------- header ---------- */
  function daysTo(k) { return Math.ceil((parse(k) - parse(todayK)) / 864e5); }
  function renderCounts() {
    var all = Object.keys(S).reduce(function (a, k) { return a.concat(S[k]); }, []).filter(counts);
    var hrs = all.reduce(function (a, b) { return a + toMin(b.e) - toMin(b.s); }, 0) / 60;
    $("counts").innerHTML = (T.countdowns || []).map(function (c) {
      var n = daysTo(c[0]);
      var dd = parse(c[0]), when = DOW[dd.getDay()] + " " + MON[dd.getMonth()] + " " + dd.getDate();
      return '<div class="sd-count' + (n >= 0 && n <= 7 ? " hot" : "") + '"><b>' + (n < 0 ? "Done" : n === 0 ? "Today" : n + (n === 1 ? " day" : " days")) + "</b><span>" + (n <= 0 ? esc(c[1]) : "until " + esc(c[1])) + " · " + when + "</span></div>";
    }).join("") + '<div class="sd-count"><b>' + Math.round(hrs) + ' hrs</b><span>of study planned</span></div>';
    $("studyLede").textContent = T.lede || "";
    $("studyTerm").textContent = T.name + " · " + MON[START.getMonth()] + " " + START.getDate() + " → " + MON[END.getMonth()] + " " + END.getDate();
  }

  function renderRunway() {
    var span = (END - START) / 864e5 + 1;
    function pos(k) { return ((parse(k) - START) / 864e5) / span * 100; }
    var now = inR(todayK, T.start, T.end) ? '<div class="sd-now" style="left:' + (pos(todayK) + 50 / span) + '%"></div>' : "";
    $("runway").innerHTML = (T.runway || []).map(function (lane) {
      return '<div class="sd-lane"><div class="sd-lab">' + esc(lane.label) + '</div><div class="sd-track">' +
        lane.segs.map(function (g) {
          var w = pos(key(addD(parse(g[1]), 1))) - pos(g[0]);
          return '<div class="sd-seg c-' + g[3] + '" style="left:' + pos(g[0]) + "%;width:" + w + '%" title="' + esc(g[2]) + '">' + esc(g[2]) + "</div>";
        }).join("") + now + "</div></div>";
    }).join("") +
      '<div class="sd-ticks">' + (T.ticks || []).map(function (k) { var d = parse(k); return '<span style="left:' + (pos(k) + 50 / span) + '%">' + MON[d.getMonth()] + " " + d.getDate() + "</span>"; }).join("") + "</div>";
  }

  /* ---------- controls ---------- */
  function renderControls() {
    $("vMonth").setAttribute("aria-pressed", view === "month");
    $("vWeek").setAttribute("aria-pressed", view === "week");
    $("sdChips").innerHTML = T.filters.map(function (c) {
      return '<button type="button" class="sd-chip" data-c="' + c + '" aria-pressed="' + filt.has(c) + '"><i class="c-' + col(c) + '"></i>' + esc(cname(c)) + "</button>";
    }).join("");
  }

  /* ---------- month ---------- */
  function dayTag(k) {
    var t = (T.tags || []).filter(function (g) { return inR(k, g[0], g[1]); })[0];
    if (t) return '<span class="sd-tag c-' + t[3] + '">' + esc(t[2]) + "</span>";
    if (light.has(k)) return '<span class="sd-tag c-green">Light</span>';
    return "";
  }
  function dayDone(k) { var st = (S[k] || []).filter(isStudy); return st.length ? st.filter(function (b) { return done.has(b.id); }).length / st.length : 0; }
  function renderMonth() {
    var first = addD(START, -START.getDay()), last = addD(END, 6 - END.getDay());
    var h = '<div class="sd-month"><div class="sd-mhead">' + DOW.map(function (d) { return "<div>" + d + "</div>"; }).join("") + '</div><div class="sd-mgrid">';
    for (var d = new Date(first); d <= last; d = addD(d, 1)) {
      var k = key(d);
      if (!S[k]) { h += '<div class="sd-cell out"><div class="sd-r1"><span class="sd-dn">' + d.getDate() + "</span></div></div>"; continue; }
      var v = visible(k);
      h += '<button type="button" class="sd-cell' + (k === sel ? " sel" : "") + (k === todayK ? " today" : "") + '" data-k="' + k + '" aria-label="' + DOW[d.getDay()] + " " + MON[d.getMonth()] + " " + d.getDate() + '">' +
        '<div class="sd-r1"><span class="sd-dn">' + d.getDate() + "</span>" + (d.getDate() === 1 || k === T.start ? '<span class="sd-mon">' + MON[d.getMonth()] + "</span>" : dayTag(k)) + "</div>" +
        v.slice(0, 4).map(function (b) { return '<div class="sd-pill c-' + col(b.c) + (done.has(b.id) ? " done" : "") + '">' + (b.fixed ? "" : esc(cname(b.c)) + " · ") + esc(b.t) + "</div>"; }).join("") +
        (v.length > 4 ? '<div class="sd-more">+' + (v.length - 4) + " more</div>" : "") +
        '<div class="sd-dots">' + v.map(function (b) { return '<i class="c-' + col(b.c) + '"></i>'; }).join("") + "</div>" +
        '<div class="sd-mbar"><i style="width:' + dayDone(k) * 100 + '%"></i></div></button>';
    }
    return h + "</div></div>";
  }

  /* ---------- week ---------- */
  function renderWeek() {
    var H0 = 8, H1 = 23, PX = 44, days = [];
    for (var i = 0; i < 7; i++) days.push(addD(weekStart, i));
    var label = MON[days[0].getMonth()] + " " + days[0].getDate() + " to " + MON[days[6].getMonth()] + " " + days[6].getDate();
    var h = '<div class="sd-week"><div class="sd-wnav"><button type="button" class="t-sm" id="wPrev"' + (key(days[0]) <= T.start ? " disabled" : "") + '>Previous</button><b>' + label +
      '</b><button type="button" class="t-sm" id="wNext"' + (key(days[6]) >= T.end ? " disabled" : "") + '>Next</button></div><div class="sd-wscroll"><div class="sd-wgrid">';
    h += '<div><div class="sd-wh">&nbsp;<b>&nbsp;</b></div><div class="sd-wcol hrs" style="height:' + (H1 - H0) * PX + 'px">';
    for (i = 0; i < H1 - H0; i++) h += '<span class="sd-hl" style="top:' + i * PX + 'px">' + ((H0 + i) % 12 || 12) + (H0 + i < 12 ? "a" : "p") + "</span>";
    h += "</div></div>";
    days.forEach(function (d) {
      var k = key(d);
      h += '<div><button type="button" class="sd-wh' + (k === todayK ? " today" : "") + '" data-k="' + k + '">' + DOW[d.getDay()] + "<b>" + d.getDate() + '</b></button><div class="sd-wcol" style="height:' + (H1 - H0) * PX + 'px">';
      for (var j = 0; j < H1 - H0; j++) h += '<div class="sd-hour" style="top:' + j * PX + 'px"></div>';
      if (S[k]) visible(k).forEach(function (b) {
        var top = (toMin(b.s) / 60 - H0) * PX, ht = Math.max(18, (toMin(b.e) - toMin(b.s)) / 60 * PX - 2);
        if (top < 0) return;
        h += '<button type="button" class="sd-blk c-' + col(b.c) + (done.has(b.id) ? " done" : "") + '" data-k="' + k + '" style="top:' + top + "px;height:" + ht + 'px"><b>' + fmt(b.s) + "</b><span>" + (b.fixed ? "" : esc(cname(b.c)) + ": ") + esc(b.t) + "</span></button>";
      });
      h += "</div></div>";
    });
    return h + "</div></div></div>";
  }

  /* ---------- day panel ---------- */
  function renderDay() {
    var d = parse(sel), k = sel, list = S[k] || [], lt = light.has(k);
    var mins = list.filter(counts).filter(function (b) { return !(lt && b.pri > 1); }).reduce(function (a, b) { return a + toMin(b.e) - toMin(b.s); }, 0);
    var h = '<div class="sd-dayhead"><div><p class="eyebrow">' + DOW[d.getDay()] + " · " + Math.round(mins / 6) / 10 + "h of study</p><h2>" + MON[d.getMonth()] + " " + d.getDate() + "</h2></div>" + dayTag(k) + "</div>";
    if (T.notes && T.notes[k]) h += '<p class="sd-note">' + esc(T.notes[k]) + "</p>";
    h += '<div class="sd-items">';
    list.filter(function (b) { return filt.has(b.c); }).forEach(function (b) {
      var skip = lt && !b.fixed && b.pri > 1, cid = "cb-" + b.id.replace(/[^\w-]/g, "_");
      if (skip) return;
      h += '<div class="sd-item' + (b.fixed ? " fixed" : "") + (done.has(b.id) ? " done" : "") + (skip ? " skip" : "") + '">' +
        (b.c === "rest" ? "<span></span>" : '<input type="checkbox" id="' + cid + '" data-id="' + esc(b.id) + '"' + (done.has(b.id) ? " checked" : "") + (editable ? "" : " disabled") + ' aria-label="Mark ' + esc(b.fixed ? b.t : cname(b.c) + " block") + ' done">') +
        '<label for="' + cid + '"><span class="sd-t">' + fmt(b.s) + " to " + fmt(b.e) + (b.pri === 3 ? " · optional" : "") + (skip ? " · skipped on light day" : "") + "</span>" +
        '<span class="sd-c tc-' + col(b.c) + '">' + esc(cname(b.c)) + '</span><span class="sd-d">' + esc(b.t) + "</span>" + (b.n ? '<span class="sd-n">' + esc(b.n) + "</span>" : "") + "</label></div>";
    });
    var drop = list.filter(function (b) { return !b.fixed && b.pri > 1; });
    var dropH = Math.round(drop.reduce(function (a, b) { return a + toMin(b.e) - toMin(b.s); }, 0) / 6) / 10;
    var nb = drop.length + " block" + (drop.length === 1 ? "" : "s") + " (" + dropH + "h)";
    var msg = lt ? "Light day on: " + nb + " dropped. Deadline, quiz and exam blocks stay."
      : drop.length ? "A light day drops " + nb + " and keeps deadline, quiz and exam blocks." : "Nothing to drop today: every block is a deadline, quiz or exam block.";
    h += '</div>' + (editable ? '<p class="sd-lightnote' + (lt ? " on" : "") + '">' + msg + "</p>" : "") +
      '<div class="sd-dayctl">' + (editable ? '<button type="button" class="t-sm' + (lt ? " on" : "") + '" id="lightBtn"' + (!lt && !drop.length ? " disabled" : "") + ">" + (lt ? "Turn light day off" : "Make it a light day") + "</button>" : "") +
      '<button type="button" class="t-sm" id="copyBtn">Copy day as text</button></div><p class="sd-toast" id="sdToast" aria-live="polite"></p>';
    $("dayPanel").innerHTML = h;
  }

  /* ---------- progress, tips ---------- */
  function renderBottom() {
    var all = Object.keys(S).reduce(function (a, k) { return a.concat(S[k]); }, []).filter(isStudy);
    $("progress").innerHTML = T.study.map(function (c) {
      var b = all.filter(function (x) { return x.c === c; }), dn = b.filter(function (x) { return done.has(x.id); }).length;
      var hr = b.reduce(function (a, x) { return a + toMin(x.e) - toMin(x.s); }, 0) / 60, p = b.length ? dn / b.length : 0;
      return '<div class="sd-prog"><span>' + esc(cname(c)) + '</span><div class="sd-bar"><i class="c-' + col(c) + '" style="width:' + p * 100 + '%"></i></div><span class="sd-v">' + dn + "/" + b.length + " · " + Math.round(hr) + "h</span></div>";
    }).join("") + (function () {
      var fx = Object.keys(S).reduce(function (a, k) { return a.concat(S[k]); }, []).filter(function (b) { return b.fixed && b.c !== "ex"; });
      var fd = fx.filter(function (b) { return done.has(b.id); }).length;
      return '<div class="sd-prog"><span>Classes + events</span><div class="sd-bar"><i class="c-grey" style="width:' + (fx.length ? fd / fx.length * 100 : 0) + '%"></i></div><span class="sd-v">' + fd + "/" + fx.length + "</span></div>";
    })();
    $("tips").innerHTML = (T.tips || []).map(function (t) { return "<li><b>" + esc(t[0]) + "</b> " + esc(t[1]) + "</li>"; }).join("");
    $("checks").innerHTML = (T.checks || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    $("calNote").textContent = T.calendar ? "These blocks are also in my Google Calendar (" + T.calendar + ")." : "";
  }

  function render() {
    renderCounts(); renderControls();
    $("viewArea").innerHTML = view === "month" ? renderMonth() : renderWeek();
    renderDay(); renderBottom();
  }

  /* ---------- events ---------- */
  var root = $("studyRoot");
  root.addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t) return;
    if (t.dataset.term) { load(t.dataset.term); renderTerms(); renderRunway(); render(); return; }
    if (t.id === "vMonth" || t.id === "vWeek") { view = t.id === "vWeek" ? "week" : "month"; pref("view", view); render(); return; }
    if (t.dataset.c) { var c = t.dataset.c; filt.has(c) ? filt.delete(c) : filt.add(c); pref("filters_" + T.id, Array.from(filt)); render(); return; }
    if (t.dataset.k) {
      sel = t.dataset.k; if (view === "month") weekStart = addD(parse(sel), -parse(sel).getDay()); render();
      if (window.innerWidth < 980) $("dayPanel").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (t.id === "wPrev") { weekStart = addD(weekStart, -7); render(); return; }
    if (t.id === "wNext") { weekStart = addD(weekStart, 7); render(); return; }
    if (t.id === "lightBtn" && editable) { light.has(sel) ? light.delete(sel) : light.add(sel); save(); render(); return; }
    if (t.id === "copyBtn") {
      var d = parse(sel), lt = light.has(sel);
      var txt = DOW[d.getDay()] + " " + MON[d.getMonth()] + " " + d.getDate() + "\n" + (S[sel] || []).filter(function (b) { return !(lt && !b.fixed && b.pri > 1); })
        .map(function (b) { return fmt(b.s) + "-" + fmt(b.e) + "  " + cname(b.c) + ": " + b.t; }).join("\n");
      var toast = $("sdToast");
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast.textContent = "Copied."; }, function () { toast.textContent = "Couldn't copy here. Select the list above instead."; });
    }
  });
  root.addEventListener("change", function (e) {
    var cb = e.target; if (!cb.dataset || !cb.dataset.id || !editable) return;
    cb.checked ? done.add(cb.dataset.id) : done.delete(cb.dataset.id); save(); render();
  });

  load(D.active); renderTerms(); renderRunway(); render();
} };
