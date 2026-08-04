# 🕹️ Hitarthi Arcade

Small browser games built by the Hitarthi team. Pure HTML/CSS/JS — no backend, no build step.

**Play here:** https://hitarthigroup.github.io/hitarthi-games/

## How to add a new game (weekly routine)

1. Copy the game's folder into the root of this repo, e.g. `snake-dash/`.
   The folder must contain an `index.html` as its entry point.
2. Open `index.html` (the gallery page at the repo root) and add one entry to the `GAMES` list at the bottom:

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

3. Commit and push (or drag-and-drop the folder + edited `index.html` on github.com):

   ```
   git add .
   git commit -m "Add Snake Dash"
   git push
   ```

The site updates itself in about a minute. That's the whole process.

## Rules of the arcade

- Games must be static (HTML/CSS/JS only) — anything needing a server won't work on GitHub Pages.
- Keep each game inside its own folder; don't edit other games' folders.
- Use relative paths inside a game (`style.css`, not `/style.css`) so it works under its subfolder URL.
