/**
 * General Bézier–Bézier intersection by recursive subdivision, with every
 * geometric predicate answered through error-bounded interval arithmetic.
 *
 * The algorithm rests on the convex hull property of the Bernstein basis: the
 * basis functions are non-negative and sum to one, so every point of a Bézier
 * curve is a convex combination of its control points and therefore lies inside
 * their convex hull. The axis-aligned hull of the control polygon is a cheap,
 * conservative bound on the curve — and a bound is all the recursion needs:
 *
 *   1. Bound both curve segments. If the bounds are disjoint, no intersection
 *      can exist in this pair, so the whole subtree is discarded.
 *   2. If both segments are flat enough to be indistinguishable from their
 *      chords at the requested tolerance, solve the two chords as line segments
 *      and report the crossing directly.
 *   3. Otherwise split whichever segment is geometrically larger at its
 *      midpoint and recurse on the two resulting pairs.
 *
 * Each split quarters a segment's deviation from its chord, so step 2 is
 * reached in roughly a dozen levels, while step 1 keeps the branch count near
 * the number of real intersections rather than 2^depth. Terminating on a chord
 * solve rather than on parameter width also means each root is reported once:
 * a pair of line segments either crosses or does not.
 *
 * The subtlety, and the reason for `interval.ts`, is that subdivision is not
 * exact. The control points of a sub-segment are computed by repeated averaging,
 * so by depth 40 they carry accumulated rounding error. A solver comparing them
 * naively can declare two overlapping bounds disjoint and silently lose an
 * intersection. Inflating every hull by a proven bound on that error makes the
 * disjointness test conservative: it may occasionally keep a branch it did not
 * strictly need to, but it can never discard one that contains a root.
 */

import type { Box } from './interval';
import { boxDiagonal, boxesOverlap, mid, subdivisionErrorBound, width } from './interval';

export interface Point {
  x: number;
  y: number;
}

/** A Bézier curve of any degree, given by its control polygon. */
export type Bezier = Point[];

export interface Intersection {
  /** Parameter on the first curve. */
  t: number;
  /** Parameter on the second curve. */
  s: number;
  point: Point;
}

export interface SolverStats {
  /** Pairs of segments the recursion examined. */
  pairsTested: number;
  /** Pairs discarded outright because their bounds were disjoint. */
  pairsCulled: number;
  /** Deepest level reached, counting splits of either curve. */
  maxDepth: number;
  /** Largest outward rounding applied to any hull, in the curve's own units. */
  maxHullInflation: number;
  elapsedMs: number;
  /** True if the work or result cap was hit — the curves likely overlap. */
  truncated: boolean;
}

export interface IntersectionResult {
  intersections: Intersection[];
  stats: SolverStats;
  /** Surviving segment bounds, for drawing the recursion. Empty unless asked for. */
  boxes: Box[];
}

export interface SolverOptions {
  /** Parameter-space convergence tolerance. */
  epsilon?: number;
  /** Record surviving bounds up to this depth, for visualisation. */
  recordDepth?: number;
}

/**
 * Two crossings closer together than this in parameter space are treated as one
 * report of the same root. The floor keeps genuinely distinct near-tangential
 * crossings apart; the epsilon term stops a coarse tolerance from emitting a
 * cluster of duplicates for a single root.
 */
const MERGE_TOLERANCE_FLOOR = 1e-4;

/** Caps on a pathological input (identical or overlapping curves). */
const MAX_INTERSECTIONS = 32;
const MAX_CANDIDATES = 4096;
const MAX_PAIRS = 60_000;
const MAX_DEPTH = 64;

/** One segment of a curve: its control polygon plus the parameter range it covers. */
interface Segment {
  points: Bezier;
  t0: number;
  t1: number;
  /** Splits applied to reach this segment — drives the error bound. */
  depth: number;
}

/** Largest coordinate magnitude in a control polygon, for scaling the error bound. */
function magnitudeOf(points: Bezier): number {
  let magnitude = 0;
  for (const p of points) {
    magnitude = Math.max(magnitude, Math.abs(p.x), Math.abs(p.y));
  }
  return magnitude;
}

/**
 * Conservative bound on a segment: the axis-aligned hull of its control polygon,
 * rounded outward by a bound on the rounding error its subdivisions accumulated.
 */
function boundsOf(segment: Segment): { box: Box; inflation: number } {
  // Written as one pass without intermediate arrays: this runs on every pair
  // the recursion touches, which is where the whole solve spends its time.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let magnitude = 0;

  for (const p of segment.points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    magnitude = Math.max(magnitude, Math.abs(p.x), Math.abs(p.y));
  }

  const inflation = subdivisionErrorBound(segment.depth, magnitude);
  return {
    box: {
      x: { min: minX - inflation, max: maxX + inflation },
      y: { min: minY - inflation, max: maxY + inflation },
    },
    inflation,
  };
}

/** de Casteljau evaluation — the numerically stable way to sample a Bézier. */
export function evaluate(points: Bezier, t: number): Point {
  let level = points;
  while (level.length > 1) {
    const next: Point[] = [];
    for (let i = 0; i < level.length - 1; i++) {
      next.push({
        x: level[i].x + (level[i + 1].x - level[i].x) * t,
        y: level[i].y + (level[i + 1].y - level[i].y) * t,
      });
    }
    level = next;
  }
  return level[0];
}

/**
 * Splits a curve at `t` into two curves covering [0, t] and [t, 1].
 *
 * The de Casteljau triangle produces both halves for free: its left edge is the
 * control polygon of the first piece and its right edge that of the second.
 */
export function split(points: Bezier, t: number): [Bezier, Bezier] {
  const left: Point[] = [points[0]];
  const right: Point[] = [points[points.length - 1]];

  let level = points;
  while (level.length > 1) {
    const next: Point[] = [];
    for (let i = 0; i < level.length - 1; i++) {
      next.push({
        x: level[i].x + (level[i + 1].x - level[i].x) * t,
        y: level[i].y + (level[i + 1].y - level[i].y) * t,
      });
    }
    left.push(next[0]);
    right.unshift(next[next.length - 1]);
    level = next;
  }

  return [left, right];
}

/**
 * How far a segment strays from the straight line between its endpoints.
 *
 * By the convex hull property the curve stays within the control polygon, so
 * the largest distance from an interior control point to the chord bounds the
 * distance from the curve to the chord. Once that is below the tolerance the
 * segment can be treated as a line without exceeding the requested accuracy.
 */
function deviationFromChord(points: Bezier): number {
  const first = points[0];
  const last = points[points.length - 1];
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const chordLength = Math.hypot(dx, dy);

  // A degenerate chord (a closed loop within one segment) has no line to
  // measure against; fall back to the extent of the polygon itself.
  if (chordLength === 0) {
    let extent = 0;
    for (const p of points) extent = Math.max(extent, Math.hypot(p.x - first.x, p.y - first.y));
    return extent;
  }

  let worst = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const cross = Math.abs((points[i].x - first.x) * dy - (points[i].y - first.y) * dx);
    worst = Math.max(worst, cross / chordLength);
  }
  return worst;
}

/**
 * Crossing of the two chords, as a fraction along each. Returns null when the
 * chords are parallel or cross outside their extents.
 *
 * The margin admits a crossing a hair outside a segment so that a root sitting
 * exactly on a subdivision boundary is not lost by both neighbours at once;
 * whichever duplicates that produces are merged afterwards.
 */
function chordCrossing(a: Bezier, b: Bezier): { u: number; v: number } | null {
  const a0 = a[0];
  const a1 = a[a.length - 1];
  const b0 = b[0];
  const b1 = b[b.length - 1];

  const ax = a1.x - a0.x;
  const ay = a1.y - a0.y;
  const bx = b1.x - b0.x;
  const by = b1.y - b0.y;

  const denominator = ax * by - ay * bx;
  if (denominator === 0) return null;

  const ox = b0.x - a0.x;
  const oy = b0.y - a0.y;
  const u = (ox * by - oy * bx) / denominator;
  const v = (ox * ay - oy * ax) / denominator;

  const margin = 1e-9;
  if (u < -margin || u > 1 + margin || v < -margin || v > 1 + margin) return null;
  return { u, v };
}

function segmentOf(points: Bezier, t0: number, t1: number, depth: number): Segment {
  return { points, t0, t1, depth };
}

/**
 * Reports every point where two Bézier curves cross, as parameter pairs.
 *
 * `epsilon` is the parameter-space width at which a candidate is considered
 * resolved; the reported `t` and `s` are therefore accurate to within it.
 */
export function curveIntersections(
  curveA: Bezier,
  curveB: Bezier,
  { epsilon = 1e-6, recordDepth = 0 }: SolverOptions = {},
): IntersectionResult {
  const startedAt = performance.now();

  const stats: SolverStats = {
    pairsTested: 0,
    pairsCulled: 0,
    maxDepth: 0,
    maxHullInflation: 0,
    elapsedMs: 0,
    truncated: false,
  };

  const found: Intersection[] = [];
  const boxes: Box[] = [];

  // Epsilon is a parameter-space figure; flatness is measured in the curves'
  // own coordinates, so scale one into the other by the size of the input.
  const scale = Math.max(magnitudeOf(curveA), magnitudeOf(curveB), 1);
  const flatnessTolerance = Math.max(epsilon * scale, Number.MIN_VALUE);

  if (curveA.length < 2 || curveB.length < 2) {
    stats.elapsedMs = performance.now() - startedAt;
    return { intersections: found, stats, boxes };
  }

  // An explicit stack rather than recursion: the depth needed for a tight
  // epsilon is well past what a comfortable JS call stack allows.
  const stack: Array<[Segment, Segment]> = [
    [segmentOf(curveA, 0, 1, 0), segmentOf(curveB, 0, 1, 0)],
  ];

  while (stack.length > 0) {
    const pair = stack.pop();
    if (!pair) break;
    const [a, b] = pair;

    if (stats.pairsTested >= MAX_PAIRS || found.length >= MAX_CANDIDATES) {
      stats.truncated = true;
      break;
    }

    stats.pairsTested++;
    const depth = a.depth + b.depth;
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    const boundsA = boundsOf(a);
    const boundsB = boundsOf(b);
    stats.maxHullInflation = Math.max(stats.maxHullInflation, boundsA.inflation, boundsB.inflation);

    // Step 1 — the cull. Disjoint bounds prove no crossing exists in this pair.
    if (!boxesOverlap(boundsA.box, boundsB.box)) {
      stats.pairsCulled++;
      continue;
    }

    if (depth <= recordDepth) {
      boxes.push(boundsA.box, boundsB.box);
    }

    const spanA = a.t1 - a.t0;
    const spanB = b.t1 - b.t0;
    const sizeA = boxDiagonal(boundsA.box);
    const sizeB = boxDiagonal(boundsB.box);

    // Step 2 — both segments are within tolerance of their chords, so solve the
    // chords. A crossing outside either chord's extent means the hulls overlap
    // without the curves meeting, and the pair is dropped.
    const flat =
      deviationFromChord(a.points) <= flatnessTolerance &&
      deviationFromChord(b.points) <= flatnessTolerance;
    const exhausted = depth >= MAX_DEPTH || (spanA <= epsilon && spanB <= epsilon);

    if (flat || exhausted) {
      const crossing = flat ? chordCrossing(a.points, b.points) : null;

      if (crossing) {
        const t = a.t0 + crossing.u * spanA;
        const s = b.t0 + crossing.v * spanB;
        found.push({ t, s, point: evaluate(curveA, t) });
      } else if (exhausted) {
        // Parallel chords that never separated: a tangency, where the curves
        // touch without crossing and no chord solve can find it. The pair has
        // converged, so its centre is the contact point.
        found.push({
          t: (a.t0 + a.t1) / 2,
          s: (b.t0 + b.t1) / 2,
          point: { x: mid(boundsA.box.x), y: mid(boundsA.box.y) },
        });
      }
      continue;
    }

    // Step 3 — split the geometrically larger segment, so both curves narrow at
    // a comparable rate however different their arc lengths are.
    const splitA = sizeA >= sizeB;

    if (splitA) {
      const [left, right] = split(a.points, 0.5);
      const tm = (a.t0 + a.t1) / 2;
      stack.push([segmentOf(left, a.t0, tm, a.depth + 1), b]);
      stack.push([segmentOf(right, tm, a.t1, a.depth + 1), b]);
    } else {
      const [left, right] = split(b.points, 0.5);
      const sm = (b.t0 + b.t1) / 2;
      stack.push([a, segmentOf(left, b.t0, sm, b.depth + 1)]);
      stack.push([a, segmentOf(right, sm, b.t1, b.depth + 1)]);
    }
  }

  const merged = mergeDuplicates(found, epsilon).map((candidate) => refine(curveA, curveB, candidate));
  if (merged.length > MAX_INTERSECTIONS) {
    merged.length = MAX_INTERSECTIONS;
    stats.truncated = true;
  }

  stats.elapsedMs = performance.now() - startedAt;
  return { intersections: merged, stats, boxes };
}

/**
 * Derivative of a Bézier: a curve one degree lower, with control points
 * `n * (P[i+1] - P[i])`.
 */
function derivative(points: Bezier): Bezier {
  const n = points.length - 1;
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ x: n * (points[i + 1].x - points[i].x), y: n * (points[i + 1].y - points[i].y) });
  }
  return out;
}

/**
 * Polishes a crossing with Newton's method on `C1(t) - C2(s) = 0`.
 *
 * Subdivision brackets a root but converges linearly, so the chord solve leaves
 * an error on the order of the flatness tolerance. Newton converges
 * quadratically from a starting point that close, reaching the limit of double
 * precision in two or three steps and costing nothing next to the search that
 * found the bracket.
 *
 * The 2x2 Jacobian is `[C1'(t)  -C2'(s)]`, whose determinant is the cross
 * product of the two tangents. It vanishes where the curves are tangent — the
 * one case Newton cannot improve — so a near-singular system is left alone
 * rather than being stepped somewhere worse.
 */
function refine(curveA: Bezier, curveB: Bezier, guess: Intersection): Intersection {
  const dA = derivative(curveA);
  const dB = derivative(curveB);

  let { t, s } = guess;

  for (let step = 0; step < 8; step++) {
    const pa = evaluate(curveA, t);
    const pb = evaluate(curveB, s);
    const fx = pa.x - pb.x;
    const fy = pa.y - pb.y;
    if (fx === 0 && fy === 0) break;

    const ta = evaluate(dA, t);
    const tb = evaluate(dB, s);
    const determinant = ta.x * -tb.y - -tb.x * ta.y;

    // Tangential or degenerate: keep the bracketed estimate.
    const tangentScale = Math.hypot(ta.x, ta.y) * Math.hypot(tb.x, tb.y);
    if (determinant === 0 || Math.abs(determinant) < tangentScale * 1e-9) break;

    const dt = (-fx * -tb.y - -tb.x * -fy) / determinant;
    const ds = (ta.x * -fy - -fx * ta.y) / determinant;

    const nextT = t + dt;
    const nextS = s + ds;

    // A step that leaves the curve's own domain means the bracket, not Newton,
    // had it right.
    if (nextT < 0 || nextT > 1 || nextS < 0 || nextS > 1) break;

    t = nextT;
    s = nextS;
    if (Math.abs(dt) < 1e-15 && Math.abs(ds) < 1e-15) break;
  }

  return { t, s, point: evaluate(curveA, t) };
}

/**
 * A root landing on a subdivision boundary is found from both sides, so the
 * raw output can name the same crossing twice. Merge reports that agree in both
 * parameters to within the tolerance, keeping their average.
 */
function mergeDuplicates(candidates: Intersection[], epsilon: number): Intersection[] {
  const tolerance = Math.max(MERGE_TOLERANCE_FLOOR, epsilon * 4);
  const merged: Intersection[] = [];

  for (const candidate of candidates.slice().sort((p, q) => p.t - q.t)) {
    const twin = merged.find(
      (existing) =>
        Math.abs(existing.t - candidate.t) <= tolerance && Math.abs(existing.s - candidate.s) <= tolerance,
    );
    if (twin) {
      twin.t = (twin.t + candidate.t) / 2;
      twin.s = (twin.s + candidate.s) / 2;
      twin.point = {
        x: (twin.point.x + candidate.point.x) / 2,
        y: (twin.point.y + candidate.point.y) / 2,
      };
      continue;
    }
    merged.push(candidate);
  }

  return merged;
}

/** Samples a curve into a polyline for rendering. */
export function flatten(points: Bezier, samples: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    out.push(evaluate(points, i / samples));
  }
  return out;
}

/** Box dimensions in the form a canvas wants them. */
export function boxRect(box: Box): { x: number; y: number; w: number; h: number } {
  return { x: box.x.min, y: box.y.min, w: width(box.x), h: width(box.y) };
}
