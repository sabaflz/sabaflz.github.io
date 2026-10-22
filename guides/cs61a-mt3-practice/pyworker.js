/* Web Worker: loads Pyodide off the main thread and runs the grading harness.
   Running here means an infinite loop in student code never freezes the page;
   the main thread terminates this worker on timeout and spawns a fresh one. */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

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

var ready = loadPyodide().then(function (py) {
  self.pyodide = py;
  self.postMessage({ ready: true });
}).catch(function (e) {
  self.postMessage({ loadError: String(e) });
});

self.onmessage = function (e) {
  var d = e.data;
  ready.then(function () {
    try {
      self.pyodide.globals.set("SRC", d.src);
      self.pyodide.globals.set("TESTS", d.tests || "");
      self.pyodide.globals.set("FNNAME", d.fnname);
      self.pyodide.globals.set("MODE", d.mode);
      return self.pyodide.runPythonAsync(HARNESS);
    } catch (err) {
      self.postMessage({ id: d.id, ok: false, error: String(err) });
      throw err;
    }
  }).then(function (out) {
    self.postMessage({ id: d.id, ok: true, result: out });
  }).catch(function (err) {
    self.postMessage({ id: d.id, ok: false, error: String(err) });
  });
};
