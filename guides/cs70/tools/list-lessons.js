/* Rewrites the lesson <script> tags in index.html, in course order, for every
   lesson file that exists. Run from guides/cs70:  node tools/list-lessons.js */
const fs = require("fs"), path = require("path"), vm = require("vm"), dir = path.join(__dirname, "..");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(dir, "course.js"), "utf8"), ctx);
const ids = []; ctx.window.COURSE.units.forEach(u => u.topics.forEach(t => ids.push(t.id)));
let html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
const tags = ids.filter(id => fs.existsSync(path.join(dir, "lessons", id + ".js"))).map(id => {
  const m = new RegExp('lessons/' + id + '\\.js\\?v=(\\d+)').exec(html);
  return '<script src="lessons/' + id + '.js?v=' + (m ? m[1] : 1) + '"></script>';
});
html = html.replace(/(<script src="lessons\/[^"]+"><\/script>\n)*<!--LESSONS-->/, tags.join("\n") + "\n<!--LESSONS-->");
fs.writeFileSync(path.join(dir, "index.html"), html);
console.log(tags.length + " lessons listed");
