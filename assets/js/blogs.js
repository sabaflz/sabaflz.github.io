/*
  blogs.js: renders the Blogs subtab of Research, from research/blogs/data.js.

  Two pages share this one file:
    research/blogs/index.html   the list  (needs #list, #bar)
    research/blogs/post.html    one post  (needs #post, reads ?id=<post id>)

  To add a post: append one object to window.BLOG_POSTS in data.js. Nothing else
  to create. Newest first is handled here by date, so order in the file is free.

  Every post keeps its own sources, so the point of this section is that you can
  come back a year later and still see what you read and what it actually said.
*/
(function () {
  "use strict";

  var POSTS = window.BLOG_POSTS || [];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* "2026-11-10" -> "Nov 10, 2026", without timezone drift */
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    if (!m) return String(iso || "");
    return MON[+m[2] - 1] + " " + +m[3] + ", " + m[1];
  }

  function byDateDesc(a, b) { return String(b.date || "").localeCompare(String(a.date || "")); }
  function sorted() { return POSTS.slice().sort(byDateDesc); }

  function statusPill(p) {
    var s = p.status || "Draft";
    var cls = s === "Published" ? " ok" : " muted";
    return '<span class="pill' + cls + '">' + esc(s) + "</span>";
  }

  /* ------------------------------------------------------------------ list
     Note the id is "bloglist", not "list": the Research hub uses "list" for its
     project cards, and this file is loaded there too (for the tab count). */
  function renderList() {
    var listEl = document.getElementById("bloglist");
    if (!listEl) return;
    var barEl = document.getElementById("bar");
    var all = sorted();

    var topics = [];
    all.forEach(function (p) {
      (p.topics || []).forEach(function (t) { if (topics.indexOf(t) < 0) topics.push(t); });
    });
    topics.sort();

    var state = { q: "", topic: "All" };

    if (barEl) {
      barEl.innerHTML =
        '<div class="search"><input id="q" type="search" placeholder="Search posts, topics, sources" ' +
        'aria-label="Search posts"></div>' +
        (topics.length
          ? '<div class="chiprow" id="chips">' +
            ["All"].concat(topics).map(function (t) {
              return '<button type="button" class="chip' + (t === "All" ? " active" : "") +
                '" data-topic="' + esc(t) + '">' + esc(t) + "</button>";
            }).join("") + "</div>"
          : "");
    }

    function haystack(p) {
      return [
        p.title, p.summary, p.where, (p.topics || []).join(" "),
        (p.body || []).join(" "),
        (p.findings || []).map(function (f) { return (f.h || "") + " " + (f.p || ""); }).join(" "),
        (p.sources || []).map(function (s) { return (s.citation || "") + " " + (s.finding || ""); }).join(" ")
      ].join(" ").toLowerCase();
    }

    function paint() {
      var q = state.q.trim().toLowerCase();
      var rows = all.filter(function (p) {
        if (state.topic !== "All" && (p.topics || []).indexOf(state.topic) < 0) return false;
        return !q || haystack(p).indexOf(q) >= 0;
      });

      if (!rows.length) {
        listEl.innerHTML = '<ul class="plist"><li class="empty">No posts match that.</li></ul>';
        return;
      }

      listEl.innerHTML = '<ul class="plist">' + rows.map(function (p) {
        var n = (p.sources || []).length;
        return '<li><a class="prow" href="post.html?id=' + encodeURIComponent(p.id) + '">' +
          '<span class="pdot' + (p.status === "Published" ? " read" : " reading") + '" aria-hidden="true"></span>' +
          '<span class="pmain">' +
            '<span class="ptitle">' + esc(p.title) + "</span>" +
            '<span class="pfull">' + esc(p.summary || "") + "</span>" +
            '<span class="pmeta">' + esc(fmtDate(p.date)) +
              (p.where ? " · " + esc(p.where) : "") +
              " · " + n + (n === 1 ? " source" : " sources") + "</span>" +
          "</span>" +
          '<span class="pkind">' + esc(p.status || "Draft") + "</span>" +
          '<span class="pgo" aria-hidden="true">›</span>' +
          "</a></li>";
      }).join("") + "</ul>";
    }

    var qEl = document.getElementById("q");
    if (qEl) qEl.addEventListener("input", function () { state.q = qEl.value; paint(); });
    var chipsEl = document.getElementById("chips");
    if (chipsEl) {
      chipsEl.addEventListener("click", function (e) {
        var b = e.target.closest(".chip");
        if (!b) return;
        state.topic = b.getAttribute("data-topic");
        Array.prototype.forEach.call(chipsEl.querySelectorAll(".chip"), function (c) {
          c.classList.toggle("active", c === b);
        });
        paint();
      });
    }
    paint();
  }

  /* ------------------------------------------------------------- one post */
  function renderPost() {
    var el = document.getElementById("post");
    if (!el) return;

    var id = new URLSearchParams(location.search).get("id");
    var all = sorted();
    var i = all.findIndex(function (p) { return p.id === id; });

    if (i < 0) {
      el.innerHTML = '<a class="back" href="./">← All posts</a>' +
        '<div class="box"><p>That post does not exist yet.</p></div>';
      return;
    }

    var p = all[i];
    document.title = p.title + " · Blogs · Saba Feilizadeh";

    var html = '<a class="back" href="./">← All posts</a>' +
      '<header class="mhead paper">' +
        '<p class="eyebrow">' + esc(fmtDate(p.date)) + (p.where ? " · " + esc(p.where) : "") + "</p>" +
        '<h2 class="ptitle-lg">' + esc(p.title) + "</h2>" +
        (p.summary ? '<p class="pby">' + esc(p.summary) + "</p>" : "") +
        '<div class="pactions">' + statusPill(p) +
          (p.url ? ' <a class="btn" href="' + esc(p.url) + '" target="_blank" rel="noreferrer">Read it on ' +
            esc(p.where || "the web") + " →</a>" : "") +
        "</div>" +
        ((p.topics || []).length
          ? '<div class="ptags">' + p.topics.map(function (t) {
              return '<span class="pill muted">' + esc(t) + "</span>";
            }).join("") + "</div>"
          : "") +
      "</header>";

    if ((p.body || []).length) {
      html += '<h2 class="sec">The post</h2><div class="box">' +
        p.body.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") + "</div>";
    }

    if ((p.findings || []).length) {
      html += '<h2 class="sec">What I took away</h2><div class="cards">' +
        p.findings.map(function (f) {
          return '<div class="card"><h3>' + esc(f.h || "") + "</h3><p>" + esc(f.p || "") + "</p></div>";
        }).join("") + "</div>";
    }

    if ((p.sources || []).length) {
      html += '<h2 class="sec">Sources</h2>' + p.sources.map(function (s) {
        return '<div class="learn" style="margin-bottom:10px">' +
          '<span class="tag">' + esc(s.type || "Source") +
            (s.verified === false ? " · unverified" : "") + "</span>" +
          "<h3>" + esc(s.citation || "") + "</h3>" +
          (s.method ? '<p class="small muted"><b>Method:</b> ' + esc(s.method) + "</p>" : "") +
          (s.finding ? "<p><b>Found:</b> " + esc(s.finding) + "</p>" : "") +
          (s.quote ? '<p class="question box" style="margin:6px 0">' + esc(s.quote) + "</p>" : "") +
          (s.limits ? '<p class="small muted"><b>Does not establish:</b> ' + esc(s.limits) + "</p>" : "") +
          (s.link
            ? '<div class="lfoot"><a href="' + esc(s.link) + '" target="_blank" rel="noreferrer">Open source →</a></div>'
            : "") +
          "</div>";
      }).join("");
    }

    if (p.notes) {
      html += '<h2 class="sec">Notes to self</h2><div class="box"><p>' + esc(p.notes) + "</p></div>";
    }

    var prev = all[i + 1], next = all[i - 1];
    html += '<nav class="mnav" aria-label="Other posts">' +
      (prev ? '<a href="post.html?id=' + encodeURIComponent(prev.id) + '">← ' + esc(prev.title) + "</a>" : "<span></span>") +
      (next ? '<a href="post.html?id=' + encodeURIComponent(next.id) + '">' + esc(next.title) + " →</a>" : "<span></span>") +
      "</nav>";

    el.innerHTML = html;
  }

  /* ----------------------------------------------------- tab counts, both */
  function paintCounts() {
    var b = document.querySelector('[data-count="blogs"]');
    if (b) b.textContent = POSTS.length;
  }

  function boot() { renderList(); renderPost(); paintCounts(); }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
