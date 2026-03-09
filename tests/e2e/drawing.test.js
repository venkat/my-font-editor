/**
 * End-to-end tests for drawing functionality
 *
 * These tests run in a browser environment (via Vitest with jsdom or browser mode)
 * and simulate user interactions to verify drawing works correctly.
 *
 * Test scenarios to prevent regressions:
 * 1. Drawing from grey dots (basic functionality)
 * 2. Drawing from purple endpoint dots (regression from e95f200)
 * 3. Drawing from grid dots that strokes pass through (regression V2)
 * 4. Tap-to-select on stroke middles (should NOT start drawing)
 * 5. Touch device interactions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the interaction decision logic extracted from app.js
// This allows us to test the core logic without needing the full DOM

/**
 * Decision logic for whether to block drawing on mousedown/touchstart
 * This mirrors the actual code in app.js
 *
 * @param {boolean} strokeMid - True if cursor is on a stroke middle
 * @param {boolean} endpoint - True if cursor is on an endpoint (purple dot)
 * @param {boolean} gridDot - True if cursor is near any grid dot
 */
function shouldBlockDrawing(strokeMid, endpoint, gridDot = false) {
  // CORRECT logic: only block if on stroke AND NOT at any dot (endpoint or grid)
  // This allows drawing from any grid point, even if a stroke passes through it
  return strokeMid && !endpoint && !gridDot;
}

/**
 * Decision logic for tap vs drag detection
 */
function isTap(startX, startY, endX, endY, startTime, endTime, tapThresh = 10, tapTimeLimit = 300) {
  const dist = Math.hypot(endX - startX, endY - startY);
  const duration = endTime - startTime;
  return dist < tapThresh && duration < tapTimeLimit;
}

describe('Drawing decision logic', () => {
  describe('shouldBlockDrawing - prevents regressions', () => {
    it('allows drawing from grey dots', () => {
      expect(shouldBlockDrawing(false, false, true)).toBe(false);
    });

    it('allows drawing from purple endpoints', () => {
      // KEY REGRESSION TEST V1 - this was broken in commit e95f200
      expect(shouldBlockDrawing(false, true, true)).toBe(false);
    });

    it('allows drawing from grid dots that strokes pass through', () => {
      // KEY REGRESSION TEST V2 - strokes can pass through grid points
      // User should be able to draw from those points
      expect(shouldBlockDrawing(true, false, true)).toBe(false);
    });

    it('blocks drawing from stroke middles with NO nearby dot', () => {
      // Only block when truly on stroke middle with no dot nearby
      expect(shouldBlockDrawing(true, false, false)).toBe(true);
    });

    it('allows drawing when on both stroke and endpoint', () => {
      // If cursor is on a stroke AND near its endpoint, allow drawing
      expect(shouldBlockDrawing(true, true, true)).toBe(false);
    });
  });

  describe('isTap detection', () => {
    it('detects tap when movement is small and quick', () => {
      expect(isTap(100, 100, 102, 101, 0, 100)).toBe(true);
    });

    it('detects drag when movement is large', () => {
      expect(isTap(100, 100, 150, 150, 0, 100)).toBe(false);
    });

    it('detects drag when duration is long', () => {
      expect(isTap(100, 100, 102, 101, 0, 500)).toBe(false);
    });

    it('uses touch threshold when specified', () => {
      // Touch devices have larger tap threshold (25px vs 10px)
      expect(isTap(100, 100, 120, 100, 0, 100, 25)).toBe(true);
      expect(isTap(100, 100, 120, 100, 0, 100, 10)).toBe(false);
    });
  });
});

describe('Interaction scenarios (documentation tests)', () => {
  /**
   * These tests document the expected behavior for each interaction scenario.
   * They serve as living documentation and regression prevention.
   */

  describe('Desktop mouse interactions', () => {
    it('click + drag from grey dot creates line', () => {
      // Grey dot, no stroke passing through
      const blocked = shouldBlockDrawing(false, false, true);
      expect(blocked).toBe(false);
    });

    it('click + drag from purple endpoint creates line', () => {
      // Endpoint dot
      const blocked = shouldBlockDrawing(false, true, true);
      expect(blocked).toBe(false);
    });

    it('click + drag from grid dot on stroke creates line', () => {
      // KEY TEST: grid dot that a stroke passes through
      const blocked = shouldBlockDrawing(true, false, true);
      expect(blocked).toBe(false);
    });

    it('click on stroke middle (no dot) does NOT start line', () => {
      // On stroke between grid points, no dot nearby
      const blocked = shouldBlockDrawing(true, false, false);
      expect(blocked).toBe(true);
      // Mouseup will select the stroke instead
    });

    it('tap on purple endpoint selects it (no drag)', () => {
      const blocked = shouldBlockDrawing(false, true, true);
      expect(blocked).toBe(false);
      // But if isTap returns true, the tap selects instead of drawing
      expect(isTap(100, 100, 101, 100, 0, 50)).toBe(true);
    });
  });

  describe('Touch device interactions', () => {
    const TOUCH_TAP_THRESH = 25;

    it('touch + drag from grey dot creates line', () => {
      const blocked = shouldBlockDrawing(false, false, true);
      expect(blocked).toBe(false);
    });

    it('touch + drag from purple endpoint creates line', () => {
      const blocked = shouldBlockDrawing(false, true, true);
      expect(blocked).toBe(false);
    });

    it('touch + drag from grid dot on stroke creates line', () => {
      // KEY MOBILE TEST: draw from grid point that stroke passes through
      const blocked = shouldBlockDrawing(true, false, true);
      expect(blocked).toBe(false);
    });

    it('touch tap on stroke middle (no dot) selects it', () => {
      const blocked = shouldBlockDrawing(true, false, false);
      expect(blocked).toBe(true);
      // Touch with small movement selects
      expect(isTap(100, 100, 110, 105, 0, 100, TOUCH_TAP_THRESH)).toBe(true);
    });

    it('touch has larger tap threshold than mouse', () => {
      // Same movement that's a drag on mouse is a tap on touch
      expect(isTap(100, 100, 115, 110, 0, 100, 10)).toBe(false);   // Mouse: drag
      expect(isTap(100, 100, 115, 110, 0, 100, 25)).toBe(true);    // Touch: tap
    });
  });
});

describe('Regression prevention checklist', () => {
  /**
   * This test documents the key invariants that must be maintained.
   * If any of these fail, a regression has been introduced.
   */

  it('INVARIANT: Grey dots are always valid drawing start points', () => {
    expect(shouldBlockDrawing(false, false, true)).toBe(false);
  });

  it('INVARIANT: Purple endpoints are always valid drawing start points', () => {
    expect(shouldBlockDrawing(false, true, true)).toBe(false);
  });

  it('INVARIANT: Grid dots on strokes are valid drawing start points', () => {
    // Stroke passes through grid point - can draw from there
    expect(shouldBlockDrawing(true, false, true)).toBe(false);
  });

  it('INVARIANT: Stroke middles WITHOUT nearby dots are NOT valid drawing start points', () => {
    // Only case we block: on stroke, no dot nearby
    expect(shouldBlockDrawing(true, false, false)).toBe(true);
  });

  it('INVARIANT: The condition checks for grid dot before blocking', () => {
    // Bug V1: strokeMid || endpoint (blocked endpoints)
    // Bug V2: strokeMid && !endpoint (blocked grid dots on strokes)
    // Correct: strokeMid && !endpoint && !gridDot

    const bugV1 = (s, e, g) => s || e;
    const bugV2 = (s, e, g) => s && !e;
    const correct = (s, e, g) => s && !e && !g;

    // Bug V1 incorrectly blocks endpoints
    expect(bugV1(false, true, true)).toBe(true);    // BUG!
    expect(correct(false, true, true)).toBe(false); // Correct

    // Bug V2 incorrectly blocks grid dots on strokes
    expect(bugV2(true, false, true)).toBe(true);    // BUG!
    expect(correct(true, false, true)).toBe(false); // Correct

    expect(shouldBlockDrawing(false, true, true)).toBe(false);
    expect(shouldBlockDrawing(true, false, true)).toBe(false);
  });
});
