/**
 * Content integrity check.
 *
 *   node tools/check-content.mjs
 *
 * The course is authored as data, which means a typo in `/data` is a broken
 * experience rather than a syntax error. This catches the mistakes that are
 * easy to make and hard to see:
 *
 *   · a broken narrative chain — a beat whose `nextQuestion` is not the next
 *     beat's `question`. The handoff is the story; if it drifts, the reader
 *     watches a question form and then arrives somewhere else
 *   · beats out of order on the time axis
 *   · a `construct`, `chapterId`, `era` or mind-map parent that does not exist
 *   · a concept unlocked by no beat, or unlocked twice
 *
 * It runs the data files the same way the browser does, so it needs no build
 * and no test framework.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Load /data into a stand-in for the browser global the files attach to.
const sandbox = { window: { AIC: { data: {} } } };
createContext(sandbox);
for (const file of ['eras', 'chapters', 'beats', 'mindmap', 'glossary']) {
  runInContext(readFileSync(resolve(root, 'data', `${file}.js`), 'utf8'), sandbox, {
    filename: `data/${file}.js`
  });
}
const { eras, chapters, beats, mindmap, glossary } = sandbox.window.AIC.data;

// Constructs are declared by filename; reading the directory would miss a
// missing <script> tag, so trust index.html — that is what the browser loads.
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const constructIds = [...html.matchAll(/js\/scene\/constructs\/([a-z-]+)\.js/g)]
  .map((match) => match[1])
  .filter((id) => id !== 'kit');

const problems = [];
const fail = (message) => problems.push(message);

// ── the narrative chain ────────────────────────────────────────────────────
beats.forEach((beat, index) => {
  const next = beats[index + 1];
  if (!next) return;
  if (beat.nextQuestion !== next.question) {
    fail(
      `narrative chain broken between "${beat.id}" and "${next.id}":\n` +
      `      leaves with: ${JSON.stringify(beat.nextQuestion)}\n` +
      `      arrives at:  ${JSON.stringify(next.question)}`
    );
  }
});
const last = beats[beats.length - 1];
if (last && !last.nextQuestion) fail(`last beat "${last.id}" opens no question`);

// ── the time axis ──────────────────────────────────────────────────────────
beats.forEach((beat, index) => {
  if (typeof beat.depth !== 'number' || beat.depth < 0 || beat.depth > 1) {
    fail(`beat "${beat.id}" has depth ${beat.depth}, expected 0..1`);
  }
  if (index > 0 && beat.depth <= beats[index - 1].depth) {
    fail(`beat "${beat.id}" is not after "${beats[index - 1].id}" on the time axis`);
  }
});

// ── references ─────────────────────────────────────────────────────────────
const eraIds = new Set(eras.map((era) => era.id));
const chapterIds = new Set(chapters.map((chapter) => chapter.id));
const nodeIds = new Set(mindmap.nodes.map((node) => node.id));

beats.forEach((beat) => {
  if (!chapterIds.has(beat.chapterId)) fail(`beat "${beat.id}" → unknown chapter "${beat.chapterId}"`);
  if (!eraIds.has(beat.era)) fail(`beat "${beat.id}" → unknown era "${beat.era}"`);
  if (beat.construct && !constructIds.includes(beat.construct)) {
    fail(`beat "${beat.id}" → construct "${beat.construct}" is not loaded in index.html`);
  }
  if (!beat.coordinate) fail(`beat "${beat.id}" has no coordinate — it has no arrival`);
  ['discovery', 'concept', 'connection'].forEach((key) => {
    if (!beat.essential || !beat.essential[key]) fail(`beat "${beat.id}" is missing essential.${key}`);
  });
  (beat.mindmap || []).forEach((id) => {
    if (!nodeIds.has(id)) fail(`beat "${beat.id}" unlocks unknown mind-map node "${id}"`);
  });
});

chapters.forEach((chapter) => {
  if (!eraIds.has(chapter.era)) fail(`chapter "${chapter.id}" → unknown era "${chapter.era}"`);
});

glossary.forEach((entry) => {
  if (!chapterIds.has(entry.chapterId)) fail(`glossary "${entry.term}" → unknown chapter "${entry.chapterId}"`);
});

// ── the mind map ───────────────────────────────────────────────────────────
mindmap.nodes.forEach((node) => {
  if (node.parent && !nodeIds.has(node.parent)) fail(`mind-map node "${node.id}" → unknown parent "${node.parent}"`);
  if (node.era && !eraIds.has(node.era)) fail(`mind-map node "${node.id}" → unknown era "${node.era}"`);
});

// A concept is introduced exactly once. Its ancestors are implied by the tree,
// so re-listing a parent is not a shortcut — it is a claim that two stations
// both teach the same thing.
const unlocked = beats.flatMap((beat) => beat.mindmap || []);
[...new Set(unlocked)].forEach((id) => {
  const owners = beats.filter((beat) => (beat.mindmap || []).includes(id));
  if (owners.length > 1) {
    fail(`mind-map node "${id}" is introduced by more than one beat: ${owners.map((b) => b.id).join(', ')}`);
  }
});

// And every node the map declares should eventually be reachable.
const orphans = mindmap.nodes
  .filter((node) => !unlocked.includes(node.id))
  .map((node) => node.id);
if (orphans.length) {
  console.log(`  note: ${orphans.length} mind-map node(s) not yet unlocked by any beat — ${orphans.join(', ')}`);
}

// ── report ─────────────────────────────────────────────────────────────────
if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s) in /data\n`);
  problems.forEach((problem) => console.error(`  · ${problem}`));
  console.error('');
  process.exit(1);
}

console.log(
  `✓ content ok — ${beats.length} beats, ${chapters.length} chapters, ` +
  `${eras.length} eras, ${mindmap.nodes.length} mind-map nodes, narrative chain intact`
);
