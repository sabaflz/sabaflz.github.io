/* Shared collapsible side menu.
   Works on any page with #layout + #sidebar (+ #main). Adds a "hide" control
   inside the sidebar and a floating "Menu" tab to re-open it. Desktop only
   (each page keeps its own mobile layout below 861px). Remembers per page. */
(function () {
  "use strict";
  function init() {
    var layout = document.getElementById("layout");
    var sidebar = document.getElementById("sidebar");
    if (!layout || !sidebar) return;

    // Inject styles once.
    if (!document.getElementById("sb-collapse-style")) {
      var css = document.createElement("style");
      css.id = "sb-collapse-style";
      css.textContent = [
        "#sb-hide{display:inline-flex;align-items:center;gap:6px;margin:0 0 12px auto;",
        "font:600 12px/1 var(--mono,ui-monospace,monospace);background:var(--surface,#fff);",
        "color:var(--muted,#667);border:1.5px solid var(--line,#d3d6df);border-radius:999px;",
        "padding:7px 11px;cursor:pointer}",
        "#sb-hide:hover{border-color:var(--saffron,#E9A400);color:var(--ink,#16193A)}",
        "#sb-show{position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:40;display:none;",
        "align-items:center;gap:7px;background:var(--saffron,#E9A400);color:var(--on-saffron,#16193A);",
        "border:none;border-radius:0 12px 12px 0;padding:12px 11px 12px 9px;cursor:pointer;",
        "font:700 12px/1 var(--mono,ui-monospace,monospace);letter-spacing:.06em;",
        "writing-mode:vertical-rl;text-orientation:mixed;box-shadow:2px 2px 10px rgba(0,0,0,.18)}",
        "#sb-show:hover{filter:brightness(1.05)}",
        "@media (min-width:861px){",
        "  #layout.sb-collapsed{grid-template-columns:0 1fr !important}",
        "  #layout.sb-collapsed #sidebar{width:0 !important;min-width:0 !important;max-width:0 !important;",
        "    padding-left:0 !important;padding-right:0 !important;border-right:none !important;",
        "    overflow:hidden !important;opacity:0 !important;pointer-events:none !important}",
        "}",
        "@media (max-width:860px){#sb-hide,#sb-show{display:none !important}}"
      ].join("");
      document.head.appendChild(css);
    }

    // Hide control inside the sidebar.
    var hide = document.createElement("button");
    hide.id = "sb-hide";
    hide.type = "button";
    hide.setAttribute("aria-controls", "sidebar");
    hide.innerHTML = "‹ Hide menu";
    sidebar.insertBefore(hide, sidebar.firstChild);

    // Floating re-open tab.
    var show = document.createElement("button");
    show.id = "sb-show";
    show.type = "button";
    show.setAttribute("aria-label", "Show menu");
    show.innerHTML = "☰ Menu";
    document.body.appendChild(show);

    var KEY = "sbcollapse:" + location.pathname;
    var mq = window.matchMedia("(min-width:861px)");

    function store(c) { try { localStorage.setItem(KEY, c ? "1" : "0"); } catch (e) {} }
    function saved() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }

    function apply(c) {
      if (!mq.matches) c = false;            // never collapsed on mobile
      layout.classList.toggle("sb-collapsed", c);
      show.style.display = c ? "flex" : "none";
      hide.setAttribute("aria-expanded", c ? "false" : "true");
    }
    function set(c) { apply(c); store(c); }

    hide.addEventListener("click", function () { set(true); });
    show.addEventListener("click", function () { set(false); });
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () { apply(saved()); });

    apply(saved());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
