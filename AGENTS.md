# AGENTS.md

Quick orientation for AI agents working in this repo.

## What Darin is

Darin is an AI product-manager **skill** you run inside an AI harness (Cursor, Claude Code, Codex, Gemini, …). It helps small teams capture what they learn and decide what to build — without PM jargon. Five commands: `init`, `ingest`, `plan`, `prioritize`, `review`. User data lives as plain markdown in `~/.darin/` on the user's machine, never in this repo.

## Where things are

```
skill/            source of truth — edit here
  SKILL.src.md      main skill file (uses {{placeholders}}, expanded at build)
  reference/        one .md per command (init, ingest, plan, prioritize, review)
  templates/        PRODUCT.md, STRATEGY.md, feature-brief.md, hypothesis.md scaffolds
  scripts/          runtime .mjs the skill calls + command-metadata.json
scripts/          build + install tooling (build.mjs, install.mjs, lib/)
packages/cli/     the @getdarin/cli npm package (installer)
dist/             generated per-harness builds — do not edit
.cursor/ .claude/ …  generated working copies — do not edit
```

## Golden rule

**Edit `skill/`, never the generated copies.** `.cursor/skills/darin/`, `dist/`, etc. are all built from `skill/`. After editing, rebuild:

```bash
node scripts/build.mjs                # all harnesses → dist/
node scripts/build.mjs --also-cursor  # also refresh local .cursor working copy
```

## Good to know

- The commands table in `SKILL.md` **and** the `argument-hint` are generated from `skill/scripts/command-metadata.json` (its `order` array). Add/rename/remove a command there, not by hand.
- Reference files may use `{{scripts_path}}` — keep the placeholder; the build substitutes the right path per harness.
- Keep the tone plain-language for users. The internal folders (`hypotheses/`, `source/`, `ingestion/`) keep the rigor; the user never sees the jargon.
- More detail on contributing/releasing: `CONTRIBUTING.md`, `RELEASE.md`.
