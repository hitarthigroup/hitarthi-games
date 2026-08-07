/* ==========================================================================
   app.js — Hitarthi Prefix Master
   Router, i18n application, level system, 8 game-mode engines, results.
   Wrapped in a single IIFE. Declares no global identifiers other than the
   shared HPM namespace, so it can never collide with another script and
   is safe even if included twice.
   ========================================================================== */
(function (HPM) {
  "use strict";

  if (HPM.app && HPM.app.booted) return;

  var store  = HPM.store;
  var speech = HPM.speech;
  var sfx    = HPM.sfx;
  var listen = HPM.listener;
  var t      = function (key, vars) { return HPM.i18n.t(key, vars); };

  /* ---------------- dom helpers --------------------------------------- */
  function byId(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function make(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined && html !== null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function setText(id, txt) { var n = byId(id); if (n) n.textContent = txt; }
  function on(node, evt, fn) { if (node && node.addEventListener) node.addEventListener(evt, fn); }

  var toastTimer = null;
  function toast(msg, kind) {
    var el = byId("toast");
    if (!el) return;
    el.textContent = msg;
    el.className = "toast is-on" + (kind ? " " + kind : "");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = "toast"; }, 2300);
  }

  /* ---------------- router --------------------------------------------- */
  var SCREENS = ["home", "levels", "lesson", "challenge", "session", "result", "practice", "daily", "progress"];
  var current = "home";
  var RENDER = {};

  function go(name) {
    if (SCREENS.indexOf(name) === -1) return;
    speech.stop();
    current = name;
    SCREENS.forEach(function (s) {
      var node = byId("s-" + s);
      if (node) node.classList.toggle("is-on", s === name);
    });
    if (RENDER[name]) RENDER[name]();
    if (typeof window !== "undefined" && window.scrollTo) window.scrollTo(0, 0);
  }

  /* ---------------- static i18n application ----------------------------
     Every fixed-position label in index.html has a stable id. Toggling
     language rewrites all of them, then re-renders whichever screen is
     open so its dynamically generated content (question text, options,
     level cards) is rebuilt in the new language too. */
  var STATIC_MAP = {
    brandName: "brand_name", gameName: "game_name",
    brandTag: "tagline", tagline: "tagline",
    lblLevel: "stat_level", lblXp: "stat_xp", lblStreak: "stat_streak",
    lblWords: "stat_words", lblAcc: "stat_accuracy",
    tStart: "nav_start", tChallenge: "nav_challenge", tPractice: "nav_practice",
    tDaily: "nav_daily", tProgress: "nav_progress",
    levelsTitle: "nav_start",
    lessonHeading: "lesson_heading", lessonFormula: "lesson_formula",
    btnStartLevelQuiz: "btn_start_level_quiz",
    challengeTitle: "nav_challenge", pickLevelLabel: "stat_level",
    pickLenLabel: "label_questions", pickModeLabel: "label_mode",
    resultTitle: "result_title", lblRScore: "result_score", lblRAcc: "result_accuracy",
    lblRXp: "result_xp_earned", lblRWords: "result_words_learned", lblRStreak: "result_streak",
    btnNextLevel: "btn_next_level", btnAgain: "btn_practice_again", btnResultHome: "btn_home",
    reviewHeading: "result_review_heading", btnPracticeReview: "btn_practice_again",
    practiceTitle: "nav_practice",
    dailyTitle: "nav_daily", dailySub: "daily_sub", btnStartDaily: "nav_daily",
    progressTitle: "nav_progress", pgWordsLbl: "label_of_112",
    pgAccLbl: "stat_accuracy", pgStreakLbl: "label_current_streak", pgBestLbl: "label_best_streak",
    pgXpLbl: "label_total_xp", pgLevelLbl: "stat_level",
    progressLevelsHeading: "progress_levels_heading"
  };

  function applyStaticI18n() {
    Object.keys(STATIC_MAP).forEach(function (id) { setText(id, t(STATIC_MAP[id])); });
    var langBtn = byId("btnLang");
    if (langBtn) langBtn.textContent = t("lang_toggle");
    document.documentElement.setAttribute("lang", HPM.i18n.get());
  }

  function toggleLanguage() {
    var lang = HPM.i18n.toggle();
    store.get().lang = lang;
    store.save();
    applyStaticI18n();
    if (RENDER[current]) RENDER[current]();
  }

  /* ---------------- home -------------------------------------------------- */
  RENDER.home = function () {
    var st = store.get();
    setText("statLevel", st.unlockedLevel);
    setText("statXp", st.xp);
    setText("statStreak", st.dayStreak);
    setText("statWords", st.learnedWords.length);
    setText("statAcc", store.accuracy() + "%");
    var reviewN = st.wrongWords.length;
    var reviewEl = byId("tileReviewCount");
    if (reviewEl) reviewEl.textContent = reviewN ? String(reviewN) : "";
  };

  /* ---------------- levels ------------------------------------------------ */
  RENDER.levels = function () {
    var st = store.get();
    var host = byId("levelGrid");
    if (!host) return;
    host.innerHTML = "";
    HPM.LEVEL_INFO.forEach(function (lv) {
      var unlocked = store.isLevelUnlocked(lv.level);
      var done = st.completedLevels.indexOf(lv.level) !== -1;
      var card = make("button", "level-card" + (unlocked ? "" : " locked") + (done ? " done" : ""),
        "<span class='num'>" + t("level_current") + " " + lv.level + "</span>" +
        "<span class='title'>" + esc(lv.titleEn) + "</span>" +
        "<span class='badge'>" + (done ? "✓" : (unlocked ? lv.level : "🔒")) + "</span>" +
        (unlocked ? "" : "<span class='lockline'>" + t("level_locked") + "</span>"));
      card.setAttribute("type", "button");
      card.disabled = !unlocked;
      on(card, "click", function () {
        if (!unlocked) { toast(t("toast_level_locked"), "bad"); return; }
        openLesson(lv.level);
      });
      host.appendChild(card);
    });
  };

  /* ---------------- lesson ------------------------------------------------ */
  var lessonLevel = 1;

  function openLesson(level) {
    lessonLevel = level;
    go("lesson");
  }

  RENDER.lesson = function () {
    var lv = HPM.LEVEL_INFO.filter(function (l) { return l.level === lessonLevel; })[0];
    if (!lv) return;
    setText("lessonLevelTitle", t("level_current") + " " + lessonLevel + " · " + lv.titleEn);

    var families = lv.prefixes.map(function (k) { return HPM.prefixInfo(k); }).filter(Boolean);
    var demo = HPM.wordsForLevel(lessonLevel)[0];
    var ex = byId("lessonExample");
    if (ex && demo) {
      ex.innerHTML =
        "<p class='eyebrow' style='margin-top:14px'>" + t("lesson_example_heading") + "</p>" +
        "<div class='lex-row'>" +
        "<span class='tag'>" + esc(demo.prefix.toUpperCase()) + "-</span>" +
        "<span class='plus'>+</span>" +
        "<span class='tag'>" + esc(demo.root.toUpperCase()) + "</span>" +
        "<span class='eq'>=</span>" +
        "<span class='tag'>" + esc(demo.word.toUpperCase()) + "</span></div>" +
        "<div class='lex-row hi'>" + esc(demo.root) + " = " + esc(demo.rootMeaningHi) +
        " &nbsp;·&nbsp; " + esc(demo.word) + " = " + esc(demo.wordMeaningHi) + "</div>" +
        "<div class='lex-row'>🔊 <b>" + esc(demo.root) + "</b> → " + esc(demo.rootPron) +
        " &nbsp;·&nbsp; <b>" + esc(demo.word) + "</b> → " + esc(demo.wordPron) + "</div>";
    }

    var host = byId("prefixCards");
    host.innerHTML = "";
    families.forEach(function (fam) {
      var words = HPM.WORDS.filter(function (w) { return w.prefix === fam.key; }).slice(0, 6);
      var card = make("div", "prefix-card",
        "<div class='head'><b>" + esc(fam.display) + "</b><span>" +
        esc(fam.meaningEn) + " · " + esc(fam.meaningHi) + "</span></div>");
      var list = make("div", "words");
      words.forEach(function (w) {
        list.appendChild(make("div", "pw-row",
          "<span>" + esc(w.root) + "</span><span class='arrow'>→</span>" +
          "<span class='new'>" + esc(w.word) + " <span class='meaning'>" + esc(w.wordMeaningHi) + "</span></span>"));
      });
      card.appendChild(list);
      host.appendChild(card);
    });

    var btn = byId("btnStartLevelQuiz");
    if (btn) {
      btn.onclick = function () {
        var words = HPM.wordsForLevel(lessonLevel);
        startLevelQuiz(words, lessonLevel);
      };
    }
  };

  /* ---------------- challenge picker --------------------------------------- */
  var pick = { level: 0, len: 10 };   // level 0 = all unlocked levels

  var MODE_LIST = ["meaning", "build", "find", "transform", "match", "spell", "pronounce", "sentence"];
  var MODE_ICON = { meaning:"❓", build:"🧩", find:"🔎", transform:"🔁", match:"🔗", spell:"✍", pronounce:"🎤", sentence:"📝" };
  var MODE_LABEL_KEY = {
    meaning:"mode_meaning", build:"mode_build", find:"mode_find", transform:"mode_transform",
    match:"mode_match", spell:"mode_spell", pronounce:"mode_pronounce", sentence:"mode_sentence"
  };

  RENDER.challenge = function () {
    var st = store.get();
    var lvlHost = byId("challengeLevelChips");
    lvlHost.innerHTML = "";
    var allChip = make("button", "chip" + (pick.level === 0 ? " is-on" : ""), t("nav_challenge") === "" ? "All" : "All");
    allChip.setAttribute("type", "button");
    allChip.setAttribute("data-lvl", "0");
    lvlHost.appendChild(allChip);
    HPM.LEVEL_INFO.forEach(function (lv) {
      if (!store.isLevelUnlocked(lv.level)) return;
      var b = make("button", "chip" + (pick.level === lv.level ? " is-on" : ""), t("level_current") + " " + lv.level);
      b.setAttribute("type", "button");
      b.setAttribute("data-lvl", String(lv.level));
      lvlHost.appendChild(b);
    });

    var modeHost = byId("challengeModeGrid");
    modeHost.innerHTML = "";
    MODE_LIST.forEach(function (m) {
      var b = make("button", "tile", "<span class='ico'>" + MODE_ICON[m] + "</span><b>" + t(MODE_LABEL_KEY[m]) + "</b>");
      b.setAttribute("type", "button");
      b.setAttribute("data-mode", m);
      modeHost.appendChild(b);
    });
    void st;
  };

  function wireChallengeChips() {
    on(byId("challengeLevelChips"), "click", function (e) {
      var b = e.target.closest ? e.target.closest(".chip") : null;
      if (!b) return;
      all(".chip", byId("challengeLevelChips")).forEach(function (c) { c.classList.remove("is-on"); });
      b.classList.add("is-on");
      pick.level = Number(b.getAttribute("data-lvl"));
    });
    on(byId("challengeLenChips"), "click", function (e) {
      var b = e.target.closest ? e.target.closest(".chip") : null;
      if (!b) return;
      all(".chip", byId("challengeLenChips")).forEach(function (c) { c.classList.remove("is-on"); });
      b.classList.add("is-on");
      pick.len = Number(b.getAttribute("data-len"));
    });
    on(byId("challengeModeGrid"), "click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-mode]") : null;
      if (!b) return;
      var mode = b.getAttribute("data-mode");
      var pool = pick.level === 0
        ? HPM.WORDS.filter(function (w) { return store.isLevelUnlocked(w.level); })
        : HPM.wordsForLevel(pick.level);
      if (!pool.length) { toast(t("toast_no_words"), "bad"); return; }
      startFreeSession(pool, mode, pick.len);
    });
  }

  /* ---------------- session engine -----------------------------------------
     sess.steps is an array of { w, m, attempts, done }. Multiple-choice
     modes (meaning/build/find/sentence) allow one retry after a hint
     before the answer is revealed. Spell/transform allow one retry via
     the Check button. Pronounce and Match are single-attempt / single
     mega-step respectively (see their functions for details). */
  var sess = null;
  var lastSessionConfig = null;
  var keyHandler = null;

  function newStep(w, m) { return { w: w, m: m, attempts: 0, done: false }; }

  function beginSession(steps, opts) {
    var st = store.get();
    sess = {
      steps: steps,
      i: 0,
      right: 0,
      wrong: 0,
      xp: 0,
      isLevelQuiz: !!opts.isLevelQuiz,
      levelQuizLevel: opts.level || null,
      isDaily: !!opts.isDaily,
      title: opts.title || "",
      subLabel: opts.subLabel || "",
      results: [],
      learnedBefore: st.learnedWords.length,
      newlyLearned: 0,
      t0: Date.now()
    };
    setText("sessTitle", opts.title || "");
    go("session");
    renderStep();
  }

  function startFreeSession(pool, mode, len) {
    var words = store.shuffle(pool).slice(0, Math.min(len, pool.length));
    if (mode === "match") {
      var setWords = words.slice(0, Math.min(5, words.length));
      beginSession([newStep(setWords, "match")], { title: t(MODE_LABEL_KEY.match) });
      return;
    }
    var steps = words.map(function (w) { return newStep(w, mode); });
    beginSession(steps, { title: t(MODE_LABEL_KEY[mode]) || "" });
  }

  function startLevelQuiz(words, level) {
    var steps = store.shuffle(words).map(function (w) { return newStep(w, "meaning"); });
    beginSession(steps, {
      title: t("level_current") + " " + level + " · " + t("mode_meaning"),
      isLevelQuiz: true,
      level: level
    });
  }

  function startDailySession() {
    var pairs = store.dailySet();
    var replay = store.get().daily.done;
    var steps = pairs.map(function (p) { return newStep(p.w, p.m); });
    beginSession(steps, { title: t("daily_title"), isDaily: true });
    if (replay) toast(t("daily_done_today"));
  }

  function startPracticeSession() {
    var words = store.reviewWords();
    if (!words.length) { toast(t("practice_empty_body")); return; }
    var modes = ["meaning", "find", "spell", "sentence"];
    var steps = words.map(function (w, i) { return newStep(w, modes[i % modes.length]); });
    beginSession(steps, { title: t("practice_title") });
  }

  function renderStep() {
    keyHandler = null;
    if (!sess) return;
    if (sess.i >= sess.steps.length) { finishSession(); return; }

    var step = sess.steps[sess.i];
    setText("sessSub", (sess.i + 1) + " / " + sess.steps.length);
    var bar = byId("sessBar");
    if (bar) bar.style.width = Math.round((sess.i / sess.steps.length) * 100) + "%";

    var stage = byId("stage");
    stage.innerHTML = "";

    if (step.m === "meaning") modeMeaning(stage, step);
    else if (step.m === "build") modeBuild(stage, step);
    else if (step.m === "find") modeFind(stage, step);
    else if (step.m === "transform") modeTransform(stage, step);
    else if (step.m === "match") modeMatch(stage, step);
    else if (step.m === "spell") modeSpell(stage, step);
    else if (step.m === "pronounce") modePronounce(stage, step);
    else if (step.m === "sentence") modeSentence(stage, step);
  }

  function nextStep() { if (sess) { sess.i += 1; renderStep(); } }

  /* Finalises one step: records the answer, awards XP, tracks new-learned
     count, pushes a result row, and returns the XP awarded so the mode
     function can display it. */
  function finalizeStep(step, ok, firstTry) {
    var st = store.get();
    var wasLearned = st.learnedWords.indexOf(step.w.id) !== -1;
    var xp = store.recordAnswer(step.w.id, ok, firstTry);
    if (ok) {
      sess.right += 1;
      sfx.right();
      if (!wasLearned) sess.newlyLearned += 1;
    } else {
      sess.wrong += 1;
      sfx.wrong();
    }
    sess.xp += xp;
    sess.results.push({ w: step.w, ok: ok });
    return xp;
  }

  /* ---------------- shared mode helpers ------------------------------------ */
  var HINT_KEY = {
    un:"hint_negative", dis:"hint_negative", in:"hint_negative", im:"hint_negative",
    il:"hint_negative", ir:"hint_negative", non:"hint_negative",
    re:"hint_again", pre:"hint_before", mis:"hint_wrongly",
    over:"hint_too_much", under:"hint_too_little",
    anti:"hint_against", auto:"hint_self", super:"hint_beyond", trans:"hint_across"
  };
  function hintFor(prefixKey) { return t(HINT_KEY[prefixKey] || "hint_negative"); }

  /* Shows the prefix's own meaning and the root word's Hindi meaning
     together — e.g. "UN- = नहीं (not) · LIMITED = सीमित" — so the learner
     can reason their way to the answer instead of guessing blind. This
     never reveals the combined word's own meaning, which stays the
     actual question. */
  function meaningHintLine(w) {
    var info = HPM.prefixInfo(w.prefix);
    var prefixPart = info
      ? esc(w.prefix.toUpperCase()) + "- = <b>" + esc(info.meaningHi) + "</b> <i>(" + esc(info.meaningEn) + ")</i>"
      : "";
    var rootPart = esc(w.root) + " = <b>" + esc(w.rootMeaningHi) + "</b>";
    return "<p class='readhint hi'>" + prefixPart + (prefixPart ? " &nbsp;·&nbsp; " : "") + rootPart + "</p>";
  }

  /* Root meaning only — used in Build the Word, where the prefix itself
     is the answer being guessed, so showing the prefix's meaning there
     would give the answer away. */
  function rootMeaningLine(w) {
    return "<p class='readhint hi'>" + esc(w.root) + " = <b>" + esc(w.rootMeaningHi) + "</b></p>";
  }

  function speakButton(text, cls, label) {
    var b = make("button", cls || "btn ghost sm", label || ("🔊 " + esc(text)));
    b.setAttribute("type", "button");
    on(b, "click", function () { speech.say(text); });
    return b;
  }

  function nextButton(label) {
    var isLast = sess && sess.i === sess.steps.length - 1;
    var b = make("button", "btn next", label || t(isLast ? "btn_finish" : "btn_next"));
    b.setAttribute("type", "button");
    on(b, "click", nextStep);
    return b;
  }

  function wordDetailLines(w) {
    return "<p class='line'><b>" + esc(w.prefix.toUpperCase()) + "-</b> + <b>" + esc(w.root) + "</b> = <b>" + esc(w.word) + "</b></p>" +
      "<p class='line hi'>" + t("label_pronunciation") + ": <b>" + esc(w.wordPron) + "</b> · " + t("label_meaning") + ": <b>" + esc(w.wordMeaningHi) + "</b></p>" +
      "<p class='line dim'>" + esc(w.wordMeaningEn) + "</p>" +
      "<p class='line'>" + esc(w.exampleEn) + "</p>" +
      "<p class='line hi dim'>" + esc(w.exampleHi) + "</p>";
  }

  /* Generic driver for the four multiple-choice modes (meaning / build /
     find / sentence). `built` supplies {correct, options}; `optClass`
     lets each mode render Hindi vs plain text; `renderExplain` returns
     the extra HTML shown once the step concludes. Handles the "wrong →
     hint → one retry → reveal" flow shared by all four modes. */
  function runChoiceMode(stage, step, built, optClass, hintText, renderExplain) {
    var box = make("div", "options");
    var out = make("div", "");
    stage.appendChild(box);
    stage.appendChild(out);

    var lastChosen = null;

    built.options.forEach(function (o, k) {
      var b = make("button", "opt", "<span class='k'>" + (k + 1) + "</span><span class='" + (optClass || "") + "'>" + esc(o) + "</span>");
      b.setAttribute("type", "button");
      b.setAttribute("data-val", o);
      on(b, "click", function () { pick(o, b); });
      box.appendChild(b);
    });

    function pick(chosen, btnNode) {
      if (step.done) return;
      step.attempts += 1;
      lastChosen = chosen;
      var ok = chosen === built.correct;
      if (ok) { conclude(true, step.attempts === 1); return; }
      if (step.attempts >= 2) { conclude(false, false); return; }
      btnNode.classList.add("tried");
      btnNode.disabled = true;
      var hb = stage.querySelector(".hint-box");
      if (hb) hb.remove();
      var hint = make("div", "hint-box", "⚠ " + t("feedback_wrong") + "<br>" + hintText);
      out.parentNode.insertBefore(hint, out);
    }

    function conclude(ok, firstTry) {
      step.done = true;
      all(".opt", box).forEach(function (b) {
        b.disabled = true;
        var v = b.getAttribute("data-val");
        if (v === built.correct) b.classList.add("right");
        else if (!ok && v === lastChosen) b.classList.add("wrong");
        else if (!b.classList.contains("tried")) b.classList.add("fade");
      });
      var hb = stage.querySelector(".hint-box");
      if (hb) hb.remove();
      var xp = finalizeStep(step, ok, firstTry);
      var panel = make("div", "explain " + (ok ? "ok" : "no"),
        "<h4>" + (ok ? (firstTry ? "✓ " + t("feedback_first_try") : "✓ " + t("feedback_correct")) : "✕ " + t("feedback_reveal_prompt")) +
        "<span class='xp'>+" + xp + " XP</span></h4>" + renderExplain());
      out.appendChild(panel);
      out.appendChild(nextButton());
    }

    keyHandler = function (n) {
      var b = all(".opt", box)[n - 1];
      if (b && !b.disabled) b.click();
    };
  }

  /* ---------------- mode 1 · guess the meaning ------------------------------ */
  function modeMeaning(stage, step) {
    var w = step.w;
    var built = store.buildMeaningOptions(w);
    stage.appendChild(make("div", "wordstage",
      "<p class='parts'><span class='pfx'>" + esc(w.prefix.toUpperCase()) + "-</span><span class='plus'>+</span><span class='base'>" + esc(w.root.toUpperCase()) + "</span></p>" +
      meaningHintLine(w) +
      "<p class='readhint hi'>" + t("label_pronunciation") + ": <b>" + esc(w.wordPron) + "</b></p>" +
      "<p class='prompt hi'>" + t("q_meaning", { word: w.word.toUpperCase() }) + "</p>"));
    runChoiceMode(stage, step, built, "hi", hintFor(w.prefix), function () { return wordDetailLines(w); });
  }

  /* ---------------- mode 2 · build the word --------------------------------- */
  function modeBuild(stage, step) {
    var w = step.w;
    var built = store.buildPrefixOptionsForBuild(w);
    var negation = ["un","dis","in","im","il","ir","non"].indexOf(w.prefix) !== -1;
    stage.appendChild(make("div", "wordstage",
      "<p class='big'>" + esc(w.root.toUpperCase()) + "</p>" +
      rootMeaningLine(w) +
      "<p class='readhint hi'>" + t("label_pronunciation") + ": <b>" + esc(w.rootPron) + "</b></p>" +
      "<p class='prompt hi'>" + (negation ? t("q_build") : t("q_build_general")) + "</p>"));
    var optionLabels = built.options.map(function (p) { return p.toUpperCase() + "-"; });
    var builtLabelled = { correct: w.prefix.toUpperCase() + "-", options: optionLabels };
    runChoiceMode(stage, step, builtLabelled, "", hintFor(w.prefix), function () { return wordDetailLines(w); });
  }

  /* ---------------- mode 3 · find the prefix --------------------------------- */
  function modeFind(stage, step) {
    var w = step.w;
    var built = store.buildFindPrefixOptions(w);
    stage.appendChild(make("div", "wordstage",
      "<p class='big'>" + esc(w.word.toUpperCase()) + "</p>" +
      "<p class='readhint hi'>" + t("label_pronunciation") + ": <b>" + esc(w.wordPron) + "</b></p>" +
      "<p class='prompt hi'>" + t("q_find") + "</p>"));
    var optionLabels = built.options.map(function (p) { return p.toUpperCase() + "-"; });
    var builtLabelled = { correct: w.prefix.toUpperCase() + "-", options: optionLabels };
    runChoiceMode(stage, step, builtLabelled, "", hintFor(w.prefix), function () { return wordDetailLines(w); });
  }

  /* ---------------- mode 4 · word transformation ----------------------------- */
  function modeTransform(stage, step) {
    var w = step.w;
    var prefixLetters = w.prefix.split("");
    stage.appendChild(make("div", "wordstage",
      "<p class='prompt hi' style='margin-top:0'>" + t("q_transform", { prefix: w.prefix.toUpperCase(), root: w.root.toUpperCase() }) + "</p>" +
      "<p class='big' style='margin-top:14px'>" + esc(w.root.toUpperCase()) + "</p>" +
      meaningHintLine(w) +
      "<p class='readhint hi'>" + t("label_pronunciation") + ": <b>" + esc(w.rootPron) + "</b></p>"));

    var box = make("div", "spellbox");
    var filled = {};
    var slots = [];
    prefixLetters.forEach(function (ch, idx) {
      var s = make("div", "slot blank", "");
      s.setAttribute("data-idx", String(idx));
      on(s, "click", function () {
        if (step.done || !filled[idx]) return;
        var used = bank.querySelector("[data-bid='" + filled[idx].bid + "']");
        if (used) used.classList.remove("used");
        delete filled[idx];
        s.textContent = "";
      });
      slots.push(s);
      box.appendChild(s);
    });
    box.appendChild(make("div", "slot fixed", esc(w.root.toUpperCase())));
    stage.appendChild(box);

    var bankLetters = store.shuffle(
      prefixLetters.map(function (c) { return c.toUpperCase(); })
        .concat(store.shuffle("ABCDEFGHKLMNOPRSTUVWY".split("")).slice(0, 3))
    );
    var bank = make("div", "letterbank");
    bankLetters.forEach(function (L, bid) {
      var b = make("button", "lkey", esc(L));
      b.setAttribute("type", "button");
      b.setAttribute("data-bid", String(bid));
      on(b, "click", function () {
        if (step.done) return;
        var open = -1;
        for (var i = 0; i < slots.length; i++) if (!filled[i]) { open = i; break; }
        if (open === -1) return;
        filled[open] = { ch: L, bid: bid };
        slots[open].textContent = L;
        b.classList.add("used");
        sfx.tap();
      });
      bank.appendChild(b);
    });
    stage.appendChild(bank);

    var out = make("div", "");
    var checkBtn = make("button", "btn next", t("btn_check"));
    checkBtn.setAttribute("type", "button");
    stage.appendChild(checkBtn);
    stage.appendChild(out);

    on(checkBtn, "click", function () {
      if (step.done) return;
      for (var i = 0; i < slots.length; i++) if (!filled[i]) { toast(t("q_transform", { prefix: w.prefix.toUpperCase(), root: w.root.toUpperCase() })); return; }
      step.attempts += 1;
      var guess = prefixLetters.map(function (_, i) { return filled[i].ch.toLowerCase(); }).join("");
      var ok = guess === w.prefix.toLowerCase();
      slots.forEach(function (s, i) {
        var good = filled[i].ch.toLowerCase() === prefixLetters[i];
        s.classList.remove("good", "bad");
        s.classList.add(good ? "good" : "bad");
      });
      if (ok || step.attempts >= 2) {
        step.done = true;
        checkBtn.remove();
        var xp = finalizeStep(step, ok, step.attempts === 1);
        out.appendChild(make("div", "explain " + (ok ? "ok" : "no"),
          "<h4>" + (ok ? "✓ " + t("feedback_correct") : "✕ " + t("feedback_reveal_prompt")) +
          "<span class='xp'>+" + xp + " XP</span></h4>" + wordDetailLines(w)));
        speech.say(w.word);
        out.appendChild(nextButton());
      } else {
        toast(t("feedback_wrong"));
      }
    });
  }

  /* ---------------- mode 5 · prefix match ------------------------------------
     A single mega-step: the whole match round is one entry in sess.steps.
     Correct pairs award a flat +10 XP each (via store.recordAnswer with
     firstTry=false) since "first attempt" does not map cleanly onto a
     matching game; wrong taps just flash and reset, with no XP or
     review-queue effect, since a mismatched tap does not clearly belong
     to one specific word. This is a deliberate simplification, noted in
     the README. */
  function modeMatch(stage, step) {
    var words = step.w;
    var matchedIds = {};
    var selPrefix = null, selRoot = null;

    stage.appendChild(make("div", "wordstage",
      "<p class='prompt hi' style='margin-top:0'>" + t("q_match") + "</p>"));

    var cols = make("div", "match-cols");
    var prefixCol = make("div", "match-col", "<b>" + t("label_prefix") + "</b>");
    var rootCol = make("div", "match-col", "<b>" + t("label_root") + "</b>");
    cols.appendChild(prefixCol);
    cols.appendChild(rootCol);
    stage.appendChild(cols);

    var reveal = make("div", "match-reveal");
    var out = make("div", "");
    stage.appendChild(reveal);
    stage.appendChild(out);

    var prefixOrder = store.shuffle(words);
    var rootOrder = store.shuffle(words);

    var prefixBtns = {}, rootBtns = {};

    prefixOrder.forEach(function (w) {
      var b = make("button", "match-item", esc(w.prefix.toUpperCase()) + "-");
      b.setAttribute("type", "button");
      on(b, "click", function () { pickPrefix(w.id, b); });
      prefixCol.appendChild(b);
      prefixBtns[w.id] = b;
    });
    rootOrder.forEach(function (w) {
      var b = make("button", "match-item", esc(w.root.toUpperCase()));
      b.setAttribute("type", "button");
      on(b, "click", function () { pickRoot(w.id, b); });
      rootCol.appendChild(b);
      rootBtns[w.id] = b;
    });

    function pickPrefix(id, btn) {
      if (matchedIds[id]) return;
      if (selPrefix) selPrefix.btn.classList.remove("sel");
      selPrefix = { id: id, btn: btn };
      btn.classList.add("sel");
      tryMatch();
    }
    function pickRoot(id, btn) {
      if (matchedIds[id]) return;
      if (selRoot) selRoot.btn.classList.remove("sel");
      selRoot = { id: id, btn: btn };
      btn.classList.add("sel");
      tryMatch();
    }
    function tryMatch() {
      if (!selPrefix || !selRoot) return;
      if (selPrefix.id === selRoot.id) {
        matchedIds[selPrefix.id] = true;
        selPrefix.btn.classList.remove("sel");
        selRoot.btn.classList.remove("sel");
        selPrefix.btn.classList.add("matched");
        selRoot.btn.classList.add("matched");
        selPrefix.btn.disabled = true;
        selRoot.btn.disabled = true;
        sfx.right();
        var w = words.filter(function (x) { return x.id === selPrefix.id; })[0];
        reveal.appendChild(make("div", "explain ok",
          "<h4>✓ " + esc(w.prefix.toUpperCase()) + "- + " + esc(w.root) + " = " + esc(w.word) + "</h4>" +
          "<p class='line hi'>" + esc(w.wordMeaningHi) + "</p>"));
        selPrefix = null; selRoot = null;
        if (Object.keys(matchedIds).length === words.length) allMatched();
      } else {
        sfx.wrong();
        selPrefix.btn.classList.add("wrongflash");
        selRoot.btn.classList.add("wrongflash");
        setTimeout(function () {
          if (selPrefix) selPrefix.btn.classList.remove("sel", "wrongflash");
          if (selRoot) selRoot.btn.classList.remove("sel", "wrongflash");
          selPrefix = null; selRoot = null;
        }, 500);
      }
    }
    function allMatched() {
      words.forEach(function (w) { finalizeStep({ w: w, done: true, attempts: 1 }, true, false); });
      out.appendChild(nextButton(t("btn_finish")));
    }
  }

  /* ---------------- mode 6 · spelling challenge ------------------------------ */
  function modeSpell(stage, step) {
    var w = step.w;
    var full = w.word;
    var letters = full.split("");
    var blanks = store.spellBlanks(full);
    var filled = {};

    stage.appendChild(make("div", "card",
      "<p class='eyebrow' style='margin-top:0'>" + t("label_meaning") + "</p>" +
      "<p class='spellword hi'>" + esc(w.wordMeaningHi) + "</p>" +
      "<p class='dim small'>" + esc(w.prefix.toUpperCase()) + "- + " + esc(w.root) + "</p>" +
      "<p class='dim' style='margin-top:8px'>" + t("q_spell") + "</p>"));

    var box = make("div", "spellbox");
    stage.appendChild(box);
    var slots = [];
    letters.forEach(function (ch, k) {
      if (blanks.indexOf(k) === -1) {
        box.appendChild(make("div", "slot fixed", esc(ch.toUpperCase())));
        slots.push(null);
      } else {
        var s = make("div", "slot blank", "");
        s.setAttribute("data-idx", String(k));
        on(s, "click", function () {
          if (step.done || !filled[k]) return;
          var used = bank.querySelector("[data-bid='" + filled[k].bid + "']");
          if (used) used.classList.remove("used");
          delete filled[k];
          s.textContent = "";
        });
        box.appendChild(s);
        slots.push(s);
      }
    });

    var bank = make("div", "letterbank");
    var pool = blanks.map(function (k) { return letters[k].toUpperCase(); })
      .concat(store.shuffle("ABCDEFGHKLMNOPRSTUVWY".split("")).slice(0, 3));
    store.shuffle(pool).forEach(function (L, bid) {
      var b = make("button", "lkey", esc(L));
      b.setAttribute("type", "button");
      b.setAttribute("data-bid", String(bid));
      on(b, "click", function () {
        if (step.done) return;
        var open = blanks.filter(function (k) { return !filled[k]; })[0];
        if (open === undefined) return;
        filled[open] = { ch: L, bid: bid };
        slots[open].textContent = L;
        b.classList.add("used");
        sfx.tap();
      });
      bank.appendChild(b);
    });
    stage.appendChild(bank);

    var out = make("div", "");
    var checkBtn = make("button", "btn next", t("btn_check"));
    checkBtn.setAttribute("type", "button");
    stage.appendChild(checkBtn);
    stage.appendChild(out);

    on(checkBtn, "click", function () {
      if (blanks.some(function (k) { return !filled[k]; })) { toast(t("toast_fill_all"), "bad"); return; }
      step.attempts += 1;
      var guess = letters.map(function (ch, k) { return filled[k] ? filled[k].ch.toLowerCase() : ch.toLowerCase(); }).join("");
      var ok = guess === full.toLowerCase();
      blanks.forEach(function (k) {
        var good = filled[k].ch.toLowerCase() === letters[k].toLowerCase();
        slots[k].classList.remove("good", "bad");
        slots[k].classList.add(good ? "good" : "bad");
      });
      if (ok || step.attempts >= 2) {
        step.done = true;
        checkBtn.remove();
        if (!ok) blanks.forEach(function (k) { slots[k].textContent = letters[k].toUpperCase(); });
        var xp = finalizeStep(step, ok, step.attempts === 1);
        out.appendChild(make("div", "explain " + (ok ? "ok" : "no"),
          "<h4>" + (ok ? "✓ " + t("feedback_correct") : "✕ " + t("label_correct_spelling") + ": " + esc(full.toUpperCase())) +
          "<span class='xp'>+" + xp + " XP</span></h4>" + wordDetailLines(w)));
        speech.say(full);
        out.appendChild(nextButton());
      } else {
        toast(t("feedback_wrong"));
      }
    });
  }

  /* ---------------- mode 7 · pronunciation ------------------------------------ */
  function modePronounce(stage, step) {
    var w = step.w;
    stage.appendChild(make("div", "wordstage",
      "<p class='big'>" + esc(w.word.toUpperCase()) + "</p>" +
      "<p class='readhint hi'>" + t("label_pronunciation") + ": <b>" + esc(w.wordPron) + "</b></p>" +
      "<p class='prompt hi'>" + t("q_pronounce_intro") + "</p>"));

    stage.appendChild(speakButton(w.word, "btn ghost spaced", "🔊 " + t("btn_listen")));

    var wrap = make("div", "mic-wrap");
    var mic = make("button", "mic", "🎤");
    mic.setAttribute("type", "button");
    var state = make("p", "mic-state", listen.supported ? t("mic_tap") : t("mic_unsupported"));
    var verdict = make("p", "verdict", "");
    wrap.appendChild(mic); wrap.appendChild(state); wrap.appendChild(verdict);
    stage.appendChild(wrap);

    var out = make("div", "");
    stage.appendChild(out);

    function finish(ok, firstTry, label, heard) {
      if (step.done) return;
      step.done = true;
      verdict.textContent = label;
      verdict.className = "verdict";
      state.textContent = heard || "";
      mic.classList.remove("rec");
      mic.disabled = true;
      var xp = finalizeStep(step, ok, firstTry);
      out.appendChild(make("div", "explain " + (ok ? "ok" : "no"),
        "<h4>" + esc(label) + "<span class='xp'>+" + xp + " XP</span></h4>" + wordDetailLines(w)));
      out.appendChild(nextButton());
    }

    function selfRate() {
      if (out.getAttribute("data-rated")) return;
      out.setAttribute("data-rated", "1");
      var row = make("div", "btn-row");
      [[t("rate_excellent"), true, true], [t("rate_good"), true, false], [t("rate_try_again"), false, false]].forEach(function (r) {
        var b = make("button", "btn" + (r[0] === t("rate_excellent") ? "" : " ghost"), r[0]);
        b.setAttribute("type", "button");
        on(b, "click", function () { row.remove(); finish(r[1], r[2], r[0]); });
        row.appendChild(b);
      });
      out.appendChild(row);
    }

    if (listen.supported) {
      on(mic, "click", function () {
        if (step.done) return;
        mic.classList.add("rec");
        state.textContent = t("mic_listening");
        listen.start(
          function (heardList) {
            var best = 0;
            heardList.forEach(function (h) { best = Math.max(best, HPM.similarity(h, w.word)); });
            var heard = heardList[0];
            if (best >= 85) finish(true, true, t("rate_excellent"), heard);
            else if (best >= 60) finish(true, false, t("rate_good"), heard);
            else finish(false, false, t("rate_try_again"), heard);
          },
          function (err) {
            mic.classList.remove("rec");
            state.textContent = err === "not-allowed" ? t("mic_blocked") : t("mic_unsupported");
            selfRate();
          },
          function () { mic.classList.remove("rec"); }
        );
      });
    } else {
      on(mic, "click", function () { speech.say(w.word); });
      selfRate();
    }
  }

  /* ---------------- mode 8 · sentence challenge -------------------------------- */
  function modeSentence(stage, step) {
    var w = step.w;
    var built = store.buildSentenceOptions(w);
    stage.appendChild(make("div", "wordstage",
      "<p class='big'>" + esc(w.word.toUpperCase()) + "</p>" +
      "<p class='readhint hi'>" + t("label_pronunciation") + ": <b>" + esc(w.wordPron) + "</b></p>" +
      "<p class='prompt hi'>" + t("q_sentence", { word: w.word }) + "</p>"));
    runChoiceMode(stage, step, built, "", t("hint_sentence"), function () {
      return wordDetailLines(w);
    });
  }

  /* ---------------- session end -------------------------------------------- */
  function finishSession() {
    if (!sess) { go("home"); return; }
    var st = store.get();
    st.timeMs += Date.now() - sess.t0;
    store.touchDay();

    var unlockedNew = false;
    if (sess.isLevelQuiz) {
      unlockedNew = store.completeLevel(sess.levelQuizLevel);
      if (unlockedNew) sfx.levelup();
    }
    if (sess.isDaily) store.finishDaily(sess.xp);
    store.addScore(sess.xp);

    var total = sess.results.length;
    var band = store.resultBand(sess.right, total);

    setText("rScore", sess.right + "/" + total);
    setText("rAcc", total ? Math.round((sess.right / total) * 100) + "%" : "0%");
    setText("rXp", sess.xp);
    setText("rWords", sess.newlyLearned);
    setText("rStreak", st.dayStreak);

    var bandKey = band === "excellent" ? "result_band_excellent"
      : band === "great" ? "result_band_great"
      : band === "good" ? "result_band_good" : "result_band_practice";
    setText("resultBand", t(bandKey));

    var unlockedNote = byId("resultUnlocked");
    if (unlockedNew) {
      unlockedNote.textContent = t("result_level_unlocked");
      unlockedNote.classList.remove("hidden");
    } else {
      unlockedNote.classList.add("hidden");
    }

    var nextLevel = sess.isLevelQuiz ? sess.levelQuizLevel + 1 : null;
    var nextBtn = byId("btnNextLevel");
    if (sess.isLevelQuiz && nextLevel && nextLevel <= HPM.TOTAL_LEVELS && store.isLevelUnlocked(nextLevel)) {
      nextBtn.classList.remove("hidden");
      nextBtn.onclick = function () { openLesson(nextLevel); };
    } else {
      nextBtn.classList.add("hidden");
    }

    var finishedConfig = { steps: sess.steps.map(function (s) { return s.w; }), meta: sess };
    lastSessionConfig = sess;
    byId("btnAgain").onclick = function () { restartLastSession(); };

    var reviewCard = byId("reviewCard");
    var reviewWords = store.reviewWords();
    if (reviewWords.length) {
      reviewCard.classList.remove("hidden");
      var list = byId("reviewList");
      list.innerHTML = "";
      reviewWords.slice(0, 12).forEach(function (w) {
        list.appendChild(make("div", "row",
          "<span class='rank'>" + esc(w.prefix.toUpperCase()) + "-</span>" +
          "<span class='who'><b>" + esc(w.word.toUpperCase()) + "</b><small class='hi'>" + esc(w.wordPron) + " · " + esc(w.wordMeaningHi) + "</small></span>"));
      });
      byId("btnPracticeReview").onclick = function () { startPracticeSession(); };
    } else {
      reviewCard.classList.add("hidden");
    }

    sess = null;
    go("result");
    void finishedConfig;
  }

  function restartLastSession() {
    if (!lastSessionConfig) { go("home"); return; }
    var cfg = lastSessionConfig;
    if (cfg.isLevelQuiz) { startLevelQuiz(HPM.wordsForLevel(cfg.levelQuizLevel), cfg.levelQuizLevel); return; }
    if (cfg.isDaily) { startDailySession(); return; }
    var words = cfg.steps.map(function (s) { return s.w; });
    if (words.length && Array.isArray(words[0])) {
      // a match-mode session: words[0] is the pair set
      beginSession([newStep(store.shuffle(words[0]), "match")], { title: cfg.title });
      return;
    }
    var modes = cfg.steps.map(function (s) { return s.m; });
    var steps = words.map(function (w, i) { return newStep(w, modes[i]); });
    beginSession(steps, { title: cfg.title });
  }

  function leaveSession() {
    if (sess && sess.i > 0) finishSession();
    else { sess = null; go("home"); }
  }

  /* ---------------- practice ------------------------------------------------- */
  RENDER.practice = function () {
    var host = byId("practiceBody");
    var words = store.reviewWords();
    host.innerHTML = "";
    if (!words.length) {
      host.appendChild(make("div", "card",
        "<b class='card-title'>" + t("practice_empty_heading") + "</b>" +
        "<p class='dim'>" + t("practice_empty_body") + "</p>"));
      return;
    }
    var card = make("div", "card");
    card.appendChild(make("b", "card-title", t("result_review_heading")));
    words.forEach(function (w) {
      card.appendChild(make("div", "row",
        "<span class='rank'>" + esc(w.prefix.toUpperCase()) + "-</span>" +
        "<span class='who'><b>" + esc(w.word.toUpperCase()) + "</b><small class='hi'>" + esc(w.wordPron) + " · " + esc(w.wordMeaningHi) + "</small></span>"));
    });
    host.appendChild(card);
    var btn = make("button", "btn next", t("practice_start"));
    btn.setAttribute("type", "button");
    on(btn, "click", startPracticeSession);
    host.appendChild(btn);
  };

  /* ---------------- daily ----------------------------------------------------- */
  RENDER.daily = function () {
    var st = store.get();
    var done = st.daily.date === store.todayKey() && st.daily.done;
    var note = byId("dailyDoneNote");
    if (done) { note.textContent = t("daily_done_today"); note.classList.remove("hidden"); }
    else note.classList.add("hidden");
    byId("btnStartDaily").onclick = startDailySession;
  };

  /* ---------------- progress -------------------------------------------------- */
  RENDER.progress = function () {
    var st = store.get();
    setText("pgWords", st.learnedWords.length);
    setText("pgAcc", store.accuracy() + "%");
    setText("pgStreak", st.dayStreak);
    setText("pgBest", st.bestStreak);
    setText("pgXp", st.xp);
    setText("pgLevel", st.unlockedLevel);

    var host = byId("levelProgress");
    host.innerHTML = "";
    HPM.LEVEL_INFO.forEach(function (lv) {
      var words = HPM.wordsForLevel(lv.level);
      var got = words.filter(function (w) { return st.learnedWords.indexOf(w.id) !== -1; }).length;
      var pct = words.length ? Math.round((got / words.length) * 100) : 0;
      var done = st.completedLevels.indexOf(lv.level) !== -1;
      var row = make("div", "lvl-progress-row",
        "<p class='lbl'><span>" + t("level_current") + " " + lv.level + " · " + esc(lv.titleEn) +
        (done ? " ✓" : "") + "</span><span>" + got + "/" + words.length + "</span></p>" +
        "<span class='lvl-bar" + (done ? " done" : "") + "'><span style='width:" + pct + "%'></span></span>");
      host.appendChild(row);
    });
  };

  /* ---------------- theme ------------------------------------------------- */
  function applyTheme() {
    var dark = store.get().theme === "dark";
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    var btn = byId("btnTheme");
    if (btn) btn.textContent = dark ? "☀" : "🌙";
  }
  function toggleTheme() {
    var s = store.get();
    s.theme = s.theme === "dark" ? "light" : "dark";
    store.save();
    applyTheme();
  }

  /* ---------------- wiring --------------------------------------------------- */
  function wire() {
    on(document, "click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest("[data-go]") : null;
      if (!b) return;
      go(b.getAttribute("data-go"));
    });

    on(byId("btnLang"), "click", toggleLanguage);
    on(byId("btnTheme"), "click", toggleTheme);

    on(byId("sessBack"), "click", leaveSession);
    on(byId("sessSpeak"), "click", function () {
      if (!sess) return;
      var step = sess.steps[Math.min(sess.i, sess.steps.length - 1)];
      if (!step) return;
      if (step.m === "match") return;
      var w = step.w;
      if (w && w.word) speech.say(w.word);
    });

    wireChallengeChips();

    on(document, "keydown", function (e) {
      if (current !== "session" || !keyHandler) return;
      if (["1", "2", "3", "4"].indexOf(e.key) !== -1) keyHandler(Number(e.key));
    });
  }

  /* ---------------- boot ------------------------------------------------------ */
  function boot() {
    store.load();
    HPM.i18n.set(store.get().lang || "en");
    wire();
    applyTheme();
    applyStaticI18n();
    store.touchDay();
    go("home");
    HPM.app.booted = true;
  }

  HPM.app = {
    booted: false,
    boot: boot,
    go: go,
    startFreeSession: startFreeSession,
    startLevelQuiz: startLevelQuiz,
    startDailySession: startDailySession,
    startPracticeSession: startPracticeSession,
    openLesson: openLesson,
    getPick: function () { return pick; },
    getSession: function () { return sess; }
  };

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? (window.HPM = window.HPM || {}) : (global.HPM = global.HPM || {}));
