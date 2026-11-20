// Leonida Platinum — roadmap and missables.
//
// Both views are built from the official trophy descriptions alone: which
// story chapters and missions, which collectibles and counts, in what order.
// Nothing here claims a location or a step the descriptions do not pin
// down; the guide text says so where that is the case.

// The road to the platinum, in the order to earn it. Each stage names the
// trophies it covers by id; the renderer turns ids into links.
export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Play the story — and take every named mission',
    summary:
      'Chapters 1 to 4 and the final mission are unmissable, but the six named story missions are flagged missable: take each one the first time it appears, because the official descriptions do not say they can be replayed.',
    trophyIds: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 7],
    tip: 'Between story missions, stop for every stranger marker you pass — the Strangers & Freaks strands are the other missable set.',
  },
  {
    stage: 2,
    title: 'Close out the side strands',
    summary:
      'Finish every side character’s strand to its final mission, hunt Bret’s unique animal, and complete 8 stranger strands — all before the final story mission, while the map is still fully open.',
    trophyIds: [22, 23, 24, 26, 27, 29, 25],
    tip: 'Side strands open as the story introduces each character; a strand left half-done is the easiest thing to forget.',
  },
  {
    stage: 3,
    title: 'Sweep Leonida: collectibles and exploration',
    summary:
      'One slow sweep of the map pays for three trophies at once: visit all 52 areas, meditate at all 18 spots and WAiNK It at 100 locations while you are there. Cards, vehicles and garages ride along.',
    trophyIds: [42, 28, 31, 30, 35, 54, 55, 44],
    tip: 'Work region by region — Vice City, then the coast, then the interior — instead of criss-crossing the state.',
  },
  {
    stage: 4,
    title: 'Activities, combat and the money grinds',
    summary:
      'The long tail: 42 gold shooting-range medals, 250 stunts, 20 race wins, 14 drone-race wins, 50 challenges, 5 bank vaults, and the money trophies. Finish with 100% completion — the platinum pops with it.',
    trophyIds: [17, 15, 19, 18, 32, 40, 41, 39, 36, 38, 51, 43, 45, 46, 20, 21, 16, 33, 34, 37, 52, 53, 14, 1],
    tip: 'Stunts, challenges and spending tick over during normal play — check the stats page before grinding anything, you may already be close.',
  },
];

// Missable trophies, with the reason each one can be missed, in the
// descriptions’ own terms. Only these 7 are flagged: a trophy tied to a
// named one-time mission or to stranger strands that may not wait.
export function missableReasons() {
  return new Map([
    [8, 'A named story mission (Breakfast Run). The description does not say it can be replayed — take it when it appears.'],
    [9, 'A named story mission (The Cartel Heist). A one-shot heist set piece — finish it in the run it is offered.'],
    [10, 'A named story mission (Child’s Play). No replay is promised in the description.'],
    [11, 'A named story mission (Headliners). No replay is promised in the description.'],
    [12, 'A named story mission (VCIA Takedown). No replay is promised in the description.'],
    [13, 'A named story mission (Operation Savage Glory). No replay is promised in the description.'],
    [25, 'Stranger strands appear in specific places and the description does not promise they wait — stop for every stranger marker and finish each strand.'],
  ]);
}

// Human labels for the kind filter chips, in the order the toolbar shows
// them. "missable" is a flag, not a kind, and is offered as its own chip.
export const KIND_FILTERS = [
  { key: '', label: 'All 55' },
  { key: 'story', label: 'Story' },
  { key: 'mission', label: 'Story missions' },
  { key: 'side', label: 'Side missions' },
  { key: 'collectible', label: 'Collectibles' },
  { key: 'activity', label: 'Activities' },
  { key: 'exploration', label: 'Exploration' },
  { key: 'combat', label: 'Combat' },
  { key: 'economy', label: 'Money' },
  { key: 'completion', label: 'Completion' },
  { key: '__missable', label: 'Missable' },
];

export const KIND_LABELS = {
  story: 'Story',
  mission: 'Story mission',
  side: 'Side mission',
  collectible: 'Collectible',
  activity: 'Activity',
  exploration: 'Exploration',
  combat: 'Combat',
  economy: 'Money',
  completion: 'Completion',
};

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};
