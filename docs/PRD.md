# PRD — Fountain Pen Ink Swatch Journal

## 1. Overview

A single-page web app for fountain pen enthusiasts to log, view, and manage their ink collection. Entries persist in `localStorage`; no backend required.

## 2. Problem Statement

Collectors accumulate dozens of inks with no structured way to record color, behavior, or impressions. Existing tools (spreadsheets, paper journals) lack visual swatch representation or are not portable.

## 3. Goals

- Visual-first: every ink shows as a color swatch card.
- Full CRUD: add, edit, delete entries.
- Offline-first: all data in `localStorage`.
- Fast to use: search/filter without page reload.
- Lightweight: ≤ 25 KB raw source total.

## 4. Non-Goals

- No user accounts / cloud sync.
- No image upload.
- No import/export (v1).
- No mobile-native app.

## 5. User Stories

| #   | As a…     | I want to…                                           | So that…                          |
| --- | --------- | ---------------------------------------------------- | --------------------------------- |
| 1   | collector | add a new ink with name, brand, color, notes, rating | I can log new acquisitions        |
| 2   | collector | see all inks as color swatch cards                   | I get a visual overview           |
| 3   | collector | edit an existing entry                               | I can correct or enrich data      |
| 4   | collector | delete an entry                                      | I can remove inks I no longer own |
| 5   | collector | search or filter by brand                            | I can find inks quickly           |
| 6   | collector | have data survive page refresh                       | I don't lose my collection        |

## 6. Functional Requirements

| ID  | Requirement                                                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| FR1 | Form fields: Ink Name (text, required), Brand (text, required), Color (color picker, required), Notes (textarea), Rating (1–5 nib icons) |
| FR2 | Grid display of swatch cards sorted newest-first                                                                                         |
| FR3 | Card shows: color block, name, brand, rating, note preview (truncated)                                                                   |
| FR4 | Add / Edit via modal or inline form                                                                                                      |
| FR5 | Delete with confirmation                                                                                                                 |
| FR6 | Search input filters by name OR brand (case-insensitive, real-time)                                                                      |
| FR7 | All CRUD operations persist to localStorage key ink_journal                                                                              |
| FR8 | Empty state message when no inks exist                                                                                                   |

## 7. Non-Functional Requirements

- Raw source <= 25 KB (HTML + CSS + JS combined, minified where possible)
- Loads with no network requests (self-contained)
- Works in modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive: usable on mobile viewport

## 8. Success Metrics

- All 6 user stories completable without instruction
- Page load < 500 ms on cold cache
- localStorage persists across hard refresh
