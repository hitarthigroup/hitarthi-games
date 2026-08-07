# Hitarthi Prefix Master

**English Prefix Game | अंग्रेज़ी Prefix सीखें खेल-खेल में**

*"Build Words. Understand English. Speak with Confidence."*
*"शब्द बनाइए, अंग्रेज़ी समझिए और आत्मविश्वास से बोलिए।"*

**Latest update:** every question that shows a root word (Guess the
Meaning, Build the Word, Word Transformation) now also shows that
root's Hindi meaning right on screen — e.g. for `UN- + LIMITED` it now
shows *"limited = सीमित"* alongside the prefix's own meaning where that
doesn't give the answer away. The learner can reason toward the answer
("not" + "limited" = असीमित) instead of guessing blind. See "The 8 game
modes" below for exactly what's shown in each mode.

A standalone, professional prefix-learning game for Class 11–12 students
through adult learners. Pure HTML, CSS and vanilla JavaScript — no
backend, no build step, no frameworks. Every instruction, question,
hint and explanation is available in both English and Hindi via a
language toggle in the header.

## How to run it

| File | Use it when |
|---|---|
| `hitarthi-prefix-master.html` | **Easiest.** One file, everything inside. Share on WhatsApp, open on any Android phone. |
| `index.html` | Modular version with the folder structure below, for editing. |

Both work by double-clicking — no server needed.

## Folder structure

```
index.html                     app shell — all screens, stable element ids
css/styles.css                 premium theme: navy / white / orange / green / red
js/data.js                     112 prefix + word combinations across 8 levels
js/i18n.js                     full English/Hindi UI dictionary + t() helper
js/store.js                    persistence, XP rules, level unlock logic, daily set
js/speech.js                   text-to-speech, listening, sound effects
js/app.js                      router, i18n application, all 8 game-mode engines
hitarthi-prefix-master.html    single-file build of everything above
```

Every file attaches to one shared namespace, `window.HPM`, and declares
nothing else in global scope, so it can never collide with another
script even if a `<script>` tag were duplicated.

## The 8 game modes

1. **Guess the Meaning** — see `PREFIX + ROOT`, pick the correct Hindi meaning.
2. **Build the Word** — see the root, pick the correct prefix to attach.
3. **Find the Prefix** — see the full word, identify which prefix was used.
4. **Word Transformation** — root word is fixed; tap letters to build the prefix in front of it.
5. **Prefix Match** — tap-to-pair five prefixes with their roots.
6. **Spelling Challenge** — the whole derived word has missing letters; fill them from a letter bank.
7. **Pronunciation** — listen, then speak; scored Excellent / Good / Try Again (falls back to self-rating where the browser can't listen).
8. **Sentence Challenge** — pick the sentence that correctly uses the word.

Modes 1, 2, 3 and 8 use a shared "wrong → hint → one retry → reveal"
flow: a wrong first attempt never just says "Wrong" — it shows
*"Almost there! Think once more"* plus a short hint about what that
prefix means, and lets the learner try again before revealing the
answer.

## Levels and progression

| Level | Prefixes | Words |
|---|---|---|
| 1 | UN- | 15 |
| 2 | DIS- | 13 |
| 3 | RE- | 13 |
| 4 | PRE- | 12 |
| 5 | MIS- | 12 |
| 6 | IN- / IM- / IL- / IR- | 16 |
| 7 | NON- / OVER- / UNDER- | 15 |
| 8 | ANTI- / AUTO- / SUPER- / TRANS- | 16 |

**112 words total.** Level 1 is unlocked from the start; each further
level unlocks only after completing the **Start Level Quiz** for the
level before it (a Guess-the-Meaning run through every word in that
level). Completing a level for the first time awards a one-time +50 XP
bonus and shows an "unlocked!" banner with a **Next Level** button.

## XP system

| Action | XP |
|---|---|
| Correct answer | +10 |
| Correct answer, first attempt (no wrong tries) | +15 (replaces the +10) |
| Complete a level (first time) | +50 |
| Finish the Daily Challenge | +100 bonus |

Level, XP, streak, words learned and accuracy are always visible on
the home screen.

## Daily Challenge

10 questions mixing all six question categories named in the brief —
meaning, word-building, prefix identification, spelling, pronunciation,
and sentence use — drawn only from levels already unlocked, refreshed
automatically at midnight (deterministic per calendar date, so
everyone playing on the same day gets the same set). Scoring bands:
10/10 Excellent, 9/10 Great, 70%+ Good, below that a gentle "practice
again" nudge — never a harsh "you failed" message.

## Review system

Any word answered incorrectly is automatically added to a **Practice**
queue (shown on the home screen and the Result screen as "Words to
Review"). A correct answer later removes it from the queue. **Practice
Again** starts a focused session over exactly those words.

## Language toggle

The header's language button (हिंदी / English) switches every button
label, prompt, hint and result message. English words themselves
always stay in English — only the surrounding instruction language
changes. The choice is remembered across visits.

## A note on two intentional design choices

- **Prefix Match XP:** because "first attempt" doesn't map cleanly onto
  a tap-to-pair matching game, each correctly matched pair awards a
  flat +10 XP rather than a first-try bonus, and a mismatched tap has
  no XP or review-queue effect (it's ambiguous which of the two tapped
  items was "the mistake"). This is documented here rather than left
  as a silent simplification.
- **Build the Word wording:** the brief's sample question text ("Add
  the correct prefix to make the *opposite* meaning") is shown as
  written for negation-type prefixes (UN-, DIS-, IN-, IM-, IL-, IR-,
  NON-). For prefixes that don't mean "opposite" (RE- = again, PRE- =
  before, MIS- = wrongly, OVER-/UNDER-, ANTI-, AUTO-, SUPER-, TRANS-),
  the game uses an equally simple, accurate line — "Add the correct
  prefix to complete the word" — so the instruction is never
  misleading.

## Storage

Progress (XP, level, streak, completed levels, learned words, wrong
answers, language and theme preference) saves to `localStorage`
automatically and works offline. If a browser blocks storage, the app
falls back to an in-memory store instead of crashing.

## Testing

`test/` (not needed to run the app, kept for transparency):

- `test/run.js` — 137 checks, run repeatedly to confirm zero flakiness:
  global-scope isolation, double-inclusion safety, all 112 words and
  8 levels validated, i18n key parity between English and Hindi, XP
  math (including the first-try vs. retry distinction), the full
  level-lock-then-unlock flow end-to-end, all 8 modes individually
  and played through to completion, the wrong-answer hint-and-retry
  flow verified against the live session state, the full Daily
  Challenge, the review/Practice Again loop, Progress screen, and
  persistence.
- `test/fuzz.js` — 300 randomized sessions across every level, mode
  and length combination, plus dedicated churn through all 8 level
  quizzes and three separate daily-challenge dates. Zero errors.

Run with `node test/run.js` and `node test/fuzz.js` (plain Node, no
dependencies).

## Browser notes

- Speech synthesis: Chrome, Edge, Safari, Samsung Internet.
- Speech recognition: Chrome and Edge. Elsewhere Pronunciation mode
  falls back to listen-and-self-rate, so it never dead-ends.
- Fonts load from Google Fonts; offline it falls back to the system
  Devanagari font.
