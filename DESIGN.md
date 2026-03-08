# Design Decisions, Architecture & Nuances

This document captures the non-obvious choices, the "why not X", and the subtle details that took the most iteration to get right. Essential reading before making changes.

---

## Architecture Overview

The app is intentionally **one HTML file** with inline CSS and JavaScript. No framework, no bundler, no node_modules. This was a deliberate constraint: the file must open by double-clicking, work offline (except CDN deps), and be shareable as a single attachment.

```
┌─────────────────────────────────────────────┐
│  LEFT: Preview area (dark bg)               │
│  ┌──────────────────────────────────────┐   │
│  │  <textarea> with live OTF font       │   │
│  │  FontFace API → real rendered glyphs │   │
│  └──────────────────────────────────────┘   │
│  [Download OTF] [Save JSON] [Reset All]     │
├─────────────────────────────────────────────┤
│  RIGHT: Editor panel                        │
│  ┌──────────┐  [Edit letter…] button        │
│  │ Mini SVG │  Toolbar (draw/erase/undo)    │
│  │ preview  │  Segment tabs                 │
│  └──────────┘  Drawing canvas (SVG)         │
└─────────────────────────────────────────────┘
         ↑
   Character picker overlay (modal)
   Uppercase / Lowercase / Digits / Symbols
```

---

## Data Model

```js
// glyphs: the entire font state
glyphs = {
  'A': [ [stroke, stroke, ...] ],          // one segment
  'i': [ [stroke], [stroke, stroke, ...] ] // two segments (dot + stem)
}

// A stroke in canvas coordinates (pixel space):
stroke = { x1, y1, x2, y2, color, w }
// x,y are actual pixel positions on the SVG canvas
// w: stroke width in pixels (5, 11, or 20)
// color: hex string

// Zero-length stroke (x1==x2, y1==y2): renders as a filled dot
// Used for: . ! : ; ? i j % (and others)
```

**Why canvas pixels, not grid indices?** Because the drawing interaction operates in pixel space (mouse coordinates, SVG), and converting at input time keeps all downstream code (rendering, OTF export) in one consistent space.

---

## Grid System

### The Brutalita Mapping

Brutalita's coordinate system uses floating-point values:
- X: `{0, 0.5, 1, 1.5, 2}` → 5 column positions
- Y: `{0, 0.5, 1, ..., 5}` → 11 row positions

Our integer grid: `col = round(bx × 2)`, `row = round(by × 2) + 1`

The `+1` offset gives row 0 as a dead margin above the cap, keeping the top guide visible.

### Grid Constants

```js
const COLS=4, ROWS=12, SP=40, MX=20, MY=20;
// SP = spacing between dots (40px)
// MX, MY = canvas margin
// CW = COLS*SP + MX*2 = 200px canvas width
// CH = (ROW_DESC+1)*SP + MY*2 = 520px canvas height

const ROW_CAP=1;   // Top of capital letters  (Brutalita Y=0)
const ROW_XHGT=3;  // Top of lowercase letters (Brutalita Y=1)
const ROW_BASE=9;  // Baseline                 (Brutalita Y=4)
const ROW_DESC=11; // Bottom of descenders     (Brutalita Y=5)
```

**Why ROWS=12?** The canvas draws dots at rows 1..ROW_DESC (1..11). Row 0 is a margin above cap, and we need one extra row of space below desc (row 12) so the canvas visually "breathes." The `CH` formula uses `ROW_DESC+1` to allocate this.

### Dot Rendering Rules (matches Brutalita)

- **Large dot** (`DOT_LG ≈ 11px`): at positions where `col % 2 === 0 AND row % 2 === 0` (integer Brutalita coordinates)
- **Small dot** (`DOT_SM ≈ 5px`): at half-step positions (at least one odd index)
- **Endpoint dot** (`DOT_EP ≈ 9px`): drawn purple+white on top of strokes, at stroke start/end positions
- **Hover dot**: larger, purple, shown during draw mode mouseover

---

## OTF Font Generation

### Pipeline

```
canvas strokes (pixel coords)
    ↓ toFU(cx, cy) — float arithmetic, no rounding
font unit coordinates
    ↓ per stroke → rectangle polygon
    ↓ per endpoint → 16-gon circle polygon (rounded caps)
    ↓ polygonClipping.union(allPolygons)
merged outline polygon
    ↓ opentype.Path (moveTo/lineTo)
opentype.Glyph
    ↓ opentype.Font.toArrayBuffer()
OTF binary
    ↓ FontFace API
live preview
```

### Why polygon-clipping?

Without union, overlapping stroke rectangles create **double-filled regions**. At stroke intersections (like in 'A', 'H', 'X'), the overlap area is rendered twice. In a filled outline font this causes visual artifacts — the overlap region inverts or shows as a hole depending on winding. `polygon-clipping.union()` merges all shapes into a single outline before passing to opentype.js, exactly as Brutalita does.

### The Critical circle rotation fix

```js
// WRONG — samples at 0°, 90°, 180°, 270°:
const a = (2 * Math.PI * j) / CIRCLE_N;

// CORRECT — offset by half step:
const offset = Math.PI / CIRCLE_N;  // = 11.25° for CIRCLE_N=16
const a = offset + (2 * Math.PI * j) / CIRCLE_N;
```

When circle sample points fall at exactly 0°/90°/180°/270°, they coincide precisely with the corners of axis-aligned stroke rectangles. This creates a degenerate T-intersection that causes `polygon-clipping` to throw "Unable to complete output ring." The half-step rotation is a one-line fix that makes all 95 drawable characters work without exception.

### Why float arithmetic in toFU?

```js
// WRONG — integer coincidences break polygon-clipping:
function toFU(cx, cy) { return [Math.round(cx * CAP_U/CAP_PX) + LSB, ...]; }

// CORRECT — float coords prevent exact edge collinearity:
function toFU(cx, cy) { return [(cx - MX) * CAP_U/CAP_PX + GLYPH_LSB, ...]; }
```

Integer rounding can make two different strokes share an exactly identical edge segment. Polygon-clipping's robust predicate library can handle near-coincidences but chokes on exact ones. Float coordinates have vanishingly small probability of exact coincidence.

### Font Metrics (calibrated to Brutalita weight-400)

```
UPM = 1000
MONO_ADV = 700      // advance width per glyph
GLYPH_LSB = 175     // left side bearing
content width = 350 fu  // MONO_ADV - 2×LSB
stroke hw = pen_w × CAP_U/CAP_PX × 0.81  (≈ 20 fu for default pen)
```

**Derivation of 0.81 multiplier:**
```
Brutalita weight-400: hw = 0.25 × SCALE_X/CHAR_X/2 = 0.25 × 640/2/2 = 40 fu at UPM 2048
= 40/2048 = 0.0195 em

Our hw target: 0.0195 × 1000 = 19.5 fu
pen_w=11 in font units: 11 × CAP_U/CAP_PX = 11 × 700/320 = 24.06 fu
multiplier needed: 19.5 / 24.06 = 0.81
```

**Derivation of MONO_ADV=700:**
```
Brutalita advance ratio: 1280/2048 = 0.625 em
Our content width: COLS×SP × CAP_U/CAP_PX = 4×40 × 700/320 = 350 fu
Target advance at 0.625 em: ?
Actually: Brutalita LSB = (1280-640)/2 = 320/2048 = 0.156 em
Our LSB: 0.156 × 1000 = 156 fu → rounded to 175 for visual balance
MONO_ADV = 350 + 175×2 = 700
```

---

## Live Preview Architecture

### Why FontFace API instead of SVG overlay?

Early versions rendered the preview as a `<div>` of SVG `<Key>` components (exactly like Brutalita). This was abandoned because:
1. **Scaling mismatch**: the SVG rendering is a simplified approximation (no polygon union), so the preview didn't match the exported OTF
2. **Accuracy**: FontFace API loads the actual OTF binary — the same bytes the "Download OTF" button produces. Zero discrepancy.

### The debounce chain

```
user draws stroke
  → glyphs[] updated
  → renderCanvas() called
    → renderBig() called
      → scheduleRegen() sets 120ms timer
        → regenPreview() async:
           buildOTFFont() → font.toArrayBuffer()
           → document.fonts.delete(old) 
           → new FontFace(..., buffer).load()
           → document.fonts.add(new)
           → textarea.style.fontFamily = 'FontMakerPreview'
```

The 120ms debounce prevents rebuilding the OTF on every mouse-move event during stroke drawing. The old FontFace is explicitly deleted before adding the new one to prevent font cache buildup.

### Preview vs. installed font fidelity

The preview is **highly faithful** for:
- Glyph shapes and proportions
- Advance widths and spacing
- Descenders/ascenders clipping

Minor differences from installed font usage:
- **OS renderer**: Chrome's FreeType-based antialiasing vs. macOS CoreText vs. Windows DirectWrite
- **Background**: preview is white-on-dark; light backgrounds read slightly heavier due to antialiasing bleed

---

## Multi-Segment Letters

Some characters need independent drawing layers (e.g., `i` = tittle + stem, `j` = dot + tail). The data model supports this:

```js
glyphs['i'] = [
  [[2,1,2,1]],              // segment 0: dot (zero-length stroke)
  [[1,3,2,3],[2,3,2,9],...] // segment 1: stem + serifs
]
```

The segment bar above the canvas shows "Part 1", "Part 2", "+ Add Part". Inactive segments render at 20% opacity. Any letter can be given multiple segments — useful for accented characters, complex symbols, etc.

---

## Character Picker Overlay

Replaced a left-column scrollable list. Rationale:
- The left column took up ~25% of horizontal space permanently
- With 96 characters (vs. the original 52), a scrollable list became unwieldy
- An overlay maximizes the preview and canvas area for the actual editing workflow

The overlay is built lazily on first open (to avoid DOM overhead at load), then kept in DOM with `display:none`.

---

## localStorage Schema

Key: `fontMkr8` (version 8 — bump this if the data format changes incompatibly)

```js
{
  'A': [ [stroke, ...], [stroke, ...] ],  // array of segments
  'a': [ [...] ],
  // ... all characters
}
```

On load: if saved data exists, merge with defaults for any missing characters. This allows adding new characters to FD without losing user's existing work.

**Version history:**
- `fontMkr7`: original 52 letters, flat stroke arrays (now migrated on load)
- `fontMkr8`: all 96 chars, segment arrays

---

## Known Issues & Future Work

### JSON Import
Export works, import is not yet implemented. The exported JSON format is:
```json
{
  "version": 7,
  "upm": 1000,
  "glyphs": { "A": [[...]], ... }
}
```
Import would need to read this, validate, and merge into `glyphs`.

### Proportional Spacing
Currently all characters use `MONO_ADV = 700` (monospace). Brutalita supports proportional spacing by measuring actual stroke x-extent. The `glyphAdvW()` function skeleton exists — it just isn't wired to the export yet.

### Font Weight Control
The stroke `hw` multiplier (`0.81`) is hardcoded for weight-400. A weight slider (300/400/700 matching Brutalita's presets) would multiply this by `0.6/0.81/1.0` respectively.

### Offline Mode
The app needs an internet connection for opentype.js, polygon-clipping, and Nunito font. To make it fully offline: download these three resources and inline them as base64 data URIs or `<script>` blocks.

### Calligraphr Template
A "Print template" button that generates a PDF with empty boxes for hand-drawing each character, for use with Calligraphr's scan-to-font workflow.

### Stroke Intersection Vertices
Brutalita detects when a polyline point is at the intersection of two segments and draws a vertex cap (small circle) there — this prevents gaps where polylines meet at T or Y intersections. Our approach (endpoint circles at every stroke endpoint) achieves a similar effect but is slightly different for connected polylines.

---

## Brutalita Coordinate Compatibility

Our JSON export format uses `[c1, r1, c2, r2]` stroke pairs, which is our own format. If you want to round-trip with Brutalita's `.json` format:

**Brutalita → Our format:**
```python
col = round(brutalita_x * 2)
row = round(brutalita_y * 2) + 1
# polyline of N points → N-1 stroke pairs
```

**Our format → Brutalita:**
```python
brutalita_x = col / 2
brutalita_y = (row - 1) / 2
# consecutive stroke pairs sharing an endpoint → polyline
```

Note: our format loses polyline connectivity (consecutive strokes sharing an endpoint aren't stored as such), so round-tripping to Brutalita format would produce single-segment polylines instead of connected paths. Functionally identical for rendering, but the JSON is larger.
