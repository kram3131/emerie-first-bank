#!/usr/bin/env node
/*
 * scripts/create-demo.mjs
 *
 * Turn a bank/credit union homepage URL into a working chat + voice demo:
 *   1. Crawl the site with Firecrawl → clean markdown per page
 *   2. Back up the current kb/ to .kb-backups/<timestamp>/
 *   3. Write the fresh scrape to kb/ (one markdown file per page)
 *   4. Create an Ultravox corpus and upload each markdown file as a source
 *   5. Poll until the corpus finishes indexing
 *   6. Rewrite lib/brand.ts with the new bank name, slug, homepage, and
 *      Ultravox corpus id so the voice route flips to queryCorpus RAG
 *
 * Usage:
 *   node scripts/create-demo.mjs --url https://firstcommercial.com \
 *     --name "First Commercial Bank" [--slug first-commercial] [--limit 40]
 *
 * Required environment variables:
 *   FIRECRAWL_API_KEY   - https://firecrawl.dev
 *   ULTRAVOX_API_KEY    - already set in .env.local
 *
 * Chat automatically picks up the new kb/ files (loadKnowledgeBase reads
 * whatever is on disk). Voice picks up the new corpus id from lib/brand.ts.
 * Run `npm run dev` after this finishes to test locally.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { setTimeout as sleep } from "timers/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// -------- Safety guard: refuse to run inside the Emerie template repo -----
// This script mutates kb/ and lib/brand.ts. Running it inside the source
// Emerie project would overwrite the live demo. Force the operator to run
// against a fresh clone instead.
//
// The check has three layers:
//   1. Git remote URL contains the template repo path (primary signal).
//   2. Working directory basename is the canonical Emerie folder name.
//   3. lib/brand.ts still points at the Emerie slug (fallback in case of
//      forks or renamed remotes).
// Any single positive fires the guard. `--force` bypasses it (with a warning)
// for the intentional case where the operator explicitly wants to rewrite
// the template itself.
const FORCE = process.argv.includes("--force");
{
  const EMERIE_REMOTE_HINT = "kram3131/emerie-first-bank";
  const EMERIE_DIR_HINT = "emerie-first-bank";
  const EMERIE_SLUG_HINT = "emerie-first-bank";

  let remoteUrl = "";
  try {
    remoteUrl = execSync("git config --get remote.origin.url", {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    // No git or no remote — not a signal, keep going.
  }

  const dirName = path.basename(ROOT);

  let brandSlug = "";
  try {
    const brandFile = fs.readFileSync(path.join(ROOT, "lib", "brand.ts"), "utf-8");
    const m = brandFile.match(/slug:\s*["']([^"']+)["']/);
    if (m) brandSlug = m[1];
  } catch {
    // brand.ts unreadable — not a signal.
  }

  const signals = [];
  if (remoteUrl.includes(EMERIE_REMOTE_HINT)) signals.push(`git remote → ${remoteUrl}`);
  if (dirName === EMERIE_DIR_HINT) signals.push(`working dir → ${dirName}`);
  if (brandSlug === EMERIE_SLUG_HINT) signals.push(`lib/brand.ts slug → ${brandSlug}`);

  if (signals.length && !FORCE) {
    console.error(`
✗ REFUSING to run inside the Emerie template repo.

This script rewrites kb/ and lib/brand.ts. Running it here would overwrite
the live Emerie demo. Clone the repo to a new folder for each new prospect:

  git clone https://github.com/kram3131/emerie-first-bank.git \\
    ~/Desktop/bank-demos/<slug>

  cd ~/Desktop/bank-demos/<slug>
  npm install
  npm run demo:new -- --url https://<bank>.com --name "<Bank Name>"

Signals that identified this as the template:
${signals.map((s) => `  • ${s}`).join("\n")}

If you REALLY intend to rewrite the template itself (rare), re-run with --force.
`);
    process.exit(2);
  }
  if (signals.length && FORCE) {
    console.warn(`
⚠ --force passed while inside the Emerie template repo. Proceeding anyway.
  Signals: ${signals.join("; ")}
`);
  }
}

// -------- Env loading (parse .env.local without adding a dep) --------
const envPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// -------- Args --------
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const URL_ARG = args.url;
const NAME_ARG = args.name;
const SLUG_ARG =
  args.slug ||
  (NAME_ARG || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const LIMIT = parseInt(args.limit || "40", 10);

function usage(msg) {
  if (msg) console.error(`\nError: ${msg}\n`);
  console.error(
    `Usage: node scripts/create-demo.mjs --url <homepage> --name "<Bank Name>" [--slug <slug>] [--limit 40]\n`
  );
  process.exit(1);
}

if (!URL_ARG) usage("--url is required");
if (!NAME_ARG) usage("--name is required");
if (!SLUG_ARG) usage("could not derive slug — pass --slug explicitly");

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY;
const ULTRAVOX_KEY = process.env.ULTRAVOX_API_KEY;
if (!FIRECRAWL_KEY) usage("FIRECRAWL_API_KEY not set (add to .env.local)");
if (!ULTRAVOX_KEY) usage("ULTRAVOX_API_KEY not set (should already be in .env.local)");

// -------- Helpers --------
const log = (...a) => console.log("•", ...a);
const die = (msg, extra) => {
  console.error("\n✗", msg);
  if (extra) console.error(extra);
  process.exit(1);
};

function slugifyPath(url) {
  try {
    const u = new URL(url);
    const p = (u.pathname || "/").replace(/\/+$/g, "");
    if (!p || p === "/") return "home";
    return p
      .slice(1)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "page";
  } catch {
    return "page";
  }
}

// -------- Firecrawl: crawl --------
async function firecrawlCrawl(startUrl, limit) {
  log(`Firecrawl: starting crawl of ${startUrl} (limit ${limit})`);
  const startRes = await fetch("https://api.firecrawl.dev/v2/crawl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FIRECRAWL_KEY}`,
    },
    body: JSON.stringify({
      url: startUrl,
      limit,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
      excludePaths: [
        "^/login",
        "^/signin",
        "^/signup",
        "^/apply",
        "^/forms/",
        "^/blog/",
        "^/news/",
        "^/careers",
        "\\.pdf$",
      ],
    }),
  });
  if (!startRes.ok) {
    const body = await startRes.text();
    die(`Firecrawl start failed (${startRes.status})`, body);
  }
  const started = await startRes.json();
  const jobId = started.id;
  if (!jobId) die("Firecrawl returned no job id", JSON.stringify(started));

  log(`Firecrawl: job ${jobId} — polling for completion`);
  let backoffMs = 3000;
  for (let i = 0; i < 200; i++) {
    const statusRes = await fetch(`https://api.firecrawl.dev/v2/crawl/${jobId}`, {
      headers: { Authorization: `Bearer ${FIRECRAWL_KEY}` },
    });
    if (!statusRes.ok) {
      const body = await statusRes.text();
      die(`Firecrawl status check failed (${statusRes.status})`, body);
    }
    const status = await statusRes.json();
    const state = status.status;
    const completed = status.completed ?? status.data?.length ?? 0;
    const total = status.total ?? "?";
    process.stdout.write(`\r  status=${state} pages=${completed}/${total}   `);
    if (state === "completed") {
      process.stdout.write("\n");
      // Data may be paginated across a `next` URL
      const allDocs = [...(status.data || [])];
      let next = status.next;
      while (next) {
        const nextRes = await fetch(next, {
          headers: { Authorization: `Bearer ${FIRECRAWL_KEY}` },
        });
        if (!nextRes.ok) break;
        const nextJson = await nextRes.json();
        allDocs.push(...(nextJson.data || []));
        next = nextJson.next;
      }
      return allDocs;
    }
    if (state === "failed" || state === "cancelled") {
      die(`Firecrawl job ended with state=${state}`, JSON.stringify(status));
    }
    await sleep(backoffMs);
    backoffMs = Math.min(backoffMs + 1000, 8000);
  }
  die("Firecrawl polling timed out");
}

// -------- Format Firecrawl docs into per-page markdown files --------
function toKbFiles(docs) {
  const files = [];
  const usedNames = new Set();
  let index = 1;
  for (const doc of docs) {
    const meta = doc.metadata || {};
    const url = meta.sourceURL || meta.url || meta.canonicalUrl || "";
    const title = (meta.title || meta.ogTitle || "Untitled").trim();
    const description = (meta.description || meta.ogDescription || "").trim();
    const markdown = (doc.markdown || "").trim();
    if (!markdown || markdown.length < 200) continue; // skip near-empty pages

    let base = slugifyPath(url);
    let name = `${String(index).padStart(2, "0")}-${base}.md`;
    while (usedNames.has(name)) {
      name = `${String(index).padStart(2, "0")}-${base}-${Math.random().toString(36).slice(2, 5)}.md`;
    }
    usedNames.add(name);
    index += 1;

    const header = [
      `# ${title}`,
      ``,
      description ? `> ${description}` : null,
      ``,
      `Source: ${url}`,
      ``,
      `---`,
      ``,
    ]
      .filter((l) => l !== null)
      .join("\n");

    files.push({
      name,
      url,
      title,
      content: header + markdown + "\n",
    });
  }
  return files;
}

// -------- Filesystem: backup + write --------
function backupExistingKb() {
  const kbDir = path.join(ROOT, "kb");
  if (!fs.existsSync(kbDir)) return null;
  const entries = fs.readdirSync(kbDir).filter((f) => f.endsWith(".md"));
  if (entries.length === 0) return null;
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(ROOT, ".kb-backups", ts);
  fs.mkdirSync(backupDir, { recursive: true });
  for (const f of entries) {
    fs.copyFileSync(path.join(kbDir, f), path.join(backupDir, f));
  }
  return backupDir;
}

function writeKbFiles(files) {
  const kbDir = path.join(ROOT, "kb");
  fs.mkdirSync(kbDir, { recursive: true });
  // Clear old .md files
  for (const f of fs.readdirSync(kbDir)) {
    if (f.endsWith(".md")) fs.unlinkSync(path.join(kbDir, f));
  }
  for (const f of files) {
    fs.writeFileSync(path.join(kbDir, f.name), f.content);
  }
}

// -------- Ultravox: create corpus + upload sources --------
async function createUltravoxCorpus(name) {
  log(`Ultravox: creating corpus "${name}"`);
  const res = await fetch("https://api.ultravox.ai/api/corpora", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": ULTRAVOX_KEY,
    },
    body: JSON.stringify({
      name,
      description: `Auto-generated demo corpus for ${name} — sourced from public website.`,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    die(`Ultravox corpus creation failed (${res.status})`, body);
  }
  const data = await res.json();
  const corpusId = data.corpusId || data.id;
  if (!corpusId) die("Ultravox returned no corpus id", JSON.stringify(data));
  return corpusId;
}

async function uploadUltravoxSource(corpusId, file) {
  const res = await fetch(
    `https://api.ultravox.ai/api/corpora/${corpusId}/sources`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ULTRAVOX_KEY,
      },
      body: JSON.stringify({
        // Ultravox accepts textual sources as `documents` or file uploads;
        // this shape provides both a name + inline content.
        source: {
          documents: {
            documents: [
              {
                name: file.name,
                mimeType: "text/markdown",
                content: file.content,
              },
            ],
          },
        },
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    console.warn(
      `  ! upload failed for ${file.name} (${res.status}): ${body.slice(0, 200)}`
    );
    return false;
  }
  return true;
}

// -------- Write lib/brand.ts --------
function writeBrand({ name, slug, homepage, corpusId }) {
  const target = path.join(ROOT, "lib", "brand.ts");
  const body = `// Auto-generated by scripts/create-demo.mjs on ${new Date().toISOString()}.
// Swap this file by running \`npm run demo:new -- --url <homepage> --name "<Bank>"\`.

export type BrandConfig = {
  name: string;
  slug: string;
  homepage: string;
  ultravoxCorpusId: string | null;
};

export const BRAND: BrandConfig = {
  name: ${JSON.stringify(name)},
  slug: ${JSON.stringify(slug)},
  homepage: ${JSON.stringify(homepage)},
  ultravoxCorpusId: ${JSON.stringify(corpusId)},
};
`;
  fs.writeFileSync(target, body);
}

// -------- Main --------
(async () => {
  console.log(`\n=== Creating demo for ${NAME_ARG} (${URL_ARG}) ===\n`);

  const docs = await firecrawlCrawl(URL_ARG, LIMIT);
  log(`Firecrawl: ${docs.length} pages returned`);

  const files = toKbFiles(docs);
  log(`Prepared ${files.length} KB files`);
  if (files.length === 0) die("No usable pages found — try a higher --limit or a different URL");

  const backup = backupExistingKb();
  if (backup) log(`Backed up previous kb/ to ${path.relative(ROOT, backup)}`);
  writeKbFiles(files);
  log(`Wrote ${files.length} files to kb/`);

  const corpusId = await createUltravoxCorpus(NAME_ARG);
  log(`Ultravox: corpus id = ${corpusId}`);

  let ok = 0;
  for (const f of files) {
    if (await uploadUltravoxSource(corpusId, f)) ok += 1;
    process.stdout.write(`\r  uploaded ${ok}/${files.length} sources   `);
  }
  process.stdout.write("\n");
  log(`Ultravox: ${ok}/${files.length} sources uploaded`);

  writeBrand({
    name: NAME_ARG,
    slug: SLUG_ARG,
    homepage: URL_ARG,
    corpusId,
  });
  log(`Updated lib/brand.ts`);

  console.log(`\n✔ Demo ready.`);
  console.log(`  Chat: reads local kb/*.md`);
  console.log(`  Voice: queries Ultravox corpus ${corpusId}`);
  console.log(`  Test:  npm run dev  →  http://localhost:3000`);
  console.log(`  Ship:  git add -A && git commit -m "Demo: ${NAME_ARG}" && npx vercel --prod\n`);
})();
