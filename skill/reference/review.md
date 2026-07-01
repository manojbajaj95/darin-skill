# Review flow

Weekly maintenance sweep. Run every Friday.

## Checks

Use `node {{scripts_path}}/context-signals.mjs` — fold JSON into the report. Report all of this in plain language (no jargon):

1. **Stale bets** — `hypotheses.stale` (things you're tracking but haven't revisited in 30+ days) → flag to revisit, drop, or archive
2. **Drift from your goals** — recent `ingestion.recent` vs `STRATEGY.md` → surface any tension
3. **Focus vs. what shipped** — does recent work actually match what you said you're focused on in `STRATEGY.md`? Say so plainly if not; don't smooth it over.
4. **Missing success metrics** — `maintenance.decisionDebt` (things you're building with no way to tell if they worked)
5. **Unfiled notes** — `ingestion.adhocBacklog` → resolve same session
6. **Open tensions** — `maintenance.openTensions` (unresolved conflicts; `stale` if goals untouched 30+ days)

## Output

One page to user + append summary to `<workspace_root>/maintenance/log/YYYY-MM-DD.md`:

```markdown
# Weekly review — [date]

## This week (wins + signals)
## Drifting (needs PM call)
## For next week (3 actions max)
```

Fix broken internal links if found. Do not archive without PM confirmation.
