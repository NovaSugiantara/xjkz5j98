# DESIGN — Frontend Specification

## 1. Frontend Goal

Build the smallest polished frontend that makes the ink collection visually useful and all PRD flows obvious without instruction.

Implementation target:

```text
index.html
style.css
app.js
```

No framework and no build pipeline.

## 2. Page Architecture

```text
body
└── main.app
    ├── header.hero
    │   ├── eyebrow / collection label
    │   ├── h1 Ink Swatch Journal
    │   └── short intro
    ├── section.toolbar
    │   ├── search field
    │   └── Add Ink button
    ├── section.results-meta
    │   └── visible count / search context
    ├── section#inkGrid
    │   └── swatch cards
    ├── empty state
    └── dialog#inkDialog
        └── form#inkForm
```

Keep all functionality on one page.

## 3. Desktop Layout

Recommended content shell:

```css
.app{
  width:min(1120px,calc(100% - 32px));
  margin:auto;
  padding:48px 0 64px;
}
```

Top section:

- title on the left;
- short descriptive copy below;
- toolbar separated by approximately 24–32 px;
- search takes remaining horizontal space;
- Add Ink remains compact.

Grid begins immediately after collection metadata.

## 4. Mobile Layout

At narrow viewport widths:

- page horizontal padding around 16 px;
- title wraps naturally;
- toolbar stacks;
- search and Add Ink become full width;
- grid becomes one column;
- dialog uses almost full viewport width;
- actions remain large enough to tap comfortably.

Do not hide core card information on mobile.

## 5. Card Composition

Each record renders as one `<article>`.

Suggested structure:

```html
<article class="card">
  <div class="swatch" aria-label="Ink color #6d1828"></div>
  <div class="card-body">
    <p class="brand">Diamine</p>
    <h2>Oxblood</h2>
    <p class="rating" aria-label="5 out of 5">★★★★★</p>
    <p class="note">Rich burgundy with...</p>
    <div class="actions">
      <button>Edit</button>
      <button>Delete</button>
    </div>
  </div>
</article>
```

The exact markup may be made more compact if semantics are preserved.

## 6. Add/Edit Dialog

Use a single native dialog for both modes.

### Add mode

Title: `Add ink`

Submit label: `Save ink`

Form initializes with:

- empty name;
- empty brand;
- sensible default color;
- empty notes;
- rating default such as 3 or 5.

### Edit mode

Title: `Edit ink`

Form is populated from the selected record.

Submit label: `Save changes`

Canceling clears edit state.

## 7. Delete Interaction

Prefer native `confirm()` because:

- it is reliable;
- it is accessible enough for this small scope;
- it adds no modal markup or state;
- it reduces raw source size.

Confirmation text should identify the record:

`Delete "Diamine Oxblood"?`

A custom confirmation dialog is unnecessary unless the size budget still has ample headroom and a concrete UX benefit is demonstrated.

## 8. Search Behavior

Use one input with placeholder similar to:

`Search ink or brand…`

On `input`:

1. normalize query with `trim().toLowerCase()`;
2. filter by `name` or `brand`;
3. render filtered cards;
4. update visible result count.

No debounce is needed for a local collection of this expected scale.

## 9. Rendering Strategy

Use a single `render()` function.

Concept:

```text
render()
  get normalized search query
  filter inks
  sort newest-first if needed
  write cards
  update count
  toggle empty state
```

Avoid a component abstraction layer.

For compactness, template literals are acceptable.

User-entered text must not be inserted unsafely as executable markup.

Preferred safe options:

- create DOM nodes and assign `textContent`, or
- escape user-entered fields before interpolating into HTML.

Security correctness is more important than shaving a few hundred bytes.

## 10. Persistence Strategy

On boot:

```text
read localStorage["ink_journal"]
parse JSON
validate that it is an array
fallback to []
render()
```

After Add/Edit/Delete:

```text
update inks[]
save()
render()
```

Minimal helpers:

```text
load()
save()
render()
openForm()
submitForm()
deleteInk()
```

Do not create repository/service/store layers for browser localStorage.

## 11. Event Strategy

Prefer a small number of listeners:

- Add button click.
- Search input.
- Form submit.
- Form cancel/close.
- Grid click delegation for Edit/Delete.
- Rating interaction if implemented with buttons.

Use event delegation for card actions instead of one listener per card.

## 12. Rating Control

Recommended compact approach:

- hidden/native numeric state or hidden input;
- five `<button type="button">★</button>` controls;
- selected state updates the numeric value.

Each control receives an accessible label such as:

`Rate 4 out of 5`

Alternatively, a radio group with five choices is acceptable if markup remains compact.

## 13. Notes Preview

Do not mutate or permanently truncate stored notes.

Store the full text.

Truncate visually on the card with CSS line clamping.

The complete notes appear when editing the record.

## 14. Empty State Logic

Cases must differ.

### Collection empty

Condition:

```text
inks.length === 0
```

Show:

`Your ink shelf is empty.`

Primary action can reuse Add Ink.

### Search empty

Condition:

```text
inks.length > 0 && filtered.length === 0
```

Show:

`No inks match this search.`

Do not show the Add Ink empty-state prompt as if the collection were empty.

## 15. Data Integrity

When reading stored data, tolerate invalid JSON.

When editing/deleting, use stable `id`, never array position as identity.

When save fails because storage is unavailable/full, avoid silently losing in-memory state. A lightweight alert/message is sufficient for v1.

## 16. Source Budget Strategy

Start readable. Minify only after behavior is correct.

Preferred savings:

1. native HTML elements;
2. native dialog;
3. native confirm;
4. native color input;
5. system fonts;
6. CSS Grid auto-fit;
7. one render path;
8. delegated events;
9. small reusable CSS variables;
10. no dependencies.

Avoid premature clever compression that makes defects more likely.

### Approximate budget

```text
index.html   5 KB
style.css    8 KB
app.js       8 KB
----------------
total       21 KB
headroom     4 KB
```

If source approaches 23 KB:

1. remove decorative CSS first;
2. consolidate repeated declarations;
3. shorten internal names only where readability remains acceptable;
4. remove redundant markup;
5. minify CSS/JS only if the submitted source may remain minified;
6. do not remove validation, accessibility, persistence safety, or required functionality.

## 17. Git / Cumulative Size Strategy

Treat the 25 KB rule as a cumulative branch source budget, not merely a per-commit patch budget.

Before every commit, measure the current scored runtime source.

Example:

```sh
wc -c index.html style.css app.js
```

If files are nested:

```sh
find . -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' \) \
  -not -path './.git/*' -print0 | xargs -0 wc -c
```

The final total must remain `< 25600` bytes when the checker interprets KB as 1024 bytes. If the evaluator uses decimal KB, target `< 25000` bytes. For safety, target `< 23000` bytes.

A small commit does not rescue an oversized cumulative source tree.

### Suggested commits

1. `docs: define product and frontend constraints`
   - documentation only.

2. `feat: add journal shell and form`
   - small HTML baseline.

3. `feat: add ink persistence and rendering`
   - CRUD core in JS.

4. `feat: add search and edit delete flows`
   - complete behavior.

5. `style: add responsive swatch journal design`
   - essential CSS.

6. `refactor: reduce runtime source footprint`
   - only if size needs reduction.

Every runtime-code commit must leave the cumulative scored source below the hard limit.

## 18. Frontend QA Checklist

Before final submission verify:

1. Add valid ink.
2. Required-field validation.
3. New card appears newest first.
4. Reload preserves it.
5. Add second ink.
6. Search by partial ink name.
7. Search by partial brand.
8. Search is case-insensitive.
9. Edit first ink.
10. Reload preserves edit.
11. Delete second ink.
12. Cancel delete leaves it intact.
13. Confirm delete removes it.
14. Empty state works.
15. No-results state works.
16. Keyboard focus is visible.
17. Dialog works with keyboard.
18. 320 px layout is usable.
19. Desktop grid auto-fits.
20. No required network request occurs.
21. Raw HTML+CSS+JS stays below target budget.

## 19. Explicitly Rejected Complexity

Do not add:

- React/Vue/Svelte;
- TypeScript;
- Tailwind;
- Sass;
- Vite/Webpack;
- state management library;
- router;
- backend;
- database;
- custom storage abstraction;
- test framework for this challenge unless requested;
- remote fonts/icons;
- animations that do not improve task completion.

For this PRD, these additions increase source weight and implementation risk without solving a required problem.
