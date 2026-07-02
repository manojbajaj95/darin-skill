import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  commandHint,
  commandIds,
  loadCommandMetadata,
  renderCommandsTable,
} from '../lib/commands.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPTS = path.join(REPO_ROOT, 'skill', 'scripts');

test('command metadata has stable order and table rows', () => {
  const meta = loadCommandMetadata(REPO_ROOT);
  const ids = commandIds(meta);
  assert.equal(ids.length, 7);
  assert.ok(ids.includes('insights'));
  assert.ok(ids.includes('digest'));
  assert.ok(ids.includes('prioritize'));
  assert.equal(ids.indexOf('insights'), ids.indexOf('plan') + 1);
  assert.equal(ids.indexOf('digest'), ids.indexOf('insights') + 1);
  const table = renderCommandsTable(meta);
  assert.match(table, /`plan`/);
  assert.match(table, /`insights`/);
  assert.match(table, /`digest`/);
  assert.match(table, /reference\/plan\.md/);
  assert.match(table, /reference\/insights\.md/);
  assert.match(table, /reference\/digest\.md/);
  assert.equal(commandHint(meta).split(' · ').length, 7);
});

test('ingest-route fails without active workspace', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-test-'));
  const result = spawnSync(
    process.execPath,
    [path.join(SCRIPTS, 'ingest-route.mjs'), '--json', 'customer interview'],
    { env: { ...process.env, DARIN_HOME: home }, encoding: 'utf8' },
  );
  assert.notEqual(result.status, 0);
  const payload = JSON.parse(result.stdout || result.stderr);
  assert.equal(payload.error, 'NO_ACTIVE_WORKSPACE');
});

test('ingest-route maps interview shape to interviews directory', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-test-'));
  const root = path.join(home, 'workspaces', 'acme');
  fs.mkdirSync(path.join(root, 'source', 'interviews'), { recursive: true });
  fs.mkdirSync(path.join(root, 'ingestion', 'interviews'), { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  fs.writeFileSync(
    path.join(home, 'config.json'),
    JSON.stringify({ active_workspace: 'acme' }, null, 2),
  );

  const result = spawnSync(
    process.execPath,
    [path.join(SCRIPTS, 'ingest-route.mjs'), '--json', 'user research interview notes'],
    { env: { ...process.env, DARIN_HOME: home }, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.shape, 'interview');
  assert.match(payload.paths.source, /^source\/interviews\//);
  assert.match(payload.paths.ingestion, /^ingestion\/interviews\//);
});

test('context-signals reports maintenance fields', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-test-'));
  const root = path.join(home, 'workspaces', 'acme');
  fs.mkdirSync(path.join(root, 'hypotheses'), { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  fs.writeFileSync(path.join(home, 'config.json'), JSON.stringify({ active_workspace: 'acme' }, null, 2));
  fs.writeFileSync(path.join(root, 'PRODUCT.md'), '# Product\n');
  fs.writeFileSync(
    path.join(root, 'STRATEGY.md'),
    '# Strategy\n\n## Open tensions\n\n- Bet A vs capacity\n',
  );
  fs.writeFileSync(path.join(root, 'hypotheses', 'invite.md'), '# Invite\n\n## Problem\n\nx\n');

  const result = spawnSync(
    process.execPath,
    [path.join(SCRIPTS, 'context-signals.mjs')],
    { env: { ...process.env, DARIN_HOME: home }, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  const signals = JSON.parse(result.stdout);
  assert.equal(signals.maintenance.decisionDebt.missingMetrics.length, 1);
  assert.equal(signals.maintenance.openTensions.count, 1);
});

test('workspace scaffold creates features directory', async () => {
  const { ensureWorkspaceScaffold } = await import(
    path.join(REPO_ROOT, 'skill', 'scripts', 'lib', 'paths.mjs')
  );
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-test-'));
  const prev = process.env.DARIN_HOME;
  process.env.DARIN_HOME = home;
  try {
    const root = ensureWorkspaceScaffold('acme-test');
    assert.ok(fs.existsSync(path.join(root, 'features')));
    assert.ok(fs.existsSync(path.join(root, 'insights')));
    assert.ok(fs.existsSync(path.join(root, 'digests')));
  } finally {
    if (prev === undefined) delete process.env.DARIN_HOME;
    else process.env.DARIN_HOME = prev;
  }
});

test('insights-route fails without active workspace', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-test-'));
  const result = spawnSync(
    process.execPath,
    [path.join(SCRIPTS, 'insights-route.mjs'), '--json', '--target', 'landing page'],
    { env: { ...process.env, DARIN_HOME: home }, encoding: 'utf8' },
  );
  assert.notEqual(result.status, 0);
  const payload = JSON.parse(result.stdout || result.stderr);
  assert.equal(payload.error, 'NO_ACTIVE_WORKSPACE');
});

test('insights-route maps landing page to landing recipe', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-test-'));
  const root = path.join(home, 'workspaces', 'acme');
  fs.mkdirSync(root, { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  fs.writeFileSync(
    path.join(home, 'config.json'),
    JSON.stringify({ active_workspace: 'acme' }, null, 2),
  );
  fs.writeFileSync(path.join(root, 'PRODUCT.md'), '# Product\n');

  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-repo-'));
  const marketingDir = path.join(repo, 'app', '(marketing)');
  fs.mkdirSync(marketingDir, { recursive: true });
  fs.writeFileSync(path.join(marketingDir, 'page.tsx'), 'export default function Page() {}\n');

  const result = spawnSync(
    process.execPath,
    [
      path.join(SCRIPTS, 'insights-route.mjs'),
      '--json',
      '--target',
      'landing page',
      '--cwd',
      repo,
    ],
    { env: { ...process.env, DARIN_HOME: home }, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.recipe, 'landing');
  assert.equal(payload.source_type, 'codebase');
  assert.ok(payload.discovered_files.includes('app/(marketing)/page.tsx'));
  assert.match(payload.report_path, /^insights\/\d{4}-\d{2}-\d{2}-landing\.md$/);
});

test('digest fails without active workspace', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-test-'));
  const result = spawnSync(
    process.execPath,
    [path.join(SCRIPTS, 'digest.mjs'), '--json'],
    { env: { ...process.env, DARIN_HOME: home }, encoding: 'utf8' },
  );
  assert.notEqual(result.status, 0);
  const payload = JSON.parse(result.stdout || result.stderr);
  assert.equal(payload.error, 'NO_ACTIVE_WORKSPACE');
});

test('digest fails without PRODUCT.md', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-test-'));
  const root = path.join(home, 'workspaces', 'acme');
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(
    path.join(home, 'config.json'),
    JSON.stringify({ active_workspace: 'acme' }, null, 2),
  );

  const result = spawnSync(
    process.execPath,
    [path.join(SCRIPTS, 'digest.mjs'), '--json'],
    { env: { ...process.env, DARIN_HOME: home }, encoding: 'utf8' },
  );
  assert.notEqual(result.status, 0);
  const payload = JSON.parse(result.stdout || result.stderr);
  assert.equal(payload.error, 'NO_PRODUCT_MD');
});

test('digest is memory-only, filters by target, and reports thin scope', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-test-'));
  const root = path.join(home, 'workspaces', 'acme');
  fs.mkdirSync(path.join(root, 'hypotheses'), { recursive: true });
  fs.mkdirSync(path.join(root, 'ingestion', 'interviews'), { recursive: true });
  fs.writeFileSync(
    path.join(home, 'config.json'),
    JSON.stringify({ active_workspace: 'acme' }, null, 2),
  );
  fs.writeFileSync(path.join(root, 'PRODUCT.md'), '# Product\n');
  fs.writeFileSync(
    path.join(root, 'hypotheses', 'invite-friction.md'),
    'Status: worth watching\n\n## The bet\n\ninvite friction is slowing teams down\n',
  );
  fs.writeFileSync(
    path.join(root, 'ingestion', 'interviews', '2026-01-01-acme.md'),
    'Customer mentioned invite friction during onboarding.\n',
  );

  const result = spawnSync(
    process.execPath,
    [path.join(SCRIPTS, 'digest.mjs'), '--json', '--target', 'invite friction'],
    { env: { ...process.env, DARIN_HOME: home }, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.hypotheses.length, 1);
  assert.equal(payload.hypotheses[0].status, 'worth watching');
  assert.equal(payload.ingestion.length, 1);
  assert.equal(payload.thin, false);
  assert.match(payload.report_path, /^digests\/\d{4}-\d{2}-\d{2}-invite-friction\.md$/);
  assert.ok(fs.existsSync(path.join(root, 'digests')));

  const missResult = spawnSync(
    process.execPath,
    [path.join(SCRIPTS, 'digest.mjs'), '--json', '--target', 'pricing page'],
    { env: { ...process.env, DARIN_HOME: home }, encoding: 'utf8' },
  );
  assert.equal(missResult.status, 0, missResult.stderr);
  const missPayload = JSON.parse(missResult.stdout);
  assert.equal(missPayload.thin, true);
});

test('build expands commands table placeholder', async () => {
  const { buildProviderSkill } = await import('../lib/build-skill.mjs');
  const { PROVIDERS } = await import('../lib/providers.mjs');
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'darin-build-'));
  const skillDir = buildProviderSkill({ repoRoot: REPO_ROOT, provider: PROVIDERS.cursor, destRoot: out });
  const skill = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
  assert.match(skill, /`plan`/);
  assert.match(skill, /`insights`/);
  assert.doesNotMatch(skill, /\{\{commands_table\}\}/);
  assert.match(skill, /user-invocable: true/);
  assert.match(skill, /argument-hint:/);
});
