/* Web Worker: runs SQL with SQLite compiled to WebAssembly (sql.js 1.13.0, MIT).
   For each data set it builds a fresh in-memory database, runs the student's
   SQL and the reference solution, and sends both result tables back. The app
   compares them. Nothing is stored and nothing leaves the browser. */
importScripts("sql-wasm.js");
var ready = initSqlJs({ locateFile: function (f) { return f; } }).then(function (SQL) {
  self.SQL = SQL; self.postMessage({ ready: true });
}).catch(function (e) { self.postMessage({ loadError: String(e) }); });

// Runs every statement and returns the table of the last one that is a query,
// even when that table has no rows.
function lastTable(db, sql) {
  var last = null, it = db.iterateStatements(sql), n;
  while (!(n = it.next()).done) {
    var st = n.value, cols = st.getColumnNames(), rows = [];
    while (st.step()) rows.push(st.get());
    if (cols.length) last = { cols: cols, rows: rows };
  }
  return last;
}

function table(setup, src, check) {
  var db = new self.SQL.Database();
  try {
    db.exec(setup);
    var last = lastTable(db, src);
    if (check) last = lastTable(db, check);
    return last || { none: true };
  } catch (e) { return { error: String(e && e.message || e) }; }
  finally { db.close(); }
}

self.onmessage = function (e) {
  var d = e.data;
  ready.then(function () {
    var out = d.setups.map(function (s) { return { got: table(s, d.src, d.check), want: d.solution ? table(s, d.solution, d.check) : null }; });
    self.postMessage({ id: d.id, ok: true, result: out });
  }).catch(function (err) { self.postMessage({ id: d.id, ok: false, error: String(err) }); });
};
