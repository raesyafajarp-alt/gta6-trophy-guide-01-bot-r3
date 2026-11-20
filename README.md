# Leonida Platinum — GTA 6 Trophy Guide & Tracker

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand
Theft Auto VI, built for the make.fun `gta6-trophy-guide-01` bounty.

## What it is

- **The official list, whole.** All 55 trophies with the name, description
  and grade as PlayStation publishes them (1 platinum, 2 gold, 6 silver,
  46 bronze), in `app/data/trophies.json`.
- **A tracker.** Tick trophies off as you earn them; progress is saved in
  the browser (localStorage), with export to a file and import back.
  Filters by kind (story, story missions, side missions, collectibles,
  activities, exploration, combat, money, completion), by grade, by
  search, and by earned-only. A spoiler setting hides the names and
  descriptions of story trophies until they are earned.
- **A roadmap to the platinum.** Four stages, in earning order: story
  first (taking every named mission), side strands second, collectibles
  and exploration third, the activity and money grinds last.
- **Missable flags.** Seven trophies are flagged missable — the six named
  story missions and the stranger strands — each with the reason, built
  from the official descriptions.
- **A cited guide for every trophy.** Each guide is written for this
  entry, in our own words, from the official description alone, and names
  its sources (the official list on Exophase and PSNProfiles). Where a
  description does not pin down a place or a step, the guide says so
  instead of inventing one.

## Offline by design

The app is static files under `app/` with no build step: `index.html`,
its modules, its stylesheet and `data/trophies.json`. It loads nothing
from the network at run time — the only fetch is the local trophy file —
and it works with the network off. No Rockstar Games artwork or logo is
used; the look is our own.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

Deep links work: `#roadmap`, `#missables`, `#trophy-17`. Add `?demo=1`
to preview the tracker part-way through a playthrough (13 trophies
marked earned, in memory only — nothing is saved).

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and
writes `dossier.json` with the kit's `vendor/makefun-frontend.ts`. It
never removes the output directory itself — only the contents of the
directories it writes into — so it is safe when `/output` is a mount
point.

## Layout

- `main.ts` — entrypoint: copies the guide and screenshots, writes the dossier.
- `serve.ts` — local preview server.
- `app/index.html` — the page.
- `app/main.js` — boot and rendering (checklist, detail pane, roadmap, missables).
- `app/store.js` — saved progress, export and import.
- `app/roadmap.js` — roadmap stages, missable reasons, kind and grade labels.
- `app/style.css` — the look.
- `app/data/trophies.json` — the 55 trophies and their guides.
- `screenshots/` — renders of the running guide.

## License

MIT — see `LICENSE`.
