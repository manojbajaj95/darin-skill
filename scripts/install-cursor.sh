#!/usr/bin/env bash
# Sync skill/ source into .cursor/skills/darin/ (Cursor working copy)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec node "$ROOT/scripts/build.mjs" --providers=cursor
