/* ==========================================================================
   store.js — persistence and game rules for Hitarthi Prefix Master
   Attaches to the single HPM namespace. Declares no global identifiers.
   All decision logic lives here as pure functions so it is testable
   without a browser.
   ========================================================================== */
(function (HPM) {
  "use strict";

  var KEY = "hitarthi_prefix_master_v1";

  /* ---------------- storage backend with automatic fallback ------------- */
  var backend = "memory";
  var mem = {};
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("__hpm__", "1");
      window.localStorage.removeItem("__hpm__");
      backend = "local";
    }
  } catch (e) { backend = "memory"; }

  function readRaw() {
    try { return backend === "local" ? window.localStorage.getItem(KEY) : (mem[KEY] || null); }
    catch (e) { return null; }
  }
  function writeRaw(str) {
    try {
      if (backend === "local") window.localStorage.setItem(KEY, str);
      else mem[KEY] = str;
      return true;
    } catch (e) { return false; }
  }
  function clearRaw() {
    try { if (backend === "local") window.localStorage.removeItem(KEY); else delete mem[KEY]; }
    catch (e) {}
  }

  /* ---------------- default state ---------------------------------------- */
  function freshState() {
    return {
      xp: 0,
      coins: 0,
      lang: "en",
      theme: "light",
      unlockedLevel: 1,          // highest level currently playable
      completedLevels: [],       // levels the learner has finished at least once
      learnedWords: [],          // word ids answered correctly at least once
      wrongWords: [],            // word ids currently queued for review
      answers: 0,
      correct: 0,
      dayStreak: 0,
      bestStreak: 0,
      lastDay: "",
      timeMs: 0,
      daily: { date: "", ids: [], done: false, score: 0 },
      scores: []
    };
  }

  var state = freshState();

  function load() {
    var raw = readRaw(), saved = null;
    try { saved = raw ? JSON.parse(raw) : null; } catch (e) { saved = null; }
    var base = freshState();
    if (saved && typeof saved === "object") {
      Object.keys(base).forEach(function (k) {
        if (saved[k] === undefined || saved[k] === null) return;
        if (k === "daily") base[k] = Object.assign(base[k], saved[k]);
        else base[k] = saved[k];
      });
    }
    state = base;
    if (HPM.i18n) HPM.i18n.set(state.lang);
    return state;
  }
  function save() { return writeRaw(JSON.stringify(state)); }
  function reset() { clearRaw(); state = freshState(); save(); return state; }

  /* ---------------- dates ------------------------------------------------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function todayKey(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function daysBetween(a, b) {
    return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
  }
  function touchDay(now) {
    var t = todayKey(now);
    if (state.lastDay === t) return state.dayStreak;
    if (!state.lastDay) state.dayStreak = 1;
    else state.dayStreak = daysBetween(state.lastDay, t) === 1 ? state.dayStreak + 1 : 1;
    state.lastDay = t;
    if (state.dayStreak > state.bestStreak) state.bestStreak = state.dayStreak;
    save();
    return state.dayStreak;
  }

  /* ---------------- level system ------------------------------------------ */
  function isLevelUnlocked(level) { return level <= state.unlockedLevel; }

  function completeLevel(level) {
    var firstTime = state.completedLevels.indexOf(level) === -1;
    if (firstTime) {
      state.completedLevels.push(level);
      state.xp += 50;               // "Complete a level: +50 XP"
      if (level === state.unlockedLevel && level < HPM.TOTAL_LEVELS) {
        state.unlockedLevel = level + 1;
      }
      save();
    }
    return firstTime;
  }

  /* ---------------- XP rules ----------------------------------------------
     Correct answer                 : +10 XP
     Correct answer, first attempt  : +15 XP (replaces the +10, not additive)
     Level completed (first time)   : +50 XP  (see completeLevel)
     Daily Challenge finished       : +100 XP (see finishDaily)
     -------------------------------------------------------------------- */
  function xpForAnswer(ok, firstTry) {
    if (!ok) return 0;
    return firstTry ? 15 : 10;
  }

  function recordAnswer(wordId, ok, firstTry) {
    state.answers += 1;
    var xp = xpForAnswer(ok, firstTry);
    if (ok) {
      state.correct += 1;
      state.coins += 1;
      state.xp += xp;
      if (state.learnedWords.indexOf(wordId) === -1) state.learnedWords.push(wordId);
      var wi = state.wrongWords.indexOf(wordId);
      if (wi !== -1) state.wrongWords.splice(wi, 1);
    } else {
      if (state.wrongWords.indexOf(wordId) === -1) state.wrongWords.push(wordId);
    }
    save();
    return xp;
  }

  function accuracy() {
    return state.answers ? Math.round((state.correct / state.answers) * 100) : 0;
  }

  /* ---------------- review queue ------------------------------------------- */
  function reviewWords() {
    return state.wrongWords
      .map(function (id) { return HPM.WORDS[id]; })
      .filter(Boolean);
  }

  /* ---------------- daily challenge ---------------------------------------
     10 questions mixing: meaning, build, find, spell, pronounce, sentence
     (the six categories named in the spec), drawn only from words in
     already-unlocked levels, deterministic per calendar date.
     -------------------------------------------------------------------- */
  function seeded(seed) {
    var x = seed % 2147483647;
    if (x <= 0) x += 2147483646;
    return function () { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
  }
  function shuffle(arr, rnd) {
    var a = arr.slice(), r = rnd || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  var DAILY_MODES = ["meaning", "build", "find", "spell", "pronounce", "sentence"];

  function dailySet(dateKey) {
    var t = dateKey || todayKey();
    if (state.daily.date === t && state.daily.ids.length === 10) {
      return state.daily.ids.map(function (id, i) {
        return { w: HPM.WORDS[id], m: DAILY_MODES[i % DAILY_MODES.length] };
      });
    }
    var pool = HPM.WORDS.filter(function (w) { return w.level <= state.unlockedLevel; });
    if (pool.length < 10) pool = HPM.WORDS.filter(function (w) { return w.level === 1; });
    var rnd = seeded(Number(t.replace(/-/g, "")));
    var picked = shuffle(pool, rnd).slice(0, 10);
    state.daily = { date: t, ids: picked.map(function (w) { return w.id; }), done: false, score: 0 };
    save();
    return picked.map(function (w, i) { return { w: w, m: DAILY_MODES[i % DAILY_MODES.length] }; });
  }

  function finishDaily(score) {
    state.daily.done = true;
    state.daily.score = score;
    state.xp += 100;               // "Daily Challenge: +100 XP"
    save();
  }

  function resultBand(right, total) {
    if (right >= total) return "excellent";
    if (right >= total - 1) return "great";
    if (right / total >= 0.7) return "good";
    return "practice";
  }

  /* ---------------- leaderboard-style score log ---------------------------- */
  function addScore(score) {
    state.scores.push({ score: score, date: todayKey() });
    state.scores.sort(function (a, b) { return b.score - a.score; });
    state.scores = state.scores.slice(0, 10);
    save();
  }

  /* ---------------- option builders used by the game modes ---------------- */
  function buildMeaningOptions(word, rnd) {
    var correct = word.wordMeaningHi;
    var pool = shuffle(HPM.WORDS.filter(function (x) { return x.id !== word.id && x.wordMeaningHi !== correct; }), rnd);
    var seen = {}; seen[correct] = true;
    var opts = [correct];
    for (var i = 0; i < pool.length && opts.length < 4; i++) {
      var v = pool[i].wordMeaningHi;
      if (!seen[v]) { seen[v] = true; opts.push(v); }
    }
    return { correct: correct, options: shuffle(opts, rnd) };
  }

  function buildPrefixOptionsForBuild(word, rnd) {
    var correct = word.prefix;
    var family = HPM.PREFIX_INFO.map(function (p) { return p.key; });
    var pool = shuffle(family.filter(function (p) { return p !== correct; }), rnd);
    var opts = [correct].concat(pool.slice(0, 3));
    return { correct: correct, options: shuffle(opts, rnd) };
  }

  function buildFindPrefixOptions(word, rnd) {
    return buildPrefixOptionsForBuild(word, rnd);
  }

  function buildSentenceOptions(word, rnd) {
    var correct = word.exampleEn;
    var pool = shuffle(HPM.WORDS.filter(function (x) { return x.id !== word.id; }), rnd);
    var opts = [correct].concat(pool.slice(0, 3).map(function (x) { return x.exampleEn; }));
    return { correct: correct, options: shuffle(opts, rnd) };
  }

  function spellBlanks(word, rnd) {
    var w = word.toLowerCase();
    var idx = [];
    for (var i = 0; i < w.length; i++) if (/[a-z]/.test(w.charAt(i))) idx.push(i);
    var count = Math.max(1, Math.min(4, Math.round(idx.length * 0.35)));
    return shuffle(idx, rnd).slice(0, count).sort(function (a, b) { return a - b; });
  }

  function buildMatchSet(words) {
    return {
      prefixes: shuffle(words.map(function (w) { return { id: w.id, prefix: w.prefix }; })),
      roots: shuffle(words.map(function (w) { return { id: w.id, root: w.root }; }))
    };
  }

  /* ---------------- public surface --------------------------------------- */
  HPM.store = {
    backend: backend,
    get: function () { return state; },
    load: load,
    save: save,
    reset: reset,
    todayKey: todayKey,
    daysBetween: daysBetween,
    touchDay: touchDay,
    isLevelUnlocked: isLevelUnlocked,
    completeLevel: completeLevel,
    xpForAnswer: xpForAnswer,
    recordAnswer: recordAnswer,
    accuracy: accuracy,
    reviewWords: reviewWords,
    dailySet: dailySet,
    finishDaily: finishDaily,
    resultBand: resultBand,
    addScore: addScore,
    shuffle: shuffle,
    seeded: seeded,
    buildMeaningOptions: buildMeaningOptions,
    buildPrefixOptionsForBuild: buildPrefixOptionsForBuild,
    buildFindPrefixOptions: buildFindPrefixOptions,
    buildSentenceOptions: buildSentenceOptions,
    spellBlanks: spellBlanks,
    buildMatchSet: buildMatchSet,
    freshState: freshState
  };
})(typeof window !== "undefined" ? (window.HPM = window.HPM || {}) : (global.HPM = global.HPM || {}));
