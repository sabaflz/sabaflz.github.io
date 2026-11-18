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
    t.asks = t.asks || {}; t.check = t.check || {}; t.solved = t.solved || {}; t.hints = t.hints || {}; t.step = t.step || 0;
    return t;
  }
  function level() { return S.level || C.defaultLevel; }

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
  function leftMin(t) {
    var s = S.topics[t.id];
    if (s && s.confident) return 0;
    if (!L[t.id] || !s) return topicMin(t);
    var m = 0, n;
    if (!s.lessonDone) { n = items(t, "learn").length; m += stageMin(t, "learn") * (n ? Math.max(0, n - (s.step || 0)) / n : 1); }
    n = items(t, "check").length; if (n) m += stageMin(t, "check") * Math.max(0, n - Object.keys(s.check || {}).length) / n;
    n = items(t, "deepen").length; if (n) m += stageMin(t, "deepen") * (n - solvedCount(t, "deepen")) / n;
    return m;
  }
  function sumLeft(list) { return list.reduce(function (a, t) { return a + leftMin(t); }, 0); }
  function leftText(m) { return m < 2.5 ? "done" : dur(m).replace("about ", "") + " left"; }
  function timeBar(list) {
    var r5 = function (m) { return Math.round(m / 5) * 5; }, total = r5(sumMin(list)), left = r5(sumLeft(list)), pct = total ? Math.round(100 * (total - left) / total) : 0;
    return '<div class="timecard"><div class="nums"><div><strong>' + dur(total).replace("about ", "") + '</strong><span>whole course</span></div><div><strong>' + (total - left < 2.5 ? "0 min" : dur(total - left).replace("about ", "")) + '</strong><span>done</span></div><div><strong>' + (left < 2.5 ? "0 min" : dur(left).replace("about ", "")) + '</strong><span>left</span></div></div>' +
      '<div class="bar" role="img" aria-label="' + pct + ' percent of the course time done"><i style="width:' + (pct ? Math.max(2, pct) : 0) + '%"></i></div><p class="meta">' + pct + '% done by time · estimates for the lesson, check and exam-style problems · practice is extra</p></div>';
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
      h += '<p class="fb">' + (a.ok ? '<b class="good">Correct.</b> ' : '<b class="miss">' + (a.gave ? "Answer: " : "Not quite. Answer: ") + esc(q.type === "mc" ? q.choices[q.answer] : q.answer) + ".</b> ") + esc(q.why) + "</p>";
    }
    return h;
  }
  function grade(q, picked) { return q.type === "mc" ? picked === q.answer : norm(picked) === norm(q.answer); }

  /* ---------- course map ---------- */
  var levelOpen = false;
  function renderMap() {
    var lv = level(), h = "";
    h += '<div class="maphead"><p class="eyebrow">Learn, check, deepen, practice</p><h1>CS 61A</h1>' +
      '<p class="lede">Work through the course one topic at a time. Each topic starts with a step-through lesson, then quick questions, then exam-style problems that run real Python, Gleam and SQL in your browser. Skip around whenever you like. Your progress is saved in this browser.</p>' +
      timeBar(TOPICS) + '</div>';

    if (!S.level || levelOpen) {
      h += '<form class="level" data-act="level"><h2>Where are you starting from?</h2><div class="opts">' + C.levels.map(function (l) {
        return '<label><input type="radio" name="level" value="' + l.id + '"' + (l.id === lv ? " checked" : "") + "><span>" + esc(l.label) + "</span><small>" + esc(l.desc) + "</small></label>";
      }).join("") + '</div><button class="btn primary" type="submit">' + (S.level ? "Save" : "Start") + "</button></form>";
    } else {
      var cur = C.levels.filter(function (l) { return l.id === lv; })[0];
      h += '<p class="levelline">Starting level: <strong>' + esc(cur.label) + '</strong><button type="button" class="linkbtn" data-act="levelopen">Change</button></p>';
    }

    C.units.forEach(function (u, ui) {
      h += '<section class="unit"><h2>' + esc(u.title) + "<small>Unit " + (ui + 1) + (u.exam ? " · for " + esc(u.exam) : "") + " · " + dur(sumMin(u.topics)) + " · " + leftText(sumLeft(u.topics)) + '</small></h2><ul class="topics">' + u.topics.map(function (t) {
        var s = T(t.id), dot = s.confident ? "done" : started(t) ? "started" : "";
        var chips = "";
        if (s.confident) chips += '<span class="chip ok">Confident</span>';
        else if (started(t)) chips += '<span class="chip go">In progress</span>';
        if ((t.testOut || []).indexOf(lv) >= 0 && !s.confident) chips += '<span class="chip info">Optional at your level</span>';
        chips += '<span class="chip">' + (has(t, "learn") ? (has(t, "practice") ? "Lesson and practice" : "Lesson ready") : has(t, "practice") ? "Practice only" : "Coming soon") + "</span>";
        return '<li><a class="topic" href="#/t/' + t.id + '"><span class="dot ' + dot + '" aria-hidden="true"></span><span class="txt"><h3>' + esc(t.title) + "</h3><p>" + esc(t.blurb) + '</p><p class="meta">' + (t.lecture ? "Lecture " + t.lecture + " · " : "") + dur(topicMin(t)) + (started(t) ? " · " + leftText(leftMin(t)) : "") + '</p></span><span class="chips">' + chips + "</span></a></li>";
      }).join("") + "</ul></section>";
    });
    view.innerHTML = h;
  }

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
      (l ? cap(dur(topicMin(t))) + " for the lesson, check and exam-style problems" + (started(t) ? " · " + leftText(leftMin(t)) : "") : "Planned: " + dur(topicMin(t))) + (has(t, "practice") ? " · Practice is extra" : "") + "</p>" + sources(t, "From the course" + (t.lecture ? ", Lecture " + t.lecture : "") + ":") + '<ol class="stages">';
    STAGES.forEach(function (st) {
      var ok = has(t, st), done = stageDone(t, st), label = "Start";
      if (st === "learn" && ok) label = s.lessonDone ? "Replay" : s.step ? "Continue" : "Start";
      if (st === "check" && ok) label = done ? "Review" : Object.keys(s.check).length ? "Continue" : "Start";
      if ((st === "deepen" || st === "practice") && ok) { var k = solvedCount(t, st); label = k ? "Continue (" + k + " of " + items(t, st).length + " solved)" : "Start"; }
      h += '<li class="stage' + (done ? " done" : "") + '"><div><h2>' + NAMES[st] + "</h2><p>" + esc(desc[st]) + '</p></div><div class="act">' +
        (ok ? '<a class="btn small' + (st === suggested ? " primary" : "") + '" href="#/t/' + t.id + "/" + st + '">' + label + "</a>" : '<span class="chip">Coming soon</span>') + "</div></li>";
    });
    h += '</ol><div class="finish"><label class="toggle"><input type="checkbox" data-act="confident"' + (s.confident ? " checked" : "") + "> I feel confident with this topic</label>" +
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
    var h = crumb(t, "learn") + tabs(t, "learn") + '<div class="player"><div class="bar2"><i style="width:' + Math.round((i + 1) / n * 100) + '%"></i></div><div class="stagegrid">' +
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
    h += '</div></div><div class="narr"><p class="say">' + esc(st.say) + "</p>";
    if (st.basics && lv === "new") h += '<p class="note"><b>The basics.</b> ' + esc(st.basics) + "</p>";
    if (st.syntax && (lv === "new" || lv === "programmer")) h += '<p class="note">' + esc(st.syntax).replace(/^Python notes:/, "<b>Python notes.</b>") + "</p>";
    if (st.ask) h += '<div class="ask">' + questionHTML(st.ask, a, "ask", i) + "</div>";
    h += '</div><div class="controls"><span class="count">Step ' + (i + 1) + " of " + n + "</span>" +
      (canSpeak ? '<label class="toggle"><input type="checkbox" data-act="narrate"' + (S.narrate ? " checked" : "") + "> Read aloud</label>" : "") +
      '<button class="btn small quiet" type="button" data-act="back"' + (i === 0 ? " disabled" : "") + ">Back</button>" +
      (last ? '<a class="btn small primary" href="#/t/' + t.id + '/check">Go to the check questions</a>'
            : '<button class="btn small primary" type="button" data-act="next"' + (blocked ? ' disabled title="Answer the question to continue"' : "") + ">Next</button>") +
      "</div></div>" + sources(t, "Want the original? Lecture " + t.lecture + ":");
    view.innerHTML = h;
    if (!quiet) speak(st.say);
  }

  /* ---------- check ---------- */
  function renderCheck(t) {
    var qs = items(t, "check"), s = T(t.id), nx = nextTopic(t);
    var answered = Object.keys(s.check).length, right = qs.filter(function (q, i) { return s.check[i] && s.check[i].ok; }).length;
    var h = crumb(t, "check") + tabs(t, "check") + "<h1>Check</h1><p class=\"lede\" style=\"margin-bottom:24px\">Answer each one, then read the explanation. Nothing here is graded.</p>";
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
    var h = crumb(t, stage) + tabs(t, stage) + "<h1>" + NAMES[stage] + '</h1><p class="lede" style="margin-bottom:24px">' + intro + '</p><div class="work"><ul class="plist" aria-label="Problems">' +
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
      '<button class="btn small quiet" type="button" data-act="resetcode">Reset code</button></div><div id="hints">' + hintsHTML(p, s) + '</div><div class="result" id="result" aria-live="polite">' +
      (s.solved[p.id] ? solvedHTML() : "") + "</div>" +
      (p.norun ? '<p class="muted" style="font-size:14.5px; margin-top:14px">' + esc(p.lang || "This language") + ' does not run in this app, so this problem is self-checked: write your answer, then compare it with the solution.</p>'
               : '<details class="reveal"><summary>Show the solution</summary>' + codeHTML(p.solution) + (p.explain ? '<p style="margin-top:10px">' + esc(p.explain) + "</p>" : "") + "</details>") + "</div></div>";
    view.innerHTML = h;
  }
  function hintsHTML(p, s) { return (p.hints || []).slice(0, s.hints[p.id] || 0).map(function (x, i) { return '<p class="hint"><b>Hint ' + (i + 1) + ".</b> " + esc(x) + "</p>"; }).join(""); }
  function solvedHTML() {
    var t = cur.t, s = T(t.id), list = items(t, cur.stage), nxp = list.filter(function (x) { return !s.solved[x.id] && x !== cur.p; })[0], nx = nextTopic(t);
    return '<p class="banner pass">' + (cur.p.norun ? "Marked as solved." : "Correct. All hidden tests passed.") + "</p>" + (cur.p.norun ? codeHTML(cur.p.solution) : "") + (cur.p.explain ? '<p style="margin-top:10px">' + esc(cur.p.explain) + "</p>" : "") +
      '<div class="row" style="margin-top:12px">' + (nxp ? '<a class="btn small primary" href="#/t/' + t.id + "/" + cur.stage + "/" + nxp.id + '">Next problem</a>' : "") +
      (cur.stage === "deepen" && has(t, "practice") ? '<a class="btn small" href="#/t/' + t.id + '/practice">More practice</a>' : "") +
      (!s.confident ? '<button class="btn small" type="button" data-act="confidentbtn">I feel confident with this topic</button>' : nx ? '<a class="btn small" href="#/t/' + nx.id + '">Next topic</a>' : "") + "</div>";
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
    if (!t) renderMap();
    else if (stage === "learn" && has(t, "learn")) renderLearn(t);
    else if (stage === "check" && has(t, "check")) renderCheck(t);
    else if ((stage === "deepen" || stage === "practice") && has(t, stage)) renderWork(t, stage, r[3]);
    else renderTopic(t);
    if (t) { S.last = "#/" + r.join("/"); save(); }
    progress();
    document.title = (t ? t.title + " · " : "") + "CS 61A · Saba Feilizadeh";
    if (!keepScroll) { window.scrollTo(0, 0); try { view.focus({ preventScroll: true }); } catch (e) {} }
  }
  function progress() {
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
    else if (act === "recheck" && t) { T(t.id).check = {}; save(); render(false); }
    else if (act === "reveal" && cur) {
      document.getElementById("result").innerHTML = revealHTML(cur.p);
    }
    else if (act === "selfsolve" && cur) { T(cur.t.id).solved[cur.p.id] = true; save(); progress(); var tk = view.querySelector('.plist a[aria-current] .tick'); if (tk) tk.classList.add("yes"); document.getElementById("result").innerHTML = solvedHTML(); }
    else if (act === "selfnot" && cur) { document.getElementById("result").innerHTML = ""; document.getElementById("editor").focus(); }
    else if (act === "run") execute("run");
    else if (act === "submit") execute("submit");
    else if (act === "hint" && cur) { var s = T(cur.t.id); s.hints[cur.p.id] = Math.min((s.hints[cur.p.id] || 0) + 1, cur.p.hints.length); save(); document.getElementById("hints").innerHTML = hintsHTML(cur.p, s); }
    else if (act === "resetcode" && cur) { delete S.code[cur.p.id]; save(); document.getElementById("editor").value = cur.p.starter; }
    else if (act === "confidentbtn" && cur) { T(cur.t.id).confident = true; save(); progress(); document.getElementById("result").innerHTML = solvedHTML(); }
  });
  view.addEventListener("change", function (e) {
    var act = e.target.getAttribute && e.target.getAttribute("data-act"), t = topicById(route()[1]);
    if (act === "confident" && t) { T(t.id).confident = e.target.checked; save(); render(true); }
    if (act === "narrate") { S.narrate = e.target.checked; save(); if (S.narrate && t) speak(L[t.id].steps[T(t.id).step].say); else hush(); }
  });
  view.addEventListener("submit", function (e) {
    var f = e.target, act = f.getAttribute("data-act");
    e.preventDefault();
    if (act === "typed") { var v = f.querySelector("input").value; if (v.trim()) answer(f.getAttribute("data-ctx"), +f.getAttribute("data-n"), v.trim()); }
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
    if (e.key === "ArrowRight") stepBy(1);
    if (e.key === "ArrowLeft") stepBy(-1);
  });
  window.addEventListener("pagehide", function () { hush(); save(); });

  render(false);
})();
