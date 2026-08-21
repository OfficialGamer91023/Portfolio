/**
 * Error-bounded interval arithmetic.
 *
 * A floating-point predicate like "do these two boxes overlap?" is only as
 * trustworthy as the numbers fed into it. Once a value has been through a few
 * dozen arithmetic operations it is no longer a point on the real line, it is a
 * point plus an unknown error term — and a solver that compares such values
 * with `<` will eventually take the wrong branch. The fix is to stop pretending
 * a computed number is exact: carry an interval that provably contains the true
 * value, round every result outward, and only ever answer a predicate when the
 * intervals give an unambiguous answer.
 *
 * This is the same reasoning behind the interval work in lib2geom.
 */

/** Half the distance between 1 and the next representable double. */
const MACHINE_EPSILON = Number.EPSILON / 2;

/** A closed range [min, max] guaranteed to contain some exact real value. */
export interface Interval {
  min: number;
  max: number;
}

/** An axis-aligned box: an interval per coordinate. */
export interface Box {
  x: Interval;
  y: Interval;
}

export function interval(min: number, max: number): Interval {
  return min <= max ? { min, max } : { min: max, max: min };
}

/** The tightest interval containing every value — used to bound a control polygon. */
export function hull(values: number[]): Interval {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return { min, max };
}

export function width(i: Interval): number {
  return i.max - i.min;
}

export function mid(i: Interval): number {
  return (i.min + i.max) / 2;
}

/**
 * Rounds an interval outward by `amount`, restoring the containment guarantee
 * after operations whose own rounding error has been bounded separately.
 */
export function widen(i: Interval, amount: number): Interval {
  return { min: i.min - amount, max: i.max + amount };
}

/**
 * Closed-interval overlap. Answering with `>` rather than `>=` would make a
 * shared endpoint read as disjoint and drop tangential intersections, which is
 * exactly the class of bug interval arithmetic exists to prevent.
 */
export function overlaps(a: Interval, b: Interval): boolean {
  return a.min <= b.max && b.min <= a.max;
}

export function boxesOverlap(a: Box, b: Box): boolean {
  return overlaps(a.x, b.x) && overlaps(a.y, b.y);
}

/** Diagonal length of a box — the convergence measure the solver terminates on. */
export function boxDiagonal(box: Box): number {
  return Math.hypot(width(box.x), width(box.y));
}

/**
 * Bound on the rounding error introduced by one de Casteljau subdivision step.
 *
 * Each new control point is a convex combination of two existing ones, so its
 * computed value carries at most one rounding step of relative error. Over `n`
 * such steps the absolute error is bounded by `n * MACHINE_EPSILON * magnitude`
 * (the standard first-order bound; it is an over-estimate, which is the safe
 * direction). Inflating every hull by this amount keeps the containment
 * property true no matter how deep the recursion goes.
 */
export function subdivisionErrorBound(depth: number, magnitude: number): number {
  return depth * MACHINE_EPSILON * Math.abs(magnitude);
}
