// Leonida Platinum — progress store.
//
// One small job: keep the earned-trophy set and the spoiler setting in the
// browser's localStorage, and export / import them as a JSON file. Nothing
// here touches the network, and nothing leaves the browser unless the
// reader asks for an export.

const PROGRESS_KEY = 'leonida-platinum-progress-v1';
const SPOILER_KEY = 'leonida-platinum-spoilers-v1';

// Read the earned set from localStorage. A missing or broken value means
// "nothing earned yet", never an error on screen.
export function loadEarned() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // A full or blocked store must not break the tracker; the in-memory
    // set still works for this visit.
  }
}

export function loadSpoilersHidden() {
  try {
    return localStorage.getItem(SPOILER_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveSpoilersHidden(hidden) {
  try {
    localStorage.setItem(SPOILER_KEY, hidden ? '1' : '0');
  } catch {
    // See saveEarned: the toggle still works for this visit.
  }
}

// The export file: a small JSON object with a marker so an import can tell
// it apart from any other JSON file, plus the earned ids and the date.
export function exportProgress(earned) {
  const payload = {
    app: 'leonida-platinum',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-platinum-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload.earned.length;
}

// Parse an imported file's text back into an earned set. Returns null when
// the file is not one of ours (wrong marker, wrong shape), so the caller can
// say so instead of silently applying garbage.
export function parseImportedProgress(text, knownIds) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || parsed.app !== 'leonida-platinum' || !Array.isArray(parsed.earned)) {
    return null;
  }
  const known = new Set(knownIds);
  return new Set(parsed.earned.filter((id) => Number.isInteger(id) && known.has(id)));
}
