# Darin

**Darin is your product manager** — an Impeccable-style Cursor skill for ingesting research, tracking hypotheses, and planning features with evidence-backed judgment.

Product memory lives in **`~/.darin/`** on your machine (markdown files, no database). Your code repos stay clean.

## Features

### Shared product insights across repos

One **workspace slug** = one product’s brain. Darin does **not** tie memory to a git repo, monorepo root, or folder path.

Use the same slug everywhere you work on that product:

| Where you code | Same Darin workspace |
|----------------|-------------------|
| `~/acme/landing` (marketing site) | `acme` |
| `~/acme/api` (backend) | `acme` |
| `~/acme/mobile` (app) | `acme` |
| `~/acme` (monorepo with all of the above) | `acme` |

Ingest a customer interview from the landing repo. Shape a feature in the API repo. Plan a roadmap in the monorepo. **Same PRODUCT.md, STRATEGY.md, hypotheses, and ingestion history** — because they all read `~/.darin/workspaces/acme/`.

Set `active_workspace` once in `~/.darin/config.json`, or export `DARIN_SLUG=acme` in your shell profile. Every repo picks up the same context.

### Ingestion and provenance

Route interviews, meetings, market signals, and ad-hoc notes into structured memory:

- **`source/`** — immutable originals (audit trail)
- **`ingestion/`** — synthesized observations with tags (observation, interpretation, hypothesis)
- **Provenance markers** on every durable claim — documented research vs verbal vs intuition

### Feature planning

Turn evidence into plans, not generic PRDs:

- **`/darin shape`** — scoped feature brief (MVP / v1 / out of scope)
- **`/darin plan`** — six-block plan (know, assume, interview, hypothesize, experiment, decide)
- **`/darin prioritize`** — adaptive framework pick (RICE, ICE, value/effort, …)
- **`/darin spec`** — PRD-lite with user stories

### Strategy alignment

- **`PRODUCT.md`** — users, problem, vision, stage, principles
- **`STRATEGY.md`** — north-star, bets, non-goals, open tensions
- **`/darin critique`** — bets vs evidence vs shipped work
- **`/darin review`** — weekly sweep for stale hypotheses and drift

### Workspace management

- **Readable slugs** you choose (`acme`, `mosaic`, `my-startup`) — no repo hashes
- **`/darin init`** lists existing workspaces and creates or activates one
- **Multiple products** — separate slug per product, switch with `--use <slug>`

### Agent-native (multi-harness)

- Single **`/darin`** router skill ( **`$darin`** on Codex) with lazy-loaded command playbooks
- Installs into **Cursor, Claude Code, Codex, Gemini CLI, GitHub Copilot**, and more via `scripts/install.mjs`
- Small **Node scripts** for context loading, workspace resolution, and ingest routing
- Pin shortcuts: `/darin pin plan` → `/plan`

## Where data lives

```
~/.darin/
├── config.json                 # active_workspace: "acme", autonomy mode
└── workspaces/
    └── acme/
        ├── manifest.json
        ├── PRODUCT.md
        ├── STRATEGY.md
        ├── source/
        ├── ingestion/
        ├── hypotheses/
        ├── stakeholders/
        └── knowledge/
```

Nothing product-related is written into your git repos unless you explicitly ask.

## Quick start

1. Install the skill into your harness (see [Install](#install-in-another-project)).
2. Enable Agent Skills in your tool (Cursor: Nightly → Rules; Gemini: `/settings` → Skills).

```bash
# From darin-agent repo — auto-detect harnesses in cwd, or pick explicitly:
node scripts/install.mjs --providers=cursor,claude,codex,gemini -y

# List products / pick active workspace (path varies by harness; Cursor example):
node .cursor/skills/darin/scripts/workspace.mjs --list

/darin init
# or: node .cursor/skills/darin/scripts/workspace.mjs --scaffold --slug acme
# or: node .cursor/skills/darin/scripts/workspace.mjs --use acme
```

3. From **any** repo for that product:

```
/darin ingest notes/customer-call.md
/darin shape invite-link friction
/darin plan improve activation in Q3
/darin review
```

## Multi-repo setup (example)

```bash
# Once, set your default product
echo '{ "active_workspace": "acme", "autonomy": "confirm" }' > ~/.darin/config.json

# Or per-shell in ~/.zshrc
export DARIN_SLUG=acme
```

Open landing, backend, or monorepo in Cursor — Darin loads the same workspace every time.

## Active workspace resolution

1. `--slug acme` on scripts  
2. `DARIN_SLUG` or `DARIN_WORKSPACE` env var  
3. `active_workspace` in `~/.darin/config.json`  
4. If exactly one workspace exists → use it  
5. Otherwise → `NO_ACTIVE_WORKSPACE` (run `--list`, then `--use <slug>`)

## Commands

| Command | Purpose |
|---------|---------|
| `/darin init` | List workspaces, pick or create slug, write PRODUCT/STRATEGY |
| `/darin ingest` | Route research into workspace memory |
| `/darin discover` | Plan a discovery interview |
| `/darin shape` | Problem → scoped feature brief |
| `/darin plan` | Objective → six-block plan |
| `/darin prioritize` | Framework recommendation |
| `/darin spec` | PRD-lite / user stories |
| `/darin prep` | Stakeholder meeting brief |
| `/darin critique` | Strategy alignment review |
| `/darin review` | Weekly maintenance sweep |

Bare `/darin` recommends next steps from project signals.

## CLI

```bash
node .cursor/skills/darin/scripts/workspace.mjs --list --json
node .cursor/skills/darin/scripts/workspace.mjs --use acme
node .cursor/skills/darin/scripts/workspace.mjs --json
node .cursor/skills/darin/scripts/context.mjs --slug acme
node .cursor/skills/darin/scripts/ingest-route.mjs --json --file ./note.md
```

## Config

`~/.darin/config.json`:

```json
{
  "autonomy": "confirm",
  "active_workspace": "acme",
  "version": "0.3.0"
}
```

| Key | Values |
|-----|--------|
| `active_workspace` | Slug shared across all repos for this product |
| `autonomy` | `confirm` (propose updates) or `act` (write without asking) |

## Install in another project

Darin follows the [Agent Skills](https://agentskills.io/specification) layout used by [Impeccable](https://github.com/pbakaus/impeccable) and other harnesses. One product workspace (`~/.darin/`) works across all of them.

### CLI installer (recommended)

From the darin-agent repo (clone first, or run from a checkout):

```bash
node scripts/install.mjs --target /path/to/your-repo --providers=cursor,claude,codex,gemini -y
```

| Provider | Project path | Invoke |
|----------|--------------|--------|
| Cursor | `.cursor/skills/darin/` | `/darin` |
| Claude Code | `.claude/skills/darin/` | `/darin` |
| Codex CLI | `.agents/skills/darin/` | `$darin` or `/skills` |
| Gemini CLI | `.gemini/skills/darin/` | `/darin` |
| GitHub Copilot | `.github/skills/darin/` | `/darin` |
| OpenCode, Pi, Kiro, Qoder, Trae, Rovo Dev | `.<harness>/skills/darin/` | `/darin` |

**Aliases:** `claude`, `codex`, `copilot`, `rovodev`. Omit `--providers` to auto-detect installed harness folders.

**Global install** (all projects for one harness):

```bash
node scripts/install.mjs --scope=global --providers=claude,codex -y
```

### Manual copy (single harness)

```bash
# Cursor
cp -R .cursor/skills/darin /path/to/other-repo/.cursor/skills/

# Claude Code
cp -R dist/claude-code/.claude /path/to/other-repo/

# Codex
cp -R dist/codex/.agents /path/to/other-repo/
```

Build `dist/` first: `node scripts/build.mjs`

Same `~/.darin/` home — shared insights follow you across repos and harnesses when `active_workspace` matches.

## Install for AI agents

Darin is designed to be installed by an AI agent. Paste this into Cursor, Codex, Claude Code, or any agent that can fetch URLs and run shell commands:

```
Retrieve and follow the instructions at:
INSTALL_FOR_AGENTS.md
```

If the agent is not already in this repo, use the raw URL once published:

```
Retrieve and follow the instructions at:
https://raw.githubusercontent.com/<org>/darin-agent/main/INSTALL_FOR_AGENTS.md
```

Full step-by-step protocol: [INSTALL_FOR_AGENTS.md](INSTALL_FOR_AGENTS.md) — skill copy, workspace scaffold, init interview, verify, optional pin shortcuts (~10 minutes, no API keys).

## Development

Edit `skill/`, then sync all harness builds:

```bash
node scripts/build.mjs              # all providers → dist/ + .cursor/skills/darin/
./scripts/install-cursor.sh         # cursor working copy only
node scripts/install.mjs --providers=cursor,claude -y   # deploy to cwd
```

## License

Apache-2.0
