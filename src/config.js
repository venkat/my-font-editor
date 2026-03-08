/**
 * Application configuration and constants
 * All grid dimensions, colors, and sizing parameters
 */

// Grid dimensions
export const COLS = 4;
export const ROWS = 12;
export const SP = 31;           // Grid spacing in pixels
export const MX = 38;           // Horizontal margin
export const MY = 12;           // Vertical margin

// Canvas dimensions (computed)
export const CW = COLS * SP + MX * 2;  // Canvas width: 200px

// Typography row landmarks
export const ROW_CAP = 1;       // Cap height line
export const ROW_XHGT = 3;      // x-height line
export const ROW_BASE = 9;      // Baseline
export const ROW_DESC = 11;     // Descender line

// Canvas height: tight fit for rows 1-11 with padding
export const CH = MY + ROW_DESC * SP + 20;

// Dot sizes (proportional to grid spacing)
export const DOT_LG = Math.round(SP * 0.27);   // Large grid dots
export const DOT_SM = Math.round(SP * 0.13);   // Small grid dots
export const DOT_EP = Math.round(SP * 0.22);   // Endpoint dots
export const DOT_HV = Math.round(SP * 0.27);   // Hover state dots

// Interaction thresholds
export const SNAP = 22;                        // Snap distance for dots
export const TAP_THRESHOLD = 10;               // Max movement for tap detection
export const TAP_TIME_LIMIT = 300;             // Max time for tap detection (ms)
export const CURVE_MAX_DIST = SP * 1.5;        // Max control point distance

// Font metrics
export const UPM = 1000;                       // Units per em
export const CAP_PX = (ROW_BASE - ROW_CAP) * SP;
export const CAP_U = 700;                      // Cap height in font units
export const BASE_Y = MY + ROW_BASE * SP;      // Baseline Y position
export const MONO_ADV = 700;                   // Monospace advance width
export const GLYPH_LSB = 175;                  // Left side bearing

// Colors
export const STROKE_COLOR = '#1e1b2e';

// Character sets
export const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const LOWER = 'abcdefghijklmnopqrstuvwxyz'.split('');
export const DIGITS = '0123456789'.split('');
export const SYMBOLS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~\u00b4'.split('');
export const ALL_CHARS = [...UPPER, ...LOWER, ...DIGITS, ...SYMBOLS];
