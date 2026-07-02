# Digest flow

Sum up everything Darin already knows about the product — or one topic — from **memory only**. No codebase scan, no live surfaces.

## When to use

- "What do we know about invite friction?"
- "Sum up what we've learned this quarter"
- "What are we currently betting on?"

Not for comparing memory to what's actually shipped — use `insights` for that (it reads the codebase). Not for stale-evidence maintenance — use `review` for that (it flags what's gone stale, not what the evidence says).

## Step 1: Load memory

Run with the user's topic, if they gave one (everything after `digest`):

```bash
node {{scripts_path}}/digest.mjs --json --target "invite friction"
```

Omit `--target` to synthesize everything. This resolves the active workspace and returns:

- `product_path` / `strategy_path` — read these directly
- `hypotheses` — every hypothesis file, each with its `status` line, filtered to the target if one was given
- `ingestion` — matching ingestion notes across all shapes (interviews, meetings, market, adhoc), most recent first
- `thin` — true if nothing matched
- `report_path` — where to save the digest

If it reports `NO_ACTIVE_WORKSPACE` or `NO_PRODUCT_MD`, stop and follow `reference/init.md`.

If a target was given and `thin` is true, say so plainly and suggest `ingest` (to add evidence) or dropping the filter to see everything — don't force a synthesis out of nothing.

## Step 2: Read and synthesize

Read `PRODUCT.md`, `STRATEGY.md`, and every returned hypothesis/ingestion file. Group what you find into:

1. **Themes** — patterns repeated across 2+ sources
2. **Confirmed** — beliefs with solid, recent evidence behind them
3. **Open questions** — still a guess, thin evidence, or untested
4. **Contradictions** — evidence vs. evidence, or evidence vs. `STRATEGY.md`
5. **Bets status** — every hypothesis in scope and its current status, one line each

Cite every claim with the specific file (e.g. "per `ingestion/interviews/2026-01-01-acme.md`"). Never cite a codebase file here — that's out of scope for `digest`.

## Step 3: Write the digest

Save to `<workspace_root>/<report_path>` (from Step 1's output) using `templates/digest-report.md`.

Tell the user a short summary in plain language — this is the primary deliverable, the file is a record. End with **Decision needed** and **Suggested next step** (`plan`, `ingest`, `prioritize`, or `insights`).

## Guardrails

- **Memory only** — never read, grep, or scan the code repo; that's what `insights` is for
- **Don't invent consensus** — if sources disagree, say so; don't flatten three conversations into one tidy takeaway
- **Thin memory is a valid answer** — if there's not much to synthesize, say that and point at `ingest`, don't pad it out
