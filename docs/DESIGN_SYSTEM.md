# DESIGN_SYSTEM — Fountain Pen Ink Swatch Journal

## 1. Design Direction

The product should feel like a physical fountain pen ink journal translated into a clean digital interface.

Visual references:

- index cards;
- paper swatch sheets;
- handwritten stationery labels;
- ink sample blocks;
- archival catalog cards.

The interface must not look like a generic admin dashboard.

Core qualities:

**tactile, quiet, warm, colorful, precise**

Ink colors provide most of the visual variety. The surrounding interface stays neutral so the collection remains the focus.

## 2. Principles

### Ink first

A card's swatch is visually dominant. UI chrome stays understated.

### Paper, not dashboard

Use warm paper-like surfaces, subtle borders, restrained shadows, and compact editorial typography.

### System-native and offline

Use system font stacks only. No remote typefaces, icon fonts, or assets required.

### Small source footprint

Prefer reusable CSS variables and simple selectors. Do not build a large utility system.

## 3. Color Tokens

Recommended CSS variables:

```css
:root{
  --paper:#f5f1e8;
  --surface:#fffdf8;
  --ink:#27241f;
  --muted:#726c62;
  --line:#d9d1c3;
  --accent:#5f4938;
  --danger:#9c3f38;
  --focus:#315f87;
}
```

These colors belong to the application shell only.

User-selected swatch colors must remain unmodified wherever practical.

### Usage

- `--paper`: page background.
- `--surface`: cards, dialog, form fields.
- `--ink`: primary text.
- `--muted`: secondary metadata.
- `--line`: borders and separators.
- `--accent`: primary action and selected states.
- `--danger`: destructive action.
- `--focus`: focus ring.

Avoid decorating the interface with multiple competing brand colors.

## 4. Typography

Use a native serif for the journal/editorial feel and native sans-serif for controls.

```css
--font-display: Georgia,"Times New Roman",serif;
--font-ui: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
```

Recommended hierarchy:

| Role | Font | Size |
|---|---|---:|
| Page title | display | clamp(1.9rem, 5vw, 3.4rem) |
| Card ink name | display | 1.15–1.35rem |
| Body/control | UI | 0.9–1rem |
| Metadata | UI | 0.75–0.85rem |
| Small label | UI | 0.7–0.75rem |

Guidance:

- Headings may use slightly tight letter spacing.
- Body line height around 1.5.
- Avoid excessive uppercase.
- Uppercase may be used sparingly for micro-labels such as brand/category.

## 5. Spacing

Use a compact 4 px base rhythm.

```text
4   micro
8   tight
12  compact
16  standard
24  section
32  major
48  page
```

Prefer `clamp()` for page padding rather than many breakpoints.

## 6. Shape

Recommended:

```text
Card radius       12–16 px
Button radius      8–10 px
Input radius       8–10 px
Swatch radius     10–12 px
```

Do not use pill shapes everywhere. Pills are appropriate only for tiny metadata or counts.

## 7. Borders and Shadow

Cards should feel like paper sitting on a desk.

Recommended:

```css
border:1px solid var(--line);
box-shadow:0 4px 16px #3b2d1b10;
```

Hover may slightly increase lift, but avoid dramatic animation.

## 8. Motion

Keep motion optional and short.

Recommended:

```text
hover/focus       120–180 ms
dialog entrance   <= 180 ms
```

Respect `prefers-reduced-motion`.

No parallax, large transforms, or decorative animation.

## 9. Components

### Primary button

Purpose: Add Ink or Save.

Style:

- filled `--ink` or `--accent`;
- light text;
- high-contrast focus state;
- compact height around 40–44 px.

### Secondary button

Purpose: Cancel or Edit.

Style:

- transparent or surface background;
- subtle border;
- dark text.

### Danger action

Purpose: Delete.

Use `--danger` for text or border. Avoid filling large areas red unless confirmation requires stronger emphasis.

### Search input

Use native search input or text input.

Requirements:

- visible label or accessible label;
- search affordance can be plain text/icon;
- full width on narrow screens;
- compact width on desktop.

### Form fields

Standard order:

1. Ink name.
2. Brand.
3. Color.
4. Notes.
5. Rating.

Name and brand can sit side by side only when enough width is available.

### Color control

Use native `<input type="color">`.

Display the chosen color adjacent to its hex value when convenient.

Do not add a custom color picker.

### Rating

Prefer five button-like stars:

`★ ★ ★ ★ ★`

Visual behavior:

- filled/strong up to selected rating;
- muted above selected rating;
- keyboard-accessible;
- numeric accessible label.

Avoid external emoji or icon assets.

### Swatch card

Recommended anatomy:

```text
┌─────────────────────┐
│                     │
│    COLOR SWATCH     │
│                     │
├─────────────────────┤
│ Brand               │
│ Ink Name            │
│ ★★★★☆               │
│ Short notes…        │
│              Edit   │
└─────────────────────┘
```

Delete may appear alongside Edit, but destructive emphasis should remain low until selected.

### Dialog

Prefer native `<dialog>` to avoid custom modal infrastructure.

Requirements:

- clear title: Add Ink or Edit Ink;
- close/cancel route;
- submit action;
- constrained width;
- scrollable on small screens.

## 10. Swatch Card Rules

The color block should occupy roughly 45–55% of the card's vertical visual weight.

Card text hierarchy:

1. Ink name.
2. Brand.
3. Rating.
4. Notes preview.
5. Actions.

Notes preview should use CSS truncation rather than JavaScript where possible.

Example:

```css
.note{
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}
```

## 11. Grid

Use CSS Grid:

```css
grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));
```

Suggested gap: `16–20px`.

This avoids breakpoint-heavy layout code.

## 12. Responsive Rules

### Small

- single-column card flow;
- full-width Add/Search controls where needed;
- dialog nearly fills viewport width;
- form fields stacked.

### Medium and large

- toolbar aligns search and Add action horizontally;
- cards auto-fit into available space;
- maximum content width around 1100–1200 px.

Avoid device-specific breakpoint proliferation.

## 13. States

### Empty collection

Tone: inviting, not error-like.

Suggested content:

**Your ink shelf is empty.**
Add your first bottle or sample to start the journal.

### No search result

Suggested content:

**No inks match this search.**
Try another ink name or brand.

### Validation

Use native form validation first.

Do not build a custom validation framework.

## 14. Accessibility Rules

1. Never communicate rating or action only by color.
2. Keep visible focus rings.
3. `button` for actions, not clickable `div`.
4. Every form field has a label.
5. Dialog has a heading.
6. Delete confirmation must identify the target ink.
7. Swatch cards expose ink name and color textually.
8. Maintain readable contrast on neutral UI surfaces.

## 15. Anti-Patterns

Do not add:

- glassmorphism;
- dashboard sidebar;
- charting;
- gradients for decoration;
- remote fonts;
- icon library;
- custom dropdown framework;
- masonry library;
- large animation library;
- multiple card variants without product need.

The visual richness must come from the ink collection itself.
