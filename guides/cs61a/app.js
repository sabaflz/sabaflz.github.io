/*
  app.js: the CS 61A learning app. One page that never reloads.
  Content lives in course.js (the map) and lessons/<topic>.js (each topic).
  Practice problems are read from ../cs61a-mt3-practice/problems.js, and Python
  runs through that guide's pyworker.js, so there is one copy of each.

  Addresses:  #/                      course map
              #/t/<topic>             topic page (the four stages)
              #/t/<topic>/learn       lesson
              #/t/<topic>/check       quick questions
              #/t/<topic>/deepen[/id] exam-style questions
              #/t/<topic>/practice[/id]
*/
(function () {
  "use strict";
  var C = window.COURSE, L = window.LESSONS || {}, POOL = window.PROBLEMS || [], SETUP = window.GLOBAL_SETUP || "";
  var view = document.getElementById("view");
  var KEY = "sf_cs61a_v1";
  var STAGES = ["learn", "check", "deepen", "practice"];
  var NAMES = { learn: "Learn", check: "Check", deepen: "Deepen", practice: "Practice" };

  /* ---------- saved progress (this browser only) ---------- */
  var S = (function () {
    var v = {};
    try { v = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { v = {}; }
    if (typeof v !== "object") v = {};
    v.topics = v.topics || {}; v.code = v.code || {};
    return v;
  })();
  var saveTimer = null;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); }
  function T(id) {
    var t = S.topics[id] || (S.topics[id] = {});
    t.asks = t.asks || {}; t.check = t.check || {}; t.solved = t.solved || {}; t.hints = t.hints || {}; t.step = t.step || 0; t.flags = t.flags || {}; t.spent = t.spent || {};
    return t;
  }
  function level() { return S.level || C.defaultLevel; }

  /* ---------- confidence: how sure you feel about a topic, rated from any stage ---------- */
  var CONF = [{ v: 1, l: "Lost" }, { v: 2, l: "Shaky" }, { v: 3, l: "Getting there" }, { v: 4, l: "Confident" }];
  /* Our own faces, drawn in the site's colors so they look the same on every device.
     Each is a 24 × 24 SVG: a round face, two eyes, and a mouth that changes with the level. */
  var EYES = '<circle cx="9.3" cy="11" r="1.25" fill="currentColor"/><circle cx="14.7" cy="11" r="1.25" fill="currentColor"/>';
  var FACE = {
    1: '<path d="M7.2 9.1l2.8-1.5M16.8 9.1l-2.8-1.5" class="ln"/>' + EYES + '<path d="M8.7 17.2q3.3-3.1 6.6 0" class="ln"/>',
    2: EYES + '<path d="M8.4 15.6q1.9-1.5 3.6 0t3.6 0" class="ln"/>',
    3: EYES + '<path d="M8.6 14.4q3.4 3 6.8 0" class="ln"/>',
    4: '<path d="M5.9 9.3h12.2v1.1q0 3-2.9 3-2.6 0-2.8-2.4h-.8q-.2 2.4-2.8 2.4-2.9 0-2.9-3z" fill="currentColor"/><path d="M8.2 15q3.8 3.9 7.6 0" class="ln"/><path d="M19.6 3.2l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5z" fill="currentColor" class="spark"/>'
  };
  function icon(v) { return '<svg class="face f' + v + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.4" class="disc"/>' + FACE[v] + "</svg>"; }
  var FLAG = '<svg class="face fflag" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 21V3.6" class="ln"/><path d="M6.5 4.2h11.2l-2.9 4.1 2.9 4.1H6.5z" class="pen"/></svg>';
  function confOf(id) { var s = S.topics[id] || {}; return s.conf || (s.confident ? 4 : 0); }
  function confInfo(v) { return CONF[v - 1] || null; }
  /* One entry per day in the history; picking the same rating again clears it. */
  function setConf(t, v, where) {
    var s = T(t.id), d = new Date(), k = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    if (confOf(t.id) === v) v = 0;
    s.conf = v; s.confident = v === 4;
    s.confLog = s.confLog || [];
    var last = s.confLog[s.confLog.length - 1];
    if (last && last.d === k) { if (v) { last.v = v; last.w = where; } else s.confLog.pop(); }
    else if (v) s.confLog.push({ d: k, v: v, w: where });
    save();
  }
  function confChip(id) { var c = confInfo(confOf(id)); return c ? '<span class="chip conf c' + c.v + '" title="Your confidence">' + icon(c.v) + c.l + "</span>" : ""; }
  /* The bar shown on the topic page and on every stage: rate yourself, or flag the topic. */
  function confBar(t, where) {
    var cv = confOf(t.id), s = T(t.id);
    return '<div class="confbar" data-where="' + (where || "topic") + '"><span class="cq">How sure do you feel about ' + esc(t.title) + '?</span><span class="cbtns" role="group" aria-label="Your confidence">' +
      CONF.map(function (c) { return '<button type="button" class="cbtn c' + c.v + '" data-act="conf" data-v="' + c.v + '" aria-pressed="' + (cv === c.v) + '" aria-label="' + c.l + '">' + icon(c.v) + '<small class="ctip" aria-hidden="true">' + c.l + "</small></button>"; }).join("") +
      '</span><button type="button" class="cbtn flagbtn" data-act="flagt" aria-pressed="' + !!s.flag + '">' + FLAG + "<small>" + (s.flag ? "Flagged for review" : "Flag for review") + "</small></button></div>";
  }
  function confHistory(t) {
    var log = (S.topics[t.id] || {}).confLog || [];
    if (!log.length) return '<p class="meta chist">Rate yourself any time, from this page or inside a stage. Your ratings build a history here.</p>';
    return '<p class="meta chist"><b>Your confidence so far:</b> ' + log.slice(-8).map(function (x) { var c = confInfo(x.v), p = x.d.split("-"); return '<span title="' + esc(c.l + (x.w ? ", rated in " + x.w : "")) + '">' + new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + icon(c.v) + "</span>"; }).join(' <span class="arrow" aria-hidden="true">\u2192</span> ') + "</p>";
  }
  function refreshConf(t) {
    document.querySelectorAll(".confbar").forEach(function (el) { var w = el.getAttribute("data-where"); el.outerHTML = confBar(t, w); });
    var h = document.querySelector(".chist"); if (h) h.outerHTML = confHistory(t);
    progress(); renderSide();
  }

  /* ---------- course helpers ---------- */
  var TOPICS = [];
  C.units.forEach(function (u) { u.topics.forEach(function (t) { t.unit = u.title; TOPICS.push(t); }); });
  function topicById(id) { for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i]; return null; }
  function nextTopic(t) { var i = TOPICS.indexOf(t); return i >= 0 && i < TOPICS.length - 1 ? TOPICS[i + 1] : null; }
  function poolFor(t) { return POOL.filter(function (p) { return (t.pool || []).indexOf(p.cat) >= 0; }); }
  function items(t, stage) {
    var l = L[t.id];
    if (stage === "learn") return l ? l.steps : [];
    if (stage === "check") return l ? l.check || [] : [];
    if (stage === "deepen") return l ? l.deepen || [] : [];
    return poolFor(t);
  }
  function has(t, stage) { return items(t, stage).length > 0; }
  function started(t) {
    var s = S.topics[t.id]; if (!s) return false;
    return !!(s.step || s.lessonDone || s.confident || Object.keys(s.check || {}).length || Object.keys(s.solved || {}).length);
  }
  function solvedCount(t, stage) { var s = T(t.id); return items(t, stage).filter(function (p) { return s.solved[p.id]; }).length; }
  function stageDone(t, stage) {
    var s = T(t.id), n = items(t, stage).length;
    if (!n) return false;
    if (stage === "learn") return !!s.lessonDone;
    if (stage === "check") return Object.keys(s.check).length >= n;
    if (stage === "deepen") return solvedCount(t, stage) >= n;
    return !!s.confident;
  }

  /* ---------- time estimates ---------- */
  var PACE = C.pace || { perCheckQuestion: 1, perDeepenProblem: 10, perPracticeProblem: 15 };
  function up5(m) { return Math.max(5, Math.ceil(m / 5) * 5); }
  function stageMin(t, stage) {
    var l = L[t.id], n = items(t, stage).length;
    if (!n) return 0;
    if (stage === "learn") return l.minutes || up5(n * 0.6);
    if (stage === "check") return up5(n * PACE.perCheckQuestion);
    if (stage === "deepen") return up5(n * PACE.perDeepenProblem);
    return PACE.perPracticeProblem; // practice is open-ended: minutes per problem
  }
  /* Lesson + check + exam-style problems. Practice is extra. */
  function topicMin(t) { return L[t.id] ? stageMin(t, "learn") + stageMin(t, "check") + stageMin(t, "deepen") : (t.est || 0); }
  /* Time still ahead for a topic. Counts what is finished inside it: lesson steps,
     check questions answered, problems solved. Marking a topic confident clears it. */
  var CORE = ["learn", "check", "deepen"];
  /* Estimated minutes of unfinished work in a written topic, by stage. */
  function leftParts(t) {
    var s = S.topics[t.id] || {}, p = { learn: 0, check: 0, deepen: 0 }, n;
    n = items(t, "learn").length; if (!s.lessonDone) p.learn = stageMin(t, "learn") * (n ? Math.max(0, n - (s.step || 0)) / n : 1);
    n = items(t, "check").length; if (n) p.check = stageMin(t, "check") * Math.max(0, n - Object.keys(s.check || {}).length) / n;
    n = items(t, "deepen").length; if (n) p.deepen = stageMin(t, "deepen") * (n - items(t, "deepen").filter(function (q) { return (s.solved || {})[q.id]; }).length) / n;
    return p;
  }
  function leftMin(t, workOnly) {
    var s = S.topics[t.id];
    if (s && s.confident && !workOnly) return 0;
    if (!L[t.id]) return topicMin(t);
    var p = leftParts(t); return p.learn + p.check + p.deepen;
  }
  /* The same, scaled to your own speed on each kind of work (see factors). */
  function leftMine(t) {
    var s = S.topics[t.id], F = factors();
    if (s && s.confident) return 0;
    if (!L[t.id]) return topicMin(t) * F.all;
    var p = leftParts(t); return p.learn * F.learn + p.check * F.check + p.deepen * F.deepen;
  }
  function sumMine(list) { return list.reduce(function (a, t) { return a + leftMine(t); }, 0); }
  function sumLeft(list) { return list.reduce(function (a, t) { return a + leftMin(t); }, 0); }
  function leftText(m) { return m < 2.5 ? "done" : dur(m).replace("about ", "") + " left"; }
  /* ---------- recommended time for today, and whether you are on track ---------- */
  function spentOn(k, withPractice) { var sp = ((S.days || {})[k] || {}).sp || {}; return ((sp.learn || 0) + (sp.check || 0) + (sp.deepen || 0) + (withPractice ? sp.practice || 0 : 0)) / 60; }
  /* With an exam date: the work left at the start of today, at your pace, spread over the days left.
     Without one: the daily goal you set, if any. */
  function recToday(list) {
    var d = daysUntil(S.examDate);
    if (S.examDate && d !== null && d > 0) { var left = sumMine(list); return left < 2.5 ? 0 : (left + spentOn(today(), false)) / d; }
    return S.dailyGoal || 0;
  }
  /* Compares your average over the last finished days (up to 7, today left out) with what the exam date needs. */
  function track(list) {
    var d = daysUntil(S.examDate), keys = Object.keys(S.days || {}).sort(), t = today();
    if (!S.examDate || d === null || d <= 0) return null;
    var left = sumMine(list); if (left < 2.5) return { state: "ahead", text: "Everything is done." };
    if (!keys.length || keys[0] >= t) return { state: "early", text: "Too early to tell. Come back after your first full day." };
    var n = Math.min(7, Math.round((fromIso(t) - fromIso(keys[0])) / 86400000)), sum = 0, day = fromIso(t);
    for (var i = 0; i < n; i++) { day.setDate(day.getDate() - 1); sum += spentOn(iso(day), false); }
    var avg = sum / n, need = left / d;
    if (avg < 1) return { state: "behind", text: "Behind. No study time in the last " + n + " day" + (n === 1 ? "" : "s") + ". You now need " + dur(need).replace("about ", "") + " a day." };
    var fin = Math.ceil(left / avg), slack = d - fin;
    if (slack >= 2) return { state: "ahead", text: "Ahead. At your average of " + hm(avg) + " a day you finish " + slack + " days early." };
    if (slack >= 0) return { state: "on", text: "On track. Your average of " + hm(avg) + " a day gets you there in time." };
    return { state: "behind", text: "Behind. Your average is " + hm(avg) + " a day, and finishing in time needs " + dur(need).replace("about ", "") + " a day." };
  }
  var TRACK = { ahead: "Ahead", on: "On track", behind: "Behind", early: "Just started" };
  function todayHTML(list) {
    var rec = recToday(list), did = spentOn(today(), true), tr = track(list), h = "";
    if (rec >= 1) {
      dayRec().rec = Math.round(rec);
      var pct = Math.min(100, Math.round(100 * did / rec)), togo = rec - did;
      h += '<div class="todayrow"><p><strong>Today:</strong> ' + hm(did) + " of " + hm(Math.ceil(rec / 5) * 5) + " recommended" + (togo < 1 ? ". Done for today." : "") + '</p><div class="tbar" role="img" aria-label="' + pct + ' percent of today\'s recommended time"><i style="width:' + (pct ? Math.max(2, pct) : 0) + '%"></i></div></div>';
    }
    if (tr) h += '<p class="pace"><span class="chip trk ' + tr.state + '">' + TRACK[tr.state] + "</span> " + esc(tr.text.replace(/^(Ahead|On track|Behind)\. /, "")) + "</p>";
    return h;
  }
  function timeBar(list) {
    var r5 = function (m) { return Math.round(m / 5) * 5; }, total = r5(sumMin(list)), left = r5(sumLeft(list)), pct = total ? Math.round(100 * (total - left) / total) : 0;
    var plain = function (m) { return m < 2.5 ? "0 min" : dur(m).replace("about ", ""); };
    var h = '<div class="timecard"><div class="nums"><div><strong>' + plain(total) + "</strong><span>" + (S.filter ? esc(filterName(S.filter)) : "whole course") + "</span></div><div><strong>" + plain(total - left) + "</strong><span>done</span></div><div><strong>" + plain(left) + "</strong><span>left</span></div></div>" +
      '<div class="tbar" role="img" aria-label="' + pct + ' percent done by time"><i style="width:' + (pct ? Math.max(2, pct) : 0) + '%"></i></div><p class="meta">' + pct + "% done by time · estimates for the lesson, check and exam-style problems · practice is extra</p>";
    var F = factors(), f = F.known ? 1 : 0, mine = sumMine(list); if (f && left > 0) f = mine / Math.max(1, sumLeft(list));
    if (f && left >= 5) h += '<p class="pace">At your pace so far, ' + (Math.abs(f - 1) < 0.08 ? "right on the estimates" : f < 1 ? "faster than the estimates" : "slower than the estimates") + ": <strong>" + dur(mine) + " left</strong>. <a href=\"#/progress\">See your progress</a></p>";
    else h += '<p class="pace"><a href="#/progress">See your progress over time</a></p>';
    var d = daysUntil(S.examDate);
    if (S.examDate && d !== null && !dateOpen) {
      h += '<p class="pace">' + (d < 0 ? "Your exam date, " + esc(niceDate(S.examDate)) + ", has passed." : d === 0 ? "Your exam is today. " + (left >= 5 ? cap(dur(mine)) + " still on the list." : "Everything is done.") :
        "Exam on " + esc(niceDate(S.examDate)) + ", in " + d + " day" + (d === 1 ? "" : "s") + ". " + (left < 5 ? "Everything here is done." : "To finish " + (S.filter ? "these units" : "the course") + " the day before: <strong>" + dur(mine / Math.max(1, d)) + " a day</strong>" + (d > 1 ? ", starting today." : "."))) +
        ' <button type="button" class="linkbtn" data-act="dateopen">Change</button></p>';
    } else {
      h += '<form class="dateform" data-act="examdate"><label for="examdate">Exam date</label><input type="date" id="examdate" name="d" value="' + esc(S.examDate || "") + '"><button class="btn small" type="submit">Set</button>' + (S.examDate ? '<button type="button" class="linkbtn" data-act="dateclear">Remove</button>' : '<span class="muted">Shows how much to do each day.</span>') + "</form>";
    }
    h += todayHTML(list);
    if (!S.examDate || goalOpen) h += '<form class="dateform" data-act="dailygoal"><label for="dailygoal">' + (S.examDate ? "Daily goal" : "Or a daily goal") + '</label><input type="number" id="dailygoal" min="5" max="600" step="5" inputmode="numeric" value="' + esc(S.dailyGoal || "") + '" style="width:90px"><span>minutes</span><button class="btn small" type="submit">Set</button>' + (S.dailyGoal ? '<button type="button" class="linkbtn" data-act="goalclear">Remove</button>' : "") + "</form>";
    return h + "</div>";
  }
  /* Which units the map shows. "" means everything. */
  var EXAMS = []; C.units.forEach(function (u) { if (u.exam && EXAMS.indexOf(u.exam) < 0) EXAMS.push(u.exam); });
  function shownUnits() { return S.filter ? C.units.filter(function (u) { return u.exam === S.filter; }) : C.units; }
  function shownTopics() { var a = []; shownUnits().forEach(function (u) { a = a.concat(u.topics); }); return a; }
  function filterName(x) { return x === "Final" ? "New for the final" : x + " units"; }

  /* Time actually spent, counted only while a lesson, check or problem page is open and in use. */
  function coreSpent(t) { var sp = (S.topics[t.id] || {}).spent || {}; return ((sp.learn || 0) + (sp.check || 0) + (sp.deepen || 0)) / 60; }
  function allSpent(t) { return coreSpent(t) + ((((S.topics[t.id] || {}).spent || {}).practice || 0) / 60); }
  /* ---------- daily log: what was done and how long it took, one entry per day ---------- */
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function fromIso(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() { return iso(new Date()); }
  function dayRec() { S.days = S.days || {}; var k = today(); return S.days[k] || (S.days[k] = { sp: {}, est: {} }); }
  function workDone() {
    var w = { learn: 0, check: 0, deepen: 0 };
    TOPICS.forEach(function (t) { if (!L[t.id] || !S.topics[t.id]) return; var p = leftParts(t); CORE.forEach(function (st) { w[st] += stageMin(t, st) - p[st]; }); });
    return w;
  }
  /* Called whenever progress may have changed: credits newly finished work to today. */
  function logProgress() {
    var w = workDone(), d = null;
    if (S.cum) CORE.forEach(function (st) { var dl = w[st] - (S.cum[st] || 0); if (dl > 0.01) { d = d || dayRec(); d.est[st] = (d.est[st] || 0) + dl; } });
    S.cum = w;
    if (d || (S.days && S.days[today()])) dayRec().left = Math.round(sumLeft(TOPICS));
    fcache = null;
  }
  /* Your speed per kind of work: time spent divided by the estimate for what you finished.
     Recent days count more (each day back counts 15% less). A stage needs enough finished work
     before it gets its own factor; until then it uses the overall one, and that needs 30 minutes. */
  var fcache = null, NEED = { learn: 15, check: 5, deepen: 20 };
  function factors() {
    if (fcache) return fcache;
    var num = { learn: 0, check: 0, deepen: 0 }, den = { learn: 0, check: 0, deepen: 0 }, raw = { learn: 0, check: 0, deepen: 0 }, now = fromIso(today());
    Object.keys(S.days || {}).forEach(function (k) {
      var d = S.days[k], w = Math.pow(0.85, Math.max(0, Math.round((now - fromIso(k)) / 86400000)));
      CORE.forEach(function (st) { var e = (d.est || {})[st] || 0, sp = ((d.sp || {})[st] || 0) / 60; num[st] += w * sp; den[st] += w * e; raw[st] += e; });
    });
    var clamp = function (x) { return Math.min(2.5, Math.max(0.4, x)); };
    var N = num.learn + num.check + num.deepen, D = den.learn + den.check + den.deepen, R = raw.learn + raw.check + raw.deepen;
    var F = { all: R >= 30 && D > 0 ? clamp(N / D) : 1, known: R >= 30 && D > 0, own: {} };
    CORE.forEach(function (st) { F.own[st] = raw[st] >= NEED[st] && den[st] > 0; F[st] = F.own[st] ? clamp(num[st] / den[st]) : F.all; });
    F.known = F.known || F.own.learn || F.own.check || F.own.deepen;
    return (fcache = F);
  }
  function daysUntil(iso) {
    var p = String(iso || "").split("-"); if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]), now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return isNaN(d) ? null : Math.round((d - today) / 86400000);
  }
  function niceDate(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }

  /* Review list: things you flagged, plus topics where the app saw you struggle. */
  function reviewItems() {
    var out = [];
    TOPICS.forEach(function (t) {
      var s = S.topics[t.id]; if (!s) return;
      var why = [], missed = 0, asks = 0, hinted = [];
      Object.keys(s.check || {}).forEach(function (k) { if (!s.check[k].ok) missed++; });
      Object.keys(s.asks || {}).forEach(function (k) { if (!s.asks[k].ok) asks++; });
      ["deepen", "practice"].forEach(function (st) { items(t, st).forEach(function (p) { if ((s.hints || {})[p.id] >= 2) hinted.push(p); }); });
      if (s.flag) why.push("you flagged this topic");
      var cv = confOf(t.id); if (cv && cv <= 2) why.push("you rated it " + confInfo(cv).l);
      if (missed) why.push(missed + " check question" + (missed === 1 ? "" : "s") + " missed");
      if (asks >= 2) why.push(asks + " lesson questions missed");
      if (hinted.length) why.push(hinted.length + " problem" + (hinted.length === 1 ? "" : "s") + " needed two or more hints");
      var flagged = [];
      ["deepen", "practice"].forEach(function (st) { items(t, st).forEach(function (p) { if ((s.flags || {})[p.id]) flagged.push({ p: p, stage: st }); }); });
      if (why.length || flagged.length) out.push({ t: t, why: why, flagged: flagged, weight: (s.flag ? 3 : 0) + (cv && cv <= 2 ? (3 - cv) * 2 : 0) + missed * 2 + asks + hinted.length * 2 + flagged.length * 2, link: missed ? "/check" : "" });
    });
    out.sort(function (a, b) { return b.weight - a.weight; });
    return out;
  }
  function reviewHTML() {
    var list = reviewItems(), h = '<section class="review"><h2>Review list<small>What you flagged, and where you slipped</small></h2>';
    if (!list.length) {
      if (S.noReviewExample) return h + '<p class="muted">Nothing here yet. Flag a topic or a problem, or miss a check question, and it shows up here.</p></section>';
      return h + '<ul class="rlist"><li class="example"><span><strong>Example: Tree recursion</strong><small>2 check questions missed · 1 problem needed two or more hints</small><small>Flagged problem: Count the paths</small></span><button type="button" class="linkbtn" data-act="hideexample">Remove example</button></li></ul><p class="muted" style="font-size:14px">This is what an entry looks like. Real ones appear when you flag something or miss questions.</p></section>';
    }
    return h + '<ul class="rlist">' + list.map(function (r) {
      return '<li><span><a href="#/t/' + r.t.id + r.link + '"><strong>' + esc(r.t.title) + "</strong></a>" + (r.why.length ? "<small>" + esc(cap(r.why.join(" · "))) + "</small>" : "") +
        r.flagged.map(function (f) { return '<small>Flagged problem: <a href="#/t/' + r.t.id + "/" + f.stage + "/" + f.p.id + '">' + esc(f.p.title) + "</a></small>"; }).join("") + '</span><span class="meta">' + ((S.topics[r.t.id] || {}).confident ? "marked confident" : leftText(leftMine(r.t))) + "</span></li>";
    }).join("") + "</ul></section>";
  }
  function sumMin(list) { return list.reduce(function (a, t) { return a + topicMin(t); }, 0); }
  function dur(m) {
    m = Math.max(5, Math.round(m / 5) * 5);
    if (m < 60) return "about " + m + " min";
    var h = Math.floor(m / 60), r = Math.round((m % 60) / 5) * 5;
    if (r === 60) { h++; r = 0; }
    return "about " + h + " h" + (r ? " " + r + " min" : "");
  }

  /* ---------- small helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function norm(s) { return String(s).trim().toLowerCase().replace(/['"]/g, "").replace(/[\s,]+/g, " ").replace(/ ?([\[\](){}:]) ?/g, "$1").trim(); }
  function codeHTML(src, hl) {
    hl = hl || [];
    return '<pre class="code">' + String(src).split("\n").map(function (line, i) {
      return '<div class="ln' + (hl.indexOf(i + 1) >= 0 ? " hl" : "") + '"><span class="no">' + (i + 1) + "</span><span>" + (esc(line) || " ") + "</span></div>";
    }).join("") + "</pre>";
  }
  /* Time line shown while working: a running clock for this stage, what is left, and today's total. */
  function clock(sec) { sec = Math.floor(sec); var m = Math.floor(sec / 60), x = sec % 60; return (m >= 60 ? Math.floor(m / 60) + ":" + ("0" + (m % 60)).slice(-2) : m) + ":" + ("0" + x).slice(-2); }
  function stripInner(t, stage) {
    var sp = T(t.id).spent[stage] || 0, F = factors(), names = { learn: "This lesson", check: "This check", deepen: "These problems", practice: "Practice here" };
    var h = "<span><b>" + names[stage] + ':</b> <span id="clk">' + clock(sp) + "</span> spent";
    if (stage !== "practice") { var l = leftParts(t)[stage] * F[stage]; h += " · " + (l < 1 ? "done" : "about " + hm(Math.max(1, Math.round(l))) + " left") + " (planned " + hm(stageMin(t, stage)) + ")"; }
    h += "</span>";
    if (stage !== "practice" && !T(t.id).confident) { var tl = leftMine(t); h += "<span><b>Topic:</b> " + (tl < 1 ? "done" : hm(Math.round(tl)) + " left") + "</span>"; }
    var rec = recToday(TOPICS), did = spentOn(today(), true);
    h += "<span><b>Today:</b> " + hm(did) + (rec >= 1 ? " of " + hm(Math.ceil(rec / 5) * 5) + (did >= rec ? ", done" : "") : "") + "</span>";
    return h;
  }
  function timeStrip(t, stage) { return '<p class="timestrip" id="timestrip" data-t="' + t.id + '" data-stage="' + stage + '">' + stripInner(t, stage) + "</p>"; }
  function tabs(t, cur) {
    return '<ul class="tabs" aria-label="Stages">' + STAGES.map(function (st) {
      var ok = has(t, st);
      return '<li><a href="#/t/' + t.id + "/" + st + '"' + (st === cur ? ' aria-current="page"' : "") + (ok ? "" : ' class="off" aria-disabled="true" tabindex="-1"') + ">" + NAMES[st] + "</a></li>";
    }).join("") + "</ul>";
  }
  function crumb(t, stage) {
    return '<p class="crumb"><a href="#/">Course map</a> / <a href="#/t/' + t.id + '">' + esc(t.title) + "</a>" + (stage ? " / " + NAMES[stage] : "") + "</p>";
  }

  /* A quiet line of links to the official lecture materials. They open in a new tab. */
  function sources(t, lead) {
    var k = (C.links || {})[t.id]; if (!k) return "";
    var parts = [["video", "Lecture videos"], ["slides", "Slides"], ["page", "Lecture page"]].filter(function (p) { return k[p[0]]; }).map(function (p) {
      return '<a href="' + esc(k[p[0]]) + '" target="_blank" rel="noopener" title="Opens in a new tab">' + p[1] + '<span aria-hidden="true"> \u2197</span><span class="sr"> (opens in a new tab)</span></a>';
    });
    return parts.length ? '<p class="sources"><span>' + esc(lead) + "</span>" + parts.join("") + "</p>" : "";
  }

  /* A question (multiple choice or typed). `a` is the saved answer, if any. */
  function questionHTML(q, a, ctx, n) {
    var h = '<p class="q">' + esc(q.q) + "</p>";
    if (q.type === "mc") {
      h += '<div class="choices">' + q.choices.map(function (c, i) {
        var cls = "choice";
        if (a) { if (i === q.answer) cls += " right"; else if (a.picked === i) cls += " wrong"; }
        return '<button type="button" class="' + cls + '" data-act="pick" data-ctx="' + ctx + '" data-n="' + n + '" data-i="' + i + '"' + (a ? " disabled" : "") + ">" + esc(c) + "</button>";
      }).join("") + "</div>";
    } else {
      h += '<form class="typed" data-act="typed" data-ctx="' + ctx + '" data-n="' + n + '">' +
        '<input aria-label="Your answer" autocomplete="off" spellcheck="false" value="' + esc(a && a.picked != null ? a.picked : "") + '"' + (a ? " disabled" : "") + ">" +
        (a ? "" : '<button class="btn small primary" type="submit">Check</button><button class="btn small quiet" type="button" data-act="giveup" data-ctx="' + ctx + '" data-n="' + n + '">Show answer</button>') + "</form>";
    }
    if (a) {
      /* Result, then the explanation behind a toggle, and a Reset to answer it again. */
      h += '<div class="fbrow"><p class="fb">' + (a.ok ? '<b class="good">Correct.</b>' : '<b class="miss">' + (a.gave ? "Answer: " : "Not quite. Answer: ") + esc(q.type === "mc" ? q.choices[q.answer] : q.answer) + ".</b>") + "</p>" +
        '<button type="button" class="linkbtn" data-act="resetq" data-ctx="' + ctx + '" data-n="' + n + '">Reset</button></div>' +
        (q.why ? '<details class="why"' + (S.whyOpen ? " open" : "") + '><summary>Show explanation</summary><p>' + esc(q.why) + "</p></details>" : "");
    }
    return h;
  }
  function grade(q, picked) { return q.type === "mc" ? picked === q.answer : norm(picked) === norm(q.answer); }

  /* ---------- which unit is open: yours to choose, else the one you are working in ---------- */
  function unitOfTopic(id) { for (var i = 0; i < C.units.length; i++) if (C.units[i].topics.some(function (t) { return t.id === id; })) return i; return -1; }
  function currentUnit() {
    var m = /#\/t\/([^/]+)/.exec(S.last || ""), u = m ? unitOfTopic(m[1]) : -1;
    if (u >= 0) return u;
    for (var i = 0; i < C.units.length; i++) if (C.units[i].topics.some(function (t) { return !(S.topics[t.id] || {}).confident; })) return i;
    return 0;
  }
  function unitOpen(ui) { var o = S.unitOpen || {}; return ui in o ? !!o[ui] : ui === currentUnit(); }
  function confCount(u) { var n = u.topics.filter(function (t) { return (S.topics[t.id] || {}).confident; }).length; return n + " of " + u.topics.length + " confident"; }

  /* ---------- left sidebar: every unit and topic, and the stages of the topic you are on ---------- */
  var side = document.getElementById("side");
  function renderSide() {
    if (!side) return;
    var r = route(), here = r[0] === "t" ? r[1] : "", stage = r[2] || "", hu = here ? unitOfTopic(here) : -1, so = S.sideOpen || {};
    var h = '<nav aria-label="Course contents"><ul class="sd-top"><li><a href="#/"' + (!r.length ? ' aria-current="page"' : "") + '>Course map</a></li><li><a href="#/progress"' + (r[0] === "progress" ? ' aria-current="page"' : "") + ">Progress</a></li></ul>";
    C.units.forEach(function (u, ui) {
      var open = ui in so ? !!so[ui] : (hu >= 0 ? ui === hu : ui === currentUnit());
      if (ui === hu && !(ui in so)) open = true;
      h += '<details class="sd-unit" data-sui="' + ui + '"' + (open ? " open" : "") + '><summary><span class="sd-n">' + (ui + 1) + '</span><span class="sd-t">' + esc(u.title) + '</span><small>' + u.topics.filter(function (t) { return (S.topics[t.id] || {}).confident; }).length + "/" + u.topics.length + "</small></summary><ul>" +
        u.topics.map(function (t) {
          var cv = confOf(t.id), on = t.id === here, mark = cv ? icon(cv) : '<span class="sd-dot' + (started(t) ? " started" : "") + '" aria-hidden="true"></span>';
          var x = '<li><a href="#/t/' + t.id + '"' + (on && !stage ? ' aria-current="page"' : on ? ' aria-current="true"' : "") + ">" + mark + '<span class="sd-tt">' + esc(t.title) + "</span>" + ((S.topics[t.id] || {}).flag ? '<span class="sd-flag" aria-label="flagged">' + FLAG + "</span>" : "") + "</a>";
          if (on) x += '<ul class="sd-stages">' + STAGES.filter(function (st) { return has(t, st); }).map(function (st) { return '<li><a href="#/t/' + t.id + "/" + st + '"' + (st === stage ? ' aria-current="page"' : "") + ">" + NAMES[st] + (stageDone(t, st) ? ' <span class="sd-ok" aria-label="done">\u2713</span>' : "") + "</a></li>"; }).join("") + "</ul>";
          return x + "</li>";
        }).join("") + "</ul></details>";
    });
    var keep = side.scrollTop;
    side.innerHTML = h + "</nav>";
    side.scrollTop = keep;
    var a = side.querySelector('a[aria-current="page"], a[aria-current="true"]');
    if (a && (a.offsetTop < side.scrollTop || a.offsetTop > side.scrollTop + side.clientHeight - 40)) side.scrollTop = a.offsetTop - side.clientHeight / 3;
  }
  /* Opening or closing a unit, on the map or in the sidebar, is remembered. */
  document.addEventListener("toggle", function (e) {
    var d = e.target; if (!d || d.tagName !== "DETAILS") return;
    if (d.classList.contains("why") && e.isTrusted) { S.whyOpen = d.open; saveSoon(); }
    if (d.hasAttribute("data-ui")) { S.unitOpen = S.unitOpen || {}; S.unitOpen[d.getAttribute("data-ui")] = d.open; saveSoon(); }
    if (d.hasAttribute("data-sui")) { S.sideOpen = S.sideOpen || {}; S.sideOpen[d.getAttribute("data-sui")] = d.open; saveSoon(); }
  }, true);
  /* Phones and narrow windows: the sidebar slides in from the left. */
  function sideOpen(v) { document.body.classList.toggle("side-open", v); var b = document.getElementById("sideBtn"); if (b) b.setAttribute("aria-expanded", v); if (v && side) { var f = side.querySelector("a"); if (f) f.focus(); } }
  (function () {
    var b = document.getElementById("sideBtn"), scrim = document.getElementById("sideScrim");
    if (b) b.addEventListener("click", function () { sideOpen(!document.body.classList.contains("side-open")); });
    if (scrim) scrim.addEventListener("click", function () { sideOpen(false); });
    if (side) side.addEventListener("click", function (e) { if (e.target.closest("a")) sideOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("side-open")) { sideOpen(false); if (b) b.focus(); } });
    var bar = document.querySelector(".appbar");
    function barH() { if (bar) document.documentElement.style.setProperty("--barh", bar.offsetHeight + "px"); }
    barH(); window.addEventListener("resize", barH);
  })();

  /* ---------- course map ---------- */
  var levelOpen = false, dateOpen = false, goalOpen = false;
  function renderMap() {
    var lv = level(), h = "";
    h += '<div class="maphead"><p class="eyebrow">Learn, check, deepen, practice</p><h1>CS 61A</h1>' +
      '<p class="lede">Work through the course one topic at a time. Each topic starts with a step-through lesson, then quick questions, then exam-style problems that run real Python, Gleam and SQL in your browser. Skip around whenever you like. Your progress is saved in this browser.</p>' +
      timeBar(shownTopics()) + '</div>';

    if (!S.level || levelOpen) {
      h += '<form class="level" data-act="level"><h2>Where are you starting from?</h2><div class="opts">' + C.levels.map(function (l) {
        return '<label><input type="radio" name="level" value="' + l.id + '"' + (l.id === lv ? " checked" : "") + "><span>" + esc(l.label) + "</span><small>" + esc(l.desc) + "</small></label>";
      }).join("") + '</div><button class="btn primary" type="submit">' + (S.level ? "Save" : "Start") + "</button></form>";
    } else {
      var cur = C.levels.filter(function (l) { return l.id === lv; })[0];
      h += '<p class="levelline">Starting level: <strong>' + esc(cur.label) + '</strong><button type="button" class="linkbtn" data-act="levelopen">Change</button></p>';
    }

    h += '<div class="filters" role="group" aria-label="Show units for">' + [""].concat(EXAMS).map(function (x) {
      return '<button type="button" class="fchip' + ((S.filter || "") === x ? " on" : "") + '" data-act="filter" data-x="' + esc(x) + '" aria-pressed="' + ((S.filter || "") === x) + '">' + (x ? esc(filterName(x)) : "Everything") + "</button>";
    }).join("") + "</div>" + reviewHTML() +
      '<div class="unitctl"><button type="button" class="linkbtn" data-act="units" data-x="1">Expand all units</button><button type="button" class="linkbtn" data-act="units" data-x="0">Collapse all</button></div>';

    shownUnits().forEach(function (u) { var ui = C.units.indexOf(u);
      h += '<details class="unit" data-ui="' + ui + '"' + (unitOpen(ui) ? " open" : "") + '><summary><h2>' + esc(u.title) + '<span class="uconf">' + confCount(u) + "</span><small>Unit " + (ui + 1) + (u.exam ? " · for " + esc(u.exam) : "") + " · " + dur(sumMin(u.topics)) + " · " + leftText(sumMine(u.topics)) + (factors().known && sumMine(u.topics) >= 2.5 ? " at your pace" : "") + '</small></h2></summary><ul class="topics">' + u.topics.map(function (t) {
        var s = T(t.id), dot = s.confident ? "done" : started(t) ? "started" : "";
        var chips = "";
        if (confOf(t.id)) chips += confChip(t.id);
        else if (started(t)) chips += '<span class="chip go">In progress</span>';
        if ((t.testOut || []).indexOf(lv) >= 0 && !s.confident) chips += '<span class="chip info">Optional at your level</span>';
        chips += '<span class="chip">' + (has(t, "learn") ? (has(t, "practice") ? "Lesson and practice" : "Lesson ready") : has(t, "practice") ? "Practice only" : "Coming soon") + "</span>";
        return '<li><a class="topic" href="#/t/' + t.id + '"><span class="dot ' + dot + '" aria-hidden="true"></span><span class="txt"><h3>' + esc(t.title) + "</h3><p>" + esc(t.blurb) + '</p><p class="meta">' + (t.lecture ? "Lecture " + t.lecture + " · " : "") + dur(topicMin(t)) + (started(t) ? " · " + leftText(leftMine(t)) : "") + (allSpent(t) >= 1 ? " · " + Math.round(allSpent(t)) + " min spent" : "") + '</p></span><span class="chips">' + (s.flag ? '<span class="chip flag">Flagged</span>' : "") + chips + "</span></a></li>";
      }).join("") + "</ul></details>";
    });
    view.innerHTML = h;
  }

  /* ---------- progress page: charts built as plain SVG ---------- */
  function hm(m) { m = Math.round(m); return m < 60 ? m + " min" : Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " min" : ""); }
  function shortDay(k) { return fromIso(k).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
  /* One row per calendar day from the first logged day to today (or to the day before the exam). */
  function dayRows(days, examIso) {
    var keys = Object.keys(days).sort(); if (!keys.length) return [];
    var rows = [], d = fromIso(keys[0]), end = fromIso(today()), last = null, t = today();
    if (examIso) { var ex = fromIso(examIso); ex.setDate(ex.getDate() - 1); if (ex > end && (ex - end) / 86400000 <= 120) end = ex; }
    if ((end - d) / 86400000 > 200) { d = new Date(end); d.setDate(d.getDate() - 200); }
    for (; d <= end; d.setDate(d.getDate() + 1)) {
      var k = iso(d), r = days[k] || {}, sp = r.sp || {}, est = r.est || {}, future = k > t;
      var core = ((sp.learn || 0) + (sp.check || 0) + (sp.deepen || 0)) / 60, e = (est.learn || 0) + (est.check || 0) + (est.deepen || 0);
      if (r.left != null) last = r.left;
      rows.push({ k: k, future: future, rec: future || r.rec == null ? null : r.rec, spent: future ? null : core + (sp.practice || 0) / 60, done: future ? null : e, left: future ? null : last, speed: !future && e >= 5 && core > 0 ? core / e : null });
    }
    return rows;
  }
  function niceMax(v) { if (v <= 0) return 1; var p = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 3 ? 3 : f <= 4 ? 4 : f <= 5 ? 5 : f <= 8 ? 8 : 10) * p; }
  /* kind "line" or "bar". pts: [{label, v (null to skip), tip}]. opt: {max, fmt, ref:{v,label}, target:[{i,v}], targetLabel} */
  function chartSVG(kind, pts, opt) {
    var W = 720, H = 240, ml = 52, mr = 18, mt = 14, mb = 30, pw = W - ml - mr, ph = H - mt - mb, n = pts.length;
    var vals = pts.filter(function (p) { return p.v != null; }).map(function (p) { return p.v; }).concat(opt.ref ? [opt.ref.v] : []).concat((opt.target || []).map(function (q) { return q.v; })).concat((opt.marks || []).filter(function (v) { return v != null; }));
    var max = opt.max || niceMax(Math.max.apply(null, vals.concat([0.0001])) * 1.05), step = pw / Math.max(1, kind === "bar" ? n : n - 1);
    var X = function (i) { return ml + (kind === "bar" ? (i + 0.5) * step : n === 1 ? pw / 2 : i * step); }, Y = function (v) { return mt + ph - (v / max) * ph; };
    var g = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opt.aria) + '">';
    for (var i = 0; i <= 4; i++) { var gv = max * i / 4, gy = Y(gv); g += '<line class="grid" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + gy + '" y2="' + gy + '"/><text class="ax" x="' + (ml - 8) + '" y="' + (gy + 4) + '" text-anchor="end">' + esc(opt.fmt(gv)) + "</text>"; }
    var every = Math.max(1, Math.ceil(n / 8));
    pts.forEach(function (p, i) { if (i % every === 0 || i === n - 1 && n - 1 - Math.floor((n - 1) / every) * every > every / 2) g += '<text class="ax" x="' + X(i) + '" y="' + (H - 9) + '" text-anchor="middle">' + esc(p.label) + "</text>"; });
    if (opt.ref) { var ry = Y(opt.ref.v); g += '<line class="ref" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + ry + '" y2="' + ry + '"/><text class="ax" x="' + (ml + 6) + '" y="' + (ry + 15) + '" text-anchor="start">' + esc(opt.ref.label) + "</text>"; }
    if (opt.target && opt.target.length === 2) { var a = opt.target[0], b = opt.target[1]; g += '<line class="ref" x1="' + X(a.i) + '" y1="' + Y(a.v) + '" x2="' + X(b.i) + '" y2="' + Y(b.v) + '"/><text class="ax" x="' + ((X(a.i) + X(b.i)) / 2 + 10) + '" y="' + ((Y(a.v) + Y(b.v)) / 2 - 10) + '" text-anchor="start">' + esc(opt.targetLabel) + "</text>"; }
    if (kind === "bar") {
      var bw = Math.max(3, Math.min(34, step - 4));
      pts.forEach(function (p, i) { if (p.v > 0) { var y = Y(p.v), hgt = mt + ph - y, r = Math.min(4, bw / 2, hgt); g += '<path class="mark" d="M' + (X(i) - bw / 2) + " " + (mt + ph) + "V" + (y + r) + "q0 " + (-r) + " " + r + " " + (-r) + "h" + (bw - 2 * r) + "q" + r + " 0 " + r + " " + r + "V" + (mt + ph) + 'z"/>'; } });
      (opt.marks || []).forEach(function (v, i) { if (v != null) g += '<line class="tick" x1="' + (X(i) - bw / 2 - 4) + '" x2="' + (X(i) + bw / 2 + 4) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/>'; });
    } else {
      var path = "", pen = false;
      pts.forEach(function (p, i) { if (p.v == null) return; path += (pen ? "L" : "M") + X(i) + " " + Y(p.v); pen = true; });
      g += '<path class="linemark" d="' + path + '"/>';
      var shown = pts.filter(function (p) { return p.v != null; }).length;
      pts.forEach(function (p, i) { if (p.v != null && (shown <= 40 || i === n - 1)) g += '<circle class="dotmark" cx="' + X(i) + '" cy="' + Y(p.v) + '" r="4"/>'; });
    }
    pts.forEach(function (p, i) { if (p.tip) g += '<rect class="hit" tabindex="0" x="' + (X(i) - step / 2) + '" y="' + mt + '" width="' + step + '" height="' + ph + '" data-tip="' + esc(p.tip) + '" aria-label="' + esc(p.tip) + '"/>'; });
    return g + '<line class="base" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + (mt + ph) + '" y2="' + (mt + ph) + '"/></svg>';
  }
  function exampleDays() {
    var o = {}, d = new Date(), left = 1850, plan = [[40, 30], [0, 0], [65, 55], [50, 50], [30, 20], [0, 0], [75, 70], [45, 45], [60, 62], [20, 15], [55, 60], [70, 75], [35, 38], [50, 55]];
    d.setDate(d.getDate() - plan.length + 1);
    plan.forEach(function (p) { left -= p[1]; o[iso(d)] = { rec: 50, sp: { learn: p[0] * 24, check: p[0] * 6, deepen: p[0] * 30 }, est: { learn: p[1] * 0.4, check: p[1] * 0.1, deepen: p[1] * 0.5 }, left: left }; d.setDate(d.getDate() + 1); });
    return o;
  }
  function renderProgress() {
    var real = S.days || {}, hasReal = Object.keys(real).some(function (k) { var sp = real[k].sp || {}; return (sp.learn || 0) + (sp.check || 0) + (sp.deepen || 0) + (sp.practice || 0) >= 60; });
    var example = !hasReal && !S.noProgExample, days = hasReal ? real : example ? exampleDays() : {};
    var h = '<nav class="crumb" aria-label="Breadcrumb"><a href="#/">Course map</a> / Progress</nav><h1>Progress</h1><p class="lede">What you have done each day, how long it took, and how that compares with the estimates. Recorded in this browser from the day you started using this page.</p>';
    if (!hasReal && !example) { view.innerHTML = h + '<p class="empty">Nothing recorded yet. Open a lesson or a problem and work for a minute, then come back.</p>'; return; }
    if (example) h += '<p class="banner wait" style="margin-top:18px">This is example data, so you can see what the page looks like. Your own replaces it as soon as you have studied for a minute. <button type="button" class="linkbtn" data-act="hideprogexample">Remove example</button></p>';
    var rows = dayRows(days, example ? "" : S.examDate), past = rows.filter(function (r) { return !r.future; });
    var total = past.reduce(function (a, r) { return a + r.spent; }, 0), active = past.filter(function (r) { return r.spent >= 1; }).length, doneEst = past.reduce(function (a, r) { return a + r.done; }, 0);
    var week = past.slice(-7), avg = week.reduce(function (a, r) { return a + r.spent; }, 0) / Math.max(1, week.length);
    var F = example ? { known: true, all: total / Math.max(1, doneEst), learn: 1, check: 1, deepen: 1, own: {} } : factors(), left = example ? past[past.length - 1].left : sumMine(TOPICS);
    var speedTxt = F.known ? (Math.round(F.all * 100) / 100) + "x" : "not yet";
    var tile = function (v, l) { return "<div><strong>" + esc(v) + "</strong><span>" + esc(l) + "</span></div>"; };
    h += '<div class="tiles">' + tile(hm(total), "studied in total") + tile(active + " of " + past.length, "days studied") + tile(hm(avg), "a day, last " + week.length + " day" + (week.length === 1 ? "" : "s")) + tile(speedTxt, "your time vs the estimates") + "</div>";
    if (left >= 5 && avg >= 1) {
      var need = Math.ceil(left / avg), fin = new Date(); fin.setDate(fin.getDate() + need - 1);
      var msg = "At that daily average you finish the course on " + fin.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) + ".", du = example ? null : daysUntil(S.examDate);
      if (du !== null && du > 0) msg += need <= du ? " That is " + (du - need === 0 ? "the day before" : (du - need + 1) + " days before") + " your exam." : " That is " + (need - du) + " day" + (need - du === 1 ? "" : "s") + " too late for your exam, so the daily time needs to go up to " + dur(left / du).replace("about ", "") + ".";
      h += '<p class="pace" style="margin:14px 0 0">' + esc(msg) + "</p>";
    }
    var trk = example ? { state: "on", text: "On track. Your average of 48 min a day gets you there in time." } : track(TOPICS);
    if (trk) h += '<p class="pace" style="margin:12px 0 0"><span class="chip trk ' + trk.state + '">' + TRACK[trk.state] + "</span> " + esc(trk.text.replace(/^(Ahead|On track|Behind)\. /, "")) + "</p>";
    else h += '<p class="meta" style="margin-top:12px">Set an exam date on the course map to see whether you are on track.</p>';
    if (!example && F.known) h += '<p class="meta" style="margin-top:10px">Speed by kind of work: lessons ' + (F.own.learn ? F.learn.toFixed(2) + "x" : "not enough yet") + " · checks " + (F.own.check ? F.check.toFixed(2) + "x" : "not enough yet") + " · problems " + (F.own.deepen ? F.deepen.toFixed(2) + "x" : "not enough yet") + ". 1x means exactly the estimate. Recent days count more.</p>";

    var lab = function (r) { return shortDay(r.k); };
    var burn = rows.map(function (r) { return { label: lab(r), v: r.left == null ? null : r.left / 60, tip: r.left == null ? "" : lab(r) + ": " + hm(r.left) + " of course left" }; });
    var bopt = { fmt: function (v) { return (Math.round(v * 10) / 10) + " h"; }, aria: "Estimated hours of course left, by day" };
    var firstLeft = null; rows.forEach(function (r) { if (firstLeft === null && r.left != null) firstLeft = r.left + r.done; });
    if (!example && S.examDate && rows.length > 1 && rows[rows.length - 1].future && firstLeft) { bopt.target = [{ i: 0, v: firstLeft / 60 }, { i: rows.length - 1, v: 0 }]; bopt.targetLabel = "on track for your exam"; }
    h += '<section class="chartbox"><h2>Course time left</h2><p class="meta">Estimated hours still to do, at the end of each day. Marking a topic confident also brings this down.</p>' + chartSVG("line", burn, bopt) + "</section>";
    h += '<section class="chartbox"><h2>Time studied each day</h2><p class="meta">Minutes with a lesson, check or problem open and in use, practice included. The short line over each day is the time recommended for that day.</p>' +
      '<p class="legend"><span><i class="sw bar"></i>studied</span><span><i class="sw tk"></i>recommended</span></p>' +
      chartSVG("bar", past.map(function (r) { return { label: lab(r), v: r.spent, tip: lab(r) + ": " + hm(r.spent) + " studied" + (r.rec != null ? ", " + hm(r.rec) + " recommended" : "") }; }), { marks: past.map(function (r) { return r.rec; }), fmt: function (v) { return Math.round(v) + " min"; }, aria: "Minutes studied each day" }) + "</section>";
    var sp = past.map(function (r) { return { label: lab(r), v: r.speed, tip: r.speed == null ? "" : lab(r) + ": " + r.speed.toFixed(2) + "x the estimate (" + hm(r.spent) + " for " + hm(r.done) + " of estimated work)" }; });
    h += '<section class="chartbox"><h2>Your speed</h2><p class="meta">Time you took divided by the estimate for the work you finished that day. Below the dashed line is faster than estimated. Days with under 5 minutes of finished work are left out.</p>' +
      (sp.some(function (p) { return p.v != null; }) ? chartSVG("line", sp, { fmt: function (v) { return (Math.round(v * 100) / 100) + "x"; }, ref: { v: 1, label: "as estimated" }, aria: "Your time divided by the estimate, by day" }) : '<p class="empty">Shows up once you finish at least 5 estimated minutes of work in a day.</p>') + "</section>";
    h += '<details class="reveal"><summary>Show as a table</summary><div class="tblwrap"><table class="tbl"><thead><tr><th>Day</th><th>Studied</th><th>Recommended</th><th>Estimated work finished</th><th>Speed</th><th>Course left</th></tr></thead><tbody>' +
      past.slice().reverse().map(function (r) { return "<tr><td>" + esc(lab(r)) + "</td><td>" + hm(r.spent) + "</td><td>" + (r.rec == null ? "" : hm(r.rec)) + "</td><td>" + hm(r.done) + "</td><td>" + (r.speed == null ? "" : r.speed.toFixed(2) + "x") + "</td><td>" + (r.left == null ? "" : hm(r.left)) + "</td></tr>"; }).join("") + "</tbody></table></div></details>";
    view.innerHTML = h + '<div class="tip" id="tip" hidden></div>';
  }
  function tipFor(el) {
    var tip = document.getElementById("tip"); if (!tip) return;
    if (!el) { tip.hidden = true; return; }
    tip.textContent = el.getAttribute("data-tip"); tip.hidden = false;
    var b = el.getBoundingClientRect(), w = tip.offsetWidth;
    tip.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, b.left + b.width / 2 - w / 2)) + window.scrollX + "px";
    tip.style.top = b.top + window.scrollY - tip.offsetHeight - 6 + "px";
  }
  view.addEventListener("pointerover", function (e) { if (e.target.classList && e.target.classList.contains("hit")) tipFor(e.target); });
  view.addEventListener("pointerout", function (e) { if (e.target.classList && e.target.classList.contains("hit")) tipFor(null); });
  view.addEventListener("focusin", function (e) { if (e.target.classList && e.target.classList.contains("hit")) tipFor(e.target); });
  view.addEventListener("focusout", function (e) { if (e.target.classList && e.target.classList.contains("hit")) tipFor(null); });

  /* ---------- topic page ---------- */
  function renderTopic(t) {
    var s = T(t.id), l = L[t.id], nx = nextTopic(t);
    var desc = {
      learn: l ? "A step-through lesson with questions along the way. " + cap(dur(stageMin(t, "learn"))) + "." : "The lesson for this topic is not written yet.",
      check: has(t, "check") ? items(t, "check").length + " quick questions to see if the lesson stuck. " + cap(dur(stageMin(t, "check"))) + "." : "Quick questions arrive with the lesson.",
      deepen: has(t, "deepen") ? items(t, "deepen").length + " exam-style problems. " + (items(t, "deepen")[0].norun ? "Write the code, then compare with the solution. " : "Write the code, run it, submit it. ") + cap(dur(stageMin(t, "deepen"))) + "." : "Exam-style problems arrive with the lesson.",
      practice: has(t, "practice") ? items(t, "practice").length + " past exam problems, " + dur(stageMin(t, "practice")) + " each. Keep going until you feel confident." : "No practice problems for this topic yet."
    };
    var first = level() === "review" ? "check" : "learn", suggested = null;
    STAGES.slice(STAGES.indexOf(first)).concat(STAGES).forEach(function (st) { if (!suggested && has(t, st) && !stageDone(t, st)) suggested = st; });
    var h = crumb(t) + '<p class="eyebrow">' + esc(t.unit || "") + "</p><h1>" + esc(t.title) + '</h1><p class="lede">' + esc(t.blurb) + '</p><p class="meta" style="margin-top:14px">' + (t.lecture ? "Lecture " + t.lecture + " · " : "") +
      (l ? cap(dur(topicMin(t))) + " for the lesson, check and exam-style problems" + (started(t) ? " · " + leftText(leftMine(t)) : "") + (allSpent(t) >= 1 ? " · you have spent " + Math.round(allSpent(t)) + " min" : "") : "Planned: " + dur(topicMin(t))) + (has(t, "practice") ? " · Practice is extra" : "") + "</p>" + sources(t, "From the course" + (t.lecture ? ", Lecture " + t.lecture : "") + ":") + '<ol class="stages">';
    STAGES.forEach(function (st) {
      var ok = has(t, st), done = stageDone(t, st), label = "Start";
      if (st === "learn" && ok) label = s.lessonDone ? "Replay" : s.step ? "Continue" : "Start";
      if (st === "check" && ok) label = done ? "Review" : Object.keys(s.check).length ? "Continue" : "Start";
      if ((st === "deepen" || st === "practice") && ok) { var k = solvedCount(t, st); label = k ? "Continue (" + k + " of " + items(t, st).length + " solved)" : "Start"; }
      h += '<li class="stage' + (done ? " done" : "") + '"><div><h2>' + NAMES[st] + "</h2><p>" + esc(desc[st]) + '</p></div><div class="act">' +
        (ok ? '<a class="btn small' + (st === suggested ? " primary" : "") + '" href="#/t/' + t.id + "/" + st + '">' + label + "</a>" : '<span class="chip">Coming soon</span>') + "</div></li>";
    });
    h += "</ol>" + confBar(t, "topic") + confHistory(t) + '<div class="finish">' +
      (nx ? '<a class="btn small" href="#/t/' + nx.id + '">Next topic: ' + esc(nx.title) + "</a>" : "") + "</div>";
    view.innerHTML = h;
  }

  /* ---------- lesson player ---------- */
  var canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  /* Read aloud reads the step one sentence at a time, so you can pause, and go back or
     forward a sentence. Past the last sentence it moves to the next step and keeps reading;
     before the first, back to the previous step. */
  var NAR = { sents: [], i: 0, playing: false, tok: 0, done: false };
  function sentences(text) { return (String(text).match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)["')\]]*\s*/g) || [String(text)]).map(function (x) { return x.trim(); }).filter(Boolean); }
  function hush() { NAR.tok++; NAR.playing = false; if (canSpeak) window.speechSynthesis.cancel(); }
  function narUI() {
    var box = document.getElementById("narbox"); if (!box) return;
    box.querySelectorAll(".sent").forEach(function (el, k) { el.classList.toggle("now", S.narrate && k === NAR.i); });
    var pb = document.getElementById("nplay"); if (pb) { pb.innerHTML = NAR.playing ? '<span aria-hidden="true">\u23F8</span> Pause' : '<span aria-hidden="true">\u25B6</span> ' + (NAR.done ? "Replay" : NAR.i ? "Resume" : "Play"); pb.setAttribute("aria-pressed", NAR.playing); }
    var c = document.getElementById("ncount"); if (c) c.textContent = "Sentence " + (NAR.i + 1) + " of " + NAR.sents.length;
  }
  function speakFrom(i) {
    if (!canSpeak) return;
    hush(); NAR.i = Math.max(0, Math.min(i, NAR.sents.length - 1)); NAR.playing = true; NAR.done = false;
    var tok = NAR.tok, u = new SpeechSynthesisUtterance(NAR.sents[NAR.i]);
    if (S.rate) u.rate = S.rate;
    u.onend = function () {
      if (tok !== NAR.tok) return;
      if (NAR.i < NAR.sents.length - 1) speakFrom(NAR.i + 1);
      else { NAR.playing = false; NAR.done = true; narUI(); }
    };
    window.speechSynthesis.speak(u); narUI();
  }
  function narSetup(text, auto) { hush(); NAR.sents = sentences(text); NAR.i = 0; NAR.done = false; if (auto && S.narrate) speakFrom(0); else narUI(); }
  function narToggle() { if (NAR.playing) { hush(); narUI(); } else speakFrom(NAR.done ? 0 : NAR.i); }
  function narStep(d) {
    var j = NAR.i + d;
    if (j >= NAR.sents.length) { if (document.querySelector('[data-act="next"]:not([disabled])')) { stepBy(1); } return; }
    if (j < 0) { var r = route(), t = topicById(r[1]); if (t && T(t.id).step > 0) stepBy(-1); return; }
    if (NAR.playing) speakFrom(j); else { NAR.i = j; NAR.done = false; narUI(); }
  }
  function speak(text) { narSetup(text, true); }

  function renderLearn(t, quiet) {
    var l = L[t.id], s = T(t.id), n = l.steps.length;
    if (s.step > n - 1) s.step = n - 1;
    var i = s.step, st = l.steps[i], lv = level(), a = s.asks[i], last = i === n - 1;
    if (last && !s.lessonDone) { s.lessonDone = true; save(); }
    var blocked = st.ask && !a;
    var h = crumb(t, "learn") + tabs(t, "learn") + timeStrip(t, "learn") + confBar(t, "the lesson") + '<div class="player"><div class="bar2"><i style="width:' + Math.round((i + 1) / n * 100) + '%"></i></div><div class="stagegrid">' +
      codeHTML(l.snippets[st.code] || "", st.hl) + '<div class="side">';
    if (st.stack) {
      h += "<div><h4>Calls in progress</h4><div class=\"frames\">" + st.stack.map(function (f, k) {
        var top = k === st.stack.length - 1;
        return '<div class="frame' + (f.done ? " done" : top ? " top" : "") + '"><span>' + esc(f.call) + " &nbsp; " + esc(f.vars) + "</span><small>" + esc(f.state) + "</small></div>";
      }).join("") + "</div></div>";
    }
    if (st.frames) {
      h += '<div><h4>Environment diagram</h4><div class="envd">' + st.frames.map(function (f) {
        return '<div class="fr' + (f.active ? " active" : "") + '"><p class="frt">' + esc(f.title) + "</p>" +
          f.vars.map(function (p) { return '<p class="bind"><span>' + esc(p[0]) + "</span><span>" + esc(p[1]) + "</span></p>"; }).join("") +
          (f.ret != null ? '<p class="bind ret"><span>Return value</span><span>' + esc(f.ret) + "</span></p>" : "") +
          (!f.vars.length && f.ret == null ? '<p class="bind none"><span>(no names yet)</span></p>' : "") + "</div>";
      }).join("") + "</div></div>";
    }
    if (st.tables) st.tables.forEach(function (t) { h += "<div><h4>" + esc(t.name) + "</h4>" + tableHTML(t.cols, t.rows) + "</div>"; });
    if (st.tree) h += '<div><h4>' + esc(st.treeTitle || "Call tree") + '</h4><pre class="out tree">' + esc(st.tree.join("\n")) + "</pre></div>";
    if (st.env) h += '<div><h4>Names</h4><div class="names">' + st.env.map(function (p) { return '<div class="frame"><span>' + esc(p[0]) + "</span><small>" + esc(p[1]) + "</small></div>"; }).join("") + "</div></div>";
    if (st.out) h += '<div><h4>Printed</h4><pre class="out">' + esc(st.out.join("\n")) + "</pre></div>";
    if (!st.stack && !st.out && !st.env && !st.frames && !st.tree && !st.tables) h += '<p class="muted" style="font-size:15px">Names, calls and printed output show up here as the code runs.</p>';
    h += '</div></div><div class="narr"><p class="say" id="narbox">' + sentences(st.say).map(function (x) { return '<span class="sent">' + esc(x) + "</span>"; }).join(" ") + "</p>";
    if (st.basics && lv === "new") h += '<p class="note"><b>The basics.</b> ' + esc(st.basics) + "</p>";
    if (st.syntax && (lv === "new" || lv === "programmer")) h += '<p class="note">' + esc(st.syntax).replace(/^Python notes:/, "<b>Python notes.</b>") + "</p>";
    if (st.ask) h += '<div class="ask">' + questionHTML(st.ask, a, "ask", i) + "</div>";
    h += '</div><div class="controls"><span class="count">Step ' + (i + 1) + " of " + n + "</span>" +
      (canSpeak ? '<label class="toggle"><input type="checkbox" data-act="narrate"' + (S.narrate ? " checked" : "") + "> Read aloud</label>" +
        (S.narrate ? '<span class="narctl" role="group" aria-label="Read aloud controls"><button class="btn small quiet" type="button" data-act="nprev" title="Back a sentence"><span aria-hidden="true">\u23EE</span><span class="sr">Back a sentence</span></button>' +
          '<button class="btn small" type="button" id="nplay" data-act="nplay"></button>' +
          '<button class="btn small quiet" type="button" data-act="nnext" title="Forward a sentence"><span aria-hidden="true">\u23ED</span><span class="sr">Forward a sentence</span></button><span class="ncount" id="ncount"></span></span>' : "") : "") +
      '<button class="btn small quiet" type="button" data-act="back"' + (i === 0 ? " disabled" : "") + ">Back</button>" +
      (last ? '<a class="btn small primary" href="#/t/' + t.id + '/check">Go to the check questions</a>'
            : '<button class="btn small primary" type="button" data-act="next"' + (blocked ? ' disabled title="Answer the question to continue"' : "") + ">Next</button>") +
      "</div></div>" + sources(t, "Want the original? Lecture " + t.lecture + ":");
    view.innerHTML = h;
    if (!quiet) speak(st.say); else narUI();
  }

  /* ---------- check ---------- */
  function renderCheck(t) {
    var qs = items(t, "check"), s = T(t.id), nx = nextTopic(t);
    var answered = Object.keys(s.check).length, right = qs.filter(function (q, i) { return s.check[i] && s.check[i].ok; }).length;
    var h = crumb(t, "check") + tabs(t, "check") + timeStrip(t, "check") + confBar(t, "the check") + "<h1>Check</h1><p class=\"lede\" style=\"margin-bottom:24px\">Answer each one, then read the explanation. Nothing here is graded.</p>";
    qs.forEach(function (q, i) {
      h += '<div class="qcard"><p class="num">Question ' + (i + 1) + " of " + qs.length + "</p>" + (q.code ? codeHTML(q.code) : "") + questionHTML(q, s.check[i], "check", i) + "</div>";
    });
    h += '<div class="score"><strong>' + (answered < qs.length ? answered + " of " + qs.length + " answered" : right + " of " + qs.length + " correct") + '</strong><div class="row">' +
      (answered ? '<button class="btn small quiet" type="button" data-act="recheck">Try again</button>' : "") +
      (has(t, "deepen") ? '<a class="btn small' + (answered >= qs.length ? " primary" : "") + '" href="#/t/' + t.id + '/deepen">Deepen with exam-style problems</a>' : "") +
      (nx ? '<a class="btn small" href="#/t/' + nx.id + '">Next topic</a>' : "") + "</div></div>";
    if (answered >= qs.length && right < qs.length - 1) h += '<p class="muted">Missed a few? <a href="#/t/' + t.id + '/learn">Replay the lesson</a> and try again.</p>';
    view.innerHTML = h;
  }

  /* ---------- deepen and practice (real Python) ---------- */
  var cur = null; // { t, stage, p }
  /* The function or class whose docstring holds the examples: the first top-level
     def or class that is followed by a docstring. A problem can name it with `target`. */
  function fnName(p) {
    if (p.target) return p.target;
    var m = /^(?:def|class)\s+(\w+)[^\n]*\n\s+(?:"""|\x27\x27\x27)/m.exec(p.starter) || /^(?:def|class)\s+(\w+)/m.exec(p.starter);
    return m ? m[1] : "";
  }
  function renderWork(t, stage, pid) {
    var list = items(t, stage), s = T(t.id);
    var p = list.filter(function (x) { return x.id === pid; })[0] || list.filter(function (x) { return !s.solved[x.id]; })[0] || list[0];
    cur = { t: t, stage: stage, p: p };
    var intro = stage === "deepen" ? "Exam-style problems on this topic. Try each one before opening a hint."
      : "Past exam problems. Do as many as you need, then mark the topic confident.";
    var h = crumb(t, stage) + tabs(t, stage) + timeStrip(t, stage) + confBar(t, stage === "deepen" ? "deepen" : "practice") + "<h1>" + NAMES[stage] + '</h1><p class="lede" style="margin-bottom:24px">' + intro + '</p><div class="work"><ul class="plist" aria-label="Problems">' +
      list.map(function (x, i) {
        return '<li><a href="#/t/' + t.id + "/" + stage + "/" + x.id + '"' + (x === p ? ' aria-current="true"' : "") + '><span class="tick' + (s.solved[x.id] ? " yes" : "") + '" aria-hidden="true"></span>' + (i + 1) + ". " + esc(x.title) + (s.solved[x.id] ? '<span class="muted"> (solved)</span>' : "") + "</a></li>";
      }).join("") + '</ul><div class="prob"><h2>' + esc(p.title) + '</h2><p class="src">' + esc(p.source || "") +
      (p.exam ? ' · <a href="' + esc(p.exam) + '" target="_blank" rel="noopener">exam PDF (opens in a new tab)</a>' : "") + "</p><p>" + esc(p.desc) + "</p>" +
      (p.sql && p.sql.tables ? '<details class="reveal" style="margin:0 0 12px"><summary>Show the tables</summary>' + p.sql.tables.map(function (t) { return '<h4 class="tblh">' + esc(t.name) + "</h4>" + tableHTML(t.cols, t.rows); }).join("") + "</details>" : "") +
      '<textarea class="editor" id="editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Your ' + esc(p.lang || "Python") + ' code">' + esc(S.code[p.id] != null ? S.code[p.id] : p.starter) + "</textarea>" +
      '<div class="row" style="margin-top:12px">' + (p.norun
        ? '<button class="btn small primary" type="button" data-act="reveal">Compare with the solution</button>'
        : '<button class="btn small" type="button" data-act="run">' + (p.sql ? "Run the query" : "Run the examples") + '</button><button class="btn small primary" type="button" data-act="submit">Submit</button>') +
      (p.hints ? '<button class="btn small quiet" type="button" data-act="hint">Hint</button>' : "") +
      '<button class="btn small quiet" type="button" data-act="resetp">Start over</button><button class="btn small quiet" type="button" data-act="flagp" aria-pressed="' + !!s.flags[p.id] + '">' + (s.flags[p.id] ? "Flagged for review" : "Flag for review") + '</button></div><div id="hints">' + hintsHTML(p, s) + '</div><div class="result" id="result" aria-live="polite">' +
      (s.solved[p.id] ? solvedHTML() : "") + "</div>" +
      (p.norun ? '<p class="muted" style="font-size:14.5px; margin-top:14px">' + esc(p.lang || "This language") + ' does not run in this app, so this problem is self-checked: write your answer, then compare it with the solution.</p>'
               : '<details class="reveal"><summary>Show the solution</summary>' + codeHTML(p.solution) + (p.explain ? '<p style="margin-top:10px">' + esc(p.explain) + "</p>" : "") + "</details>") + "</div></div>";
    view.innerHTML = h;
  }
  function hintsHTML(p, s) { return (p.hints || []).slice(0, s.hints[p.id] || 0).map(function (x, i) { return '<p class="hint"><b>Hint ' + (i + 1) + ".</b> " + esc(x) + "</p>"; }).join(""); }
  function solvedHTML() {
    var t = cur.t, s = T(t.id), list = items(t, cur.stage), nxp = list.filter(function (x) { return !s.solved[x.id] && x !== cur.p; })[0], nx = nextTopic(t);
    return '<p class="banner pass">' + (cur.p.norun ? "Marked as solved." : "Correct. All hidden tests passed.") + ' <button type="button" class="linkbtn" data-act="resetp">Reset this problem</button></p>' + (cur.p.norun ? codeHTML(cur.p.solution) : "") + (cur.p.explain ? '<p style="margin-top:10px">' + esc(cur.p.explain) + "</p>" : "") +
      '<div class="row" style="margin-top:12px">' + (nxp ? '<a class="btn small primary" href="#/t/' + t.id + "/" + cur.stage + "/" + nxp.id + '">Next problem</a>' : "") +
      (cur.stage === "deepen" && has(t, "practice") ? '<a class="btn small" href="#/t/' + t.id + '/practice">More practice</a>' : "") +
      (confOf(t.id) !== 4 ? '<button class="btn small" type="button" data-act="confidentbtn">' + icon(4) + ' I feel confident with this topic</button>' : nx ? '<a class="btn small" href="#/t/' + nx.id + '">Next topic</a>' : "") + "</div>";
  }
  function banner(kind, text) { return '<p class="banner ' + kind + '">' + esc(text) + "</p>"; }
  function pre(text) { return text && String(text).trim() ? "<pre>" + esc(String(text).trim()) + "</pre>" : ""; }
  function tail(text, n) { return String(text || "").trim().split("\n").slice(-n).join("\n"); }

  /* Python runs in the existing practice guide's worker, started on first use. */
  var worker = null, wReady = false, loadErr = null, pending = {}, waiting = [], seq = 0;
  function ensureWorker() {
    if (worker) return;
    wReady = false;
    worker = new Worker("../cs61a-mt3-practice/pyworker.js");
    worker.onmessage = function (e) {
      var d = e.data;
      if (d.ready || d.loadError) { wReady = !!d.ready; loadErr = d.loadError || null; waiting.splice(0).forEach(function (f) { f(); }); return; }
      var p = pending[d.id]; if (!p) return;
      delete pending[d.id]; clearTimeout(p.timer); p.resolve(d);
    };
    worker.onerror = function () { loadErr = "the Python engine failed to start"; waiting.splice(0).forEach(function (f) { f(); }); };
  }
  function runPy(src, tests, fn, mode) {
    return new Promise(function (resolve) {
      if (typeof Worker === "undefined") { resolve({ ok: false, error: "This browser cannot run Python here. Try a current Chrome, Firefox, Edge or Safari." }); return; }
      ensureWorker();
      var id = ++seq;
      function go() {
        if (loadErr) { var m = loadErr; worker = null; loadErr = null; resolve({ ok: false, error: "Python could not load (" + m + "). Check your connection and try again." }); return; }
        var timer = setTimeout(function () { delete pending[id]; worker.terminate(); worker = null; resolve({ timeout: true }); }, 8000);
        pending[id] = { resolve: resolve, timer: timer };
        worker.postMessage({ id: id, src: src, tests: tests || "", fnname: fn, mode: mode });
      }
      if (wReady) go(); else waiting.push(go);
    });
  }
  /* ---------- Gleam: compiled and run in the browser by gleam/worker.js ---------- */
  var gw = null, gReady = false, gErr = null, gWaiting = [], gPending = {};
  function runGleam(src) {
    return new Promise(function (resolve) {
      if (!gw) {
        gReady = false;
        try { gw = new Worker("gleam/worker.js?v=2", { type: "module" }); } catch (e) { resolve({ ok: false, error: "This browser cannot run Gleam here." }); return; }
        gw.onmessage = function (e) {
          var d = e.data;
          if (d.ready || d.loadError) { gReady = !!d.ready; gErr = d.loadError || null; gWaiting.splice(0).forEach(function (f) { f(); }); return; }
          var q = gPending[d.id]; if (!q) return;
          delete gPending[d.id]; clearTimeout(q.timer); q.resolve(d);
        };
        gw.onerror = function () { gErr = "the Gleam compiler failed to start"; gWaiting.splice(0).forEach(function (f) { f(); }); };
      }
      var id = ++seq;
      function go() {
        if (gErr) { var m = gErr; gw = null; gErr = null; resolve({ ok: false, error: "Gleam could not load (" + m + ")." }); return; }
        var timer = setTimeout(function () { delete gPending[id]; gw.terminate(); gw = null; resolve({ timeout: true }); }, 8000);
        gPending[id] = { resolve: resolve, timer: timer };
        gw.postMessage({ id: id, src: src });
      }
      if (gReady) go(); else gWaiting.push(go);
    });
  }
  function revealHTML(p) {
    return '<p class="banner wait">Compare your answer with this one. It does not have to match word for word, but it should handle the same cases.</p>' + codeHTML(p.solution) +
      (p.explain ? '<p style="margin-top:10px">' + esc(p.explain) + "</p>" : "") +
      '<div class="row" style="margin-top:12px"><button class="btn small primary" type="button" data-act="selfsolve">Mine does the same thing</button><button class="btn small quiet" type="button" data-act="selfnot">Not yet, I will try again</button></div>';
  }
  function executeGleam(mode) {
    var job = cur, p = job.p, ed = document.getElementById("editor"), box = document.getElementById("result");
    if (!ed || !box) return;
    box.innerHTML = banner("wait", gReady ? "Running..." : "Loading Gleam. The first run takes a few seconds...");
    var tests = mode === "run" ? p.gleam.tests.slice(0, p.gleam.show || 2) : p.gleam.tests;
    // setup and the test function go after the student's code, so error line numbers match the editor
    var src = ed.value + "\n" + (p.gleam.setup || "") + "\nimport gleam/string as sf_inspect\npub fn sf_results() -> List(String) {\n  [" +
      tests.map(function (t) { return "sf_inspect.inspect(" + t[0] + ")"; }).join(",\n   ") + "]\n}\n";
    var own = ed.value.split("\n").length;
    runGleam(src).then(function (d) {
      if (cur !== job || !document.getElementById("result")) return;
      box = document.getElementById("result");
      if (d.timeout) { box.innerHTML = banner("fail", "Your code ran for over 8 seconds. That almost always means the recursion never stops. Check that every call gets closer to the base case."); return; }
      if (!d.ok) { box.innerHTML = banner("fail", "Could not run") + pre(d.error) + '<p class="muted" style="font-size:14.5px; margin-top:10px">You can still check this one by eye.</p><button class="btn small" type="button" data-act="reveal">Compare with the solution</button>'; return; }
      var r = d.result;
      if (r.stage === "compile") {
        var mine = !/main\.gleam:(\d+):/.test(r.detail) || +/main\.gleam:(\d+):/.exec(r.detail)[1] <= own;
        box.innerHTML = banner("fail", mine ? "The Gleam compiler rejected your code" : "Your code does not fit how this problem calls it. Check the function names, arguments and types.") + pre(r.detail.replace(/\/src\/main\.gleam/g, "your code"));
        return;
      }
      if (r.stage === "crash") { box.innerHTML = banner("fail", "Your code stopped while running") + pre(r.detail) + pre(r.output); return; }
      var bad = [], lines = tests.map(function (t, i) { var ok = r.values[i] === t[1]; if (!ok) bad.push(i); return (ok ? "ok    " : "wrong ") + t[0] + "  gives  " + r.values[i] + (ok ? "" : "   (expected " + t[1] + ")"); });
      if (mode === "run") {
        box.innerHTML = (bad.length ? banner("fail", bad.length + " of " + tests.length + " examples failed") : banner("pass", "All " + tests.length + " examples passed. Submit to check the hidden tests.")) + pre(lines.join("\n")) + pre(r.output);
        return;
      }
      if (!bad.length) {
        T(job.t.id).solved[p.id] = true; save(); progress();
        var a = view.querySelector('.plist a[aria-current] .tick'); if (a) a.classList.add("yes");
        box.innerHTML = solvedHTML();
      } else {
        box.innerHTML = banner("fail", "Not yet. A hidden test did not pass.") + pre(lines[bad[0]]) + pre(r.output);
      }
    });
  }
  /* ---------- SQL: SQLite in the browser, run by sql/worker.js ---------- */
  function tableHTML(cols, rows, max) {
    var shown = max && rows.length > max ? rows.slice(0, max) : rows;
    return '<div class="tblwrap"><table class="tbl"><thead><tr>' + cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      (shown.length ? shown.map(function (r) { return "<tr>" + r.map(function (v) { return "<td>" + (v === null ? '<span class="muted">NULL</span>' : esc(v)) + "</td>"; }).join("") + "</tr>"; }).join("") : '<tr><td class="muted" colspan="' + cols.length + '">no rows</td></tr>') +
      "</tbody></table></div>" + (shown.length < rows.length ? '<p class="muted" style="font-size:13.5px">Showing ' + shown.length + " of " + rows.length + " rows.</p>" : "");
  }
  var sw = null, sReady = false, sErr = null, sWaiting = [], sPending = {};
  function runSql(msg) {
    return new Promise(function (resolve) {
      if (!sw) {
        sReady = false;
        try { sw = new Worker("sql/worker.js?v=2"); } catch (e) { resolve({ ok: false, error: "This browser cannot run SQL here." }); return; }
        sw.onmessage = function (e) {
          var d = e.data;
          if (d.ready || d.loadError) { sReady = !!d.ready; sErr = d.loadError || null; sWaiting.splice(0).forEach(function (f) { f(); }); return; }
          var q = sPending[d.id]; if (!q) return;
          delete sPending[d.id]; clearTimeout(q.timer); q.resolve(d);
        };
        sw.onerror = function () { sErr = "the SQL engine failed to start"; sWaiting.splice(0).forEach(function (f) { f(); }); };
      }
      var id = ++seq; msg.id = id;
      function go() {
        if (sErr) { var m = sErr; sw = null; sErr = null; resolve({ ok: false, error: "SQL could not load (" + m + ")." }); return; }
        var timer = setTimeout(function () { delete sPending[id]; sw.terminate(); sw = null; resolve({ timeout: true }); }, 8000);
        sPending[id] = { resolve: resolve, timer: timer };
        sw.postMessage(msg);
      }
      if (sReady) go(); else sWaiting.push(go);
    });
  }
  // Compare two result tables. Row order only matters when the problem says so.
  function sameTable(got, want, ordered) {
    if (got.cols.length !== want.cols.length) return "Your table has " + got.cols.length + " column" + (got.cols.length === 1 ? "" : "s") + ", but " + want.cols.length + " expected.";
    for (var i = 0; i < want.cols.length; i++) if (got.cols[i].toLowerCase() !== want.cols[i].toLowerCase()) return "Column " + (i + 1) + " should be named " + want.cols[i] + ", but yours is named " + got.cols[i] + ".";
    if (got.rows.length !== want.rows.length) return "Your table has " + got.rows.length + " row" + (got.rows.length === 1 ? "" : "s") + ", but " + want.rows.length + " expected.";
    var key = function (r) { return JSON.stringify(r); }, a = got.rows.map(key), b = want.rows.map(key);
    if (!ordered) { a.sort(); b.sort(); }
    for (var j = 0; j < a.length; j++) if (a[j] !== b[j]) return ordered && a.slice().sort().join() === b.slice().sort().join() ? "The rows are right, but they are in the wrong order." : "Some rows do not match what is expected.";
    return "";
  }
  function executeSql(mode) {
    var job = cur, p = job.p, ed = document.getElementById("editor"), box = document.getElementById("result");
    if (!ed || !box) return;
    box.innerHTML = banner("wait", sReady ? "Running..." : "Loading SQL. The first run takes a moment...");
    var setups = mode === "run" ? [p.sql.setup] : [p.sql.setup].concat(p.sql.hidden || []);
    runSql({ setups: setups, src: ed.value, solution: p.solution, check: p.sql.check || "" }).then(function (d) {
      if (cur !== job || !document.getElementById("result")) return;
      box = document.getElementById("result");
      if (d.timeout) { box.innerHTML = banner("fail", "Your query ran for over 8 seconds and was stopped."); return; }
      if (!d.ok) { box.innerHTML = banner("fail", "Could not run") + pre(d.error); return; }
      var first = d.result[0], g = first.got;
      if (g.error) { box.innerHTML = banner("fail", "SQLite could not run your query") + pre(g.error); return; }
      if (g.none) { box.innerHTML = banner("fail", "Your code did not produce a table. End with a SELECT statement."); return; }
      var why = sameTable(g, first.want, p.sql.ordered), mine = "<h4 class=\"tblh\">Your result</h4>" + tableHTML(g.cols, g.rows, 12);
      if (mode === "run") {
        box.innerHTML = (why ? banner("fail", "Not matching yet. " + why) + mine + "<h4 class=\"tblh\">Expected</h4>" + tableHTML(first.want.cols, first.want.rows, 12)
                             : banner("pass", "Your result matches on this data. Submit to check it on hidden data too.") + mine);
        return;
      }
      for (var i = 1; !why && i < d.result.length; i++) {
        var r = d.result[i];
        if (r.got.error || r.got.none) why = "On a different set of data, your query failed.";
        else if (sameTable(r.got, r.want, p.sql.ordered)) why = "It matches the data you can see, but not a hidden set of data. Check that nothing in your query depends on these particular rows.";
      }
      if (!why) {
        T(job.t.id).solved[p.id] = true; save(); progress();
        var a = view.querySelector('.plist a[aria-current] .tick'); if (a) a.classList.add("yes");
        box.innerHTML = solvedHTML();
      } else box.innerHTML = banner("fail", "Not yet. " + why) + mine;
    });
  }
  function execute(mode) {
    if (cur && cur.p.gleam) { executeGleam(mode); return; }
    if (cur && cur.p.sql) { executeSql(mode); return; }
    var job = cur, p = job.p, ed = document.getElementById("editor"), box = document.getElementById("result");
    if (!ed || !box) return;
    box.innerHTML = banner("wait", wReady ? "Running..." : "Loading Python. The first run takes a few seconds...");
    var prefix = SETUP + "\n" + (p.setup || "") + "\n", off = prefix.split("\n").length - 1;
    // error line numbers should match the editor, not the hidden setup code above it
    function own(text) { return String(text || "").replace(/line (\d+)/g, function (m, n) { return +n > off ? "line " + (n - off) : m; }); }
    runPy(prefix + ed.value, p.tests, fnName(p), mode).then(function (d) {
      if (cur !== job || !document.getElementById("result")) return;
      box = document.getElementById("result");
      if (d.timeout) { box.innerHTML = banner("fail", "Your code ran for over 8 seconds. That almost always means the recursion or loop never stops. Check that every call gets closer to the base case."); return; }
      if (!d.ok) { box.innerHTML = banner("fail", "Could not run") + pre(d.error); return; }
      var r = JSON.parse(d.result);
      if (r.stage === "define") { box.innerHTML = banner("fail", "Python could not read your code") + pre(own(tail(r.detail, 4))); return; }
      if (mode === "run") {
        if (!r.attempted) box.innerHTML = banner("wait", "This problem has no examples to run. Use Submit.") + pre(r.output);
        else if (!r.failed) box.innerHTML = banner("pass", "All " + r.attempted + " examples passed. Submit to check the hidden tests.") + pre(r.output);
        else box.innerHTML = banner("fail", r.failed + " of " + r.attempted + " examples failed") + pre(r.detail) + pre(r.output);
        return;
      }
      if (r.ok) {
        T(job.t.id).solved[p.id] = true; save(); progress();
        var a = view.querySelector('.plist a[aria-current] .tick'); if (a) a.classList.add("yes");
        box.innerHTML = solvedHTML();
      } else {
        box.innerHTML = banner("fail", "Not yet. A hidden test did not pass.") + pre(tail(r.detail, 1)) + pre(r.output);
      }
    });
  }

  /* ---------- router ---------- */
  function route() { return location.hash.replace(/^#\/?/, "").split("/").filter(Boolean); }
  function render(keepScroll) {
    hush();
    var r = route(), t = r[0] === "t" ? topicById(r[1]) : null, stage = r[2];
    cur = null;
    if (r[0] === "progress") renderProgress();
    else if (!t) renderMap();
    else if (stage === "learn" && has(t, "learn")) renderLearn(t);
    else if (stage === "check" && has(t, "check")) renderCheck(t);
    else if ((stage === "deepen" || stage === "practice") && has(t, stage)) renderWork(t, stage, r[3]);
    else renderTopic(t);
    if (t) { S.last = "#/" + r.join("/"); save(); }
    progress(); renderSide();
    document.title = (t ? t.title + " · " : r[0] === "progress" ? "Progress · " : "") + "CS 61A · Saba Feilizadeh";
    if (!keepScroll) { window.scrollTo(0, 0); try { view.focus({ preventScroll: true }); } catch (e) {} }
  }
  function progress() {
    logProgress(); saveSoon();
    var done = TOPICS.filter(function (t) { return (S.topics[t.id] || {}).confident; }).length;
    var lm = sumLeft(TOPICS);
    document.getElementById("prog").textContent = done + " of " + TOPICS.length + " topics confident · " + (lm < 2.5 ? "all done" : dur(lm).replace("about ", "") + " left");
    var res = document.getElementById("resume"), onMap = !route().length;
    if (S.last && onMap) { res.hidden = false; res.setAttribute("href", S.last); } else res.hidden = true;
  }
  window.addEventListener("hashchange", function () { render(false); });

  /* ---------- actions ---------- */
  function answer(ctx, n, picked, gave) {
    var r = route(), t = topicById(r[1]); if (!t) return;
    var s = T(t.id), q = ctx === "ask" ? L[t.id].steps[n].ask : items(t, "check")[n];
    var rec = { picked: picked, ok: !gave && grade(q, picked), gave: !!gave };
    if (ctx === "ask") { s.asks[n] = rec; save(); renderLearn(t, true); }
    else { s.check[n] = rec; save(); var y = window.scrollY; renderCheck(t); window.scrollTo(0, y); progress(); }
  }
  function stepBy(d) {
    var r = route(), t = topicById(r[1]); if (!t || r[2] !== "learn" || !has(t, "learn")) return;
    var s = T(t.id), st = L[t.id].steps[s.step];
    if (d > 0 && ((st.ask && !s.asks[s.step]) || s.step >= L[t.id].steps.length - 1)) return;
    if (d < 0 && s.step === 0) return;
    s.step += d; save(); renderLearn(t);
  }
  view.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]"); if (!el || el.tagName === "FORM") return;
    var act = el.getAttribute("data-act"), r = route(), t = topicById(r[1]);
    if (act === "pick") answer(el.getAttribute("data-ctx"), +el.getAttribute("data-n"), +el.getAttribute("data-i"));
    else if (act === "giveup") answer(el.getAttribute("data-ctx"), +el.getAttribute("data-n"), null, true);
    else if (act === "next") stepBy(1);
    else if (act === "back") stepBy(-1);
    else if (act === "levelopen") { levelOpen = true; render(true); }
    else if (act === "units") { var allOpen = el.getAttribute("data-x") === "1"; S.unitOpen = {}; C.units.forEach(function (u, i) { S.unitOpen[i] = allOpen; }); save(); render(true); }
    else if (act === "filter") { S.filter = el.getAttribute("data-x") || ""; save(); render(true); }
    else if (act === "dateopen") { dateOpen = true; render(true); }
    else if (act === "goalclear") { delete S.dailyGoal; save(); render(true); }
    else if (act === "dateclear") { delete S.examDate; dateOpen = false; save(); render(true); }
    else if (act === "hideprogexample") { S.noProgExample = true; save(); render(true); }
    else if (act === "hideexample") { S.noReviewExample = true; save(); render(true); }
    else if (act === "flagp" && cur) { var fs = T(cur.t.id); if (fs.flags[cur.p.id]) delete fs.flags[cur.p.id]; else fs.flags[cur.p.id] = true; save(); el.textContent = fs.flags[cur.p.id] ? "Flagged for review" : "Flag for review"; el.setAttribute("aria-pressed", !!fs.flags[cur.p.id]); }
    else if (act === "resetq" && t) {
      var rs = T(t.id), rn = +el.getAttribute("data-n");
      if (el.getAttribute("data-ctx") === "ask") { delete rs.asks[rn]; save(); hush(); renderLearn(t, true); }
      else { delete rs.check[rn]; save(); var ry = window.scrollY; renderCheck(t); window.scrollTo(0, ry); progress(); }
      var inp = view.querySelector('form.typed[data-n="' + rn + '"][data-ctx="' + el.getAttribute("data-ctx") + '"] input'); if (inp) inp.focus();
    }
    else if (act === "recheck" && t) { T(t.id).check = {}; save(); render(false); }
    else if (act === "reveal" && cur) {
      document.getElementById("result").innerHTML = revealHTML(cur.p);
    }
    else if (act === "selfsolve" && cur) { T(cur.t.id).solved[cur.p.id] = true; save(); progress(); var tk = view.querySelector('.plist a[aria-current] .tick'); if (tk) tk.classList.add("yes"); document.getElementById("result").innerHTML = solvedHTML(); }
    else if (act === "selfnot" && cur) { document.getElementById("result").innerHTML = ""; document.getElementById("editor").focus(); }
    else if (act === "run") execute("run");
    else if (act === "submit") execute("submit");
    else if (act === "hint" && cur) { var s = T(cur.t.id); s.hints[cur.p.id] = Math.min((s.hints[cur.p.id] || 0) + 1, cur.p.hints.length); save(); document.getElementById("hints").innerHTML = hintsHTML(cur.p, s); }
    else if (act === "resetp" && cur) {
      var ps = T(cur.t.id), pid = cur.p.id;
      if (S.code[pid] != null && S.code[pid] !== cur.p.starter && !confirm("Start over? Your code goes back to the starter code.")) return;
      delete ps.solved[pid]; delete ps.hints[pid]; delete S.code[pid]; save(); progress(); render(true);
    }
    else if (act === "confidentbtn" && cur) { setConf(cur.t, 4, cur.stage); refreshConf(cur.t); document.getElementById("result").innerHTML = solvedHTML(); }
    else if (act === "conf" && t) { setConf(t, +el.getAttribute("data-v"), (el.closest(".confbar") || el).getAttribute("data-where")); refreshConf(t); }
    else if (act === "flagt" && t) { var fts = T(t.id); fts.flag = !fts.flag; save(); refreshConf(t); }
    else if (act === "nprev") narStep(-1);
    else if (act === "nnext") narStep(1);
    else if (act === "nplay") narToggle();
  });
  view.addEventListener("change", function (e) {
    var act = e.target.getAttribute && e.target.getAttribute("data-act"), t = topicById(route()[1]);
    if (act === "flagtopic" && t) { T(t.id).flag = e.target.checked; save(); }
    if (act === "confident" && t) { T(t.id).confident = e.target.checked; save(); render(true); }
    if (act === "narrate") { S.narrate = e.target.checked; save(); if (t && route()[2] === "learn") { renderLearn(t, true); if (S.narrate) speakFrom(0); else hush(); } }
  });
  view.addEventListener("submit", function (e) {
    var f = e.target, act = f.getAttribute("data-act");
    e.preventDefault();
    if (act === "typed") { var v = f.querySelector("input").value; if (v.trim()) answer(f.getAttribute("data-ctx"), +f.getAttribute("data-n"), v.trim()); }
    if (act === "dailygoal") { var gv = Math.round(+f.querySelector("input").value); if (gv >= 5) { S.dailyGoal = Math.min(600, gv); save(); render(true); } }
    if (act === "examdate") { var dv = f.querySelector("input").value; if (dv) { S.examDate = dv; dateOpen = false; save(); render(true); } }
    if (act === "level") { var c = f.querySelector("input:checked"); S.level = c ? c.value : C.defaultLevel; levelOpen = false; save(); render(true); }
  });
  view.addEventListener("input", function (e) {
    if (e.target.id === "editor" && cur) { S.code[cur.p.id] = e.target.value; saveSoon(); }
  });
  /* editor: Tab indents, Enter keeps the indent (one more level after a colon) */
  view.addEventListener("keydown", function (e) {
    var ed = e.target; if (ed.id !== "editor") return;
    if (e.key === "Escape") { ed.blur(); view.focus({ preventScroll: true }); return; } // lets keyboard users leave the editor
    var a = ed.selectionStart, b = ed.selectionEnd, v = ed.value, ins = null;
    if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) ins = "    ";
    else if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      var line = v.slice(v.lastIndexOf("\n", a - 1) + 1, a);
      ins = "\n" + /^\s*/.exec(line)[0] + (/:\s*$/.test(line) ? "    " : "");
    }
    if (ins === null) return;
    e.preventDefault();
    ed.value = v.slice(0, a) + ins + v.slice(b);
    ed.selectionStart = ed.selectionEnd = a + ins.length;
    if (cur) { S.code[cur.p.id] = ed.value; saveSoon(); }
  });
  document.addEventListener("keydown", function (e) {
    var tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (S.narrate && route()[2] === "learn" && e.target.tagName !== "BUTTON" && e.target.tagName !== "A") {
      if (e.key === " ") { e.preventDefault(); narToggle(); return; }
      if (e.key === ",") { narStep(-1); return; }
      if (e.key === ".") { narStep(1); return; }
    }
    if (e.key === "ArrowRight") stepBy(1);
    if (e.key === "ArrowLeft") stepBy(-1);
  });
  /* Time spent: once a second, if this tab is visible, a lesson, check or problem page is open,
     and there was a key press, click or scroll in the last 2 minutes, add a second to that stage.
     Saved every 15 seconds and when the page is left. */
  var lastActive = Date.now(), ticks = 0;
  ["keydown", "pointerdown", "scroll"].forEach(function (ev) { window.addEventListener(ev, function () { lastActive = Date.now(); }, { passive: true }); });
  setInterval(function () {
    var r = route(), t = r[0] === "t" ? topicById(r[1]) : null, strip = document.getElementById("timestrip");
    var active = t && STAGES.indexOf(r[2]) >= 0 && !document.hidden && Date.now() - lastActive <= 120000;
    if (strip) strip.classList.toggle("paused", !active);
    if (!active) return;
    var sp = T(t.id).spent; sp[r[2]] = (sp[r[2]] || 0) + 1;
    var d = dayRec(); d.sp[r[2]] = (d.sp[r[2]] || 0) + 1; if (d.left == null) d.left = Math.round(sumLeft(TOPICS));
    var clk = document.getElementById("clk");
    if (++ticks % 15 === 0) { fcache = null; saveSoon(); if (strip && strip.getAttribute("data-t") === t.id && strip.getAttribute("data-stage") === r[2]) strip.innerHTML = stripInner(t, r[2]); }
    else if (clk && strip && strip.getAttribute("data-stage") === r[2]) clk.textContent = clock(sp[r[2]]);
  }, 1000);
  window.addEventListener("pagehide", function () { hush(); save(); });

  render(false);
})();
