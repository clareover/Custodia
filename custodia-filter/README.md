# Custodia — Catholic Movie Filter App (Demo)

A web-based filter interface inspired by the *idea* of ClearPlay, designed from a Catholic perspective.

## What it does right now

- Library of available filter sets (The Sound of Music, The Prince of Egypt)
- Per-movie filter toggles:
  - Language & Blasphemy
  - Violence / Intense Moments
  - Romantic / Sexual Content
  - Substance Use
  - Other Concerns
- Simulated player that advances a timeline and **skips or mutes** segments according to your toggles
- Optional closed-captions toggle (demo only)
- Clean, original UI (navy + gold) — not a copy of ClearPlay

## Important limits of this demo

- No real movie files are loaded or streamed.
- This is a **simulation** so you can see how filters would behave.
- A production version would control playback of *your* authorized copy (streaming site or local file) under the Family Movie Act.

## How to open

Open `index.html` in a modern browser (Chrome, Firefox, Safari, Edge).

## Folder

```
custodia-filter/
  index.html      → Library
  player.html     → Filter settings + demo player
  css/app.css
  js/app.js
  js/player.js
  data/filters.js → Segment data for the two movies
```
