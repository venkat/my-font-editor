# Claude Code Instructions

## Project Overview

My Font Maker is a single-file browser-based font editor inspired by Brutalita. Users draw stroke-based letters on a dot grid, preview them as a real font, and export `.otf` files.

## Quick Start

```bash
# Open directly in browser (no build required)
open my-font-maker.html

# Or serve locally
npm start
# Then open http://localhost:3000/my-font-maker.html
```

## Architecture

- **Single-file app**: Everything is in `my-font-maker.html` (HTML, CSS, JS)
- **No build step**: CDN dependencies only (opentype.js, polygon-clipping, Nunito font)
- **Autosave**: Uses localStorage with key `fontMkr8`

## Key Files

| File | Purpose |
|------|---------|
| `my-font-maker.html` | The entire application |
| `DESIGN.md` | Architecture decisions and technical details |
| `HISTORY.md` | Development conversation history |

## Grid System

The drawing grid mirrors Brutalita's 5x12 coordinate system:
- X: cols 0-4 (Brutalita 0-2, step 0.5)
- Y: rows 1-11 (Brutalita 0-5, step 0.5)
- Conversion: `col = brutalita_x * 2`, `row = brutalita_y * 2 + 1`

## Testing

No automated tests. Manual testing:
1. Open `my-font-maker.html` in browser
2. Draw strokes on the grid
3. Check live font preview updates
4. Test OTF export functionality

## Code Style

- Vanilla JavaScript (no frameworks)
- All code inline in HTML file
- Uses ES6+ features (const/let, arrow functions, template literals)

## Skills (Slash Commands)

| Command | Description |
|---------|-------------|
| `/deploy` | Commit, push, and verify deployment to venkat.io/my-font-editor |
| `/preview` | Open the live site and take a screenshot |
| `/local` | Start local server and preview for testing |
| `/check` | Validate HTML and check for issues |
| `/test-letter` | Test editing a specific letter |
| `/export-test` | Test the OTF download functionality |

## Agents

Specialized agents for complex tasks (invoke via Task tool):

| Agent | Purpose |
|-------|---------|
| `ui-tester` | Interactive UI testing with Puppeteer |
| `code-reviewer` | Review code changes for quality and issues |
| `deployer` | Full deployment workflow with verification |
| `feature-planner` | Design and plan new features |
| `font-inspector` | Analyze font generation and glyph output |

## Deployment

- **Live URL**: https://venkat.io/my-font-editor/
- **Hosting**: GitHub Pages via GitHub Actions
- **Workflow**: `.github/workflows/deploy.yml`
- Push to `main` triggers automatic deployment
