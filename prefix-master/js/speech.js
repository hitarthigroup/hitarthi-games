/* ==========================================================================
   speech.js — text-to-speech, pronunciation listening, sound effects
   Attaches to the single HPM namespace. Declares no global identifiers.
   Every browser API is feature-detected; nothing here can throw.
   ========================================================================== */
(function (HPM) {
  "use strict";

  var synth = (typeof window !== "undefined" && window.speechSynthesis) || null;
  var voices = [];

  function refreshVoices() {
    if (!synth || !synth.getVoices) return;
    try { voices = synth.getVoices() || []; } catch (e) { voices = []; }
  }
  refreshVoices();
  if (synth && typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", refreshVoices);
  }

  function pickVoice() {
    if (!voices.length) refreshVoices();
    var find = function (re) {
      for (var i = 0; i < voices.length; i++) if (re.test(voices[i].lang || "")) return voices[i];
      return null;
    };
    return find(/^en-IN/i) || find(/^en-GB/i) || find(/^en/i);
  }

  HPM.speech = {
    supported: !!synth,
    voices: function () { return voices.slice(); },
    say: function (text) {
      if (!synth || !text) return false;
      try {
        synth.cancel();
        var u = new window.SpeechSynthesisUtterance(String(text));
        var v = pickVoice();
        if (v) u.voice = v;
        u.lang = v ? v.lang : "en-IN";
        u.rate = 0.88;
        u.pitch = 1;
        synth.speak(u);
        return true;
      } catch (e) { return false; }
    },
    stop: function () { try { if (synth) synth.cancel(); } catch (e) {} }
  };

  /* ---------------- sound effects ---------------------------------------- */
  var ctx = null;
  function tone(freqs, dur) {
    var AC = (typeof window !== "undefined") && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return;
    try {
      ctx = ctx || new AC();
      var t0 = ctx.currentTime, slice = dur / freqs.length;
      freqs.forEach(function (f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f;
        o.connect(g); g.connect(ctx.destination);
        var s = t0 + i * slice;
        g.gain.setValueAtTime(0.0001, s);
        g.gain.exponentialRampToValueAtTime(0.09, s + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, s + slice);
        o.start(s); o.stop(s + slice + 0.02);
      });
    } catch (e) {}
  }
  HPM.sfx = {
    right: function () { tone([660, 880], 0.26); },
    wrong: function () { tone([300, 200], 0.30); },
    tap:   function () { tone([520], 0.08); },
    levelup: function () { tone([523, 659, 784, 1046], 0.5); }
  };

  /* ---------------- speech recognition ------------------------------------ */
  var SR = (typeof window !== "undefined") && (window.SpeechRecognition || window.webkitSpeechRecognition);
  var rec = null;

  HPM.listener = {
    supported: !!SR,
    start: function (onResult, onError, onEnd) {
      if (!SR) { if (onError) onError("unsupported"); return; }
      try {
        rec = new SR();
        rec.lang = "en-IN";
        rec.interimResults = false;
        rec.maxAlternatives = 5;
        rec.onresult = function (e) {
          var out = [];
          for (var i = 0; i < e.results[0].length; i++) out.push(e.results[0][i].transcript);
          if (onResult) onResult(out);
        };
        rec.onerror = function (e) { if (onError) onError((e && e.error) || "error"); };
        rec.onend = function () { if (onEnd) onEnd(); };
        rec.start();
      } catch (e) { if (onError) onError("error"); }
    },
    stop: function () { try { if (rec) rec.stop(); } catch (e) {} }
  };

  function levenshtein(a, b) {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      var last = prev[0];
      prev[0] = i;
      for (j = 1; j <= b.length; j++) {
        var tmp = prev[j];
        prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
        last = tmp;
      }
    }
    return prev[b.length];
  }
  HPM.similarity = function (a, b) {
    var clean = function (s) { return String(s).toLowerCase().replace(/[^a-z]/g, ""); };
    var A = clean(a), B = clean(b);
    if (!A.length && !B.length) return 100;
    if (!A.length || !B.length) return 0;
    return Math.max(0, Math.round((1 - levenshtein(A, B) / Math.max(A.length, B.length)) * 100));
  };
})(typeof window !== "undefined" ? (window.HPM = window.HPM || {}) : (global.HPM = global.HPM || {}));
