/* =====================================================================
   check-games.mjs — the push-time safety net.

   Runs automatically on every push (see .github/workflows/check.yml)
   and can be run by hand any time:

       node scripts/check-games.mjs

   It fails loudly, in plain words, on the mistakes that would otherwise
   reach visitors silently:
     1. The GAMES list in index.html doesn't parse (the missing-comma
        classic) or has a bad/missing title, path or date.
     2. A listed game folder or its index.html doesn't exist.
     3. A game folder sits in the repo but isn't listed (forgot step 3).
     4. A page references a file that isn't there (the "zip flattened
        the css/ and js/ folders" incident).

   It also prints warnings (which don't fail the check) for missing
   card fields and oversized files.
   ===================================================================== */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const indexPath = resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "index.html"));
const root = dirname(indexPath);

const errors = [];
const warnings = [];

/* ---------- 1. extract and parse the GAMES list ---------- */
let games = [];
{
  const html = readFileSync(indexPath, "utf8");
  const start = html.indexOf("const GAMES = [");
  const end = html.indexOf("\n];", start);
  if (start === -1 || end === -1) {
    errors.push("Couldn't find the `const GAMES = [ ... ];` block in index.html.");
  } else {
    const snippet = html.slice(start, end + 3);
    try {
      games = vm.runInNewContext(`(() => { ${snippet}; return GAMES; })()`, {}, { timeout: 2000 });
    } catch (e) {
      errors.push(
        "The GAMES list in index.html has a syntax error and the homepage would " +
        "show the fallback message instead of the games.\n" +
        "    Most often this is a missing comma or quote in the entry you just added.\n" +
        "    JavaScript said: " + e.message
      );
    }
  }
}

/* ---------- 2. validate each entry ---------- */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PATH_RE = /^[a-z0-9][a-z0-9-]*\/$/;
const listedPaths = new Set();

games.forEach((g, i) => {
  const label = `GAMES entry ${i + 1}` + (g && g.title ? ` ("${g.title}")` : "");
  if (!g || typeof g !== "object") { errors.push(`${label}: not an object.`); return; }

  if (typeof g.title !== "string" || !g.title.trim())
    errors.push(`${label}: "title" is missing or empty.`);

  if (typeof g.path !== "string" || !PATH_RE.test(g.path)) {
    errors.push(`${label}: "path" must be a lowercase folder name ending in a slash, like "snake-dash/". Got: ${JSON.stringify(g.path)}`);
  } else {
    if (listedPaths.has(g.path)) errors.push(`${label}: "${g.path}" is listed twice.`);
    listedPaths.add(g.path);
    const folder = join(root, g.path);
    if (!existsSync(folder)) {
      errors.push(`${label}: the folder "${g.path}" doesn't exist in the repo.`);
    } else if (!existsSync(join(folder, "index.html"))) {
      errors.push(`${label}: "${g.path}" has no index.html — the Play button would give a 404.`);
    }
  }

  if (typeof g.added !== "string" || !DATE_RE.test(g.added)) {
    errors.push(
      `${label}: "added" must be a quoted, zero-padded date like "2026-08-11". Got: ${JSON.stringify(g.added)}.\n` +
      `    A bad date silently loses the featured slot and the New badge.`
    );
  } else if (isNaN(new Date(g.added + "T00:00:00").getTime())) {
    errors.push(`${label}: "added" (${g.added}) isn't a real calendar date.`);
  }

  if (!g.emoji) warnings.push(`${label}: no "emoji" — its card will have a blank picture.`);
  if (!g.desc) warnings.push(`${label}: no "desc" — its card will have no description.`);
});

/* ---------- 3. every game folder must be listed ---------- */
const NOT_GAMES = new Set(["assets", "scripts", ".git", ".github", "node_modules"]);
for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory() || NOT_GAMES.has(entry.name)) continue;
  if (!existsSync(join(root, entry.name, "index.html"))) continue;
  if (!listedPaths.has(entry.name + "/"))
    errors.push(
      `The folder "${entry.name}/" looks like a game (it has an index.html) but isn't in the GAMES list — ` +
      `it would be live on the site yet invisible on the homepage.`
    );
}

/* ---------- 4. no page may reference a missing file ---------- */
function checkRefs(htmlFile) {
  const dir = dirname(htmlFile);
  const html = readFileSync(htmlFile, "utf8");
  const rel = htmlFile.slice(root.length + 1).replaceAll("\\", "/");
  for (const m of html.matchAll(/(?:src|href)\s*=\s*["']([^"'#?]+)["']/g)) {
    const ref = m[1];
    if (/^(https?:)?\/\//.test(ref) || ref.startsWith("data:") || ref.startsWith("mailto:")) continue;
    const target = ref.startsWith("/")
      ? join(root, ref.replace(/^\/hitarthi-games\//, ""))
      : join(dir, ref);
    if (!existsSync(target))
      errors.push(`${rel} references "${ref}" but that file doesn't exist. (Did a zip flatten the folders?)`);
  }
}
checkRefs(indexPath);
if (existsSync(join(root, "404.html"))) checkRefs(join(root, "404.html"));
for (const p of listedPaths) {
  const entry = join(root, p, "index.html");
  if (existsSync(entry)) checkRefs(entry);
}

/* ---------- 5. size discipline (warning only) ---------- */
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (statSync(p).size > 300 * 1024)
      warnings.push(`${p.slice(root.length + 1)} is ${(statSync(p).size / 1024).toFixed(0)} KB — heavy for visitors on slow connections.`);
  }
}
walk(root);

/* ---------- report ---------- */
for (const w of warnings) console.log("WARN  " + w);
if (errors.length) {
  console.error(`\n${errors.length} problem(s) that would affect the live site:\n`);
  errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}\n`));
  process.exit(1);
}
console.log(`\nOK — ${games.length} game(s) listed, all folders present, all file references resolve.`);
