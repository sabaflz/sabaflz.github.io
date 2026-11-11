/* CS 70 Quiz 9 guide. Reference reader + interactive self-test. Vanilla JS. */
(function () {
  "use strict";
  var D = window.CS70;
  if (!D) return;

  var NS = "cs70_q9_";   // storage namespace, distinct from the other guides
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
    "rv-distributions": "Note 19", "common-distributions": "Notes 19-20", "poisson": "Note 20",
    "expectation": "Note 19", "linearity": "Note 20", "joint-independence": "Note 20"
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
      ? "Already solid. Reference only, no need to re-attempt it."
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
      ' · built from Notes 19 and 20 · progress saves in this browser</footer>';
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

  // ---- Practice queue: a short, ordered plan of what to work ----
  function renderQueue() {
    var q = window.CS70.queue || [];
    var done = store.getJSON("queueDone", {});
    var pdf = "https://www.eecs70.org/assets/pdf/";
    var site = "https://www.eecs70.org/";
    function item(key, url, label, sol) {
      var isDone = !!done[key];
      var ext = url.charAt(0) === "#" ? "" : ' target="_blank" rel="noopener"';
      return '<div class="q-item' + (isDone ? " done" : "") + '" data-key="' + key + '">' +
        '<input type="checkbox"' + (isDone ? " checked" : "") + '>' +
        '<span class="q-main"><a href="' + esc(url) + '"' + ext + ">" + esc(label) + "</a>" +
        (sol ? ' <a class="q-sol" href="' + esc(sol) + '" target="_blank" rel="noopener">solution ↗</a>' : "") +
        "</span></div>";
    }
    var h = '<div class="topic-head"><h1>Practice queue</h1></div>';
    h += '<p class="topic-sub">A short, ordered plan for the days before Friday. Work top to bottom and tick items off as you go, it saves in your browser. Problem sets first, then this guide’s own problems, and read the notes whenever a topic feels shaky.</p>';

    h += '<h2 class="sec">This week’s problem sets</h2>';
    h += '<p class="sub" style="margin:-6px 0 10px">The homework and discussion covering random variables, distributions, and expectation.</p><div class="q-list">';
    h += item("hw10", pdf + "hw10.pdf", "Homework 10", pdf + "hw10-sol.pdf");
    h += item("dis10", pdf + "dis10.pdf", "Discussion 10", pdf + "dis10-sol.pdf");
    h += item("hw09", pdf + "hw09.pdf", "Homework 9 (RV intro)", pdf + "hw09-sol.pdf");
    h += "</div>";

    h += '<h2 class="sec">This guide’s practice problems</h2>';
    h += '<p class="sub" style="margin:-6px 0 10px">My own problems on each topic page. Try on paper, then reveal.</p><div class="q-list">';
    q.forEach(function (t) {
      h += item("prac:" + t.id, "#" + t.id, t.name + " · practice problems", null);
    });
    h += "</div>";

    h += '<h2 class="sec">Reread the source notes</h2>';
    h += '<p class="sub" style="margin:-6px 0 10px">Open these only where a self-test exposed a gap. Reading cover to cover is slower than fixing the specific thing you missed.</p><div class="q-list">';
    h += item("n19", site, "Note 19 · Random Variables, Distributions, Expectation", null);
    h += item("n20", site, "Note 20 · Random Variables II, Linearity of Expectation", null);
    h += "</div>";

    h += '<div class="trap"><b>Use solutions to check, not to read first.</b> The struggle before you look is where the learning happens. Homework and discussion links go to the official PDFs at eecs70.org.</div>';
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

  // ---- Course materials (links to the official site, not copies) ----
  function renderExams() {
    var h = '<div class="topic-head"><h1>Course materials</h1></div>';
    h += '<p class="topic-sub">Where the quiz content lives, on the course’s own site. Read the notes for the theory and work the problem sets for reps. Open everything at eecs70.org.</p>';
    h += '<h2 class="sec">Source notes</h2><div class="exam-list">';
    (window.CS70.exams || []).forEach(function (e) {
      h += '<div class="exam-row"><span class="exam-sem">' + esc(e.sem) + '</span>' +
        '<span class="exam-links"><a href="' + esc(e.exam) + '" target="_blank" rel="noopener">Read ↗</a></span></div>';
    });
    h += '</div><h2 class="sec">Course resources</h2><div class="exam-list">';
    (window.CS70.resourceLinks || []).forEach(function (r) {
      h += '<div class="exam-row"><span class="exam-sem">' + esc(r.label) + '</span>' +
        '<span class="exam-links"><a href="' + esc(r.url) + '" target="_blank" rel="noopener">Open ↗</a></span></div>';
    });
    h += '</div>';
    h += '<div class="trap"><b>Notes for theory, problem sets for reps.</b> The self-tests and practice problems in this guide are written to drill the same ideas, so work those directly and use the official PDFs to go deeper.</div>';
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
      '<span class="pill">braids topics together</span></div>';
    h += '<p class="topic-sub">The quiz-style questions where several ideas meet in one problem. Name the moves before you compute, and always show the reasoning chain.</p>';
    h += '<p class="sec-src" style="margin:0 0 8px">Draws on: random variables, common distributions, Poisson, expectation, linearity, and independence (Notes 19 and 20)</p>';
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
    h += '<p class="topic-sub">Every formula for Quiz 9, plus how to actually run it. Recipes first for the methods people blank on under time, then a quick-reference grid, then how to handle a question that mixes topics.</p>';
    var groups = [
      ["Random variables · N19", [
        "X : Ω → ℝ, a function on outcomes",
        "“X = a” is the event { ω : X(ω) = a }",
        "ℙ[X = a] = Σ_{ω: X(ω)=a} ℙ[ω]",
        "valid distribution: Σₐ ℙ[X = a] = 1"
      ]],
      ["Common distributions · N19-20", [
        "Bernoulli(p): E = p",
        "Binomial(n,p): C(n,k)pᵏ(1−p)ⁿ⁻ᵏ, E = np",
        "Uniform{1..n}: 1/n, E = (n+1)/2",
        "Geometric(p): (1−p)ᵏ⁻¹p, E = 1/p, ℙ[X>k]=(1−p)ᵏ"
      ]],
      ["Poisson · N20", [
        "ℙ[X = k] = λᵏ e⁻λ / k!, E = λ",
        "models rare events at average rate λ",
        "limit of Binomial(n, λ/n)",
        "independent sum: Poisson(λ)+Poisson(μ)=Poisson(λ+μ)"
      ]],
      ["Expectation · N19", [
        "E[X] = Σₐ a·ℙ[X = a] = Σ_ω X(ω)ℙ[ω]",
        "need not be attainable (die: 3.5)",
        "tail sum: E[X] = Σ_{i≥1} ℙ[X ≥ i]",
        "E[f(X)] = Σ f(a)ℙ[X=a]; E[X²] ≠ (E[X])²"
      ]],
      ["Linearity & indicators · N20", [
        "E[aX + bY] = a·E[X] + b·E[Y], always",
        "indicator: E[I_A] = ℙ[A]",
        "count X = Σ Iᵢ ⇒ E[X] = Σ ℙ[Aᵢ]",
        "not E[XY] = E[X]E[Y] in general"
      ]],
      ["Joint & independence · N20", [
        "joint ℙ[X = a, Y = b]",
        "marginal: ℙ[X=a] = Σ_b ℙ[X=a, Y=b]",
        "independent: ℙ[X=a,Y=b]=ℙ[X=a]ℙ[Y=b] ∀",
        "independent ⇒ E[XY] = E[X]E[Y]; i.i.d."
      ]]
    ];
    var recipes = [
      { name: "Name the distribution", note: "N19-20", use: "The problem tells a story; match it to one of the five.",
        steps: ["Count of successes in a fixed number of trials → Binomial.", "Wait for the first success, number of trials unknown → Geometric.", "Every value equally likely → Uniform. One yes/no trial → Bernoulli.", "Rare events at a steady rate over time or space → Poisson.", "Then read the mean straight off: p, np, (n+1)/2, 1/p, λ."],
        ex: "Rolls until the first 6 → Geometric(1/6), so E = 6." },
      { name: "Compute an expectation directly", note: "N19", use: "When you have the distribution and just need the mean.",
        steps: ["List the values a with their probabilities ℙ[X = a].", "E[X] = Σₐ a·ℙ[X = a].", "If the tail is easier than the PMF, use E[X] = Σ_{i≥1} ℙ[X ≥ i].", "Remember E[X] need not be a value X can take."],
        ex: "Fair die: (1+2+3+4+5+6)/6 = 3.5." },
      { name: "Linearity with indicators", note: "N20", use: "Any “expected number of …” question. The single most useful tool.",
        steps: ["Write the count as a sum of indicators: X = I₁ + ⋯ + Iₙ, one per thing.", "Find E[Iᵢ] = ℙ[Aᵢ] for a single piece.", "Add: E[X] = Σ ℙ[Aᵢ]. This works even when the pieces are dependent.", "Pick what to index carefully: sometimes per-day or per-bin, not per-person."],
        ex: "Fixed points of a permutation: n·(1/n) = 1, for every n." },
      { name: "Poisson quick hits", note: "N20", use: "Rare-event counts and “at least one” questions.",
        steps: ["Identify λ, the average count for the interval.", "ℙ[X = k] = λᵏ e⁻λ / k!; in particular ℙ[none] = e⁻λ.", "For ‘at least one’, use 1 − e⁻λ.", "Independent streams add: total rate is the sum of the λ’s."],
        ex: "λ = 1 typo/page: ℙ[5 on a page] = 1/(120e) ≈ 1/326." },
      { name: "Check independence of two RVs", note: "N20", use: "Decide whether E[XY] = E[X]E[Y] is allowed.",
        steps: ["Compute a joint entry ℙ[X = a, Y = b].", "Compare to ℙ[X = a]·ℙ[Y = b].", "Independent iff they match for every pair; one failing pair breaks it.", "Only then may you write E[XY] = E[X]E[Y]."],
        ex: "Two dice: ℙ[X=3, Y=5] = 1/36 = (1/6)(1/6). Independent." },
      { name: "Marginal from a joint", note: "N20", use: "Recover one variable from a joint table.",
        steps: ["To get X, sum the joint over all values of Y.", "ℙ[X = a] = Σ_b ℙ[X = a, Y = b].", "In a table, that is summing across a row (or down a column)."],
        ex: "ℙ[X=0] = ℙ[X=0,Y=0] + ℙ[X=0,Y=1] + ⋯" }
    ];
    h += '<h2 class="sec">How to use each method</h2>';
    h += '<p class="sub" style="margin:-6px 0 12px">The formula plus the steps to run it under time, the ones that are easy to blank on.</p>';
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

    h += '<h2 class="sec">When topics mix</h2>';
    h += '<p class="sub" style="margin:-6px 0 12px">The questions that braid two or three ideas into one problem. These are the bridges and the attack plan.</p>';
    h += '<div class="note-block"><h3>The bridges (what connects to what)</h3><ul style="margin:4px 0 0;padding-left:18px;font-size:14px">' +
      '<li>Every <b>“how many”</b> is a sum of indicators; <b>linearity</b> turns it into a sum of probabilities.</li>' +
      '<li><b>Linearity</b> needs no independence; the product rule <b>E[XY] = E[X]E[Y]</b> does. Keep them straight.</li>' +
      '<li>The <b>common distributions</b> are named stories. Recognize the story and the mean comes for free.</li>' +
      '<li><b>Poisson</b> is Binomial in the rare-event limit, and independent Poisson rates add.</li></ul></div>';
    h += '<div class="note-block"><h3>Attack plan</h3><ol style="margin:4px 0 0;padding-left:20px;font-size:14px">' +
      '<li><b>Name the variable.</b> Count, wait, or rare-event tally? That picks the distribution and the mean.</li>' +
      '<li><b>“Expected number of …” ⇒ indicators.</b> Write X = Σ Iᵢ and add ℙ[Aᵢ].</li>' +
      '<li><b>Choose what to index.</b> The clean indicator is sometimes per-day or per-bin, not per-person.</li>' +
      '<li><b>Products need independence.</b> Only write E[XY] = E[X]E[Y] after checking it.</li>' +
      '<li><b>“At least one” ⇒ complement.</b> 1 − ℙ[none]; for Poisson ℙ[none] = e⁻λ.</li>' +
      '<li><b>Show the sum.</b> Credit is in the decomposition, not just the final number.</li></ol></div>';
    h += '<div class="note-block"><h3>Common combinations</h3><ul style="margin:4px 0 0;padding-left:18px;font-size:14px">' +
      '<li><b>Count of distinct things</b> (birthdays, coupons, occupied bins): one indicator per slot, complement, then linearity.</li>' +
      '<li><b>Total of independent Poisson streams:</b> add the rates, then it is one Poisson.</li>' +
      '<li><b>Mean of a Binomial or a sum:</b> linearity of indicators beats summing the PMF.</li>' +
      '<li><b>Expected wait:</b> recognize Geometric and use E = 1/p, or the tail sum.</li></ul></div>';

    h += '<div class="trap"><b>Copy by hand, from your gaps.</b> The five distribution means and the indicator method are the highest-value things to have in front of you. Add the Poisson PMF and the independence check if they still feel shaky.</div>';
    content.innerHTML = h;
    addSectionAudio();
    window.scrollTo(0, 0);
  }

  function renderPlan() {
    var h = '<div class="topic-head"><h1>Study plan &amp; quiz strategy</h1></div>';
    h += '<p class="topic-sub">Six topics from Notes 19 and 20. They build in order: you need random variables and the common distributions before expectation, and expectation before linearity. Learn them front to back and the big tools land naturally. Three focused days before Friday is plenty.</p>';
    h += '<h2 class="sec">In-quiz strategy</h2><ol>' +
      '<li><b>Name the variable first.</b> Count, wait, or rare-event tally? That picks the distribution and its mean.</li>' +
      '<li><b>“Expected number of …” → indicators.</b> Write X = Σ Iᵢ and add ℙ[Aᵢ]; it works even when the pieces are dependent.</li>' +
      '<li><b>Do not mix the two rules.</b> Linearity needs no independence; E[XY] = E[X]E[Y] does.</li>' +
      '<li><b>“At least one” → complement.</b> 1 − ℙ[none]; for Poisson ℙ[none] = e⁻λ.</li>' +
      '<li><b>Last minute:</b> reduce every fraction and keep each answer in its box.</li></ol>';
    h += '<h2 class="sec">3-day plan</h2><div class="plan-grid">';
    var days = [
      ["Today (Tue)", "The vocabulary", ["Random Variables & Distributions, then Common Distributions. Do both self-tests.", "Start a one-page sheet with the five distribution means."]],
      ["Wed – Thu", "The core tools", ["Poisson and Expectation, then Linearity & Indicators with its guided lesson.", "The indicator method is the highest-yield thing on the quiz. Drill the practice problems."]],
      ["Friday (quiz day)", "Join up and review", ["Joint Distributions & Independence, both self-tests.", "Run both synthesis questions, then skim your sheet. Learn nothing new today."]]
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
