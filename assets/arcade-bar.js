/* =====================================================================
   Hitarthi Arcade — the "back to the arcade" pill.

   Add this ONE line to a game's entry page, just before </body>:

     <script src="../assets/arcade-bar.js" defer></script>

   That's the only change a game ever needs. Nothing else in the game is
   touched: the pill lives in a shadow root, so the game's CSS cannot reach
   inside it and its CSS cannot leak out into the game.

   Options (both optional, set on the script tag):
     data-position="bottom-left" | "bottom-right" | "top-left" | "top-right"
     data-href="../"   — only if the arcade lives somewhere unusual

   Skip this on a full-screen play surface where the pill would sit on top of
   the controls — put it on the page the arcade links to instead.
   ===================================================================== */
(function () {
  "use strict";

  var script = document.currentScript || (function () {
    var all = document.getElementsByTagName("script");
    return all[all.length - 1];
  })();

  /* The arcade home is one level up from this file (it lives in /assets/),
     so this stays correct however deep the game page is. */
  var home = "../";
  try { home = new URL("../", script.src).href; } catch (e) {}
  var override = script && script.getAttribute("data-href");
  if (override) home = override;

  var pos = (script && script.getAttribute("data-position")) || "bottom-left";

  var PLACEMENT = {
    "bottom-left":  { bottom: "16px", left: "16px" },
    "bottom-right": { bottom: "16px", right: "16px" },
    "top-left":     { top: "16px", left: "16px" },
    "top-right":    { top: "16px", right: "16px" }
  };

  function mount() {
    if (!document.body) return;
    if (document.getElementById("hitarthi-arcade-bar")) return;

    var host = document.createElement("div");
    host.id = "hitarthi-arcade-bar";

    /* Pin the host from the light DOM, where the game's CSS lives — !important
       so a broad rule in the game can't move or hide it. */
    var place = PLACEMENT[pos] || PLACEMENT["bottom-left"];
    host.style.setProperty("position", "fixed", "important");
    host.style.setProperty("z-index", "2147483000", "important");
    host.style.setProperty("width", "auto", "important");
    host.style.setProperty("height", "auto", "important");
    host.style.setProperty("margin", "0", "important");
    host.style.setProperty("padding", "0", "important");
    host.style.setProperty("inset", "auto", "important");
    Object.keys(place).forEach(function (k) {
      host.style.setProperty(k, place[k], "important");
    });

    if (!host.attachShadow) return; /* very old browser: skip rather than break the game */
    var root = host.attachShadow({ mode: "open" });

    var style = document.createElement("style");
    style.textContent = [
      ":host{ all: initial; }",
      "a{",
      "  display:inline-flex; align-items:center; gap:.45em;",
      "  font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;",
      "  font-size:14px; font-weight:600; line-height:1; white-space:nowrap;",
      "  color:#0f1729; text-decoration:none;",
      "  background:rgba(255,255,255,.94);",
      "  border:1.5px solid #e2e8f0; border-radius:999px;",
      "  padding:9px 15px;",
      "  box-shadow:0 4px 14px rgba(15,23,41,.18);",
      "  -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);",
      "  opacity:.9; transition:opacity .2s ease, transform .2s ease, border-color .2s ease;",
      "}",
      "a:hover{ opacity:1; transform:translateY(-2px); border-color:#f59e0b; }",
      "a:focus-visible{ opacity:1; outline:3px solid #2563eb; outline-offset:3px; }",
      ".arrow{ font-size:15px; line-height:1; }",
      ".hi{ color:#1e6b5e; font-weight:700; }",
      "@media (max-width:420px){ a{ font-size:13px; padding:8px 13px; } .en{ display:none; } }",
      "@media (prefers-reduced-motion: reduce){ a{ transition:none; } a:hover{ transform:none; } }"
    ].join("\n");

    var link = document.createElement("a");
    link.href = home;
    link.setAttribute("aria-label", "Back to Hitarthi Arcade · आर्केड पर वापस जाएँ");

    function span(cls, text, hidden) {
      var s = document.createElement("span");
      s.className = cls;
      s.textContent = text;
      if (hidden) s.setAttribute("aria-hidden", "true");
      return s;
    }
    link.appendChild(span("arrow", "←", true));
    link.appendChild(span("hi", "आर्केड"));
    link.appendChild(span("en", "· Arcade"));

    root.appendChild(style);
    root.appendChild(link);
    document.body.appendChild(host);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
