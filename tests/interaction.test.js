/**
 * Tests for interaction logic - specifically drawing start conditions
 *
 * CRITICAL LESSON: Tests must model the FULL decision logic, not a simplified version.
 * The real code checks: strokeMid, endpoint, AND gridDot (3 parameters).
 * Tests that only check 2 parameters will miss edge cases.
 *
 * Bug history:
 * - V1 (commit e95f200): `strokeMid || endpoint` blocked ALL endpoints
 * - V2: `strokeMid && !endpoint` blocked grid dots on strokes
 * - Fix: `strokeMid && !endpoint && !gridDot` - only block when NO dot nearby
 *
 * Valid drawing start points:
 * - Grey dots (no stroke nearby)
 * - Purple endpoint dots
 * - Grid dots that strokes pass through (e.g., middle of crossbar on "A")
 *
 * Invalid drawing start point:
 * - Stroke middle with no nearby grid dot (select stroke instead)
 */

import { describe, it, expect } from 'vitest';

/**
 * Simulates the decision logic for whether to block drawing in mousedown/touchstart
 *
 * @param {boolean} strokeMid - True if cursor is on a stroke middle
 * @param {boolean} endpoint - True if cursor is on an endpoint (purple dot)
 * @param {boolean} gridDot - True if cursor is near a grid dot (grey or purple)
 * @returns {boolean} True if drawing should be blocked
 */
function shouldBlockDrawing(strokeMid, endpoint, gridDot = false) {
  // This is the FIXED logic from app.js
  // Only block if on stroke AND NOT at endpoint AND NOT at grid dot
  // This allows drawing from any grid point, even if a stroke passes through it
  return strokeMid && !endpoint && !gridDot;
}

describe('Drawing start conditions', () => {
  describe('shouldBlockDrawing', () => {
    it('should NOT block drawing from grey dots (neither stroke nor endpoint)', () => {
      expect(shouldBlockDrawing(false, false, true)).toBe(false);
    });

    it('should NOT block drawing from purple endpoint dots', () => {
      // Endpoints are valid drawing start points
      expect(shouldBlockDrawing(false, true, true)).toBe(false);
    });

    it('should block drawing from stroke middle with NO nearby dot', () => {
      // Can't start drawing from the middle of a stroke where there's no dot
      expect(shouldBlockDrawing(true, false, false)).toBe(true);
    });

    it('should NOT block drawing when on both stroke and endpoint', () => {
      // Cursor is on a stroke AND near its endpoint
      expect(shouldBlockDrawing(true, true, true)).toBe(false);
    });

    it('should NOT block drawing from grid dot that stroke passes through', () => {
      // KEY TEST: stroke passes through a grid point that's not an endpoint
      // User should be able to draw from that grid point
      expect(shouldBlockDrawing(true, false, true)).toBe(false);
    });

    it('should block ONLY when on stroke with no nearby dots at all', () => {
      // The only case we block: stroke middle, no endpoint, no grid dot
      expect(shouldBlockDrawing(true, false, false)).toBe(true);
      // All other cases allow drawing:
      expect(shouldBlockDrawing(true, false, true)).toBe(false);  // has grid dot
      expect(shouldBlockDrawing(true, true, true)).toBe(false);   // has endpoint
      expect(shouldBlockDrawing(false, false, true)).toBe(false); // no stroke
    });
  });

  describe('Interaction scenarios', () => {
    // These tests document the expected behavior for each scenario

    it('TAP on grey dot: should start drawing, wait for tap vs drag decision', () => {
      // On grey dot, no stroke
      const shouldBlock = shouldBlockDrawing(false, false, true);
      expect(shouldBlock).toBe(false);
    });

    it('TAP on purple endpoint: should start drawing, wait for tap vs drag decision', () => {
      // On endpoint (which is also a grid dot)
      const shouldBlock = shouldBlockDrawing(false, true, true);
      expect(shouldBlock).toBe(false);
    });

    it('TAP on stroke middle with NO nearby dot: should select stroke', () => {
      // On stroke middle, no dot nearby
      const shouldBlock = shouldBlockDrawing(true, false, false);
      expect(shouldBlock).toBe(true);
    });

    it('TAP on grid dot that stroke passes through: should start drawing', () => {
      // KEY SCENARIO: stroke passes through a grid point
      // User should be able to draw from that point
      const shouldBlock = shouldBlockDrawing(true, false, true);
      expect(shouldBlock).toBe(false);
    });

    it('DRAG from grey dot: creates new line', () => {
      const shouldBlock = shouldBlockDrawing(false, false, true);
      expect(shouldBlock).toBe(false);
    });

    it('DRAG from purple endpoint: creates new line starting at that endpoint', () => {
      const shouldBlock = shouldBlockDrawing(false, true, true);
      expect(shouldBlock).toBe(false);
    });

    it('DRAG from grid dot on stroke: creates new line from that dot', () => {
      // Stroke passes through grid point, drag from it creates line
      const shouldBlock = shouldBlockDrawing(true, false, true);
      expect(shouldBlock).toBe(false);
    });
  });
});

describe('Buggy logic comparison', () => {
  // Document what the OLD buggy logic would have done

  function buggyLogicV1(strokeMid, endpoint) {
    // Original bug (commit e95f200): blocked all endpoints
    return strokeMid || endpoint;
  }

  function buggyLogicV2(strokeMid, endpoint) {
    // Second bug: blocked grid dots on strokes
    return strokeMid && !endpoint;
  }

  it('REGRESSION V1: blocked drawing from endpoints', () => {
    expect(buggyLogicV1(false, true)).toBe(true);  // WRONG
    expect(shouldBlockDrawing(false, true, true)).toBe(false);  // CORRECT
  });

  it('REGRESSION V2: blocked drawing from grid dots on strokes', () => {
    // Stroke passes through a grid point - should allow drawing
    expect(buggyLogicV2(true, false)).toBe(true);  // WRONG - blocked grid dots!
    expect(shouldBlockDrawing(true, false, true)).toBe(false);  // CORRECT
  });

  it('correct logic only blocks stroke middle with NO nearby dots', () => {
    // The ONLY case we should block
    expect(shouldBlockDrawing(true, false, false)).toBe(true);
  });
});
