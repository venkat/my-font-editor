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
- **Testing**: Vitest for unit tests (36 tests)
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

Unit tests cover pure utility functions:

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Tests must pass before deployment (enforced by CI).

## Skills (Slash Commands)

| Command | Description |
|---------|-------------|
| `/deploy` | Run tests, commit, push, and verify deployment |
| `/preview` | Open the live site and take a screenshot |
| `/local` | Start dev server and preview for testing |
| `/check` | Run tests and validate the project |
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
| `ux-designer` | Kid-friendly UX review and improvements |
| `font-expert` | Typography guidance for everyone |

## Deployment

- **Live URL**: https://venkat.io/my-font-editor/
- **Hosting**: GitHub Pages via GitHub Actions
- **Workflow**: `.github/workflows/deploy.yml`
- **Process**: Push to `main` → Tests run → Build → Deploy
- Tests must pass for deployment to proceed

## Code Style

- ES Modules (import/export)
- Vanilla JavaScript (no frameworks)
- Pure functions in `src/` for testability
- Uses ES6+ features (const/let, arrow functions, template literals)
