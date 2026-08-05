# 🕹️ Hitarthi Arcade

Small browser games built by the Hitarthi team. Pure HTML/CSS/JS — no backend, no build step.

**Play here:** https://hitarthigroup.github.io/hitarthi-games/

## How to add a new game (weekly routine)

1. Copy the game's folder into the root of this repo, e.g. `snake-dash/`.
   The folder must contain an `index.html` as its entry point.

2. Add this one line to the game's entry page, just before `</body>`, so players
   can get back to the arcade:

   ```html
   <script src="../assets/arcade-bar.js" defer></script>
   ```

   That's the only edit a game ever needs — the button lives in a shadow root, so
   it can't affect the game's styling and the game can't affect it. Skip it on a
   full-screen play surface where it would cover the controls (put it on the page
   the arcade links to instead).

3. Open `index.html` (the gallery page at the repo root) and add one entry to the
   `GAMES` list near the bottom:

   ```js
   {
     title: "Snake Dash",
     hindi: "",                    // optional Hindi title
     emoji: "🐍",                  // shown on the game's card
     path: "snake-dash/",          // the folder you just added
     desc: "One line about the game.",
     added: "2026-08-11",          // today's date — newest game is featured on top
     tags: ["arcade"]
   },
   ```

4. Commit and push (or drag-and-drop the folder + edited `index.html` on github.com):

   ```
   git add .
   git commit -m "Add Snake Dash"
   git push
   ```

The site updates itself in about a minute. That's the whole process.

## Rules of the arcade

- **Static only.** HTML/CSS/JS. Anything needing a server won't run on GitHub Pages.
- **One folder per game.** Don't edit another game's folder.
- **Relative paths inside a game** (`style.css`, not `/style.css`) so it works under
  its subfolder URL.
- **Prefix your saved data.** Every game shares one browser storage area because they
  all sit on the same domain. If your game uses `localStorage`, prefix every key with
  the game's folder name — `snake-dash:highScore`, not `highScore` — otherwise two
  games will overwrite each other's saves.
- **No secrets.** This repo is public. Never commit an API key, password, or personal
  data. Deleting it later doesn't help: it stays visible in the git history.
- **Keep images small.** Many players are on slow rural connections. Resize a picture
  to the size it's actually displayed at before committing it.

## What's in here

| Path | What it is |
|---|---|
| `index.html` | The arcade homepage — game list lives in the `GAMES` array at the bottom |
| `404.html` | Shown for a bad link, styled like the arcade |
| `assets/arcade-bar.js` | The "← back to arcade" button games include with one line |
| `assets/hitarthi-logo.png` | Header logo and favicon |
| `assets/og-image.png` | Preview picture shown when the link is shared on WhatsApp/Slack |
| `<game>/` | One folder per game — the junior's own code, styled however they like |
