/* ==========================================================================
   speech.js — text-to-speech, pronunciation listening, sound effects
   Attaches to the single HEM namespace. Declares no global identifiers.
   Every browser API is feature-detected; nothing here can throw.
   ========================================================================== */
(function (HEM) {
  "use strict";

  var synth = (typeof window !== "undefined" && window.speechSynthesis) || null;
  var voices = [];
  var voiceHandlers = [];

  function refreshVoices() {
    if (!synth || !synth.getVoices) return;
    try { voices = synth.getVoices() || []; } catch (e) { voices = []; }
  }
  refreshVoices();
  if (synth && typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", function () {
      refreshVoices();
      voiceHandlers.forEach(function (fn) { try { fn(voices); } catch (e) {} });
    });
  }

  function settings() {
    return (HEM.store && HEM.store.get().settings) || { rate: 0.85, voice: "", sfx: true };
  }

  function pickVoice(lang) {
    if (!voices.length) refreshVoices();
    var find = function (re) {
      for (var i = 0; i < voices.length; i++) if (re.test(voices[i].lang || "")) return voices[i];
      return null;
    };
    if (lang === "hi") return find(/^hi/i);
    var want = settings().voice;
    if (want) {
      for (var i = 0; i < voices.length; i++) if (voices[i].name === want) return voices[i];
    }
    return find(/^en-IN/i) || find(/^en-GB/i) || find(/^en/i);
  }

  HEM.speech = {
    supported: !!synth,
    voices: function () { return voices.slice(); },
    onVoices: function (fn) { if (typeof fn === "function") voiceHandlers.push(fn); },
    say: function (text, lang) {
      if (!synth || !text) return false;
      try {
        synth.cancel();
        var u = new window.SpeechSynthesisUtterance(String(text));
        var v = pickVoice(lang || "en");
        if (v) u.voice = v;
        u.lang = v ? v.lang : (lang === "hi" ? "hi-IN" : "en-IN");
        var rate = Number(settings().rate) || 0.85;
        u.rate = lang === "hi" ? Math.min(1, rate + 0.05) : rate;
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
    if (!settings().sfx) return;
    var AC = (typeof window !== "undefined") && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return;
    try {
      ctx = ctx || new AC();
      var t0 = ctx.currentTime, slice = dur / freqs.length;
      freqs.forEach(function (f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = f;
        o.connect(g); g.connect(ctx.destination);
        var s = t0 + i * slice;
        g.gain.setValueAtTime(0.0001, s);
        g.gain.exponentialRampToValueAtTime(0.09, s + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, s + slice);
        o.start(s); o.stop(s + slice + 0.02);
      });
    } catch (e) {}
  }

  HEM.sfx = {
    right: function () { tone([660, 880], 0.26); },
    wrong: function () { tone([300, 200], 0.30); },
    tap:   function () { tone([520], 0.08); }
  };

  /* ---------------- speech recognition ----------------------------------- */
  var SR = (typeof window !== "undefined") && (window.SpeechRecognition || window.webkitSpeechRecognition);
  var rec = null;

  HEM.listener = {
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
})(typeof window !== "undefined" ? (window.HEM = window.HEM || {}) : (global.HEM = global.HEM || {}));
