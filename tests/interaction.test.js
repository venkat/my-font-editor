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

// ═══════════════════════════════════════════════════════
// EDIT MODE: Drag state machine tests
// ═══════════════════════════════════════════════════════

/**
 * Simulates the EDIT mode touch state machine for drag interactions.
 * Models the sticky DRAG_PENDING approach: when a selection exists,
 * any touch optimistically enters DRAG_PENDING, and promotes to
 * DRAGGING only after enough movement.
 *
 * @param {string} initialState - Starting state ('IDLE', 'EDIT_SELECTED', etc.)
 * @param {object|null} selectedItem - Current selection or null
 * @param {object[]} events - Array of { type: 'start'|'move'|'end', x, y }
 * @returns {{ finalState: string, dragStarted: boolean, undoRolledBack: boolean }}
 */
function simulateEditTouch(initialState, selectedItem, events) {
  let state = initialState;
  let dragStarted = false;
  let undoRolledBack = false;
  let undoPushed = false;
  let pressStart = null;
  const DRAG_PROMOTE_THRESH = 8;

  for (const evt of events) {
    if (evt.type === 'start') {
      pressStart = { x: evt.x, y: evt.y };

      if (selectedItem && state === 'EDIT_SELECTED') {
        // Sticky model: any touch when selected → DRAG_PENDING
        undoPushed = true;
        state = 'EDIT_DRAG_PENDING';
      } else {
        state = 'EDIT_PENDING';
      }

    } else if (evt.type === 'move') {
      if (state === 'EDIT_DRAG_PENDING' && pressStart) {
        const dist = Math.hypot(evt.x - pressStart.x, evt.y - pressStart.y);
        if (dist > DRAG_PROMOTE_THRESH) {
          state = 'EDIT_DRAGGING';
          dragStarted = true;
        }
        // else: not enough movement, stay in DRAG_PENDING
      }
      // EDIT_DRAGGING: drag in progress (handled by caller)

    } else if (evt.type === 'end') {
      if (state === 'EDIT_DRAG_PENDING') {
        // Never promoted → was a tap, roll back undo
        if (undoPushed) undoRolledBack = true;
        state = 'EDIT_PENDING'; // fall through to tap handling
      } else if (state === 'EDIT_DRAGGING') {
        state = 'EDIT_SELECTED';
      }
      pressStart = null;
    }
  }

  return { finalState: state, dragStarted, undoRolledBack };
}

describe('EDIT mode drag state machine', () => {
  const dot = { type: 'dot', strokeIdx: 0, endpoint: 'start', x: 100, y: 100 };
  const stroke = { type: 'stroke', strokeIdx: 0 };

  describe('Sticky DRAG_PENDING model', () => {
    it('touch on selected item with enough movement promotes to DRAGGING', () => {
      const result = simulateEditTouch('EDIT_SELECTED', dot, [
        { type: 'start', x: 120, y: 120 },  // 28px from dot — would FAIL with old 60px check
        { type: 'move', x: 130, y: 130 },    // 14px from start — promotes
        { type: 'end', x: 130, y: 130 }
      ]);
      expect(result.dragStarted).toBe(true);
      expect(result.finalState).toBe('EDIT_SELECTED');
      expect(result.undoRolledBack).toBe(false);
    });

    it('touch on selected item without movement is treated as tap', () => {
      const result = simulateEditTouch('EDIT_SELECTED', dot, [
        { type: 'start', x: 120, y: 120 },
        { type: 'end', x: 122, y: 122 }      // 2.8px movement — not enough
      ]);
      expect(result.dragStarted).toBe(false);
      expect(result.undoRolledBack).toBe(true);
      expect(result.finalState).toBe('EDIT_PENDING');
    });

    it('touch far from selected item still enters DRAG_PENDING (sticky)', () => {
      // This is the KEY difference from the old approach:
      // Old: 60px threshold check → fails silently → drag never starts
      // New: any touch → DRAG_PENDING → promotes on movement
      const result = simulateEditTouch('EDIT_SELECTED', dot, [
        { type: 'start', x: 180, y: 180 },   // 113px from dot — would ALWAYS fail old check
        { type: 'move', x: 190, y: 190 },     // 14px movement — promotes
        { type: 'end', x: 190, y: 190 }
      ]);
      expect(result.dragStarted).toBe(true);
      expect(result.finalState).toBe('EDIT_SELECTED');
    });

    it('selected stroke: any touch + movement starts curve drag', () => {
      const result = simulateEditTouch('EDIT_SELECTED', stroke, [
        { type: 'start', x: 50, y: 50 },
        { type: 'move', x: 60, y: 60 },       // 14px — promotes
        { type: 'end', x: 60, y: 60 }
      ]);
      expect(result.dragStarted).toBe(true);
    });

    it('micro-movements below threshold do not promote to drag', () => {
      const result = simulateEditTouch('EDIT_SELECTED', dot, [
        { type: 'start', x: 100, y: 100 },
        { type: 'move', x: 103, y: 103 },     // 4.2px — below 8px threshold
        { type: 'move', x: 105, y: 105 },     // 7.1px — still below
        { type: 'end', x: 105, y: 105 }
      ]);
      expect(result.dragStarted).toBe(false);
      expect(result.undoRolledBack).toBe(true);
    });

    it('movement just above threshold promotes to drag', () => {
      const result = simulateEditTouch('EDIT_SELECTED', dot, [
        { type: 'start', x: 100, y: 100 },
        { type: 'move', x: 106, y: 106 },     // 8.5px — just above 8px
        { type: 'end', x: 106, y: 106 }
      ]);
      expect(result.dragStarted).toBe(true);
    });
  });

  describe('No selection: tap to select', () => {
    it('tap with no selection enters EDIT_PENDING for selection', () => {
      const result = simulateEditTouch('IDLE', null, [
        { type: 'start', x: 100, y: 100 },
        { type: 'end', x: 100, y: 100 }
      ]);
      expect(result.finalState).toBe('EDIT_PENDING');
      expect(result.dragStarted).toBe(false);
    });

    it('no undo is pushed when no selection exists', () => {
      const result = simulateEditTouch('IDLE', null, [
        { type: 'start', x: 100, y: 100 },
        { type: 'move', x: 120, y: 120 },
        { type: 'end', x: 120, y: 120 }
      ]);
      expect(result.undoRolledBack).toBe(false);
    });
  });

  describe('Short stroke tiebreaker', () => {
    /**
     * When both endpoint and strokeMid are found for the same short stroke,
     * prefer stroke selection (bending is more useful for short strokes).
     */
    function shortStrokeTiebreaker(endpoint, strokeMid, strokeLen, SP) {
      if (endpoint && strokeMid && strokeMid.strokeIdx === endpoint.strokeIdx) {
        if (strokeLen < SP * 2) {
          return 'stroke'; // Prefer bending for short strokes
        }
        return endpoint.dist < strokeMid.dist ? 'endpoint' : 'stroke';
      }
      if (endpoint) return 'endpoint';
      if (strokeMid) return 'stroke';
      return 'none';
    }

    it('short stroke (31px, 1 grid spacing): prefers stroke selection', () => {
      const result = shortStrokeTiebreaker(
        { strokeIdx: 0, dist: 10 },
        { strokeIdx: 0, dist: 15 },
        31, 31  // strokeLen = SP = 31px (1 grid spacing)
      );
      expect(result).toBe('stroke');
    });

    it('long stroke: uses distance-based tiebreaker', () => {
      const result = shortStrokeTiebreaker(
        { strokeIdx: 0, dist: 10 },
        { strokeIdx: 0, dist: 15 },
        93, 31  // strokeLen = 3*SP (3 grid spacings)
      );
      expect(result).toBe('endpoint'); // endpoint is closer
    });

    it('long stroke: stroke wins when closer', () => {
      const result = shortStrokeTiebreaker(
        { strokeIdx: 0, dist: 20 },
        { strokeIdx: 0, dist: 10 },
        93, 31
      );
      expect(result).toBe('stroke');
    });

    it('different strokes: no tiebreaker, uses closest', () => {
      const result = shortStrokeTiebreaker(
        { strokeIdx: 0, dist: 10 },
        { strokeIdx: 1, dist: 15 },
        31, 31
      );
      // Different stroke indices — no tiebreaker applies
      expect(result).toBe('endpoint');
    });
  });
});
