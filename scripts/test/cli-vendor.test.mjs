import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CLI_ROOT = path.join(REPO_ROOT, 'packages', 'cli');

test('published CLI vendor bundle installs standalone (no monorepo fallback)', () => {
  const prepack = spawnSync(process.execPath, [path.join(CLI_ROOT, 'scripts', 'prepack.mjs')], {
    cwd: CLI_ROOT,
    encoding: 'utf8',
  });
  assert.equal(prepack.status, 0, prepack.stderr);

  // Copy only what npm ships (bin/lib/vendor/package.json) into a dir with no
  // ancestor `scripts/lib`. This can only succeed via the vendor bundle —
  // exactly what a real `npx @getdarin/cli@latest install` gets after publish.
  const isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-cli-isolated-'));
  for (const entry of ['bin', 'lib', 'vendor', 'package.json']) {
    fs.cpSync(path.join(CLI_ROOT, entry), path.join(isolated, entry), { recursive: true });
  }

  const target = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-cli-install-'));
  const result = spawnSync(
    process.execPath,
    [
      path.join(isolated, 'bin', 'darin.mjs'),
      'install',
      '-y',
      '--target',
      target,
      '--providers=cursor',
    ],
    { encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(target, '.cursor', 'skills', 'darin', 'SKILL.md')));
});
