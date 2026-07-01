# Insights flow

Compare product surface **in the codebase** to Darin memory. Codebase only — never fetch live URLs or use the browser.

## When to use

- "Does our landing page match our ICP?"
- "Review our pricing against strategy"
- "Is onboarding aligned with what customers told us?"

Not for internal memory hygiene — use `review` for that.

## Step 1: Route

Run with the user's phrase (everything after `insights`):

```bash
node {{scripts_path}}/insights-route.mjs --json --target "landing page"
```

Optional: `--cwd` if not the repo root. Optional: `--recipe landing` to force a recipe.

If `recipe` is null, present `suggestions` (2–3 options) and ask which to run — do not auto-pick silently.

If `discovered_files` is empty, ask **one** question using `suggestion` (e.g. "Where does pricing live in this repo?"). Do not fall back to URLs.

## Step 2: Load memory

- `PRODUCT.md`, `STRATEGY.md` via `context.mjs`
- Grep `hypotheses/` and `ingestion/` for topics related to the recipe
- Read `reference/insights/<recipe>.md` for recipe-specific checks

If memory is thin, say so and suggest `ingest` before drawing hard conclusions.

## Step 3: Load surface (codebase only)

1. Read files from `discovered_files` (or user-provided path)
2. Trace user-visible copy: headings, body text, button labels, plan names, meta titles/descriptions
3. Ignore styling unless it hides meaning
4. Cite `path:line` for every surface claim

**Out of scope:** deployed pages, browser automation, pixel/design polish.

## Step 4: Cross-reference

Apply to every recipe:

1. **Audience fit** — surface voice vs `PRODUCT.md` Users
2. **Problem fit** — pain named vs value proposition in code
3. **Strategy alignment** — north star / current focus vs what the surface emphasizes
4. **Evidence tension** — customer language in `ingestion/` vs surface claims
5. **Bet coverage** — active `hypotheses/` not reflected (or contradicted) in UI/copy
6. **Open tensions** — surface promises something `STRATEGY.md § What you're not doing` excludes

Then apply checks from `reference/insights/<recipe>.md`.

## Step 5: Write report

Save to `<workspace_root>/<report_path>` using `templates/insights-report.md`.

Tell the user a short summary in plain language. End with **Decision needed** and **Suggested next step** (`plan`, `ingest`, or another recipe).

Propose updates to `hypotheses/` or `STRATEGY.md` only after asking the user — same line as ingest.

## Guardrails

- **Not a design review** — positioning and messaging, not pixels
- **Not a crawl SEO audit** — `seo` recipe reads meta in source; technical crawl → suggest `audit-website` if installed
- **Not `review`** — don't duplicate stale-hypothesis maintenance
