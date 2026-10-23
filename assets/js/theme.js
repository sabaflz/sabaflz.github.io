/*
  theme.js — site-wide light/dark toggle with an icon.
  Shows the icon of the mode it will switch TO (moon in light mode, sun in dark).
  Reuses any existing #themeBtn (in a page's nav); otherwise injects a floating
  button. One shared key, so the choice carries across every page. Self-contained.
*/
(function () {
  "use strict";
  if (window.__sfTheme) return;
  window.__sfTheme = true;

  var KEY = "sf_theme";
  var root = document.documentElement;

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function sysDark() { return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; }
  function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : sysDark(); }
  function apply(mode) {
    root.setAttribute("data-theme", mode);
    try { localStorage.setItem(KEY, mode); } catch (e) {}
  }

  // apply a saved choice as early as this script runs
  var s = saved();
  if (s === "dark" || s === "light") root.setAttribute("data-theme", s);

  // original, simple icons (sun = circle + rays, moon = crescent)
  var SUN = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>';
  var MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function icon() { return isDark() ? SUN : MOON; }

  var css =
    '.sf-theme-float{position:fixed;right:16px;bottom:calc(66px + env(safe-area-inset-bottom,0px));z-index:9999;' +
    'width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;' +
    'cursor:pointer;border:1.5px solid #16193A;background:#16193A;color:#fff;box-shadow:0 6px 20px rgba(10,12,30,.22);' +
    'transition:background .15s,color .15s,border-color .15s}' +
    '.sf-theme-float:hover{background:#E9A400;border-color:#E9A400;color:#16193A}' +
    '.sf-theme-float:focus-visible{outline:3px solid #E9A400;outline-offset:3px}' +
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .sf-theme-float{background:#1A1D39;border-color:#2C3052;color:#E9EBF3}' +
    ':root:not([data-theme="light"]) .sf-theme-float:hover{background:#F4B71C;border-color:#F4B71C;color:#11132A}}' +
    ':root[data-theme="dark"] .sf-theme-float{background:#1A1D39;border-color:#2C3052;color:#E9EBF3}' +
    ':root[data-theme="dark"] .sf-theme-float:hover{background:#F4B71C;border-color:#F4B71C;color:#11132A}' +
    '#themeBtn svg{display:block}' +
    '@media print{.sf-theme-float{display:none}}';
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  function setup() {
    var btn, existing = document.getElementById("themeBtn");
    if (existing) {
      // take over the page's own nav button, stripping any old handlers
      btn = existing.cloneNode(false);
      existing.parentNode.replaceChild(btn, existing);
    } else {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "themeBtn";
      btn.className = "sf-theme-float";
      document.body.appendChild(btn);
    }
    btn.setAttribute("aria-label", "Switch between light and dark mode");
    btn.setAttribute("title", "Light / dark mode");
    function refresh() { btn.innerHTML = icon(); }
    refresh();
    btn.addEventListener("click", function () {
      apply(isDark() ? "light" : "dark");
      refresh();
    });
    // if the viewer is on system mode and the OS flips, update the icon
    if (window.matchMedia) {
      try {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
          if (!saved()) refresh();
        });
      } catch (e) {}
    }
  }

  if (document.body) setup();
  else document.addEventListener("DOMContentLoaded", setup);
})();
