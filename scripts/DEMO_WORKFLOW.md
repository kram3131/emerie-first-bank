# Per-prospect demo workflow

Turn any bank or credit union's homepage URL into a working chat + voice demo
grounded in that bank's own scraped content, deployed to its own Vercel URL —
without touching the Emerie production demo.

## One-time setup (per operator machine)

You need three API keys. All three go into the demo folder's `.env.local`
(created below, per prospect — do NOT put them in the template repo's
`.env.local` unless you're also running Emerie locally).

- `ULTRAVOX_API_KEY` — same key that runs Emerie voice
- `ANTHROPIC_API_KEY` — same key that runs Emerie chat
- `FIRECRAWL_API_KEY` — get one at https://firecrawl.dev/dashboard (only used
  by the CLI, never at runtime)

## Per-prospect workflow

Assume the prospect is "First Commercial Bank" with homepage
`https://firstcommercial.com`. Adjust the slug and name as needed.

### 1. Clone template into a new folder

```bash
git clone https://github.com/kram3131/emerie-first-bank.git \
  ~/Desktop/bank-demos/first-commercial

cd ~/Desktop/bank-demos/first-commercial
npm install
```

### 2. Create `.env.local` in the new folder

```
FIRECRAWL_API_KEY=fc-xxxxxxxx
ULTRAVOX_API_KEY=xxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

### 3. Scrape + wire up

```bash
npm run demo:new -- \
  --url https://firstcommercial.com \
  --name "First Commercial Bank" \
  --slug first-commercial
```

This:

- Crawls the site with Firecrawl (default limit: 40 pages)
- Backs up the previous `kb/` to `.kb-backups/<timestamp>/`
- Writes fresh scraped markdown to `kb/`
- Creates a new Ultravox corpus and uploads each markdown file as a source
- Rewrites `lib/brand.ts` with the new bank's name, slug, homepage, and
  the new Ultravox corpus id (voice route flips to `queryCorpus` RAG
  automatically)

### 4. Test locally

```bash
npm run dev  # → http://localhost:3000
```

Log in with `emerie2026` (universal demo password), open chat, ask a
product-specific question ("what are your CD rates?", "what's your minimum
opening deposit for checking?"). Then toggle to Talk and ask the same —
voice will hit Ultravox's hosted corpus and read back the same content.

### 5. Ship to its own Vercel project

```bash
# Create a fresh GitHub repo for this prospect
gh repo create emerie-demo-first-commercial --private --source=. --push

# Link a fresh Vercel project (NOT the Emerie one)
npx vercel link --yes --project emerie-demo-first-commercial

# Add env vars to that Vercel project
npx vercel env add ANTHROPIC_API_KEY production
npx vercel env add ULTRAVOX_API_KEY production

# Deploy
npx vercel --prod --yes
```

Result: a URL like `emerie-demo-first-commercial.vercel.app` you can share
with the prospect. Emerie's repo, deployment, corpus, and brand config are
untouched.

## Safety guardrails

The CLI **refuses to run** if it detects the Emerie template repo (checks
git remote, working directory name, and current brand.ts slug). Pass
`--force` only if you really intend to overwrite the template itself.

Every `demo:new` run backs up the previous `kb/` to `.kb-backups/`
(gitignored). If you scrape the wrong site, you can restore from there.

## Cleanup after a prospect meeting

Nothing required — the demo just sits at its Vercel URL. If you want to
retire it:

- Vercel: pause or delete the project
- GitHub: archive the repo
- Ultravox: delete the corpus from the dashboard

None of this affects Emerie.
