# Fountain Pen Ink Swatch Journal

A lightweight single-page journal for tracking fountain pen inks as visual color swatches.

## Features

- Add, edit, and delete inks
- Ink name, brand, color, notes, and 1–5 rating
- Preset color swatches + custom color picker with a dark-to-light shade slider
- Subtle motion: dialog entrance, tactile press states, live shade preview (reduced-motion safe)
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

## How to Run

No build step, no package manager, no dependencies. Two options:

### Option A — open directly

```sh
open index.html        # macOS
# or just double-click index.html
```

`localStorage` persistence works from `file://` in Chrome, Edge, Firefox, and Safari.

### Option B — local static server (recommended for evaluation)

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

### Run the unit tests

Requires Node.js 19+ (no `npm install` needed):

```sh
node test.js
# expected output: all checks passed
```

### Verify the size budget

```sh
wc -c index.html style.css app.js
# hard cap 25000 bytes, target <= 23000
```

For the conservative repository-wide check, including the committed harness:

```sh
find . -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' \) \
  -not -path './.git/*' -print0 | xargs -0 wc -c
```

### What to check as an evaluator

1. Add an ink: pick a preset color or the custom picker, move the shade slider (dark to light), set a rating.
2. Reload the page — the ink persists.
3. Edit an ink — values repopulate; save updates in place (no duplicate).
4. Delete an ink — confirmation appears; cancel keeps it.
5. Search by partial name or brand (case-insensitive, real-time).
6. DevTools → Network tab — no external requests.
7. 320 px mobile viewport — one column, toolbar stacks, dialog fits.

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
