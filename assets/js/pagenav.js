/*
  pagenav.js: builds the sticky section nav for long pages.

  Markup it expects (see assets/css/pagenav.css for the full recipe):
    <div class="withnav">
      <aside class="pagenav" data-pagenav-for="#post"></aside>
      <div id="post"> ...content with h2 headings... </div>
    </div>

  Options on the <aside>:
    data-pagenav-for   CSS selector for the content container (default: the
                       next element sibling)
    data-pagenav-sel   selector for the headings (default: "h2")
    data-pagenav-min   hide the nav below this many headings (default: 3)
    data-pagenav-minh  hide the nav when the content is shorter than this many
                       pixels, so short pages stay uncluttered (default: 1600)
    data-pagenav-sub   "h3" to also list subheadings

  It runs again on demand via window.PageNav.refresh(), which matters for
  pages whose content is rendered by JS after load.
*/
(function () {
  "use strict";

  function slug(s, used) {
    var base = String(s).toLowerCase().trim()
      .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60) || "section";
    var id = base, n = 2;
    while (used[id]) { id = base + "-" + n++; }
    used[id] = true;
    return id;
  }

  function build(aside) {
    var sel = aside.getAttribute("data-pagenav-for");
    var root = sel ? document.querySelector(sel) : aside.nextElementSibling;
    if (!root) return;

    var hsel = aside.getAttribute("data-pagenav-sel") || "h2";
    var sub = aside.getAttribute("data-pagenav-sub");
    var min = parseInt(aside.getAttribute("data-pagenav-min") || "3", 10);
    var minh = parseInt(aside.getAttribute("data-pagenav-minh") || "1600", 10);

    var heads = Array.prototype.slice.call(root.querySelectorAll(sub ? hsel + "," + sub : hsel))
      .filter(function (h) { return h.textContent.trim(); });

    // The "only when there's a lot of info" rule: enough sections AND enough
    // page to scroll through. Either one alone is not worth a rail.
    if (heads.length < min || root.scrollHeight < minh) {
      aside.innerHTML = "";
      aside.hidden = true;
      return;
    }
    aside.hidden = false;

    var used = {};
    Array.prototype.forEach.call(root.querySelectorAll("[id]"), function (el) { used[el.id] = true; });

    var items = heads.map(function (h) {
      if (!h.id) h.id = slug(h.textContent, used);
      return {
        el: h,
        id: h.id,
        text: h.textContent.trim(),
        isSub: sub ? h.matches(sub) : false
      };
    });

    aside.innerHTML = '<span class="pagenav-k">On this page</span><ul>' +
      items.map(function (it) {
        return '<li><a class="' + (it.isSub ? "sub" : "") + '" href="#' + it.id + '">' +
          it.text.replace(/[&<>]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
          }) + "</a></li>";
      }).join("") + "</ul>";

    var links = {};
    Array.prototype.forEach.call(aside.querySelectorAll("a"), function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });

    function mark(id) {
      Array.prototype.forEach.call(aside.querySelectorAll("a"), function (a) {
        a.classList.toggle("on", a === links[id]);
      });
    }

    // Scrollspy: track which headings are above the fold line and light the last one.
    if (aside._io) aside._io.disconnect();
    var seen = {};
    aside._io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e; });
      var current = null;
      items.forEach(function (it) {
        var e = seen[it.id];
        if (!e) return;
        if (e.boundingClientRect.top < (window.innerHeight * 0.3) || e.isIntersecting) {
          if (e.boundingClientRect.top < window.innerHeight * 0.45) current = it.id;
        }
      });
      if (current) mark(current);
    }, { rootMargin: "-10% 0px -55% 0px", threshold: [0, 1] });

    items.forEach(function (it) { aside._io.observe(it.el); });
    mark(items[0].id);
  }

  function run() {
    Array.prototype.forEach.call(document.querySelectorAll(".pagenav"), build);
  }

  window.PageNav = { refresh: run };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
