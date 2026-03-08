/**
 * Unit tests for default font data and expansion
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_FONT_DATA, expandFont, getDefaultStrokes } from '../src/defaultFont.js';
import { MX, MY, SP, STROKE_COLOR, ALL_CHARS } from '../src/config.js';

describe('DEFAULT_FONT_DATA', () => {
  it('contains all uppercase letters', () => {
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      expect(DEFAULT_FONT_DATA[letter]).toBeDefined();
      expect(Array.isArray(DEFAULT_FONT_DATA[letter])).toBe(true);
    }
  });

  it('contains all lowercase letters', () => {
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      expect(DEFAULT_FONT_DATA[letter]).toBeDefined();
      expect(Array.isArray(DEFAULT_FONT_DATA[letter])).toBe(true);
    }
  });

  it('contains all digits', () => {
    for (const digit of '0123456789') {
      expect(DEFAULT_FONT_DATA[digit]).toBeDefined();
      expect(Array.isArray(DEFAULT_FONT_DATA[digit])).toBe(true);
    }
  });

  it('stroke coordinates are valid (4 numbers per stroke)', () => {
    for (const [letter, segments] of Object.entries(DEFAULT_FONT_DATA)) {
      for (const segment of segments) {
        for (const stroke of segment) {
          expect(stroke.length).toBe(4);
          expect(typeof stroke[0]).toBe('number');
          expect(typeof stroke[1]).toBe('number');
          expect(typeof stroke[2]).toBe('number');
          expect(typeof stroke[3]).toBe('number');
        }
      }
    }
  });
});

describe('expandFont', () => {
  it('expands all characters', () => {
    const expanded = expandFont();

    for (const char of ALL_CHARS) {
      expect(expanded[char]).toBeDefined();
      expect(Array.isArray(expanded[char])).toBe(true);
    }
  });

  it('converts coordinates to pixel positions', () => {
    const expanded = expandFont();
    const aStrokes = expanded['A'];

    expect(aStrokes.length).toBeGreaterThan(0);

    // First stroke of A starts at (0,9) → x1 = MX + 0*SP, y1 = MY + 9*SP
    expect(aStrokes[0].x1).toBe(MX + 0 * SP);
    expect(aStrokes[0].y1).toBe(MY + 9 * SP);
  });

  it('includes stroke properties', () => {
    const expanded = expandFont();
    const stroke = expanded['A'][0];

    expect(stroke).toHaveProperty('x1');
    expect(stroke).toHaveProperty('y1');
    expect(stroke).toHaveProperty('x2');
    expect(stroke).toHaveProperty('y2');
    expect(stroke).toHaveProperty('color');
    expect(stroke).toHaveProperty('w');
    expect(stroke.color).toBe(STROKE_COLOR);
    expect(stroke.w).toBe(11);
  });

  it('respects custom default width', () => {
    const expanded = expandFont(DEFAULT_FONT_DATA, 20);
    const stroke = expanded['A'][0];

    expect(stroke.w).toBe(20);
  });

  it('flattens multi-segment characters', () => {
    // Letter 'i' has 2 segments (dot and stem)
    const expanded = expandFont();
    const iStrokes = expanded['i'];

    // Should be flattened into a single array
    expect(Array.isArray(iStrokes)).toBe(true);
    iStrokes.forEach(stroke => {
      expect(stroke).toHaveProperty('x1');
      expect(stroke).toHaveProperty('y1');
    });
  });
});

describe('getDefaultStrokes', () => {
  it('returns strokes for existing character', () => {
    const strokes = getDefaultStrokes('A');

    expect(Array.isArray(strokes)).toBe(true);
    expect(strokes.length).toBeGreaterThan(0);
    expect(strokes[0]).toHaveProperty('x1');
  });

  it('returns empty array for non-existent character', () => {
    const strokes = getDefaultStrokes('Ω');

    expect(Array.isArray(strokes)).toBe(true);
    expect(strokes.length).toBe(0);
  });

  it('respects custom width parameter', () => {
    const strokes = getDefaultStrokes('A', 15);

    expect(strokes[0].w).toBe(15);
  });
});
