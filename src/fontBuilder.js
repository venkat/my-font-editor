/**
 * Font building utilities for OTF generation
 * Uses opentype.js and polygon-clipping for font generation
 */

import {
  MX, SP, COLS, ROW_BASE, ROW_DESC,
  CAP_U, CAP_PX, UPM, MONO_ADV, GLYPH_LSB,
  BASE_Y, ALL_CHARS
} from './config.js';
import { sampleQuadraticBezier, buildCircleRing, buildCurvedStrokeRing } from './geometry.js';

// Circle polygon segment count for rounded caps
const CIRCLE_N = 16;

/**
 * Convert canvas-pixel coordinates to font units (y flipped, baseline=0)
 * Uses float arithmetic to prevent coincident edges that confuse polygon-clipping
 */
export function pixelToFontUnits(cx, cy) {
  return [
    (cx - MX) * CAP_U / CAP_PX + GLYPH_LSB,
    (BASE_Y - cy) * CAP_U / CAP_PX
  ];
}

/**
 * Build a circle ring (16-gon) for rounded caps and junctions
 * Offset by π/N to avoid axis-aligned points that cause polygon-clipping errors
 */
export function buildCircleRingFU(fx, fy, radius) {
  const ring = [];
  const offset = Math.PI / CIRCLE_N;

  for (let j = 0; j < CIRCLE_N; j++) {
    const angle = offset + (2 * Math.PI * j) / CIRCLE_N;
    ring.push([fx + radius * Math.cos(angle), fy + radius * Math.sin(angle)]);
  }

  ring.push(ring[0]); // Close the ring
  return ring;
}

/**
 * Sample points along a quadratic bezier curve (in font units)
 */
export function sampleQuadBezierFU(x1, y1, cx, cy, x2, y2, numSamples = 12) {
  const points = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const mt = 1 - t;
    const x = mt * mt * x1 + 2 * mt * t * cx + t * t * x2;
    const y = mt * mt * y1 + 2 * mt * t * cy + t * t * y2;
    points.push([x, y]);
  }

  return points;
}

/**
 * Create offset polygon for a curved stroke (for font outlines)
 */
export function buildCurvedStrokeRingFU(x1, y1, cx, cy, x2, y2, halfWidth) {
  const samples = sampleQuadBezierFU(x1, y1, cx, cy, x2, y2, 16);
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

/**
 * Build a single glyph from stroke data
 * @param {string} letter - The character
 * @param {number} unicode - Unicode code point
 * @param {Array} strokes - Array of stroke objects
 * @param {Object} opentype - opentype.js library reference
 * @param {Object} polygonClipping - polygon-clipping library reference
 */
export function makeGlyph(letter, unicode, strokes, opentype, polygonClipping) {
  if (!strokes || !strokes.length) {
    return new opentype.Glyph({
      name: letter,
      unicode: unicode,
      advanceWidth: MONO_ADV,
      path: new opentype.Path()
    });
  }

  const rings = [];
  const endpoints = new Map(); // key → [fx, fy, halfWidth]

  for (const s of strokes) {
    // Half-width in font units (Brutalita weight-400 = 12.5% of cap = hw of 44)
    const hw = Math.round(44 * (s.w || 11) / 11);
    const [x1, y1] = pixelToFontUnits(s.x1, s.y1);
    const [x2, y2] = pixelToFontUnits(s.x2, s.y2);

    // Track endpoints for circle caps
    const k1 = `${Math.round(x1)},${Math.round(y1)}`;
    const k2 = `${Math.round(x2)},${Math.round(y2)}`;
    if (!endpoints.has(k1)) endpoints.set(k1, [x1, y1, hw]);
    if (!endpoints.has(k2)) endpoints.set(k2, [x2, y2, hw]);

    // Handle curved strokes
    if (s.curved && s.cx !== undefined && s.cy !== undefined) {
      const [cx, cy] = pixelToFontUnits(s.cx, s.cy);
      rings.push(buildCurvedStrokeRingFU(x1, y1, cx, cy, x2, y2, hw));
      continue;
    }

    // Handle straight strokes
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len < 0.5) continue; // Zero-length dot: circle handled below

    const nx = -dy / len * hw;
    const ny = dx / len * hw;

    rings.push([
      [x1 - nx, y1 - ny],
      [x1 + nx, y1 + ny],
      [x2 + nx, y2 + ny],
      [x2 - nx, y2 - ny],
      [x1 - nx, y1 - ny], // Close
    ]);
  }

  // Rounded caps + filled junctions at every endpoint
  for (const [fx, fy, hw] of endpoints.values()) {
    rings.push(buildCircleRingFU(fx, fy, hw));
  }

  // Union all shapes
  let unioned;
  try {
    const multiPoly = rings.map(r => [r]);
    unioned = polygonClipping.union(multiPoly);
  } catch (e) {
    unioned = rings.map(r => [[r]]); // Fallback: no union
  }

  // Build OTF path from union result
  const path = new opentype.Path();
  for (const multi of unioned) {
    for (const ring of multi) {
      for (let i = 0; i < ring.length; i++) {
        const [x, y] = ring[i];
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
    }
  }

  return new opentype.Glyph({
    name: letter,
    unicode: unicode,
    advanceWidth: MONO_ADV,
    path
  });
}

/**
 * Build a complete OTF font from glyph data
 * @param {Object} glyphs - Map of letter → stroke arrays
 * @param {string} familyName - Font family name
 * @param {Object} opentype - opentype.js library reference
 * @param {Object} polygonClipping - polygon-clipping library reference
 */
export function buildOTFFont(glyphs, familyName, opentype, polygonClipping) {
  const glyphList = [
    new opentype.Glyph({
      name: '.notdef',
      unicode: 0,
      advanceWidth: MONO_ADV,
      path: new opentype.Path()
    }),
    new opentype.Glyph({
      name: 'space',
      unicode: 32,
      advanceWidth: Math.round(MONO_ADV * 0.6),
      path: new opentype.Path()
    }),
  ];

  // Build glyph for each character
  ALL_CHARS.forEach(letter => {
    const strokes = glyphs[letter] || [];
    glyphList.push(makeGlyph(letter, letter.codePointAt(0), strokes, opentype, polygonClipping));
  });

  const ascender = Math.round(CAP_U + 50);
  const descender = -Math.round((ROW_DESC - ROW_BASE) * SP * CAP_U / CAP_PX);

  return new opentype.Font({
    familyName: familyName || 'MyFont',
    styleName: 'Regular',
    unitsPerEm: UPM,
    ascender: ascender,
    descender: descender,
    glyphs: glyphList
  });
}
