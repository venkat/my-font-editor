// ═══════════════════════════════════════════════════════
// MY FONT MAKER - App JavaScript
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════
const COLS=4, ROWS=12, SP=40, MX=20, MY=15;
const CW = COLS*SP + MX*2;            // 200
// Row landmarks — declared before CH which depends on ROW_DESC
const ROW_CAP=1, ROW_XHGT=3, ROW_BASE=9, ROW_DESC=11;
const CH = (ROW_DESC+1)*SP + MY*2;    // 520 — keeps stroke room below descender
// Dot sizes
const DOT_LG=Math.round(SP*0.27);     // ≈ 11px
const DOT_SM=Math.round(SP*0.13);     // ≈ 5px
const DOT_EP=Math.round(SP*0.22);     // ≈ 9px
const DOT_HV=Math.round(SP*0.27);
const SNAP=22;
const UPM=1000;
const CAP_PX = (ROW_BASE-ROW_CAP)*SP; // 320
const CAP_U  = 700;
const px2u   = v => Math.round(v*CAP_U/CAP_PX);
const BASE_Y = MY + ROW_BASE*SP;       // 380
const ADV_W  = Math.round(COLS*SP*CAP_U/CAP_PX) + Math.round(SP*CAP_U/CAP_PX);

const UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LOWER   = 'abcdefghijklmnopqrstuvwxyz'.split('');
const DIGITS  = '0123456789'.split('');
const SYMBOLS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~\u00b4'.split('');
const ALL_CHARS = [...UPPER,...LOWER,...DIGITS,...SYMBOLS];
const ALL_LTR   = ALL_CHARS; // alias used internally
const STROKE_COLOR = '#1e1b2e';

// ═══════════════════════════════════════════════════════
// INTERACTION MODE — Smart mode with tap-to-select, dot movement, and curve bending
// ═══════════════════════════════════════════════════════
const SMART_MODE = true;  // Smart interaction mode is now the default

// Curve constraints
const CURVE_MAX_DIST = SP * 1.5;  // Max control point distance from line (~60px)

// ═══════════════════════════════════════════════════════
// DEFAULT FONT — faithful conversion from Brutalita source
// Coordinates: col = brutalita_x * 2,  row = brutalita_y * 2 + 1
// Grid: ROW_CAP=1, ROW_XHGT=3, ROW_BASE=9, ROW_DESC=11
// Zero-length strokes [c,r,c,r] render as filled dots.
// ═══════════════════════════════════════════════════════
const FD = {
  // ── UPPERCASE ─────────────────────────────────
  "A":[[[0,9,0,3],[0,3,2,1],[2,1,4,3],[4,3,4,9],[0,7,4,7]]],
  "B":[[[0,1,2,1],[2,1,4,3],[4,3,4,5],[4,5,2,5],[2,5,4,7],[4,7,4,9],[4,9,0,9],[0,9,0,1]]],
  "C":[[[4,1,2,1],[2,1,0,3],[0,3,0,7],[0,7,2,9],[2,9,4,9]]],
  "D":[[[0,1,2,1],[2,1,4,3],[4,3,4,7],[4,7,2,9],[2,9,0,9],[0,9,0,1]]],
  "E":[[[4,1,0,1],[0,1,0,9],[0,9,4,9],[0,5,2,5]]],
  "F":[[[4,1,0,1],[0,1,0,9],[0,5,2,5]]],
  "G":[[[4,1,2,1],[2,1,0,3],[0,3,0,7],[0,7,2,9],[2,9,4,9],[4,9,4,5],[4,5,2,5]]],
  "H":[[[0,1,0,9],[4,1,4,9],[0,5,4,5]]],
  "I":[[[0,1,4,1],[0,9,4,9],[2,1,2,9]]],
  "J":[[[0,1,4,1],[4,1,4,9],[4,9,2,9],[2,9,0,7],[0,7,0,5]]],
  "K":[[[0,1,0,9],[4,1,0,7],[0,5,4,9]]],
  "L":[[[0,1,0,9],[0,9,4,9]]],
  "M":[[[0,9,0,1],[0,1,2,7],[2,7,4,1],[4,1,4,9]]],
  "N":[[[0,9,0,1],[0,1,4,9],[4,9,4,1]]],
  "O":[[[0,2,1,1],[1,1,3,1],[3,1,4,2],[4,2,4,8],[4,8,3,9],[3,9,1,9],[1,9,0,8],[0,8,0,2]]],
  "P":[[[0,6,4,6],[4,6,4,3],[4,3,2,1],[2,1,0,1],[0,1,0,9]]],
  "Q":[[[0,2,1,1],[1,1,3,1],[3,1,4,2],[4,2,4,7],[4,7,2,9],[2,9,1,9],[1,9,0,8],[0,8,0,2],[2,7,4,9]]],
  "R":[[[0,6,4,6],[4,6,4,3],[4,3,2,1],[2,1,0,1],[0,1,0,9],[2,6,4,9]]],
  "S":[[[4,1,1,1],[1,1,0,2],[0,2,0,4],[0,4,1,5],[1,5,3,5],[3,5,4,6],[4,6,4,8],[4,8,3,9],[3,9,0,9]]],
  "T":[[[0,1,4,1],[2,1,2,9]]],
  "U":[[[0,1,0,8],[0,8,1,9],[1,9,3,9],[3,9,4,8],[4,8,4,1]]],
  "V":[[[0,1,0,3],[0,3,2,9],[2,9,4,3],[4,3,4,1]]],
  "W":[[[0,1,0,9],[0,9,2,5],[2,5,4,9],[4,9,4,1]]],
  "X":[[[0,1,4,9],[4,1,0,9]]],
  "Y":[[[2,7,2,9],[0,1,0,4],[0,4,2,7],[2,7,4,4],[4,4,4,1]]],
  "Z":[[[0,1,4,1],[4,1,0,9],[0,9,4,9]]],
  // ── LOWERCASE ─────────────────────────────────
  "a":[[[1,3,3,3],[3,3,4,4],[4,4,4,7],[4,7,2,9],[2,9,1,9],[1,9,0,8],[0,8,0,4],[0,4,1,3],[4,3,4,9]]],
  "b":[[[0,1,0,4],[0,4,1,3],[1,3,3,3],[3,3,4,4],[4,4,4,8],[4,8,3,9],[3,9,1,9],[1,9,0,8],[0,8,0,4]]],
  "c":[[[4,3,1,3],[1,3,0,4],[0,4,0,8],[0,8,1,9],[1,9,4,9]]],
  "d":[[[4,1,4,4],[4,4,3,3],[3,3,1,3],[1,3,0,4],[0,4,0,8],[0,8,1,9],[1,9,3,9],[3,9,4,8],[4,8,4,4],[4,4,4,9]]],
  "e":[[[0,6,4,6],[4,6,4,4],[4,4,3,3],[3,3,1,3],[1,3,0,4],[0,4,0,8],[0,8,1,9],[1,9,3,9],[3,9,4,8]]],
  "f":[[[4,1,2,1],[2,1,1,2],[1,2,1,9],[1,5,3,5]]],
  "g":[[[4,3,4,10],[4,10,3,11],[3,11,1,11],[1,11,0,10],[1,3,3,3],[3,3,4,4],[4,4,4,7],[4,7,3,8],[3,8,1,8],[1,8,0,7],[0,7,0,4],[0,4,1,3]]],
  "h":[[[0,1,0,9],[0,4,1,3],[1,3,3,3],[3,3,4,4],[4,4,4,9]]],
  "i":[[[2,1,2,1]],[[1,3,2,3],[2,3,2,9],[2,9,1,9],[1,9,3,9]]],
  "j":[[[3,1,3,1]],[[2,3,3,3],[3,3,3,10],[3,10,2,11],[2,11,1,11],[1,11,0,10]]],
  "k":[[[0,1,0,9],[4,3,0,7],[1,6,4,9]]],
  "l":[[[1,1,2,1],[2,1,2,9],[2,9,1,9],[1,9,3,9]]],
  "m":[[[0,3,0,9],[0,4,1,3],[1,3,2,4],[2,4,2,7],[2,7,2,4],[2,4,3,3],[3,3,4,4],[4,4,4,9]]],
  "n":[[[0,3,0,9],[0,4,1,3],[1,3,3,3],[3,3,4,4],[4,4,4,9]]],
  "o":[[[0,4,1,3],[1,3,3,3],[3,3,4,4],[4,4,4,8],[4,8,3,9],[3,9,1,9],[1,9,0,8],[0,8,0,4]]],
  "p":[[[1,3,3,3],[3,3,4,4],[4,4,4,8],[4,8,3,9],[3,9,1,9],[1,9,0,8],[0,8,0,4],[0,4,1,3],[0,3,0,11]]],
  "q":[[[1,3,3,3],[3,3,4,4],[4,4,4,8],[4,8,3,9],[3,9,1,9],[1,9,0,8],[0,8,0,4],[0,4,1,3],[4,3,4,11]]],
  "r":[[[0,3,0,9],[0,5,2,3],[2,3,4,3]]],
  "s":[[[4,3,1,3],[1,3,0,4],[0,4,0,5],[0,5,1,6],[1,6,3,6],[3,6,4,7],[4,7,4,8],[4,8,3,9],[3,9,0,9]]],
  "t":[[[0,3,4,3],[2,1,2,8],[2,8,3,9],[3,9,4,9]]],
  "u":[[[0,3,0,8],[0,8,1,9],[1,9,3,9],[3,9,4,8],[4,8,4,3]]],
  "v":[[[0,3,2,9],[2,9,4,3]]],
  "w":[[[0,3,1,9],[1,9,2,5],[2,5,3,9],[3,9,4,3]]],
  "x":[[[0,3,4,9],[4,3,0,9]]],
  "y":[[[0,3,0,8],[0,8,1,9],[1,9,3,9],[3,9,4,8],[4,8,4,3],[4,8,4,10],[4,10,3,11],[3,11,0,11]]],
  "z":[[[0,3,4,3],[4,3,0,9],[0,9,4,9]]],
  // ── DIGITS ───────────────────────────────────
  "0":[[[0,2,1,1],[1,1,3,1],[3,1,4,2],[4,2,4,8],[4,8,3,9],[3,9,1,9],[1,9,0,8],[0,8,0,2],[4,2,0,8]]],
  "1":[[[1,3,3,1],[3,1,3,9]]],
  "2":[[[0,2,1,1],[1,1,3,1],[3,1,4,2],[4,2,4,4],[4,4,0,9],[0,9,4,9]]],
  "3":[[[0,1,4,1],[4,1,1,5],[1,5,3,5],[3,5,4,6],[4,6,4,8],[4,8,3,9],[3,9,0,9]]],
  "4":[[[3,9,3,1],[3,1,0,7],[0,7,4,7]]],
  "5":[[[4,1,0,1],[0,1,0,5],[0,5,3,5],[3,5,4,6],[4,6,4,8],[4,8,3,9],[3,9,0,9]]],
  "6":[[[4,1,2,1],[2,1,0,3],[0,3,0,8],[0,8,1,9],[1,9,3,9],[3,9,4,8],[4,8,4,6],[4,6,3,5],[3,5,1,5],[1,5,0,6]]],
  "7":[[[0,1,4,1],[4,1,2,7],[2,7,2,9]]],
  "8":[[[0,2,1,1],[1,1,3,1],[3,1,4,2],[4,2,4,4],[4,4,3,5],[3,5,2,5],[2,5,3,5],[3,5,4,6],[4,6,4,8],[4,8,3,9],[3,9,1,9],[1,9,0,8],[0,8,0,6],[0,6,1,5],[1,5,2,5],[2,5,1,5],[1,5,0,4],[0,4,0,2]]],
  "9":[[[4,4,3,5],[3,5,1,5],[1,5,0,4],[0,4,0,2],[0,2,1,1],[1,1,3,1],[3,1,4,2],[4,2,4,9]]],
  // ── SYMBOLS ──────────────────────────────────
  "!":[[[2,1,2,7],[2,9,2,9]]],
  "\"":[[[1,1,1,3],[3,1,3,3]]],
  "#":[[[1,1,1,9],[3,1,3,9],[0,3,4,3],[0,7,4,7]]],
  "$":[[[2,1,2,9],[4,2,1,2],[1,2,0,3],[0,3,0,4],[0,4,1,5],[1,5,3,5],[3,5,4,6],[4,6,4,7],[4,7,3,8],[3,8,0,8]]],
  "%":[[[0,5,4,5],[2,3,2,3],[2,7,2,7]]],
  "&":[[[4,6,2,9],[2,9,1,9],[1,9,0,8],[0,8,0,6],[0,6,2,4],[2,4,3,3],[3,3,3,2],[3,2,2,1],[2,1,1,2],[1,2,1,3],[1,3,4,9]]],
  "'":[[[2,1,2,3]]],
  "(":[[[3,1,1,3],[1,3,1,7],[1,7,3,9]]],
  ")":[[[1,1,3,3],[3,3,3,7],[3,7,1,9]]],
  "*":[[[2,3,2,7],[0,4,4,6],[0,6,4,4]]],
  "+":[[[2,3,2,7],[0,5,4,5]]],
  ",":[[[2,8,0,10]]],
  "-":[[[0,5,4,5]]],
  ".":[[[2,9,2,9]]],
  "/":[[[0,9,4,1]]],
  ":":[[[2,3,2,3],[2,7,2,7]]],
  ";":[[[0,9,2,7],[2,3,2,3]]],
  "<":[[[3,2,0,5],[0,5,3,8]]],
  "=":[[[0,4,4,4],[0,6,4,6]]],
  ">":[[[1,2,4,5],[4,5,1,8]]],
  "?":[[[0,1,3,1],[3,1,4,2],[4,2,4,4],[4,4,3,5],[3,5,2,5],[2,5,2,7],[2,9,2,9]]],
  "@":[[[4,3,2,3],[2,3,2,7],[2,7,4,7],[4,7,4,1],[4,1,0,1],[0,1,0,9],[0,9,4,9]]],
  "[":[[[4,1,2,1],[2,1,2,9],[2,9,4,9]]],
  "\\":[[[0,1,4,9]]],
  "]":[[[0,1,2,1],[2,1,2,9],[2,9,0,9]]],
  "^":[[[0,3,2,1],[2,1,4,3]]],
  "_":[[[0,9,4,9]]],
  "`":[[[0,1,2,3]]],
  "{":[[[3,1,2,2],[2,2,2,4],[2,4,1,5],[1,5,2,6],[2,6,2,8],[2,8,3,9]]],
  "|":[[[2,1,2,9]]],
  "}":[[[1,1,2,2],[2,2,2,4],[2,4,3,5],[3,5,2,6],[2,6,2,8],[2,8,1,9]]],
  "~":[[[0,5,1,4],[1,4,3,6],[3,6,4,5]]],
  "\u00b4":[[[2,2,3,1]]],
};

function expandFont() {
  const R = {};
  for (const [l,segs] of Object.entries(FD)) {
    // Flatten all segments into a single array of strokes
    R[l] = segs.flat().map(([c1,r1,c2,r2]) => ({
      x1:MX+c1*SP, y1:MY+r1*SP, x2:MX+c2*SP, y2:MY+r2*SP, color:'#1e1b2e', w:11
    }));
  }
  return R;
}

// ═══════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════
let curLetter = 'A';
let glyphs    = {};   // { letter: Array<Stroke> }
let undoStk   = {};   // { 'A': [...JSON strings...] }
let tool      = 'draw';
let penWidth  = 11;
let dragging  = false;
let startDot  = null;
let hoverDot  = null;
let hoverSI   = -1;

// Experimental mode state
let expDragging   = null;          // { type: 'dot'|'curve', strokeIdx, endpoint?, ... }
let expHover      = null;          // What we're hovering over for visual feedback

// Tap-to-select state (for ?exp=grab and ?exp=smart)
let expSelected   = null;          // { type: 'stroke'|'dot', strokeIdx, endpoint?, x?, y? }
let pressStart    = null;          // { x, y, time } for tap detection
const TAP_THRESHOLD = 10;          // Max movement in pixels to count as tap
const TAP_TIME_LIMIT = 300;        // Max time in ms to count as tap

// Load / initialise
(function init() {
  try {
    const raw = localStorage.getItem('fontMkr8');
    const saved = raw ? JSON.parse(raw) : null;
    if (saved) {
      // Convert old nested segment format to flat array
      for (const l in saved) {
        const v = saved[l];
        if (Array.isArray(v) && v.length > 0 && Array.isArray(v[0])) {
          // Old format: [[strokes...], [strokes...]] - flatten it
          saved[l] = v.flat();
        }
      }
      const def = expandFont();
      for (const l of ALL_CHARS) { if (!saved[l]) saved[l] = def[l] || []; }
      glyphs = saved;
    } else {
      glyphs = expandFont();
    }
  } catch(e) { glyphs = expandFont(); }
})();

// ═══════════════════════════════════════════════════════
// GLYPH HELPERS
// ═══════════════════════════════════════════════════════
function getStrokes(l) { if (!glyphs[l]) glyphs[l]=[]; return glyphs[l]; }
function getActStrokes() { return getStrokes(curLetter); }
function setActStrokes(ss) { glyphs[curLetter]=ss; }
function allStk(l)     { return glyphs[l]||[]; }
function hasAnyStk(l)  { return allStk(l).length > 0; }

// ═══════════════════════════════════════════════════════
// DOT GRID
// ═══════════════════════════════════════════════════════
function allDots() {
  const d=[];
  // Rows 1..11 only — matching Brutalita's y=0..5 (by*2+1=1..11)
  // Row 0 and row 12 are pure margin space with no dot positions
  for(let r=1;r<=ROW_DESC;r++) for(let c=0;c<=COLS;c++) d.push({x:MX+c*SP,y:MY+r*SP,c,r});
  return d;
}
function nearDot(px,py) {
  let best=null,bd=SNAP;
  for(const d of allDots()){const v=Math.hypot(d.x-px,d.y-py);if(v<bd){bd=v;best=d;}}
  return best;
}
function dotEq(a,b){return a&&b&&a.c===b.c&&a.r===b.r}
function nearStroke(px,py) {
  // Searches current letter's strokes - handles both straight and curved strokes
  const ss=getActStrokes();
  for(let i=ss.length-1;i>=0;i--){
    const s=ss[i];
    const threshold = (s.w||11)/2 + 8;

    // For curved strokes: sample points along the bezier curve
    if (s.curved && s.cx !== undefined && s.cy !== undefined) {
      for (let t = 0; t <= 1; t += 0.05) {
        const mt = 1 - t;
        const x = mt*mt*s.x1 + 2*mt*t*s.cx + t*t*s.x2;
        const y = mt*mt*s.y1 + 2*mt*t*s.cy + t*t*s.y2;
        if (Math.hypot(px - x, py - y) < threshold) return i;
      }
    } else {
      // For straight strokes: distance to line segment
      const dx=s.x2-s.x1, dy=s.y2-s.y1, lq=dx*dx+dy*dy;
      let t=lq>0?((px-s.x1)*dx+(py-s.y1)*dy)/lq:0;
      t=Math.max(0,Math.min(1,t));
      if(Math.hypot(px-(s.x1+t*dx),py-(s.y1+t*dy))<threshold) return i;
    }
  }
  return -1;
}

// ═══════════════════════════════════════════════════════
// EXPERIMENTAL: HIT DETECTION FOR DOT MOVEMENT & CURVES
// ═══════════════════════════════════════════════════════
// Find stroke endpoint (purple dot) near cursor
function findEndpointAt(px, py, radius = 15) {
  if (!SMART_MODE) return null;
  const ss = getActStrokes();
  for (let i = 0; i < ss.length; i++) {
    const s = ss[i];
    // Check start point
    if (Math.hypot(s.x1 - px, s.y1 - py) < radius) {
      return { strokeIdx: i, endpoint: 'start', x: s.x1, y: s.y1 };
    }
    // Check end point
    if (Math.hypot(s.x2 - px, s.y2 - py) < radius) {
      return { strokeIdx: i, endpoint: 'end', x: s.x2, y: s.y2 };
    }
  }
  return null;
}

// Find stroke for bending - detects clicks on the stroke itself (excludes endpoints)
function findStrokeMidAt(px, py, threshold = 12) {
  if (!SMART_MODE) return null;
  const ss = getActStrokes();
  for (let i = ss.length - 1; i >= 0; i--) {
    const s = ss[i];
    // Check distance from endpoints first - must not be too close
    const distStart = Math.hypot(s.x1 - px, s.y1 - py);
    const distEnd = Math.hypot(s.x2 - px, s.y2 - py);
    if (distStart < threshold || distEnd < threshold) continue;

    // For curved strokes: check if near the actual curve path
    if (s.curved && s.cx !== undefined) {
      // Sample points along the curve and find closest
      let minDist = Infinity;
      for (let t = 0.1; t <= 0.9; t += 0.1) {
        const mt = 1 - t;
        const x = mt*mt*s.x1 + 2*mt*t*s.cx + t*t*s.x2;
        const y = mt*mt*s.y1 + 2*mt*t*s.cy + t*t*s.y2;
        const d = Math.hypot(x - px, y - py);
        if (d < minDist) minDist = d;
      }
      if (minDist < threshold + (s.w || 11) / 2) {
        return { strokeIdx: i, stroke: s };
      }
    } else {
      // For straight strokes: check distance to line segment
      const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
      const lq = dx*dx + dy*dy;
      let t = lq > 0 ? ((px - s.x1)*dx + (py - s.y1)*dy) / lq : 0;
      t = Math.max(0.1, Math.min(0.9, t)); // Exclude endpoints
      const closestX = s.x1 + t * dx;
      const closestY = s.y1 + t * dy;
      const dist = Math.hypot(px - closestX, py - closestY);
      if (dist < threshold + (s.w || 11) / 2) {
        return { strokeIdx: i, stroke: s };
      }
    }
  }
  return null;
}

// Snap coordinates to nearest grid intersection
function snapToGrid(x, y) {
  const col = Math.round((x - MX) / SP);
  const row = Math.round((y - MY) / SP);
  // Constrain to valid dot grid: cols 0-COLS, rows 1-ROW_DESC
  const snappedCol = Math.max(0, Math.min(COLS, col));
  const snappedRow = Math.max(1, Math.min(ROW_DESC, row));
  return {
    x: MX + snappedCol * SP,
    y: MY + snappedRow * SP,
    c: snappedCol,
    r: snappedRow
  };
}

// Clamp control point distance from line midpoint
function clampControlPoint(x1, y1, x2, y2, cx, cy) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // First clamp to max distance from midpoint
  const dist = Math.hypot(cx - midX, cy - midY);
  if (dist > CURVE_MAX_DIST) {
    const scale = CURVE_MAX_DIST / dist;
    cx = midX + (cx - midX) * scale;
    cy = midY + (cy - midY) * scale;
  }

  // Then clamp to grid boundaries (same as dot grid: cols 0-COLS, rows 1-ROW_DESC)
  const minX = MX;
  const maxX = MX + COLS * SP;
  const minY = MY + 1 * SP;  // Row 1
  const maxY = MY + ROW_DESC * SP;  // Row 11

  cx = Math.max(minX, Math.min(maxX, cx));
  cy = Math.max(minY, Math.min(maxY, cy));

  return { cx, cy };
}

// ═══════════════════════════════════════════════════════
// SVG UTILS
// ═══════════════════════════════════════════════════════
const SVG_NS='http://www.w3.org/2000/svg';
const ns  = t => document.createElementNS(SVG_NS,t);
const sa  = (e,o)=>{ for(const[k,v] of Object.entries(o)) e.setAttribute(k,v); return e; };
function mkLine(x1,y1,x2,y2,col,w,op){
  return sa(ns('line'),{x1,y1,x2,y2,stroke:col,'stroke-width':w,'stroke-linecap':'round',opacity:op||1});
}

// Draw stroke - supports both straight lines and quadratic bezier curves
function mkStroke(s, col, op) {
  const w = s.w || 11;
  const color = col || s.color || STROKE_COLOR;
  const opacity = op || 1;

  if (s.curved && s.cx !== undefined && s.cy !== undefined) {
    // Quadratic bezier curve
    const path = ns('path');
    const d = `M ${s.x1} ${s.y1} Q ${s.cx} ${s.cy} ${s.x2} ${s.y2}`;
    return sa(path, {
      d, stroke: color, 'stroke-width': w, 'stroke-linecap': 'round',
      fill: 'none', opacity
    });
  } else {
    // Straight line (existing behavior)
    return mkLine(s.x1, s.y1, s.x2, s.y2, color, w, opacity);
  }
}

// ═══════════════════════════════════════════════════════
// CANVAS SETUP
// ═══════════════════════════════════════════════════════
const drawSVG=document.getElementById('draw-svg');
sa(drawSVG,{width:CW,height:CH,viewBox:`0 0 ${CW} ${CH}`});

// ═══════════════════════════════════════════════════════
// RENDER MAIN CANVAS
// ═══════════════════════════════════════════════════════
function renderCanvas() {
  drawSVG.innerHTML='';
  // Guide lines — all within the dot zone (rows 1..ROW_DESC)
  const guides=[
    [ROW_CAP,  '#bbf7d0','4 4',  1.5,'Cap'],
    [ROW_XHGT, '#bfdbfe','4 4',  1,  'x'],
    [ROW_BASE, '#fca5a5','none', 2,  'Base'],
    [ROW_DESC, '#e9d5ff','3 5',  1,  'Desc'],
  ];
  guides.forEach(([row,col,da,lw,lb])=>{
    const y=MY+row*SP;
    drawSVG.appendChild(sa(ns('line'),{x1:0,y1:y,x2:CW,y2:y,stroke:col,'stroke-width':lw,'stroke-dasharray':da}));
    if(lb){const t=ns('text');sa(t,{x:3,y:y-3,'font-size':8,fill:col,'font-family':'Nunito,sans-serif','font-weight':800});t.textContent=lb;drawSVG.appendChild(t);}
  });

  // ── Collect endpoints for dot rendering ──
  const endpoints = new Set();
  for(const s of getActStrokes()) {
    endpoints.add(`${s.x1},${s.y1}`);
    endpoints.add(`${s.x2},${s.y2}`);
  }

  // ── Dots FIRST (background grid, under strokes) ──
  for(const d of allDots()){
    const key=`${d.x},${d.y}`;
    const isEndpoint=endpoints.has(key);
    const isHover=dotEq(d,hoverDot);
    const isStart=dotEq(d,startDot);
    if(isStart){
      drawSVG.appendChild(sa(ns('circle'),{cx:d.x,cy:d.y,r:DOT_EP,fill:STROKE_COLOR,stroke:'white','stroke-width':2}));
    } else if(isHover&&tool==='draw'){
      drawSVG.appendChild(sa(ns('circle'),{cx:d.x,cy:d.y,r:DOT_HV,fill:'#a78bfa',opacity:.9}));
    } else if(isEndpoint){
      // skip — drawn again after strokes
    } else {
      // Large dot = Brutalita integer grid point: even col, odd row (matches bx*2, by*2+1)
      // Small dot = half-step position between integer points
      const isLarge=(d.c%2===0)&&(d.r%2===1);
      const r=isLarge?DOT_LG:DOT_SM;
      const fill=(isHover&&tool==='erase')?'#f87171':'#d1d5db';
      drawSVG.appendChild(sa(ns('circle'),{cx:d.x,cy:d.y,r,fill}));
    }
  }

  // ── Strokes ON TOP of background dots ──
  const visCol=c=>c||'#1e1b2e';
  const strokes=getActStrokes();

  strokes.forEach((s,i)=>{
    const eh=tool==='erase'&&i===hoverSI;
    const isSelected = SMART_MODE && expSelected && expSelected.type === 'stroke' && expSelected.strokeIdx === i;
    const isHovered = SMART_MODE && expHover && expHover.type === 'stroke' && expHover.strokeIdx === i && !isSelected;

    // Draw hover glow behind the stroke (subtler than selection)
    if (isHovered) {
      const hoverGlow = mkStroke(s, '#a78bfa', 1);
      hoverGlow.setAttribute('stroke-width', (s.w || 11) + 6);
      hoverGlow.setAttribute('opacity', '0.5');
      hoverGlow.setAttribute('filter', 'blur(2px)');
      drawSVG.appendChild(hoverGlow);
    }

    // Draw selection glow behind the stroke (stronger than hover)
    if (isSelected) {
      const glowStroke = mkStroke(s, '#7c3aed', 1);
      glowStroke.setAttribute('stroke-width', (s.w || 11) + 8);
      glowStroke.setAttribute('opacity', '0.4');
      drawSVG.appendChild(glowStroke);
    }

    drawSVG.appendChild(mkStroke(s, eh?'#f87171':visCol(s.color), eh?.45:1));
  });

  // ── Ghost drag line ──
  if(dragging&&startDot&&hoverDot&&!dotEq(startDot,hoverDot))
    drawSVG.appendChild(mkLine(startDot.x,startDot.y,hoverDot.x,hoverDot.y,STROKE_COLOR,penWidth,.42));

  // ── Endpoint dots drawn LAST so they sit on top of strokes ──
  for(const d of allDots()){
    const key=`${d.x},${d.y}`;
    if(!endpoints.has(key)) continue;
    const isStart=dotEq(d,startDot);
    const isHover=dotEq(d,hoverDot)&&tool==='draw';
    const isSelectedDot = SMART_MODE && expSelected && expSelected.type === 'dot' &&
      Math.abs(expSelected.x - d.x) < 1 && Math.abs(expSelected.y - d.y) < 1;

    // Draw selection ring behind the dot
    if (isSelectedDot) {
      const ring = sa(ns('circle'), {
        cx: d.x, cy: d.y, r: DOT_EP + 6,
        fill: 'none', stroke: '#7c3aed', 'stroke-width': 3, opacity: 0.6
      });
      drawSVG.appendChild(ring);
    }

    if(isStart){
      drawSVG.appendChild(sa(ns('circle'),{cx:d.x,cy:d.y,r:DOT_EP,fill:STROKE_COLOR,stroke:'white','stroke-width':2}));
    } else if(isHover){
      drawSVG.appendChild(sa(ns('circle'),{cx:d.x,cy:d.y,r:DOT_HV,fill:'#a78bfa'}));
    } else {
      drawSVG.appendChild(sa(ns('circle'),{cx:d.x,cy:d.y,r:DOT_EP,fill:'#4c1d95',stroke:'white','stroke-width':1.5}));
    }
  }
  renderMini(); renderBig(); updateLeft(); save();
}

// ═══════════════════════════════════════════════════════
// RENDER MINI LETTER PREVIEW (right panel)
// Uses the same FontFace font as the main preview for accuracy
// ═══════════════════════════════════════════════════════
const miniLetter = document.getElementById('mini-letter');
function renderMini() {
  miniLetter.textContent = curLetter;
  // Color indicates if letter has strokes
  miniLetter.style.color = allStk(curLetter).length ? '#1e1b2e' : '#e0ddf0';
}

// ═══════════════════════════════════════════════════════
// SHARED OTF FONT BUILDER — Brutalita polygon-union approach
//   • Each stroke → rectangle polygon
//   • Each endpoint → circle polygon (gives rounded caps + clean junctions)
//   • All shapes → polygon-clipping union → single merged outline
//   • Advance width matches Brutalita weight-400 proportions exactly:
//     content=350fu, LSB=175fu each side, ADV_W=700fu (at UPM 1000)
// ═══════════════════════════════════════════════════════
const MONO_ADV = 700;  // monospace advance  (= 2 × content width, matches Brutalita ratio)
const GLYPH_LSB = 175; // left side bearing  (= (700 - 350) / 2)
const CIRCLE_N = 16;   // circle polygon segment count

function buildOTFFont(familyName) {

  // Convert canvas-pixel coord → font units (y flipped, baseline=0)
  // Uses float arithmetic — no rounding — to prevent coincident edges
  // that confuse polygon-clipping
  function toFU(cx, cy) {
    return [(cx - MX) * CAP_U/CAP_PX + GLYPH_LSB, (BASE_Y - cy) * CAP_U/CAP_PX];
  }

  // Build a 16-gon ring centered at (fx,fy) with radius r
  // Offset by π/N so arc sample points never fall at 0°/90°/180°/270°,
  // which would coincide exactly with axis-aligned stroke rectangle corners
  // and trigger a polygon-clipping "Unable to complete output ring" error.
  function circleRing(fx, fy, r) {
    const ring = [];
    const offset = Math.PI / CIRCLE_N; // half-step offset — the critical fix
    for (let j = 0; j < CIRCLE_N; j++) {
      const a = offset + (2 * Math.PI * j) / CIRCLE_N;
      ring.push([fx + r * Math.cos(a), fy + r * Math.sin(a)]);
    }
    ring.push(ring[0]); // close
    return ring;
  }

  // Sample points along a quadratic bezier curve
  function sampleQuadBezier(x1, y1, cx, cy, x2, y2, numSamples = 12) {
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

  // Create offset polygon for a curved stroke
  function curvedStrokeRing(x1, y1, cx, cy, x2, y2, hw) {
    const samples = sampleQuadBezier(x1, y1, cx, cy, x2, y2, 16);
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
        dx = samples[i][0] - samples[i-1][0];
        dy = samples[i][1] - samples[i-1][1];
      } else {
        dx = samples[i+1][0] - samples[i-1][0];
        dy = samples[i+1][1] - samples[i-1][1];
      }
      const len = Math.sqrt(dx*dx + dy*dy);
      if (len < 0.001) continue;
      const nx = -dy/len * hw;
      const ny = dx/len * hw;
      leftSide.push([px - nx, py - ny]);
      rightSide.push([px + nx, py + ny]);
    }

    // Create closed polygon: left side forward, right side backward
    const ring = [...leftSide, ...rightSide.reverse()];
    ring.push(ring[0]); // close
    return ring;
  }

  function makeGlyph(l, uni) {
    const stks = allStk(l);
    if (!stks.length) {
      return new opentype.Glyph({name:l, unicode:uni, advanceWidth:MONO_ADV, path:new opentype.Path()});
    }

    const rings = [];
    const endpoints = new Map(); // key → [fx, fy, hw]

    for (const s of stks) {
      // hw in font units — Brutalita weight-400 = 12.5% of cap = hw of 44 for default stroke
      const hw = Math.round(44 * (s.w||11) / 11);
      const [x1, y1] = toFU(s.x1, s.y1);
      const [x2, y2] = toFU(s.x2, s.y2);

      // Track endpoints for circle caps
      const k1 = `${Math.round(x1)},${Math.round(y1)}`;
      const k2 = `${Math.round(x2)},${Math.round(y2)}`;
      if (!endpoints.has(k1)) endpoints.set(k1, [x1, y1, hw]);
      if (!endpoints.has(k2)) endpoints.set(k2, [x2, y2, hw]);

      // Check if this is a curved stroke
      if (s.curved && s.cx !== undefined && s.cy !== undefined) {
        const [cx, cy] = toFU(s.cx, s.cy);
        rings.push(curvedStrokeRing(x1, y1, cx, cy, x2, y2, hw));
        continue;
      }

      const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx + dy*dy);
      if (len < 0.5) continue; // zero-length dot: circle handled below

      const nx = -dy/len * hw, ny = dx/len * hw;
      rings.push([
        [x1-nx, y1-ny], [x1+nx, y1+ny],
        [x2+nx, y2+ny], [x2-nx, y2-ny],
        [x1-nx, y1-ny], // close
      ]);
    }

    // Rounded caps + filled junctions at every endpoint
    for (const [fx, fy, hw] of endpoints.values()) {
      rings.push(circleRing(fx, fy, hw));
    }

    // Union all shapes (Brutalita approach: pass as one MultiPolygon)
    let unioned;
    try {
      const multiPoly = rings.map(r => [r]); // each ring → Polygon
      unioned = polygonClipping.union(multiPoly);
    } catch(e) {
      unioned = rings.map(r => [[r]]); // fallback: no union
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

    return new opentype.Glyph({name:l, unicode:uni, advanceWidth:MONO_ADV, path});
  }

  const gl = [
    new opentype.Glyph({name:'.notdef', unicode:0, advanceWidth:MONO_ADV, path:new opentype.Path()}),
    new opentype.Glyph({name:'space',   unicode:32, advanceWidth:Math.round(MONO_ADV*0.6), path:new opentype.Path()}),
  ];
  ALL_CHARS.forEach(l => gl.push(makeGlyph(l, l.codePointAt(0))));

  const asc  = Math.round(CAP_U + 50);
  const desc = -Math.round((ROW_DESC-ROW_BASE)*SP*CAP_U/CAP_PX);
  return new opentype.Font({familyName:familyName||'MyFont', styleName:'Regular',
    unitsPerEm:UPM, ascender:asc, descender:desc, glyphs:gl});
}

// ═══════════════════════════════════════════════════════
// LIVE PREVIEW — FontFace API (real font in textarea)
// ═══════════════════════════════════════════════════════
const fontRender = document.getElementById('font-render');
const prevTA     = document.getElementById('prev-textarea');
const prevHint   = document.getElementById('prev-hint');
const prevArea   = document.getElementById('preview-area');
let   previewFF  = null;   // current FontFace object
let   regenTimer = null;
let   fontReady  = false;

function scheduleRegen() {
  clearTimeout(regenTimer);
  regenTimer = setTimeout(regenPreview, 120);
}

async function regenPreview() {
  if (typeof opentype === 'undefined' || typeof polygonClipping === 'undefined') {
    // opentype.js not loaded yet — show hint
    prevHint.style.display = 'flex';
    return;
  }
  try {
    const font   = buildOTFFont('FontMakerPreview');
    const buffer = font.toArrayBuffer();

    // Revoke old font
    if (previewFF) { try { document.fonts.delete(previewFF); } catch(e){} }

    // Load via FontFace API
    previewFF = new FontFace('FontMakerPreview', buffer);
    await previewFF.load();
    document.fonts.add(previewFF);

    // Apply to textarea — real visible text now
    prevTA.style.fontFamily = "'FontMakerPreview', monospace";
    prevTA.style.color      = 'white';
    fontRender.style.display = 'none';   // hide SVG fallback
    prevHint.style.display  = 'none';
    fontReady = true;
  } catch(e) {
    console.warn('Preview font regen failed:', e);
    prevHint.style.display = 'none';
  }
}

function renderBig() { scheduleRegen(); }

prevTA.addEventListener('input', () => { /* text typed — font already applied */ });

// ═══════════════════════════════════════════════════════
// CHARACTER PICKER OVERLAY
// ═══════════════════════════════════════════════════════
const charOverlay = document.getElementById('char-overlay');
const charPanel   = document.getElementById('char-panel');

function buildCharPicker() {
  const makeGrid = (letters, gridEl) => {
    gridEl.innerHTML = '';
    for (const l of letters) {
      const b = document.createElement('button');
      b.className = 'cbtn';
      b.textContent = l;
      b.dataset.l = l;
      b.addEventListener('click', () => { selectLetter(l); closeCharPicker(); });
      gridEl.appendChild(b);
    }
  };
  makeGrid(UPPER,   document.getElementById('char-grid-upper'));
  makeGrid(LOWER,   document.getElementById('char-grid-lower'));
  makeGrid(DIGITS,  document.getElementById('char-grid-digits'));
  makeGrid(SYMBOLS, document.getElementById('char-grid-sym'));
}

function openCharPicker() {
  // Highlight current letter
  charOverlay.querySelectorAll('.cbtn').forEach(b =>
    b.classList.toggle('active', b.dataset.l === curLetter));
  charOverlay.classList.add('open');
}

function closeCharPicker() {
  charOverlay.classList.remove('open');
}

document.getElementById('char-pick-btn').addEventListener('click', openCharPicker);
document.getElementById('char-close').addEventListener('click', closeCharPicker);
// Click backdrop to close
charOverlay.addEventListener('click', e => { if (e.target === charOverlay) closeCharPicker(); });
// Escape key to close
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCharPicker(); });

function updateLeft() {
  charOverlay.querySelectorAll('.cbtn').forEach(b =>
    b.classList.toggle('active', b.dataset.l === curLetter));
}
function selectLetter(l){
  curLetter=l;
  dragging=false;startDot=null;hoverDot=null;hoverSI=-1;
  document.getElementById('badge').textContent=l;
  document.getElementById('hdr-title').textContent=`Letter "${l}"`;
  renderCanvas();
}

// ═══════════════════════════════════════════════════════
// MOUSE / TOUCH
// ═══════════════════════════════════════════════════════
function svgPt(e){
  const r=drawSVG.getBoundingClientRect(),sx=CW/r.width,sy=CH/r.height;
  const cx=e.clientX??(e.touches?.[0]?.clientX??0);
  const cy=e.clientY??(e.touches?.[0]?.clientY??0);
  return{x:(cx-r.left)*sx,y:(cy-r.top)*sy};
}

// Helper: Check if click is on a selected stroke
function isOnSelectedStroke(px, py) {
  if (!expSelected || expSelected.type !== 'stroke') return false;
  const ss = getActStrokes();
  const s = ss[expSelected.strokeIdx];
  if (!s) return false;
  const threshold = (s.w || 11) / 2 + 12;
  // Sample along stroke
  if (s.curved && s.cx !== undefined) {
    for (let t = 0; t <= 1; t += 0.05) {
      const mt = 1 - t;
      const x = mt*mt*s.x1 + 2*mt*t*s.cx + t*t*s.x2;
      const y = mt*mt*s.y1 + 2*mt*t*s.cy + t*t*s.y2;
      if (Math.hypot(px - x, py - y) < threshold) return true;
    }
  } else {
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1, lq = dx*dx + dy*dy;
    let t = lq > 0 ? ((px - s.x1)*dx + (py - s.y1)*dy) / lq : 0;
    t = Math.max(0, Math.min(1, t));
    if (Math.hypot(px - (s.x1 + t*dx), py - (s.y1 + t*dy)) < threshold) return true;
  }
  return false;
}

// Helper: Check if click is on a selected dot
function isOnSelectedDot(px, py) {
  if (!expSelected || expSelected.type !== 'dot') return false;
  return Math.hypot(px - expSelected.x, py - expSelected.y) < 15;
}

// Helper: Clear selection
function clearSelection() {
  expSelected = null;
  renderCanvas();
}

drawSVG.addEventListener('mousedown',e=>{
  const p=svgPt(e);

  // ── Erase mode: original behavior ──
  if (tool === 'erase') {
    const si = nearStroke(p.x, p.y);
    if (si >= 0) { pushUndo(); getActStrokes().splice(si, 1); hoverSI = -1; renderCanvas(); }
    return;
  }

  // ── Draw mode ──
  // Record press start for tap detection
  pressStart = { x: p.x, y: p.y, time: Date.now() };

  // Experimental tap-to-select mode
  if (SMART_MODE) {
    // If we have a selected stroke and click on it, start bending
    if (expSelected && expSelected.type === 'stroke' && isOnSelectedStroke(p.x, p.y)) {
      pushUndo();
      const ss = getActStrokes();
      const s = ss[expSelected.strokeIdx];
      if (s) {
        expDragging = {
          type: 'curve',
          strokeIdx: expSelected.strokeIdx,
          cx: s.curved ? s.cx : (s.x1 + s.x2) / 2,
          cy: s.curved ? s.cy : (s.y1 + s.y2) / 2
        };
      }
      renderCanvas();
      return;
    }

    // If we have a selected dot and click on it, start moving
    if (expSelected && expSelected.type === 'dot' && isOnSelectedDot(p.x, p.y)) {
      pushUndo();
      expDragging = {
        type: 'dot',
        strokeIdx: expSelected.strokeIdx,
        endpoint: expSelected.endpoint,
        startX: expSelected.x,
        startY: expSelected.y
      };
      drawSVG.classList.add('exp-grabbing');
      renderCanvas();
      return;
    }
  }

  // Start drawing from a dot (will determine if tap or drag on mouseup)
  const d = nearDot(p.x, p.y);
  if (d) {
    dragging = true;
    startDot = d;
    hoverDot = d;
    renderCanvas();
  }
});

drawSVG.addEventListener('mousemove',e=>{
  const p=svgPt(e);

  // ── Experimental: Handle manipulation dragging ──
  if (SMART_MODE && expDragging) {
    if (expDragging.type === 'curve') {
      // Bend the stroke - control point follows mouse (clamped)
      const ss = getActStrokes();
      const s = ss[expDragging.strokeIdx];
      if (s) {
        const clamped = clampControlPoint(s.x1, s.y1, s.x2, s.y2, p.x, p.y);
        s.curved = true;
        s.cx = clamped.cx;
        s.cy = clamped.cy;
        renderCanvas();
      }
      return;
    }

    if (expDragging.type === 'dot') {
      // Move dot - snap to grid
      const snapped = snapToGrid(p.x, p.y);
      const ss = getActStrokes();
      const s = ss[expDragging.strokeIdx];
      if (s) {
        const oldX = expDragging.endpoint === 'start' ? s.x1 : s.x2;
        const oldY = expDragging.endpoint === 'start' ? s.y1 : s.y2;
        // Update all strokes sharing this endpoint
        ss.forEach(stroke => {
          if (stroke.x1 === oldX && stroke.y1 === oldY) { stroke.x1 = snapped.x; stroke.y1 = snapped.y; }
          if (stroke.x2 === oldX && stroke.y2 === oldY) { stroke.x2 = snapped.x; stroke.y2 = snapped.y; }
        });
        // Update selection to track new position
        expSelected.x = snapped.x;
        expSelected.y = snapped.y;
        // Update dragging reference
        if (expDragging.endpoint === 'start') {
          expDragging.startX = snapped.x;
          expDragging.startY = snapped.y;
        }
        renderCanvas();
      }
      return;
    }
  }

  // ── Update hover state for visual feedback ──
  if (SMART_MODE && tool === 'draw' && !dragging && !expDragging) {
    const endpoint = findEndpointAt(p.x, p.y);
    const strokeMid = findStrokeMidAt(p.x, p.y);

    let newHover = null;
    if (endpoint) {
      newHover = { type: 'dot', ...endpoint };
      drawSVG.classList.remove('exp-curve');
    } else if (strokeMid) {
      newHover = { type: 'stroke', ...strokeMid };
      drawSVG.classList.add('exp-curve');
    } else {
      drawSVG.classList.remove('exp-curve');
    }

    if (JSON.stringify(newHover) !== JSON.stringify(expHover)) {
      expHover = newHover;
      renderCanvas();
    }
  }

  // ── Original behavior: update hover dot while drawing ──
  if (tool === 'draw') {
    const d = nearDot(p.x, p.y);
    if (!dotEq(d, hoverDot)) { hoverDot = d; renderCanvas(); }
  } else {
    const si = nearStroke(p.x, p.y);
    if (si !== hoverSI) { hoverSI = si; renderCanvas(); }
  }
});

drawSVG.addEventListener('mouseup',e=>{
  const p = svgPt(e);

  // ── Experimental: Finish manipulation ──
  if (SMART_MODE && expDragging) {
    expDragging = null;
    expSelected = null;  // Auto-deselect after bend/move completes
    drawSVG.classList.remove('exp-grabbing');
    renderCanvas();
    return;
  }

  // ── Check if this was a tap (for selection) ──
  if (SMART_MODE && tool === 'draw' && pressStart) {
    const dist = Math.hypot(p.x - pressStart.x, p.y - pressStart.y);
    const duration = Date.now() - pressStart.time;
    const wasTap = dist < TAP_THRESHOLD && duration < TAP_TIME_LIMIT;

    if (wasTap) {
      // Tap detected - select element or deselect
      const endpoint = findEndpointAt(p.x, p.y);
      const strokeMid = findStrokeMidAt(p.x, p.y);

      if (endpoint) {
        // Select this dot
        expSelected = {
          type: 'dot',
          strokeIdx: endpoint.strokeIdx,
          endpoint: endpoint.endpoint,
          x: endpoint.x,
          y: endpoint.y
        };
      } else if (strokeMid) {
        // Select this stroke
        expSelected = {
          type: 'stroke',
          strokeIdx: strokeMid.strokeIdx
        };
      } else {
        // Tap on empty space - deselect
        expSelected = null;
      }

      // Cancel any drawing that started
      dragging = false;
      startDot = null;
      pressStart = null;
      renderCanvas();
      return;
    }
  }

  pressStart = null;

  // ── Original drawing behavior ──
  if (tool !== 'draw' || !dragging) return;
  dragging = false;
  const d = nearDot(p.x, p.y);
  if (d && !dotEq(d, startDot)) {
    pushUndo();
    if (!glyphs[curLetter]) glyphs[curLetter] = [];
    glyphs[curLetter].push({x1:startDot.x, y1:startDot.y, x2:d.x, y2:d.y, color:STROKE_COLOR, w:penWidth});
    // Clear selection when new stroke is drawn
    if (SMART_MODE) expSelected = null;
  }
  startDot = null;
  renderCanvas();
});

drawSVG.addEventListener('mouseleave',()=>{
  hoverDot = null;
  hoverSI = -1;
  if (dragging) { dragging = false; startDot = null; }
  if (expDragging) { expDragging = null; }
  pressStart = null;
  expHover = null;
  drawSVG.classList.remove('exp-curve', 'exp-grabbing');
  renderCanvas();
});

// Touch events - same logic as mouse
drawSVG.addEventListener('touchstart',e=>{
  e.preventDefault();
  const p = svgPt(e.touches[0]);

  if (tool === 'erase') {
    const si = nearStroke(p.x, p.y);
    if (si >= 0) { pushUndo(); getActStrokes().splice(si, 1); hoverSI = -1; renderCanvas(); }
    return;
  }

  pressStart = { x: p.x, y: p.y, time: Date.now() };

  if (SMART_MODE) {
    if (expSelected && expSelected.type === 'stroke' && isOnSelectedStroke(p.x, p.y)) {
      pushUndo();
      const ss = getActStrokes();
      const s = ss[expSelected.strokeIdx];
      if (s) {
        expDragging = { type: 'curve', strokeIdx: expSelected.strokeIdx,
          cx: s.curved ? s.cx : (s.x1 + s.x2) / 2, cy: s.curved ? s.cy : (s.y1 + s.y2) / 2 };
      }
      renderCanvas();
      return;
    }
    if (expSelected && expSelected.type === 'dot' && isOnSelectedDot(p.x, p.y)) {
      pushUndo();
      expDragging = { type: 'dot', strokeIdx: expSelected.strokeIdx,
        endpoint: expSelected.endpoint, startX: expSelected.x, startY: expSelected.y };
      renderCanvas();
      return;
    }
  }

  const d = nearDot(p.x, p.y);
  if (d) { dragging = true; startDot = d; hoverDot = d; renderCanvas(); }
},{passive:false});

drawSVG.addEventListener('touchmove',e=>{
  e.preventDefault();
  const p = svgPt(e.touches[0]);

  if (SMART_MODE && expDragging) {
    if (expDragging.type === 'curve') {
      const ss = getActStrokes();
      const s = ss[expDragging.strokeIdx];
      if (s) {
        const clamped = clampControlPoint(s.x1, s.y1, s.x2, s.y2, p.x, p.y);
        s.curved = true; s.cx = clamped.cx; s.cy = clamped.cy;
        renderCanvas();
      }
      return;
    }
    if (expDragging.type === 'dot') {
      const snapped = snapToGrid(p.x, p.y);
      const ss = getActStrokes();
      const s = ss[expDragging.strokeIdx];
      if (s) {
        const oldX = expDragging.endpoint === 'start' ? s.x1 : s.x2;
        const oldY = expDragging.endpoint === 'start' ? s.y1 : s.y2;
        ss.forEach(stroke => {
          if (stroke.x1 === oldX && stroke.y1 === oldY) { stroke.x1 = snapped.x; stroke.y1 = snapped.y; }
          if (stroke.x2 === oldX && stroke.y2 === oldY) { stroke.x2 = snapped.x; stroke.y2 = snapped.y; }
        });
        expSelected.x = snapped.x; expSelected.y = snapped.y;
        renderCanvas();
      }
      return;
    }
  }

  const d = nearDot(p.x, p.y);
  if (!dotEq(d, hoverDot)) { hoverDot = d; renderCanvas(); }
},{passive:false});

drawSVG.addEventListener('touchend',e=>{
  e.preventDefault();
  const p = svgPt(e.changedTouches[0]);

  if (SMART_MODE && expDragging) {
    expDragging = null;
    expSelected = null;  // Auto-deselect after bend/move completes
    renderCanvas();
    return;
  }

  if (SMART_MODE && tool === 'draw' && pressStart) {
    const dist = Math.hypot(p.x - pressStart.x, p.y - pressStart.y);
    const duration = Date.now() - pressStart.time;
    if (dist < TAP_THRESHOLD && duration < TAP_TIME_LIMIT) {
      const endpoint = findEndpointAt(p.x, p.y);
      const strokeMid = findStrokeMidAt(p.x, p.y);
      if (endpoint) {
        expSelected = { type: 'dot', strokeIdx: endpoint.strokeIdx,
          endpoint: endpoint.endpoint, x: endpoint.x, y: endpoint.y };
      } else if (strokeMid) {
        expSelected = { type: 'stroke', strokeIdx: strokeMid.strokeIdx };
      } else {
        expSelected = null;
      }
      dragging = false; startDot = null; pressStart = null;
      renderCanvas();
      return;
    }
  }
  pressStart = null;

  if (tool !== 'draw' || !dragging) return;
  dragging = false;
  const d = nearDot(p.x, p.y);
  if (d && !dotEq(d, startDot)) {
    pushUndo();
    if (!glyphs[curLetter]) glyphs[curLetter] = [];
    glyphs[curLetter].push({x1:startDot.x, y1:startDot.y, x2:d.x, y2:d.y, color:STROKE_COLOR, w:penWidth});
    if (SMART_MODE) expSelected = null;
  }
  startDot = null;
  renderCanvas();
},{passive:false});

// ═══════════════════════════════════════════════════════
// UNDO
// ═══════════════════════════════════════════════════════
function pushUndo(){
  const k=curLetter;
  if(!undoStk[k])undoStk[k]=[];
  undoStk[k].push(JSON.stringify(getActStrokes()));
  if(undoStk[k].length>80)undoStk[k].shift();
}
function doUndo(){
  const k=curLetter,st=undoStk[k];
  if(!st||!st.length)return;
  setActStrokes(JSON.parse(st.pop()));renderCanvas();
}
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='z'){
    // Let the textarea handle its own undo natively
    if(document.activeElement===prevTA) return;
    e.preventDefault();doUndo();
  }
  if((e.ctrlKey||e.metaKey)&&e.key==='a'){
    // Always redirect Ctrl/Cmd+A to select all text in the preview textarea
    e.preventDefault();
    prevTA.focus();
    prevTA.select();
  }
});

// ═══════════════════════════════════════════════════════
// TOOLBAR WIRING
// ═══════════════════════════════════════════════════════
document.getElementById('td').addEventListener('click',()=>{
  tool='draw';drawSVG.classList.remove('erase');
  document.getElementById('td').classList.add('active');
  document.getElementById('te').classList.remove('active');
  hoverSI=-1;renderCanvas();
});
document.getElementById('te').addEventListener('click',()=>{
  // If something is selected in experimental mode, do one-time erase of selection
  if (SMART_MODE && expSelected) {
    pushUndo();
    const ss = getActStrokes();

    if (expSelected.type === 'stroke') {
      // Delete the selected stroke
      ss.splice(expSelected.strokeIdx, 1);
    } else if (expSelected.type === 'dot') {
      // Delete all strokes connected to this dot
      const dotX = expSelected.x;
      const dotY = expSelected.y;
      // Filter out strokes that have this endpoint
      const remaining = ss.filter(s =>
        !((s.x1 === dotX && s.y1 === dotY) || (s.x2 === dotX && s.y2 === dotY))
      );
      setActStrokes(remaining);
    }

    expSelected = null;
    renderCanvas();
    return; // Stay in draw mode
  }

  // Normal behavior: switch to erase mode
  tool='erase';drawSVG.classList.add('erase');
  document.getElementById('te').classList.add('active');
  document.getElementById('td').classList.remove('active');
  dragging=false;startDot=null;renderCanvas();
});
document.getElementById('tu').addEventListener('click',doUndo);
document.getElementById('tc').addEventListener('click',()=>{
  if(!getActStrokes().length)return;
  if(confirm(`Clear all strokes for "${curLetter}"?`)){pushUndo();setActStrokes([]);renderCanvas();}
});
document.querySelectorAll('.wb').forEach(b=>{
  b.addEventListener('click',()=>{
    penWidth=parseInt(b.dataset.w);
    document.querySelectorAll('.wb').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
  });
});

// ═══════════════════════════════════════════════════════
// SAVE / EXPORT
// ═══════════════════════════════════════════════════════
function save(){try{localStorage.setItem('fontMkr8',JSON.stringify(glyphs));}catch(e){}}

document.getElementById('btn-json').addEventListener('click',()=>{
  const fontName = document.getElementById('font-name').value.trim() || 'MyFont';
  const blob=new Blob([JSON.stringify({version:7,upm:UPM,name:fontName,glyphs},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fontName.replace(/\s+/g,'-')+'.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
});

document.getElementById('btn-otf').addEventListener('click',()=>{
  if(typeof opentype==='undefined'){alert('opentype.js not loaded. Check internet.');return;}
  if(!ALL_LTR.some(l=>hasAnyStk(l))){alert('Draw some letters first!');return;}
  try {
    const fontName = document.getElementById('font-name').value.trim() || 'MyFont';
    const font = buildOTFFont(fontName);
    font.download(fontName.replace(/\s+/g, '-') + '.otf');
  } catch(err){console.error(err);alert('OTF error: '+err.message);}
});

document.getElementById('btn-rst').addEventListener('click',()=>{
  if(confirm('Reset ALL letters to the default font? (Your changes will be lost!)')){
    glyphs=expandFont();undoStk={};renderCanvas();
  }
});

// ═══════════════════════════════════════════════════════
// EXPERIMENTAL: HINT TOOLTIP (?exp=smart)
// ═══════════════════════════════════════════════════════
let hintEl = null;

if (SMART_MODE) {
  // Create hint element
  hintEl = document.createElement('div');
  hintEl.className = 'exp-hint';
  hintEl.style.display = 'none';
  document.body.appendChild(hintEl);

  // Track mouse for hint positioning - context-aware hints
  drawSVG.addEventListener('mousemove', e => {
    if (!hintEl || expDragging) return;

    const p = svgPt(e);
    const endpoint = findEndpointAt(p.x, p.y);
    const strokeMid = findStrokeMidAt(p.x, p.y);
    const rect = drawSVG.getBoundingClientRect();
    const scaleX = rect.width / CW;

    let hintText = null;
    let hintX = p.x;
    let hintY = p.y;

    if (endpoint) {
      // Hovering over a dot
      const isSelectedDot = expSelected && expSelected.type === 'dot' &&
        Math.abs(expSelected.x - endpoint.x) < 1 && Math.abs(expSelected.y - endpoint.y) < 1;
      hintText = isSelectedDot ? 'Drag to move' : 'Tap to select';
      hintX = endpoint.x;
      hintY = endpoint.y;
    } else if (strokeMid) {
      // Hovering over a stroke
      const isSelectedStroke = expSelected && expSelected.type === 'stroke' &&
        expSelected.strokeIdx === strokeMid.strokeIdx;
      const s = strokeMid.stroke;
      hintText = isSelectedStroke ? 'Drag to bend' : 'Tap to select';
      hintX = s.curved ? s.cx : (s.x1 + s.x2) / 2;
      hintY = s.curved ? s.cy : (s.y1 + s.y2) / 2;
    }

    if (hintText) {
      hintEl.textContent = hintText;
      hintEl.style.left = (rect.left + hintX * scaleX) + 'px';
      hintEl.style.top = (rect.top + hintY * scaleX - 20) + 'px';
      hintEl.style.display = 'block';
    } else {
      hintEl.style.display = 'none';
    }
  });

  drawSVG.addEventListener('mouseleave', () => {
    if (hintEl) hintEl.style.display = 'none';
  });

  drawSVG.addEventListener('mousedown', () => {
    if (hintEl) hintEl.style.display = 'none';
  });
}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════
buildCharPicker();
requestAnimationFrame(() => {
  renderCanvas();  // renders editor canvas + triggers scheduleRegen → regenPreview
});

window.addEventListener('resize', scheduleRegen);
