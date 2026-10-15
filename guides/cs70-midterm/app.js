/* CS 70 midterm guide. Reference reader + interactive self-test. Vanilla JS. */
(function () {
  "use strict";
  var D = window.CS70;
  if (!D) return;

  var NS = "cs70_mt_";   // storage namespace, distinct from cs61a_mt2_
  var store = {
    getJSON: function (k, d) { try { var v = localStorage.getItem(NS + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    setJSON: function (k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) {} },
    get: function (k, d) { try { var v = localStorage.getItem(NS + k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(NS + k, v); } catch (e) {} }
  };

  var content = document.getElementById("content");
  var topicNav = document.getElementById("topicNav");
  var sidebar = document.getElementById("sidebar");

  // Which course note each topic comes from (Fall 2026 numbering, eecs70.org)
  var NOTE_SOURCE = {
    "direct-proofs": "Notes 0–1", "prop-logic": "Note 2", "proof-tech": "Notes 2–3",
    "induction": "Note 4", "modular": "Note 5", "crt": "Note 6", "rsa": "Note 7",
    "polynomials": "Note 8", "secret-sharing": "Notes 8–9", "graphs": "Note 10",
    "graph-induction": "Note 10", "stable-matching": "Note 11"
  };
  function noteShort(id) { var s = NOTE_SOURCE[id]; return s ? s.replace(/Notes?\s/, "N") : ""; }

  // progress: { topicId: {best: n, total: m} }
  var progress = store.getJSON("progress", {});

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function norm(s) { return String(s).toLowerCase().replace(/\s+/g, "").replace(/[*·]/g, ""); }

  // ---- voiceover: turn note HTML (full of math symbols) into speakable English ----
  function speakify(html) {
    var s = String(html).replace(/<[^>]+>/g, " ");
    var subs = [
      [/∀/g, " for all "], [/∃/g, " there exists "], [/⟺|⇔/g, " if and only if "],
      [/⟹|⇒|=>/g, " implies "], [/≡/g, " is equivalent to "], [/≠/g, " not equal to "],
      [/≤/g, " at most "], [/≥/g, " at least "], [/∧/g, " and "], [/∨/g, " or "],
      [/¬/g, " not "], [/∈/g, " in "], [/∏/g, " the product of "], [/Σ/g, " the sum of "],
      [/√/g, " square root of "], [/≈/g, " approximately "], [/⁻¹/g, " inverse "],
      [/Δ/g, " delta "], [/·|×/g, " times "], [/≢/g, " is not equivalent to "],
      [/²/g, " squared "], [/³/g, " cubed "], [/ⁿ/g, " to the n "], [/ᵉ/g, " to the e "],
      [/ᵢ/g, " i "], [/ⱼ/g, " j "], [/ₖ/g, " k "], [/GF\(/g, " the field G F of "],
      [/K₅/g, " K five "], [/K₃,₃/g, " K three three "], [/\bKₙ\b/g, " K n "]
    ];
    subs.forEach(function (m) { s = s.replace(m[0], m[1]); });
    s = s.replace(/&amp;/g, " and ").replace(/&lt;/g, " less than ").replace(/&gt;/g, " greater than ").replace(/&quot;/g, '"');
    return s.replace(/\s+/g, " ").trim();
  }

  var speech = {
    on: false, btn: null,
    supported: function () { return ("speechSynthesis" in window) && ("SpeechSynthesisUtterance" in window); },
    setLabel: function () { if (this.btn) this.btn.textContent = this.on ? "■ Stop" : "▶ Listen"; },
    stop: function () { try { window.speechSynthesis.cancel(); } catch (e) {} this.on = false; this.setLabel(); },
    toggle: function (text, btn) {
      if (this.on && this.btn === btn) { this.stop(); return; }
      this.stop();
      this.btn = btn;
      if (!this.supported()) { btn.textContent = "Audio N/A"; btn.disabled = true; return; }
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 1; u.lang = "en-US";
      var self = this;
      u.onend = function () { self.on = false; self.setLabel(); };
      u.onerror = function () { self.on = false; self.setLabel(); };
      this.on = true; this.setLabel();
      try { window.speechSynthesis.speak(u); } catch (e) { this.on = false; this.setLabel(); }
    }
  };

  // ---- countdown ----
  (function () {
    try {
      var days = Math.ceil((new Date(D.meta.examDate) - new Date()) / 86400000);
      var el = document.getElementById("cd");
      if (el) el.textContent = days > 1 ? ("T minus " + days + " days") : (days === 1 ? "Tomorrow" : (days === 0 ? "Today" : "Exam passed"));
    } catch (e) {}
    var nl = document.getElementById("notesLink");
    if (nl) nl.href = D.meta.notesUrl;
  })();

  // ---- sidebar nav ----
  function topicDone(t) {
    if (store.getJSON("manualPass", {})[t.id]) return true;
    var p = progress[t.id];
    return p && p.total > 0 && p.best === p.total;
  }
  function buildNav() {
    topicNav.innerHTML = "";
    D.topics.forEach(function (t) {
      var a = document.createElement("a");
      a.className = "tnav" + (t.passed ? " is-passed" : "");
      a.href = "#" + t.id;
      a.dataset.id = t.id;
      var dotCls = "dot" + (t.passed ? " passed" : (topicDone(t) ? " done" : ""));
      var sn = noteShort(t.id);
      a.innerHTML = '<span class="' + dotCls + '"></span>' +
        '<span class="tlabel">' + esc(t.name) + '</span>' +
        (sn ? '<span class="tbadge note">' + esc(sn) + '</span>' : '');
      topicNav.appendChild(a);
    });
    updateSummary();
  }
  function updateSummary() {
    var n = D.topics.filter(function (t) { return !t.passed && topicDone(t); }).length;
    var tot = D.topics.filter(function (t) { return !t.passed; }).length;
    document.getElementById("passedCount").textContent = n + " / " + tot;
    // refresh dots
    document.querySelectorAll(".tnav").forEach(function (a) {
      var t = D.topics.find(function (x) { return x.id === a.dataset.id; });
      if (!t || t.passed) return;
      var dot = a.querySelector(".dot");
      dot.className = "dot" + (topicDone(t) ? " done" : "");
    });
  }

  // ---- render a topic ----
  function renderTopic(t) {
    var h = "";
    var src = NOTE_SOURCE[t.id];
    h += '<div class="topic-head"><h1>' + esc(t.name) + "</h1>";
    if (src) h += '<a class="pill note" href="' + esc(D.meta.notesUrl) + '" target="_blank" rel="noopener">📖 ' + esc(src) + "</a>";
    if (t.passed) h += '<span class="pill passed">already passed</span>';
    else {
      h += '<span class="pill' + (t.allOrNothing ? ' aon' : '') + '">' + esc(t.threshold) + "</span>";
      var mp = store.getJSON("manualPass", {})[t.id];
      h += '<button class="mark-btn' + (mp ? " on" : "") + '" id="markPass">' +
        (mp ? "✓ Marked passed" : "Mark passed") + "</button>";
    }
    h += "</div>";
    h += '<p class="topic-sub">' + (t.passed
      ? "You passed this on a quiz. Reference only, no need to re-attempt it Thursday."
      : "Read the notes, drill the worked examples, then take the self-test at the bottom.") + "</p>";

    // guided lesson launcher
    if (t.learn && t.learn.length) {
      var ldone = store.getJSON("learnDone", {})[t.id];
      h += '<button class="learn-launch" id="learnLaunch"><span class="ll-ic">◉</span>' +
        '<span class="ll-txt"><b>Guided lesson' + (ldone ? ' ✓' : '') + '</b>' +
        '<small>Learn it one step at a time, with a quick check at each stage before you move on</small></span>' +
        '<span class="ll-go">Start →</span></button>';
    }

    // notes
    if (t.note && t.note.length) {
      h += '<h2 class="sec">Notes ' + (src ? '<span class="sec-src">from ' + esc(src) + '</span>' : '') +
        '</h2><div class="note-cols">';
      t.note.forEach(function (s) {
        h += '<div class="note-block"><h3>' + esc(s.h) + "</h3><p>" + s.body + "</p></div>";
      });
      h += "</div>";
    }
    // formulas
    if (t.formulas && t.formulas.length) {
      h += '<h2 class="sec">Formulas</h2><div class="formula-grid">';
      t.formulas.forEach(function (f) {
        h += '<div class="fml"><span class="k">' + esc(f.k) + '</span><span class="v">' + esc(f.v) + "</span></div>";
      });
      h += "</div>";
    }
    // worked
    if (t.worked && t.worked.length) {
      h += '<h2 class="sec">Worked examples</h2>';
      t.worked.forEach(function (w) {
        h += '<div class="worked"><span class="wtag">' + esc(w.tag) + '</span>' +
          '<p class="wq">' + esc(w.q) + '</p><p class="wa">' + w.a + "</p></div>";
      });
    }
    // practice problems (original, this guide's own)
    var prac = (window.CS70.practice || {})[t.id];
    if (prac && prac.length) {
      h += '<h2 class="sec">Practice problems</h2>';
      h += '<p class="sub" style="margin:-6px 0 10px">Original problems in exam style. Try each on paper, then reveal the solution.</p>';
      prac.forEach(function (pr, pi) {
        h += '<div class="prac"><p class="prac-q">' + esc(pr.q) + '</p>' +
          '<button class="prac-btn" type="button" data-pi="' + pi + '">Show solution</button>' +
          '<div class="prac-sol" hidden>' + esc(pr.sol) + '</div></div>';
      });
    }
    // videos
    if (t.videos && t.videos.length) {
      h += '<h2 class="sec">Watch</h2><div class="vid-list">';
      t.videos.forEach(function (v) {
        h += '<a class="vid" href="' + esc(v.url) + '" target="_blank" rel="noopener">' +
          '<span class="vplay" aria-hidden="true">▶</span>' +
          '<span class="vmeta"><span class="vt">' + esc(v.t) + '</span>' +
          '<span class="vsub">' + esc(v.by) + ' · ' + esc(v.note) + '</span></span>' +
          '<span class="vgo">↗</span></a>';
      });
      h += "</div>";
    }
    // quiz
    if (t.quiz && t.quiz.length) {
      h += '<h2 class="sec">Self-test</h2><div id="quizMount"></div>';
    }
    h += '<footer class="inner-foot">CS 70 ' + esc(D.meta.term) + ' · ' + esc(D.meta.staff) +
      ' · built from the notes, policies, and official mock midterm · progress saves in this browser</footer>';
    content.innerHTML = h;
    if (t.quiz && t.quiz.length) mountQuiz(t);
    content.querySelectorAll(".prac-btn").forEach(function (bn) {
      bn.onclick = function () {
        var sol = bn.nextElementSibling, show = sol.hidden;
        sol.hidden = !show;
        bn.textContent = show ? "Hide solution" : "Show solution";
      };
    });
    addSectionAudio();
    var ll = document.getElementById("learnLaunch");
    if (ll) ll.onclick = function () { startLearn(t); };
    var mpb = document.getElementById("markPass");
    if (mpb) mpb.onclick = function () {
      var m = store.getJSON("manualPass", {});
      m[t.id] = !m[t.id];
      store.setJSON("manualPass", m);
      updateSummary();
      renderTopic(t);
    };
    content.scrollIntoView ? window.scrollTo(0, 0) : null;
  }

  // ---- per-section audio: add a Listen button to every section heading ----
  function addSectionAudio() {
    content.querySelectorAll("h2.sec").forEach(function (hh) {
      if (/self-test/i.test(hh.textContent)) return;        // quiz isn't read aloud
      if (hh.querySelector(".listen-btn")) return;
      var btn = document.createElement("button");
      btn.className = "listen-btn sec-listen";
      btn.type = "button";
      btn.textContent = "▶ Listen";
      hh.appendChild(btn);
      btn.onclick = function () {
        var parts = [], node = hh.nextElementSibling;
        while (node && !(node.tagName === "H2" && node.classList.contains("sec"))) {
          var clone = node.cloneNode(true);
          clone.querySelectorAll(".prac-sol[hidden],.listen-btn,button").forEach(function (x) { x.remove(); });
          parts.push(clone.textContent);
          node = node.nextElementSibling;
        }
        var head = hh.textContent.replace(/▶ Listen|■ Stop/g, "");
        speech.toggle(speakify(head + ". " + parts.join(". ")), btn);
      };
    });
  }

  // ---- Practice queue: round-robin across topics, click-through list ----
  function renderQueue() {
    var q = window.CS70.queue || [];
    var done = store.getJSON("queueDone", {});
    var mockE = "https://www.eecs70.org/resources/mt1/mock_midterm_fa26.pdf";
    var mockS = "https://www.eecs70.org/resources/mt1/mock_midterm_fa26_sol.pdf";
    var pdf = "https://www.eecs70.org/assets/pdf/";
    function discLabel(d) { return d.replace("dis", "Disc "); }
    var rounds = [
      { id: "r1", label: "Round 1 — Mock midterm", sub: "Current exam format. If you finish only one round, finish this one.",
        link: function (t) { return { url: mockE + "#page=" + t.mockPage, sol: mockS, what: "Mock midterm · " + t.name + " (p." + t.mockPage + ")" }; } },
      { id: "r2", label: "Round 2 — Homework", sub: "That week’s homework problems for each topic.",
        link: function (t) { return { url: pdf + t.hw + ".pdf", sol: pdf + t.hw + "-sol.pdf", what: t.hw.toUpperCase() + " · " + t.name }; } },
      { id: "r3", label: "Round 3 — Discussion worksheets", sub: "Section worksheets — fast, focused reps.",
        link: function (t) { return { url: pdf + t.disc + ".pdf", sol: pdf + t.disc + "-sol.pdf", what: discLabel(t.disc) + " · " + t.name }; } },
      { id: "r4", label: "Round 4 — This guide’s practice problems", sub: "My original problems on each topic page.",
        link: function (t) { return { url: "#" + t.id, sol: null, what: t.name + " · Practice problems" }; } }
    ];
    var h = '<div class="topic-head"><h1>Practice queue</h1></div>';
    h += '<p class="topic-sub">Work top to bottom. Each round covers all six topics once in priority order, so even if you stop early you’ve touched every topic. Tick items off as you go — it saves in your browser.</p>';
    rounds.forEach(function (r) {
      h += '<h2 class="sec">' + esc(r.label) + "</h2>";
      h += '<p class="sub" style="margin:-6px 0 10px">' + esc(r.sub) + "</p><div class=\"q-list\">";
      q.forEach(function (t) {
        var L = r.link(t), key = r.id + ":" + t.id, isDone = !!done[key];
        var ext = L.url.charAt(0) === "#" ? "" : ' target="_blank" rel="noopener"';
        h += '<div class="q-item' + (isDone ? " done" : "") + '" data-key="' + key + '">' +
          '<input type="checkbox"' + (isDone ? " checked" : "") + '>' +
          '<span class="q-main"><a href="' + esc(L.url) + '"' + ext + ">" + esc(L.what) + "</a>" +
          (L.sol ? ' <a class="q-sol" href="' + esc(L.sol) + '" target="_blank" rel="noopener">solution ↗</a>' : "") +
          "</span></div>";
      });
      h += "</div>";
    });
    h += '<h2 class="sec">Round 5 — Full timed past midterms</h2>';
    h += '<p class="sub" style="margin:-6px 0 10px">Older format (not one question per topic), but ideal for a full timed run. Do one start to finish in two hours.</p><div class="q-list">';
    [["Fall 2025", "midterm_fa25"], ["Spring 2025", "midterm_sp25"], ["Fall 2024", "midterm_fa24"]].forEach(function (e) {
      var base = "https://www.eecs70.org/resources/mt1/" + e[1];
      h += '<div class="q-item" data-key="r5:' + e[1] + '"><input type="checkbox">' +
        '<span class="q-main"><a href="' + base + '.pdf" target="_blank" rel="noopener">' + esc(e[0]) + ' midterm</a>' +
        ' <a class="q-sol" href="' + base + '_sol.pdf" target="_blank" rel="noopener">solution ↗</a></span></div>';
    });
    h += "</div>";
    h += '<div class="trap"><b>Use the solutions to check, not to read first.</b> Try each on paper before opening its solution — the struggle is where the learning happens. All links go to the official PDFs at eecs70.org.</div>';
    content.innerHTML = h;
    content.querySelectorAll(".q-item").forEach(function (it) {
      var box = it.querySelector("input"), key = it.dataset.key;
      box.addEventListener("change", function () {
        var d = store.getJSON("queueDone", {});
        if (box.checked) d[key] = true; else delete d[key];
        store.setJSON("queueDone", d);
        it.classList.toggle("done", box.checked);
      });
    });
    addSectionAudio();
    window.scrollTo(0, 0);
  }

  // ---- Past exams & official practice (links, not copies) ----
  function renderExams() {
    var h = '<div class="topic-head"><h1>Past exams &amp; practice</h1></div>';
    h += '<p class="topic-sub">Links to the course’s own public materials. Your exam is Midterm 1, so these are past Midterm 1 papers — open them at the source and work them timed. The format changed this semester, so expect some differences, but the topic questions are excellent practice.</p>';
    h += '<h2 class="sec">Past midterms</h2><div class="exam-list">';
    (window.CS70.exams || []).forEach(function (e) {
      h += '<div class="exam-row"><span class="exam-sem">' + esc(e.sem) + '</span>' +
        '<span class="exam-links"><a href="' + esc(e.exam) + '" target="_blank" rel="noopener">Exam ↗</a>' +
        '<a href="' + esc(e.sol) + '" target="_blank" rel="noopener">Solutions ↗</a></span></div>';
    });
    h += '</div><h2 class="sec">Course resources</h2><div class="exam-list">';
    (window.CS70.resourceLinks || []).forEach(function (r) {
      h += '<div class="exam-row"><span class="exam-sem">' + esc(r.label) + '</span>' +
        '<span class="exam-links"><a href="' + esc(r.url) + '" target="_blank" rel="noopener">Open ↗</a></span></div>';
    });
    h += '</div>';
    h += '<div class="trap"><b>Why links instead of copies:</b> these are the staff’s own problems, so the right way to use them is at eecs70.org. The Practice problems inside each topic are written for this guide, so those are yours to work directly.</div>';
    content.innerHTML = h;
    addSectionAudio();
    window.scrollTo(0, 0);
  }

  // ---- Guided lesson: teach a step, check it, require correct to advance ----
  function startLearn(t) {
    speech.stop();
    var steps = t.learn, i = 0;

    function render() {
      var step = steps[i];
      var html = '<div class="learn-head">' +
        '<button class="qn-btn" id="learnBack">← Back to ' + esc(t.name) + '</button>' +
        '<span class="learn-prog">Step ' + (i + 1) + " of " + steps.length + "</span></div>";
      html += '<div class="learn-card"><div class="learn-teach">' + step.teach +
        ' <button class="listen-btn sm" id="learnListen">▶ Listen</button></div>';
      if (step.check) html += '<div class="learn-check" id="learnCheck"></div>';
      else html += '<div class="quiz-nav"><span></span>' +
        (i < steps.length - 1 ? '<button class="qn-btn primary" id="learnNext">Continue →</button>'
          : '<button class="qn-btn primary" id="learnDone">Finish lesson</button>') + "</div>";
      html += "</div>";
      content.innerHTML = html;
      wireCommon();
      if (step.check) renderCheck(step.check);
      window.scrollTo(0, 0);
    }

    function wireCommon() {
      document.getElementById("learnBack").onclick = function () { speech.stop(); renderTopic(t); };
      var nx = document.getElementById("learnNext"); if (nx) nx.onclick = function () { speech.stop(); i++; render(); };
      var dn = document.getElementById("learnDone"); if (dn) dn.onclick = finish;
      var ls = document.getElementById("learnListen");
      if (ls) ls.onclick = function () { speech.toggle(speakify(steps[i].teach), ls); };
    }

    function renderCheck(c) {
      var mount = document.getElementById("learnCheck");
      var html = '<p class="qprompt">' + esc(c.q) + "</p>";
      if (c.type === "sa") {
        html += '<div class="sa-row"><input class="sa-input" id="lsa" placeholder="type your answer">' +
          '<button class="sa-check" id="lsaBtn">Check</button></div>';
      } else {
        html += '<div class="choices">';
        c.choices.forEach(function (ch, ci) {
          html += '<button class="choice" data-ci="' + ci + '"><span class="ck">' +
            String.fromCharCode(65 + ci) + '</span><span>' + esc(ch) + "</span></button>";
        });
        html += "</div>";
      }
      html += '<div class="feedback" id="lfb"></div><div class="quiz-nav"><span></span><span id="lcont"></span></div>';
      mount.innerHTML = html;

      function pass() {
        var fb = document.getElementById("lfb");
        fb.className = "feedback show ok";
        fb.innerHTML = '<span class="verdict">Correct.</span>' + esc(c.why || "");
        document.getElementById("lcont").innerHTML = (i < steps.length - 1)
          ? '<button class="qn-btn primary" id="lnext2">Continue →</button>'
          : '<button class="qn-btn primary" id="ldone2">Finish lesson</button>';
        var n2 = document.getElementById("lnext2"); if (n2) n2.onclick = function () { speech.stop(); i++; render(); };
        var d2 = document.getElementById("ldone2"); if (d2) d2.onclick = finish;
      }
      function fail() {
        var fb = document.getElementById("lfb");
        fb.className = "feedback show no";
        fb.innerHTML = '<span class="verdict">Not quite.</span>Give it another look, then try again.';
      }
      if (c.type === "sa") {
        var inp = document.getElementById("lsa"), b = document.getElementById("lsaBtn");
        function sub() {
          var g = inp.value.trim(); if (!g) return;
          var ok = (c.accept || []).some(function (x) { return norm(x) === norm(g); });
          if (ok) { inp.disabled = true; b.disabled = true; pass(); } else fail();
        }
        b.onclick = sub; inp.onkeydown = function (e) { if (e.key === "Enter") sub(); };
      } else {
        mount.querySelectorAll(".choice").forEach(function (bn) {
          bn.onclick = function () {
            var ci = +bn.dataset.ci;
            if (ci === c.answer) {
              mount.querySelectorAll(".choice").forEach(function (x) {
                x.disabled = true; if (+x.dataset.ci === c.answer) x.classList.add("correct");
              });
              pass();
            } else { bn.classList.add("wrong"); fail(); }
          };
        });
      }
    }

    function finish() {
      speech.stop();
      var ld = store.getJSON("learnDone", {}); ld[t.id] = true; store.setJSON("learnDone", ld);
      content.innerHTML = '<div class="learn-card learn-finish"><div class="big">✓</div>' +
        '<h2 style="margin:0 0 6px">Lesson complete</h2>' +
        '<p class="topic-sub" style="margin:0 0 18px">You worked through ' + esc(t.name) +
        ' step by step. Now lock it in with the self-test.</p>' +
        '<div class="quiz-nav" style="justify-content:center;gap:10px">' +
        '<button class="qn-btn" id="lagain">Review lesson again</button>' +
        '<button class="qn-btn primary" id="toTopic">Back to topic &amp; self-test</button></div></div>';
      document.getElementById("lagain").onclick = function () { i = 0; render(); };
      document.getElementById("toTopic").onclick = function () { renderTopic(t); };
      updateSummary();
    }

    render();
  }

  // ---- quiz engine ----
  function mountQuiz(t) {
    var mount = document.getElementById("quizMount");
    var i = 0, correct = 0, answered = {};
    var qs = t.quiz;

    function render() {
      var q = qs[i];
      var html = '<div class="quiz-wrap">';
      html += '<div class="quiz-top"><span class="q-counter">Question ' + (i + 1) + ' of ' + qs.length + '</span>' +
        '<span class="qscore">Score <b>' + correct + "</b> / " + qs.length + "</span></div>";
      html += '<p class="qprompt">' + esc(q.q) + "</p>";

      var a = answered[i];
      if (q.type === "sa") {
        html += '<div class="sa-row"><input class="sa-input" id="saIn" placeholder="type your answer" ' +
          (a ? 'disabled value="' + esc(a.given) + '"' : '') + '>' +
          (a ? '' : '<button class="sa-check" id="saBtn">Check</button>') + "</div>";
      } else {
        html += '<div class="choices">';
        q.choices.forEach(function (c, ci) {
          var cls = "choice";
          if (a) {
            if (ci === q.answer) cls += " correct";
            else if (ci === a.given) cls += " wrong";
            else cls += " dim";
          }
          html += '<button class="' + cls + '" data-ci="' + ci + '"' + (a ? " disabled" : "") + '>' +
            '<span class="ck">' + String.fromCharCode(65 + ci) + '</span><span>' + esc(c) + "</span></button>";
        });
        html += "</div>";
      }

      html += '<div class="feedback' + (a ? " show " + (a.ok ? "ok" : "no") : "") + '" id="fb">';
      if (a) {
        html += '<span class="verdict">' + (a.ok ? "Correct." : "Not quite.") + "</span>" + esc(q.why || "");
        if (!a.ok && q.answer && q.type === "sa") html += '<span class="ans">Answer: ' + esc(q.answer) + "</span>";
      }
      html += "</div>";

      html += '<div class="quiz-nav">' +
        '<button class="qn-btn" id="prevBtn"' + (i === 0 ? " disabled" : "") + '>← Prev</button>';
      if (i < qs.length - 1) html += '<button class="qn-btn primary" id="nextBtn">Next →</button>';
      else html += '<button class="qn-btn primary" id="doneBtn">See result</button>';
      html += "</div></div>";

      mount.innerHTML = html;
      wire(q);
    }

    function wire(q) {
      var prev = document.getElementById("prevBtn");
      if (prev) prev.onclick = function () { if (i > 0) { i--; render(); } };
      var next = document.getElementById("nextBtn");
      if (next) next.onclick = function () { if (i < qs.length - 1) { i++; render(); } };
      var done = document.getElementById("doneBtn");
      if (done) done.onclick = finish;

      if (answered[i]) return; // already locked

      if (q.type === "sa") {
        var btn = document.getElementById("saBtn"), inp = document.getElementById("saIn");
        function submit() {
          var given = inp.value.trim();
          if (!given) return;
          var ok = (q.accept || []).some(function (x) { return norm(x) === norm(given); });
          answered[i] = { given: given, ok: ok };
          if (ok) correct++;
          saveBest();
          render();
        }
        if (btn) btn.onclick = submit;
        if (inp) inp.onkeydown = function (e) { if (e.key === "Enter") submit(); };
        if (inp) inp.focus();
      } else {
        mount.querySelectorAll(".choice").forEach(function (b) {
          b.onclick = function () {
            var ci = +b.dataset.ci;
            var ok = ci === q.answer;
            answered[i] = { given: ci, ok: ok };
            if (ok) correct++;
            saveBest();
            render();
          };
        });
      }
    }

    function saveBest() {
      var ansCount = Object.keys(answered).length;
      if (ansCount === qs.length) {
        var prevBest = (progress[t.id] && progress[t.id].best) || 0;
        progress[t.id] = { best: Math.max(prevBest, correct), total: qs.length };
        store.setJSON("progress", progress);
        updateSummary();
      }
    }

    function finish() {
      saveBest();
      var pct = Math.round((correct / qs.length) * 100);
      var passLine = t.allOrNothing
        ? (correct === qs.length ? "Clean sweep. This all-or-nothing topic is ready." : "This topic needs every question right. Review the misses and run it again.")
        : (correct >= Math.ceil(qs.length * 0.7) ? "Solid. You'd likely pass this topic." : "Shaky. Re-read the notes and retry.");
      mount.innerHTML = '<div class="quiz-wrap"><div class="quiz-done">' +
        '<div class="big">' + correct + " / " + qs.length + "</div>" +
        '<p class="msg">' + esc(passLine) + "</p>" +
        '<button class="qn-btn primary" id="retry">Retry quiz</button></div></div>';
      document.getElementById("retry").onclick = function () {
        i = 0; correct = 0; answered = {}; render();
      };
    }

    render();
  }

  // ---- special views ----
  function renderSynthesis() {
    var h = '<div class="topic-head"><h1>Synthesis questions</h1>' +
      '<span class="pill aon">2 on the midterm · Pass/No Pass</span></div>';
    h += '<p class="topic-sub">These combine topics. On the mock both were CRT / secret-sharing flavored. Do them first while fresh, and always show the reasoning chain.</p>';
    h += '<p class="sec-src" style="margin:0 0 8px">Draws on: CRT (Note 6) and Secret Sharing &amp; ECCs (Notes 8–9)</p>';
    D.synthesis.forEach(function (s) {
      h += '<div class="worked"><span class="wtag">' + esc(s.tag) + '</span>' +
        '<p class="wq">' + esc(s.q) + '</p><p class="wa">' + s.a + "</p></div>";
      h += '<div class="trap"><b>Takeaway:</b> ' + esc(s.lesson) + "</div>";
    });
    content.innerHTML = h;
    addSectionAudio();
    window.scrollTo(0, 0);
  }

  function renderCheat() {
    var h = '<div class="topic-head"><h1>Complete cheat sheet</h1></div>';
    h += '<p class="topic-sub">The formula <i>and</i> how to run it, for every midterm topic (synthesis can pull from any of them). Recipes first for the methods people blank on, then a quick-reference grid, then synthesis strategy.</p>';
    var groups = [
      ["Propositional logic · N2", [
        "P⟹Q ≡ ¬P∨Q; false only at T⟹F; vacuously true when P false",
        "contrapositive ¬Q⟹¬P ≡ P⟹Q; converse Q⟹P ≢",
        "¬(P⟹Q) ≡ P∧¬Q",
        "De Morgan: ¬(P∧Q)≡¬P∨¬Q; ¬(P∨Q)≡¬P∧¬Q",
        "¬∀x P ≡ ∃x ¬P; ¬∃x P ≡ ∀x ¬P; ∀x∃y ≢ ∃y∀x"
      ]],
      ["Proofs & techniques · N0–3", [
        "odd n=2k+1, even n=2k, a|b ⇔ b=ka",
        "direct: assume P, expand defs, chain to Q",
        "contrapositive when ¬Q is the concrete start",
        "contradiction: assume ¬P → R∧¬R; use for ‘no such’ / uniqueness",
        "uniqueness: existence + (two solutions ⇒ equal)",
        "well-ordering: nonempty S⊆ℕ has a least element"
      ]],
      ["Induction · N4", [
        "base, IH P(k), step P(k+1)",
        "strong: assume P(1)…P(k); use when step reaches further back",
        "tools: strengthen the hypothesis, add base cases",
        "game proofs: induct on state size, force a losing position to opponent"
      ]],
      ["Modular arithmetic · N5", [
        "a≡b (mod m) ⇔ m|(a−b); + and × respect ≡",
        "a⁻¹ exists mod m ⇔ gcd(a,m)=1 (extended Euclid)",
        "solve ax≡c: x≡a⁻¹c; reduce base first (e.g. 67≡−1 mod 68)"
      ]],
      ["Euclid, FLT, CRT · N6", [
        "ext Euclid: ax+by=gcd(a,b)",
        "FLT: p prime, a≢0: a^(p−1)≡1 (mod p); a^p≡a for all a",
        "CRT: pairwise-coprime nᵢ, N=∏nᵢ ⇒ unique x mod N",
        "x=Σ aᵢuᵢ, uᵢ=(N/nᵢ)[(N/nᵢ)⁻¹ mod nᵢ]",
        "ℤ_N ≅ ℤ_{n₁}×…×ℤ_{nₖ}"
      ]],
      ["RSA · N7", [
        "N=pq, e coprime to (p−1)(q−1), d≡e⁻¹ mod (p−1)(q−1)",
        "E(x)=xᵉ mod N, D(y)=y^d mod N",
        "correctness: x^(ed)≡x via FLT on p and q, stitched by CRT",
        "e changing by a multiple of (p−1)(q−1) keeps d valid",
        "security = factoring N is hard"
      ]],
      ["Polynomials over GF(p) · N8", [
        "Prop 1: deg d ⇒ ≤ d roots; deg(fg)=deg f+deg g",
        "Prop 2: d+1 distinct points ⇒ unique deg≤d poly",
        "Lagrange: Δᵢ=∏(x−xⱼ)/∏(xᵢ−xⱼ); p=Σ yᵢΔᵢ",
        "counting: r points, deg≤d ⇒ p^(d+1−r) polys through them",
        "xᵖ≡x (FLT) drops exponents by p−1; prime p needed or props break"
      ]],
      ["Secret sharing & ECC · N9", [
        "k-of-n: deg k−1, secret P(0), prime q>n,s; k−1 shares ⇒ 0 info",
        "erasure: send n+k, recover from any n",
        "general errors: send n+2k, recover from n+k correct",
        "Berlekamp-Welch: E deg k, Q=PE deg n+k−1, solve n+2k eqns, P=Q/E",
        "roots of E = error locations"
      ]],
      ["Graphs · N10", [
        "Σ deg = 2|E|; # odd-degree vertices is even",
        "Kₙ: n(n−1)/2 edges, deg n−1; tree: connected acyclic, n−1 edges",
        "Eulerian tour ⇔ connected + all degrees even",
        "Euler planar: v+f=e+2; e≤3v−6 (triangle-free 2v−4)",
        "non-planar: K₅, K₃,₃; bipartite ⇔ no odd cycle",
        "n-cube: 2ⁿ verts, deg n, n·2ⁿ⁻¹ edges, diam n, path=differing bits"
      ]],
      ["Graph induction · N10", [
        "induct on edges: remove 1 edge → two degrees ±1 (clean)",
        "or on vertices (strong induction; remove a leaf)"
      ]],
      ["Stable matching · N11", [
        "rogue pair = unmatched J,C each prefer the other; stable = none",
        "propose-reject terminates, gives a stable matching",
        "proposer-optimal, receiver-pessimal",
        "both proposing orders match ⇒ exactly one stable matching"
      ]]
    ];
    // how-to recipes (formula + the steps to run it)
    var recipes = [
      { name: "Modular inverse (extended Euclid)", note: "N5", use: "Find a⁻¹ mod m (exists iff gcd(a,m)=1).",
        steps: ["Run extended Euclid on (m, a) until the remainder is 1.", "Back-substitute to write 1 = x·m + y·a.", "Then a⁻¹ ≡ y (mod m); reduce into {0,…,m−1}."],
        ex: "3⁻¹ mod 7: 1 = 7 − 2·3, so y=−2 ≡ 5. Check 3·5=15≡1. ✓" },
      { name: "Solve a system with CRT", note: "N6", use: "x ≡ aᵢ (mod nᵢ) with pairwise-coprime moduli.",
        steps: ["N = n₁·n₂·…", "For each i: bᵢ = N/nᵢ; find bᵢ⁻¹ mod nᵢ; uᵢ = bᵢ·(bᵢ⁻¹ mod nᵢ).", "x = Σ aᵢuᵢ (mod N); reduce for the smallest answer."],
        ex: "x≡2(mod3), 3(mod5): N=15; u₁=5·2=10, u₂=3·2=6; x=2·10+3·6=38≡8." },
      { name: "RSA keys / encrypt / decrypt", note: "N7", use: "Build keys and check correctness.",
        steps: ["N = pq, φ = (p−1)(q−1).", "Private d = e⁻¹ mod φ (extended Euclid).", "Encrypt E(x)=xᵉ mod N; decrypt y^d mod N.", "Still correct iff e·d ≡ 1 (mod φ)."],
        ex: "p=17, q=5, e=23: N=85, φ=64, d = 23⁻¹ mod 64 = 39." },
      { name: "Lagrange interpolation", note: "N8", use: "Unique deg≤d poly through d+1 points over GF(p) (or just P(0)).",
        steps: ["For each point i: Δᵢ(x) = ∏ⱼ≠ᵢ(x−xⱼ) ÷ ∏ⱼ≠ᵢ(xᵢ−xⱼ). The denominator is a constant — invert it mod p.", "p(x) = Σ yᵢΔᵢ(x). Skip any point with yᵢ=0.", "Only need the secret P(0)? plug x=0 into each Δᵢ, then combine."],
        ex: "Through (1,3),(2,5) over GF(7): slope (5−3)/(2−1)=2, so p(x)=2x+1." },
      { name: "Shrink a huge exponent (FLT)", note: "N6/8", use: "Reduce x^(big) over GF(p).",
        steps: ["Replace every xᵖ by x → exponent drops by (p−1); repeat until exponent < p.", "Reduce coefficients mod p too."],
        ex: "GF(13): x²⁶ → x² (drop 12 twice); 70 ≡ 5." },
      { name: "Secret sharing (build + recover)", note: "N9", use: "Share s so any k of n recover it.",
        steps: ["Pick a prime q > n and > s.", "Random degree-(k−1) poly P with P(0)=s; give person i the point P(i).", "Recover: any k people Lagrange-interpolate P, then read off P(0).", "k−1 people learn nothing — every secret stays equally likely."],
        ex: "3-of-5: degree-2 poly, secret at P(0), hand out P(1)…P(5)." },
      { name: "Berlekamp-Welch (decode k errors)", note: "N9", use: "Received points, some corrupted, you don’t know which. Message length n, up to k errors (so n+2k points were sent).",
        steps: ["Set up two unknown polynomials. Error-locator E(x) = xᵏ + bₖ₋₁x^(k−1) + … + b₀ (degree k, leading coeff 1). Q(x) = P·E = a_(n+k−1)x^(n+k−1) + … + a₀ (degree n+k−1). Unknowns: the k b’s and the n+k a’s = n+2k total.",
          "Write one equation per received point (i, rᵢ): Q(i) = rᵢ·E(i). That’s n+2k linear equations, all mod p.",
          "Solve the n+2k × n+2k linear system for every a and b.",
          "Recover the message: P(x) = Q(x) ÷ E(x) (it divides evenly).",
          "Error positions = the roots of E(x) (where E(i)=0)."],
        ex: "GF(7), n=2, k=1 → 4 points. E=x+b₀, Q=a₂x²+a₁x+a₀ (4 unknowns). Four equations Q(i)=rᵢ(i+b₀); solve, then P=Q/E, and the root of E is the bad position." },
      { name: "Euler’s formula", note: "N10", use: "Connected planar graph: v + f = e + 2. Given any two, solve the third.",
        steps: ["Plug in what you know, solve for the missing one.", "Non-planar check: if e > 3v−6 (or e > 2v−4 when triangle-free), it can’t be planar."],
        ex: "v=10, e=15 → f = e+2−v = 7." },
      { name: "Propose-reject (stable matching)", note: "N11", use: "Find a stable matching by hand.",
        steps: ["Each unmatched proposer proposes to the next name on its list.", "Each receiver keeps its best offer so far and rejects the rest.", "Repeat until everyone is matched.", "Jobs proposing → job-optimal, candidate-pessimal (and vice-versa)."],
        ex: "Both jobs prefer 1>2, both candidates prefer A>B → (A,1),(B,2)." }
    ];
    h += '<h2 class="sec">How to use each method</h2>';
    h += '<p class="sub" style="margin:-6px 0 12px">The formula plus the steps to actually run it — the ones that are easy to blank on under time.</p>';
    recipes.forEach(function (r) {
      h += '<div class="recipe"><div class="recipe-head"><span class="recipe-name">' + esc(r.name) + '</span><span class="recipe-note">' + esc(r.note) + "</span></div>";
      if (r.use) h += '<p class="recipe-use">' + esc(r.use) + "</p>";
      h += '<ol class="recipe-steps">';
      r.steps.forEach(function (s) { h += "<li>" + esc(s) + "</li>"; });
      h += "</ol>";
      if (r.ex) h += '<div class="recipe-ex"><b>e.g.</b> ' + esc(r.ex) + "</div>";
      h += "</div>";
    });
    h += '<h2 class="sec">Quick reference</h2>';
    h += '<div class="note-cols">';
    groups.forEach(function (g) {
      h += '<div class="note-block"><h3>' + esc(g[0]) + "</h3><ul style='margin:4px 0 0;padding-left:18px'>";
      g[1].forEach(function (li) { h += "<li style='font-size:13.5px;margin:3px 0'>" + esc(li) + "</li>"; });
      h += "</ul></div>";
    });
    h += "</div>";

    // synthesis strategy section
    h += '<h2 class="sec">Synthesis — when topics mix</h2>';
    h += '<p class="sub" style="margin:-6px 0 12px">Synthesis questions combine topics or dig a new consequence out of a definition. These are the bridges and the attack plan.</p>';
    h += '<div class="note-block"><h3>The bridges (what connects to what)</h3><ul style="margin:4px 0 0;padding-left:18px;font-size:14px">' +
      '<li><b>Modular arithmetic</b> is the floor under CRT, RSA, and polynomials over GF(p). A number-theory question and a polynomial question are often the same move in different clothes.</li>' +
      '<li><b>Polynomials over GF(p)</b> are the floor under secret sharing and error-correcting codes. Property 1 and Property 2 do the heavy lifting in all three.</li>' +
      '<li><b>Induction + proof techniques</b> are tools, not topics — a synthesis question can ask you to <i>prove</i> a fact that lives in any other area.</li>' +
      '<li><b>Counting</b> rides along: polynomial counting p^(d+1−r), the handshake sum, error-tolerance counts.</li></ul></div>';
    h += '<div class="note-block"><h3>Attack plan</h3><ol style="margin:4px 0 0;padding-left:20px;font-size:14px">' +
      '<li><b>Name the topics.</b> Scan for keywords (mod, degree, points, shares, errors, edges, stable) and list every area in play before writing.</li>' +
      '<li><b>Reduce to a uniqueness theorem.</b> “How many solutions / polynomials?” → CRT (unique mod N) or Property 2 (unique deg≤d). Then count what’s missing: each missing point multiplies by p; lifting a CRT solution to a bigger modulus multiplies by the factor.</li>' +
      '<li><b>Peel layered error correction.</b> Do the tolerance one layer at a time (general errors need n+2k, so a degree-d poly on m points tolerates ⌊(m−(d+1))/2⌋ errors), then multiply or chain across layers.</li>' +
      '<li><b>Dig into the definition.</b> If it asks for something “new,” write the formal definition and push it algebraically until the new fact falls out — don’t look for a memorized result.</li>' +
      '<li><b>Scale / substitute tricks.</b> A system that looks new is often the old one scaled: divide out a common factor (cx≡ca mod cp → x≡a mod p) to reveal a known structure, then count the lifts.</li>' +
      '<li><b>Show the chain.</b> Synthesis is Pass/No Pass with justification — the reasoning earns the pass, not the final number.</li></ol></div>';
    h += '<div class="note-block"><h3>Combinations seen on past exams</h3><ul style="margin:4px 0 0;padding-left:18px;font-size:14px">' +
      '<li><b>CRT + scaling:</b> scaled congruences collapse to the original CRT system; answer = number of lifts to the larger modulus.</li>' +
      '<li><b>Nested secret sharing + ECC:</b> run Berlekamp-Welch per sub-group, then at the top level; multiply the per-layer rogue/error counts.</li>' +
      '<li><b>Polynomials + FLT:</b> reduce big exponents with xᵖ≡x, then interpolate or count roots.</li>' +
      '<li><b>Graphs + induction + counting:</b> prove a degree/edge/face identity by induction, or count structures with the handshake and Euler’s formula.</li>' +
      '<li><b>Proofs over number theory:</b> prove a divisibility or modular claim by contradiction or induction.</li></ul></div>';

    h += '<div class="trap"><b>Copy by hand, from your gaps.</b> This is the full map; your 8.5×11 sheet should be the pieces <i>you</i> forget. The synthesis bridges and the “reduce to a uniqueness theorem” move are the highest-value things to have on it.</div>';
    content.innerHTML = h;
    addSectionAudio();
    window.scrollTo(0, 0);
  }

  function renderPlan() {
    var h = '<div class="topic-head"><h1>Study plan &amp; exam strategy</h1></div>';
    h += '<p class="topic-sub">You have passed 7 of 12 discrete topics, so the midterm is just 5 topics plus 2 synthesis questions. With 5 topics (~75 min) and 2 synthesis (~40 min) that’s ~115 min of 120 — it now fits, barely. Front-load the easy locks, give the all-or-nothing topics the cleanest prep.</p>';
    h += '<h2 class="sec">Exam-time strategy</h2><ol>' +
      '<li><b>First 2 min:</b> cross off your 7 passed topics on their checklist, circle your 5 targets.</li>' +
      '<li><b>Synthesis first (~40 min):</b> separate weight, both secret-sharing/CRT flavored, do them while fresh.</li>' +
      '<li><b>Topics confidence-first (~75 min):</b> Graph Induction → Proof Techniques → Polynomials → Secret Sharing → Stable Matching.</li>' +
      '<li><b>Pass/No Pass means finish what you start.</b> One complete correct topic beats three half-done ones.</li>' +
      '<li><b>Last 5 min:</b> every T/F bubble filled, every answer inside its box.</li></ol>';
    h += '<h2 class="sec">4-day plan</h2><div class="plan-grid">';
    var days = [
      ["Now", "Easy lock + start cheat sheet", ["Graph Induction is your fastest lock — do its guided lesson and self-test first.", "Begin your handwritten cheat sheet."]],
      ["Monday", "All-or-nothing topics", ["Proof Techniques (2/2) and Polynomials (3/3).", "Do the Lagrange-over-GF(11) example by hand."]],
      ["Tuesday", "Heaviest day", ["Secret Sharing & ECCs plus both synthesis questions.", "Work Rogue Delegates slowly."]],
      ["Wednesday", "New topic + timed run", ["Learn Stable Matching.", "Take a past midterm under exam conditions, finalize cheat sheet."]],
      ["Thursday", "Taper", ["Review cheat sheet only, no new material.", "Eat before 7pm. Room: Dwinelle 155."]]
    ];
    days.forEach(function (d) {
      h += '<div class="day"><span class="d">' + esc(d[0]) + '</span><div class="t">' + esc(d[1]) + "</div><ul>";
      d[2].forEach(function (li) { h += "<li>" + esc(li) + "</li>"; });
      h += "</ul></div>";
    });
    h += "</div>";
    content.innerHTML = h;
    addSectionAudio();
    window.scrollTo(0, 0);
  }

  // ---- routing ----
  function setActive(id) {
    document.querySelectorAll(".tnav").forEach(function (a) { a.classList.toggle("active", a.dataset.id === id); });
  }
  function route() {
    var hash = (location.hash || "").replace("#", "");
    closeMenu();
    speech.stop();
    if (hash === "synthesis") { setActive(""); return renderSynthesis(); }
    if (hash === "queue") { setActive(""); return renderQueue(); }
    if (hash === "exams") { setActive(""); return renderExams(); }
    if (hash === "cheatsheet") { setActive(""); return renderCheat(); }
    if (hash === "plan" || !hash) { setActive(""); return renderPlan(); }
    var t = D.topics.find(function (x) { return x.id === hash; });
    if (t) { setActive(t.id); renderTopic(t); }
    else { setActive(""); renderPlan(); }
  }
  window.addEventListener("hashchange", route);

  // ---- mobile menu ----
  var scrim;
  function openMenu() { sidebar.classList.add("open"); if (scrim) scrim.classList.add("show"); }
  function closeMenu() { sidebar.classList.remove("open"); if (scrim) scrim.classList.remove("show"); }
  (function () {
    var btn = document.getElementById("menuBtn");
    scrim = document.createElement("div"); scrim.className = "scrim";
    document.body.appendChild(scrim);
    scrim.onclick = closeMenu;
    if (btn) btn.onclick = openMenu;
  })();

  // theme toggle is handled site-wide by assets/js/theme.js

  buildNav();
  route();
})();
