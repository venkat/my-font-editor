/**
 * Pure geometry utility functions
 * All functions are stateless and easily testable
 */

import { MX, MY, SP, COLS, ROW_DESC, CURVE_MAX_DIST } from './config.js';

/**
 * Calculate distance between two points
 */
export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Convert pixel coordinates to font units
 * Y is flipped (baseline = 0)
 */
export function pixelsToFontUnits(px, py, baseY, capU, capPx, glyphLsb) {
  return [
    (px - MX) * capU / capPx + glyphLsb,
    (baseY - py) * capU / capPx
  ];
}

/**
 * Snap coordinates to nearest grid intersection
 * Returns snapped position and grid coordinates
 */
export function snapToGrid(x, y) {
  const col = Math.round((x - MX) / SP);
  const row = Math.round((y - MY) / SP);

  // Constrain to valid grid: cols 0-COLS, rows 1-ROW_DESC
  const snappedCol = Math.max(0, Math.min(COLS, col));
  const snappedRow = Math.max(1, Math.min(ROW_DESC, row));

  return {
    x: MX + snappedCol * SP,
    y: MY + snappedRow * SP,
    c: snappedCol,
    r: snappedRow
  };
}

/**
 * Clamp control point to reasonable distance from line midpoint
 * Also constrains to grid boundaries
 */
export function clampControlPoint(x1, y1, x2, y2, cx, cy) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Clamp to max distance from midpoint
  const dist = distance(cx, cy, midX, midY);
  if (dist > CURVE_MAX_DIST) {
    const scale = CURVE_MAX_DIST / dist;
    cx = midX + (cx - midX) * scale;
    cy = midY + (cy - midY) * scale;
  }

  // Clamp to grid boundaries
  const minX = MX;
  const maxX = MX + COLS * SP;
  const minY = MY + 1 * SP;
  const maxY = MY + ROW_DESC * SP;

  cx = Math.max(minX, Math.min(maxX, cx));
  cy = Math.max(minY, Math.min(maxY, cy));

  return { cx, cy };
}

/**
 * Calculate distance from point to line segment
 */
export function distanceToLineSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return distance(px, py, x1, y1);
  }

  // Project point onto line, clamped to segment
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;

  return distance(px, py, closestX, closestY);
}

/**
 * Sample points along a quadratic bezier curve
 * Returns array of [x, y] points
 */
export function sampleQuadraticBezier(x1, y1, cx, cy, x2, y2, numSamples = 12) {
  const points = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const mt = 1 - t;

    // Quadratic bezier formula: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
    const x = mt * mt * x1 + 2 * mt * t * cx + t * t * x2;
    const y = mt * mt * y1 + 2 * mt * t * cy + t * t * y2;

    points.push([x, y]);
  }

  return points;
}

/**
 * Calculate point on quadratic bezier at parameter t
 */
export function pointOnBezier(x1, y1, cx, cy, x2, y2, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * x1 + 2 * mt * t * cx + t * t * x2,
    y: mt * mt * y1 + 2 * mt * t * cy + t * t * y2
  };
}

/**
 * Check if point is near a straight stroke
 */
export function isNearStraightStroke(px, py, stroke, threshold) {
  const dist = distanceToLineSegment(px, py, stroke.x1, stroke.y1, stroke.x2, stroke.y2);
  return dist < threshold;
}

/**
 * Check if point is near a curved stroke
 */
export function isNearCurvedStroke(px, py, stroke, threshold, sampleStep = 0.05) {
  for (let t = 0; t <= 1; t += sampleStep) {
    const point = pointOnBezier(
      stroke.x1, stroke.y1,
      stroke.cx, stroke.cy,
      stroke.x2, stroke.y2,
      t
    );
    if (distance(px, py, point.x, point.y) < threshold) {
      return true;
    }
  }
  return false;
}

/**
 * Generate all dot positions on the grid
 */
export function generateGridDots() {
  const dots = [];
  for (let r = 1; r <= ROW_DESC; r++) {
    for (let c = 0; c <= COLS; c++) {
      dots.push({
        x: MX + c * SP,
        y: MY + r * SP,
        c,
        r
      });
    }
  }
  return dots;
}

/**
 * Find nearest dot to a point within threshold
 */
export function findNearestDot(px, py, dots, threshold) {
  let best = null;
  let bestDist = threshold;

  for (const d of dots) {
    const dist = distance(d.x, d.y, px, py);
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }

  return best;
}

/**
 * Check if two dots are equal (same grid position)
 */
export function dotsEqual(a, b) {
  if (!a || !b) return false;
  return a.c === b.c && a.r === b.r;
}

/**
 * Build a 16-gon ring (circle approximation) for font outlines
 */
export function buildCircleRing(cx, cy, radius, segments = 16) {
  const ring = [];
  const offset = Math.PI / segments; // Half-step offset to avoid axis-aligned points

  for (let j = 0; j < segments; j++) {
    const angle = offset + (2 * Math.PI * j) / segments;
    ring.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }

  ring.push(ring[0]); // Close the ring
  return ring;
}

/**
 * Build offset polygon for a curved stroke (for font outlines)
 */
export function buildCurvedStrokeRing(x1, y1, cx, cy, x2, y2, halfWidth) {
  const samples = sampleQuadraticBezier(x1, y1, cx, cy, x2, y2, 16);
  const leftSide = [];
  const rightSide = [];

  for (let i = 0; i < samples.length; i++) {
    const [px, py] = samples[i];

    // Calculate tangent direction
    let dx, dy;
    if (i === 0) {
      dx = samples[1][0] - samples[0][0];
      dy = samples[1][1] - samples[0][1];
    } else if (i === samples.length - 1) {
      dx = samples[i][0] - samples[i - 1][0];
      dy = samples[i][1] - samples[i - 1][1];
    } else {
      dx = samples[i + 1][0] - samples[i - 1][0];
      dy = samples[i + 1][1] - samples[i - 1][1];
    }

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.001) continue;

    const nx = -dy / len * halfWidth;
    const ny = dx / len * halfWidth;

    leftSide.push([px - nx, py - ny]);
    rightSide.push([px + nx, py + ny]);
  }

  const ring = [...leftSide, ...rightSide.reverse()];
  ring.push(ring[0]); // Close
  return ring;
}
