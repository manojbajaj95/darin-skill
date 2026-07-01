# Releasing

Automated with [release-please](https://github.com/googleapis/release-please) via [release-please-action](https://github.com/googleapis/release-please-action).

## How it works

1. Push [Conventional Commits](https://www.conventionalcommits.org/) to `main`
2. Release Please opens/updates a **Release PR** (`autorelease: pending`) with:
   - `packages/cli/CHANGELOG.md` updated
   - `packages/cli/package.json` version bumped
3. **Merge the Release PR** (squash-merge recommended)
4. Release Please tags `vX.Y.Z`, creates a **GitHub Release**, and CI publishes **`@getdarin/cli`** to npm

Release Please does **not** publish to npm itself — see `.github/workflows/release-please.yml` for the npm step.

## Commit prefixes

| Prefix | SemVer | Example |
|--------|--------|---------|
| `fix:` | patch | `fix: parse --target with spaces` |
| `feat:` | minor (patch if &lt;1.0.0) | `feat: add workspace list` |
| `feat!:` / `BREAKING CHANGE:` | major | `feat!: remove legacy installer` |
| `docs:`, `chore:`, `ci:` | hidden from changelog | `chore: update deps` |

## Force a version

```bash
git commit --allow-empty -m "chore: release 0.2.0" -m "Release-As: 0.2.0"
```

## Config files

| File | Purpose |
|------|---------|
| [`release-please-config.json`](release-please-config.json) | Releaser config ([manifest docs](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md)) |
| [`.release-please-manifest.json`](.release-please-manifest.json) | Current released versions |
| [`packages/cli/CHANGELOG.md`](packages/cli/CHANGELOG.md) | Auto-generated changelog |

## npm publishing

Uses [trusted publishing (OIDC)](https://docs.npmjs.com/trusted-publishers) — no `NPM_TOKEN` secret, no long-lived credential in the repo. Requires npm CLI ≥11.5.1 (bundled with Node 24, set in the workflow).

**One-time setup**, after the package exists on npm:

1. npmjs.com → package `@getdarin/cli` → **Settings → Trusted publishing** → GitHub Actions
2. Repo: `manojbajaj95/darin-skill`, workflow: `release-please.yml`, environment: blank

**Bootstrapping caveat:** OIDC cannot publish a package's first-ever version — npm requires the package to already exist before a trusted publisher can be attached to it. The very first `darin@x.y.z` must be published manually (`npm publish --access public --provenance` from a maintainer's machine, logged in with 2FA/OTP as needed). Every release after that goes through CI via OIDC.

## Troubleshooting

See [release-please troubleshooting](https://github.com/googleapis/release-please/blob/main/docs/troubleshooting.md).

- **No Release PR?** Need `feat:` or `fix:` commits since last release; check for stale `autorelease: pending` label on old PRs
- **Re-run:** Add `release-please:force-run` label to a merged PR, or re-run the workflow from Actions
