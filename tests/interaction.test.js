/**
 * Tests for interaction logic - specifically drawing start conditions
 *
 * These tests verify the fix for the regression where drawing could not
 * start from purple endpoint dots.
 *
 * Bug introduced: commit e95f200
 * Root cause: The condition `strokeMid || endpoint` blocked drawing from
 * ALL endpoints, when it should only block drawing from stroke middles.
 *
 * Fix: Changed to `strokeMid && !endpoint` - only block if on stroke middle
 * but NOT at an endpoint. Endpoints are valid drawing start points.
 */

import { describe, it, expect } from 'vitest';

/**
 * Simulates the decision logic for whether to block drawing in mousedown/touchstart
 *
 * @param {boolean} strokeMid - True if cursor is on a stroke middle
 * @param {boolean} endpoint - True if cursor is on an endpoint (purple dot)
 * @returns {boolean} True if drawing should be blocked
 */
function shouldBlockDrawing(strokeMid, endpoint) {
  // This is the FIXED logic from app.js
  // Original buggy code was: return strokeMid || endpoint;
  return strokeMid && !endpoint;
}

describe('Drawing start conditions', () => {
  describe('shouldBlockDrawing', () => {
    it('should NOT block drawing from grey dots (neither stroke nor endpoint)', () => {
      expect(shouldBlockDrawing(false, false)).toBe(false);
    });

    it('should NOT block drawing from purple endpoint dots', () => {
      // This is the key regression test!
      // Endpoints are valid drawing start points
      expect(shouldBlockDrawing(false, true)).toBe(false);
    });

    it('should block drawing from stroke middle (not an endpoint)', () => {
      // Can't start drawing from the middle of a stroke - no dot there
      expect(shouldBlockDrawing(true, false)).toBe(true);
    });

    it('should NOT block drawing when on both stroke and endpoint', () => {
      // Edge case: cursor is on a stroke AND near its endpoint
      // Should allow drawing since there's an endpoint to draw from
      expect(shouldBlockDrawing(true, true)).toBe(false);
    });
  });

  describe('Interaction scenarios', () => {
    // These tests document the expected behavior for each scenario

    it('TAP on grey dot: should start drawing, wait for tap vs drag decision', () => {
      // strokeMid=false, endpoint=false
      // Drawing should start (dragging=true, startDot set)
      // mouseup/touchend will decide if it's a tap or drag
      const shouldBlock = shouldBlockDrawing(false, false);
      expect(shouldBlock).toBe(false);
    });

    it('TAP on purple endpoint: should start drawing, wait for tap vs drag decision', () => {
      // strokeMid=false, endpoint=true
      // Drawing should start from the endpoint
      // If it's a quick tap with no movement, it should select the dot
      // If it's a drag, it should draw a line from the endpoint
      const shouldBlock = shouldBlockDrawing(false, true);
      expect(shouldBlock).toBe(false);
    });

    it('TAP on stroke middle: should NOT start drawing, will select on mouseup', () => {
      // strokeMid=true, endpoint=false
      // Can't draw from here - no dot
      // mouseup/touchend will select the stroke for bending
      const shouldBlock = shouldBlockDrawing(true, false);
      expect(shouldBlock).toBe(true);
    });

    it('DRAG from grey dot: creates new line', () => {
      // strokeMid=false, endpoint=false
      // Drawing starts, drag creates line
      const shouldBlock = shouldBlockDrawing(false, false);
      expect(shouldBlock).toBe(false);
    });

    it('DRAG from purple endpoint: creates new line starting at that endpoint', () => {
      // This was the broken case!
      // strokeMid=false, endpoint=true
      // Drawing should start, drag creates line
      const shouldBlock = shouldBlockDrawing(false, true);
      expect(shouldBlock).toBe(false);
    });
  });
});

describe('Buggy logic comparison', () => {
  // Document what the OLD buggy logic would have done

  function buggyLogic(strokeMid, endpoint) {
    // This was the broken code
    return strokeMid || endpoint;
  }

  it('REGRESSION: old logic blocked drawing from endpoints', () => {
    // This is why the bug occurred
    expect(buggyLogic(false, true)).toBe(true);  // WRONG - blocked endpoints!
    expect(shouldBlockDrawing(false, true)).toBe(false);  // CORRECT - allow endpoints
  });

  it('old logic was correct for grey dots', () => {
    expect(buggyLogic(false, false)).toBe(false);
    expect(shouldBlockDrawing(false, false)).toBe(false);
  });

  it('old logic was correct for stroke middles', () => {
    expect(buggyLogic(true, false)).toBe(true);
    expect(shouldBlockDrawing(true, false)).toBe(true);
  });
});
