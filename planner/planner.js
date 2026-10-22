/*
  planner.js: renders any term registered in data/terms/*.js.
  Nothing term-specific lives here. Selections save per term in this browser only.
*/
(function () {
  "use strict";

  var DEG = window.PLANNER_DEGREE;
  var TERMS = (window.PLANNER_TERMS || []).slice().sort(function (a, b) { return a.order - b.order; });
  var KEY = "sf_planner_v1";
  var DAYS = ["Mo", "Tu", "We", "Th", "Fr"];
  var DAYNAME = { Mo: "Mon", Tu: "Tue", We: "Wed", Th: "Thu", Fr: "Fri" };
  var CATS = [
    { key: "all", label: "All" },
    { key: "rec", label: "Recommended" },
    { key: "eligible", label: "Eligible now" },
    { key: "core", label: "Core" },
    { key: "ud", label: "Upper-div" },
    { key: "design", label: "Design" },
    { key: "te", label: "Non-CS elective" },
    { key: "ahi", label: "AH&I" },
    { key: "small", label: "Small / P-NP" }
  ];

  // ---------- state ----------
  var store = load();
  var termId = store.term && TERMS.some(function (t) { return t.id === store.term; }) ? store.term : (TERMS.length ? pickDefaultTerm() : null);
  var cat = "all";
  var query = "";

  function pickDefaultTerm() {
    var planning = TERMS.filter(function (t) { return t.status === "Planning"; });
    return (planning[0] || TERMS[TERMS.length - 1]).id;
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || { plans: {} }; } catch (e) { return { plans: {} }; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  function plan(id) { store.plans = store.plans || {}; return store.plans[id || termId] || (store.plans[id || termId] = []); }
  function term() { return TERMS.filter(function (t) { return t.id === termId; })[0]; }
  function course(t, id) { return t.courses.filter(function (c) { return c.id === id; })[0]; }

  // ---------- helpers ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]; }); }
  function daysOf(m) {
    // accepts "MWF", "TuTh", "MW", "MF", "WF", "Tu"
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
    if (!c.meet || !c.meet.length) return "Time TBA";
    return c.meet.map(function (m) { return daysOf(m).map(function (d) { return DAYNAME[d]; }).join("/") + " " + fmt(m.start) + " to " + fmt(m.end); }).join(", ");
  }

  // courses done before this term = degree.done + plans of earlier terms
  function doneBefore(t) {
    var set = {};
    DEG.done.forEach(function (id) { set[id] = true; });
    TERMS.forEach(function (o) { if (o.order < t.order) plan(o.id).forEach(function (id) { set[id] = true; }); });
    return set;
  }
  function missing(c, done) {
    return (c.prereq || []).filter(function (group) { return !group.some(function (id) { return done[id]; }); })
      .map(function (group) { return group.join(" or "); });
  }

  // ---------- render: term tabs ----------
  var tabsEl = document.getElementById("terms");
  function renderTabs() {
    tabsEl.innerHTML = TERMS.map(function (t) {
      return '<button type="button" role="tab" aria-selected="' + (t.id === termId) + '" data-term="' + esc(t.id) + '">' +
        esc(t.name) + '<span>' + esc(t.status || "") + '</span></button>';
    }).join("");
  }
  tabsEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-term]"); if (!b) return;
    termId = b.getAttribute("data-term"); store.term = termId; save(); renderAll();
  });

  // ---------- render: filters ----------
  var chipsEl = document.getElementById("chips");
  function renderChips() {
    chipsEl.innerHTML = CATS.map(function (c) {
      return '<button type="button" class="chip" aria-pressed="' + (c.key === cat) + '" data-cat="' + c.key + '">' + esc(c.label) + '</button>';
    }).join("");
  }
  chipsEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat]"); if (!b) return;
    cat = b.getAttribute("data-cat"); renderChips(); renderList();
  });
  document.getElementById("q").addEventListener("input", function (e) { query = e.target.value.trim().toLowerCase(); renderList(); });

  // ---------- render: course list ----------
  var listEl = document.getElementById("list");
  function renderList() {
    var t = term(); if (!t) { listEl.innerHTML = '<p class="empty">No terms yet. Add one in planner/data/terms/.</p>'; return; }
    var done = doneBefore(t), mine = plan();
    var shown = t.courses.filter(function (c) {
      var miss = missing(c, done);
      if (cat === "rec" && !c.rec) return false;
      if (cat === "eligible" && (miss.length || done[c.id])) return false;
      if (["all", "rec", "eligible"].indexOf(cat) === -1 && (c.cat || []).indexOf(cat) === -1) return false;
      if (query) {
        var hay = [c.id, c.title, c.instructor, c.note, (c.cat || []).join(" ")].join(" ").toLowerCase();
        if (hay.indexOf(query) === -1) return false;
      }
      return true;
    });
    document.getElementById("count").textContent = shown.length + " of " + t.courses.length + " courses";
    if (!shown.length) { listEl.innerHTML = '<p class="empty">Nothing matches. Try another filter.</p>'; return; }

    listEl.innerHTML = shown.map(function (c) {
      var miss = missing(c, done), inPlan = mine.indexOf(c.id) !== -1, taken = !!done[c.id];
      var status = taken ? '<span class="st st-done">Already done</span>'
        : miss.length ? '<span class="st st-lock">Needs ' + esc(miss.join(", ")) + '</span>'
        : '<span class="st st-ok">Eligible</span>';
      var flags = (c.rec ? '<span class="st st-rec">' + esc(c.rec) + '</span>' : "") +
        (c.verify ? '<span class="st st-ver" title="Something here still needs checking">Verify</span>' : "") +
        (DEG.heavy.indexOf(c.id) !== -1 ? '<span class="st st-heavy">Heavy</span>' : "");
      var counts = (c.ud || []).map(function (k) { return { design: "Design", cs: "UD CS", cseecs: "UD CS/EE", te: "Non-CS TE" }[k]; });
      if ((c.cat || []).indexOf("ahi") !== -1) counts.push("AH&I");
      return '<article class="course' + (inPlan ? " in" : "") + (taken ? " taken" : "") + '">' +
        '<div class="c-top"><span class="cid">' + esc(c.id.replace("-GC", "")) + '</span><span class="units">' + c.units + ' u</span></div>' +
        '<h3>' + esc(c.title) + '</h3>' +
        '<div class="badges">' + status + flags + '</div>' +
        '<dl><dt>When</dt><dd>' + esc(meetText(c)) + '</dd>' +
        '<dt>Where</dt><dd>' + esc(c.location || "TBA") + '</dd>' +
        '<dt>Who</dt><dd>' + esc(c.instructor || "TBA") + '</dd>' +
        (counts.length ? '<dt>Counts</dt><dd>' + esc(counts.join(" · ")) + '</dd>' : "") +
        (c.seats ? '<dt>Seats</dt><dd>' + esc(c.seats) + '</dd>' : "") +
        (c.prereqNote ? '<dt>Prereq</dt><dd>' + esc(c.prereqNote) + '</dd>' : "") +
        '</dl>' +
        '<p class="note">' + esc(c.note || "") + '</p>' +
        '<div class="c-foot">' +
        (c.link ? '<a href="' + esc(c.link) + '" target="_blank" rel="noopener">Class page ↗</a>' : '<span></span>') +
        (taken ? "" : '<button type="button" class="add" data-add="' + esc(c.id) + '">' + (inPlan ? "Remove" : "Add to plan") + '</button>') +
        '</div></article>';
    }).join("");
  }
  listEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b) return;
    toggle(b.getAttribute("data-add"));
  });
  function toggle(id) {
    var p = plan(), i = p.indexOf(id);
    if (i === -1) p.push(id); else p.splice(i, 1);
    save(); renderAll();
  }

  // ---------- render: plan panel ----------
  var planEl = document.getElementById("plan");
  function conflicts(t, ids) {
    var slots = [];
    ids.forEach(function (id) {
      var c = course(t, id); if (!c) return;
      (c.meet || []).forEach(function (m) { daysOf(m).forEach(function (d) { slots.push({ id: id, d: d, s: mins(m.start), e: mins(m.end) }); }); });
    });
    var pairs = {};
    for (var i = 0; i < slots.length; i++) for (var j = i + 1; j < slots.length; j++) {
      var a = slots[i], b = slots[j];
      if (a.id !== b.id && a.d === b.d && a.s < b.e && b.s < a.e) pairs[[a.id, b.id].sort().join(" and ")] = true;
    }
    return Object.keys(pairs);
  }
  function renderPlan() {
    var t = term(); if (!t) { planEl.innerHTML = ""; return; }
    var ids = plan().filter(function (id) { return course(t, id); });
    var done = doneBefore(t);
    var units = ids.reduce(function (s, id) { return s + (course(t, id).units || 0); }, 0);
    var tech = ids.filter(function (id) { var c = course(t, id); return (c.cat || []).some(function (k) { return ["core", "ud", "design", "te"].indexOf(k) !== -1; }) && c.units >= 3; });
    var heavy = ids.filter(function (id) { return DEG.heavy.indexOf(id) !== -1; });
    var warn = [];
    if (ids.length && units < DEG.minUnits) warn.push(["bad", "Under the " + DEG.minUnits + "-unit CDSS minimum (and full-time aid needs 12)."]);
    if (units > DEG.maxUnits) warn.push(["bad", "Over the " + DEG.maxUnits + "-unit cap."]);
    else if (units > DEG.phase1Cap) warn.push(["mid", "Over " + DEG.phase1Cap + " units: enroll the rest in Phase 2."]);
    if (heavy.length > 1) warn.push(["mid", heavy.join(" + ") + " are both on the EECS heavy-workload list."]);
    if (tech.length > 3) warn.push(["mid", tech.length + " technical courses. Three is already a full load next to work and projects."]);
    conflicts(t, ids).forEach(function (p) { warn.push(["bad", "Time conflict: " + p + "."]); });
    ids.forEach(function (id) { var m = missing(course(t, id), done); if (m.length) warn.push(["bad", id + " needs " + m.join(", ") + " first."]); });
    ids.forEach(function (id) { if (course(t, id).verify) warn.push(["info", id + ": something still needs checking (see its card)."]); });
    if (ids.length && !warn.some(function (w) { return w[0] !== "info"; })) warn.unshift(["good", "No conflicts, prereqs met, unit load in range."]);

    var meter = Math.min(100, units / DEG.maxUnits * 100);
    planEl.innerHTML =
      '<div class="p-head"><h2>My ' + esc(t.name) + ' plan</h2><span class="p-units"><b>' + units + '</b> units</span></div>' +
      '<div class="meter" aria-hidden="true"><i style="width:' + meter + '%"></i><s style="left:' + (DEG.minUnits / DEG.maxUnits * 100) + '%" title="12-unit minimum"></s><s style="left:' + (DEG.phase1Cap / DEG.maxUnits * 100) + '%" title="Phase 1 cap"></s></div>' +
      '<div class="meter-key"><span>0</span><span>min 12</span><span>Phase 1 · 13.5</span><span>17.5</span></div>' +
      (ids.length ? '<ul class="p-list">' + ids.map(function (id) {
        var c = course(t, id);
        return '<li><div><b>' + esc(id.replace("-GC", "")) + '</b> <span>' + esc(c.title) + '</span><small>' + esc(meetText(c)) + '</small></div>' +
          '<span class="pu">' + c.units + '</span><button type="button" class="x" data-add="' + esc(id) + '" aria-label="Remove ' + esc(id) + '">×</button></li>';
      }).join("") + '</ul>' : '<p class="p-empty">Nothing yet. Add courses from the list, or start from a preset.</p>') +
      (warn.length ? '<ul class="warn">' + warn.map(function (w) { return '<li class="w-' + w[0] + '">' + esc(w[1]) + '</li>'; }).join("") + '</ul>' : "") +
      (t.presets && t.presets.length ? '<div class="presets"><h3>Start from a preset</h3>' + t.presets.map(function (p, i) {
        return '<button type="button" class="preset" data-preset="' + i + '"><b>' + esc(p.name) + '</b><span>' + esc(p.ids.join(" · ")) + '</span><small>' + esc(p.why) + '</small></button>';
      }).join("") + '</div>' : "") +
      (ids.length ? '<button type="button" class="clear" id="clearPlan">Clear plan</button>' : "");
  }
  planEl.addEventListener("click", function (e) {
    var x = e.target.closest("[data-add]"); if (x) { toggle(x.getAttribute("data-add")); return; }
    var p = e.target.closest("[data-preset]");
    if (p) { store.plans[termId] = term().presets[+p.getAttribute("data-preset")].ids.slice(); save(); renderAll(); return; }
    if (e.target.id === "clearPlan") { store.plans[termId] = []; save(); renderAll(); }
  });

  // ---------- render: week grid ----------
  var weekEl = document.getElementById("week");
  function renderWeek() {
    var t = term(); if (!t) { weekEl.innerHTML = ""; return; }
    var ids = plan().filter(function (id) { return course(t, id); });
    var START = 8 * 60, END = 20 * 60, H = END - START;
    var hours = ""; for (var h = 8; h <= 20; h += 2) hours += '<span style="top:' + ((h * 60 - START) / H * 100) + '%">' + (h % 12 || 12) + (h < 12 ? "a" : "p") + '</span>';
    var clash = {}; conflicts(t, ids).forEach(function (p) { p.split(" and ").forEach(function (id) { clash[id] = true; }); });
    var cols = DAYS.map(function (d) {
      var blocks = "";
      ids.forEach(function (id, idx) {
        var c = course(t, id);
        (c.meet || []).forEach(function (m) {
          if (daysOf(m).indexOf(d) === -1) return;
          var top = (mins(m.start) - START) / H * 100, ht = (mins(m.end) - mins(m.start)) / H * 100;
          blocks += '<div class="blk c' + (idx % 6) + (clash[id] ? " clash" : "") + '" style="top:' + top + '%;height:' + ht + '%"><b>' + esc(id.replace("-GC", "")) + '</b><span>' + fmt(m.start) + '</span></div>';
        });
      });
      return '<div class="day"><div class="dh">' + DAYNAME[d] + '</div><div class="col">' + blocks + '</div></div>';
    }).join("");
    var tba = ids.filter(function (id) { return !(course(t, id).meet || []).length; });
    weekEl.innerHTML = '<h2>Week view</h2><div class="grid"><div class="hours">' + hours + '</div>' + cols + '</div>' +
      (tba.length ? '<p class="tba">Not shown (time TBA): ' + esc(tba.join(", ")) + '</p>' : "") +
      (!ids.length ? '<p class="tba">Your week fills in as you add courses.</p>' : "");
  }

  // ---------- render: requirement progress ----------
  var reqEl = document.getElementById("reqs");
  function renderReqs() {
    var t = term(); if (!t) return;
    var done = {}; DEG.done.forEach(function (id) { done[id] = "done"; });
    TERMS.forEach(function (o) { if (o.order <= t.order) plan(o.id).forEach(function (id) { if (!done[id]) done[id] = "plan"; }); });

    var rows = DEG.checklist.map(function (r) {
      var hit = r.any.filter(function (id) { return done[id]; })[0];
      var st = hit ? done[hit] : "todo";
      return { group: r.group, name: r.name, st: st, by: hit };
    });

    // upper-div buckets: greedy fill, design first, then CS, CS/EE, TE
    var byId = {}; TERMS.forEach(function (o) { o.courses.forEach(function (c) { byId[c.id] = c; }); });
    var fill = {}; DEG.upperDiv.forEach(function (b) { fill[b.key] = { u: 0, ids: [], st: "done" }; });
    Object.keys(done).forEach(function (id) {
      var c = byId[id]; if (!c || !c.ud) return;
      var order = ["design", "cs", "cseecs", "te"];
      for (var i = 0; i < order.length; i++) {
        var k = order[i], cap = DEG.upperDiv.filter(function (b) { return b.key === k; })[0].units;
        if (c.ud.indexOf(k) !== -1 && fill[k].u < cap) { fill[k].u += c.units; fill[k].ids.push(id); if (done[id] === "plan") fill[k].st = "plan"; break; }
      }
    });

    var html = '<h2>Degree progress <small>through ' + esc(t.name) + '</small></h2><div class="req-groups">';
    var groups = {};
    rows.forEach(function (r) { (groups[r.group] = groups[r.group] || []).push(r); });
    Object.keys(groups).forEach(function (g) {
      html += '<div class="rg"><h3>' + esc(g) + '</h3><ul>' + groups[g].map(function (r) {
        return '<li class="r-' + r.st + '"><i></i>' + esc(r.name) + (r.st === "plan" ? ' <em>planned</em>' : "") + '</li>';
      }).join("") + '</ul></div>';
    });
    html += '<div class="rg"><h3>Upper division (24 units)</h3><ul>' + DEG.upperDiv.map(function (b) {
      var f = fill[b.key], st = f.u >= b.units ? f.st : (f.u ? "part" : "todo");
      return '<li class="r-' + st + '"><i></i>' + esc(b.name) + ' <span class="ru">' + Math.min(f.u, b.units) + '/' + b.units + '</span>' +
        (f.ids.length ? ' <em>' + esc(f.ids.join(", ")) + '</em>' : "") + '</li>';
    }).join("") + '</ul></div></div>';
    reqEl.innerHTML = html;
  }

  // ---------- header ----------
  function renderIntro() {
    var t = term();
    document.getElementById("termIntro").innerHTML = t ? '<b>' + esc(t.name) + '</b> · ' + esc(t.dates || "") + '<br>' + esc(t.intro || "") : "";
  }

  function renderAll() { renderTabs(); renderIntro(); renderChips(); renderList(); renderPlan(); renderWeek(); renderReqs(); }
  renderAll();
})();
