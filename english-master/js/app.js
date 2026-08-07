/* ==========================================================================
   app.js — router, session engine, practice modes, screen renderers
   Wrapped in a single IIFE. Declares no global identifiers, so it can never
   collide with another script on the page and is safe to include twice.
   ========================================================================== */
(function (HEM) {
  "use strict";

  if (HEM.app && HEM.app.booted) return;

  var store  = HEM.store;
  var speech = HEM.speech;
  var sfx    = HEM.sfx;
  var listen = HEM.listener;

  /* ---------------- dom helpers --------------------------------------- */
  function byId(id) { return document.getElementById(id); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
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
    var t = byId("toast");
    if (!t) return;
    t.textContent = msg;
    t.className = "toast is-on" + (kind ? " " + kind : "");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = "toast"; }, 2300);
  }
  function popup(emoji, title, text) {
    setText("mEmoji", emoji);
    setText("mTitle", title);
    setText("mText", text);
    var m = byId("modal");
    if (m) m.classList.add("is-on");
  }
  function closePopup() { var m = byId("modal"); if (m) m.classList.remove("is-on"); }

  /* ---------------- router --------------------------------------------- */
  var SCREENS = ["home", "picker", "session", "summary", "revision", "leaderboard", "progress", "search", "settings"];
  var NAV = ["home", "picker", "search", "progress", "settings"];
  var current = "home";

  var RENDER = {};   // filled in below

  function go(name) {
    if (SCREENS.indexOf(name) === -1) return;
    speech.stop();
    current = name;
    SCREENS.forEach(function (s) {
      var node = byId("s-" + s);
      if (node) node.classList.toggle("is-on", s === name);
    });
    all("#nav button").forEach(function (b) {
      b.classList.toggle("is-on", NAV.indexOf(name) !== -1 && b.getAttribute("data-go") === name);
    });
    if (RENDER[name]) RENDER[name]();
    if (typeof window !== "undefined" && window.scrollTo) window.scrollTo(0, 0);
  }

  /* ---------------- home ------------------------------------------------ */
  RENDER.home = function () {
    var st = store.get();
    var lv = store.levelFromXp(st.xp);
    setText("lvlBadge", "Level " + lv.level);
    var fill = byId("xpFill");
    if (fill) fill.style.width = lv.pct + "%";
    setText("xpText", st.xp + " XP · " + store.levelTitle(lv.level) + " · " + lv.into + "/" + lv.need + " to next level");
    setText("statLearned", st.learned.length);
    setText("statAcc", store.accuracy() + "%");
    setText("statStreak", st.dayStreak);
    setText("statTotal", HEM.WORDS.length);
    setText("coinCount", st.coins);
    setText("tileRevCount", store.dueWords().length);

    var h = new Date().getHours();
    setText("greetEn", (h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening") + ", " + (st.name || "Learner"));
    setText("greetHi", h < 12 ? "सुप्रभात — आज दस नए शब्द सीखते हैं।"
                     : h < 17 ? "नमस्कार — थोड़ा अभ्यास कर लीजिए।"
                              : "शुभ संध्या — सोने से पहले दोहरा लीजिए।");

    var claimed = st.lastReward === store.todayKey();
    var rb = byId("btnReward");
    if (rb) {
      rb.textContent = claimed ? "Collected" : "Collect";
      rb.disabled = !!claimed;
      rb.className = "btn sm" + (claimed ? " muted" : "");
    }
    setText("rewardNote", claimed ? "आज का इनाम मिल चुका है — कल फिर आइए।" : "रोज़ लॉगिन कीजिए, सिक्के पाइए।");
  };

  function collectReward() {
    var st = store.get();
    if (st.lastReward === store.todayKey()) return;
    var bonus = 15 + st.dayStreak * 5;
    st.coins += bonus;
    st.xp += 20;
    st.lastReward = store.todayKey();
    store.save();
    sfx.right();
    popup("🎁", "Daily reward collected", "+" + bonus + " coins and +20 XP. Day streak: " + st.dayStreak + ".");
    RENDER.home();
  }

  /* ---------------- picker ---------------------------------------------- */
  var pick = { cat: "all", lvl: 0, len: 10 };

  RENDER.picker = function () {
    var host = byId("catChips");
    if (host && !host.childElementCount) {
      HEM.CATEGORIES.forEach(function (c) {
        var b = make("button", "chip" + (c.key === pick.cat ? " is-on" : ""),
          c.icon + " " + esc(c.en) + " <span class='hi'>" + esc(c.hi) + "</span>");
        b.setAttribute("type", "button");
        b.setAttribute("data-cat", c.key);
        host.appendChild(b);
      });
    }
    updatePickCount();
  };

  function updatePickCount() {
    var n = store.filterWords(pick.cat, pick.lvl).length;
    setText("pickCount", n + " words match your choice · " + Math.min(n, pick.len) + " will be used");
  }

  function wireChips(hostId, attr, key, numeric) {
    var host = byId(hostId);
    if (!host) return;
    on(host, "click", function (e) {
      var b = e.target.closest ? e.target.closest(".chip") : null;
      if (!b || !host.contains(b)) return;
      all(".chip", host).forEach(function (c) { c.classList.remove("is-on"); });
      b.classList.add("is-on");
      var v = b.getAttribute("data-" + attr);
      pick[key] = numeric ? Number(v) : v;
      updatePickCount();
      sfx.tap();
    });
  }

  /* ---------------- session engine -------------------------------------- */
  var MODE_TITLE = {
    learn: "Learning · पढ़ाई",
    quiz:  "Quiz · प्रश्नोत्तरी",
    spell: "Spell Challenge · वर्तनी",
    speak: "Pronunciation · उच्चारण",
    flash: "Flashcards · फ़्लैशकार्ड",
    prefix:"Prefix Builder · उपसर्ग खेल",
    mixed: "Mixed Practice · मिश्रित"
  };
  var XP_FOR = { learn: 5, quiz: 10, spell: 15, speak: 12, flash: 8, prefix: 14 };

  var sess = null;
  var lastSession = null;
  var keyHandler = null;

  function startSession(words, mode, label) {
    if (!words || !words.length) { toast("No words for this filter", "bad"); return; }
    var testModes = ["quiz", "spell", "flash"];
    if (listen.supported) testModes.push("speak");

    sess = {
      words: words,
      mode: mode,
      label: label || null,
      steps: words.map(function (w) {
        return { w: w, m: mode === "mixed" ? testModes[Math.floor(Math.random() * testModes.length)] : mode };
      }),
      i: 0, right: 0, wrong: 0, xp: 0, coins: 0, streak: 0,
      results: [], t0: Date.now()
    };
    setText("sessTitle", label || MODE_TITLE[mode] || "Practice");
    go("session");
    renderStep();
  }

  function renderStep() {
    keyHandler = null;
    if (!sess) return;
    if (sess.i >= sess.steps.length) { finishSession(); return; }

    var step = sess.steps[sess.i];
    setText("sessSub", "Word " + (sess.i + 1) + " of " + sess.steps.length +
      (sess.mode === "mixed" ? " · " + MODE_TITLE[step.m].split(" ")[0] : ""));
    var bar = byId("sessBar");
    if (bar) bar.style.width = Math.round((sess.i / sess.steps.length) * 100) + "%";

    var stage = byId("stage");
    if (!stage) return;
    stage.innerHTML = "";

    if (step.m === "learn") modeLearn(stage, step.w);
    else if (step.m === "quiz") modeQuiz(stage, step.w);
    else if (step.m === "spell") modeSpell(stage, step.w);
    else if (step.m === "speak") modeSpeak(stage, step.w);
    else if (step.m === "prefix") modePrefix(stage, step.w);
    else modeFlash(stage, step.w);

    if (store.get().settings.auto) {
      if (step.m === "prefix") {
        setTimeout(function () { speech.say(step.w.base, "en"); }, 300);
      } else {
        setTimeout(function () { speech.say(step.w.en, "en"); }, 300);
      }
    }
  }

  function nextStep() { if (sess) { sess.i += 1; renderStep(); } }

  function score(word, mode, ok) {
    var xp;
    if (ok) {
      sess.streak += 1;
      xp = XP_FOR[mode] + Math.min(sess.streak - 1, 5) * 2;
      sess.right += 1;
      sess.coins += 1;
      sfx.right();
    } else {
      sess.streak = 0;
      xp = 2;
      sess.wrong += 1;
      sfx.wrong();
    }
    sess.xp += xp;
    sess.results.push({ w: word, ok: ok, mode: mode });
    if (mode === "learn") store.recordLearn(word, xp);
    else if (mode === "prefix") store.recordPrefixAnswer(ok, xp);
    else store.recordAnswer(word, ok, xp, mode);
    return xp;
  }

  function detailHTML(w) {
    return "<p class='line'><b>" + esc(w.en) + "</b> <span class='dim'>· " + esc(w.pos) + "</span></p>" +
      "<p class='line hi'>उच्चारण: <b>" + esc(w.pron) + "</b> · अर्थ: <b>" + esc(w.hi) + "</b></p>" +
      "<p class='line'>" + esc(w.sent) + "</p>" +
      "<p class='line hi dim'>" + esc(w.sentHi) + "</p>" +
      (w.syn ? "<p class='line dim'>Synonyms: " + esc(w.syn) + (w.ant ? " · Antonyms: " + esc(w.ant) : "") + "</p>" : "") +
      "<p class='line dim hi'>💡 " + esc(w.tip) + "</p>";
  }

  function nextButton() {
    var last = sess && sess.i === sess.steps.length - 1;
    var b = make("button", "btn next", last ? "Finish session" : "Next word →");
    b.setAttribute("type", "button");
    on(b, "click", nextStep);
    return b;
  }

  function speakButton(text, lang, cls, label) {
    var b = make("button", cls || "btn ghost sm", label || ("🔊 " + esc(text)));
    b.setAttribute("type", "button");
    on(b, "click", function () { speech.say(text, lang || "en"); });
    return b;
  }

  /* ---------------- mode 1 · learning ----------------------------------- */
  function modeLearn(stage, w) {
    stage.appendChild(make("div", "wordstage",
      "<p class='big'>" + esc(w.en.toUpperCase()) + "</p>" +
      "<p class='readhint hi'>पढ़िए: <b>" + esc(w.pron) + "</b></p>" +
      "<p class='posline'>" + esc(w.pos) + " · " + esc(HEM.LEVEL_NAME[w.level]) + "</p>" +
      "<p class='prompt hi'>इस शब्द का अर्थ क्या है? पहले सोचिए।</p>"));

    var revealBtn = make("button", "btn next", "Reveal Answer · उत्तर दिखाइए");
    revealBtn.setAttribute("type", "button");
    stage.appendChild(revealBtn);

    var list = make("div", "reveal-list");
    stage.appendChild(list);

    on(revealBtn, "click", function () {
      if (revealBtn.parentNode) revealBtn.remove();
      var cards = [
        ["English Word", w.en, "", ""],
        ["Hindi Pronunciation", w.pron, "hi", ""],
        ["Hindi Meaning", w.hi, "hi",
          (w.syn ? esc(w.syn) + (w.ant ? " ⟷ " + esc(w.ant) : "") + "<br>" : "") + "💡 " + esc(w.tip)],
        ["Example Sentence", w.sent, "", ""],
        ["Hindi Translation", w.sentHi, "hi", ""]
      ];
      cards.forEach(function (c, k) {
        var card = make("div", "rcard tone" + (k % 3),
          "<p class='lab'>" + c[0] + "</p><p class='val " + c[2] + "'>" + esc(c[1]) + "</p>" +
          (c[3] ? "<p class='meta hi'>" + c[3] + "</p>" : ""));
        card.style.animationDelay = (k * 0.12) + "s";
        list.appendChild(card);
      });

      var row = make("div", "rcard tone2 speakcard");
      row.style.animationDelay = "0.60s";
      row.appendChild(speakButton(w.en, "en", "btn", "🔊 Speak: " + w.en));
      row.appendChild(speakButton(w.sentHi, "hi", "btn ghost sm", "🔊 हिंदी"));
      list.appendChild(row);

      setTimeout(function () { speech.say(w.en, "en"); }, 700);
      score(w, "learn", true);
      stage.appendChild(nextButton());
    });
  }

  /* ---------------- mode 2 · quiz --------------------------------------- */
  function modeQuiz(stage, w) {
    var askHindi = Math.random() < 0.65;
    var built = store.buildQuizOptions(w, askHindi);

    stage.appendChild(make("div", "wordstage",
      "<p class='big" + (askHindi ? "" : " hi") + "'>" + esc(askHindi ? w.en : w.hi) + "</p>" +
      (askHindi ? "<p class='readhint hi'>पढ़िए: <b>" + esc(w.pron) + "</b></p>" : "") +
      "<p class='posline'>" + esc(w.pos) + "</p>" +
      "<p class='prompt" + (askHindi ? " hi" : "") + "'>" +
      (askHindi ? "इसका सही हिंदी अर्थ चुनिए" : "Which English word means this?") + "</p>"));

    var box = make("div", "options");
    var out = make("div", "");
    stage.appendChild(box);
    stage.appendChild(out);

    var done = false;

    built.options.forEach(function (o, k) {
      var b = make("button", "opt",
        "<span class='k'>" + (k + 1) + "</span><span class='" + (askHindi ? "hi" : "") + "'>" + esc(o) + "</span>");
      b.setAttribute("type", "button");
      b.setAttribute("data-val", o);
      on(b, "click", function () { answer(o); });
      box.appendChild(b);
    });

    function answer(chosen) {
      if (done) return;
      done = true;
      var ok = chosen === built.correct;
      all(".opt", box).forEach(function (b) {
        b.disabled = true;
        var v = b.getAttribute("data-val");
        if (v === built.correct) b.classList.add("right");
        else if (v === chosen) b.classList.add("wrong");
        else b.classList.add("fade");
      });
      var xp = score(w, "quiz", ok);
      var panel = make("div", "explain " + (ok ? "ok" : "no"),
        "<h4>" + (ok ? "✓ Correct · सही उत्तर" : "✕ Not correct · सही उत्तर नीचे") +
        "<span class='xp'>+" + xp + " XP</span></h4>" + detailHTML(w));
      out.appendChild(panel);
      panel.appendChild(speakButton(w.en, "en", "btn ghost sm", "🔊 Hear it again"));
      out.appendChild(nextButton());
    }

    keyHandler = function (n) {
      var b = all(".opt", box)[n - 1];
      if (b && !b.disabled) b.click();
    };
  }

  /* ---------------- mode 3 · spell challenge ---------------------------- */
  function modeSpell(stage, w) {
    var word = w.en;
    var letters = word.split("");
    var blanks = store.spellBlanks(word);
    var filled = {};

    stage.appendChild(make("div", "card",
      "<p class='eyebrow flush'>Meaning · अर्थ</p>" +
      "<p class='spell-mean hi'>" + esc(w.hi) + "</p>" +
      "<p class='dim hi small'>उच्चारण: " + esc(w.pron) + "</p>" +
      "<p class='dim small'>" + esc(w.sent.replace(new RegExp(word, "ig"), "______")) + "</p>"));

    var slots = make("div", "spellbox");
    stage.appendChild(slots);

    letters.forEach(function (ch, k) {
      if (blanks.indexOf(k) === -1) {
        slots.appendChild(make("div", "slot fixed", esc(ch)));
      } else {
        var s = make("div", "slot blank", "");
        s.setAttribute("data-idx", String(k));
        on(s, "click", function () {
          if (!filled[k]) return;
          var used = bank.querySelector("[data-bid='" + filled[k].bid + "']");
          if (used) used.classList.remove("used");
          delete filled[k];
          s.textContent = "";
        });
        slots.appendChild(s);
      }
    });

    stage.appendChild(make("p", "note", "Tap the letters · अक्षर चुनिए"));
    var bank = make("div", "letterbank");
    stage.appendChild(bank);

    var pool = blanks.map(function (k) { return letters[k].toUpperCase(); })
      .concat(store.shuffle("ABCDEFGHIJKLMNOPRSTUVWY".split("")).slice(0, 3));

    store.shuffle(pool).forEach(function (L, bid) {
      var b = make("button", "lkey", esc(L));
      b.setAttribute("type", "button");
      b.setAttribute("data-bid", String(bid));
      on(b, "click", function () {
        var open = null;
        for (var i = 0; i < blanks.length; i++) {
          if (!filled[blanks[i]]) { open = blanks[i]; break; }
        }
        if (open === null) { toast("All boxes are full", "bad"); return; }
        filled[open] = { ch: L, bid: bid };
        var target = slots.querySelector("[data-idx='" + open + "']");
        if (target) target.textContent = L;
        b.classList.add("used");
        sfx.tap();
      });
      bank.appendChild(b);
    });

    var out = make("div", "");
    var check = make("button", "btn next", "Check spelling · जाँचिए");
    check.setAttribute("type", "button");
    stage.appendChild(check);
    stage.appendChild(out);

    on(check, "click", function () {
      for (var i = 0; i < blanks.length; i++) {
        if (!filled[blanks[i]]) { toast("Fill every box first", "bad"); return; }
      }
      check.remove();
      var guess = letters.map(function (ch, k) { return filled[k] ? filled[k].ch : ch; }).join("");
      var ok = guess.toLowerCase() === word.toLowerCase();
      all(".slot.blank", slots).forEach(function (s) {
        var k = Number(s.getAttribute("data-idx"));
        var good = filled[k].ch.toLowerCase() === letters[k].toLowerCase();
        s.classList.add(good ? "good" : "bad");
        if (!good) s.textContent = letters[k].toUpperCase();
      });
      var xp = score(w, "spell", ok);
      out.appendChild(make("div", "explain " + (ok ? "ok" : "no"),
        "<h4>" + (ok ? "✓ Perfect spelling · वर्तनी सही" : "✕ Correct spelling: " + esc(word)) +
        "<span class='xp'>+" + xp + " XP</span></h4>" + detailHTML(w)));
      speech.say(word, "en");
      out.appendChild(nextButton());
    });
  }

  /* ---------------- mode 4 · pronunciation ------------------------------ */
  function modeSpeak(stage, w) {
    stage.appendChild(make("div", "wordstage",
      "<p class='big'>" + esc(w.en) + "</p>" +
      "<p class='posline hi'>" + esc(w.pron) + " · " + esc(w.hi) + "</p>" +
      "<p class='prompt hi'>पहले सुनिए, फिर माइक दबाकर बोलिए।</p>"));

    stage.appendChild(speakButton(w.en, "en", "btn ghost next", "🔊 Listen first · पहले सुनिए"));

    var wrap = make("div", "mic-wrap");
    var mic = make("button", "mic", "🎤");
    mic.setAttribute("type", "button");
    mic.setAttribute("aria-label", "Record your pronunciation");
    var state = make("p", "mic-state", listen.supported
      ? "Tap and say the word · माइक दबाकर बोलिए"
      : "This browser cannot listen · खुद जाँचिए");
    var verdict = make("p", "verdict", "");
    wrap.appendChild(mic); wrap.appendChild(state); wrap.appendChild(verdict);
    stage.appendChild(wrap);

    var out = make("div", "");
    stage.appendChild(out);
    var settled = false;

    function finish(ok, label, cls, heard) {
      if (settled) return;
      settled = true;
      verdict.textContent = label;
      verdict.className = "verdict " + cls;
      state.textContent = heard || "";
      mic.classList.remove("rec");
      mic.disabled = true;
      var xp = score(w, "speak", ok);
      out.appendChild(make("div", "explain " + (ok ? "ok" : "no"),
        "<h4>" + esc(label) + "<span class='xp'>+" + xp + " XP</span></h4>" + detailHTML(w)));
      out.appendChild(nextButton());
    }

    function selfRate() {
      if (settled || out.getAttribute("data-rated")) return;
      out.setAttribute("data-rated", "1");
      var row = make("div", "btn-row");
      [["Excellent", true, "good"], ["Good", true, "mid"], ["Try Again", false, "bad"]].forEach(function (r) {
        var b = make("button", "btn" + (r[0] === "Excellent" ? "" : " ghost"), r[0]);
        b.setAttribute("type", "button");
        on(b, "click", function () {
          row.remove();
          finish(r[1], r[0] + " · self-rated", r[2], "");
        });
        row.appendChild(b);
      });
      out.appendChild(row);
    }

    if (listen.supported) {
      on(mic, "click", function () {
        mic.classList.add("rec");
        state.textContent = "Listening… now say it";
        listen.start(
          function (heardList) {
            var best = 0;
            heardList.forEach(function (t) { best = Math.max(best, store.similarity(t, w.en)); });
            var heard = "Heard: " + heardList[0];
            if (best >= 85) finish(true, "Excellent · उत्कृष्ट", "good", heard);
            else if (best >= 60) finish(true, "Good · अच्छा", "mid", heard + " — one more try for a perfect match");
            else finish(false, "Try Again · फिर कोशिश", "bad", heard);
          },
          function (err) {
            mic.classList.remove("rec");
            state.textContent = err === "not-allowed"
              ? "Microphone blocked. Allow it, or rate yourself below."
              : "Could not hear you. Rate yourself below.";
            selfRate();
          },
          function () { mic.classList.remove("rec"); }
        );
      });
    } else {
      on(mic, "click", function () { speech.say(w.en, "en"); });
      selfRate();
    }
  }

  /* ---------------- mode 5 · flashcards --------------------------------- */
  function modeFlash(stage, w) {
    var wrap = make("div", "flip-wrap");
    var flip = make("div", "flip",
      "<div class='face front'><p class='w'>" + esc(w.en) + "</p>" +
      "<p class='readhint hi light'>पढ़िए: <b>" + esc(w.pron) + "</b></p>" +
      "<p class='hint hi'>कार्ड पलटने के लिए टैप कीजिए</p></div>" +
      "<div class='face back'>" +
      "<p class='p hi'>" + esc(w.pron) + "</p>" +
      "<p class='m hi'>" + esc(w.hi) + "</p>" +
      "<p class='s'>" + esc(w.sent) + "</p>" +
      "<p class='sh hi'>" + esc(w.sentHi) + "</p>" +
      "<p class='sh tiny'>" + esc(w.pos) + (w.syn ? " · " + esc(w.syn) : "") + "</p></div>");
    flip.setAttribute("role", "button");
    flip.setAttribute("tabindex", "0");
    wrap.appendChild(flip);
    stage.appendChild(wrap);

    var out = make("div", "");
    stage.appendChild(out);

    on(flip, "click", function () {
      flip.classList.toggle("on");
      if (!flip.classList.contains("on")) return;
      speech.say(w.en, "en");
      if (out.childElementCount) return;
      var row = make("div", "btn-row");
      var nope = make("button", "btn ghost", "Need practice");
      var know = make("button", "btn", "I knew it ✓");
      nope.setAttribute("type", "button");
      know.setAttribute("type", "button");
      on(nope, "click", function () { score(w, "flash", false); nextStep(); });
      on(know, "click", function () { score(w, "flash", true); nextStep(); });
      row.appendChild(nope); row.appendChild(know);
      out.appendChild(row);
    });
  }

  /* ---------------- mode 6 · prefix builder ------------------------------ */
  function modePrefix(stage, combo) {
    var asWord = store.comboToWord(combo);
    var built = store.buildPrefixOptions(combo);

    stage.appendChild(make("div", "wordstage",
      "<p class='prefix-parts'>" +
      "<span class='pfx'>" + esc(combo.prefix.toUpperCase()) + "-</span>" +
      "<span class='plus'>+</span>" +
      "<span class='base'>" + esc(combo.base.toUpperCase()) + "</span>" +
      "</p>" +
      "<p class='readhint hi'>पढ़िए: <b>" + esc(combo.prefixPron) + "</b> + <b>" + esc(combo.basePron) + "</b></p>" +
      "<p class='posline hi'>" + esc(combo.prefix) + "- = " + esc(combo.prefixMeaningHi) +
      " (" + esc(combo.prefixMeaningEn) + ") · " + esc(combo.base) + " = " + esc(combo.baseMeaningHi) + "</p>" +
      "<p class='prompt hi'>दोनों जोड़ने पर कौन-सा शब्द बनेगा?</p>"));

    var box = make("div", "options");
    var out = make("div", "");
    stage.appendChild(box);
    stage.appendChild(out);

    var done = false;

    built.options.forEach(function (o, k) {
      var b = make("button", "opt", "<span class='k'>" + (k + 1) + "</span><span>" + esc(o) + "</span>");
      b.setAttribute("type", "button");
      b.setAttribute("data-val", o);
      on(b, "click", function () { answer(o); });
      box.appendChild(b);
    });

    function answer(chosen) {
      if (done) return;
      done = true;
      var ok = chosen === built.correct;
      all(".opt", box).forEach(function (b) {
        b.disabled = true;
        var v = b.getAttribute("data-val");
        if (v === built.correct) b.classList.add("right");
        else if (v === chosen) b.classList.add("wrong");
        else b.classList.add("fade");
      });
      var xp = score(asWord, "prefix", ok);
      var panel = make("div", "explain " + (ok ? "ok" : "no"),
        "<h4>" + (ok ? "✓ Correct · सही शब्द बना" : "✕ Not quite · सही शब्द नीचे देखिए") +
        "<span class='xp'>+" + xp + " XP</span></h4>" +
        "<p class='line'><b>" + esc(combo.prefix) + "-</b> + <b>" + esc(combo.base) + "</b> = <b>" + esc(combo.result) + "</b></p>" +
        detailHTML(asWord));
      out.appendChild(panel);
      panel.appendChild(speakButton(combo.result, "en", "btn ghost sm", "🔊 Hear it again"));
      out.appendChild(nextButton());
    }

    keyHandler = function (n) {
      var b = all(".opt", box)[n - 1];
      if (b && !b.disabled) b.click();
    };
  }


  function finishSession() {
    if (!sess) { go("home"); return; }
    var st = store.get();
    st.timeMs += Date.now() - sess.t0;
    st.coins += sess.coins;
    store.save();
    store.touchDay();

    if (sess.label && sess.label.indexOf("Daily") === 0) {
      st.daily.done = true;
      st.dailyDone += 1;
      store.save();
    }
    store.addScore(sess.xp);

    var answered = sess.right + sess.wrong;
    var pct = answered ? Math.round((sess.right / answered) * 100) : 100;
    var circ = 2 * Math.PI * 52;
    var ring = byId("sumRing");
    if (ring) {
      ring.style.strokeDasharray = String(circ);
      ring.style.strokeDashoffset = String(circ);
      setTimeout(function () { ring.style.strokeDashoffset = String(circ * (1 - pct / 100)); }, 80);
    }
    setText("sumPct", pct + "%");
    setText("sumRight", sess.right);
    setText("sumWrong", sess.wrong);
    setText("sumXp", sess.xp);
    setText("sumCoins", sess.coins);

    var band = pct === 100 ? ["Perfect session", "शानदार — एक भी गलती नहीं!"]
      : pct >= 70 ? ["Well done", "बहुत अच्छा — ऐसे ही चलते रहिए।"]
      : pct >= 40 ? ["Good effort", "अच्छा प्रयास — दोहराई कीजिए।"]
      : ["Keep going", "कोई बात नहीं — अभ्यास से सब आता है।"];
    setText("sumTitle", band[0]);
    setText("sumHi", band[1]);

    var list = byId("sumList");
    if (list) {
      list.innerHTML = "";
      sess.results.forEach(function (r) {
        var row = make("div", "row");
        row.innerHTML =
          "<span class='rank " + (r.ok ? "ok" : "no") + "'>" + (r.ok ? "✓" : "✕") + "</span>" +
          "<span class='who'><b>" + esc(r.w.en) + "</b><small class='hi'>" + esc(r.w.pron) + " · " + esc(r.w.hi) + "</small></span>";
        row.appendChild(speakButton(r.w.en, "en", "icon-btn accent", "🔊"));
        list.appendChild(row);
      });
    }

    var fresh = store.checkBadges();
    lastSession = { words: sess.words, mode: sess.mode, label: sess.label };
    sess = null;
    go("summary");
    if (fresh.length) {
      setTimeout(function () {
        popup(fresh[0].icon, "Badge unlocked: " + fresh[0].en, fresh[0].desc + " (+10 coins)");
      }, 650);
    }
  }

  function leaveSession() {
    if (sess && sess.i > 0) finishSession();
    else { sess = null; go("home"); }
  }

  /* ---------------- daily challenge -------------------------------------- */
  function startDaily() {
    var words = store.dailySet();
    var replay = store.get().daily.done;
    startSession(store.shuffle(words), "mixed", "Daily Challenge · आज की चुनौती");
    if (replay) toast("Replaying today's challenge");
  }

  /* ---------------- prefix builder ---------------------------------------- */
  function startPrefixSession(len) {
    var n = Math.min(len || 10, HEM.PREFIXES.length);
    var combos = store.shuffle(HEM.PREFIXES).slice(0, n);
    startSession(combos, "prefix", MODE_TITLE.prefix);
  }

  /* ---------------- revision --------------------------------------------- */
  RENDER.revision = function () {
    var due = store.dueWords();
    var weak = store.weakWords();
    var info = byId("revInfo");
    if (info) {
      info.innerHTML =
        "<b class='card-title'>" + due.length + " words are due today</b>" +
        "<p class='dim hi small'>गलत शब्द 1, 2, 4, 8 और 16 दिन बाद दोबारा आते हैं — यही स्मृति अंतराल विधि है।</p>";
      var set = due.length ? due : weak;
      var b = make("button", "btn next", set.length
        ? "Revise " + Math.min(set.length, 15) + " words"
        : "Nothing due yet");
      b.setAttribute("type", "button");
      b.disabled = !set.length;
      on(b, "click", function () {
        if (!set.length) return;
        startSession(store.shuffle(set).slice(0, 15), "quiz", "Revision · दोहराई");
      });
      info.appendChild(b);
    }

    var list = byId("revList");
    if (!list) return;
    list.innerHTML = "";
    var show = (weak.length ? weak : due).slice(0, 30);
    if (!show.length) {
      list.innerHTML = "<div class='card center dim'>No mistakes recorded yet.<br><span class='hi'>अभी कोई गलती दर्ज नहीं है।</span></div>";
      return;
    }
    var card = make("div", "card", "<b class='card-title'>Words you missed · जिन शब्दों में चूक हुई</b>");
    var srs = store.get().srs;
    show.forEach(function (w) {
      var r = srs[w.id] || { box: 1, misses: 0 };
      card.appendChild(make("div", "row",
        "<span class='rank'>" + (r.misses || 0) + "</span>" +
        "<span class='who'><b>" + esc(w.en) + "</b><small class='hi'>" + esc(w.pron) + " · " + esc(w.hi) + "</small></span>" +
        "<span class='dim tiny'>Box " + r.box + "</span>"));
    });
    list.appendChild(card);
  };

  /* ---------------- leaderboard ------------------------------------------ */
  RENDER.leaderboard = function () {
    var host = byId("lbList");
    if (!host) return;
    var mine = store.get().scores.map(function (s) {
      return { name: s.name + " · " + s.date, score: s.score, me: true };
    });
    var rows = mine.concat(store.sampleBoard).sort(function (a, b) { return b.score - a.score; }).slice(0, 12);
    host.innerHTML = "";
    if (!rows.length) {
      host.innerHTML = "<p class='dim'>Finish a session to appear here.</p>";
      return;
    }
    rows.forEach(function (r, i) {
      host.appendChild(make("div", "row" + (r.me ? " me" : ""),
        "<span class='rank g" + (i < 3 ? i + 1 : 0) + "'>" + (i + 1) + "</span>" +
        "<span class='who'><b>" + esc(r.name) + "</b><small>" + (r.me ? "your session" : "sample score") + "</small></span>" +
        "<span class='val'>" + r.score + " XP</span>"));
    });
  };

  /* ---------------- progress --------------------------------------------- */
  RENDER.progress = function () {
    var st = store.get();
    setText("pgLearned", st.learned.length + " / " + HEM.WORDS.length);
    setText("pgAcc", store.accuracy() + "%");
    setText("pgStreak", st.dayStreak);
    setText("pgBest", st.bestStreak);
    var mins = Math.round(st.timeMs / 60000);
    setText("pgTime", mins < 60 ? mins + "m" : Math.floor(mins / 60) + "h " + (mins % 60) + "m");
    setText("pgXp", st.xp);

    var host = byId("catProgress");
    if (host) {
      host.innerHTML = "";
      HEM.CATEGORIES.forEach(function (c) {
        if (c.key === "all") return;
        var total = 0, got = 0;
        HEM.WORDS.forEach(function (w) {
          if (w.cat !== c.key) return;
          total += 1;
          if (st.learned.indexOf(w.id) !== -1) got += 1;
        });
        var pct = total ? Math.round((got / total) * 100) : 0;
        host.appendChild(make("div", "catrow",
          "<p class='catlabel'><span>" + c.icon + " " + esc(c.en) +
          " <i class='hi'>" + esc(c.hi) + "</i></span><span class='dim'>" + got + "/" + total + "</span></p>" +
          "<span class='catbar'><span style='width:" + pct + "%'></span></span>"));
      });
    }

    var grid = byId("badgeGrid");
    if (grid) {
      grid.innerHTML = "";
      HEM.ACHIEVEMENTS.forEach(function (a) {
        var got = st.badges.indexOf(a.id) !== -1;
        grid.appendChild(make("div", "badge" + (got ? " got" : ""),
          "<span class='e'>" + a.icon + "</span><b>" + esc(a.en) + "</b><small class='hi'>" + esc(a.hi) + "</small>"));
      });
    }
  };

  /* ---------------- search ----------------------------------------------- */
  RENDER.search = function () {
    var input = byId("searchInput");
    renderSearch(input ? input.value : "");
    if (input && input.focus) setTimeout(function () { input.focus(); }, 120);
  };

  function renderSearch(term) {
    var host = byId("searchOut");
    if (!host) return;
    host.innerHTML = "";
    var q = String(term || "").trim();
    var list = q ? store.searchWords(q).slice(0, 40) : store.shuffle(HEM.WORDS).slice(0, 12);

    if (!list.length) {
      host.innerHTML = "<div class='card center dim'>No word found.<br><span class='hi'>यह शब्द सूची में नहीं है।</span></div>";
      return;
    }
    if (!q) host.appendChild(make("p", "note flush", "Some words to explore · कुछ शब्द"));

    list.forEach(function (w) {
      var cat = null;
      HEM.CATEGORIES.forEach(function (c) { if (c.key === w.cat) cat = c; });
      var card = make("div", "result",
        "<p class='res-top'><b>" + esc(w.en) + "</b><span class='pron hi'>" + esc(w.pron) + "</span></p>" +
        "<p class='mean hi'>" + esc(w.hi) + "</p>" +
        "<p class='ex'>" + esc(w.sent) + "</p>" +
        "<p class='ex hi dim'>" + esc(w.sentHi) + "</p>" +
        "<p class='tags'><span class='tagpill'>" + esc(w.pos) + "</span>" +
        "<span class='tagpill lv" + w.level + "'>" + esc(HEM.LEVEL_NAME[w.level]) + "</span>" +
        "<span class='tagpill'>" + (cat ? cat.icon + " " + esc(cat.en) : esc(w.cat)) + "</span></p>" +
        (w.syn ? "<p class='dim tiny'>Syn: " + esc(w.syn) + (w.ant ? " · Ant: " + esc(w.ant) : "") + "</p>" : "") +
        "<p class='dim tiny hi'>💡 " + esc(w.tip) + "</p>");
      var top = card.querySelector(".res-top");
      if (top) top.appendChild(speakButton(w.en, "en", "icon-btn accent", "🔊"));
      host.appendChild(card);
    });
  }

  /* ---------------- settings ---------------------------------------------- */
  function applyTheme() {
    var dark = store.get().settings.theme === "dark";
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    var t = byId("btnTheme");
    if (t) t.textContent = dark ? "☀" : "🌙";
    var sw = byId("swTheme");
    if (sw) {
      sw.classList.toggle("is-on", dark);
      sw.setAttribute("aria-checked", dark ? "true" : "false");
    }
  }

  function toggleTheme() {
    var s = store.get().settings;
    s.theme = s.theme === "dark" ? "light" : "dark";
    store.save();
    applyTheme();
  }

  function bindSwitch(id, key) {
    var sw = byId(id);
    if (!sw) return;
    function paint() {
      var v = !!store.get().settings[key];
      sw.classList.toggle("is-on", v);
      sw.setAttribute("aria-checked", v ? "true" : "false");
    }
    on(sw, "click", function () {
      var s = store.get().settings;
      s[key] = !s[key];
      store.save();
      paint();
    });
    paint();
  }

  function fillVoices() {
    var sel = byId("selVoice");
    if (!sel) return;
    var want = store.get().settings.voice;
    sel.innerHTML = "<option value=''>Automatic</option>";
    speech.voices().forEach(function (v) {
      if (!/^en/i.test(v.lang || "")) return;
      var o = document.createElement("option");
      o.value = v.name;
      o.textContent = v.name.slice(0, 28) + " (" + v.lang + ")";
      if (want === v.name) o.selected = true;
      sel.appendChild(o);
    });
  }

  /* ---------------- wiring ------------------------------------------------ */
  function wire() {
    on(document, "click", function (e) {
      var t = e.target;
      var b = t && t.closest ? t.closest("[data-go]") : null;
      if (!b) return;
      var dest = b.getAttribute("data-go");
      if (dest === "daily") { startDaily(); return; }
      if (dest === "prefix") { startPrefixSession(pick.len); return; }
      go(dest);
    });

    all("#modeGrid [data-mode]").forEach(function (b) {
      on(b, "click", function () {
        var mode = b.getAttribute("data-mode");
        if (mode === "prefix") { startPrefixSession(pick.len); return; }
        var pool = store.filterWords(pick.cat, pick.lvl);
        if (!pool.length) { toast("No words for this filter", "bad"); return; }
        startSession(store.shuffle(pool).slice(0, Math.min(pick.len, pool.length)), mode, null);
      });
    });

    wireChips("catChips", "cat", "cat", false);
    wireChips("lvlChips", "lvl", "lvl", true);
    wireChips("lenChips", "len", "len", true);

    on(byId("sessBack"), "click", leaveSession);
    on(byId("sessSpeak"), "click", function () {
      if (!sess) return;
      var step = sess.steps[Math.min(sess.i, sess.steps.length - 1)];
      if (step) speech.say(step.w.en, "en");
    });
    on(byId("btnAgain"), "click", function () {
      if (!lastSession) { go("picker"); return; }
      startSession(store.shuffle(lastSession.words), lastSession.mode, lastSession.label);
    });

    on(byId("btnReward"), "click", collectReward);
    on(byId("btnTheme"), "click", toggleTheme);
    on(byId("swTheme"), "click", toggleTheme);
    bindSwitch("swAuto", "auto");
    bindSwitch("swSfx", "sfx");

    var rate = byId("rngRate");
    if (rate) {
      rate.value = String(store.get().settings.rate);
      on(rate, "input", function (e) {
        store.get().settings.rate = Number(e.target.value) || 0.85;
        store.save();
      });
      on(rate, "change", function () { speech.say("This is my speaking speed", "en"); });
    }

    on(byId("selVoice"), "change", function (e) {
      store.get().settings.voice = e.target.value;
      store.save();
      speech.say("Hello, I will read your words", "en");
    });

    var name = byId("inpName");
    if (name) {
      name.value = store.get().name;
      on(name, "input", function (e) {
        store.get().name = String(e.target.value).trim() || "Learner";
        store.save();
      });
    }

    on(byId("btnReset"), "click", function () {
      var okToReset = true;
      if (typeof window !== "undefined" && window.confirm) {
        okToReset = window.confirm("Delete all progress on this device? / सारा डेटा मिट जाएगा?");
      }
      if (!okToReset) return;
      store.reset();
      applyTheme();
      fillVoices();
      if (name) name.value = store.get().name;
      toast("Progress reset", "bad");
      go("home");
    });

    on(byId("coinPill"), "click", function () {
      popup("🪙", store.get().coins + " coins", "Earn coins for every correct answer, the daily reward and each new badge.");
    });

    on(byId("searchInput"), "input", function (e) { renderSearch(e.target.value); });
    on(byId("mClose"), "click", closePopup);
    on(byId("modal"), "click", function (e) { if (e.target === byId("modal")) closePopup(); });

    on(document, "keydown", function (e) {
      if (current !== "session" || !keyHandler) return;
      if (["1", "2", "3", "4"].indexOf(e.key) !== -1) keyHandler(Number(e.key));
    });

    speech.onVoices(fillVoices);
  }

  /* ---------------- boot --------------------------------------------------- */
  function boot() {
    store.load();
    wire();
    applyTheme();
    fillVoices();
    setTimeout(fillVoices, 800);
    store.touchDay();
    RENDER.picker();
    go("home");
    setText("storeNote", store.backend === "local"
      ? "Progress is saved on this device with local storage and works offline."
      : "This preview blocks local storage, so progress lasts only for this visit. Download the file and open it in your browser to save progress.");
    HEM.app.booted = true;
  }

  HEM.app = {
    booted: false,
    boot: boot,
    go: go,
    startSession: startSession,
    startDaily: startDaily,
    renderSearch: renderSearch,
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
})(typeof window !== "undefined" ? (window.HEM = window.HEM || {}) : (global.HEM = global.HEM || {}));
