/* nav.js: the one top navigation for every main page.
   Self-injecting (like theme.js / tts.js): it carries its own styles and
   builds identical markup everywhere, so the menu can never drift between
   pages again. Include it on index, resume, planner, guides hub and lab,
   BEFORE theme.js. Individual study guides keep their own breadcrumb nav. */
(function () {
  "use strict";

  /* ---- where am I, and how deep ---------------------------------------- */
  var seg = location.pathname.replace(/index\.html?$/, "").split("/").filter(Boolean);
  var here = seg[seg.length - 1] || "";           // "", "resume", "guides", "planner", "lab"
  var base = seg.length ? "../".repeat(seg.length) : "";

  /* The canonical menu. One short bar; new work lives inside the hubs.
     To rename a tab or add one, edit this list only. */
  var ACADEMIC = { study: "Study Guides", planner: "Planner" };

  function link(href, label) { return '<li><a href="' + base + href + '">' + label + "</a></li>"; }

  var menu =
    '<a class="mark" href="' + (base || "#") + '" aria-label="Home">SF</a>' +
    "<ul>" +
      link("#work", "Work") +
      link("#leadership", "Leadership") +
      link("#skills", "Skills") +
      '<li class="has-menu">' +
        '<button type="button" class="navtop" aria-haspopup="true" aria-expanded="false">' +
          "Academics<span class=\"caret\" aria-hidden=\"true\"></span></button>" +
      "</li>" +
      link("lab/", "Lab") +
      link("resume/", "Resume") +
      link("#contact", "Contact") +
    "</ul>";

  /* ---- styles: reproduce the landing nav exactly, add the dropdown ------ */
  var css =
    ".topbar{position:sticky;top:env(safe-area-inset-top,0px);z-index:30;background:var(--bg);border-bottom:1.5px solid transparent;transition:border-color .2s,box-shadow .2s}" +
    "@supports (backdrop-filter:blur(10px)) or (-webkit-backdrop-filter:blur(10px)){.topbar{background:color-mix(in srgb,var(--bg) 82%,transparent);-webkit-backdrop-filter:saturate(1.4) blur(12px);backdrop-filter:saturate(1.4) blur(12px)}}" +
    ".topbar.scrolled{border-bottom-color:var(--line);box-shadow:0 6px 24px rgba(10,12,30,.06)}" +
    ".topbar .nav{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px clamp(20px,5vw,48px);max-width:1100px;margin:0 auto}" +
    ".topbar .nav .mark{font:800 20px/1 var(--display);text-decoration:none;letter-spacing:-.02em;color:var(--ink);flex:none}" +
    ".topbar .nav ul{list-style:none;display:flex;align-items:center;gap:22px;margin:0;padding:0;font-weight:500;font-size:15px;overflow-x:auto;scrollbar-width:none}" +
    ".topbar .nav ul::-webkit-scrollbar{display:none}" +
    ".topbar .nav ul a,.topbar .nav .navtop{display:inline-flex;align-items:center;text-decoration:none;white-space:nowrap;padding:4px 0;border:0;border-bottom:2px solid transparent;background:none;color:var(--ink);font:inherit;cursor:pointer;letter-spacing:inherit}" +
    ".topbar .nav ul a:hover,.topbar .nav .navtop:hover{color:var(--ink);border-bottom-color:var(--line)}" +
    ".topbar .nav ul a[aria-current],.topbar .nav .navtop.active{border-bottom-color:var(--saffron)}" +
    ".topbar .nav .has-menu{position:relative;display:flex}" +
    ".topbar .nav .caret{width:7px;height:7px;margin-left:7px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg) translateY(-1px);transition:transform .18s ease;opacity:.75}" +
    ".topbar .nav .has-menu.open .caret{transform:rotate(-135deg) translateY(1px);opacity:1}" +
    /* the floating panel lives on <body> so nothing clips it */
    ".sf-submenu{position:fixed;z-index:40;min-width:190px;background:var(--surface);border:1.5px solid var(--line);border-radius:14px;padding:7px;box-shadow:0 18px 50px rgba(10,12,30,.18);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .16s ease,transform .16s ease,visibility .16s}" +
    ".sf-submenu.open{opacity:1;visibility:visible;transform:translateY(0)}" +
    ".sf-submenu a{display:block;text-decoration:none;color:var(--ink);font:500 15px/1.2 var(--body);padding:11px 13px;border-radius:9px;white-space:nowrap}" +
    ".sf-submenu a:hover,.sf-submenu a:focus-visible{background:color-mix(in srgb,var(--saffron) 16%,transparent);color:var(--ink);outline:none}" +
    ".sf-submenu a[aria-current]{color:var(--saffron-ink);font-weight:600}" +
    ".sf-submenu .sm-desc{display:block;font:400 12.5px/1.3 var(--body);color:var(--muted);margin-top:2px}" +
    "@media (max-width:820px){.topbar .nav{padding:12px clamp(20px,5vw,48px)}.topbar .nav ul{gap:14px;font-size:14px}}" +
    "@media (max-width:520px){.topbar .nav ul{gap:12px;font-size:13.5px}}" +
    "@media (prefers-reduced-motion:reduce){.sf-submenu,.caret{transition:none}}";

  var style = document.createElement("style");
  style.id = "sf-nav-css";
  style.textContent = css;
  document.head.appendChild(style);

  /* ---- mount: replace whatever nav the page shipped -------------------- */
  function mount() {
    var nav = document.querySelector("header.topbar .nav, header .nav");
    if (!nav) return;
    nav.setAttribute("aria-label", "Main");
    nav.innerHTML = menu;

    /* active tab for the current page (landing uses scroll-spy instead) */
    var navtop = nav.querySelector(".navtop");
    if (here === "resume") markCurrent(nav, "resume/");
    else if (here === "lab") markCurrent(nav, "lab/");
    else if (here === "guides" || here === "planner") navtop.classList.add("active");

    buildDropdown(nav, navtop);
  }

  function markCurrent(nav, hrefEnd) {
    var a = nav.querySelector('ul a[href$="' + hrefEnd + '"]');
    if (a) a.setAttribute("aria-current", "page");
  }

  /* ---- the Academics dropdown: hover + tap + keyboard ------------------ */
  function buildDropdown(nav, btn) {
    var li = btn.closest(".has-menu");
    var panel = document.createElement("div");
    panel.className = "sf-submenu";
    panel.setAttribute("role", "menu");
    panel.innerHTML =
      '<a role="menuitem" href="' + base + 'guides/">' + ACADEMIC.study +
        '<span class="sm-desc">Course references &amp; self-tests</span></a>' +
      '<a role="menuitem" href="' + base + 'planner/">' + ACADEMIC.planner +
        '<span class="sm-desc">Degree plan &amp; progress</span></a>';
    document.body.appendChild(panel);

    if (here === "guides") panel.children[0].setAttribute("aria-current", "page");
    if (here === "planner") panel.children[1].setAttribute("aria-current", "page");

    var hideTimer = null;
    function position() {
      var r = btn.getBoundingClientRect();
      panel.style.top = r.bottom + 6 + "px";
      var left = Math.min(r.left, window.innerWidth - panel.offsetWidth - 12);
      panel.style.left = Math.max(12, left) + "px";
    }
    function open() {
      clearTimeout(hideTimer);
      position();
      li.classList.add("open");
      panel.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }
    function close() {
      li.classList.remove("open");
      panel.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
    function softClose() { hideTimer = setTimeout(close, 140); }
    function isOpen() { return li.classList.contains("open"); }

    /* mouse */
    li.addEventListener("mouseenter", open);
    li.addEventListener("mouseleave", softClose);
    panel.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    panel.addEventListener("mouseleave", softClose);

    /* tap / click toggle (touch has no hover) */
    btn.addEventListener("click", function (e) { e.preventDefault(); isOpen() ? close() : open(); });

    /* keyboard */
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); panel.querySelector("a").focus(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); open(); panel.querySelector("a").focus(); }
      else if (e.key === "Escape") { close(); }
    });
    panel.addEventListener("keydown", function (e) {
      var items = Array.prototype.slice.call(panel.querySelectorAll("a"));
      var i = items.indexOf(document.activeElement);
      if (e.key === "Escape") { e.preventDefault(); close(); btn.focus(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      else if (e.key === "Tab") { close(); }
    });

    /* leave the whole thing (focus moves away) */
    document.addEventListener("focusin", function (e) {
      if (isOpen() && !li.contains(e.target) && !panel.contains(e.target)) close();
    });
    /* click anywhere else */
    document.addEventListener("click", function (e) {
      if (isOpen() && !li.contains(e.target) && !panel.contains(e.target)) close();
    });
    /* keep it under the button as the page moves */
    window.addEventListener("resize", function () { if (isOpen()) position(); });
    window.addEventListener("scroll", function () { if (isOpen()) position(); }, true);
  }

  /* ---- sticky-bar shadow on scroll (every page, not just the landing) -- */
  function wireScrolled() {
    var bar = document.querySelector("header.topbar, header");
    if (!bar) return;
    var onScroll = function () { bar.classList.toggle("scrolled", window.scrollY > 4); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { mount(); wireScrolled(); });
  } else { mount(); wireScrolled(); }
})();
