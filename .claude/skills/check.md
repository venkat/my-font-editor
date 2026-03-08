# Check

Validate the project by running tests and checking for issues.

## Steps

1. Run `npm test` to execute all unit tests
2. Run `npm run build` to verify production build works
3. Check that index.html, app.js, and style.css exist
4. Verify all CDN dependencies are accessible:
   - https://unpkg.com/opentype.js@1.3.4/dist/opentype.min.js
   - https://unpkg.com/polygon-clipping@0.15.7/dist/polygon-clipping.umd.js
5. Check git status for any uncommitted changes
6. Report the validation results

## Test Summary

The project has 36 unit tests:
- `tests/geometry.test.js` - 24 tests for geometry utilities
- `tests/defaultFont.test.js` - 12 tests for font data

## Expected Output

- All 36 tests should pass
- Build should complete without errors
- All source files should exist
