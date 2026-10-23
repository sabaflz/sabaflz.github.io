/* CS 61A Midterm 2 practice runner. Real Python via Pyodide. */
(function () {
  "use strict";

  var NS = "cs61a_mt2_";
  var REVEAL_AFTER = 3;          // submissions before the solution unlocks
  var TIMER_SECONDS = 50 * 60;   // 50 minute exam

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(NS + k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(NS + k, v); } catch (e) {} },
    getJSON: function (k, d) { try { var v = localStorage.getItem(NS + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    setJSON: function (k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) {} }
  };

  // Fixed grading harness. Runs SRC (global setup + helpers + student code),
  // then either the visible doctests (run) or the full hidden tests (submit).
  // Returns a JSON string. Each call uses a fresh namespace, so nothing leaks.
  var HARNESS = [
    "import io, contextlib, traceback, json, doctest",
    "def _grade():",
    "    ns = {}",
    "    res = {'stage':'', 'ok': False, 'output':'', 'detail':'', 'attempted':0, 'failed':0}",
    "    buf = io.StringIO()",
    "    try:",
    "        with contextlib.redirect_stdout(buf):",
    "            exec(SRC, ns)",
    "    except Exception:",
    "        res['stage']='define'; res['output']=buf.getvalue(); res['detail']=traceback.format_exc(); return json.dumps(res)",
    "    if MODE == 'run':",
    "        out = io.StringIO(); dtout = io.StringIO()",
    "        try:",
    "            with contextlib.redirect_stdout(out):",
    "                fn = ns.get(FNNAME)",
    "                if fn is not None and getattr(fn, '__doc__', None):",
    "                    runner = doctest.DocTestRunner(verbose=False)",
    "                    test = doctest.DocTestParser().get_doctest(fn.__doc__, ns, FNNAME, None, 0)",
    "                    runner.run(test, out=dtout.write)",
    "                    res['attempted']=runner.tries; res['failed']=runner.failures",
    "            res['ok'] = (res['failed']==0)",
    "            res['output']=out.getvalue(); res['detail']=dtout.getvalue(); res['stage']='run'",
    "        except Exception:",
    "            res['stage']='run'; res['detail']=traceback.format_exc(); res['output']=out.getvalue()",
    "        return json.dumps(res)",
    "    else:",
    "        buf2 = io.StringIO()",
    "        try:",
    "            with contextlib.redirect_stdout(buf2):",
    "                exec(TESTS, ns)",
    "            res['ok']=True; res['stage']='submit'; res['output']=buf2.getvalue()",
    "        except Exception:",
    "            res['ok']=False; res['stage']='submit'; res['detail']=traceback.format_exc(); res['output']=buf2.getvalue()",
    "        return json.dumps(res)",
    "_grade()"
  ].join("\n");

  var pyodide = null;
  var PROBLEMS = window.PROBLEMS || [];
  var GLOBAL_SETUP = window.GLOBAL_SETUP || "";
  var current = null;   // current problem object
  var editor = null;

  // ---- helpers ----------------------------------------------------------
  function fnName(p) { var m = /def\s+(\w+)\s*\(/.exec(p.starter); return m ? m[1] : ""; }
  function statusOf(id) { return store.get("status_" + id, "unattempted"); }
  function subsOf(id) { return parseInt(store.get("subs_" + id, "0"), 10) || 0; }
  function codeOf(p) { var c = store.get("code_" + p.id, null); return c === null ? p.starter : c; }
  function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function byId(x) { return document.getElementById(x); }

  // ---- sidebar ----------------------------------------------------------
  function renderSidebar(filter) {
    filter = (filter || "").toLowerCase();
    var cats = ["Recursion", "Lists & Dicts", "Linked Lists"];
    var list = byId("problem-list");
    list.innerHTML = "";
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
        el.innerHTML =
          '<span class="dot ' + st + '"></span>' +
          '<span class="name">' + esc(p.title) + '</span>' +
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

    updateStatusChip();
    updateSubs();
    updateRevealBtn();
    renderSidebar(byId("search").value);
  }

  function updateStatusChip() {
    var st = statusOf(current.id);
    var chip = byId("p-status");
    chip.className = "p-status " + st;
    chip.textContent = st === "passed" ? "Passed" : st === "attempted" ? "Attempted" : "Not attempted";
  }
  function updateSubs() {
    byId("subs").textContent = subsOf(current.id) + " submission" + (subsOf(current.id) === 1 ? "" : "s");
  }
  function updateRevealBtn() {
    var n = subsOf(current.id), btn = byId("btn-reveal");
    if (n >= REVEAL_AFTER) { btn.disabled = false; btn.textContent = "Reveal solution"; btn.title = ""; }
    else { btn.disabled = true; btn.textContent = "Reveal solution (" + (REVEAL_AFTER - n) + " more tries)"; btn.title = "Unlocks after " + REVEAL_AFTER + " submissions"; }
  }

  function showBanner(kind, text) {
    return '<div class="banner ' + kind + '">' + text + "</div>";
  }
  function outBlock(label, text, isErr) {
    if (!text) return "";
    return '<div class="out-label">' + label + "</div><pre class='" + (isErr ? "err" : "") + "'><code>" + esc(text) + "</code></pre>";
  }

  function pyRun(src, tests, fn, mode) {
    pyodide.globals.set("SRC", src);
    pyodide.globals.set("TESTS", tests || "");
    pyodide.globals.set("FNNAME", fn);
    pyodide.globals.set("MODE", mode);
    return pyodide.runPythonAsync(HARNESS).then(function (out) { return JSON.parse(out); });
  }

  function setBusy(busy, which) {
    byId("btn-run").disabled = busy;
    byId("btn-submit").disabled = busy;
    if (busy) byId(which).textContent = which === "btn-run" ? "Running..." : "Grading...";
    else { byId("btn-run").textContent = "Run"; byId("btn-submit").textContent = "Submit for grade"; }
  }

  function onRun() {
    if (!pyodide || !current) return;
    var p = current, src = GLOBAL_SETUP + "\n" + (p.setup || "") + "\n" + editor.getValue();
    setBusy(true, "btn-run");
    pyRun(src, p.tests, fnName(p), "run").then(function (r) {
      var html = "";
      if (r.stage === "define") {
        html += showBanner("fail", "Your code did not run");
        html += outBlock("Error", r.detail, true);
      } else if (r.ok && r.attempted > 0) {
        html += showBanner("pass", "Visible doctests passed (" + r.attempted + "/" + r.attempted + ")");
      } else if (r.attempted > 0) {
        html += showBanner("fail", "Visible doctests: " + (r.attempted - r.failed) + "/" + r.attempted + " passed");
        html += outBlock("Doctest details", r.detail);
      } else {
        html += showBanner("info", "Ran with no errors. No doctests to check here, so use Submit to grade.");
      }
      html += outBlock("Printed output", r.output);
      byId("result").innerHTML = html;
      setBusy(false);
    }).catch(function (e) {
      byId("result").innerHTML = showBanner("fail", "Runtime error") + outBlock("Error", String(e), true);
      setBusy(false);
    });
  }

  function onSubmit() {
    if (!pyodide || !current) return;
    var p = current, src = GLOBAL_SETUP + "\n" + (p.setup || "") + "\n" + editor.getValue();
    setBusy(true, "btn-submit");
    pyRun(src, p.tests, fnName(p), "submit").then(function (r) {
      // record the attempt (like the CBTF grader, each submit counts)
      var n = subsOf(p.id) + 1;
      store.set("subs_" + p.id, String(n));
      var prev = statusOf(p.id);
      var st = r.ok ? "passed" : (prev === "passed" ? "passed" : "attempted");
      store.set("status_" + p.id, st);

      var html = "";
      if (r.ok) {
        html += showBanner("pass", "✓ Correct. All tests passed. (submission #" + n + ")");
      } else if (r.stage === "define") {
        html += showBanner("fail", "✗ Your code did not run (submission #" + n + ")");
        html += outBlock("Error", r.detail, true);
      } else {
        html += showBanner("fail", "✗ Not yet. A hidden test failed. (submission #" + n + ")");
        html += outBlock("What went wrong", r.detail, true);
      }
      html += outBlock("Printed output", r.output);
      byId("result").innerHTML = html;
      updateStatusChip(); updateSubs(); updateRevealBtn(); renderSidebar(byId("search").value);
      setBusy(false);
    }).catch(function (e) {
      byId("result").innerHTML = showBanner("fail", "Runtime error") + outBlock("Error", String(e), true);
      setBusy(false);
    });
  }

  function onReset() {
    if (!current) return;
    if (!confirm("Restore the original starter code? Your current code for this problem will be replaced.")) return;
    editor.setValue(current.starter);
    store.set("code_" + current.id, current.starter);
  }

  function onReveal() {
    if (!current || subsOf(current.id) < REVEAL_AFTER) return;
    if (byId("solution").hidden &&
        !confirm("Show the reference solution? Try to finish on your own first; you learn the pattern by writing it.")) return;
    byId("sol-code").textContent = current.solution;
    byId("sol-exam").href = current.exam;
    byId("sol-pdf").href = current.sol;
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
  function startTimer() {
    var left = remaining(); if (left <= 0) left = TIMER_SECONDS;
    store.set("timer_deadline", String(Date.now() + left * 1000));
    runTick();
  }
  function pauseTimer() {
    store.set("timer_left", String(Math.max(0, remaining())));
    localStorage.removeItem(NS + "timer_deadline");
    if (tick) { clearInterval(tick); tick = null; }
    paintTimer();
  }
  function resetTimer() {
    if (tick) { clearInterval(tick); tick = null; }
    localStorage.removeItem(NS + "timer_deadline");
    store.set("timer_left", String(TIMER_SECONDS));
    paintTimer();
  }
  function runTick() {
    if (tick) clearInterval(tick);
    paintTimer();
    tick = setInterval(function () {
      paintTimer();
      if (remaining() <= 0) { clearInterval(tick); tick = null; }
    }, 1000);
  }
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
    byId("search").addEventListener("input", function (e) { renderSidebar(e.target.value); });
    byId("timer-toggle").addEventListener("click", toggleTimer);
    byId("timer-reset").addEventListener("click", resetTimer);

    renderSidebar("");
    if (store.get("timer_deadline", null)) runTick(); else paintTimer();
  }

  function boot() {
    wireUp();
    byId("boot-msg").textContent = "Downloading the Python runtime (about 10 MB). First load takes a moment, then it is cached.";
    loadPyodide().then(function (py) {
      pyodide = py;
      byId("boot").style.display = "none";
    }).catch(function (e) {
      byId("boot-msg").innerHTML = "Could not load Python. Check your internet connection and refresh.<br><br><small>" + esc(String(e)) + "</small>";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
