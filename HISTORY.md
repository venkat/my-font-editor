# Development History

This document summarizes the build conversation that produced `my-font-maker.html`.

---

## Origin

A parent wanted to build a font editor as a creative project for their 9-year-old daughter, who had fallen in love with [brutalita.com](https://brutalita.com). The goal: match Brutalita's UX quality and feel in a single self-contained HTML file — no build step, no server, just open and use.

---

## Session Summary

### Phase 1 — Initial Build
- Created the single-file HTML app with a 2-column layout: preview area (left) and drawing panel (right)
- Implemented dot-grid SVG canvas with click-to-draw stroke pairs `[c1,r1,c2,r2]`
- Added live preview using SVG overlay (later replaced)
- Pre-loaded A–Z, a–z with geometric stroke data

### Phase 2 — Live Preview via FontFace API
- **Key decision**: Replaced SVG overlay preview with real FontFace API loading
- The app builds an actual OTF binary on every stroke change (debounced 120ms), loads it via `new FontFace(...)`, and applies it to a `<textarea>`
- This gives a pixel-faithful preview of the actual exported font
- Fixed Ctrl+Z so it only triggers canvas undo when the textarea is NOT focused

### Phase 3 — Grid Expansion to Match Brutalita
- **Problem**: Our original grid (COLS=4, ROWS=8, ROW_BASE=6) was too small
- **Analysis**: Studied Brutalita's `font.json` coordinate system — X: 0–2 (step 0.5), Y: 0–5 (step 0.5)
- **Solution**: Multiply all Brutalita coordinates by 2 to get integer grid positions
  - `col = brutalita_x × 2` → cols 0–4
  - `row = brutalita_y × 2 + 1` → rows 1–11
- Updated to ROWS=12, ROW_CAP=1, ROW_XHGT=3, ROW_BASE=9, ROW_DESC=11
- Added x-height guide line (new, not in original)

### Phase 4 — Full 96-Character Set from Brutalita Source
- User uploaded `brutalita-master.zip` with the full React/TypeScript source
- Studied `src/font.json` (canonical character data), `src/font-maker.ts` (OTF generation), `src/components/key.tsx` (rendering), `src/style.css` (display metrics)
- Wrote Python conversion script to translate all 96 characters from Brutalita's polyline format to our stroke-pair format
- Zero-length strokes `[c,r,c,r]` represent dots (used in `!`, `:`, `.`, `i`, `j`, etc.)
- Added Digits and Symbols sections to the character picker overlay
- Updated localStorage key to `fontMkr8`

### Phase 5 — Display Size & Readability Fixes
- **Problem**: Preview text was too large (40px), then too small (20px), then too crowded
- **Root analysis**: Read Brutalita's actual CSS — `font-size: 23px; line-height: 30px`
- Set our preview to `font-size: 22px; line-height: 30px` to match exactly

### Phase 6 — Stroke Thickness & Polygon-Union OTF
- **Problem**: Strokes were 2× too thick (multiplier 1.70 should have been 0.81)
- **Root cause analysis**: Calculated from Brutalita source
  - Brutalita weight-400: `hw = 0.25 × 640/2/2 = 40 units` at UPM 2048 = **1.95% of em**
  - Our equivalent at UPM 1000 = **19.5 units**; needed multiplier = **0.81**
- **Advance width**: Was 438 fu (too narrow). Brutalita advance = 0.625 em → our target = **700 fu** with LSB=175 each side
- **Polygon-union**: Ported Brutalita's `polygon-clipping` approach
  - Each stroke → rectangle polygon
  - Each endpoint → 16-gon circle polygon (rounded caps)
  - All shapes → `polygonClipping.union()` → single merged outline
  - Eliminates overlap artifacts at stroke junctions (the main visual quality issue)

### Phase 7 — Polygon-Clipping Bug Fix
- **Problem**: Many characters rendered with gaps/missing parts
- **Root cause**: `circleRing()` was sampling at 0°, 90°, 180°, 270° — exactly coinciding with axis-aligned stroke rectangle corners, causing `polygon-clipping` to throw "Unable to complete output ring"
- **Fix**: Rotate circle start angle by `π/N` (half-step = 11.25°) so arc points never land at cardinal angles
- **Fix 2**: Use float arithmetic in coordinate conversion (remove `Math.round`) to prevent integer collinear coincidences
- Verified all 95 drawable characters pass with zero failures

### Phase 8 — JS Initialization Bug Fix
- **Problem**: `ReferenceError: Cannot access 'ROW_DESC' before initialization`
- **Root cause**: `CH` was computed using `ROW_DESC` on line 270, but `ROW_DESC` was declared with `const` on line 281 — JavaScript temporal dead zone
- Additionally, `ROW_CAP/ROW_BASE/ROW_DESC` were declared twice (duplicate `const`)
- **Fix**: Moved row landmark declarations before `CH`, removed duplicate block

### Phase 9 — Keyboard Shortcut Fix
- Added `Ctrl/Cmd+A` handler: always redirects to focus + select-all in the preview textarea, preventing accidental page-wide selection

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| Single HTML file | Zero friction — double-click to open, share as one file |
| FontFace API for preview | Renders the actual OTF binary; what you see = what you get |
| polygon-clipping for OTF | Eliminates stroke overlap artifacts; matches Brutalita quality |
| COLS=4 (5 dot columns) | Exactly matches Brutalita's X range 0–2 in steps of 0.5 |
| Monospace fixed advance | Simpler, matches Brutalita default; proportional is future work |
| localStorage autosave | Seamless persistence without a server |
| All 96 chars pre-loaded | No blank starting state; immediately usable and impressive |
| White canvas, dark preview | Drawing canvas needs white bg for dot visibility; preview matches Brutalita's dark aesthetic |

---

## Files Referenced During Development

| File | Source | Purpose |
|---|---|---|
| `brutalita-1772920928994.json` | User upload | Early Brutalita font data analysis |
| `brutalita-master.zip` | User upload | Full Brutalita source code |
| `src/font.json` | Brutalita source | Canonical 96-character stroke definitions |
| `src/font-maker.ts` | Brutalita source | OTF generation algorithm reference |
| `src/components/key.tsx` | Brutalita source | Rendering/coordinate system reference |
| `src/style.css` | Brutalita source | Display metrics (font-size, line-height) |
