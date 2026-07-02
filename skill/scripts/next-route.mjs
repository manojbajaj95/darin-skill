/**
 * Next session setup — latest insights session + roadmap for handoff.
 */
import fs from 'node:fs';
import path from 'node:path';
import { listInsightSessions } from './lib/insights-sessions.mjs';
import {
  LEGACY_QUEUE_PATH,
  ROADMAP_PATH,
  readLegacyQueue,
  readRoadmapSummary,
  roadmapIsStale,
} from './lib/roadmap.mjs';
import { parsePathArgs, workspaceRoot } from './lib/paths.mjs';

function parseNextArgs(argv) {
  const base = parsePathArgs(argv);
  const out = { ...base, override: '', cwd: process.cwd() };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--override' && argv[i + 1]) out.override = argv[++i];
    else if (a === '--cwd' && argv[i + 1]) out.cwd = path.resolve(argv[++i]);
    else if (!a.startsWith('--')) out.override += `${out.override ? ' ' : ''}${a}`;
  }
  return out;
}

const args = parseNextArgs(process.argv);
const storageRoot = workspaceRoot(args);
const override = args.override.trim();

if (!storageRoot) {
  const err = {
    error: 'NO_ACTIVE_WORKSPACE',
    message: 'Run `/darin init` or set active_workspace in ~/.darin/config.json',
  };
  if (args.json) console.log(JSON.stringify(err, null, 2));
  else console.error(err.message);
  process.exit(1);
}

const sessions = listInsightSessions(storageRoot);
const latest = sessions[0] || null;
const roadmapAbs = path.join(storageRoot, ROADMAP_PATH);
const roadmap = readRoadmapSummary(roadmapAbs);
const legacyQueueAbs = path.join(storageRoot, LEGACY_QUEUE_PATH);
const legacy_queue = readLegacyQueue(legacyQueueAbs);
const needs_roadmap = roadmapIsStale(roadmap, latest?.mtime ?? 0);

const activeItem = roadmap.now?.item
  ? {
      item: roadmap.now.item,
      source_suggestion: roadmap.now.source_suggestion,
      brief: roadmap.now.brief,
      status: roadmap.now.status,
    }
  : roadmap.top_queued
    ? {
        item: roadmap.top_queued.item,
        source_suggestion: roadmap.top_queued.source_suggestion,
        brief: roadmap.top_queued.brief,
        status: 'queued',
      }
    : null;

const needs_plan = activeItem && (!activeItem.brief || activeItem.brief === '—');

const result = {
  workspace_root: storageRoot,
  cwd: args.cwd,
  override: override || null,
  roadmap_path: ROADMAP_PATH,
  roadmap,
  legacy_queue,
  needs_roadmap,
  needs_plan,
  active_item: activeItem,
  top_queued: roadmap.top_queued,
  has_active_handoff: roadmap.has_active_handoff,
  latest_insights_dir: latest?.session_dir || null,
  index_path: latest?.index_path || null,
  insight_files: latest?.insight_files.map(f => `${latest.session_dir}/${f}`) || [],
  sessions_count: sessions.length,
};

if (!latest) {
  result.error = 'NO_INSIGHTS';
  result.message = 'Run `/darin insights` first — next works from suggestions and the roadmap.';
}

if (args.json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Workspace: ${storageRoot}`);
  console.log(`Roadmap: ${roadmapAbs}`);
  if (legacy_queue) console.log(`Legacy queue: ${legacyQueueAbs} (migrate on next)`);
  if (latest) {
    console.log(`Latest insights: ${path.join(storageRoot, latest.session_dir)}`);
    console.log(`Suggestions: ${latest.insight_files.length}`);
    console.log(`Needs roadmap: ${needs_roadmap}`);
  } else {
    console.log(result.message);
  }
  if (override) console.log(`Override: ${override}`);
}

if (!latest) process.exit(1);
