# Init interview

Run this conversation during `init` Step 2. Ask in order; skip what the user already answered in chat. One question at a time when live; batch when the user pasted a full brief.

## 1. Product identity

- **Product name** — customer-facing name (for `manifest.json` `name`)
- **One-line description** — what it does in plain language
- **Stage** — `early` | `growth` | `mature` (see `reference/pm.md` for rigor by stage)

## 2. Users and problem

- **Who is the primary user?** — role, context, job to be done
- **What pain exists today?** — specific, not generic "inefficiency"
- **Why now?** — what changed (market, regulation, behavior, tech)

## 3. Vision and boundaries

- **Vision** — one paragraph: the world if this works
- **Anti-references** — products or patterns this should NOT become
- **Principles** — 2–3 decision heuristics the team actually uses

## 4. Strategy

- **North-star metric** — one metric + how it is defined
- **Current bets** — 2–3 things you are deliberately investing in this cycle
- **Non-goals** — explicitly out of scope (protects against scope creep)
- **Constraints** — team size, runway, platform, compliance, dependencies
- **Open tensions** — strategy vs reality conflicts to resolve (ok if empty)

## 5. Optional context

- **Linked repos** — paths to landing, API, mobile, monorepo (reference only; append to `manifest.json` `linked_repos`)
- **Known stakeholders** — names + influence (seed `stakeholders/<slug>.md` stubs if helpful)

## Write targets

Map answers into:

- `templates/PRODUCT.md` → `PRODUCT.md` (Stage, Users, Problem, Vision, Anti-references, Principles)
- `templates/STRATEGY.md` → `STRATEGY.md` (North-star, bets, non-goals, constraints, open tensions)

Do not invent facts. Mark gaps **Open question** and offer `/darin discover` or `/darin ingest` as follow-ups.
