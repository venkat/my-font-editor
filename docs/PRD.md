# My Font Maker - Product Requirements Document

## Overview

**Product Name:** My Font Maker
**Version:** 1.0
**Target Audience:** Kids, beginners, and anyone who wants to create custom fonts without professional design software
**Platform:** Web browser (desktop and tablet)

### Vision

Democratize font creation by making it accessible, fun, and approachable for everyone. Users can draw their own letter shapes and export them as real, installable fonts.

### Core Principles

- **Everyone is a font designer** - If you can draw a line, you can make a font
- **Imperfection is character** - Wobbly lines and quirky shapes make fonts personal
- **Joy over perfection** - A fun font you made beats a "perfect" font you downloaded
- **Learning by doing** - Make first, understand theory later

---

## Product Architecture

### Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla HTML/CSS/JavaScript (ES Modules) |
| Build Tool | Vite |
| Testing | Vitest |
| Font Generation | opentype.js |
| Shape Union | polygon-clipping |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |
| Font Preview | FontFace API |

### File Structure

```
font-maker/
├── index.html              # Main HTML file
├── style.css               # Application styles
├── app.js                  # Main application logic
├── package.json            # Dependencies and scripts
├── vite.config.js          # Build configuration
│
├── src/                    # Modular source code
│   ├── config.js           # Constants and configuration
│   ├── geometry.js         # Pure geometry utilities
│   ├── defaultFont.js      # Default font data
│   └── fontBuilder.js      # OTF generation utilities
│
├── tests/                  # Unit tests
│   ├── geometry.test.js    # Geometry function tests
│   └── defaultFont.test.js # Font data tests
│
├── .github/workflows/      # CI/CD
│   ├── ci.yml              # Tests on push/PR
│   └── deploy.yml          # Deploy to GitHub Pages
│
└── docs/
    └── PRD.md              # This document
```

### Source Modules

| Module | Purpose | Testable |
|--------|---------|----------|
| `config.js` | Grid dimensions, colors, font metrics, character sets | N/A (constants) |
| `geometry.js` | Distance, snapping, bezier curves, hit detection | Yes (24 tests) |
| `defaultFont.js` | Default font data, expansion functions | Yes (12 tests) |
| `fontBuilder.js` | OTF generation, glyph building | Partial |

---

## User Interface

### Layout

The application uses a two-column layout:

| Section | Width | Purpose |
|---------|-------|---------|
| Center Panel | Flexible | Live font preview with editable text |
| Right Panel | 296px | Character editor with drawing canvas |

### Center Panel Components

1. **Header Bar**
   - App title: "My Font Maker" (gradient purple-pink)
   - Subtitle hint text

2. **Preview Area**
   - Dark background (#1e1e24)
   - Editable textarea with custom font applied
   - Default text: "The Quick Brown Fox Jumps Over The Lazy Dog" + alphabet samples
   - Font updates live as user draws

3. **Export Row**
   - Font name input field (default: "MyFont")
   - "Download OTF" button (purple)
   - "Save JSON" button (green outline)
   - "Reset All" button (red outline)

### Right Panel Components

1. **Header**
   - Large badge showing current letter (42×42px, gradient background)
   - Title: "Letter [X]"
   - "Edit letter..." button to open character picker

2. **Toolbar**
   - Draw/Erase toggle buttons
   - Undo/Start Again buttons
   - Stroke width selector (3 options: thin, medium, thick)

3. **Mini Preview**
   - Shows current letter rendered with the custom font
   - Visual indicator of whether letter has strokes

4. **Drawing Canvas**
   - SVG-based drawing area
   - Grid dots for snap points
   - Guide lines for typography landmarks

---

## Grid System

### Dimensions

| Constant | Value | Description |
|----------|-------|-------------|
| COLS | 4 | Number of horizontal grid divisions |
| ROWS | 12 | Number of vertical grid divisions |
| SP (Spacing) | 31px | Distance between grid points |
| MX (Margin X) | 38px | Horizontal margin |
| MY (Margin Y) | 12px | Vertical margin |
| Canvas Width | 200px | COLS × SP + MX × 2 |
| Canvas Height | 373px | MY + ROW_DESC × SP + 20 |

### Typography Landmarks

| Landmark | Row | Purpose |
|----------|-----|---------|
| Cap Height | 1 | Top of capital letters |
| x-Height | 3 | Top of lowercase letters (like 'x', 'a', 'e') |
| Baseline | 9 | Line that letters sit on |
| Descender | 11 | Bottom of descending letters (g, y, p, q, j) |

### Guide Lines

| Line | Color | Style | Label |
|------|-------|-------|-------|
| Cap Height | Green (#bbf7d0) | Dashed | "Cap" |
| x-Height | Blue (#bfdbfe) | Dashed | "x" |
| Baseline | Red (#fca5a5) | Solid | "Base" |
| Descender | Purple (#e9d5ff) | Dashed | "Desc" |

### Dot Grid

- **Large dots** (11px): Integer grid positions (even column, odd row)
- **Small dots** (5px): Half-step positions between integer points
- **Endpoint dots** (9px): Purple dots marking stroke endpoints
- Dots appear on rows 1-11 only (rows 0 and 12 are margin)

---

## Character Set

### Supported Characters

| Category | Characters | Count |
|----------|------------|-------|
| Uppercase | A-Z | 26 |
| Lowercase | a-z | 26 |
| Digits | 0-9 | 10 |
| Symbols | !"#$%&'()*+,-./:;<=>?@[\]^_`{\|}~´ | 33 |
| **Total** | | **95** |

### Character Picker

- Modal overlay with grid layout
- 13 columns per row
- Sections: Uppercase, Lowercase, Digits, Symbols
- Current letter highlighted with active state
- Click backdrop or press Escape to close

---

## Drawing System

### Stroke Data Structure

```javascript
{
  x1: number,      // Start X coordinate (canvas pixels)
  y1: number,      // Start Y coordinate (canvas pixels)
  x2: number,      // End X coordinate (canvas pixels)
  y2: number,      // End Y coordinate (canvas pixels)
  color: string,   // Stroke color (default: '#1e1b2e')
  w: number,       // Stroke width in pixels (5, 11, or 20)
  // Optional curve properties:
  curved: boolean, // True if stroke is curved
  cx: number,      // Control point X (for quadratic bezier)
  cy: number       // Control point Y (for quadratic bezier)
}
```

### Stroke Widths

| Size | Width (px) | Visual |
|------|------------|--------|
| Thin | 5 | Elegant, delicate |
| Medium | 11 | Balanced (default) |
| Thick | 20 | Bold, chunky |

### Drawing Modes

1. **Draw Mode** (default)
   - Click and drag between grid dots to create strokes
   - Snaps to nearest grid intersection
   - Ghost preview line shown while dragging

2. **Erase Mode**
   - Click on any stroke to delete it
   - Strokes highlight red on hover

### Smart Interaction Mode

The smart interaction system provides intuitive manipulation of existing strokes:

#### Tap-to-Select
- Tap on a stroke → selects it (purple glow)
- Tap on a purple endpoint dot → selects it (ring indicator)
- Tap on empty space → deselects

#### Dot Movement
- Select a dot, then drag → moves the dot
- All connected strokes follow the moved dot
- Snaps to nearest grid intersection
- Visual: cursor changes to grabbing hand

#### Stroke Bending
- Select a stroke, then drag on it → bends into a curve
- Creates quadratic bezier with one control point
- Control point clamped to max 1.5 grid units from midpoint
- Control point clamped to grid boundaries

#### Visual Feedback

| State | Visual |
|-------|--------|
| Hover on stroke | Purple glow (50% opacity, blur) |
| Selected stroke | Stronger purple glow (40% opacity) |
| Selected dot | Purple ring around dot |
| Hover on dot | Enlarged purple dot |

#### Contextual Tooltips

| Context | Tooltip Text |
|---------|--------------|
| Hovering unselected dot | "Tap to select" |
| Hovering selected dot | "Drag to move" |
| Hovering unselected stroke | "Tap to select" |
| Hovering selected stroke | "Drag to bend" |

### One-Time Erase

When an element is selected in draw mode:
- Clicking the Erase button deletes the selection
- Stays in draw mode (not erase mode)
- For selected dots: deletes all strokes connected to that dot

---

## Undo System

### Behavior

- Undo stack per letter (max 80 states)
- Keyboard shortcut: Ctrl/Cmd + Z
- Undo button in toolbar
- Each drawing, moving, bending, or erasing action pushes state

### State Storage

```javascript
undoStk = {
  'A': ['[stroke JSON]', '[stroke JSON]', ...],
  'B': ['[stroke JSON]', ...],
  // ...
}
```

---

## Font Generation

### OTF Export

Uses opentype.js to generate OpenType font files.

#### Font Metrics

| Metric | Value | Description |
|--------|-------|-------------|
| Units Per Em | 1000 | Standard UPM |
| Cap Height | 700 | Font units for capital height |
| Advance Width | 700 | Monospace character width |
| Left Side Bearing | 175 | Padding on each side |
| Ascender | ~750 | Above baseline |
| Descender | ~-180 | Below baseline |

#### Glyph Generation Process

1. For each stroke:
   - Convert canvas coordinates to font units
   - Create rectangle polygon for stroke width
   - For curved strokes: sample bezier points, create offset polygon

2. For each endpoint:
   - Create 16-gon circle polygon (rounded caps)

3. Union all polygons using polygon-clipping library

4. Convert union result to OpenType path commands

### JSON Export

```javascript
{
  version: 7,
  upm: 1000,
  name: "FontName",
  glyphs: {
    'A': [{x1, y1, x2, y2, color, w, curved?, cx?, cy?}, ...],
    'B': [...],
    // ...
  }
}
```

---

## Data Persistence

### Auto-Save

- Saves to localStorage on every change
- Key: `fontMkr8`
- Format: JSON-stringified glyphs object

### Migration

- Automatically converts old nested segment format `[[strokes]]` to flat format `[strokes]`
- Fills missing characters from default font

### Default Font

- Pre-populated with Brutalita-style geometric monospace glyphs
- All 95 characters have default strokes
- Start Again button resets current letter to default
- Reset All button restores all letters to defaults

---

## Live Preview

### FontFace API Integration

1. Build OTF font in memory
2. Create FontFace object with font data
3. Add to document.fonts
4. Apply font-family to preview textarea
5. Regenerate on every stroke change (debounced 120ms)

### Preview Textarea

- Editable by user (can type any text)
- Uses custom font for display
- Fallback to monospace if font not ready
- Purple caret color (#a78bfa)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + Z | Undo (when not focused on textarea) |
| Ctrl/Cmd + A | Select all text in preview |
| Escape | Close character picker |

---

## Responsive Considerations

- Fixed right panel width (296px)
- Flexible center panel
- Touch events supported for tablet use
- Minimum recommended width: ~600px

---

## Performance

- SVG rendering for canvas (hardware accelerated)
- Debounced font regeneration (120ms)
- Efficient polygon union with polygon-clipping
- Undo stack limited to 80 entries per letter

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | Full |
| Safari | Full |
| Firefox | Full |
| Edge | Full |

Required APIs:
- FontFace API
- SVG
- localStorage
- Touch events

---

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd font-maker

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at http://localhost:5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

### CI/CD Pipeline

**On Push/PR to `main`:**
1. Install dependencies
2. Run unit tests
3. Build production bundle

**On Push to `main` (deployment):**
1. Run tests (blocks if failing)
2. Build with Vite
3. Deploy `dist/` to GitHub Pages

### Unit Tests

Tests cover pure utility functions using Vitest:

| Test File | Module | Tests |
|-----------|--------|-------|
| `geometry.test.js` | `src/geometry.js` | 24 tests |
| `defaultFont.test.js` | `src/defaultFont.js` | 12 tests |

**Total: 36 passing tests**

---

## Testing Checklist

### Drawing
- [ ] Can draw strokes between any two grid points
- [ ] Strokes snap to grid intersections
- [ ] All three stroke widths work
- [ ] Ghost preview line appears while dragging

### Smart Interaction
- [ ] Tapping stroke selects it with glow
- [ ] Tapping dot selects it with ring
- [ ] Tapping empty space deselects
- [ ] Dragging selected dot moves all connected strokes
- [ ] Dots snap to grid when moved
- [ ] Dragging selected stroke creates curve
- [ ] Curves are clamped to reasonable bounds
- [ ] Tooltips appear on hover

### Erase
- [ ] Erase mode: clicking stroke deletes it
- [ ] Selected stroke: erase button deletes it (stays in draw mode)
- [ ] Selected dot: erase button deletes connected strokes

### Undo
- [ ] Undo button works
- [ ] Ctrl/Cmd + Z works (when not in textarea)
- [ ] Undo restores previous state correctly

### Character Navigation
- [ ] Character picker opens/closes
- [ ] All 95 characters accessible
- [ ] Switching letters preserves strokes

### Export
- [ ] OTF download works
- [ ] Font renders correctly in external apps
- [ ] JSON export contains all data
- [ ] Curved strokes export correctly

### Preview
- [ ] Live preview updates as you draw
- [ ] Custom text can be typed
- [ ] Font displays correctly

### Persistence
- [ ] Changes persist after page reload
- [ ] Start Again resets current letter to default
- [ ] Reset All restores all letters to defaults

### Development & CI
- [ ] `npm test` runs all unit tests successfully
- [ ] `npm run build` produces working production bundle
- [ ] `npm run dev` starts development server
- [ ] GitHub Actions CI passes on push/PR
- [ ] GitHub Actions deploys to Pages on push to main

---

## Future Considerations

- Mobile-optimized layout
- Import existing fonts
- Multiple font weights
- Kerning adjustments
- Cloud sync
- Share/collaborate features
- Redo functionality
- Copy/paste letters
