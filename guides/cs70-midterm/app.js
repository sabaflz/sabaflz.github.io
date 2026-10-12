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

  // progress: { topicId: {best: n, total: m} }
  var progress = store.getJSON("progress", {});

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function norm(s) { return String(s).toLowerCase().replace(/\s+/g, "").replace(/[*·]/g, ""); }

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
      a.innerHTML = '<span class="' + dotCls + '"></span>' +
        '<span class="tlabel">' + esc(t.name) + '</span>' +
        (t.passed ? '<span class="tbadge">PASSED</span>' : (t.allOrNothing ? '<span class="tbadge">ALL/NOTHING</span>' : ''));
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
    h += '<div class="topic-head"><h1>' + esc(t.name) + "</h1>";
    if (t.passed) h += '<span class="pill passed">already passed</span>';
    else {
      h += '<span class="pill' + (t.allOrNothing ? ' aon' : '') + '">' + esc(t.threshold) + "</span>";
    }
    h += "</div>";
    h += '<p class="topic-sub">' + (t.passed
      ? "You passed this on a quiz. Reference only, no need to re-attempt it Thursday."
      : "Read the notes, drill the worked examples, then take the self-test at the bottom.") + "</p>";

    // notes
    if (t.note && t.note.length) {
      h += '<h2 class="sec">Notes</h2><div class="note-cols">';
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
    // quiz
    if (t.quiz && t.quiz.length) {
      h += '<h2 class="sec">Self-test</h2><div id="quizMount"></div>';
    }
    h += '<footer class="inner-foot">CS 70 ' + esc(D.meta.term) + ' · ' + esc(D.meta.staff) +
      ' · built from the notes, policies, and official mock midterm · progress saves in this browser</footer>';
    content.innerHTML = h;
    if (t.quiz && t.quiz.length) mountQuiz(t);
    content.scrollIntoView ? window.scrollTo(0, 0) : null;
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
    D.synthesis.forEach(function (s) {
      h += '<div class="worked"><span class="wtag">' + esc(s.tag) + '</span>' +
        '<p class="wq">' + esc(s.q) + '</p><p class="wa">' + s.a + "</p></div>";
      h += '<div class="trap"><b>Takeaway:</b> ' + esc(s.lesson) + "</div>";
    });
    content.innerHTML = h;
    window.scrollTo(0, 0);
  }

  function renderCheat() {
    var h = '<div class="topic-head"><h1>One-page cheat sheet</h1></div>';
    h += '<p class="topic-sub">You get one double-sided handwritten 8.5×11 sheet, your own writing (tablet sheets must be printed, no screenshots). Copy these by hand. The writing is the studying.</p>';
    var groups = [
      ["Modular / number theory", ["a⁻¹ exists mod m iff gcd(a,m)=1 (extended Euclid)", "FLT: a^(p−1) ≡ 1 (mod p) for a≢0; a^p ≡ a always", "CRT: x = Σ aᵢuᵢ, uᵢ = (N/nᵢ)·[(N/nᵢ)⁻¹ mod nᵢ]", "RSA: d ≡ e⁻¹ mod (p−1)(q−1); E(x)=xᵉ, D=y^d mod N"]],
      ["Polynomials over GF(p)", ["Δᵢ(x) = ∏(x−xⱼ)/∏(xᵢ−xⱼ); p(x)=Σ yᵢΔᵢ(x)", "degree d ⟹ ≤ d roots; d+1 points ⟹ unique", "deg(fg)=deg f+deg g; xᵖ ≡ x drops exponent by p−1", "reduce every coefficient into {0,…,p−1}"]],
      ["Secret sharing / ECC", ["Erasure: send n+k, recover from any n", "General: send n+2k, recover from n+k correct", "k-threshold ⟹ degree k−1, secret = P(0), q > n,s", "Berlekamp-Welch: E deg k, Q=PE deg n+k−1, n+2k eqns"]],
      ["Graphs", ["Σ deg = 2|E|; Kₙ: n(n−1)/2 edges; tree: n−1 edges", "Euler: v+f=e+2; planar e≤3v−6 (tri-free 2v−4)", "Eulerian tour iff connected + all even degree", "n-cube: 2ⁿ verts, deg n, n·2ⁿ⁻¹ edges, diam n, path = differing bits", "Non-planar: K₅, K₃,₃"]],
      ["Stable matching", ["Stable = no rogue pair; propose-reject always gives one", "Proposer-optimal, receiver-pessimal", "Both runs identical ⟹ unique matching"]]
    ];
    h += '<div class="note-cols">';
    groups.forEach(function (g) {
      h += '<div class="note-block"><h3>' + esc(g[0]) + "</h3><ul style='margin:4px 0 0;padding-left:18px'>";
      g[1].forEach(function (li) { h += "<li style='font-size:14px;margin:3px 0'>" + esc(li) + "</li>"; });
      h += "</ul></div>";
    });
    h += "</div>";
    h += '<div class="trap"><b>Build it from your own gaps.</b> After each practice miss: a missing formula goes on the sheet, a concept gap sends you back to that note. Your sheet should be the things you forget, not a copy of mine.</div>';
    content.innerHTML = h;
    window.scrollTo(0, 0);
  }

  function renderPlan() {
    var h = '<div class="topic-head"><h1>Study plan &amp; exam strategy</h1></div>';
    h += '<p class="topic-sub">You have passed 6 of 12 discrete topics, so the midterm is 6 topics plus 2 synthesis questions. Strong position. Front-load the easy locks, give the all-or-nothing topics the cleanest prep.</p>';
    h += '<h2 class="sec">Exam-time strategy</h2><ol>' +
      '<li><b>First 2 min:</b> cross off your 6 passed topics on their checklist, circle your 6 targets.</li>' +
      '<li><b>Synthesis first (~40 min):</b> separate weight, both secret-sharing/CRT flavored, do them while fresh.</li>' +
      '<li><b>Topics confidence-first (~75 min):</b> Graphs → Graph Induction → Proof Techniques → Polynomials → Secret Sharing → Stable Matching.</li>' +
      '<li><b>Pass/No Pass means finish what you start.</b> One complete correct topic beats three half-done ones.</li>' +
      '<li><b>Last 5 min:</b> every T/F bubble filled, every answer inside its box.</li></ol>';
    h += '<h2 class="sec">4-day plan</h2><div class="plan-grid">';
    var days = [
      ["Sunday · today", "Easy locks + start cheat sheet", ["Read the Graphs and Graph Induction topics, take their self-tests.", "Begin your handwritten cheat sheet."]],
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
    window.scrollTo(0, 0);
  }

  // ---- routing ----
  function setActive(id) {
    document.querySelectorAll(".tnav").forEach(function (a) { a.classList.toggle("active", a.dataset.id === id); });
  }
  function route() {
    var hash = (location.hash || "").replace("#", "");
    closeMenu();
    if (hash === "synthesis") { setActive(""); return renderSynthesis(); }
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

  // ---- theme ----
  (function () {
    var root = document.documentElement;
    try { var t = store.get("theme", null); if (t) root.setAttribute("data-theme", t); } catch (e) {}
    document.getElementById("themeBtn").onclick = function () {
      var cur = root.getAttribute("data-theme");
      var isDark = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = isDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store.set("theme", next);
    };
  })();

  buildNav();
  route();
})();
