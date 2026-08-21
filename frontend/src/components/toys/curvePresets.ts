import type { Point } from '../../lib/geom/curveIntersection';

/**
 * The canvas works in a fixed coordinate space and is scaled to whatever width
 * it is given, so control-point values stay stable across window sizes.
 */
export const CANVAS_WIDTH = 640;
export const CANVAS_HEIGHT = 460;

/** Kept clear of the edges so control points stay grabbable. */
const CANVAS_MARGIN = 26;

export interface CurvePreset {
  id: string;
  label: string;
  /** What this configuration is meant to demonstrate. */
  note: string;
  curves: [Point[], Point[]];
}

const p = (x: number, y: number): Point => ({ x, y });

/**
 * The exact control points the C++ build was showing when I grabbed a
 * screenshot of it — six crossings, the most a pair of cubics can have.
 */
const SIX_CROSSINGS: [Point[], Point[]] = [
  [p(372, 245), p(200, 100), p(400, 400), p(357, 165)],
  [p(324, 209), p(300, 350), p(450, 100), p(274, 394)],
];

/**
 * Rotates and scales a pair of curves to fill the canvas.
 *
 * Bézier curves are affine-invariant: transforming the control points
 * transforms the curve identically, because each curve point is a fixed convex
 * combination of its control points and an affine map commutes with convex
 * combinations. So applying one transform to *both* curves moves the picture
 * without disturbing where — in parameter space — they meet. Every `t` and `s`
 * the solver reports for the reframed pair is the value the desktop build
 * printed for the original, to the last digit it showed.
 *
 * The angle is a constant rather than something derived here: it was found once
 * by searching for the rotation that leaves the curves largest on screen while
 * keeping every control point inside the frame.
 */
function fitToCanvas(curves: [Point[], Point[]], angleDegrees: number): [Point[], Point[]] {
  const angle = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const rotate = (points: Point[]): Point[] =>
    points.map((point) => ({ x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos }));

  const rotated: [Point[], Point[]] = [rotate(curves[0]), rotate(curves[1])];
  const all = [...rotated[0], ...rotated[1]];

  const minX = Math.min(...all.map((point) => point.x));
  const maxX = Math.max(...all.map((point) => point.x));
  const minY = Math.min(...all.map((point) => point.y));
  const maxY = Math.max(...all.map((point) => point.y));

  const scale = Math.min(
    (CANVAS_WIDTH - 2 * CANVAS_MARGIN) / (maxX - minX),
    (CANVAS_HEIGHT - 2 * CANVAS_MARGIN) / (maxY - minY),
  );
  const offsetX = CANVAS_WIDTH / 2 - ((minX + maxX) / 2) * scale;
  const offsetY = CANVAS_HEIGHT / 2 - ((minY + maxY) / 2) * scale;

  const place = (points: Point[]): Point[] =>
    points.map((point) => ({ x: point.x * scale + offsetX, y: point.y * scale + offsetY }));

  return [place(rotated[0]), place(rotated[1])];
}

export const CURVE_PRESETS: CurvePreset[] = [
  {
    id: 'six',
    label: 'Six crossings',
    note: 'Two cubics wound through each other, the most a cubic pair can manage.',
    curves: fitToCanvas(SIX_CROSSINGS, 284),
  },
  {
    id: 'tangent',
    label: 'Tangency',
    note: 'A double root: the curves touch without crossing, the case sign tests drop.',
    curves: [
      [p(120, 380), p(320, 60), p(520, 380)],
      [p(60, 273), p(580, 273)],
    ],
  },
  {
    id: 'grazing',
    label: 'Near miss',
    note: 'Bounds overlap for many levels before the recursion proves there is no root.',
    curves: [
      [p(70, 330), p(240, 110), p(400, 110), p(570, 330)],
      [p(70, 186), p(240, 406), p(400, 406), p(570, 186)],
    ],
  },
  {
    id: 'loop',
    label: 'Loop and chord',
    note: 'A self-overlapping cubic cut by a straight segment.',
    curves: [
      [p(150, 400), p(600, 70), p(60, 70), p(490, 400)],
      [p(50, 150), p(600, 320)],
    ],
  },
];

export const DEFAULT_PRESET = CURVE_PRESETS[0];
