/**
 * Unit tests for geometry utilities
 */

import { describe, it, expect } from 'vitest';
import {
  distance,
  snapToGrid,
  clampControlPoint,
  distanceToLineSegment,
  sampleQuadraticBezier,
  pointOnBezier,
  dotsEqual,
  findNearestDot,
  generateGridDots,
  buildCircleRing
} from '../src/geometry.js';
import { MX, MY, SP, COLS, ROW_DESC, CURVE_MAX_DIST } from '../src/config.js';

describe('distance', () => {
  it('calculates distance between two points', () => {
    expect(distance(0, 0, 3, 4)).toBe(5);
    expect(distance(0, 0, 0, 0)).toBe(0);
    expect(distance(1, 1, 4, 5)).toBe(5);
  });

  it('handles negative coordinates', () => {
    expect(distance(-3, -4, 0, 0)).toBe(5);
  });
});

describe('snapToGrid', () => {
  it('snaps to nearest grid intersection', () => {
    const result = snapToGrid(MX + SP * 2 + 5, MY + SP * 3 + 5);
    expect(result.c).toBe(2);
    expect(result.r).toBe(3);
    expect(result.x).toBe(MX + SP * 2);
    expect(result.y).toBe(MY + SP * 3);
  });

  it('clamps to grid boundaries', () => {
    // Test left boundary
    const left = snapToGrid(0, MY + SP);
    expect(left.c).toBe(0);

    // Test right boundary
    const right = snapToGrid(MX + COLS * SP + 100, MY + SP);
    expect(right.c).toBe(COLS);

    // Test top boundary (row 1 minimum)
    const top = snapToGrid(MX, 0);
    expect(top.r).toBe(1);

    // Test bottom boundary
    const bottom = snapToGrid(MX, MY + ROW_DESC * SP + 100);
    expect(bottom.r).toBe(ROW_DESC);
  });
});

describe('clampControlPoint', () => {
  it('clamps control point to max distance from midpoint', () => {
    const x1 = MX + SP;
    const y1 = MY + SP * 5;
    const x2 = MX + SP * 3;
    const y2 = MY + SP * 5;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Try to place control point very far away
    const result = clampControlPoint(x1, y1, x2, y2, midX, midY + 1000);

    // Should be clamped to max distance
    const dist = distance(result.cx, result.cy, midX, midY);
    expect(dist).toBeLessThanOrEqual(CURVE_MAX_DIST + 0.01);
  });

  it('clamps to grid boundaries', () => {
    const x1 = MX + SP;
    const y1 = MY + SP * 5;
    const x2 = MX + SP * 3;
    const y2 = MY + SP * 5;

    // Try to place control point outside grid
    const result = clampControlPoint(x1, y1, x2, y2, -100, -100);

    expect(result.cx).toBeGreaterThanOrEqual(MX);
    expect(result.cy).toBeGreaterThanOrEqual(MY + SP);
  });
});

describe('distanceToLineSegment', () => {
  it('returns distance to closest point on segment', () => {
    // Point perpendicular to middle of horizontal line
    const dist = distanceToLineSegment(5, 5, 0, 0, 10, 0);
    expect(dist).toBe(5);
  });

  it('returns distance to endpoint when outside segment', () => {
    // Point beyond end of line
    const dist = distanceToLineSegment(15, 0, 0, 0, 10, 0);
    expect(dist).toBe(5);
  });

  it('handles zero-length segments', () => {
    const dist = distanceToLineSegment(3, 4, 0, 0, 0, 0);
    expect(dist).toBe(5);
  });
});

describe('sampleQuadraticBezier', () => {
  it('returns correct number of samples', () => {
    const samples = sampleQuadraticBezier(0, 0, 50, 50, 100, 0, 10);
    expect(samples.length).toBe(11); // 0 to 10 inclusive
  });

  it('starts and ends at correct points', () => {
    const samples = sampleQuadraticBezier(0, 0, 50, 50, 100, 0, 10);
    expect(samples[0]).toEqual([0, 0]);
    expect(samples[10]).toEqual([100, 0]);
  });
});

describe('pointOnBezier', () => {
  it('returns start point at t=0', () => {
    const point = pointOnBezier(10, 20, 50, 50, 100, 30, 0);
    expect(point.x).toBe(10);
    expect(point.y).toBe(20);
  });

  it('returns end point at t=1', () => {
    const point = pointOnBezier(10, 20, 50, 50, 100, 30, 1);
    expect(point.x).toBe(100);
    expect(point.y).toBe(30);
  });

  it('returns midpoint influenced by control point', () => {
    const point = pointOnBezier(0, 0, 50, 100, 100, 0, 0.5);
    // At t=0.5: (0.25*0 + 0.5*50 + 0.25*100, 0.25*0 + 0.5*100 + 0.25*0)
    expect(point.x).toBe(50);
    expect(point.y).toBe(50);
  });
});

describe('dotsEqual', () => {
  it('returns true for same grid position', () => {
    const a = { c: 2, r: 3, x: 100, y: 200 };
    const b = { c: 2, r: 3, x: 100, y: 200 };
    expect(dotsEqual(a, b)).toBe(true);
  });

  it('returns false for different positions', () => {
    const a = { c: 2, r: 3 };
    const b = { c: 2, r: 4 };
    expect(dotsEqual(a, b)).toBe(false);
  });

  it('handles null values', () => {
    expect(dotsEqual(null, null)).toBe(false);
    expect(dotsEqual({ c: 1, r: 1 }, null)).toBe(false);
  });
});

describe('generateGridDots', () => {
  it('generates correct number of dots', () => {
    const dots = generateGridDots();
    const expectedCount = ROW_DESC * (COLS + 1); // rows 1-11, cols 0-4
    expect(dots.length).toBe(expectedCount);
  });

  it('first dot is at row 1, col 0', () => {
    const dots = generateGridDots();
    expect(dots[0].c).toBe(0);
    expect(dots[0].r).toBe(1);
    expect(dots[0].x).toBe(MX);
    expect(dots[0].y).toBe(MY + SP);
  });
});

describe('findNearestDot', () => {
  it('finds nearest dot within threshold', () => {
    const dots = [
      { x: 0, y: 0, c: 0, r: 0 },
      { x: 100, y: 0, c: 1, r: 0 },
      { x: 200, y: 0, c: 2, r: 0 }
    ];
    const nearest = findNearestDot(105, 5, dots, 20);
    expect(nearest.c).toBe(1);
  });

  it('returns null when no dot within threshold', () => {
    const dots = [{ x: 0, y: 0, c: 0, r: 0 }];
    const nearest = findNearestDot(100, 100, dots, 10);
    expect(nearest).toBeNull();
  });
});

describe('buildCircleRing', () => {
  it('returns correct number of points plus closing point', () => {
    const ring = buildCircleRing(50, 50, 10, 16);
    expect(ring.length).toBe(17); // 16 points + 1 closing
  });

  it('closes the ring', () => {
    const ring = buildCircleRing(50, 50, 10, 16);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it('points are at correct distance from center', () => {
    const ring = buildCircleRing(50, 50, 10, 16);
    for (let i = 0; i < ring.length - 1; i++) {
      const dist = distance(ring[i][0], ring[i][1], 50, 50);
      expect(dist).toBeCloseTo(10, 5);
    }
  });
});
