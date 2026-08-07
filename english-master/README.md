# Hitarthi English Master

Learn English vocabulary in Hindi — quizzes, flashcards, spelling,
pronunciation and a prefix-building game. Pure HTML, CSS and vanilla
JavaScript. No backend, no build step, no frameworks.

## What changed in this update

Two changes, both requested directly:

**1. Every English word now shows its Hindi reading right under it.**
Previously the Hindi transliteration (e.g. "हैपी" for "Happy") only
appeared after you revealed the answer. Now it shows immediately as
"पढ़िए: हैपी" in Learning, Quiz, and Flashcard modes — so you can always
sound the word out, while the *meaning* still stays hidden until you
answer or reveal it. The game logic is unchanged; only the reading aid
is now always visible.

**2. New mode — Prefix Builder · उपसर्ग खेल.**
Not a meaning quiz — a word-building game. It shows a prefix (उपसर्ग)
and a base word separately, with both explained in Hindi first, then
asks what the two make when joined. After you answer, it reveals the
combined word with its meaning in both English and Hindi, plus an
example sentence in both languages.

```
PRE- + VIEW
पढ़िए: प्री + व्यू
pre- = पहले (before) · view = देखना
दोनों जोड़ने पर कौन-सा शब्द बनेगा?
  [ automobile ]  [ preview ]  [ international ]  [ impossible ]

→ pre- + view = preview
  उच्चारण: प्रीव्यू · अर्थ: पूर्वावलोकन, पहले देखना
  We watched a preview of the new film.
  हमने नई फ़िल्म का पूर्वावलोकन देखा।
```

52 prefix + word combinations across 24 real English prefixes (un-, re-,
pre-, dis-, mis-, in-, im-, non-, over-, under-, sub-, super-, inter-,
auto-, bi-, tri-, semi-, anti-, co-, fore-, post-, de-, ex-, extra-).
Reachable from the home screen's **Prefix Builder** tile or from the
mode picker.

## How to run it

| File | Use it when |
|---|---|
| `hitarthi-english-master.html` | **Easiest.** One file, everything inside. Share on WhatsApp, open on any Android phone. |
| `index.html` | Modular version with the folder structure below, for editing. |

Both work by double-clicking — no server needed.

## Folder structure

```
index.html                    app shell — all screens, stable element ids
css/styles.css                design tokens, light + dark theme, animations
js/data.js                    300 words (13 categories) + achievement rules
js/prefixdata.js              52 prefix + word combinations for Prefix Builder
js/store.js                   persistence, XP/levels, spaced repetition — pure logic
js/speech.js                  text-to-speech, speech recognition, sound effects
js/app.js                     router, session engine, all seven practice modes
hitarthi-english-master.html  single-file build of everything above
```

Every file attaches to one shared namespace, `window.HEM`, and declares
nothing else in global scope — the "$ already declared" crash from
before cannot recur even if a script tag is duplicated.

## Word and prefix databases

Each of the 300 vocabulary words carries all eleven fields (English,
Hindi pronunciation, Hindi meaning, part of speech, example sentence,
Hindi translation, synonyms, antonyms, usage tip, difficulty, category).
To add a word, append a row in `js/data.js`.

Each of the 52 prefix combinations carries: the prefix, its Hindi
reading and meaning in both languages; the base word, its Hindi reading
and meaning; the combined result word, its Hindi reading and meaning in
both languages; and an example sentence in both languages. To add a
combination, append a row in `js/prefixdata.js`:

```js
["pre","प्री","before","पहले","view","व्यू","देखना",
 "preview","प्रीव्यू","to see something before the main showing",
 "पूर्वावलोकन, पहले देखना",
 "We watched a preview of the new film.","हमने नई फ़िल्म का पूर्वावलोकन देखा।"]
```

## Modes

- **Learning** — the word appears with its Hindi reading, then *Reveal
  Answer* opens six cards (word, pronunciation, meaning + synonyms/tip,
  sentence, Hindi sentence, speak buttons).
- **Quiz** — four always-distinct options, instant feedback. Keys 1–4
  also answer.
- **Spell Challenge** — letters removed, tap the letter bank to fill them.
- **Pronunciation** — microphone check via the Web Speech API, scored
  Excellent / Good / Try Again; falls back to self-rating where the
  browser can't listen.
- **Flashcards** — tap to flip, then mark *I knew it* or *Need practice*.
- **Prefix Builder** — prefix + base word shown separately with Hindi
  meanings, four options for the combined word, full bilingual reveal.
- **Mixed** — the four testable vocabulary modes interleaved at random
  (Prefix Builder runs on its own, since it uses a different word bank).

Prefix Builder answers count toward XP, coins and overall accuracy, but
— since combined words aren't part of the 300-word catalogue — they
don't affect the "words learned" count or the spaced-repetition queue.

## Spaced repetition

A five-box Leitner system in `store.js`, covering the 300-word bank. A
wrong answer drops a word to box 1; each correct answer promotes it.
Boxes return after 1, 2, 4, 8 and 16 days. The Revision screen shows
what's due.

## Storage

Progress saves to `localStorage` automatically and works offline. If a
browser blocks storage, the app falls back to an in-memory store instead
of crashing — Settings states which mode is active.

## Testing

`test/` (not needed to run the app, kept for transparency):

- `test/run.js` — 131 checks: global-scope isolation, double-inclusion
  safety, markup/script contract, word- and prefix-data integrity,
  pure-logic unit tests, then drives every nav button, every home tile,
  all seven practice modes end-to-end (including a full Prefix Builder
  round with wording checked verbatim), Daily Challenge, search,
  Progress, Revision, Leaderboard, every Settings control, persistence.
- `test/fuzz.js` — 400 randomized sessions across every category/level/
  length/mode combination including Prefix Builder, 15,000+ clicks. Zero
  errors.

Run with `node test/run.js` and `node test/fuzz.js` (plain Node, no
dependencies).

## Browser notes

- Speech synthesis: Chrome, Edge, Safari, Samsung Internet.
- Speech recognition: Chrome and Edge. Elsewhere the app self-rates.
- Hindi voice quality depends on voices installed on the device.
- Fonts load from Google Fonts; offline it falls back to the system
  Devanagari font.
