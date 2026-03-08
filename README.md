# ✏️ My Font Maker

A single-file browser-based font editor inspired by [Brutalita](https://brutalita.com) by [@javierbyte](https://javier.xyz). Draw stroke-based letters on a dot grid, preview them live as a real font, and export a `.otf` file you can install and use anywhere.

Built as a collaborative project for a 9-year-old who loved Brutalita.

---

## Quick Start

```bash
# No build step required — just open the file
open my-font-maker.html
```

Or serve it locally:

```bash
npx serve .
# then open http://localhost:3000/my-font-maker.html
```

---

## Features

- **Dot-grid drawing canvas** — click and drag between dots to draw strokes, matching Brutalita's exact 5×12 grid proportions
- **Live font preview** — uses the FontFace API to load the real OTF binary you're building; what you see is what you get
- **Full character set** — all 96 characters pre-loaded from Brutalita's canonical `font.json`: A–Z, a–z, 0–9, and all standard symbols/punctuation
- **Multi-segment letters** — `i`, `j`, and any letter you choose can have multiple independent drawing layers (e.g. tittle + stem)
- **Polygon-union OTF export** — uses `polygon-clipping` to merge overlapping stroke outlines into clean filled shapes (same approach as Brutalita)
- **Character picker overlay** — browse all characters by category (Uppercase, Lowercase, Digits, Symbols)
- **Undo / Erase / Clear** per segment
- **3 stroke widths, 9 colors**
- **JSON save/export** — save your font definition as `.json` and reload it later
- **localStorage autosave** — your work is preserved across sessions (key: `fontMkr8`)
- **Ctrl/Cmd+Z** — undo drawing strokes (canvas only; textarea gets native undo)
- **Ctrl/Cmd+A** — selects all text in the preview textarea

---

## File Structure

```
my-font-maker.html   ← The entire app. Self-contained, no build step.
README.md            ← This file
HISTORY.md           ← Development conversation summary
DESIGN.md            ← Design decisions, architecture, nuances
```

---

## External Dependencies (CDN)

| Library | Version | Purpose |
|---|---|---|
| [opentype.js](https://github.com/opentypejs/opentype.js) | 1.3.4 | OTF font generation |
| [polygon-clipping](https://github.com/mfogel/polygon-clipping) | 0.15.7 | Union of stroke polygons |
| [Nunito](https://fonts.google.com/specimen/Nunito) | — | UI font (Google Fonts) |

The app requires an internet connection to load these. For fully offline use, download and inline the CDN scripts.

---

## Grid System

The drawing grid is a faithful conversion of Brutalita's coordinate system:

| Concept | Brutalita | Our grid |
|---|---|---|
| X range | 0–2 (step 0.5) | cols 0–4 |
| Y range | 0–5 (step 0.5) | rows 1–11 |
| Cap height | Y=0 | row 1 |
| x-height | Y=1 | row 3 |
| Baseline | Y=4 | row 9 |
| Descender | Y=5 | row 11 |

Conversion formula: `col = brutalita_x × 2`, `row = brutalita_y × 2 + 1`

---

## Font Metrics

| Metric | Value | Brutalita equivalent |
|---|---|---|
| UPM | 1000 | 2048 |
| Advance width | 700 fu | 1280/2048 = 0.625 em |
| Left side bearing | 175 fu | 320/2048 = 0.156 em |
| Cap height | 700 fu | — |
| Stroke half-width | ~20 fu (weight 400) | 40/2048 = 0.0195 em |
| Ascender | 750 fu | — |
| Descender | −175 fu | — |

---

## Known Limitations / Future Work

- **JSON import** — export works, import not yet implemented
- **Calligraphr template** — printable template for hand-drawing characters
- **Proportional spacing** — advance width is currently fixed (monospace only)
- **Font weight slider** — stroke `hw` multiplier could be exposed as a weight control
- **Offline mode** — inline CDN scripts for fully offline use

---

## Attribution

Font data (character stroke definitions) adapted from [Brutalita](https://github.com/javierbyte/brutalita) by Javier Bórquez, licensed MIT/BSD-3-Clause.

OTF generation via [opentype.js](https://github.com/opentypejs/opentype.js).  
Polygon union via [polygon-clipping](https://github.com/mfogel/polygon-clipping).
