# Fountain Pen Ink Swatch Journal

A lightweight single-page journal for tracking fountain pen inks as visual color swatches.

## Features

- Add, edit, and delete inks
- Ink name, brand, color, notes, and 1–5 rating
- Visual swatch-card grid
- Real-time search by ink name or brand
- Newest-first ordering
- Browser persistence with `localStorage`
- Responsive layout
- Offline-friendly and dependency-free

## Stack

```text
HTML
CSS
Vanilla JavaScript
localStorage
```

No framework, backend, CDN, package manager, or build process.

## Run

Open `index.html` directly in a modern browser or serve the folder with any simple static server.

## Storage

Data is stored under:

```text
ink_journal
```

in browser `localStorage`.

## Source Size Constraint

Total runtime source must stay below **25 KB raw**:

```text
index.html + style.css + app.js
```

Recommended target: **<= 23 KB**.

Check with:

```sh
wc -c index.html style.css app.js
```

## Documentation

Implementation should follow:

```text
PRD.md
SRS.md
DESIGN_SYSTEM.md
DESIGN.md
AGENTS.md
MASTER_PROMPT.md
```
