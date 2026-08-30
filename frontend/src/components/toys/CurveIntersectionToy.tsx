import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { boxRect, curveIntersections, flatten } from '../../lib/geom/curveIntersection';
import type { Bezier, Point } from '../../lib/geom/curveIntersection';
import { CANVAS_HEIGHT, CANVAS_WIDTH, CURVE_PRESETS, DEFAULT_PRESET } from './curvePresets';

const LOGICAL_WIDTH = CANVAS_WIDTH;
const LOGICAL_HEIGHT = CANVAS_HEIGHT;

const GRID_SPACING = 40;
const CURVE_SAMPLES = 220;

/** Depth of the recursion drawn by the "subdivision" toggle. */
const RECORD_DEPTH = 7;

const MIN_DEGREE = 1;
const MAX_DEGREE = 5;

// Curve colours are fixed hexes chosen to read on both the paper and blueprint
// grounds; the canvas background and grid are read from the theme CSS variables
// at draw time (see `draw`), so the figure repaints correctly when the theme flips.
const COLORS = {
  curveA: '#3b6fd4',
  curveB: '#d2691e',
  intersection: '#0a9d6a',
  box: 'rgba(10, 157, 106, 0.28)',
} as const;

/** Reads the current theme's canvas background and grid colour from CSS vars. */
function readCanvasTheme(): { bg: string; grid: string } {
  const cs = getComputedStyle(document.documentElement);
  return {
    bg: cs.getPropertyValue('--card').trim() || '#fffdf7',
    grid: `rgba(${cs.getPropertyValue('--cv-grid').trim() || '220, 216, 200'}, 0.6)`,
  };
}

const DEGREE_NAMES: Record<number, string> = {
  1: 'line',
  2: 'quadratic',
  3: 'cubic',
  4: 'quartic',
  5: 'quintic',
};

type CurveIndex = 0 | 1;

interface DragTarget {
  curve: CurveIndex;
  point: number;
  /** Which pointer started this drag — a second finger must not hijack it. */
  pointerId: number;
}

export function CurveIntersectionToy() {
  const [curves, setCurves] = useState<[Bezier, Bezier]>(() => cloneCurves(DEFAULT_PRESET.curves));
  const [presetId, setPresetId] = useState<string>(DEFAULT_PRESET.id);
  const [epsilonExponent, setEpsilonExponent] = useState<number>(6);
  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [showSubdivision, setShowSubdivision] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragTarget | null>(null);

  const epsilon = 10 ** -epsilonExponent;

  const result = useMemo(
    () =>
      curveIntersections(curves[0], curves[1], {
        epsilon,
        recordDepth: showSubdivision ? RECORD_DEPTH : 0,
      }),
    [curves, epsilon, showSubdivision],
  );

  // --- painting ------------------------------------------------------------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const surface = surfaceRef.current;
    if (!canvas || !surface) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const cssWidth = surface.clientWidth;
    const cssHeight = surface.clientHeight;
    if (cssWidth === 0 || cssHeight === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    // One transform maps logical curve coordinates straight to device pixels,
    // so nothing downstream has to think about scaling.
    context.setTransform(
      (cssWidth / LOGICAL_WIDTH) * dpr,
      0,
      0,
      (cssHeight / LOGICAL_HEIGHT) * dpr,
      0,
      0,
    );
    const unit = LOGICAL_WIDTH / cssWidth;
    const canvasTheme = readCanvasTheme();

    context.fillStyle = canvasTheme.bg;
    context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    drawGrid(context, unit, canvasTheme.grid);

    if (showSubdivision) {
      context.strokeStyle = COLORS.box;
      context.lineWidth = unit;
      for (const box of result.boxes) {
        const rect = boxRect(box);
        context.strokeRect(rect.x, rect.y, rect.w, rect.h);
      }
    }

    if (showPolygons) {
      drawControlPolygon(context, curves[0], COLORS.curveA, unit);
      drawControlPolygon(context, curves[1], COLORS.curveB, unit);
    }

    drawCurve(context, curves[0], COLORS.curveA, unit);
    drawCurve(context, curves[1], COLORS.curveB, unit);

    for (const intersection of result.intersections) {
      drawIntersection(context, intersection.point, unit, canvasTheme.bg);
    }
  }, [curves, result, showPolygons, showSubdivision]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Repaint when the theme flips (data-theme changes on <html>).
  useEffect(() => {
    const observer = new MutationObserver(() => draw());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const observer = new ResizeObserver(() => draw());
    observer.observe(surface);
    return () => observer.disconnect();
  }, [draw]);

  // --- editing -------------------------------------------------------------
  function movePoint(curve: CurveIndex, index: number, position: Point): void {
    setCurves((current) => {
      const next: [Bezier, Bezier] = [current[0].slice(), current[1].slice()];
      next[curve][index] = {
        x: clamp(position.x, 0, LOGICAL_WIDTH),
        y: clamp(position.y, 0, LOGICAL_HEIGHT),
      };
      return next;
    });
  }

  function toLogical(clientX: number, clientY: number): Point {
    const surface = surfaceRef.current;
    if (!surface) return { x: 0, y: 0 };

    const rect = surface.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * LOGICAL_WIDTH,
      y: ((clientY - rect.top) / rect.height) * LOGICAL_HEIGHT,
    };
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    target: Omit<DragTarget, 'pointerId'>,
  ): void {
    if (!event.isPrimary || event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { ...target, pointerId: event.pointerId };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>): void {
    const target = dragRef.current;
    if (!target || target.pointerId !== event.pointerId) return;

    // `buttons` is the authority on whether the press is still down. Without
    // this a release the handle never saw — the pointer leaving the window, a
    // dialog opening under the cursor — would leave the point stuck to the
    // cursor and moving on its own.
    if (event.buttons === 0) {
      dragRef.current = null;
      return;
    }

    event.preventDefault();
    movePoint(target.curve, target.point, toLogical(event.clientX, event.clientY));
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>): void {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  /** Arrow keys nudge a point; Shift moves it ten times as far. */
  function handleKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    target: Omit<DragTarget, 'pointerId'>,
  ): void {
    const step = event.shiftKey ? 10 : 1;
    const deltas: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };

    const delta = deltas[event.key];
    if (!delta) return;

    event.preventDefault();
    const current = curves[target.curve][target.point];
    movePoint(target.curve, target.point, { x: current.x + delta.x, y: current.y + delta.y });
  }

  function applyPreset(id: string): void {
    const preset = CURVE_PRESETS.find((candidate) => candidate.id === id);
    if (!preset) return;
    setPresetId(preset.id);
    setCurves(cloneCurves(preset.curves));
  }

  function randomise(): void {
    setPresetId('custom');
    setCurves([randomCurve(curves[0].length), randomCurve(curves[1].length)]);
  }

  function changeDegree(curve: CurveIndex, direction: 1 | -1): void {
    setPresetId('custom');
    setCurves((current) => {
      const next: [Bezier, Bezier] = [current[0], current[1]];
      const points = current[curve];
      const degree = points.length - 1;

      if (direction === 1 && degree < MAX_DEGREE) next[curve] = elevateDegree(points);
      if (direction === -1 && degree > MIN_DEGREE) next[curve] = reduceDegree(points);

      return [next[0], next[1]];
    });
  }

  const activePreset = CURVE_PRESETS.find((preset) => preset.id === presetId);

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      {/* --- canvas ---------------------------------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div
          ref={surfaceRef}
          className="relative w-full overflow-hidden rounded-lg border border-edge bg-card"
          style={{ aspectRatio: `${LOGICAL_WIDTH} / ${LOGICAL_HEIGHT}` }}
        >
          <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />

          {/* Control points are real focusable elements over the canvas rather
              than shapes inside it, so they can be tabbed to and nudged with
              the keyboard instead of needing a mouse. */}
          {curves.map((points, curveIndex) =>
            points.map((point, pointIndex) => (
              <ControlHandle
                key={`${curveIndex}-${pointIndex}`}
                point={point}
                index={pointIndex}
                color={curveIndex === 0 ? COLORS.curveA : COLORS.curveB}
                label={`Curve ${curveIndex + 1} point ${pointIndex}`}
                onPointerDown={(event) =>
                  handlePointerDown(event, { curve: curveIndex as CurveIndex, point: pointIndex })
                }
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onLostPointerCapture={handlePointerUp}
                onKeyDown={(event) =>
                  handleKeyDown(event, { curve: curveIndex as CurveIndex, point: pointIndex })
                }
              />
            )),
          )}
        </div>

        <p className="text-xs text-content-3">
          Drag any control point, or tab to one and nudge it with the arrow keys.
          {activePreset ? ` ${activePreset.note}` : ''}
        </p>
      </div>

      {/* --- readout ---------------------------------------------------- */}
      <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-edge bg-paper-2 p-4 font-mono text-xs lg:w-80 lg:border-l lg:border-t-0">
        <Readout
          result={result}
          epsilon={epsilon}
          epsilonExponent={epsilonExponent}
          curves={curves}
          onEpsilonChange={setEpsilonExponent}
        />

        <div className="space-y-2 border-t border-edge pt-4">
          <ToggleRow label="Control polygons" checked={showPolygons} onChange={setShowPolygons} />
          <ToggleRow
            label="Subdivision bounds"
            checked={showSubdivision}
            onChange={setShowSubdivision}
          />
        </div>

        <div className="space-y-2 border-t border-edge pt-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-content-3">Degree</p>
          {curves.map((points, index) => (
            <div key={index} className="flex items-center justify-between gap-2">
              <span style={{ color: index === 0 ? COLORS.curveA : COLORS.curveB }}>
                Curve {index + 1}
                <span className="ml-2 text-content-3">{DEGREE_NAMES[points.length - 1]}</span>
              </span>
              <span className="flex gap-1">
                <StepButton
                  label={`Lower curve ${index + 1} degree`}
                  glyph="−"
                  disabled={points.length - 1 <= MIN_DEGREE}
                  onClick={() => changeDegree(index as CurveIndex, -1)}
                />
                <StepButton
                  label={`Raise curve ${index + 1} degree`}
                  glyph="+"
                  disabled={points.length - 1 >= MAX_DEGREE}
                  onClick={() => changeDegree(index as CurveIndex, 1)}
                />
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-edge pt-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-content-3">Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {CURVE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`rounded border px-2 py-1 text-[11px] transition-colors ${
                  presetId === preset.id
                    ? 'border-plot/50 bg-plot/10 text-plot'
                    : 'border-edge text-content-3 hover:border-content-3 hover:text-content'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={randomise}
              className="rounded border border-edge px-2 py-1 text-[11px] text-content-3 transition-colors hover:border-content-3 hover:text-content"
            >
              Random
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

// --- readout ---------------------------------------------------------------

interface ReadoutProps {
  result: ReturnType<typeof curveIntersections>;
  epsilon: number;
  epsilonExponent: number;
  curves: [Bezier, Bezier];
  onEpsilonChange: (value: number) => void;
}

function Readout({ result, epsilon, epsilonExponent, curves, onEpsilonChange }: ReadoutProps) {
  const { intersections, stats } = result;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-content-3">Intersections</span>
          <span className="text-lg font-semibold" style={{ color: COLORS.intersection }}>
            {intersections.length}
            {stats.truncated ? '+' : ''}
          </span>
        </div>
        {stats.truncated && (
          <p className="mt-1 text-[11px] leading-relaxed text-amber-400/80">
            Result capped: the curves overlap along a shared span rather than crossing at isolated
            points.
          </p>
        )}
      </div>

      <label className="block">
        <span className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.18em] text-content-3">
          Epsilon
          <span className="text-plot">{formatExponential(epsilon)}</span>
        </span>
        <input
          type="range"
          min={1}
          max={9}
          step={1}
          value={epsilonExponent}
          onChange={(event) => onEpsilonChange(Number(event.target.value))}
          className="mt-2 w-full accent-plot"
        />
      </label>

      <dl className="space-y-1">
        <StatRow label="Pairs tested" value={stats.pairsTested.toLocaleString()} />
        <StatRow label="Pairs culled" value={stats.pairsCulled.toLocaleString()} />
        <StatRow label="Max depth" value={String(stats.maxDepth)} />
        <StatRow label="Hull inflation" value={formatExponential(stats.maxHullInflation)} />
        <StatRow label="Solve time" value={`${stats.elapsedMs.toFixed(2)} ms`} />
      </dl>

      <div className="space-y-3 border-t border-edge pt-4">
        {curves.map((points, index) => (
          <div key={index}>
            <p className="mb-1" style={{ color: index === 0 ? COLORS.curveA : COLORS.curveB }}>
              Curve {index + 1} control points
            </p>
            {points.map((point, pointIndex) => (
              <p key={pointIndex} className="text-content-3">
                {'  '}P{pointIndex}: ({point.x.toFixed(2)}, {point.y.toFixed(2)})
              </p>
            ))}
          </div>
        ))}
      </div>

      {intersections.length > 0 && (
        <div className="border-t border-edge pt-4">
          {intersections.map((intersection, index) => (
            <p key={index} className="text-content-3">
              <span style={{ color: COLORS.intersection }}>#{index + 1}</span> t=
              {intersection.t.toFixed(6)}, s={intersection.s.toFixed(6)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-content-3">{label}</dt>
      <dd className="text-content">{value}</dd>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-content-3">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-content-3 bg-paper-2 text-plot focus:ring-plot focus:ring-offset-paper"
      />
    </label>
  );
}

function StepButton({
  label,
  glyph,
  disabled,
  onClick,
}: {
  label: string;
  glyph: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-6 w-6 rounded border border-edge text-content-3 transition-colors hover:border-content-3 hover:text-content disabled:cursor-not-allowed disabled:opacity-30"
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
}

interface ControlHandleProps {
  point: Point;
  index: number;
  color: string;
  label: string;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onLostPointerCapture: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
}

function ControlHandle({ point, index, color, label, ...handlers }: ControlHandleProps) {
  return (
    <button
      type="button"
      {...handlers}
      aria-label={`${label}, at ${point.x.toFixed(0)}, ${point.y.toFixed(0)}`}
      style={{
        left: `${(point.x / LOGICAL_WIDTH) * 100}%`,
        top: `${(point.y / LOGICAL_HEIGHT) * 100}%`,
        borderColor: color,
        color,
      }}
      className="absolute -ml-3 -mt-3 flex h-6 w-6 touch-none items-center justify-center rounded-full border-2 bg-card/80 font-mono text-[10px] leading-none transition-transform hover:scale-125 focus-visible:scale-125"
    >
      {index}
    </button>
  );
}

// --- canvas primitives -----------------------------------------------------

function drawGrid(context: CanvasRenderingContext2D, unit: number, gridColor: string): void {
  context.strokeStyle = gridColor;
  context.lineWidth = unit;
  context.beginPath();
  for (let x = GRID_SPACING; x < LOGICAL_WIDTH; x += GRID_SPACING) {
    context.moveTo(x, 0);
    context.lineTo(x, LOGICAL_HEIGHT);
  }
  for (let y = GRID_SPACING; y < LOGICAL_HEIGHT; y += GRID_SPACING) {
    context.moveTo(0, y);
    context.lineTo(LOGICAL_WIDTH, y);
  }
  context.stroke();
}

function drawControlPolygon(
  context: CanvasRenderingContext2D,
  points: Bezier,
  color: string,
  unit: number,
): void {
  context.save();
  context.strokeStyle = color;
  context.globalAlpha = 0.35;
  context.lineWidth = unit;
  context.setLineDash([4 * unit, 4 * unit]);
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) context.lineTo(point.x, point.y);
  context.stroke();
  context.restore();
}

function drawCurve(
  context: CanvasRenderingContext2D,
  points: Bezier,
  color: string,
  unit: number,
): void {
  const polyline = flatten(points, CURVE_SAMPLES);
  context.strokeStyle = color;
  context.lineWidth = 2.25 * unit;
  context.lineJoin = 'round';
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(polyline[0].x, polyline[0].y);
  for (const point of polyline.slice(1)) context.lineTo(point.x, point.y);
  context.stroke();
}

function drawIntersection(
  context: CanvasRenderingContext2D,
  point: Point,
  unit: number,
  ringColor: string,
): void {
  context.save();
  // A halo lifts the marker off whichever curve happens to pass under it.
  context.fillStyle = COLORS.intersection;
  context.globalAlpha = 0.22;
  context.beginPath();
  context.arc(point.x, point.y, 9 * unit, 0, Math.PI * 2);
  context.fill();

  context.globalAlpha = 1;
  context.beginPath();
  context.arc(point.x, point.y, 4 * unit, 0, Math.PI * 2);
  context.fill();

  // Ring in the canvas background colour so the dot separates from the curves
  // on both the light and dark grounds.
  context.strokeStyle = ringColor;
  context.lineWidth = 1.5 * unit;
  context.beginPath();
  context.arc(point.x, point.y, 4 * unit, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

// --- curve utilities -------------------------------------------------------

function cloneCurves(curves: [Bezier, Bezier]): [Bezier, Bezier] {
  return [curves[0].map((point) => ({ ...point })), curves[1].map((point) => ({ ...point }))];
}

/**
 * Exact degree elevation: rewrites a degree-n curve as a degree-(n+1) one
 * tracing the identical path, just with an extra control point to grab.
 */
function elevateDegree(points: Bezier): Bezier {
  const n = points.length - 1;
  const elevated: Point[] = [points[0]];

  for (let i = 1; i <= n; i++) {
    const weight = i / (n + 1);
    elevated.push({
      x: weight * points[i - 1].x + (1 - weight) * points[i].x,
      y: weight * points[i - 1].y + (1 - weight) * points[i].y,
    });
  }

  elevated.push(points[n]);
  return elevated;
}

/**
 * Degree reduction has no exact inverse — a degree-n curve generally cannot be
 * written with fewer control points — so this drops the middle one and lets the
 * shape change, which is the behaviour you want when editing by hand anyway.
 */
function reduceDegree(points: Bezier): Bezier {
  const middle = Math.floor(points.length / 2);
  return points.filter((_, index) => index !== middle);
}

function randomCurve(length: number): Bezier {
  const margin = 60;
  return Array.from({ length }, () => ({
    x: margin + Math.random() * (LOGICAL_WIDTH - margin * 2),
    y: margin + Math.random() * (LOGICAL_HEIGHT - margin * 2),
  }));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Formats like the desktop build's readout: `1.0e-6`. */
function formatExponential(value: number): string {
  if (value === 0) return '0';
  return value.toExponential(1);
}
