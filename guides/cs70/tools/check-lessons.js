/* Checks every lesson file against the shape in lessons/README.md.
   Run from guides/cs70:  node tools/check-lessons.js [id ...] */
const fs = require("fs"), path = require("path"), vm = require("vm");
const dir = path.join(__dirname, "..");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(dir, "course.js"), "utf8"), ctx);
const ids = []; ctx.window.COURSE.units.forEach(u => u.topics.forEach(t => ids.push(t.id)));
const want = process.argv.slice(2);
let bad = 0, seen = {};
function err(id, m) { bad++; console.log("✗ " + id + ": " + m); }
function q(id, where, x, boards) {
  if (!x || !x.q) return err(id, where + " has no q");
  if (!x.why) err(id, where + " has no why");
  if (x.type === "mc") {
    if (!Array.isArray(x.choices) || x.choices.length < 2) err(id, where + " needs choices");
    else if (!(Number.isInteger(x.answer) && x.answer >= 0 && x.answer < x.choices.length)) err(id, where + " answer index out of range");
  } else if (x.type === "type") { if (typeof x.answer !== "string" || !x.answer.trim()) err(id, where + " typed answer must be a non-empty string"); }
  else err(id, where + " type must be mc or type");
}
const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
fs.readdirSync(path.join(dir, "lessons")).filter(f => f.endsWith(".js")).forEach(f => {
  const id = f.replace(/\.js$/, ""); if (want.length && want.indexOf(id) < 0) return;
  if (ids.indexOf(id) < 0) return err(id, "not a topic id in course.js");
  try { vm.runInContext(fs.readFileSync(path.join(dir, "lessons", f), "utf8"), ctx); } catch (e) { return err(id, "does not run: " + e.message); }
  const L = (ctx.window.LESSONS || {})[id]; if (!L) return err(id, 'does not set window.LESSONS["' + id + '"]');
  if (!(L.minutes > 0)) err(id, "minutes missing");
  const B = L.boards || {};
  if (!Array.isArray(L.steps) || L.steps.length < 8) err(id, "needs at least 8 steps");
  (L.steps || []).forEach((s, i) => {
    const w = "step " + (i + 1);
    if (!s.say) err(id, w + " has no say");
    if (!B[s.board]) err(id, w + ' board "' + s.board + '" not found');
    else (s.hl || []).forEach(n => { if (!(n >= 1 && n <= B[s.board].length)) err(id, w + " hl " + n + " is past the end of board " + s.board); });
    if (s.ask) q(id, w + " ask", s.ask);
    if (/—/.test(JSON.stringify(s))) err(id, w + " has an em dash");
  });
  if (!Array.isArray(L.check) || L.check.length < 5) err(id, "needs at least 5 check questions");
  (L.check || []).forEach((x, i) => q(id, "check " + (i + 1), x));
  if (!Array.isArray(L.deepen) || L.deepen.length < 2) err(id, "needs at least 2 deepen problems");
  (L.deepen || []).forEach((p, i) => {
    const w = "deepen " + (i + 1);
    if (!p.id || seen[p.id]) err(id, w + " needs a unique id"); seen[p.id] = 1;
    ["title", "desc", "solution"].forEach(k => { if (!p[k] || !p[k].length) err(id, w + " missing " + k); });
    if (p.solution && !Array.isArray(p.solution)) err(id, w + " solution must be a list of lines");
  });
  if (/—/.test(fs.readFileSync(path.join(dir, "lessons", f), "utf8"))) err(id, "file contains an em dash");
  if (html.indexOf('lessons/' + id + '.js') < 0) console.log("· " + id + ": not listed in index.html yet");
  console.log((bad ? "" : "✓ ") + id + ": " + L.steps.length + " steps, " + L.check.length + " checks, " + L.deepen.length + " problems");
});
process.exit(bad ? 1 : 0);
