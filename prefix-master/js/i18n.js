/* ==========================================================================
   i18n.js — bilingual dictionary for Hitarthi Prefix Master
   Attaches to the single HPM namespace. Declares no global identifiers.
   Every UI string the learner sees (buttons, labels, prompts, feedback)
   lives here in both languages. Word content itself (prefix/root/word
   meanings, examples) is bilingual by design already and is not part
   of this dictionary — see data.js.
   ========================================================================== */
(function (HPM) {
  "use strict";

  var DICT = {
    en: {
      brand_name: "Hitarthi English Master",
      game_name: "Hitarthi Prefix Master",
      tagline: "Build Words. Understand English. Speak with Confidence.",
      lang_toggle: "हिंदी",

      nav_start: "Start Learning",
      nav_challenge: "Prefix Challenge",
      nav_practice: "Practice",
      nav_daily: "Daily Challenge",
      nav_progress: "My Progress",

      stat_level: "Level",
      stat_xp: "XP",
      stat_streak: "Streak",
      stat_words: "Words Learned",
      stat_accuracy: "Accuracy",

      lesson_heading: "What is a Prefix?",
      lesson_body: "A prefix is a letter or group of letters added to the beginning of a word to change its meaning.",
      lesson_formula: "PREFIX + WORD = NEW WORD",
      lesson_example_heading: "Example",
      btn_continue: "Continue",
      btn_start_level_quiz: "Start Level Quiz",
      btn_back: "Back",
      btn_home: "Home",
      btn_next: "Next",
      btn_finish: "Finish",
      btn_listen: "Listen",
      btn_repeat: "Repeat the word",
      btn_check: "Check",
      btn_reveal: "Reveal Answer",
      btn_next_level: "Next Level",
      btn_practice_again: "Practice Again",
      btn_retry: "Try Again",

      level_locked: "Complete the previous level to unlock this one",
      level_completed: "Completed",
      level_current: "Level",

      mode_meaning: "Guess the Meaning",
      mode_build: "Build the Word",
      mode_find: "Find the Prefix",
      mode_transform: "Word Transformation",
      mode_match: "Prefix Match",
      mode_spell: "Spelling Challenge",
      mode_pronounce: "Pronunciation",
      mode_sentence: "Sentence Challenge",

      q_meaning: "What does {word} mean?",
      q_build: "Add the correct prefix to make the opposite meaning.",
      q_build_general: "Add the correct prefix to complete the word.",
      q_find: "Which prefix is used in this word?",
      q_transform: "Add {prefix}- to {root} to make a new word.",
      q_match: "Match each prefix with the correct word.",
      q_spell: "Complete the spelling.",
      q_pronounce_intro: "Listen carefully, then say the word yourself.",
      q_sentence: "Which sentence correctly uses \"{word}\"?",

      feedback_correct: "Correct!",
      feedback_first_try: "Correct on the first try!",
      feedback_wrong: "Almost there! Think once more.",
      feedback_reveal_prompt: "Here is the answer:",

      hint_negative: "This prefix is used to give a negative or opposite meaning.",
      hint_again: "This prefix means \"again\".",
      hint_before: "This prefix means \"before\".",
      hint_wrongly: "This prefix means \"wrongly\" or \"badly\".",
      hint_too_much: "This prefix means \"too much\".",
      hint_too_little: "This prefix means \"too little\" or \"below\".",
      hint_against: "This prefix means \"against\".",
      hint_self: "This prefix means \"self\".",
      hint_beyond: "This prefix means \"above\" or \"beyond normal\".",
      hint_across: "This prefix means \"across\" or \"change\".",
      hint_sentence: "Look for the sentence that uses this exact word.",

      label_prefix: "Prefix",
      label_root: "Root Word",
      label_new_word: "New Word",
      label_meaning: "Meaning",
      label_pronunciation: "Pronunciation",
      label_example: "Example Sentence",
      label_correct_spelling: "Correct Spelling",

      result_title: "Challenge Complete!",
      result_score: "Score",
      result_accuracy: "Accuracy",
      result_xp_earned: "XP Earned",
      result_words_learned: "Words Learned",
      result_streak: "Streak",
      result_band_excellent: "10/10 — Excellent!",
      result_band_great: "Great effort!",
      result_band_good: "Good work!",
      result_band_practice: "Practice again — you can do even better!",
      result_review_heading: "Words to Review",
      result_level_unlocked: "New level unlocked!",

      daily_title: "Daily Challenge",
      daily_sub: "10 mixed prefix questions, refreshed every day",
      daily_done_today: "You've completed today's challenge — replaying it now.",

      practice_title: "Practice",
      practice_empty_heading: "No mistakes yet",
      practice_empty_body: "Words you answer incorrectly will appear here for extra practice.",
      practice_start: "Practice these words",

      progress_words_of: "of 112 words",
      progress_levels_heading: "Level Progress",
      progress_families_heading: "Prefix Families Learned",

      search_placeholder: "Search a prefix or word…",
      no_results: "No matching word found.",

      toast_no_words: "No words available for this selection",
      toast_level_locked: "Finish the previous level first",
      toast_fill_all: "Fill every letter box first",

      mic_tap: "Tap and say the word",
      mic_listening: "Listening… now say it",
      mic_unsupported: "This browser cannot listen. Rate yourself below.",
      mic_blocked: "Microphone blocked. Allow it, or rate yourself below.",
      rate_excellent: "Excellent",
      rate_good: "Good",
      rate_try_again: "Try Again",

      label_questions: "Questions",
      label_mode: "Mode",
      label_current_streak: "Current Streak",
      label_best_streak: "Best Streak",
      label_total_xp: "Total XP",
      label_of_112: "of 112 words"
    },

    hi: {
      brand_name: "हितार्थी इंग्लिश मास्टर",
      game_name: "हितार्थी प्रीफ़िक्स मास्टर",
      tagline: "शब्द बनाइए, अंग्रेज़ी समझिए और आत्मविश्वास से बोलिए।",
      lang_toggle: "English",

      nav_start: "सीखना शुरू करें",
      nav_challenge: "प्रीफ़िक्स चुनौती",
      nav_practice: "अभ्यास",
      nav_daily: "आज की चुनौती",
      nav_progress: "मेरी प्रगति",

      stat_level: "स्तर",
      stat_xp: "एक्सपी",
      stat_streak: "श्रृंखला",
      stat_words: "सीखे शब्द",
      stat_accuracy: "शुद्धता",

      lesson_heading: "Prefix क्या है?",
      lesson_body: "Prefix वह अक्षर या अक्षरों का समूह है जो किसी शब्द के आगे लगाया जाता है और उसके अर्थ में बदलाव कर सकता है।",
      lesson_formula: "PREFIX + WORD = NEW WORD",
      lesson_example_heading: "उदाहरण",
      btn_continue: "आगे बढ़ें",
      btn_start_level_quiz: "स्तर प्रश्नोत्तरी शुरू करें",
      btn_back: "वापस",
      btn_home: "होम",
      btn_next: "अगला",
      btn_finish: "समाप्त करें",
      btn_listen: "सुनिए",
      btn_repeat: "शब्द दोहराइए",
      btn_check: "जाँचिए",
      btn_reveal: "उत्तर दिखाइए",
      btn_next_level: "अगला स्तर",
      btn_practice_again: "फिर अभ्यास करें",
      btn_retry: "फिर कोशिश करें",

      level_locked: "इसे खोलने के लिए पिछला स्तर पूरा करें",
      level_completed: "पूर्ण",
      level_current: "स्तर",

      mode_meaning: "अर्थ पहचानिए",
      mode_build: "शब्द बनाइए",
      mode_find: "Prefix खोजिए",
      mode_transform: "शब्द रूपांतरण",
      mode_match: "Prefix मिलान",
      mode_spell: "वर्तनी चुनौती",
      mode_pronounce: "उच्चारण",
      mode_sentence: "वाक्य चुनौती",

      q_meaning: "{word} का अर्थ क्या है?",
      q_build: "विपरीत अर्थ बनाने के लिए सही Prefix लगाइए।",
      q_build_general: "शब्द पूरा करने के लिए सही Prefix लगाइए।",
      q_find: "इस शब्द में कौन-सा Prefix लगा है?",
      q_transform: "{root} में {prefix}- लगाकर नया शब्द बनाइए।",
      q_match: "हर Prefix को सही शब्द से मिलाइए।",
      q_spell: "वर्तनी पूरी कीजिए।",
      q_pronounce_intro: "पहले ध्यान से सुनिए, फिर खुद बोलिए।",
      q_sentence: "\"{word}\" का सही प्रयोग किस वाक्य में है?",

      feedback_correct: "सही जवाब!",
      feedback_first_try: "पहली ही कोशिश में सही!",
      feedback_wrong: "लगभग सही! एक बार फिर सोचिए।",
      feedback_reveal_prompt: "सही उत्तर यह है:",

      hint_negative: "यह Prefix नकारात्मक या विपरीत अर्थ देने के लिए प्रयोग होता है।",
      hint_again: "इस Prefix का अर्थ है \"फिर से\"।",
      hint_before: "इस Prefix का अर्थ है \"पहले\"।",
      hint_wrongly: "इस Prefix का अर्थ है \"गलत तरीके से\"।",
      hint_too_much: "इस Prefix का अर्थ है \"बहुत अधिक\"।",
      hint_too_little: "इस Prefix का अर्थ है \"बहुत कम\" या \"नीचे\"।",
      hint_against: "इस Prefix का अर्थ है \"के विरुद्ध\"।",
      hint_self: "इस Prefix का अर्थ है \"स्वयं\"।",
      hint_beyond: "इस Prefix का अर्थ है \"असाधारण\" या \"परे\"।",
      hint_across: "इस Prefix का अर्थ है \"पार\" या \"परिवर्तन\"।",
      hint_sentence: "वह वाक्य खोजिए जिसमें यही शब्द प्रयोग हुआ है।",

      label_prefix: "Prefix",
      label_root: "मूल शब्द",
      label_new_word: "नया शब्द",
      label_meaning: "अर्थ",
      label_pronunciation: "उच्चारण",
      label_example: "उदाहरण वाक्य",
      label_correct_spelling: "सही वर्तनी",

      result_title: "चुनौती पूर्ण!",
      result_score: "स्कोर",
      result_accuracy: "शुद्धता",
      result_xp_earned: "एक्सपी अर्जित",
      result_words_learned: "सीखे गए शब्द",
      result_streak: "श्रृंखला",
      result_band_excellent: "10/10 — शानदार!",
      result_band_great: "बहुत बढ़िया!",
      result_band_good: "अच्छा काम!",
      result_band_practice: "फिर अभ्यास करें — आप और बेहतर कर सकते हैं!",
      result_review_heading: "दोहराने योग्य शब्द",
      result_level_unlocked: "नया स्तर खुल गया!",

      daily_title: "आज की चुनौती",
      daily_sub: "10 मिश्रित प्रश्न, हर दिन नए",
      daily_done_today: "आज की चुनौती पहले ही पूरी हो चुकी है — दोबारा खेल रहे हैं।",

      practice_title: "अभ्यास",
      practice_empty_heading: "अभी कोई गलती नहीं",
      practice_empty_body: "जिन शब्दों में गलती होगी, वे यहाँ अतिरिक्त अभ्यास के लिए दिखेंगे।",
      practice_start: "इन शब्दों का अभ्यास करें",

      progress_words_of: "/ 112 शब्द",
      progress_levels_heading: "स्तर प्रगति",
      progress_families_heading: "सीखे गए Prefix समूह",

      search_placeholder: "कोई Prefix या शब्द खोजिए…",
      no_results: "कोई मेल खाता शब्द नहीं मिला।",

      toast_no_words: "इस चयन के लिए कोई शब्द उपलब्ध नहीं",
      toast_level_locked: "पहले पिछला स्तर पूरा करें",
      toast_fill_all: "पहले हर अक्षर बॉक्स भरें",

      mic_tap: "माइक दबाकर शब्द बोलिए",
      mic_listening: "सुन रहे हैं… अब बोलिए",
      mic_unsupported: "यह ब्राउज़र सुन नहीं सकता। नीचे खुद रेटिंग दीजिए।",
      mic_blocked: "माइक्रोफ़ोन अवरुद्ध है। अनुमति दें, या नीचे खुद रेटिंग दीजिए।",
      rate_excellent: "उत्कृष्ट",
      rate_good: "अच्छा",
      rate_try_again: "फिर कोशिश करें",

      label_questions: "प्रश्न",
      label_mode: "तरीका",
      label_current_streak: "वर्तमान श्रृंखला",
      label_best_streak: "सर्वश्रेष्ठ श्रृंखला",
      label_total_xp: "कुल एक्सपी",
      label_of_112: "/ 112 शब्द"
    }
  };

  var lang = "en";

  function t(key, vars) {
    var table = DICT[lang] || DICT.en;
    var s = table[key] !== undefined ? table[key] : (DICT.en[key] !== undefined ? DICT.en[key] : key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split("{" + k + "}").join(vars[k]);
      });
    }
    return s;
  }

  HPM.i18n = {
    dict: DICT,
    t: t,
    get: function () { return lang; },
    set: function (v) { if (v === "en" || v === "hi") lang = v; },
    toggle: function () { lang = lang === "en" ? "hi" : "en"; return lang; }
  };
})(typeof window !== "undefined" ? (window.HPM = window.HPM || {}) : (global.HPM = global.HPM || {}));
