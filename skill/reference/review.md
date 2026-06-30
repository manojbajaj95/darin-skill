# Review flow

Weekly maintenance sweep. Run every Friday.

## Checks

1. **Stale hypotheses** — active, no new evidence in 30+ days → flag revive/demote/archive
2. **Strategy drift** — recent ingestion or proposals diverging from `STRATEGY.md` → surface tension
3. **Stakeholder cadence** — high-influence stakeholders not touched in 3+ weeks
4. **Decision debt** — shaped features with no hypothesis file or success metric
5. **Ingestion backlog** — `ingestion/adhoc/` items not routed → resolve same session
6. **Open tensions** — `STRATEGY.md § Open tensions` stale or resolved but not closed

Run:

```bash
node {{scripts_path}}/context-signals.mjs
```

Fold JSON into the report.

## Output

One page to user + append summary to `<workspace_root>/maintenance/log/YYYY-MM-DD.md`:

```markdown
# Weekly review — [date]

## This week (wins + signals)
## Drifting (needs PM call)
## For next week (3 actions max)
```

Fix broken internal links if found. Do not archive without PM confirmation.
