# Ingest flow

Route a new artifact into product memory. One verb, four shapes.

## Input

Transcript, file path, paste, screenshot description, URL, or chat note. Target comes from the invocation: `/darin ingest path/to/file.md` or pasted content.

## Step 1: Classify shape

Run `node {{scripts_path}}/ingest-route.mjs --json`. Write to **`paths.source_abs`** and **`paths.ingestion_abs`** (under `~/.darin/`), not the code repo.

If shape is ambiguous, ask **one** question. Do not guess.

| Shape | Examples |
|-------|----------|
| `interview` | Customer call, user research, sales discovery |
| `meeting` | 1:1, roadmap review, kickoff, retro |
| `market` | Competitor page, changelog, analyst note |
| `adhoc` | Slack insight, founder hunch, quick observation |

## Step 2: Load before writing

Resolve `workspace_root` via `workspace.mjs --json`, then load from there:

- `STRATEGY.md` at workspace root
- Active `hypotheses/*.md` that the artifact might touch
- Last 2–3 files in matching `ingestion/<shape>/`
- Relevant `stakeholders/<slug>.md` if a person is named

## Step 3: Write (in order)

1. **`source/<shape>/YYYY-MM-DD-<slug>.md`** — immutable copy of the original (or faithful transcript). Never edit after write.
2. **`ingestion/<shape>/YYYY-MM-DD-<slug>.md`** — synthesis with tagged observations:
   - `(observation)` — what was said or shown
   - `(interpretation)` — what it might mean
   - `(hypothesis)` — testable belief suggested
   - `(assumption)` — unstated belief to validate
3. **Durable updates (propose, confirm unless autonomy act):**
   - `hypotheses/<slug>.md` — new evidence rows
   - `stakeholders/<slug>.md` — touchpoint log
   - `knowledge/users/insights.md` — promoted recurring themes (create if needed)
   - `STRATEGY.md § Open tensions` — if strategy conflict surfaced

Every evidence row in durable files carries a provenance tag linking to `ingestion/` or `source/`.

## Step 4: Surface to user

Short routing summary (Type A output):

- Where the artifact landed
- 1–3 themes promoted or proposed for promotion
- Contradictions with prior evidence (preserved, not resolved)
- One open question if judgment is needed
- Suggested next: `shape`, `plan`, or `prep`

## Anti-patterns

- Do not promote one-off anecdotes to strategy without confirmation.
- Do not flatten dissenting interviews into consensus.
- Do not skip `source/` — audit trail is non-negotiable.
