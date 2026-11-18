/* Web Worker (module): compiles and runs Gleam in the browser.
   - gleam_wasm.js / gleam_wasm_bg.wasm: the Gleam compiler, v1.11.1 (Apache-2.0).
   - stdlib-src.json: source of the Gleam standard library v0.60.0, for type checking.
   - lib/: the same standard library precompiled to JavaScript, for running.
   The student's module is compiled to JavaScript, loaded from a blob URL, and
   its generated sf_results() function is called. Running in a worker means a
   loop that never ends cannot freeze the page: the app terminates the worker. */
import init, * as gleam from "./gleam_wasm.js";

const LIB = new URL("./lib/", import.meta.url).href;
let out = [];
const cap = (...a) => { out.push(a.map(String).join(" ")); };
console.log = cap; console.error = cap; console.info = cap; console.warn = cap;

const ready = (async () => {
  const [, src] = await Promise.all([init(), fetch(new URL("./stdlib-src.json", import.meta.url)).then(r => r.json())]);
  gleam.initialise_panic_hook(false);
  for (const name in src) gleam.write_module(0, name, src[name]);
})().then(() => self.postMessage({ ready: true }), e => self.postMessage({ loadError: String(e) }));

const clean = s => String(s).replace(/\x1b\[[0-9;]*m/g, "").replace(/src\/main\.gleam:(\d+)\n/g, "echo on line $1: ");

async function run(d) {
  gleam.write_module(0, "main", d.src);
  try { gleam.compile_package(0, "javascript"); }
  catch (e) { return { stage: "compile", detail: clean(e) }; }
  let js = gleam.read_compiled_javascript(0, "main");
  js = js.replace(/from "\.\/([^"]+)"/g, (m, p) => 'from "' + LIB + p + '"');
  const url = URL.createObjectURL(new Blob([js], { type: "text/javascript" }));
  out = [];
  try {
    const mod = await import(url);
    const values = mod.sf_results ? mod.sf_results().toArray() : [];
    return { stage: "run", values: values, output: clean(out.join("\n")) };
  } catch (e) {
    const stack = e instanceof RangeError;
    if (e && e.gleam_error === "todo") return { stage: "crash", detail: "The function " + e.function + " still has an empty body. Write its code first.", output: "" };
    return { stage: "crash", detail: stack ? "The recursion never stopped (the call stack overflowed)." : clean(e && e.message || e), output: clean(out.join("\n")) };
  } finally { URL.revokeObjectURL(url); }
}

self.onmessage = e => {
  const d = e.data;
  ready.then(() => run(d)).then(r => self.postMessage({ id: d.id, ok: true, result: r }), err => self.postMessage({ id: d.id, ok: false, error: String(err) }));
};
