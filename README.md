# Darin · AI PM skill

**[GitHub](https://github.com/manojbajaj95/darin-skill)** · **[npm](https://www.npmjs.com/package/@getdarin/cli)**

Every team forgets why it built things. Someone makes a call in a meeting, or a Slack thread, or just decides alone at their desk, and a few months later nobody can explain the reasoning. So the debate happens again, or a feature gets ripped out and rebuilt for no good reason.

Darin is meant to fix that. It's a skill you run inside Cursor, Claude Code, Codex, Gemini CLI, or pretty much any AI tool that supports Agent Skills, not a separate app you have to remember to open. Feed it interviews, support tickets, or usage numbers, and it keeps track of what's an observation, what's a guess, and what's an actual decision. It also compares what you've actually built in your codebase — landing page, docs, onboarding — against that memory and surfaces gaps. When you sit down to plan a feature or rank the backlog, the full picture is already there with the reasoning attached.

There's nothing to sign up for. Everything gets saved as plain markdown files in `~/.darin/` on your own machine, and one workspace covers your whole product no matter how many repos you work across.

## Install for AI agents

Paste this into Cursor, Codex, or Claude Code:

```
Retrieve and follow the instructions at:
https://raw.githubusercontent.com/manojbajaj95/darin-skill/main/INSTALL_FOR_AGENTS.md
```

Full protocol: [INSTALL_FOR_AGENTS.md](INSTALL_FOR_AGENTS.md)

## Quick start

```bash
# Install the skill into your project (auto-detects harness)
npx @getdarin/cli@latest install

# Or from a clone of this repo
git clone https://github.com/manojbajaj95/darin-skill.git
cd darin-skill
node scripts/install.mjs -y
```

Then in your harness: **`/darin init`** → **`/darin ingest`** → **`/darin insights`** → **`/darin plan`**

### Quick aha

After init, try **`/darin insights docs`** on this README — Darin compares what the docs say to your `PRODUCT.md` and `STRATEGY.md` and surfaces misalignments. No customer interview required.

| Harness | Invoke |
|---------|--------|
| Cursor, Claude Code, Gemini | `/darin` |
| Codex CLI | `$darin` or `/skills` |

## How to work with Darin

### The problem

Small teams make product decisions constantly — in a customer call, a Slack thread, or just alone at a desk. The reasoning almost never gets written down. A few months later nobody remembers why a feature exists, so the same debate happens again, or something gets ripped out and rebuilt for no good reason.

### Why Darin

Most PM tools fix this by making you adopt a whole methodology — backlogs, frameworks, jargon. That's overkill for a small team, so the tool gets abandoned. Darin keeps the discipline (evidence, clear bets, knowing if something worked) but hides the jargon. You talk to it in plain language, and it quietly keeps the trail of what you learned and why you decided things. Everything is plain markdown on your own machine — nothing to sign up for.

### How you actually work with it

The whole thing is a simple loop: **capture what you learn, check what you ship, then plan what to build.**

1. **Set up once — `/darin init`.** Darin asks a few questions and writes down your north star and goals. This is what keeps later plans honest.
2. **Whenever you learn something — `/darin ingest`.** Stumbled across a customer call, a support ticket, a competitor move, or just a hunch? Hand it to Darin. It files it into memory and tells you what it might mean. If something's worth remembering long-term, it asks you first, in plain words — no "promote a hypothesis" ceremony.
3. **Check what you've built — `/darin insights`.** Point it at your landing page, docs, pricing, or onboarding in the repo. Darin compares the copy and flow to your product memory and flags misalignments.
4. **When you need to decide what to build — `/darin plan`.** Give it a problem or a goal. It pulls the relevant things you've captured and hands back a scoped brief: what to build now, what's next, what to skip, and how you'll know it worked.

Extras when you need them:

- **`/darin prioritize`** when you have competing work and need to order it.
- **`/darin review`** for a weekly check-in that flags stale evidence and anything drifting from your goals.

Not sure where to start? Just type **`/darin`** on its own and it'll suggest the next step based on what's going on in your project.

## Features

### Works across every repo, not just this one

Darin doesn't care which repo you're in. Give your product one workspace slug, and every repo that touches it (landing page, API, mobile app, monorepo) shares the same memory.

| Where you code | Same Darin workspace |
|----------------|----------------------|
| `~/acme/landing` | `acme` |
| `~/acme/api` | `acme` |
| `~/acme` (monorepo) | `acme` |

Set it with `active_workspace` in `~/.darin/config.json`, or `export DARIN_SLUG=acme` if you'd rather use an environment variable.

### Commands

| Command | Purpose |
|---------|---------|
| `/darin init` | Set up your workspace — north star and goals |
| `/darin ingest` | File something you learned into memory, or plan a customer call |
| `/darin plan` | Turn a problem or goal into a scoped brief: build now / next / skip |
| `/darin insights` | Compare codebase surfaces (landing, pricing, onboarding, …) to product memory |
| `/darin prioritize` | Quick way to order competing work (RICE, ICE, value/effort, …) |
| `/darin review` | Weekly check-in for stale evidence and drift from your goals |

Not sure where to start? Just type `/darin` on its own and it'll suggest what to run next based on what's going on in your project.

### Works the same everywhere

One `/darin` command routes to whichever playbook you need, so you're not memorizing a dozen different commands across a dozen different tools.

## Where data lives

Everything lives under `~/.darin/` on your own machine:

```
~/.darin/
├── config.json
└── workspaces/
    └── acme/
        ├── PRODUCT.md
        ├── STRATEGY.md
        ├── source/
        ├── ingestion/
        ├── hypotheses/
        └── insights/
```

None of this touches your git repos unless you specifically ask it to.

## Links

- **Repo:** [github.com/manojbajaj95/darin-skill](https://github.com/manojbajaj95/darin-skill)
- **npm:** [npmjs.com/package/@getdarin/cli](https://www.npmjs.com/package/@getdarin/cli)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Agent Skills spec:** [agentskills.io](https://agentskills.io/specification)
- **Changelog:** [packages/cli/CHANGELOG.md](packages/cli/CHANGELOG.md)
- **Website:** [getdarin.com](https://getdarin.com)

## License

Apache-2.0
