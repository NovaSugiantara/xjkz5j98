# AGENTS.md — Fountain Pen Ink Swatch Journal

## Mission

Implement the PRD as the smallest reliable, polished single-page ink journal.

Priorities, in order:

1. Correct required behavior.
2. Data persistence.
3. Clear visual swatch experience.
4. Accessibility and responsive usability.
5. Runtime source below the scoring cap.
6. Simplicity.

Do not optimize for architecture sophistication.

## Required Context

Before implementation, read:

1. `PRD.md`
2. `SRS.md`
3. `DESIGN_SYSTEM.md`
4. `DESIGN.md`
5. this file

If documents conflict, use this precedence:

```text
PRD > SRS > DESIGN > DESIGN_SYSTEM > AGENTS
```

Do not invent product scope that is absent from the PRD.

## Allowed Stack

Default stack:

```text
HTML5
CSS3
Vanilla JavaScript
localStorage
```

Expected runtime files:

```text
index.html
style.css
app.js
```

Do not add a dependency, package manager, framework, build tool, CDN, remote font, or backend unless the user explicitly changes the requirements.

## Product Requirements That Must Survive Every Change

The application must always preserve:

1. ink name;
2. brand;
3. user-selected color;
4. notes;
5. rating from 1 to 5;
6. swatch-card grid;
7. add;
8. edit;
9. delete with confirmation;
10. real-time search by name OR brand;
11. newest-first order;
12. `localStorage` persistence under `ink_journal`;
13. empty collection state;
14. responsive mobile usability.

Never trade a required behavior for source-size savings.

## Size Limit

Hard constraint:

**max 25 KB raw scored source**

Treat this as a cumulative repository/branch constraint for scored source, not as permission for each individual commit to add another 25 KB.

Markdown and images are excluded only when the challenge checker explicitly says they are excluded.

Target <= 23 KB for total HTML+CSS+JS.

### Check before every runtime-code commit

Run:

```sh
wc -c index.html style.css app.js
```

If the project structure changes:

```sh
find . -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' \) \
  -not -path './.git/*' -print0 | xargs -0 wc -c
```

Use the final `total` value.

Safe budget:

```text
preferred <= 23000 bytes
hard target < 25000 bytes
```

Do not assume splitting a large implementation into many commits bypasses a cumulative checker.

## Commit Discipline

Keep commits narrow and functional.

Good progression:

```text
docs: define implementation constraints
feat: add journal page shell
feat: add local ink persistence
feat: add create and render flow
feat: add edit and delete flow
feat: add realtime search
style: add responsive swatch layout
refactor: reduce source size
```

A commit should not mix unrelated product changes.

Before each runtime commit:

1. inspect `git diff`;
2. verify required behavior touched by the change;
3. run the source-size check;
4. make sure cumulative runtime source remains below budget;
5. commit only the smallest coherent unit.

If the working change is too large, split by behavior rather than arbitrary file chunks.

## Implementation Rules

### HTML

Use semantic native elements.

Prefer:

- `main`
- `header`
- `section`
- `article`
- `form`
- `label`
- `button`
- `dialog`
- native `input type="color"`

Avoid wrapper-heavy markup.

### CSS

Use plain CSS.

Prefer:

- a small `:root` token set;
- CSS Grid auto-fit;
- native responsive flow;
- one small breakpoint only if necessary;
- CSS line-clamp for notes;
- system fonts.

Do not add:

- CSS framework;
- reset library;
- icon font;
- remote assets;
- large animation code.

When near the size cap, remove decorative rules before functional or accessibility rules.

Minification is allowed if required by submission strategy, but keep the authored code understandable until late in implementation.

### JavaScript

Use one small application module/script.

Prefer these responsibilities only:

```text
load
save
render
open add/edit form
submit
delete
search
rating
```

Use event delegation for repeated card actions.

Do not add class hierarchies, repositories, services, stores, routers, or generic abstractions.

### Storage

Use exactly:

```text
ink_journal
```

Store JSON array data.

Handle malformed storage without crashing.

Persist after every successful mutation.

### Security

User-entered name, brand, and notes are untrusted strings.

Do not allow them to become executable HTML.

Prefer DOM `textContent`. If template interpolation is used, escape untrusted fields before assigning to `innerHTML`.

Do not reduce XSS safety to save bytes.

### Accessibility

Do not remove:

- labels;
- semantic buttons;
- keyboard focus;
- dialog title;
- accessible rating information;
- confirmation for delete.

Color must not be the only way an ink is identified.

## UX Rules

The product should feel like an ink journal, not an admin panel.

The visual priority is:

```text
swatch > ink name > brand > rating > notes > actions
```

Use warm neutral surfaces so stored ink colors remain visually dominant.

Keep Add Ink obvious.

Keep destructive actions visually quieter than the primary action.

Use a single add/edit dialog.

Use native `confirm()` for deletion unless there is a proven reason not to.

## Scope Control

Do not implement v1 extras such as:

- accounts;
- sync;
- image uploads;
- import/export;
- tags;
- advanced sort controls;
- pagination;
- favorites;
- bottle inventory counts;
- paper database;
- themes;
- cloud backup.

A feature that sounds nice but is not in PRD is not free: it spends source budget and increases failure surface.

## Decision Heuristics

When choosing between two solutions:

1. choose the one that satisfies the PRD;
2. choose native browser capability over custom infrastructure;
3. choose fewer bytes when usability/correctness are equivalent;
4. choose readable code over clever compression while headroom remains;
5. choose progressive simplification over deleting required safeguards.

## Validation Before Finalizing

Manually test:

```text
add
required validation
newest-first order
hard refresh persistence
edit
edit persistence
delete cancel
delete confirm
search by name
search by brand
case-insensitive search
clear search
empty collection
no search result
mobile layout
keyboard navigation
```

Then verify:

```text
no required network requests
no runtime dependency
no console-breaking error
raw HTML+CSS+JS <= target
```

## Do Not Do

Do not:

- rewrite requirements;
- add speculative features;
- add framework scaffolding;
- generate excessive comments;
- duplicate helpers;
- introduce abstractions for one-off logic;
- create a custom modal when `<dialog>` suffices;
- create a custom color picker;
- hide failed storage writes;
- use array index as persistent identity;
- remove accessibility just to reduce byte count;
- assume small individual commits satisfy a cumulative size checker.

## Completion Standard

The implementation is done when every PRD flow is obvious, works after refresh, looks intentionally like a swatch journal, works on mobile, and the complete scored runtime source remains safely below the 25 KB cap.
