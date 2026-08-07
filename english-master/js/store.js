/* ==========================================================================
   store.js — persistence, user state, XP levels, spaced repetition
   Attaches to the single HEM namespace. Declares no global identifiers.
   All decision logic lives here as pure functions so it can be tested
   without a browser.
   ========================================================================== */
(function (HEM) {
  "use strict";

  var KEY = "hitarthi_english_master_v2";

  /* ---------------- storage backend with automatic fallback ------------- */
  var backend = "memory";
  var mem = {};
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("__hem__", "1");
      window.localStorage.removeItem("__hem__");
      backend = "local";
    }
  } catch (e) {
    backend = "memory";
  }

  function readRaw() {
    try {
      return backend === "local" ? window.localStorage.getItem(KEY) : (mem[KEY] || null);
    } catch (e) { return null; }
  }
  function writeRaw(str) {
    try {
      if (backend === "local") window.localStorage.setItem(KEY, str);
      else mem[KEY] = str;
      return true;
    } catch (e) { return false; }
  }
  function clearRaw() {
    try {
      if (backend === "local") window.localStorage.removeItem(KEY);
      else delete mem[KEY];
    } catch (e) {}
  }

  /* ---------------- default state --------------------------------------- */
  function freshState() {
    return {
      name: "Learner",
      xp: 0,
      coins: 0,
      learned: [],
      srs: {},
      correct: 0,
      answers: 0,
      spellWins: 0,
      speakTries: 0,
      prefixWins: 0,
      dailyDone: 0,
      dayStreak: 0,
      bestStreak: 0,
      lastDay: "",
      timeMs: 0,
      catSeen: {},
      badges: [],
      scores: [],
      lastReward: "",
      daily: { date: "", ids: [], done: false },
      settings: { theme: "light", auto: true, sfx: true, rate: 0.85, voice: "" }
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
        if (k === "settings" || k === "daily") base[k] = Object.assign(base[k], saved[k]);
        else base[k] = saved[k];
      });
    }
    state = base;
    return state;
  }

  function save() { return writeRaw(JSON.stringify(state)); }

  function reset() {
    clearRaw();
    state = freshState();
    save();
    return state;
  }

  /* ---------------- dates ----------------------------------------------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function todayKey(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function daysBetween(a, b) {
    return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
  }

  /* ---------------- XP and levels --------------------------------------- */
  function xpForLevel(n) { return 180 + (n - 1) * 120; }

  function levelFromXp(xp) {
    var level = 1, left = Math.max(0, xp), need = xpForLevel(1);
    while (left >= need && level < 99) {
      left -= need;
      level += 1;
      need = xpForLevel(level);
    }
    return { level: level, into: left, need: need, pct: Math.round((left / need) * 100) };
  }

  var LEVEL_TITLES = [
    "Beginner \u00b7 \u0936\u0941\u0930\u0941\u0906\u0924\u0940",
    "Learner \u00b7 \u0938\u0940\u0916\u0928\u0947 \u0935\u093e\u0932\u093e",
    "Explorer \u00b7 \u0916\u094b\u091c\u0940",
    "Speaker \u00b7 \u0935\u0915\u094d\u0924\u093e",
    "Confident \u00b7 \u0906\u0924\u094d\u092e\u0935\u093f\u0936\u094d\u0935\u093e\u0938\u0940",
    "Fluent \u00b7 \u0927\u093e\u0930\u093e\u092a\u094d\u0930\u0935\u093e\u0939",
    "Achiever \u00b7 \u0909\u092a\u0932\u092c\u094d\u0927\u093f\u0915\u0930\u094d\u0924\u093e",
    "Mentor \u00b7 \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0915",
    "Master \u00b7 \u0928\u093f\u092a\u0941\u0923",
    "Grandmaster \u00b7 \u092e\u0939\u093e\u0930\u0925\u0940"
  ];
  function levelTitle(n) {
    return LEVEL_TITLES[Math.min(Math.max(n, 1), LEVEL_TITLES.length) - 1];
  }

  /* ---------------- day streak ------------------------------------------ */
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

  /* ---------------- spaced repetition (5-box Leitner) ------------------- */
  var BOX_DAYS = [0, 1, 2, 4, 8, 16];

  function srsRecord(id, ok, now) {
    now = now || Date.now();
    var cur = state.srs[id] || { box: 1, due: now, misses: 0 };
    if (ok) cur.box = Math.min(cur.box + 1, 5);
    else { cur.box = 1; cur.misses += 1; }
    cur.due = now + BOX_DAYS[cur.box] * 86400000;
    state.srs[id] = cur;
    return cur;
  }

  function dueWords(now) {
    now = now || Date.now();
    return HEM.WORDS.filter(function (w) {
      var r = state.srs[w.id];
      return r && r.box < 5 && r.due <= now;
    }).sort(function (a, b) {
      return (state.srs[b.id].misses - state.srs[a.id].misses) ||
             (state.srs[a.id].due - state.srs[b.id].due);
    });
  }

  function weakWords() {
    return HEM.WORDS.filter(function (w) {
      var r = state.srs[w.id];
      return r && r.misses > 0;
    }).sort(function (a, b) { return state.srs[b.id].misses - state.srs[a.id].misses; });
  }

  /* ---------------- recording answers ----------------------------------- */
  function recordLearn(word, xp) {
    state.xp += xp;
    if (state.learned.indexOf(word.id) === -1) state.learned.push(word.id);
    state.catSeen[word.cat] = (state.catSeen[word.cat] || 0) + 1;
    save();
  }

  function recordAnswer(word, ok, xp, mode) {
    state.answers += 1;
    if (ok) {
      state.correct += 1;
      state.coins += 1;
      if (state.learned.indexOf(word.id) === -1) state.learned.push(word.id);
    }
    state.catSeen[word.cat] = (state.catSeen[word.cat] || 0) + 1;
    srsRecord(word.id, ok);
    state.xp += xp;
    if (mode === "spell" && ok) state.spellWins += 1;
    if (mode === "speak") state.speakTries += 1;
    save();
  }

  /* Prefix Builder answers count toward XP, coins and overall accuracy,
     but the combined words are not part of the 300-word catalogue, so
     they never touch `learned` or the spaced-repetition boxes. */
  function recordPrefixAnswer(ok, xp) {
    state.answers += 1;
    if (ok) {
      state.correct += 1;
      state.coins += 1;
      state.prefixWins += 1;
    }
    state.xp += xp;
    save();
  }

  /* Turns one prefix-combo row into a word-shaped object so it can reuse
     the same detail card, scoring and summary-list rendering as HEM.WORDS. */
  function comboToWord(combo) {
    return {
      id: "px" + combo.id,
      en: combo.result,
      pron: combo.resultPron,
      hi: combo.resultMeaningHi,
      pos: combo.prefix + "- + " + combo.base + " \u2192 " + combo.result,
      sent: combo.exampleEn,
      sentHi: combo.exampleHi,
      syn: "",
      ant: "",
      tip: "\u0909\u092a\u0938\u0930\u094d\u0917 \u0905\u0930\u094d\u0925 \u00b7 " + combo.prefixMeaningHi + " (" + combo.prefixMeaningEn + ")",
      level: 1,
      cat: "prefix"
    };
  }

  function buildPrefixOptions(combo, rnd) {
    var correct = combo.result;
    var seen = {};
    seen[correct] = true;
    var pool = shuffle(HEM.PREFIXES.filter(function (x) { return x.id !== combo.id; }), rnd);
    var opts = [correct];
    for (var i = 0; i < pool.length && opts.length < 4; i++) {
      var v = pool[i].result;
      if (!seen[v]) { seen[v] = true; opts.push(v); }
    }
    return { correct: correct, options: shuffle(opts, rnd) };
  }

  function accuracy() {
    return state.answers ? Math.round((state.correct / state.answers) * 100) : 0;
  }

  function stats() {
    return {
      learned: state.learned.length,
      answers: state.answers,
      correct: state.correct,
      accuracy: accuracy(),
      bestStreak: state.bestStreak,
      dayStreak: state.dayStreak,
      spellWins: state.spellWins,
      speakTries: state.speakTries,
      dailyDone: state.dailyDone,
      level: levelFromXp(state.xp).level,
      catCount: Object.keys(state.catSeen).length
    };
  }

  /* ---------------- achievements ---------------------------------------- */
  function checkBadges() {
    var st = stats(), fresh = [];
    HEM.ACHIEVEMENTS.forEach(function (a) {
      if (state.badges.indexOf(a.id) === -1 && a.test(st)) {
        state.badges.push(a.id);
        fresh.push(a);
      }
    });
    if (fresh.length) state.coins += fresh.length * 10;
    save();
    return fresh;
  }

  /* ---------------- leaderboard ----------------------------------------- */
  var SAMPLE_BOARD = [
    { name: "Practice partner \u00b7 Asha",  score: 940, sample: true },
    { name: "Practice partner \u00b7 Ravi",  score: 780, sample: true },
    { name: "Practice partner \u00b7 Meena", score: 610, sample: true },
    { name: "Practice partner \u00b7 Karan", score: 430, sample: true }
  ];

  function addScore(score) {
    state.scores.push({ name: state.name || "Learner", score: score, date: todayKey() });
    state.scores.sort(function (a, b) { return b.score - a.score; });
    state.scores = state.scores.slice(0, 10);
    save();
  }

  /* ---------------- deterministic daily set ------------------------------ */
  function seeded(seed) {
    var x = seed % 2147483647;
    if (x <= 0) x += 2147483646;
    return function () { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
  }

  function dailySet(dateKey) {
    var t = dateKey || todayKey();
    if (state.daily.date === t && state.daily.ids.length === 10) {
      return state.daily.ids.map(function (i) { return HEM.WORDS[i]; });
    }
    var rnd = seeded(Number(t.replace(/-/g, "")));
    var pool = HEM.WORDS.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var picked = pool.slice(0, 10);
    state.daily = { date: t, ids: picked.map(function (w) { return w.id; }), done: false };
    save();
    return picked;
  }

  /* ---------------- pure helpers used by the practice modes ------------- */
  function shuffle(arr, rnd) {
    var a = arr.slice(), r = rnd || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Four options that are always distinct strings, correct answer included. */
  function buildQuizOptions(word, askHindi, rnd) {
    var field = askHindi ? "hi" : "en";
    var correct = word[field];
    var seen = {};
    seen[correct] = true;
    var pool = shuffle(HEM.WORDS.filter(function (x) {
      return x.id !== word.id && x.cat !== word.cat;
    }), rnd);
    var opts = [correct];
    for (var i = 0; i < pool.length && opts.length < 4; i++) {
      var v = pool[i][field];
      if (!seen[v]) { seen[v] = true; opts.push(v); }
    }
    return { correct: correct, options: shuffle(opts, rnd) };
  }

  /* Which letter positions to blank out in the spell challenge. */
  function spellBlanks(word, rnd) {
    var idx = [];
    for (var i = 1; i < word.length; i++) if (/[a-z]/i.test(word.charAt(i))) idx.push(i);
    if (!idx.length) return [];
    var count = Math.max(1, Math.min(4, Math.round(idx.length * 0.45)));
    return shuffle(idx, rnd).slice(0, count).sort(function (a, b) { return a - b; });
  }

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
        prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1,
                           last + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
        last = tmp;
      }
    }
    return prev[b.length];
  }

  function similarity(a, b) {
    var clean = function (s) { return String(s).toLowerCase().replace(/[^a-z]/g, ""); };
    var A = clean(a), B = clean(b);
    if (!A.length && !B.length) return 100;
    if (!A.length || !B.length) return 0;
    return Math.max(0, Math.round((1 - levenshtein(A, B) / Math.max(A.length, B.length)) * 100));
  }

  function filterWords(cat, level) {
    return HEM.WORDS.filter(function (w) {
      if (cat && cat !== "all" && w.cat !== cat) return false;
      if (level && w.level !== level) return false;
      return true;
    });
  }

  function searchWords(term) {
    var q = String(term || "").trim().toLowerCase();
    if (!q) return [];
    return HEM.WORDS.filter(function (w) {
      return w.en.toLowerCase().indexOf(q) !== -1 ||
             w.hi.indexOf(q) !== -1 ||
             w.pron.indexOf(q) !== -1 ||
             w.cat.indexOf(q) !== -1 ||
             (w.syn || "").toLowerCase().indexOf(q) !== -1 ||
             (w.ant || "").toLowerCase().indexOf(q) !== -1;
    });
  }

  /* ---------------- public surface --------------------------------------- */
  HEM.store = {
    backend: backend,
    get: function () { return state; },
    load: load,
    save: save,
    reset: reset,
    todayKey: todayKey,
    daysBetween: daysBetween,
    levelFromXp: levelFromXp,
    levelTitle: levelTitle,
    touchDay: touchDay,
    srsRecord: srsRecord,
    dueWords: dueWords,
    weakWords: weakWords,
    recordLearn: recordLearn,
    recordAnswer: recordAnswer,
    recordPrefixAnswer: recordPrefixAnswer,
    comboToWord: comboToWord,
    buildPrefixOptions: buildPrefixOptions,
    accuracy: accuracy,
    stats: stats,
    checkBadges: checkBadges,
    addScore: addScore,
    sampleBoard: SAMPLE_BOARD,
    dailySet: dailySet,
    shuffle: shuffle,
    seeded: seeded,
    buildQuizOptions: buildQuizOptions,
    spellBlanks: spellBlanks,
    similarity: similarity,
    filterWords: filterWords,
    searchWords: searchWords,
    freshState: freshState
  };
})(typeof window !== "undefined" ? (window.HEM = window.HEM || {}) : (global.HEM = global.HEM || {}));
