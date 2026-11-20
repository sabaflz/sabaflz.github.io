/* nav.js: the one top navigation for every main page.
   Self-injecting (like theme.js / tts.js): it carries its own styles and
   builds identical markup everywhere, so the menu can never drift between
   pages again. Include it on index, resume, planner, guides hub and lab,
   BEFORE theme.js. Individual study guides keep their own breadcrumb nav. */
(function () {
  "use strict";

  /* ---- where am I, and how deep ---------------------------------------- */
  var seg = location.pathname.replace(/index\.html?$/, "").split("/").filter(Boolean);
  var here = seg[seg.length - 1] || "";
  if (seg[0] === "planner") here = "planner";       // planner subtabs (planner/study/) count as Planner           // "", "resume", "guides", "planner", "lab"
  var base = seg.length ? "../".repeat(seg.length) : "";

  /* The canonical menu. Public visitors see the portfolio pages only.
     When you're logged in as owner (see owner.js), a "Private" menu appears
     with the pages only you can open. To add a page, edit these lists only. */
  var owner = false;
  try { owner = !!sessionStorage.getItem("sf_planner_tok"); } catch (e) {}
  var PRIVATE_PAGES = [
    { href: "planner/", label: "Planner", desc: "Degree plan &amp; grad plan", key: "planner" },
    { href: "lab/", label: "Lab", desc: "Side projects in progress", key: "lab" },
    { href: "research/blogs/", label: "Blogs", desc: "Posts &amp; source logs", key: "blogs" }
  ];

  function link(href, label) { return '<li><a href="' + base + href + '">' + label + "</a></li>"; }

  var menu =
    '<a class="mark" href="' + (base || "#") + '" aria-label="Home">SF</a>' +
    "<ul>" +
      link("#work", "Work") +
      link("#about", "About") +
      link("research/", "Research") +
      link("guides/", "Study Guides") +
      link("resume/", "Resume") +
      (owner ? '<li class="has-menu">' +
        '<button type="button" class="navtop" aria-haspopup="true" aria-expanded="false">' +
          "Private<span class=\"caret\" aria-hidden=\"true\"></span></button>" +
      "</li>" : "") +
      '<li class="cta-li"><a class="navcta" href="' + base + '#contact">Get in touch</a></li>' +
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
    ".topbar .nav ul a.navcta{padding:8px 14px;border:2px solid var(--ink);border-radius:999px;font-weight:600}" +
    ".topbar .nav ul a.navcta:hover{background:var(--saffron);border-color:var(--saffron);color:var(--on-saffron,#16193A)}" +
    ".sf-submenu .sm-out{border-top:1.5px solid var(--line);border-radius:0 0 9px 9px;margin-top:4px;color:var(--muted)}" +
    ".sf-submenu .sm-desc{display:block;font:400 12.5px/1.3 var(--body);color:var(--muted);margin-top:2px}" +
    "@media (max-width:820px){.topbar .nav{padding:12px clamp(20px,5vw,48px)}.topbar .nav ul{gap:14px;font-size:14px}}" +
    "@media (max-width:520px){.topbar .nav ul{gap:12px;font-size:13.5px}.topbar .nav .cta-li{display:none}}" +
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
    var pkey = privateKey();
    if (pkey) { if (navtop) navtop.classList.add("active"); }
    else if (seg[0] === "research") markCurrent(nav, "research/");
    else if (seg[0] === "guides") markCurrent(nav, "guides/");
    else if (here === "resume") markCurrent(nav, "resume/");

    if (navtop) buildDropdown(nav, navtop);
  }

  function privateKey() {
    if (seg[0] === "planner") return "planner";
    if (seg[0] === "lab") return "lab";
    if (seg[0] === "research" && seg[1] === "blogs") return "blogs";
    return "";
  }

  function markCurrent(nav, hrefEnd) {
    var a = nav.querySelector('ul a[href$="' + hrefEnd + '"]');
    if (a) a.setAttribute("aria-current", "page");
  }

  /* ---- the owner-only Private dropdown: hover + tap + keyboard ------------------ */
  function buildDropdown(nav, btn) {
    var li = btn.closest(".has-menu");
    var panel = document.createElement("div");
    panel.className = "sf-submenu";
    panel.setAttribute("role", "menu");
    panel.innerHTML = PRIVATE_PAGES.map(function (p) {
      return '<a role="menuitem" href="' + base + p.href + '"' + (privateKey() === p.key ? ' aria-current="page"' : "") + ">" +
        p.label + '<span class="sm-desc">' + p.desc + "</span></a>";
    }).join("") + '<a role="menuitem" href="#" class="sm-out" data-owner-logout>Log out</a>';
    document.body.appendChild(panel);
    panel.querySelector("[data-owner-logout]").addEventListener("click", function (e) {
      e.preventDefault();
      try { sessionStorage.removeItem("sf_planner_tok"); sessionStorage.removeItem("sf_planner_pw"); } catch (x) {}
      location.reload();
    });

    var hideTimer = null, openedAt = 0;
    function position() {
      var r = btn.getBoundingClientRect();
      panel.style.top = r.bottom + 6 + "px";
      var left = Math.min(r.left, window.innerWidth - panel.offsetWidth - 12);
      panel.style.left = Math.max(12, left) + "px";
    }
    function open() {
      clearTimeout(hideTimer);
      if (!isOpen()) openedAt = Date.now();
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
    btn.addEventListener("click", function (e) { e.preventDefault(); if (isOpen() && Date.now() - openedAt > 400) close(); else open(); });

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

  /* owner.js handles the login box (#owner) and reading private content */
  if (!window.Owner && !document.querySelector('script[src*="owner.js"]')) {
    var os = document.createElement("script"); os.src = base + "assets/js/owner.js?v=2"; document.head.appendChild(os);
  }

  /* Mount right away when the header is already in the page (scripts sit at the
     end of <body>), so page scripts that run after this see the final menu. */
  if (document.querySelector("header.topbar .nav, header .nav")) { mount(); wireScrolled(); }
  else document.addEventListener("DOMContentLoaded", function () { mount(); wireScrolled(); });
})();
