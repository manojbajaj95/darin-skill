# Review flow

Weekly maintenance sweep. Run every Friday.

## Checks

Use `node {{scripts_path}}/context-signals.mjs` — fold JSON into the report:

1. **Stale hypotheses** — `hypotheses.stale` (30+ days) → flag revive/demote/archive
2. **Strategy drift** — recent `ingestion.recent` vs `STRATEGY.md` → surface tension
3. **Stakeholder cadence** — `stakeholders.stale` (21+ days without touch) → schedule `prep`
4. **Decision debt** — `maintenance.decisionDebt` (hypotheses missing metrics, specs without hypothesis files)
5. **Ingestion backlog** — `ingestion.adhocBacklog` → resolve same session
6. **Open tensions** — `maintenance.openTensions` (unresolved items; `stale` if strategy untouched 30+ days)

Also scan `decisions/` for commitments missing reversal conditions.

## Output

One page to user + append summary to `<workspace_root>/maintenance/log/YYYY-MM-DD.md`:

```markdown
# Weekly review — [date]

## This week (wins + signals)
## Drifting (needs PM call)
## For next week (3 actions max)
```

Fix broken internal links if found. Do not archive without PM confirmation.
