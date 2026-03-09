# Claude Code Instructions

## Project Overview

My Font Maker is a browser-based font editor inspired by Brutalita. Users draw stroke-based letters on a dot grid, preview them as a real font, and export `.otf` files.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Then open http://localhost:5173

# Run tests
npm test

# Build for production
npm run build
```

## Architecture

- **Modular structure**: Source code in `src/`, tests in `tests/`
- **Build system**: Vite for development and production builds
- **Testing**: Vitest for unit tests (68 tests)
- **CI/CD**: GitHub Actions runs tests before deployment
- **Autosave**: Uses localStorage with key `fontMkr8`

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main HTML file |
| `style.css` | Application styles |
| `app.js` | Main application logic |
| `src/config.js` | Constants and configuration |
| `src/geometry.js` | Pure geometry utilities (tested) |
| `src/defaultFont.js` | Default font data (tested) |
| `src/fontBuilder.js` | OTF generation utilities |
| `vite.config.js` | Build configuration |
| `docs/PRD.md` | Product requirements document |

## Source Modules

| Module | Purpose | Tests |
|--------|---------|-------|
| `config.js` | Grid dimensions, colors, font metrics, character sets | — |
| `geometry.js` | Distance, snapping, bezier curves, hit detection | 24 |
| `defaultFont.js` | Default font data, expansion functions | 12 |
| `fontBuilder.js` | OTF generation, glyph building | — |

## Grid System

The drawing grid mirrors Brutalita's 5x12 coordinate system:
- X: cols 0-4 (Brutalita 0-2, step 0.5)
- Y: rows 1-11 (Brutalita 0-5, step 0.5)
- Spacing: 31px between grid points
- Conversion: `col = brutalita_x * 2`, `row = brutalita_y * 2 + 1`

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Testing

Unit tests cover pure utility functions and interaction logic:

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Tests must pass before deployment (enforced by CI).

### Test Coverage by Area

| Area | Test File | Description |
|------|-----------|-------------|
| Geometry | `tests/geometry.test.js` | Distance, snapping, bezier curves |
| Default Font | `tests/defaultFont.test.js` | Font data validation |
| Interaction Logic | `tests/interaction.test.js` | Drawing decision logic |
| E2E Scenarios | `tests/e2e/drawing.test.js` | User interaction scenarios |

### Preventing Touch/Desktop Regressions

**Key insight**: Touch fixes can break desktop, and vice versa. The interaction handlers share logic.

**Testing strategy**:
1. **Extract decision logic into testable functions** - The `shouldBlockDrawing(strokeMid, endpoint)` logic is tested separately from DOM/event handling
2. **Test invariants, not implementation** - Tests verify "purple endpoints are valid drawing start points" rather than testing specific code paths
3. **Document scenarios as tests** - Each user interaction (tap, drag, from grey dot, from endpoint) has a corresponding test

**Before deploying touch fixes**:
1. Run `npm test` to check all scenarios
2. Test desktop in browser (draw from grey dot, draw from endpoint, tap to select)
3. Test on real iOS device (not just simulator)

**Regression-prone areas**:
- `mousedown`/`touchstart` early returns - changing when to return early affects both platforms
- Hit detection order - checking stroke vs endpoint vs grid dot in wrong order breaks selection
- `renderCanvas()` calls - calling it during touch events breaks iOS

## Skills (Slash Commands)

| Command | Description |
|---------|-------------|
| `/deploy` | Run tests, commit, push, and verify deployment |
| `/preview` | Open the live site and take a screenshot |
| `/local` | Start dev server and preview for testing |
| `/check` | Run tests and validate the project |
| `/test-letter` | Test editing a specific letter |
| `/export-test` | Test the OTF download functionality |
| `/touch-debug` | Add/remove touch debugging instrumentation |

## Agents

Specialized agents for complex tasks (invoke via Task tool):

| Agent | Purpose |
|-------|---------|
| `ui-tester` | Interactive UI testing with Puppeteer (desktop only) |
| `ios-touch-tester` | Debug iOS Safari touch issues |
| `code-reviewer` | Review code changes for quality and issues |
| `deployer` | Full deployment workflow with verification |
| `feature-planner` | Design and plan new features |
| `font-inspector` | Analyze font generation and glyph output |
| `ux-designer` | Kid-friendly UX review and improvements |
| `font-expert` | Typography guidance for everyone |

## Deployment

- **Live URL**: https://venkat.io/my-font-editor/
- **Hosting**: GitHub Pages via GitHub Actions
- **Workflow**: `.github/workflows/deploy.yml`
- **Process**: Push to `main` → Tests run → Build → Deploy

### MANDATORY: Run Tests Before Every Commit

**CRITICAL RULE FOR CLAUDE**: Before EVERY `git commit`, you MUST:

1. Run `npm test` and verify ALL tests pass
2. If tests fail, fix the issue before committing
3. NEVER commit with failing tests

```bash
# Always run before committing:
npm test && git commit -m "..."
```

This is enforced by:
- Git pre-push hook (blocks push if tests fail)
- GitHub Actions CI (blocks deployment if tests fail)
- This instruction file (you must follow it)

## Code Style

- ES Modules (import/export)
- Vanilla JavaScript (no frameworks)
- Pure functions in `src/` for testability
- Uses ES6+ features (const/let, arrow functions, template literals)

## iOS Touch Handling (Critical Learnings)

This app supports touch interactions on iOS Safari. Key learnings from debugging:

### iOS Safari Touch Event Quirks

1. **Never call renderCanvas() in touchstart** - DOM rebuilds during touchstart cause iOS to lose track of the touch, and touchend will NEVER fire. This is Safari-specific; Chrome handles it fine.

2. **Touch snap radius vs grid spacing** - If snap radius (55px for touch) exceeds grid spacing (31px), every canvas position finds a grid dot. Solution: Check for stroke/endpoint hits BEFORE checking for grid dots.

3. **pressStart must be set before early returns** - The tap detection in touchend uses `pressStart` coordinates. Always set it before any conditional returns in touchstart.

4. **Use touchstart position for hit detection** - In touchend, use `pressStart.x, pressStart.y` for selection, not the touchend position (which may have drifted).

5. **Guard against duplicate touch/mouse events** - Touch devices may fire both touch AND mouse events. Use a timestamp guard (500ms) to prevent double-handling.

### Testing Limitations

- **Puppeteer uses Chromium, not Safari** - Puppeteer tests won't catch Safari-specific touch bugs
- **iOS Simulator limitations** - Synthetic touch events via xcrun simctl don't fully replicate native touch behavior
- **Real device testing required** - For touch bugs, test on actual iPhone/iPad

### Touch Detection Priority (SMART_MODE)

```javascript
// In touchstart/mousedown, check in this order:
1. If selected item exists and touched → start dragging it
2. If touching stroke middle (NOT endpoint) → return (let touchend select)
3. If touching grid dot OR endpoint → start line drawing
```

**Critical bug pattern (commit e95f200)**:
```javascript
// WRONG - blocks drawing from endpoints:
if (strokeMid || endpoint) return;

// CORRECT - only block stroke middles that aren't endpoints:
if (strokeMid && !endpoint) return;
```

The difference: endpoints ARE valid drawing start points. Only stroke middles (where there's no dot) should block drawing.

### Key Thresholds

| Threshold | Desktop | Touch | Purpose |
|-----------|---------|-------|---------|
| SNAP | 22px | 55px | Grid dot detection |
| TAP_THRESH | 10px | 25px | Tap vs drag detection |
| ENDPOINT_RADIUS | 15px | 40px | Endpoint dot hit zone |
| STROKE_MID_THRESH | 12px | 35px | Stroke middle hit zone |

### Debug Pattern for Touch Issues

When debugging touch issues, temporarily add a debug panel:
```javascript
const debugPanel = document.createElement('div');
debugPanel.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:rgba(0,0,0,0.9);color:#0f0;font-family:monospace;font-size:12px;padding:10px;z-index:9999';
document.body.appendChild(debugPanel);

function debugLog(msg) {
  debugPanel.innerHTML = msg + '<br>' + debugPanel.innerHTML;
}
```
Then log: touchstart position, what was found (dot/stroke/endpoint), touchend position, tap detection result.
