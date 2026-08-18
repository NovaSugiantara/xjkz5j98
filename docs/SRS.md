# SRS — Fountain Pen Ink Swatch Journal

## 1. Purpose

Define the minimum software requirements for a lightweight single-page ink collection journal based on the project PRD.

## 2. Product Scope

The application lets a fountain pen ink collector create, browse, search, edit, and delete ink records. Each record is represented visually as a swatch card. All application data is stored locally in the browser.

### In scope

1. Add an ink entry.
2. Edit an ink entry.
3. Delete an ink entry with confirmation.
4. Display entries in newest-first order.
5. Search by ink name or brand in real time.
6. Persist data in `localStorage`.
7. Responsive single-page interface.
8. Empty and no-search-results states.

### Out of scope

1. Authentication.
2. Backend or database server.
3. Cloud synchronization.
4. Image upload.
5. Import/export.
6. Native mobile application.
7. Multi-user collaboration.

## 3. Technical Constraints

### Stack

Use only:

- `index.html`
- `style.css`
- `app.js`

No framework, external library, external font, CDN, bundler, package manager, or network request is required.

### Size budget

Scored runtime source must remain below **25 KB raw total**.

Count:

- HTML
- CSS
- JavaScript

Do not count documentation or images when the challenge checker explicitly excludes them.

Target implementation budget:

| File | Target | Hard guidance |
|---|---:|---:|
| `index.html` | 4–6 KB | <= 7 KB |
| `style.css` | 7–9 KB | <= 10 KB |
| `app.js` | 6–8 KB | <= 9 KB |
| Total | 17–23 KB | < 25 KB |

The implementation should target <= 23 KB to preserve checker and revision headroom.

## 4. Functional Requirements

### SRS-FR-01 Add ink

The user can create an ink record with:

- Ink name: required string.
- Brand: required string.
- Color: required HTML color input value.
- Notes: optional string.
- Rating: integer from 1 through 5.

Validation prevents saving when required fields are blank.

### SRS-FR-02 View collection

The application displays all saved inks in a responsive card grid.

Each card displays:

- Large color swatch.
- Ink name.
- Brand.
- Rating.
- Short notes preview.
- Edit action.
- Delete action.

Entries are ordered newest first.

### SRS-FR-03 Edit ink

Selecting Edit loads the existing record into the same form used for creation.

Saving an edited record:

- keeps the same record identity;
- updates its mutable fields;
- persists immediately;
- returns the UI to normal browsing state.

The user can cancel an edit without changing stored data.

### SRS-FR-04 Delete ink

Selecting Delete requires an explicit confirmation before removal.

After confirmation:

- the record is removed from application state;
- `localStorage` is updated;
- the visible collection re-renders.

### SRS-FR-05 Search

A search field filters entries immediately while the user types.

Matching is:

- case-insensitive;
- based on ink name OR brand;
- substring based.

Clearing search restores the full collection.

### SRS-FR-06 Persistence

Records are serialized as JSON under:

`ink_journal`

Data is loaded during application initialization.

A malformed or unavailable stored value must not crash the UI. The application falls back to an empty collection.

### SRS-FR-07 Empty states

If no records exist, show a useful empty collection message with a clear route to Add Ink.

If records exist but search returns no match, show a distinct no-results state.

## 5. Data Model

Recommended minimal record shape:

```js
{
  id: "unique-string",
  name: "Diamine Oxblood",
  brand: "Diamine",
  color: "#6d1828",
  notes: "Rich burgundy with good shading.",
  rating: 5,
  createdAt: 1787060000000
}
```

Rules:

- `id` must be unique.
- `name` and `brand` are trimmed.
- `color` is a valid color input value.
- `notes` may be an empty string.
- `rating` is an integer `1..5`.
- `createdAt` determines newest-first order.

`crypto.randomUUID()` may be used when available. A timestamp/random fallback is acceptable.

## 6. Application State

Minimal in-memory state:

```text
inks[]
query
editingId
```

`inks[]` is the source of truth during the current session and is synchronized to `localStorage` after every mutation.

Do not introduce state libraries.

## 7. Primary User Flow

### Add

1. Open page.
2. Select Add Ink.
3. Enter required fields.
4. Optionally add notes and rating.
5. Save.
6. Card appears in the grid.
7. Refresh page.
8. Card remains.

### Edit

1. Select Edit on a card.
2. Existing values populate the form.
3. Change values.
4. Save.
5. Updated card appears immediately.

### Delete

1. Select Delete.
2. Confirmation appears.
3. Confirm.
4. Card disappears and stays deleted after refresh.

### Search

1. Type part of a name or brand.
2. Grid updates without page reload.
3. Clear search.
4. Full collection returns.

## 8. UI Requirements

The page must contain:

1. Compact masthead/title.
2. Collection count or small supporting label.
3. Primary Add Ink action.
4. Search control.
5. Responsive swatch-card grid.
6. Reusable add/edit form, preferably a native `<dialog>`.
7. Empty/no-results state.

Avoid CRUD-table visual language.

The swatch color should be the strongest visual element on each card.

## 9. Non-Functional Requirements

### Performance

- No network request required for initial render.
- No heavy dependency parsing.
- Target cold load under 500 ms under normal local/static hosting conditions.

### Compatibility

Target current stable versions of:

- Chrome
- Edge
- Firefox
- Safari

Use progressive enhancement where practical.

### Responsive behavior

Usable from approximately 320 px viewport width upward.

Grid behavior:

- mobile: one column;
- medium: two or more columns when space allows;
- desktop: auto-fitting card columns.

### Accessibility

Minimum expectations:

- semantic buttons and form labels;
- visible keyboard focus;
- sufficient text contrast;
- dialog operable by keyboard;
- color is not the only representation of an ink;
- actions have accessible labels;
- rating control exposes the selected numeric value.

### Reliability

`localStorage` parsing and writes should be wrapped defensively enough to avoid breaking the page when storage is malformed or unavailable.

## 10. Acceptance Criteria

The release is acceptable when all are true:

1. A valid ink can be added.
2. Blank name or brand cannot be saved.
3. Newest entries appear first.
4. Every card includes swatch, name, brand, rating, and note preview.
5. Editing changes an existing entry instead of creating a duplicate.
6. Deletion requires confirmation.
7. Search matches name and brand case-insensitively.
8. Data remains after hard refresh.
9. Empty collection state appears correctly.
10. No-results state appears correctly.
11. Layout is usable on mobile and desktop.
12. The app makes no required external network request.
13. Combined runtime HTML/CSS/JS stays below 25 KB raw.
14. All six PRD user stories can be completed without instructions.

## 11. Definition of Done

A task is complete only if:

- behavior matches this SRS;
- no new dependency was added;
- accessibility of touched controls is preserved;
- local persistence still works;
- source-size budget is rechecked;
- unrelated features were not introduced.
