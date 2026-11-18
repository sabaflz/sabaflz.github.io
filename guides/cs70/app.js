/*
  app.js: the CS 70 learning app. One page that never reloads.
  Content lives in course.js (the map) and lessons/<topic>.js (each topic).
  Built on the same engine as the CS 61A app (../cs61a/app.js), with the
  code-running parts swapped for proof and computation work: you write your
  answer, use hints, then compare it with a worked solution.

  Addresses:  #/                      course map
              #/progress              progress over time
              #/t/<topic>             topic page (the four stages)
              #/t/<topic>/learn       lesson
              #/t/<topic>/check       quick questions
              #/t/<topic>/deepen[/id] exam-style problems
              #/t/<topic>/practice[/id] official discussion and homework problems
*/
(function () {
  "use strict";
  var C = window.COURSE, L = window.LESSONS || {};
  var view = document.getElementById("view");
  var KEY = "sf_cs70_v1";
  var STAGES = ["learn", "check", "deepen", "practice"];
  var NAMES = { learn: "Learn", check: "Check", deepen: "Deepen", practice: "Practice" };

  /* ---------- saved progress (this browser only) ---------- */
  var S = (function () {
    var v = {};
    try { v = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { v = {}; }
    if (typeof v !== "object") v = {};
    v.topics = v.topics || {}; v.code = v.code || {};
    /* Default exam date: the next CS 70 exam still ahead. */
    if (!v.examDate && !v.noDefaultDate) { var now = new Date(), t0 = now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2); (C.exams || []).some(function (x) { if (x.date > t0) { v.examDate = x.date; return true; } }); }
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

  /* ---------- course helpers ---------- */
  var TOPICS = [];
  C.units.forEach(function (u) { u.topics.forEach(function (t) { t.unit = u.title; TOPICS.push(t); }); });
  function topicById(id) { for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i]; return null; }
  function nextTopic(t) { var i = TOPICS.indexOf(t); return i >= 0 && i < TOPICS.length - 1 ? TOPICS[i + 1] : null; }
  /* Official problems: [file, number, title] from course.js, turned into problem objects. */
  var PCACHE = {};
  function poolFor(t) {
    if (PCACHE[t.id]) return PCACHE[t.id];
    return (PCACHE[t.id] = (t.practice || []).map(function (x) {
      var kind = x[0].slice(0, 3) === "dis" ? "Discussion" : "Homework", num = +x[0].replace(/\D/g, "");
      return { id: x[0] + "_" + x[1], title: x[2], file: x[0], n: x[1], source: kind + " " + num + ", problem " + x[1],
        pdf: "https://www.eecs70.org/assets/pdf/" + x[0] + ".pdf", sol: (C.noSolutions || []).indexOf(x[0]) >= 0 ? "" : "https://www.eecs70.org/assets/pdf/" + x[0] + "-sol.pdf" };
    }));
  }
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
  function filterName(x) { return x === "Final" ? "New since the midterm" : x + " units"; }

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
      if (missed) why.push(missed + " check question" + (missed === 1 ? "" : "s") + " missed");
      if (asks >= 2) why.push(asks + " lesson questions missed");
      if (hinted.length) why.push(hinted.length + " problem" + (hinted.length === 1 ? "" : "s") + " needed two or more hints");
      var flagged = [];
      ["deepen", "practice"].forEach(function (st) { items(t, st).forEach(function (p) { if ((s.flags || {})[p.id]) flagged.push({ p: p, stage: st }); }); });
      if (why.length || flagged.length) out.push({ t: t, why: why, flagged: flagged, weight: (s.flag ? 3 : 0) + missed * 2 + asks + hinted.length * 2 + flagged.length * 2, link: missed ? "/check" : "" });
    });
    out.sort(function (a, b) { return b.weight - a.weight; });
    return out;
  }
  function reviewHTML() {
    var list = reviewItems(), h = '<section class="review"><h2>Review list<small>What you flagged, and where you slipped</small></h2>';
    if (!list.length) {
      if (S.noReviewExample) return h + '<p class="muted">Nothing here yet. Flag a topic or a problem, or miss a check question, and it shows up here.</p></section>';
      return h + '<ul class="rlist"><li class="example"><span><strong>Example: Induction</strong><small>2 check questions missed · 1 problem needed two or more hints</small><small>Flagged problem: Tiling with trominoes</small></span><button type="button" class="linkbtn" data-act="hideexample">Remove example</button></li></ul><p class="muted" style="font-size:14px">This is what an entry looks like. Real ones appear when you flag something or miss questions.</p></section>';
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
  /* The board: lines of math or proof, numbered so the narration can point at them. */
  function codeHTML(src, hl) {
    hl = hl || [];
    var lines = Array.isArray(src) ? src : String(src).split("\n");
    return '<pre class="code board">' + lines.map(function (line, i) {
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
    var parts = [["lecture", "Lecture recording"], ["note", "Course note"], ["note2", "Note 0"], ["slides", "Slides"], ["handout", "Handout"]].filter(function (p) { return k[p[0]]; }).map(function (p) {
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
      h += '<p class="fb">' + (a.ok ? '<b class="good">Correct.</b> ' : '<b class="miss">' + (a.gave ? "Answer: " : "Not quite. Answer: ") + esc(q.type === "mc" ? q.choices[q.answer] : q.answer) + ".</b> ") + esc(q.why) + "</p>";
    }
    return h;
  }
  /* Typed answers: spaces, case and quotes don't matter, and q.accept lists other ways to write it. */
  function mnorm(x) { return norm(x).replace(/\s+/g, "").replace(/\*/g, "").replace(/·/g, ""); }
  function grade(q, picked) {
    if (q.type === "mc") return picked === q.answer;
    var p = mnorm(picked);
    return [q.answer].concat(q.accept || []).some(function (a) { return mnorm(a) === p; }) || (!isNaN(+q.answer) && picked.trim() !== "" && !isNaN(+picked) && Math.abs(+picked - +q.answer) < 1e-9);
  }

  /* ---------- course map ---------- */
  var levelOpen = false, dateOpen = false, goalOpen = false;
  function renderMap() {
    var lv = level(), h = "";
    h += '<div class="maphead"><p class="eyebrow">Learn, check, deepen, practice</p><h1>CS 70</h1>' +
      '<p class="lede">Discrete math and probability, one lecture at a time. Each topic starts with a step-through lesson built from the course notes and slides, then quick questions, then exam-style problems with hints and worked solutions, then the official discussion and homework problems. Your progress is saved in this browser.</p>' +
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
    }).join("") + "</div>" + reviewHTML();

    shownUnits().forEach(function (u) { var ui = C.units.indexOf(u);
      h += '<section class="unit"><h2>' + esc(u.title) + "<small>Unit " + (ui + 1) + (u.exam ? " · for " + esc(u.exam) : "") + " · " + dur(sumMin(u.topics)) + " · " + leftText(sumMine(u.topics)) + (factors().known && sumMine(u.topics) >= 2.5 ? " at your pace" : "") + '</small></h2><ul class="topics">' + u.topics.map(function (t) {
        var s = T(t.id), dot = s.confident ? "done" : started(t) ? "started" : "";
        var chips = "";
        if (s.confident) chips += '<span class="chip ok">Confident</span>';
        else if (started(t)) chips += '<span class="chip go">In progress</span>';
        if ((t.testOut || []).indexOf(lv) >= 0 && !s.confident) chips += '<span class="chip info">Optional at your level</span>';
        chips += '<span class="chip">' + (has(t, "learn") ? (has(t, "practice") ? "Lesson and practice" : "Lesson ready") : has(t, "practice") ? "Practice only" : "Coming soon") + "</span>";
        return '<li><a class="topic" href="#/t/' + t.id + '"><span class="dot ' + dot + '" aria-hidden="true"></span><span class="txt"><h3>' + esc(t.title) + "</h3><p>" + esc(t.blurb) + '</p><p class="meta">' + (t.lecture ? "Lecture " + t.lecture + (t.note && t.note !== "slides" ? " · Note " + esc(t.note) : "") + (t.quiz ? " · " + esc(t.quiz) : "") + " · " : "") + dur(topicMin(t)) + (started(t) ? " · " + leftText(leftMine(t)) : "") + (allSpent(t) >= 1 ? " · " + Math.round(allSpent(t)) + " min spent" : "") + '</p></span><span class="chips">' + (s.flag ? '<span class="chip flag">Flagged</span>' : "") + chips + "</span></a></li>";
      }).join("") + "</ul></section>";
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
      deepen: has(t, "deepen") ? items(t, "deepen").length + " exam-style problems. Work each one out, use hints if you need them, then compare with the worked solution. " + cap(dur(stageMin(t, "deepen"))) + "." : "Exam-style problems arrive with the lesson.",
      practice: has(t, "practice") ? items(t, "practice").length + " problems from the official discussions and homework, " + dur(stageMin(t, "practice")) + " each. Keep going until you feel confident." : "No discussion or homework problems for this topic yet."
    };
    var first = level() === "review" ? "check" : "learn", suggested = null;
    STAGES.slice(STAGES.indexOf(first)).concat(STAGES).forEach(function (st) { if (!suggested && has(t, st) && !stageDone(t, st)) suggested = st; });
    var h = crumb(t) + '<p class="eyebrow">' + esc(t.unit || "") + "</p><h1>" + esc(t.title) + '</h1><p class="lede">' + esc(t.blurb) + '</p><p class="meta" style="margin-top:14px">' + (t.lecture ? "Lecture " + t.lecture + (t.date ? ", " + esc(t.date) : "") + (t.note && t.note !== "slides" ? " · Note " + esc(t.note) : "") + (t.quiz ? " · tested on " + esc(t.quiz) : "") + " · " : "") +
      (l ? cap(dur(topicMin(t))) + " for the lesson, check and exam-style problems" + (started(t) ? " · " + leftText(leftMine(t)) : "") + (allSpent(t) >= 1 ? " · you have spent " + Math.round(allSpent(t)) + " min" : "") : "Planned: " + dur(topicMin(t))) + (has(t, "practice") ? " · Practice is extra" : "") + "</p>" + sources(t, "From the course" + (t.lecture ? ", Lecture " + t.lecture : "") + ":") + '<ol class="stages">';
    STAGES.forEach(function (st) {
      var ok = has(t, st), done = stageDone(t, st), label = "Start";
      if (st === "learn" && ok) label = s.lessonDone ? "Replay" : s.step ? "Continue" : "Start";
      if (st === "check" && ok) label = done ? "Review" : Object.keys(s.check).length ? "Continue" : "Start";
      if ((st === "deepen" || st === "practice") && ok) { var k = solvedCount(t, st); label = k ? "Continue (" + k + " of " + items(t, st).length + " solved)" : "Start"; }
      h += '<li class="stage' + (done ? " done" : "") + '"><div><h2>' + NAMES[st] + "</h2><p>" + esc(desc[st]) + '</p></div><div class="act">' +
        (ok ? '<a class="btn small' + (st === suggested ? " primary" : "") + '" href="#/t/' + t.id + "/" + st + '">' + label + "</a>" : '<span class="chip">Coming soon</span>') + "</div></li>";
    });
    h += '</ol><div class="finish"><label class="toggle"><input type="checkbox" data-act="confident"' + (s.confident ? " checked" : "") + "> I feel confident with this topic</label>" + '<label class="toggle"><input type="checkbox" data-act="flagtopic"' + (s.flag ? " checked" : "") + "> Flag for review</label>" +
      (nx ? '<a class="btn small" href="#/t/' + nx.id + '">Next topic: ' + esc(nx.title) + "</a>" : "") + "</div>";
    view.innerHTML = h;
  }

  /* ---------- lesson player ---------- */
  var canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  function hush() { if (canSpeak) window.speechSynthesis.cancel(); }
  function speak(text) { if (!canSpeak || !S.narrate) return; hush(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); }

  function renderLearn(t, quiet) {
    var l = L[t.id], s = T(t.id), n = l.steps.length;
    if (s.step > n - 1) s.step = n - 1;
    var i = s.step, st = l.steps[i], lv = level(), a = s.asks[i], last = i === n - 1;
    if (last && !s.lessonDone) { s.lessonDone = true; save(); }
    var blocked = st.ask && !a;
    var h = crumb(t, "learn") + tabs(t, "learn") + timeStrip(t, "learn") + '<div class="player"><div class="bar2"><i style="width:' + Math.round((i + 1) / n * 100) + '%"></i></div><div class="stagegrid">' +
      codeHTML((l.boards || {})[st.board] || [], st.hl) + '<div class="side">';
    if (st.facts) h += '<div><h4>' + esc(st.factsTitle || "So far") + '</h4><div class="names">' + st.facts.map(function (p) { return '<div class="frame"><span>' + esc(p[0]) + "</span><small>" + esc(p[1]) + "</small></div>"; }).join("") + "</div></div>";
    if (st.table) h += "<div><h4>" + esc(st.table.name || "Table") + "</h4>" + tableHTML(st.table.cols, st.table.rows) + "</div>";
    if (st.tree) h += '<div><h4>' + esc(st.treeTitle || "Picture") + '</h4><pre class="out tree">' + esc(st.tree.join("\n")) + "</pre></div>";
    if (!st.facts && !st.table && !st.tree) h += '<p class="muted" style="font-size:15px">' + esc(st.side || "Key facts and pictures show up here as the lesson goes.") + "</p>";
    h += '</div></div><div class="narr"><p class="say">' + esc(st.say) + "</p>";
    if (st.basics && lv === "first") h += '<p class="note"><b>Notation.</b> ' + esc(st.basics) + "</p>";
    if (st.tip && lv !== "review") h += '<p class="note"><b>Exam tip.</b> ' + esc(st.tip) + "</p>";
    if (st.ask) h += '<div class="ask">' + questionHTML(st.ask, a, "ask", i) + "</div>";
    h += '</div><div class="controls"><span class="count">Step ' + (i + 1) + " of " + n + "</span>" +
      (canSpeak ? '<label class="toggle"><input type="checkbox" data-act="narrate"' + (S.narrate ? " checked" : "") + "> Read aloud</label>" : "") +
      '<button class="btn small quiet" type="button" data-act="back"' + (i === 0 ? " disabled" : "") + ">Back</button>" +
      (last ? '<a class="btn small primary" href="#/t/' + t.id + '/check">Go to the check questions</a>'
            : '<button class="btn small primary" type="button" data-act="next"' + (blocked ? ' disabled title="Answer the question to continue"' : "") + ">Next</button>") +
      "</div></div>" + sources(t, "Want the original?" + (t.lecture ? " Lecture " + t.lecture + ":" : ""));
    view.innerHTML = h;
    if (!quiet) speak(st.say);
  }

  /* ---------- check ---------- */
  function renderCheck(t) {
    var qs = items(t, "check"), s = T(t.id), nx = nextTopic(t);
    var answered = Object.keys(s.check).length, right = qs.filter(function (q, i) { return s.check[i] && s.check[i].ok; }).length;
    var h = crumb(t, "check") + tabs(t, "check") + timeStrip(t, "check") + "<h1>Check</h1><p class=\"lede\" style=\"margin-bottom:24px\">Answer each one, then read the explanation. Nothing here is graded.</p>";
    qs.forEach(function (q, i) {
      h += '<div class="qcard"><p class="num">Question ' + (i + 1) + " of " + qs.length + "</p>" + (q.board ? codeHTML(q.board) : "") + questionHTML(q, s.check[i], "check", i) + "</div>";
    });
    h += '<div class="score"><strong>' + (answered < qs.length ? answered + " of " + qs.length + " answered" : right + " of " + qs.length + " correct") + '</strong><div class="row">' +
      (answered ? '<button class="btn small quiet" type="button" data-act="recheck">Try again</button>' : "") +
      (has(t, "deepen") ? '<a class="btn small' + (answered >= qs.length ? " primary" : "") + '" href="#/t/' + t.id + '/deepen">Deepen with exam-style problems</a>' : "") +
      (nx ? '<a class="btn small" href="#/t/' + nx.id + '">Next topic</a>' : "") + "</div></div>";
    if (answered >= qs.length && right < qs.length - 1) h += '<p class="muted">Missed a few? <a href="#/t/' + t.id + '/learn">Replay the lesson</a> and try again.</p>';
    view.innerHTML = h;
  }

  /* ---------- deepen and practice ---------- */
  var cur = null; // { t, stage, p }
  function renderWork(t, stage, pid) {
    var list = items(t, stage), s = T(t.id);
    var p = list.filter(function (x) { return x.id === pid; })[0] || list.filter(function (x) { return !s.solved[x.id]; })[0] || list[0];
    cur = { t: t, stage: stage, p: p };
    var intro = stage === "deepen" ? "Exam-style problems on this topic. Work each one out on paper or in the box, try before opening a hint, then compare with the worked solution."
      : "Problems from the official discussions and homework. Open the problem, solve it on paper, then check the official solutions. Do as many as you need, then mark the topic confident.";
    var h = crumb(t, stage) + tabs(t, stage) + timeStrip(t, stage) + "<h1>" + NAMES[stage] + '</h1><p class="lede" style="margin-bottom:24px">' + intro + '</p><div class="work"><ul class="plist" aria-label="Problems">' +
      list.map(function (x, i) {
        return '<li><a href="#/t/' + t.id + "/" + stage + "/" + x.id + '"' + (x === p ? ' aria-current="true"' : "") + '><span class="tick' + (s.solved[x.id] ? " yes" : "") + '" aria-hidden="true"></span>' + (i + 1) + ". " + esc(x.title) + (s.solved[x.id] ? '<span class="muted"> (solved)</span>' : "") + "</a></li>";
      }).join("") + '</ul><div class="prob"><h2>' + esc(p.title) + '</h2><p class="src">' + esc(p.source || "") + "</p>";
    if (stage === "practice") {
      h += '<p>This one is in ' + esc(p.source) + '. It opens in a new tab.</p><div class="row" style="margin:14px 0">' +
        '<a class="btn small primary" href="' + esc(p.pdf) + '" target="_blank" rel="noopener">Open the problem<span class="sr"> (opens in a new tab)</span></a>' +
        (p.sol ? '<a class="btn small" href="' + esc(p.sol) + '" target="_blank" rel="noopener">Official solutions<span class="sr"> (opens in a new tab)</span></a>' : '<span class="chip">Solutions not posted yet</span>') + "</div>" +
        '<label class="worklabel" for="editor">Your work (saved in this browser)</label><textarea class="editor mathwork" id="editor" spellcheck="false" aria-label="Your work">' + esc(S.code[p.id] || "") + "</textarea>" +
        '<div class="row" style="margin-top:12px"><button class="btn small primary" type="button" data-act="selfsolve">I solved it</button><button class="btn small quiet" type="button" data-act="flagp" aria-pressed="' + !!s.flags[p.id] + '">' + (s.flags[p.id] ? "Flagged for review" : "Flag for review") + "</button></div>" +
        '<div class="result" id="result" aria-live="polite">' + (s.solved[p.id] ? solvedHTML() : "") + "</div></div></div>";
      view.innerHTML = h; return;
    }
    h += '<div class="pdesc">' + paras(p.desc) + "</div>" + (p.board ? codeHTML(p.board) : "") +
      '<label class="worklabel" for="editor">Your work (saved in this browser)</label><textarea class="editor mathwork" id="editor" spellcheck="false" aria-label="Your work">' + esc(S.code[p.id] || "") + "</textarea>" +
      (p.answer != null ? '<form class="typed final" data-act="final"><label for="finalIn">' + esc(p.answerLabel || "Final answer") + '</label><input id="finalIn" autocomplete="off" spellcheck="false" value="' + esc((s.finals || {})[p.id] || "") + '"><button class="btn small" type="submit">Check answer</button></form><p class="fb" id="finalFb" aria-live="polite"></p>' : "") +
      '<div class="row" style="margin-top:12px"><button class="btn small primary" type="button" data-act="reveal">Compare with the solution</button>' +
      (p.hints ? '<button class="btn small quiet" type="button" data-act="hint">Hint</button>' : "") +
      '<button class="btn small quiet" type="button" data-act="flagp" aria-pressed="' + !!s.flags[p.id] + '">' + (s.flags[p.id] ? "Flagged for review" : "Flag for review") + '</button></div><div id="hints">' + hintsHTML(p, s) + '</div><div class="result" id="result" aria-live="polite">' +
      (s.solved[p.id] ? solvedHTML() : "") + "</div></div></div>";
    view.innerHTML = h;
  }
  function paras(x) { return [].concat(x || []).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join(""); }
  function hintsHTML(p, s) { return (p.hints || []).slice(0, s.hints[p.id] || 0).map(function (x, i) { return '<p class="hint"><b>Hint ' + (i + 1) + ".</b> " + esc(x) + "</p>"; }).join(""); }
  function solHTML(p) { return (p.solution ? '<h4 class="tblh">Worked solution</h4>' + codeHTML(p.solution) : "") + (p.explain ? '<p style="margin-top:10px">' + esc(p.explain) + "</p>" : ""); }
  function solvedHTML() {
    var t = cur.t, s = T(t.id), list = items(t, cur.stage), nxp = list.filter(function (x) { return !s.solved[x.id] && x !== cur.p; })[0], nx = nextTopic(t);
    return '<p class="banner pass">Marked as solved.</p>' + (cur.stage === "deepen" ? solHTML(cur.p) : "") +
      '<div class="row" style="margin-top:12px">' + (nxp ? '<a class="btn small primary" href="#/t/' + t.id + "/" + cur.stage + "/" + nxp.id + '">Next problem</a>' : "") +
      (cur.stage === "deepen" && has(t, "practice") ? '<a class="btn small" href="#/t/' + t.id + '/practice">Discussion and homework problems</a>' : "") +
      (!s.confident ? '<button class="btn small" type="button" data-act="confidentbtn">I feel confident with this topic</button>' : nx ? '<a class="btn small" href="#/t/' + nx.id + '">Next topic</a>' : "") + "</div>";
  }
  function banner(kind, text) { return '<p class="banner ' + kind + '">' + esc(text) + "</p>"; }
  function pre(text) { return text && String(text).trim() ? "<pre>" + esc(String(text).trim()) + "</pre>" : ""; }
  function tail(text, n) { return String(text || "").trim().split("\n").slice(-n).join("\n"); }

  function revealHTML(p) {
    return '<p class="banner wait">Compare your work with this one. It does not have to match word for word, but every step should be justified the same way.</p>' + solHTML(p) +
      '<div class="row" style="margin-top:12px"><button class="btn small primary" type="button" data-act="selfsolve">Mine matches</button><button class="btn small quiet" type="button" data-act="selfnot">Not yet, I will try again</button></div>';
  }
  function tableHTML(cols, rows) {
    return '<div class="tblwrap"><table class="tbl"><thead><tr>' + cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (v) { return "<td>" + esc(v) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
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
    progress();
    document.title = (t ? t.title + " · " : r[0] === "progress" ? "Progress · " : "") + "CS 70 · Saba Feilizadeh";
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
    else if (act === "filter") { S.filter = el.getAttribute("data-x") || ""; save(); render(true); }
    else if (act === "dateopen") { dateOpen = true; render(true); }
    else if (act === "goalclear") { delete S.dailyGoal; save(); render(true); }
    else if (act === "dateclear") { delete S.examDate; S.noDefaultDate = true; dateOpen = false; save(); render(true); }
    else if (act === "hideprogexample") { S.noProgExample = true; save(); render(true); }
    else if (act === "hideexample") { S.noReviewExample = true; save(); render(true); }
    else if (act === "flagp" && cur) { var fs = T(cur.t.id); if (fs.flags[cur.p.id]) delete fs.flags[cur.p.id]; else fs.flags[cur.p.id] = true; save(); el.textContent = fs.flags[cur.p.id] ? "Flagged for review" : "Flag for review"; el.setAttribute("aria-pressed", !!fs.flags[cur.p.id]); }
    else if (act === "recheck" && t) { T(t.id).check = {}; save(); render(false); }
    else if (act === "reveal" && cur) {
      document.getElementById("result").innerHTML = revealHTML(cur.p);
    }
    else if (act === "selfsolve" && cur) { T(cur.t.id).solved[cur.p.id] = true; save(); progress(); var tk = view.querySelector('.plist a[aria-current] .tick'); if (tk) tk.classList.add("yes"); document.getElementById("result").innerHTML = solvedHTML(); }
    else if (act === "selfnot" && cur) { document.getElementById("result").innerHTML = ""; document.getElementById("editor").focus(); }
    else if (act === "hint" && cur) { var s = T(cur.t.id); s.hints[cur.p.id] = Math.min((s.hints[cur.p.id] || 0) + 1, cur.p.hints.length); save(); document.getElementById("hints").innerHTML = hintsHTML(cur.p, s); }
    else if (act === "confidentbtn" && cur) { T(cur.t.id).confident = true; save(); progress(); document.getElementById("result").innerHTML = solvedHTML(); }
  });
  view.addEventListener("change", function (e) {
    var act = e.target.getAttribute && e.target.getAttribute("data-act"), t = topicById(route()[1]);
    if (act === "flagtopic" && t) { T(t.id).flag = e.target.checked; save(); }
    if (act === "confident" && t) { T(t.id).confident = e.target.checked; save(); render(true); }
    if (act === "narrate") { S.narrate = e.target.checked; save(); if (S.narrate && t) speak(L[t.id].steps[T(t.id).step].say); else hush(); }
  });
  view.addEventListener("submit", function (e) {
    var f = e.target, act = f.getAttribute("data-act");
    e.preventDefault();
    if (act === "final" && cur) {
      var fv = f.querySelector("input").value.trim(), fb = document.getElementById("finalFb"), fs2 = T(cur.t.id); if (!fv) return;
      fs2.finals = fs2.finals || {}; fs2.finals[cur.p.id] = fv; save();
      var ok = grade({ type: "type", answer: String(cur.p.answer), accept: cur.p.accept }, fv);
      fb.innerHTML = ok ? '<b class="good">Correct.</b> Now check that your reasoning matches the worked solution.' : '<b class="miss">Not that.</b> Check your work, or open a hint.';
    }
    if (act === "typed") { var v = f.querySelector("input").value; if (v.trim()) answer(f.getAttribute("data-ctx"), +f.getAttribute("data-n"), v.trim()); }
    if (act === "dailygoal") { var gv = Math.round(+f.querySelector("input").value); if (gv >= 5) { S.dailyGoal = Math.min(600, gv); save(); render(true); } }
    if (act === "examdate") { var dv = f.querySelector("input").value; if (dv) { S.examDate = dv; dateOpen = false; save(); render(true); } }
    if (act === "level") { var c = f.querySelector("input:checked"); S.level = c ? c.value : C.defaultLevel; levelOpen = false; save(); render(true); }
  });
  view.addEventListener("input", function (e) {
    if (e.target.id === "editor" && cur) { S.code[cur.p.id] = e.target.value; saveSoon(); }
  });
  view.addEventListener("keydown", function (e) {
    if (e.target.id === "editor" && e.key === "Escape") { e.target.blur(); view.focus({ preventScroll: true }); } // lets keyboard users leave the box
  });
  document.addEventListener("keydown", function (e) {
    var tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.metaKey || e.ctrlKey || e.altKey) return;
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
