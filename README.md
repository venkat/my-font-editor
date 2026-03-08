# My Font Maker

A browser-based font editor inspired by [Brutalita](https://brutalita.com) by [@javierbyte](https://javier.xyz). Draw stroke-based letters on a dot grid, preview them live as a real font, and export a `.otf` file you can install and use anywhere.

Built as a collaborative project for a 9-year-old who loved Brutalita.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

---

## Features

- **Dot-grid drawing canvas** — click and drag between dots to draw strokes, matching Brutalita's exact 5×12 grid proportions
- **Smart interaction mode** — tap to select strokes/dots, drag to move dots or bend lines into curves
- **Live font preview** — uses the FontFace API to load the real OTF binary you're building; what you see is what you get
- **Full character set** — all 96 characters pre-loaded from Brutalita's canonical definitions: A–Z, a–z, 0–9, and all standard symbols/punctuation
- **Quadratic bezier curves** — bend straight lines into smooth curves by dragging
- **Polygon-union OTF export** — uses `polygon-clipping` to merge overlapping stroke outlines into clean filled shapes
- **Character picker overlay** — browse all characters by category (Uppercase, Lowercase, Digits, Symbols)
- **Undo / Erase / Start Again** — full editing controls
- **3 stroke widths** — thin, medium, thick
- **JSON save/export** — save your font definition as `.json` and reload it later
- **localStorage autosave** — your work is preserved across sessions (key: `fontMkr8`)
- **Keyboard shortcuts** — Ctrl/Cmd+Z for undo, Ctrl/Cmd+A to select preview text

---

## Project Structure

```
font-maker/
├── index.html              # Main HTML file
├── style.css               # Application styles
├── app.js                  # Main application logic
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite build configuration
│
├── src/                    # Modular source code
│   ├── config.js           # Constants and configuration
│   ├── geometry.js         # Pure geometry utilities
│   ├── defaultFont.js      # Default font data (Brutalita-style)
│   └── fontBuilder.js      # OTF font generation
│
├── tests/                  # Unit tests
│   ├── geometry.test.js    # Tests for geometry functions
│   └── defaultFont.test.js # Tests for font data functions
│
├── .github/workflows/      # CI/CD configuration
│   ├── ci.yml              # Runs tests on push/PR
│   └── deploy.yml          # Deploys to GitHub Pages
│
├── docs/                   # Documentation
│   └── PRD.md              # Product Requirements Document
│
└── dist/                   # Production build output (gitignored)
```

---

## Architecture

### Source Modules (`src/`)

| Module | Purpose |
|--------|---------|
| `config.js` | All constants: grid dimensions, colors, font metrics, character sets |
| `geometry.js` | Pure geometry functions: distance calculations, grid snapping, bezier curves, hit detection |
| `defaultFont.js` | Default font data in compact format, expansion to stroke objects |
| `fontBuilder.js` | OTF font generation using opentype.js and polygon-clipping |

### Key Design Principles

1. **Pure Functions** — Core logic is in stateless, testable functions
2. **ES Modules** — Modern JavaScript module system
3. **Separation of Concerns** — Configuration, geometry, font data, and rendering are separate
4. **Backward Compatibility** — Stroke data format supports both straight lines and curves

### Data Structures

**Stroke Object:**
```javascript
{
  x1, y1,           // Start point (canvas pixels)
  x2, y2,           // End point (canvas pixels)
  color: '#1e1b2e', // Stroke color
  w: 11,            // Stroke width in pixels
  // Optional curve properties:
  curved: true,     // Flag for curved strokes
  cx, cy            // Control point for quadratic bezier
}
```

**Glyph Storage:**
```javascript
{
  'A': [stroke, stroke, ...],  // Array of strokes per character
  'B': [stroke, stroke, ...],
  // ...
}
```

---

## Testing

Tests are written using [Vitest](https://vitest.dev/) and cover the pure utility functions.

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| `geometry.js` | 24 tests | distance, snapToGrid, bezier curves, hit detection |
| `defaultFont.js` | 12 tests | font data validation, expansion, stroke properties |

---

## CI/CD

### Continuous Integration

On every push and pull request to `main`:
- Install dependencies
- Run all unit tests
- Build the production bundle

See `.github/workflows/ci.yml`

### Deployment

On push to `main`:
1. Run all tests (deployment blocked if tests fail)
2. Build production bundle with Vite
3. Deploy to GitHub Pages

See `.github/workflows/deploy.yml`

---

## Grid System

The drawing grid is a faithful conversion of Brutalita's coordinate system:

| Concept | Brutalita | Our grid |
|---------|-----------|----------|
| X range | 0–2 (step 0.5) | cols 0–4 |
| Y range | 0–5 (step 0.5) | rows 1–11 |
| Cap height | Y=0 | row 1 |
| x-height | Y=1 | row 3 |
| Baseline | Y=4 | row 9 |
| Descender | Y=5 | row 11 |

Conversion formula: `col = brutalita_x × 2`, `row = brutalita_y × 2 + 1`

---

## Font Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Units per em | 1000 | Standard for modern fonts |
| Advance width | 700 fu | Monospace spacing |
| Left side bearing | 175 fu | Centered glyphs |
| Cap height | 700 fu | Top of uppercase letters |
| Stroke half-width | ~44 fu | Default weight |
| Ascender | 750 fu | Above cap height |
| Descender | −175 fu | Below baseline |

---

## External Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| [Vite](https://vitejs.dev/) | ^5.4.0 | Build tool and dev server |
| [Vitest](https://vitest.dev/) | ^2.0.0 | Unit testing framework |
| [opentype.js](https://github.com/opentypejs/opentype.js) | 1.3.4 | OTF font generation (CDN) |
| [polygon-clipping](https://github.com/mfogel/polygon-clipping) | 0.15.7 | Polygon union for outlines (CDN) |
| [Nunito](https://fonts.google.com/specimen/Nunito) | — | UI font (Google Fonts) |

---

## Configuration

Key constants are defined in `src/config.js`:

```javascript
// Grid dimensions
COLS = 4          // Number of columns
ROWS = 12         // Number of rows
SP = 31           // Grid spacing in pixels
MX = 38           // Horizontal margin
MY = 12           // Vertical margin

// Typography landmarks (row numbers)
ROW_CAP = 1       // Cap height line
ROW_XHGT = 3      // x-height line
ROW_BASE = 9      // Baseline
ROW_DESC = 11     // Descender line

// Interaction
SNAP = 22         // Snap distance for dots
CURVE_MAX_DIST = SP * 1.5  // Max control point distance
```

---

## Local Storage

The app automatically saves your work to `localStorage` with the key `fontMkr8`. Data is saved as JSON containing all glyph stroke data.

To clear saved data:
```javascript
localStorage.removeItem('fontMkr8');
```

---

## Attribution

Font data (character stroke definitions) adapted from [Brutalita](https://github.com/javierbyte/brutalita) by Javier Bórquez, licensed MIT/BSD-3-Clause.

OTF generation via [opentype.js](https://github.com/opentypejs/opentype.js).
Polygon union via [polygon-clipping](https://github.com/mfogel/polygon-clipping).

---

## License

MIT
