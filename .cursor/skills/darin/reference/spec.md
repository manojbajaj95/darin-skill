# Spec flow

Feature brief → shippable spec (PRD-lite).

## Prerequisite

Load `hypotheses/<slug>.md` or output from a prior `shape`. If missing, run `shape` first or ask user to confirm scope inline.

## Output structure

```markdown
# [Feature name]

## Context & problem
## Goals & non-goals
## User stories (Mike Cohn + Gherkin acceptance criteria)
## Success metrics
## Risks & edge cases
## Open questions (Assumption / Open question tags)
## Out of scope
```

## Rules

- Every story ties to a hypothesis or metric in STRATEGY.md
- Call out at least one anti-pattern risk in Risks section
- Tag gaps: **Assumption** or **Open question**
- Do not invent metrics user hasn't defined; flag as Open question

Save to `<workspace_root>/knowledge/product/features/<slug>.md` if user wants persistence.
