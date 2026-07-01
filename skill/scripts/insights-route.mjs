/**
 * Route insights target phrase → recipe + discover matching files in codebase.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePathArgs, workspaceRoot } from './lib/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECIPES = JSON.parse(fs.readFileSync(path.join(__dirname, 'insights-recipes.json'), 'utf8'));

const SKIP_DIRS = new Set(RECIPES.skip_dirs || ['node_modules', '.git', 'dist', 'build', '.next']);
const MAX_FILES = RECIPES.max_files || 8;
const RECIPE_IDS = RECIPES.order || Object.keys(RECIPES).filter(k => !['order', 'max_files', 'skip_dirs'].includes(k));

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseInsightsArgs(argv) {
  const base = parsePathArgs(argv);
  const out = { ...base, target: '', recipe: null, cwd: process.cwd() };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target' && argv[i + 1]) out.target = argv[++i];
    else if (a === '--recipe' && argv[i + 1]) out.recipe = argv[++i];
    else if (a === '--cwd' && argv[i + 1]) out.cwd = path.resolve(argv[++i]);
    else if (!a.startsWith('--')) out.target += `${out.target ? ' ' : ''}${a}`;
  }
  return out;
}

function globToRegExp(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '§§')
    .replace(/\*/g, '[^/]*')
    .replace(/§§/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

function matchesGlob(relPath, glob) {
  return globToRegExp(glob).test(relPath.replace(/\\/g, '/'));
}

function hasPathHint(relPath, hints) {
  if (!hints?.length) return true;
  const lower = relPath.toLowerCase();
  return hints.some(h => lower.includes(h.toLowerCase()));
}

function walkFiles(root, dir = root, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const ent of entries) {
    if (ent.name.startsWith('.') && ent.name !== '.') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walkFiles(root, full, files);
    } else if (ent.isFile()) {
      files.push(path.relative(root, full).replace(/\\/g, '/'));
    }
  }
  return files;
}

function scoreFile(relPath, recipe) {
  const lower = relPath.toLowerCase();
  let score = 0;
  for (const hint of recipe.path_hints || []) {
    if (lower.includes(hint.toLowerCase())) score += 3;
  }
  if (/\/page\.(tsx|jsx|html)$/i.test(relPath)) score += 2;
  if (/readme\.md$/i.test(relPath)) score += 1;
  return score;
}

function discoverFiles(cwd, recipe) {
  const all = walkFiles(cwd);
  const hits = [];
  for (const rel of all) {
    const globMatch = (recipe.globs || []).some(g => matchesGlob(rel, g));
    if (!globMatch) continue;
    if (!hasPathHint(rel, recipe.path_hints)) continue;
    hits.push({ path: rel, score: scoreFile(rel, recipe) });
  }
  hits.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
  return hits.slice(0, MAX_FILES).map(h => h.path);
}

function isRepoPath(target, cwd) {
  const resolved = path.resolve(cwd, target);
  try {
    fs.accessSync(resolved);
    return true;
  } catch {
    return false;
  }
}

function recipeFromPath(targetPath) {
  const lower = targetPath.toLowerCase();
  for (const id of RECIPE_IDS) {
    const recipe = RECIPES[id];
    if ((recipe.path_hints || []).some(h => lower.includes(h.toLowerCase()))) {
      return { recipe: id, confidence: 'path' };
    }
  }
  return null;
}

function recipeFromKeywords(text) {
  const lower = text.toLowerCase().trim();
  if (!lower) return null;

  let best = null;
  let bestLen = 0;
  for (const id of RECIPE_IDS) {
    for (const kw of RECIPES[id].keywords || []) {
      if (lower.includes(kw.toLowerCase()) && kw.length > bestLen) {
        best = id;
        bestLen = kw.length;
      }
    }
  }
  if (best) return { recipe: best, confidence: 'keyword' };
  return null;
}

function suggestRecipes(cwd) {
  const ranked = [];
  for (const id of RECIPE_IDS) {
    const files = discoverFiles(cwd, RECIPES[id]);
    if (files.length > 0) ranked.push({ recipe: id, file_count: files.length, sample: files.slice(0, 2) });
  }
  ranked.sort((a, b) => b.file_count - a.file_count);
  return ranked;
}

function reportPath(recipe) {
  return `insights/${today()}-${recipe}.md`;
}

const args = parseInsightsArgs(process.argv);
const storageRoot = workspaceRoot(args);
const cwd = args.cwd;
const target = args.target.trim();

if (!storageRoot) {
  const err = {
    error: 'NO_ACTIVE_WORKSPACE',
    message: 'Run `/darin init` or set active_workspace in ~/.darin/config.json',
  };
  if (args.json) console.log(JSON.stringify(err, null, 2));
  else console.error(err.message);
  process.exit(1);
}

let recipe = args.recipe;
let confidence = 'hint';
let discovered_files = [];
let suggestion = null;

if (args.recipe && RECIPE_IDS.includes(args.recipe)) {
  recipe = args.recipe;
  confidence = 'hint';
} else if (target && isRepoPath(target, cwd)) {
  const rel = path.relative(cwd, path.resolve(cwd, target)).replace(/\\/g, '/');
  const fromPath = recipeFromPath(rel);
  if (fromPath) {
    recipe = fromPath.recipe;
    confidence = fromPath.confidence;
  }
  discovered_files = [rel];
} else if (target) {
  const fromKw = recipeFromKeywords(target);
  if (fromKw) {
    recipe = fromKw.recipe;
    confidence = fromKw.confidence;
  }
}

if (!recipe) {
  const suggestions = suggestRecipes(cwd);
  const result = {
    recipe: null,
    confidence: 'none',
    source_type: 'codebase',
    discovered_files: [],
    suggestions,
    workspace_root: storageRoot,
    suggestion: suggestions.length
      ? `Found surfaces for: ${suggestions.slice(0, 3).map(s => s.recipe).join(', ')}. Pick one or name a recipe.`
      : 'No product surfaces found in this repo. Pass a file path or tell me where landing/pricing/onboarding lives.',
  };
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`Workspace: ${storageRoot}`);
    console.log('No recipe matched. Suggestions:');
    for (const s of suggestions) console.log(`  - ${s.recipe} (${s.file_count} files)`);
  }
  process.exit(0);
}

if (!discovered_files.length) {
  discovered_files = discoverFiles(cwd, RECIPES[recipe]);
}

if (!discovered_files.length) {
  suggestion = `No ${recipe} files found in ${cwd}. Where does ${recipe} live in this repo?`;
}

const result = {
  recipe,
  confidence,
  source_type: 'codebase',
  discovered_files,
  workspace_root: storageRoot,
  report_path: reportPath(recipe),
  cwd,
  ...(suggestion ? { suggestion } : {}),
};

if (args.json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Workspace: ${storageRoot}`);
  console.log(`Recipe: ${recipe} (${confidence})`);
  console.log(`Cwd: ${cwd}`);
  if (discovered_files.length) {
    console.log('Files:');
    for (const f of discovered_files) console.log(`  - ${f}`);
  } else {
    console.log(suggestion || 'No files discovered.');
  }
  console.log(`Report: ${path.join(storageRoot, result.report_path)}`);
}
