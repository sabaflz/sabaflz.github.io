/* CS 61A Midterm 2 practice runner. Real Python via Pyodide in a Web Worker,
   so a student infinite loop times out instead of freezing the page. */
(function () {
  "use strict";

  var NS = "cs61a_mt3_";
  var REVEAL_AFTER = 3;          // submissions before the solution unlocks
  var TIMER_SECONDS = 110 * 60;  // 110 minute exam (MT3)
  var EXEC_TIMEOUT = 8000;       // ms before we assume an infinite loop

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(NS + k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(NS + k, v); } catch (e) {} }
  };

  var PROBLEMS = window.PROBLEMS || [];
  var GLOBAL_SETUP = window.GLOBAL_SETUP || "";
  var current = null, editor = null;

  // ---- worker management ------------------------------------------------
  var worker = null, workerReady = false, inflight = null;

  function spawnWorker(onReady) {
    worker = new Worker("pyworker.js");
    worker.onmessage = function (e) {
      var d = e.data || {};
      if (d.ready) { workerReady = true; if (onReady) onReady(); return; }
      if (d.loadError) { byId("boot-msg").innerHTML = "Could not load Python. Check your connection and refresh.<br><br><small>" + esc(d.loadError) + "</small>"; return; }
      if (inflight && d.id === inflight.id) {
        clearTimeout(inflight.timer);
        var cb = inflight; inflight = null; cb.resolve(d);
      }
    };
    worker.onerror = function (err) {
      if (!workerReady) byId("boot-msg").textContent = "Could not start Python: " + (err.message || "worker error");
      if (inflight) { clearTimeout(inflight.timer); var cb = inflight; inflight = null; cb.reject(new Error(err.message || "worker error")); }
    };
  }

  function runInWorker(src, tests, fn, mode) {
    return new Promise(function (resolve, reject) {
      if (!workerReady) { reject(new Error("Python is still loading. Give it a second and try again.")); return; }
      if (inflight) { reject(new Error("Something is already running.")); return; }
      var id = String(Date.now()) + "_" + Math.random();
      var timer = setTimeout(function () {
        try { worker.terminate(); } catch (e) {}
        inflight = null; workerReady = false;
        showBootOverlay("Restarting Python after a long-running cell...");
        spawnWorker(function () { hideBootOverlay(); });
        reject({ __timeout: true });
      }, EXEC_TIMEOUT);
      inflight = { id: id, resolve: resolve, reject: reject, timer: timer };
      worker.postMessage({ id: id, src: src, tests: tests || "", fnname: fn, mode: mode });
    });
  }

  // ---- helpers ----------------------------------------------------------
  function byId(x) { return document.getElementById(x); }
  function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function fnName(p) { var m = /def\s+(\w+)\s*\(/.exec(p.starter); return m ? m[1] : ""; }
  function statusOf(id) { return store.get("status_" + id, "unattempted"); }
  function subsOf(id) { return parseInt(store.get("subs_" + id, "0"), 10) || 0; }
  function isStarred(id) { return store.get("star_" + id, "0") === "1"; }
  function toggleStar(id) { store.set("star_" + id, isStarred(id) ? "0" : "1"); }
  function codeOf(p) { var c = store.get("code_" + p.id, null); return c === null ? p.starter : c; }
  function showBootOverlay(msg) { byId("boot-msg").textContent = msg; byId("boot").style.display = "flex"; }
  function hideBootOverlay() { byId("boot").style.display = "none"; }

  // ---- sidebar ----------------------------------------------------------
  function renderSidebar(filter) {
    filter = (filter || "").toLowerCase();
    var cats = ["Trees", "Generators", "Mutation & Iterators", "OOP", "Recursion", "Lists & Dicts", "Linked Lists"];
    var list = byId("problem-list"); list.innerHTML = "";
    cats.forEach(function (cat) {
      var items = PROBLEMS.filter(function (p) {
        return p.cat === cat && (!filter ||
          p.title.toLowerCase().indexOf(filter) > -1 ||
          p.source.toLowerCase().indexOf(filter) > -1 ||
          p.cat.toLowerCase().indexOf(filter) > -1);
      });
      if (!items.length) return;
      var group = document.createElement("div");
      group.className = "cat-group";
      group.innerHTML = '<div class="cat-name">' + cat + "</div>";
      items.forEach(function (p) {
        var st = statusOf(p.id), n = subsOf(p.id);
        var el = document.createElement("div");
        el.className = "p-item" + (current && current.id === p.id ? " active" : "");
        var ind = isStarred(p.id)
          ? '<span class="star ' + st + '" title="Starred">★</span>'
          : '<span class="dot ' + st + '"></span>';
        el.innerHTML = ind + '<span class="name">' + esc(p.title) + "</span>" +
          (n ? '<span class="n-subs">' + n + "x</span>" : "");
        el.addEventListener("click", function () { selectProblem(p.id); });
        group.appendChild(el);
      });
      list.appendChild(group);
    });
    var passed = PROBLEMS.filter(function (p) { return statusOf(p.id) === "passed"; }).length;
    byId("progress").textContent = passed + " / " + PROBLEMS.length + " passed";
  }

  // ---- problem view -----------------------------------------------------
  function selectProblem(id) {
    var p = PROBLEMS.find(function (x) { return x.id === id; });
    if (!p) return;
    current = p;
    byId("empty-state").hidden = true;
    byId("problem-view").hidden = false;
    byId("p-cat").textContent = p.cat;
    byId("p-title").textContent = p.title;
    var src = byId("p-source");
    src.textContent = p.source + "  → open original exam PDF";
    src.href = p.exam;
    byId("p-desc").textContent = p.desc;
    byId("result").innerHTML = "";
    byId("solution").hidden = true;
    editor.setValue(codeOf(p));
    editor.clearHistory();
    setTimeout(function () { editor.refresh(); }, 0);
    updateStatusChip(); updateSubs(); updateRevealBtn(); updateStarBtn();
    renderSidebar(byId("search").value);
  }

  function updateStatusChip() {
    var st = statusOf(current.id), chip = byId("p-status");
    chip.className = "p-status " + st;
    chip.textContent = st === "passed" ? "Passed" : st === "attempted" ? "Attempted" : "Not attempted";
  }
  function updateSubs() { byId("subs").textContent = subsOf(current.id) + " submission" + (subsOf(current.id) === 1 ? "" : "s"); }
  function updateStarBtn() {
    var btn = byId("btn-star");
    if (!btn || !current) return;
    var on = isStarred(current.id);
    btn.textContent = on ? "★ Starred" : "☆ Star";
    btn.classList.toggle("on", on);
    btn.title = on ? "Remove the star" : "Star this to revisit it";
  }
  function onStar() {
    if (!current) return;
    toggleStar(current.id);
    updateStarBtn();
    renderSidebar(byId("search").value);
  }
  function updateRevealBtn() {
    var btn = byId("btn-reveal");
    btn.disabled = false;
    btn.textContent = "Reveal answer";
    btn.title = "Show the solution with a short explanation";
  }

  function banner(kind, text) { return '<div class="banner ' + kind + '">' + text + "</div>"; }
  function outBlock(label, text, isErr) {
    if (!text) return "";
    return '<div class="out-label">' + label + "</div><pre class='" + (isErr ? "err" : "") + "'><code>" + esc(text) + "</code></pre>";
  }
  function timeoutHtml() {
    return banner("fail", "⏱ Your code took too long (over " + (EXEC_TIMEOUT / 1000) + "s). This almost always means an infinite loop. Check that every loop makes progress toward stopping.");
  }

  function setBusy(busy, which) {
    byId("btn-run").disabled = busy; byId("btn-submit").disabled = busy;
    if (busy) byId(which).textContent = which === "btn-run" ? "Running..." : "Grading...";
    else { byId("btn-run").textContent = "Run"; byId("btn-submit").textContent = "Submit for grade"; }
  }

  function onRun() {
    if (!current) return;
    var p = current, src = GLOBAL_SETUP + "\n" + (p.setup || "") + "\n" + editor.getValue();
    setBusy(true, "btn-run");
    runInWorker(src, p.tests, fnName(p), "run").then(function (d) {
      var html = "";
      if (!d.ok) { html = banner("fail", "Runtime error") + outBlock("Error", d.error, true); byId("result").innerHTML = html; setBusy(false); return; }
      var r = JSON.parse(d.result);
      if (r.stage === "define") { html += banner("fail", "Your code did not run") + outBlock("Error", r.detail, true); }
      else if (r.ok && r.attempted > 0) { html += banner("pass", "Visible doctests passed (" + r.attempted + "/" + r.attempted + ")"); }
      else if (r.attempted > 0) { html += banner("fail", "Visible doctests: " + (r.attempted - r.failed) + "/" + r.attempted + " passed") + outBlock("Doctest details", r.detail); }
      else { html += banner("info", "Ran with no errors. No doctests to check here, so use Submit to grade."); }
      html += outBlock("Printed output", r.output);
      byId("result").innerHTML = html; setBusy(false);
    }).catch(function (e) {
      byId("result").innerHTML = e && e.__timeout ? timeoutHtml() : (banner("fail", "Error") + outBlock("Error", String(e && e.message || e), true));
      setBusy(false);
    });
  }

  function onSubmit() {
    if (!current) return;
    var p = current, src = GLOBAL_SETUP + "\n" + (p.setup || "") + "\n" + editor.getValue();
    setBusy(true, "btn-submit");
    runInWorker(src, p.tests, fnName(p), "submit").then(function (d) {
      var n = subsOf(p.id) + 1; store.set("subs_" + p.id, String(n));
      var html = "";
      if (!d.ok) {
        store.set("status_" + p.id, statusOf(p.id) === "passed" ? "passed" : "attempted");
        html = banner("fail", "✗ Runtime error (submission #" + n + ")") + outBlock("Error", d.error, true);
        byId("result").innerHTML = html; updateStatusChip(); updateSubs(); updateRevealBtn(); renderSidebar(byId("search").value); setBusy(false); return;
      }
      var r = JSON.parse(d.result);
      var st = r.ok ? "passed" : (statusOf(p.id) === "passed" ? "passed" : "attempted");
      store.set("status_" + p.id, st);
      if (r.ok) { html += banner("pass", "✓ Correct. All tests passed. (submission #" + n + ")"); }
      else if (r.stage === "define") { html += banner("fail", "✗ Your code did not run (submission #" + n + ")") + outBlock("Error", r.detail, true); }
      else { html += banner("fail", "✗ Not yet. A hidden test failed. (submission #" + n + ")") + outBlock("What went wrong", r.detail, true); }
      html += outBlock("Printed output", r.output);
      byId("result").innerHTML = html;
      updateStatusChip(); updateSubs(); updateRevealBtn(); renderSidebar(byId("search").value); setBusy(false);
    }).catch(function (e) {
      if (e && e.__timeout) { var n2 = subsOf(p.id) + 1; store.set("subs_" + p.id, String(n2)); store.set("status_" + p.id, statusOf(p.id) === "passed" ? "passed" : "attempted"); updateSubs(); updateRevealBtn(); byId("result").innerHTML = timeoutHtml(); }
      else { byId("result").innerHTML = banner("fail", "Error") + outBlock("Error", String(e && e.message || e), true); }
      setBusy(false);
    });
  }

  function onReset() {
    if (!current) return;
    if (!confirm("Restore the original starter code? Your current code for this problem will be replaced.")) return;
    editor.setValue(current.starter); store.set("code_" + current.id, current.starter);
  }
  function onReveal() {
    if (!current) return;
    var ex = byId("sol-explain");
    if (ex) { ex.textContent = current.explain || ""; ex.hidden = !current.explain; }
    byId("sol-code").textContent = current.solution;
    byId("sol-exam").href = current.exam; byId("sol-pdf").href = current.sol;
    byId("solution").hidden = false;
    byId("solution").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---- timer ------------------------------------------------------------
  var tick = null;
  function fmt(s) { s = Math.max(0, s); var m = Math.floor(s / 60), x = s % 60; return (m < 10 ? "0" : "") + m + ":" + (x < 10 ? "0" : "") + x; }
  function remaining() {
    var dl = store.get("timer_deadline", null);
    if (!dl) return parseInt(store.get("timer_left", String(TIMER_SECONDS)), 10);
    return Math.round((parseInt(dl, 10) - Date.now()) / 1000);
  }
  function paintTimer() {
    var r = remaining(), face = byId("timer-face");
    face.textContent = fmt(r);
    face.className = "timer-face" + (r <= 0 ? " zero" : r <= 300 ? " low" : "");
    byId("timer-toggle").textContent = store.get("timer_deadline", null) ? "Pause" : "Start";
  }
  function startTimer() { var left = remaining(); if (left <= 0) left = TIMER_SECONDS; store.set("timer_deadline", String(Date.now() + left * 1000)); runTick(); }
  function pauseTimer() { store.set("timer_left", String(Math.max(0, remaining()))); localStorage.removeItem(NS + "timer_deadline"); if (tick) { clearInterval(tick); tick = null; } paintTimer(); }
  function resetTimer() { if (tick) { clearInterval(tick); tick = null; } localStorage.removeItem(NS + "timer_deadline"); store.set("timer_left", String(TIMER_SECONDS)); paintTimer(); }
  function runTick() { if (tick) clearInterval(tick); paintTimer(); tick = setInterval(function () { paintTimer(); if (remaining() <= 0) { clearInterval(tick); tick = null; } }, 1000); }
  function toggleTimer() { if (store.get("timer_deadline", null)) pauseTimer(); else startTimer(); }

  // ---- init -------------------------------------------------------------
  function wireUp() {
    editor = CodeMirror.fromTextArea(byId("code"), {
      mode: "python", theme: "material-darker", lineNumbers: true,
      indentUnit: 4, indentWithTabs: false, matchBrackets: true,
      extraKeys: {
        Tab: function (cm) { if (cm.somethingSelected()) cm.execCommand("indentMore"); else cm.replaceSelection("    "); },
        "Shift-Tab": function (cm) { cm.execCommand("indentLess"); }
      }
    });
    editor.on("change", function () { if (current) store.set("code_" + current.id, editor.getValue()); });
    byId("btn-run").addEventListener("click", onRun);
    byId("btn-submit").addEventListener("click", onSubmit);
    byId("btn-reset").addEventListener("click", onReset);
    byId("btn-reveal").addEventListener("click", onReveal);
    var starBtn = byId("btn-star"); if (starBtn) starBtn.addEventListener("click", onStar);
    byId("search").addEventListener("input", function (e) { renderSidebar(e.target.value); });
    byId("timer-toggle").addEventListener("click", toggleTimer);
    byId("timer-reset").addEventListener("click", resetTimer);
    renderSidebar("");
    if (store.get("timer_deadline", null)) runTick(); else paintTimer();
  }

  function boot() {
    wireUp();
    byId("boot-msg").textContent = "Downloading the Python runtime (about 10 MB). First load takes a moment, then it is cached.";
    if (typeof Worker === "undefined") { byId("boot-msg").textContent = "This browser does not support Web Workers, which this app needs. Try a current Chrome, Firefox, Edge, or Safari."; return; }
    spawnWorker(function () { hideBootOverlay(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
