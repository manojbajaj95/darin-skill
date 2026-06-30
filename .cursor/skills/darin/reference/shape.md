# Shape flow

Turn a problem or opportunity into a scoped **feature brief** ready for `plan` or `spec`.

## Step 1: Load evidence

- `PRODUCT.md`, `STRATEGY.md`
- Run `node .cursor/skills/darin/scripts/context.mjs` if not already loaded this session
- Grep `ingestion/` and `hypotheses/` for the target topic
- If evidence is thin: ask 2–3 Mom Test-style questions before drafting

## Step 2: Check strategy fit

- Does this align with active bets in `STRATEGY.md`?
- Does it conflict with non-goals?
- If misaligned, say so and ask whether to proceed anyway (explicit override).

## Step 3: Write feature brief

Use `templates/feature-brief.md`. Save to `hypotheses/<feature-slug>.md` if this is a new bet, or update existing hypothesis file.

Required sections:

- Problem (evidence-backed, with citations)
- Opportunity / outcome
- MVP vs v1 vs out of scope
- Hypotheses to test (value, usability, feasibility, viability)
- Success metrics tied to north-star or input metrics
- Risks and open questions
- **Decision needed from PM**
- **Suggested next command**

## Step 4: Hand off

- If scope is clear and small → suggest `/darin spec <slug>`
- If discovery gaps remain → suggest `/darin discover` or `/darin ingest`
- If prioritization against other bets needed → `/darin prioritize`
