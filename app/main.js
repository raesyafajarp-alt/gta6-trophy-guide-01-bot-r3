// Leonida Platinum — boot and rendering.
//
// Fetches app/data/trophies.json, renders the checklist, the detail pane,
// the roadmap and the missables view, and wires the tracker controls
// (filters, search, spoiler setting, saved progress, export and import).
// The app fetches one local file and nothing else, and works with the
// network off once it is loaded.

import { loadEarned, saveEarned, loadSpoilersHidden, saveSpoilersHidden, exportProgress, parseImportedProgress } from './store.js';
import { ROADMAP_STAGES, KIND_FILTERS, KIND_LABELS, GRADE_LABELS, missableReasons } from './roadmap.js';

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const detailEl = $('detailPane');
const roadmapEl = $('roadmapView');
const missablesEl = $('missablesView');
const emptyNote = $('emptyNote');

// Demo seeding for screenshots: ?demo=1 marks a fixed set of 13 trophies
// earned in memory only, so the screenshots show the tracker part-way
// through a playthrough. It never writes to localStorage, and a plain
// open of the guide (no ?demo) starts empty.
const DEMO_EARNED = [2, 3, 4, 8, 10, 16, 21, 28, 35, 42, 44, 46, 55];

const state = {
  trophies: [],
  sources: {},
  earned: loadEarned(),
  spoilersHidden: loadSpoilersHidden(),
  kind: '',
  grade: '',
  search: '',
  earnedOnly: false,
  view: 'checklist',
  selectedId: null,
};

const params = new URLSearchParams(location.search);
if (params.get('demo') === '1') {
  for (const id of DEMO_EARNED) state.earned.add(id);
}
if (params.get('spoilers') === 'on') state.spoilersHidden = true;

// A story trophy the reader has not earned yet is a spoiler while the
// spoiler setting is on: its name and description stay hidden until earned.
function isSpoilerHidden(trophy) {
  return (
    state.spoilersHidden &&
    (trophy.kind === 'story' || trophy.kind === 'mission') &&
    !state.earned.has(trophy.id)
  );
}

function displayName(trophy) {
  return isSpoilerHidden(trophy) ? 'Hidden story trophy' : trophy.name;
}

function displayDescription(trophy) {
  return isSpoilerHidden(trophy)
    ? 'Hidden until earned — turn the spoiler setting off to read it.'
    : trophy.description;
}

function gradeMark(grade) {
  return { platinum: '◆', gold: '●', silver: '●', bronze: '●' }[grade] ?? '●';
}

function trophyMatches(trophy) {
  if (state.kind === '__missable' && !trophy.missable) return false;
  if (state.kind && state.kind !== '__missable' && trophy.kind !== state.kind) return false;
  if (state.grade && trophy.grade !== state.grade) return false;
  if (state.earnedOnly && !state.earned.has(trophy.id)) return false;
  if (state.search) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(state.search.toLowerCase())) return false;
  }
  return true;
}

function renderTotals() {
  const earned = state.earned.size;
  $('earnedCount').textContent = earned;
  $('progressFill').style.width = `${Math.round((earned / 55) * 100)}%`;
  const byGrade = {};
  for (const t of state.trophies) {
    if (state.earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  }
  $('medalCounts').textContent =
    `1 platinum · 2 gold · 6 silver · 46 bronze — earned: ` +
    `${byGrade.platinum ?? 0} platinum, ${byGrade.gold ?? 0} gold, ${byGrade.silver ?? 0} silver, ${byGrade.bronze ?? 0} bronze`;
}

function renderKindChips() {
  const chips = $('kindChips');
  chips.innerHTML = '';
  for (const filter of KIND_FILTERS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip' + (state.kind === filter.key ? ' active' : '');
    button.textContent = filter.label;
    button.setAttribute('aria-pressed', state.kind === filter.key ? 'true' : 'false');
    button.addEventListener('click', () => {
      state.kind = filter.key;
      renderAll();
    });
    chips.appendChild(button);
  }
}

function renderList() {
  listEl.innerHTML = '';
  const shown = state.trophies.filter(trophyMatches);
  emptyNote.hidden = shown.length !== 0;
  for (const trophy of shown) {
    const item = document.createElement('li');
    item.className = 'trophy' + (state.earned.has(trophy.id) ? ' earned' : '');
    if (state.selectedId === trophy.id) item.classList.add('selected');
    item.dataset.id = trophy.id;

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = state.earned.has(trophy.id);
    check.setAttribute('aria-label', `Mark ${displayName(trophy)} earned`);
    check.addEventListener('change', () => toggleEarned(trophy.id, check.checked));

    const body = document.createElement('button');
    body.type = 'button';
    body.className = 'trophy-body';
    body.addEventListener('click', () => selectTrophy(trophy.id));

    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = displayName(trophy);

    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(trophy);

    const meta = document.createElement('span');
    meta.className = 'trophy-meta';
    const grade = document.createElement('span');
    grade.className = `grade grade-${trophy.grade}`;
    grade.textContent = `${gradeMark(trophy.grade)} ${GRADE_LABELS[trophy.grade]}`;
    meta.append(grade);
    const kind = document.createElement('span');
    kind.className = 'kind';
    kind.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
    meta.append(kind);
    if (trophy.missable) {
      const flag = document.createElement('span');
      flag.className = 'flag-missable';
      flag.textContent = 'Missable';
      meta.append(flag);
    }
    if (trophy.target != null) {
      const target = document.createElement('span');
      target.className = 'target';
      target.textContent = `Target: ${Number(trophy.target).toLocaleString('en-US')}`;
      meta.append(target);
    }

    body.append(name, desc, meta);
    item.append(check, body);
    listEl.appendChild(item);
  }
  const note = $('filterNote');
  note.textContent = shown.length === state.trophies.length
    ? `Showing all ${shown.length} trophies.`
    : `Showing ${shown.length} of ${state.trophies.length} trophies.`;
}

function sourceLinks(trophy) {
  const wrap = document.createElement('div');
  wrap.className = 'sources';
  const label = document.createElement('span');
  label.className = 'sources-label';
  label.textContent = 'Sources: ';
  wrap.append(label);
  (trophy.sources ?? []).forEach((key, index) => {
    const source = state.sources[key];
    if (!source) return;
    if (index > 0) wrap.append(document.createTextNode(' · '));
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.label;
    link.target = '_blank';
    link.rel = 'noopener';
    wrap.append(link);
  });
  const note = document.createElement('p');
  note.className = 'sources-note';
  note.textContent =
    'Guide method: our own reading of the official description above. Where a place or step is not pinned down in the description, the guide says so.';
  wrap.append(note);
  return wrap;
}

function renderDetail() {
  detailEl.innerHTML = '';
  const trophy = state.trophies.find((t) => t.id === state.selectedId);
  if (!trophy) {
    const hint = document.createElement('p');
    hint.className = 'detail-empty';
    hint.textContent = 'Pick a trophy from the list to read its guide and sources.';
    detailEl.append(hint);
    return;
  }
  const hidden = isSpoilerHidden(trophy);

  const heading = document.createElement('h2');
  heading.textContent = displayName(trophy);
  detailEl.append(heading);

  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.textContent =
    `${GRADE_LABELS[trophy.grade]} · ${KIND_LABELS[trophy.kind] ?? trophy.kind}` +
    (trophy.missable ? ' · Missable' : '') +
    (trophy.target != null ? ` · Target: ${Number(trophy.target).toLocaleString('en-US')}` : '');
  detailEl.append(meta);

  const quote = document.createElement('blockquote');
  quote.textContent = `“${displayDescription(trophy)}” — official description`;
  detailEl.append(quote);

  if (!hidden) {
    const guideHeading = document.createElement('h3');
    guideHeading.textContent = 'Guide';
    detailEl.append(guideHeading);
    const guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = trophy.guide;
    detailEl.append(guide);
    detailEl.append(sourceLinks(trophy));
  } else {
    const note = document.createElement('p');
    note.className = 'guide-text';
    note.textContent =
      'This is a story trophy you have not earned yet, and the spoiler setting is hiding it. Earn it in the game, or turn the spoiler setting off, to read its guide.';
    detailEl.append(note);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'earned-toggle';
  toggle.textContent = state.earned.has(trophy.id) ? '✓ Earned — click to unmark' : 'Mark as earned';
  toggle.addEventListener('click', () => toggleEarned(trophy.id, !state.earned.has(trophy.id)));
  detailEl.append(toggle);
}

function renderRoadmap() {
  roadmapEl.innerHTML = '';
  const intro = document.createElement('p');
  intro.className = 'roadmap-intro';
  intro.textContent =
    'The road to the platinum, built from the official descriptions: story first, side strands second, collectibles third, the activity grinds last. Click any trophy to read its guide.';
  roadmapEl.append(intro);
  for (const stage of ROADMAP_STAGES) {
    const block = document.createElement('section');
    block.className = 'stage';
    const heading = document.createElement('h3');
    heading.textContent = `Stage ${stage.stage} — ${stage.title}`;
    block.append(heading);
    const summary = document.createElement('p');
    summary.textContent = stage.summary;
    block.append(summary);
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const id of stage.trophyIds) {
      const trophy = state.trophies.find((t) => t.id === id);
      if (!trophy) continue;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'stage-chip' + (state.earned.has(id) ? ' earned' : '');
      chip.textContent = `${state.earned.has(id) ? '✓ ' : ''}${displayName(trophy)}`;
      chip.addEventListener('click', () => selectTrophy(id));
      chips.append(chip);
    }
    block.append(chips);
    const tip = document.createElement('p');
    tip.className = 'stage-tip';
    tip.textContent = `Tip: ${stage.tip}`;
    block.append(tip);
    roadmapEl.append(block);
  }
}

function renderMissables() {
  missablesEl.innerHTML = '';
  const intro = document.createElement('p');
  intro.className = 'roadmap-intro';
  intro.textContent =
    'Seven trophies can be missed in a playthrough — six named story missions and the stranger strands. Everything else can be finished after the story. Do these when they appear; the official descriptions promise no replay.';
  missablesEl.append(intro);
  const reasons = missableReasons();
  for (const trophy of state.trophies.filter((t) => t.missable)) {
    const block = document.createElement('section');
    block.className = 'missable-card' + (state.earned.has(trophy.id) ? ' earned' : '');
    const heading = document.createElement('h3');
    heading.textContent = displayName(trophy);
    block.append(heading);
    const reason = document.createElement('p');
    reason.textContent = reasons.get(trophy.id) ?? '';
    block.append(reason);
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'stage-chip';
    open.textContent = 'Read the guide';
    open.addEventListener('click', () => selectTrophy(trophy.id));
    block.append(open);
    missablesEl.append(block);
  }
}

function renderViews() {
  listEl.hidden = state.view !== 'checklist';
  roadmapEl.hidden = state.view !== 'roadmap';
  missablesEl.hidden = state.view !== 'missables';
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === state.view);
  });
  if (state.view === 'roadmap') renderRoadmap();
  if (state.view === 'missables') renderMissables();
}

function renderAll() {
  renderTotals();
  renderKindChips();
  renderList();
  renderDetail();
  renderViews();
}

function toggleEarned(id, earned) {
  if (earned) state.earned.add(id);
  else state.earned.delete(id);
  saveEarned(state.earned);
  renderAll();
}

function selectTrophy(id) {
  state.selectedId = id;
  state.view = 'checklist';
  renderAll();
  detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setView(view) {
  state.view = view;
  renderViews();
}

function wireControls() {
  $('searchInput').addEventListener('input', (event) => {
    state.search = event.target.value.trim();
    renderList();
  });
  $('gradeFilter').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderList();
  });
  $('earnedOnly').addEventListener('change', (event) => {
    state.earnedOnly = event.target.checked;
    renderList();
  });
  const spoiler = $('spoilerToggle');
  spoiler.checked = state.spoilersHidden;
  spoiler.addEventListener('change', (event) => {
    state.spoilersHidden = event.target.checked;
    saveSpoilersHidden(state.spoilersHidden);
    renderAll();
  });
  $('exportBtn').addEventListener('click', () => {
    const count = exportProgress(state.earned);
    $('filterNote').textContent = `Exported progress for ${count} earned trophies.`;
  });
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const imported = parseImportedProgress(text, state.trophies.map((t) => t.id));
    if (imported === null) {
      $('filterNote').textContent = 'That file is not a Leonida Platinum progress export — nothing was imported.';
    } else {
      state.earned = imported;
      saveEarned(state.earned);
      renderAll();
      $('filterNote').textContent = `Imported progress: ${imported.size} trophies earned.`;
    }
    event.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Reset all earned trophies? This clears your saved progress.')) return;
    state.earned = new Set();
    saveEarned(state.earned);
    renderAll();
  });
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => setView(tab.dataset.view));
  });
}

// Deep links: #roadmap, #missables, or #trophy-<id> open that view or
// trophy on load, so a screenshot or a shared link lands where it should.
function applyHash() {
  const hash = location.hash;
  if (hash === '#roadmap') state.view = 'roadmap';
  else if (hash === '#missables') state.view = 'missables';
  else if (hash.startsWith('#trophy-')) {
    const id = Number(hash.slice('#trophy-'.length));
    if (Number.isInteger(id)) state.selectedId = id;
  }
}

async function boot() {
  const response = await fetch('./data/trophies.json');
  const data = await response.json();
  state.trophies = data.trophies;
  state.sources = data.sources ?? {};
  applyHash();
  wireControls();
  renderAll();
}

boot().catch((error) => {
  listEl.innerHTML = '';
  const note = document.createElement('p');
  note.className = 'empty';
  note.textContent = `The trophy list could not be loaded (${error.message}). Serve app/ over HTTP and try again.`;
  listEl.append(note);
});
