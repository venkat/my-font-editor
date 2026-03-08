# Touch Debug Skill

Add or remove touch debugging instrumentation for iOS Safari issues.

## Usage

```
/touch-debug add    # Add debug panel and logging
/touch-debug remove # Remove all debug code
/touch-debug status # Check if debug code is present
```

## What It Does

### Add Debug Mode

1. Creates a fixed debug panel at the bottom of the screen
2. Adds `debugLog()` calls to touchstart, touchmove, touchend, touchcancel
3. Logs: coordinates, what was found (dot/stroke/endpoint), tap detection results

### Debug Panel Shows

- Touch event type (TOUCHSTART, TOUCHEND, etc.)
- SVG coordinates of touch
- What was detected at that position
- Tap vs drag detection results
- Selection state changes

## Quick Debug Pattern

When adding debug manually, use this pattern:

```javascript
// Add to top of touch event listener
const p = svgPt(e.touches[0]);
console.log('TOUCH:', { type: e.type, x: p.x, y: p.y });
```

## Common Debug Checks

1. **Is touchend firing?** - If not, check for DOM modifications in touchstart
2. **Is tap detected?** - Check dist and duration thresholds
3. **Is selection working?** - Check if stroke/endpoint found at tap position
4. **Is drag starting?** - Check if expDragging is being set

## Cleanup Reminder

Always remove debug code before committing:
```bash
grep -n "debugLog\|debugPanel\|debugLines" app.js
```
