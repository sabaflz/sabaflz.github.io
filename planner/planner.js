/*
  planner.js: renders every term in data/terms/*.js plus the degree tracker.
  Nothing term-specific lives here. Plans and check-offs save in this browser;
  use Export / Import to move them between devices.
*/
(function () {
  "use strict";

  var DEG = window.PLANNER_DEGREE;
  var CATALOG = window.PLANNER_CATALOG || {};
  var PATHS = window.PLANNER_PATHS || [];
  var KEY = "sf_planner_v1";
  var DAYS = ["Mo", "Tu", "We", "Th", "Fr"];
  var DAYNAME = { Mo: "Mon", Tu: "Tue", We: "Wed", Th: "Thu", Fr: "Fri" };
  var BUCKET = { design: "Design", cs: "UD CS", cseecs: "UD CS/EE", te: "Non-CS TE" };
  var CATS = [
    { key: "all", label: "All" }, { key: "rec", label: "Best picks" }, { key: "eligible", label: "Eligible" },
    { key: "core", label: "Core" }, { key: "ud", label: "Upper-div" }, { key: "design", label: "Design" },
    { key: "te", label: "Non-CS elective" }, { key: "minor", label: "CogSci minor" }, { key: "ahi", label: "AH&I" },
    { key: "small", label: "Small / P-NP" }
  ];

  // merge catalog facts with each term's offerings
  var TERMS = (window.PLANNER_TERMS || []).slice().sort(function (a, b) { return a.order - b.order; });
  TERMS.forEach(function (t) {
    t.courses = t.courses.map(function (o) {
      var c = {}, base = CATALOG[o.id] || {}, k;
      for (k in base) c[k] = base[k];
      for (k in o) c[k] = o[k];
      return c;
    });
  });
  var BYID = {};
  Object.keys(CATALOG).forEach(function (id) { BYID[id] = CATALOG[id]; });

  // ---------- state ----------
  var store = load();
  store.plans = store.plans || {}; store.manual = store.manual || {}; store.custom = store.custom || [];
  // pre-load the recommended path once (re-applies if the recommended path changes)
  var BEST = PATHS.filter(function (p) { return p.default; })[0];
  var BEST_VER = BEST ? BEST.id + ":" + JSON.stringify(BEST.plan) : "";
  if (BEST && store.bestApplied !== BEST_VER) {
    Object.keys(BEST.plan).forEach(function (tid) { store.plans[tid] = BEST.plan[tid].slice(); });
    store.bestApplied = BEST_VER; save();
  }
  if (BEST) TERMS.forEach(function (t) {
    (BEST.plan[t.id] || []).forEach(function (id) { var c = t.courses.filter(function (x) { return x.id === id; })[0]; if (c) c.rec = "Best pick"; });
  });

  var termId = store.term && TERMS.some(function (t) { return t.id === store.term; }) ? store.term : defaultTerm();
  var cat = "all", query = "";

  function defaultTerm() { var p = TERMS.filter(function (t) { return t.status === "Planning"; }); return (p[0] || TERMS[0] || {}).id; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  function plan(id) { return store.plans[id || termId] || (store.plans[id || termId] = []); }
  function term(id) { id = id || termId; return TERMS.filter(function (t) { return t.id === id; })[0]; }
  function course(t, id) { return t.courses.filter(function (c) { return c.id === id; })[0]; }
  function info(id) { return BYID[id] || TERMS.reduce(function (f, t) { return f || course(t, id); }, null) || { units: 0 }; }

  // ---------- helpers ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]; }); }
  function daysOf(m) {
    var s = m.days, out = [], i = 0;
    while (i < s.length) {
      if (s.substr(i, 2) === "Tu" || s.substr(i, 2) === "Th") { out.push(s.substr(i, 2)); i += 2; }
      else { out.push({ M: "Mo", W: "We", F: "Fr" }[s[i]]); i += 1; }
    }
    return out.filter(Boolean);
  }
  function mins(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(t) { var m = mins(t), h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return h + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + ap; }
  function meetText(c) {
    if (!c.meet || !c.meet.length) return c.location && /TBA/.test(c.location) ? "Time TBA" : "Time TBA";
    return c.meet.map(function (m) { return daysOf(m).map(function (d) { return DAYNAME[d]; }).join("/") + " " + fmt(m.start) + " to " + fmt(m.end); }).join(", ");
  }
  function label(id) { return id.replace("-GC", ""); }

  function doneBefore(t) {
    var set = {};
    DEG.done.forEach(function (id) { set[id] = true; });
    TERMS.forEach(function (o) { if (o.order < t.order) plan(o.id).forEach(function (id) { set[id] = true; }); });
    return set;
  }
  function missing(c, done) {
    return (c.prereq || []).filter(function (g) { return !g.some(function (id) { return done[id]; }); }).map(function (g) { return g.join(" or "); });
  }

  // ---------- term tabs ----------
  var tabsEl = document.getElementById("terms");
  function renderTabs() {
    tabsEl.innerHTML = TERMS.map(function (t) {
      var n = plan(t.id).length;
      return '<button type="button" role="tab" aria-selected="' + (t.id === termId) + '" data-term="' + esc(t.id) + '">' + esc(t.name) +
        '<span>' + esc(t.status || "") + (n ? " · " + n + " picked" : "") + '</span></button>';
    }).join("");
  }
  tabsEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-term]"); if (!b) return;
    termId = b.getAttribute("data-term"); store.term = termId; save(); renderAll();
  });

  // ---------- filters ----------
  var chipsEl = document.getElementById("chips");
  function renderChips() {
    chipsEl.innerHTML = CATS.map(function (c) { return '<button type="button" class="chip" aria-pressed="' + (c.key === cat) + '" data-cat="' + c.key + '">' + esc(c.label) + '</button>'; }).join("");
  }
  chipsEl.addEventListener("click", function (e) { var b = e.target.closest("[data-cat]"); if (!b) return; cat = b.getAttribute("data-cat"); renderChips(); renderList(); });
  document.getElementById("q").addEventListener("input", function (e) { query = e.target.value.trim().toLowerCase(); renderList(); });

  // ---------- course list ----------
  var listEl = document.getElementById("list");
  function renderList() {
    var t = term(); if (!t) { listEl.innerHTML = '<p class="empty">No terms yet.</p>'; return; }
    var done = doneBefore(t), mine = plan();
    var shown = t.courses.filter(function (c) {
      var miss = missing(c, done);
      if (cat === "rec" && !c.rec) return false;
      if (cat === "eligible" && (miss.length || done[c.id])) return false;
      if (["all", "rec", "eligible"].indexOf(cat) === -1 && (c.cat || []).indexOf(cat) === -1) return false;
      if (query && [c.id, c.title, c.instructor, c.note].join(" ").toLowerCase().indexOf(query) === -1) return false;
      return true;
    });
    document.getElementById("count").textContent = shown.length + " of " + t.courses.length + " courses";
    if (!shown.length) { listEl.innerHTML = '<p class="empty">Nothing matches. Try another filter.</p>'; return; }
    listEl.innerHTML = shown.map(function (c) {
      var miss = missing(c, done), inPlan = mine.indexOf(c.id) !== -1, taken = !!done[c.id];
      var status = taken ? '<span class="st st-done">Already done or planned earlier</span>'
        : miss.length ? '<span class="st st-lock">Needs ' + esc(miss.join(", ")) + '</span>' : '<span class="st st-ok">Eligible</span>';
      var flags = (c.rec ? '<span class="st st-rec">' + esc(c.rec) + '</span>' : "") +
        (c.load ? '<span class="st st-heavy" title="Workload, 1 light to 5 very heavy">Load ' + c.load + '/5</span>' : "") +
        (c.verify ? '<span class="st st-ver" title="Something here still needs checking">Verify</span>' : "") +
        "";
      var counts = (c.ud || []).map(function (k) { return BUCKET[k]; });
      if ((c.minor || []).length) counts.push((c.minor || []).indexOf("cogsci-core") !== -1 ? "CogSci minor core" : "CogSci minor topical");
      if ((c.cat || []).indexOf("ahi") !== -1) counts.push("AH&I");
      if ((c.cat || []).indexOf("lower") !== -1) counts.push("Doesn't count toward major");
      return '<article class="course' + (inPlan ? " in" : "") + (taken ? " taken" : "") + '">' +
        '<div class="c-top"><span class="cid">' + esc(label(c.id)) + '</span><span class="units">' + c.units + ' u</span></div>' +
        '<h3>' + esc(c.title) + '</h3><div class="badges">' + status + flags + '</div>' +
        '<dl><dt>When</dt><dd>' + esc(meetText(c)) + '</dd><dt>Where</dt><dd>' + esc(c.location || "TBA") + '</dd>' +
        '<dt>Who</dt><dd>' + esc(c.instructor || "TBA") + '</dd>' +
        (counts.length ? '<dt>Counts</dt><dd>' + esc(counts.join(" · ")) + '</dd>' : "") +
        (c.seats ? '<dt>Seats</dt><dd>' + esc(c.seats) + '</dd>' : "") +
        (c.prereqNote ? '<dt>Prereq</dt><dd>' + esc(c.prereqNote) + '</dd>' : "") + '</dl>' +
        '<p class="note">' + esc(c.note || "") + '</p><div class="c-foot">' +
        (c.link ? '<a href="' + esc(c.link) + '" target="_blank" rel="noopener">Class page ↗</a>' : '<span></span>') +
        (taken && !inPlan ? "" : '<button type="button" class="add" data-add="' + esc(c.id) + '">' + (inPlan ? "Remove" : "Add to plan") + '</button>') +
        '</div></article>';
    }).join("");
  }
  listEl.addEventListener("click", function (e) { var b = e.target.closest("[data-add]"); if (b) toggle(b.getAttribute("data-add")); });
  function toggle(id) { var p = plan(), i = p.indexOf(id); if (i === -1) p.push(id); else p.splice(i, 1); save(); renderAll(); }

  // ---------- plan panel ----------
  var planEl = document.getElementById("plan");
  function conflicts(t, ids) {
    var slots = [], pairs = {};
    ids.forEach(function (id) { var c = course(t, id); if (!c) return; (c.meet || []).forEach(function (m) { daysOf(m).forEach(function (d) { slots.push({ id: id, d: d, s: mins(m.start), e: mins(m.end) }); }); }); });
    for (var i = 0; i < slots.length; i++) for (var j = i + 1; j < slots.length; j++) {
      var a = slots[i], b = slots[j];
      if (a.id !== b.id && a.d === b.d && a.s < b.e && b.s < a.e) pairs[[label(a.id), label(b.id)].sort().join(" and ")] = true;
    }
    return Object.keys(pairs);
  }
  function renderPlan() {
    var t = term(); if (!t) { planEl.innerHTML = ""; return; }
    var ids = plan().filter(function (id) { return course(t, id); });
    var done = doneBefore(t);
    var units = ids.reduce(function (s, id) { return s + (course(t, id).units || 0); }, 0);
    var tech = ids.filter(function (id) { var c = course(t, id); return (c.cat || []).some(function (k) { return ["core", "ud", "design"].indexOf(k) !== -1; }) && c.units >= 3; });
    var heavy = ids.filter(function (id) { return DEG.heavy.indexOf(id) !== -1; });
    var warn = [];
    if (!t.summer) {
      if (ids.length && units < DEG.minUnits) warn.push(["bad", "Under the " + DEG.minUnits + "-unit minimum (full-time aid needs 12 too)."]);
      if (units > DEG.maxUnits) warn.push(["bad", "Over the " + DEG.maxUnits + "-unit cap."]);
      else if (units > DEG.phase1Cap && t.status === "Planning") warn.push(["mid", "Over " + DEG.phase1Cap + " units: enroll the rest in Phase 2."]);
      if (tech.length > 3) warn.push(["mid", tech.length + " CS technical courses. Three is already a full load."]);
    } else if (ids.filter(function (id) { return course(t, id).units > 0; }).length > 2) warn.push(["mid", "3+ Berkeley summer courses. Two per summer is the realistic max next to an internship."]);
    if (heavy.length > 1) warn.push(["mid", heavy.join(" + ") + " are both on the EECS heavy-workload list."]);
    conflicts(t, ids).forEach(function (p) { warn.push(["bad", "Time conflict: " + p + "."]); });
    ids.forEach(function (id) { var m = missing(course(t, id), done); if (m.length) warn.push(["bad", label(id) + " needs " + m.join(", ") + " first."]); });
    if (ids.some(function (id) { return course(t, id).verify; })) warn.push(["info", "Some picks are flagged Verify; see their cards."]);
    if (ids.length && !warn.some(function (w) { return w[0] !== "info"; })) warn.unshift(["good", "No conflicts, prereqs met, unit load in range."]);

    var load = ids.reduce(function (s2, id) { return s2 + (course(t, id).load || 0); }, 0);
    var lvl = load <= 8 ? ["light", "good"] : load <= 12 ? ["balanced", "good"] : load <= 13.5 ? ["heavy", "mid"] : ["overloaded", "bad"];
    if (ids.length && !t.summer) warn.unshift([lvl[1], "Workload " + load + " (" + lvl[0] + "). Balanced is about 10 to 12 on this scale."]);
    var cap = t.summer ? 12 : DEG.maxUnits;
    planEl.innerHTML =
      '<div class="p-head"><h2>My ' + esc(t.name) + ' plan</h2><span class="p-units"><b>' + units + '</b> units</span></div>' +
      (t.summer ? '<p class="p-sub">Summer term: no unit minimum.</p>' :
        '<div class="meter" aria-hidden="true"><i style="width:' + Math.min(100, units / cap * 100) + '%"></i><s style="left:' + (DEG.minUnits / cap * 100) + '%"></s><s style="left:' + (DEG.phase1Cap / cap * 100) + '%"></s></div>' +
        '<div class="meter-key"><span>0</span><span>min 12</span><span>Phase 1 · 13.5</span><span>17.5</span></div>') +
      (ids.length ? '<ul class="p-list">' + ids.map(function (id) {
        var c = course(t, id);
        return '<li><div><b>' + esc(label(id)) + '</b> <span>' + esc(c.title) + '</span><small>' + esc(meetText(c)) + '</small></div><span class="pu">' + c.units + '</span>' +
          '<button type="button" class="x" data-add="' + esc(id) + '" aria-label="Remove ' + esc(id) + '">×</button></li>';
      }).join("") + '</ul>' : '<p class="p-empty">Nothing yet. Add courses from the list, or load a full plan in the tracker below.</p>') +
      (warn.length ? '<ul class="warn">' + warn.map(function (w) { return '<li class="w-' + w[0] + '">' + esc(w[1]) + '</li>'; }).join("") + '</ul>' : "") +
      (ids.length ? '<button type="button" class="clear" id="clearPlan">Clear this term</button>' : "");
  }
  planEl.addEventListener("click", function (e) {
    var x = e.target.closest("[data-add]"); if (x) { toggle(x.getAttribute("data-add")); return; }
    if (e.target.id === "clearPlan") { store.plans[termId] = []; save(); renderAll(); }
  });

  // ---------- week grid ----------
  var weekEl = document.getElementById("week");
  function renderWeek() {
    var t = term(); if (!t) { weekEl.innerHTML = ""; return; }
    var ids = plan().filter(function (id) { return course(t, id); });
    var START = 8 * 60, END = 20 * 60, H = END - START, hours = "";
    for (var h = 8; h <= 20; h += 2) hours += '<span style="top:' + ((h * 60 - START) / H * 100) + '%">' + (h % 12 || 12) + (h < 12 ? "a" : "p") + '</span>';
    var clash = {}; conflicts(t, ids).forEach(function (p) { p.split(" and ").forEach(function (id) { clash[id] = true; }); });
    var cols = DAYS.map(function (d) {
      var blocks = "";
      ids.forEach(function (id, idx) {
        (course(t, id).meet || []).forEach(function (m) {
          if (daysOf(m).indexOf(d) === -1) return;
          var top = (mins(m.start) - START) / H * 100, ht = (mins(m.end) - mins(m.start)) / H * 100;
          blocks += '<div class="blk c' + (idx % 6) + (clash[label(id)] ? " clash" : "") + '" style="top:' + top + '%;height:' + ht + '%"><b>' + esc(label(id)) + '</b><span>' + fmt(m.start) + '</span></div>';
        });
      });
      return '<div class="day"><div class="dh">' + DAYNAME[d] + '</div><div class="col">' + blocks + '</div></div>';
    }).join("");
    var tba = ids.filter(function (id) { return !(course(t, id).meet || []).length; }).map(label);
    weekEl.innerHTML = '<h2>Week view</h2><div class="grid"><div class="hours">' + hours + '</div>' + cols + '</div>' +
      (tba.length ? '<p class="tba">Not shown (time TBA): ' + esc(tba.join(", ")) + '</p>' : "") +
      (!ids.length ? '<p class="tba">Your week fills in as you add courses.</p>' : "");
  }

  // ---------- tracker ----------
  var trackEl = document.getElementById("tracker");
  function where() {
    // id -> "done" or the name of the first term it's planned in
    var map = {};
    DEG.done.forEach(function (id) { map[id] = "done"; });
    TERMS.forEach(function (t) { plan(t.id).forEach(function (id) { if (!map[id]) map[id] = t.name; }); });
    return map;
  }
  function renderTracker() {
    var at = where(), man = store.manual;
    var ids = Object.keys(at);

    // checklist rows
    var rows = DEG.checklist.map(function (r) {
      var pool = r.minor ? ids.filter(function (id) { return (info(id).minor || []).indexOf(r.minor) !== -1; }) : ids.filter(function (id) { return (r.any || []).indexOf(id) !== -1; });
      var need = r.need || 1, doneN = pool.filter(function (id) { return at[id] === "done"; }).length;
      var st = man[r.id] ? "done" : doneN >= need ? "done" : pool.length >= need ? "plan" : pool.length ? "part" : "todo";
      return { r: r, pool: pool, need: need, have: man[r.id] ? need : Math.min(pool.length, need), st: st };
    });

    // upper-div buckets (greedy: design, CS, CS/EE, TE), done courses first
    var fill = {}; DEG.upperDiv.forEach(function (b) { fill[b.key] = { u: 0, ids: [] }; });
    // fill the scarcest buckets first (TE, then design, CS, CS/EE); within a bucket prefer
    // finished courses, 4-unit courses, and courses with the fewest other bucket options
    var pool = ids.filter(function (id) { var c = info(id); return c.ud && c.units >= 3; });
    var used = {};
    ["te", "design", "cs", "cseecs"].forEach(function (k) {
      var cap = DEG.upperDiv.filter(function (b) { return b.key === k; })[0].units;
      pool.filter(function (id) { return !used[id] && info(id).ud.indexOf(k) !== -1; })
        .sort(function (a, b) {
          var A = info(a), B = info(b);
          return ((at[a] === "done" ? 0 : 4) + (A.units >= 4 ? 0 : 2) + A.ud.length * 0.1) -
                 ((at[b] === "done" ? 0 : 4) + (B.units >= 4 ? 0 : 2) + B.ud.length * 0.1);
        })
        .forEach(function (id) { if (fill[k].u < cap) { fill[k].u += info(id).units; fill[k].ids.push(id); used[id] = true; } });
    });
    var udRows = DEG.upperDiv.map(function (b) {
      var f = fill[b.key], mk = man["ud-" + b.key];
      var allDone = f.ids.length && f.ids.every(function (id) { return at[id] === "done"; });
      var st = mk ? "done" : f.u >= b.units ? (allDone ? "done" : "plan") : f.u ? "part" : "todo";
      return { b: b, f: f, st: st, u: mk ? b.units : Math.min(f.u, b.units) };
    });

    // overview tiles
    var udU = udRows.reduce(function (s, r) { return s + r.u; }, 0);
    var udDone = udRows.reduce(function (s, r) { return s + (r.st === "done" ? r.b.units : 0); }, 0);
    var te = udRows.filter(function (r) { return r.b.key === "te"; })[0];
    var design = udRows.filter(function (r) { return r.b.key === "design"; })[0];
    var minorRows = rows.filter(function (x) { return x.r.minor; });
    var minorHave = minorRows.reduce(function (s, x) { return s + x.have; }, 0), minorNeed = minorRows.reduce(function (s, x) { return s + x.need; }, 0);
    var ahi = rows.filter(function (x) { return /^ahi/.test(x.r.id); });
    var todoAll = DEG.todos.concat(store.custom);
    var todoDone = todoAll.filter(function (x) { return man[x.id]; }).length;
    var lastTerm = TERMS.filter(function (t) { return plan(t.id).length; }).pop();
    function tile(n, of, lbl, sub) { return '<div class="tile"><b>' + n + '<small>/' + of + '</small></b><span>' + esc(lbl) + '</span>' + (sub ? '<em>' + esc(sub) + '</em>' : "") + '</div>'; }

    var html = '<div class="tr-head"><div><p class="eyebrow">Tracker</p><h2>What\'s left</h2></div>' +
      '<div class="tr-tools"><button type="button" class="t-sm" id="exportBtn">Export</button><label class="t-sm">Import<input type="file" id="importIn" accept="application/json" hidden></label></div></div>' +
      '<p class="tr-note">Counts include courses you\'ve finished plus everything planned in any term. Check a row by hand if it\'s satisfied some other way.</p>' +
      '<div class="tiles">' +
      tile(udU, 24, "Upper-div units", udDone + " done, " + (udU - udDone) + " planned") +
      tile(te.u >= 4 || te.st === "done" ? 1 : 0, 1, "Non-CS tech elective", te.f.ids.length ? te.f.ids.join(", ") : "4+ units needed") +
      tile(design.st === "todo" || design.st === "part" ? 0 : 1, 1, "Design course", design.f.ids.join(", ") || "not picked") +
      tile(minorHave, minorNeed, "CogSci minor courses", "1 core + 4 summer") +
      tile(ahi.filter(function (x) { return x.st !== "todo"; }).length, ahi.length, "AH&I", "") +
      tile(todoDone, todoAll.length, "Admin to-dos", "") +
      '</div>' +
      (lastTerm ? '<p class="tr-note">Last planned term: <b>' + esc(lastTerm.name) + '</b>.</p>' : "");

    // paths
    if (PATHS.length) {
      html += '<div class="paths"><h3>Load a full plan</h3><div class="path-row">' + PATHS.map(function (p) {
        var terms = TERMS.filter(function (t) { return (p.plan[t.id] || []).length; }).map(function (t) { return t.name; });
        return '<button type="button" class="path" data-path="' + esc(p.id) + '"><b>' + esc(p.name) + '</b><small>' + esc(p.why) + '</small>' +
          '<span>' + esc(terms[0] + " to " + terms[terms.length - 1]) + '</span></button>';
      }).join("") + '</div><p class="tr-note">Loading a plan replaces your picks in those terms. Export first if you want a backup.</p></div>';
    }

    // per-term summary
    html += '<div class="roadmap">' + TERMS.map(function (t) {
      var p = plan(t.id); if (!p.length) return "";
      var u = p.reduce(function (s, id) { var c = course(t, id) || info(id); return s + (c.units || 0); }, 0);
      var ld = p.reduce(function (s, id) { var c = course(t, id) || info(id); return s + (c.load || 0); }, 0);
      return '<button type="button" class="rm" data-term="' + esc(t.id) + '"><b>' + esc(t.name) + '</b><span>' + u + ' u · load ' + ld + '</span><small>' + esc(p.map(label).join(" · ")) + '</small></button>';
    }).join("") + '</div>';

    // checklist groups
    var groups = {};
    rows.forEach(function (x) { (groups[x.r.group] = groups[x.r.group] || []).push(x); });
    html += '<div class="req-groups">';
    Object.keys(groups).forEach(function (g) {
      html += '<div class="rg"><h3>' + esc(g) + '</h3><ul>' + groups[g].map(function (x) {
        var detail = x.pool.map(function (id) { return label(id) + (at[id] === "done" ? "" : " (" + at[id] + ")"); }).join(", ");
        return '<li class="r-' + x.st + '"><label><input type="checkbox" data-man="' + esc(x.r.id) + '"' + (man[x.r.id] || x.st === "done" ? " checked" : "") + (x.st === "done" && !man[x.r.id] ? " disabled" : "") + '>' +
          '<span>' + esc(x.r.name) + (x.need > 1 ? ' <span class="ru">' + x.have + '/' + x.need + '</span>' : "") + (detail ? '<em>' + esc(detail) + '</em>' : "") + '</span></label></li>';
      }).join("") + '</ul></div>';
    });
    html += '<div class="rg"><h3>Upper division (24 units)</h3><ul>' + udRows.map(function (x) {
      var detail = x.f.ids.map(function (id) { return label(id) + (at[id] === "done" ? "" : " (" + at[id] + ")"); }).join(", ");
      return '<li class="r-' + x.st + '"><label><input type="checkbox" data-man="ud-' + x.b.key + '"' + (man["ud-" + x.b.key] || x.st === "done" ? " checked" : "") + (x.st === "done" && !man["ud-" + x.b.key] ? " disabled" : "") + '>' +
        '<span>' + esc(x.b.name) + ' <span class="ru">' + x.u + '/' + x.b.units + ' u</span>' + (detail ? '<em>' + esc(detail) + '</em>' : "") + '</span></label></li>';
    }).join("") + '</ul></div>';

    // to-dos
    html += '<div class="rg rg-todo"><h3>To-dos</h3><ul>' + todoAll.map(function (x) {
      var custom = store.custom.some(function (c) { return c.id === x.id; });
      return '<li class="' + (man[x.id] ? "r-done" : "r-todo") + '"><label><input type="checkbox" data-man="' + esc(x.id) + '"' + (man[x.id] ? " checked" : "") + '><span>' + esc(x.text) + '</span></label>' +
        (custom ? '<button type="button" class="x" data-deltodo="' + esc(x.id) + '" aria-label="Delete to-do">×</button>' : "") + '</li>';
    }).join("") + '</ul><form id="todoForm" class="todo-add"><input id="todoIn" placeholder="Add a to-do" aria-label="New to-do"><button type="submit" class="t-sm">Add</button></form></div>';
    html += '</div>';
    html += '<div class="legend"><span><i class="lg-done"></i>done</span><span><i class="lg-plan"></i>planned</span><span><i class="lg-part"></i>partly planned</span><span><i></i>still needed</span></div>';
    trackEl.innerHTML = html;
  }
  trackEl.addEventListener("change", function (e) {
    var id = e.target.getAttribute && e.target.getAttribute("data-man");
    if (id) { if (e.target.checked) store.manual[id] = true; else delete store.manual[id]; save(); renderTracker(); return; }
    if (e.target.id === "importIn" && e.target.files[0]) {
      var r = new FileReader();
      r.onload = function () {
        try { var d = JSON.parse(r.result); if (!d || typeof d !== "object" || !d.plans) throw 0; store = d; store.manual = store.manual || {}; store.custom = store.custom || []; save(); renderAll(); }
        catch (err) { alert("That file isn't a planner export."); }
      };
      r.readAsText(e.target.files[0]);
    }
  });
  trackEl.addEventListener("click", function (e) {
    var p = e.target.closest("[data-path]");
    if (p) {
      var path = PATHS.filter(function (x) { return x.id === p.getAttribute("data-path"); })[0];
      if (!confirm('Load "' + path.name + '"? This replaces your picks in those terms.')) return;
      Object.keys(path.plan).forEach(function (tid) { store.plans[tid] = path.plan[tid].slice(); });
      save(); renderAll(); return;
    }
    var rm = e.target.closest(".rm[data-term]");
    if (rm) { termId = rm.getAttribute("data-term"); store.term = termId; save(); renderAll(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    var del = e.target.closest("[data-deltodo]");
    if (del) { var id = del.getAttribute("data-deltodo"); store.custom = store.custom.filter(function (c) { return c.id !== id; }); delete store.manual[id]; save(); renderTracker(); return; }
    if (e.target.id === "exportBtn") {
      var blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "course-planner-backup.json"; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }
  });
  trackEl.addEventListener("submit", function (e) {
    if (e.target.id !== "todoForm") return; e.preventDefault();
    var v = document.getElementById("todoIn").value.trim(); if (!v) return;
    store.custom.push({ id: "c-" + Date.now(), text: v }); save(); renderTracker();
  });

  function renderIntro() { var t = term(); document.getElementById("termIntro").innerHTML = t ? '<b>' + esc(t.name) + '</b> · ' + esc(t.dates || "") + '<br>' + esc(t.intro || "") : ""; }
  function renderAll() { renderTabs(); renderIntro(); renderChips(); renderList(); renderPlan(); renderWeek(); renderTracker(); }
  renderAll();
})();
