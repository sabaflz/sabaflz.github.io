/*
  tts.js — site-wide "Listen" button. Reads the main content of whatever
  page it's on aloud, using the browser's built-in speech engine.
  Self-contained: injects its own styles, no dependencies. Include on any page.
*/
(function () {
  "use strict";
  if (window.__sfTTS) return;
  window.__sfTTS = true;
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;

  // ---- styles (theme-aware, independent of the host page's CSS) ----
  var css =
    '#sf-tts{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9999;' +
    'display:inline-flex;align-items:center;gap:7px;font:600 14px/1 "Instrument Sans",system-ui,sans-serif;' +
    'padding:11px 15px;border-radius:999px;cursor:pointer;border:1.5px solid #16193A;background:#16193A;color:#fff;' +
    'box-shadow:0 6px 20px rgba(10,12,30,.22);transition:background .15s,color .15s,border-color .15s}' +
    '#sf-tts .i{font-size:11px;line-height:1}' +
    '#sf-tts:hover,#sf-tts.on{background:#E9A400;border-color:#E9A400;color:#16193A}' +
    '#sf-tts:focus-visible{outline:3px solid #E9A400;outline-offset:3px}' +
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) #sf-tts{background:#1A1D39;border-color:#2C3052;color:#E9EBF3}' +
    ':root:not([data-theme="light"]) #sf-tts:hover,:root:not([data-theme="light"]) #sf-tts.on{background:#F4B71C;border-color:#F4B71C;color:#11132A}}' +
    ':root[data-theme="dark"] #sf-tts{background:#1A1D39;border-color:#2C3052;color:#E9EBF3}' +
    ':root[data-theme="dark"] #sf-tts:hover,:root[data-theme="dark"] #sf-tts.on{background:#F4B71C;border-color:#F4B71C;color:#11132A}' +
    '@media print{#sf-tts{display:none}}';
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  // ---- button ----
  var btn = document.createElement("button");
  btn.id = "sf-tts";
  btn.type = "button";
  btn.setAttribute("aria-label", "Listen to this page");
  btn.innerHTML = '<span class="i">▶</span><span class="t">Listen</span>';
  document.body.appendChild(btn);

  var playing = false;
  function setLabel() {
    btn.classList.toggle("on", playing);
    btn.querySelector(".i").textContent = playing ? "■" : "▶";
    btn.querySelector(".t").textContent = playing ? "Stop" : "Listen";
  }
  function stop() {
    try { window.speechSynthesis.cancel(); } catch (e) {}
    playing = false;
    setLabel();
  }

  // ---- turn math-heavy text into speakable English ----
  function speakify(s) {
    var subs = [
      [/∀/g, " for all "], [/∃/g, " there exists "], [/⟺|⇔/g, " if and only if "],
      [/⟹|⇒|=>/g, " implies "], [/≡/g, " is equivalent to "], [/≢/g, " is not equivalent to "],
      [/≠/g, " not equal to "], [/≤/g, " at most "], [/≥/g, " at least "],
      [/∧/g, " and "], [/∨/g, " or "], [/¬/g, " not "], [/∈/g, " in "],
      [/∏/g, " the product of "], [/Σ/g, " the sum of "], [/√/g, " square root of "],
      [/≈/g, " approximately "], [/⁻¹/g, " inverse "], [/Δ/g, " delta "],
      [/·|×/g, " times "], [/²/g, " squared "], [/³/g, " cubed "], [/ⁿ/g, " to the n "],
      [/ᵉ/g, " to the e "], [/ᵢ/g, " i "], [/ⱼ/g, " j "], [/ₖ/g, " k "],
      [/GF\(/g, " the field G F of "], [/K₅/g, " K five "], [/K₃,₃/g, " K three three "], [/Kₙ/g, " K n "]
    ];
    subs.forEach(function (m) { s = s.replace(m[0], m[1]); });
    return s.replace(/\s+/g, " ").trim();
  }

  // ---- gather the readable text of the current page ----
  function pageText() {
    var el = document.querySelector("#content") || document.querySelector("main") ||
      document.querySelector('[role="main"]') || document.body;
    if (!el) return "";
    var clone = el.cloneNode(true);
    clone.querySelectorAll("script,style,nav,header,footer,svg,canvas,input,select,textarea,.listen-btn,#sf-tts,.vid-list,.quiz-nav,.sa-row,.choices,.CodeMirror")
      .forEach(function (n) { n.remove(); });
    var txt = clone.innerText || clone.textContent || "";
    return txt.replace(/\s+\n/g, "\n").trim();
  }

  // ---- split into chunks so long pages don't hit the engine's length cap ----
  function chunk(text) {
    var parts = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]*/g) || [text];
    var out = [], cur = "";
    parts.forEach(function (p) {
      if ((cur + p).length > 220) { if (cur) out.push(cur); cur = p; }
      else cur += p;
    });
    if (cur.trim()) out.push(cur);
    return out;
  }

  function speak() {
    stop();
    var raw = pageText();
    if (!raw) return;
    var chunks = chunk(speakify(raw));
    if (!chunks.length) return;
    playing = true;
    setLabel();
    chunks.forEach(function (c, idx) {
      var u = new SpeechSynthesisUtterance(c);
      u.lang = "en-US";
      u.rate = 1;
      if (idx === chunks.length - 1) u.onend = function () { playing = false; setLabel(); };
      u.onerror = function () { playing = false; setLabel(); };
      try { window.speechSynthesis.speak(u); } catch (e) { playing = false; setLabel(); }
    });
  }

  btn.addEventListener("click", function () { playing ? stop() : speak(); });
  window.addEventListener("beforeunload", stop);
  // resync the label if something else (an in-page reader) cancels speech
  setInterval(function () {
    if (playing && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
      playing = false; setLabel();
    }
  }, 1200);
  setLabel();
})();
