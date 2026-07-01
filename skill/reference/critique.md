# Critique flow

Strategy alignment review: bets vs evidence vs work.

## Step 1: Load everything strategic

- `PRODUCT.md`, `STRATEGY.md`
- All active `hypotheses/*.md`
- Recent decisions in `decisions/` (if any)
- Optional: scan git changed files or user-supplied backlog

## Step 2: Score dimensions (qualitative)

| Dimension | Question |
|-----------|----------|
| Strategy clarity | Are bets and non-goals explicit? |
| Evidence quality | Do hypotheses have recent, tagged evidence? |
| Alignment | Does proposed/shipped work match bets? |
| Decision hygiene | Are commitments recorded with reversal conditions? |
| Stakeholder risk | Anyone high-influence and out of cadence? |

## Step 3: Report

```markdown
# Product critique — [date]

## Score summary (P0–P3 issues)
## P0: must fix before planning
## P1: fix this cycle
## P2: improve when able
## P3: polish

## Strategy tensions (preserved, not flattened)
## Recommended commands
```

Save optional snapshot to `<workspace_root>/critique/YYYY-MM-DD.md` (resolve via `workspace.mjs --json`).

P0 examples: no north-star, strategy vs shipped work gap, hypothesis with zero evidence driving roadmap.
