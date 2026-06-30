# Plan flow

Turn an objective into a six-block plan Darin can execute against.

Example: `/darin plan reduce onboarding drop-off 20% in Q3`

## Step 1: Load

- `PRODUCT.md`, `STRATEGY.md`
- All active `hypotheses/*.md`
- Recent `ingestion/` (last 30 days) relevant to the objective
- `node .cursor/skills/darin/scripts/context-signals.mjs` for stale hypotheses

## Step 2: Draft six blocks

```markdown
# Plan: [objective]

## 1. What we know
(Cite files. Observations vs interpretations separated.)

## 2. Assumptions vs evidence
| Claim | Type | Provenance |
|-------|------|------------|

## 3. Who to interview / talk to next
(Specific people or segments, with questions.)

## 4. Hypotheses to open or strengthen
(Link to hypothesis files or draft stubs.)

## 5. Experiments to run
(Lightweight probes: prototype, concierge, fake door, metric guardrail.)

## 6. Decision points
(What decision, by when, what evidence would unblock it.)
```

## Step 3: Strategy check

- Flag if the plan optimizes a local metric at the expense of north-star
- Flag if plan requires work listed in non-goals
- Surface stakeholder constraints from `stakeholders/`

## Step 4: Close

- **Decision needed from PM** (one clear ask)
- **Suggested next:** `prioritize`, `shape`, `spec`, or `ingest`

Do not collapse this into a generic roadmap slide. Specificity beats completeness.
