import { useMemo, useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { AnimatedContent } from '../components/reactbits/AnimatedContent';
import { WindowFrame } from '../components/WindowFrame';
import { CurveIntersectionToy } from '../components/toys/CurveIntersectionToy';
import { curveIntersections, flatten } from '../lib/geom/curveIntersection';
import { DEFAULT_PRESET } from '../components/toys/curvePresets';

/** Aspect the preview keeps, whatever the framed geometry happens to be. */
const PREVIEW_ASPECT = 640 / 400;
const PREVIEW_PADDING = 0.12;

/** What the visitor is actually looking at, once the window is open. */
const HIGHLIGHTS = [
  'Bounds come from the convex hull of each control polygon, rounded outward by a proven bound on accumulated rounding error.',
  'Disjoint bounds retire a whole subtree, so the search cost tracks the number of real crossings rather than the recursion depth.',
  'Tangencies, where the curves touch without crossing, survive. That is the case naive sign tests drop.',
];

export function LabSection() {
  const [toyOpen, setToyOpen] = useState<boolean>(false);

  return (
    <section id="lab" className="relative py-24 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(34,211,238,0.06),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Lab"
          title="Code you can"
          accent="run right here"
          description="My Google Summer of Code work replaced fragile floating-point logic in lib2geom, the geometry library behind Inkscape, with error-bounded interval arithmetic."
          descriptionClassName="max-w-2xl"
        />

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <AnimatedContent direction="horizontal" reverse distance={30}>
            <ul className="space-y-4">
              {HIGHLIGHTS.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  {highlight}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm leading-relaxed text-muted">
              The desktop original is{' '}
              <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-xs text-primary-300">
                general-curve-intersection-toy
              </code>
              , a C++ toy I wrote to debug the algorithm as I built it.
            </p>

            <button
              type="button"
              onClick={() => setToyOpen(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition-colors duration-300 hover:bg-primary-300"
            >
              Open the toy
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M6 3h7v7M13 3L4 12" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </AnimatedContent>

          <AnimatedContent direction="horizontal" distance={30} delay={0.1}>
            <LaunchCard onLaunch={() => setToyOpen(true)} />
          </AnimatedContent>
        </div>
      </div>

      <WindowFrame
        open={toyOpen}
        onClose={() => setToyOpen(false)}
        title="general-curve-intersection-toy"
      >
        <CurveIntersectionToy />
      </WindowFrame>
    </section>
  );
}

/**
 * A still of the toy dressed as a window, acting as the launcher. The preview is
 * drawn from the same solver the window runs, so the crossings it marks are real
 * rather than decorative.
 */
function LaunchCard({ onLaunch }: { onLaunch: () => void }) {
  const preview = useMemo(() => {
    const [curveA, curveB] = DEFAULT_PRESET.curves;
    const polylineA = flatten(curveA, 160);
    const polylineB = flatten(curveB, 160);

    return {
      pathA: toPath(polylineA),
      pathB: toPath(polylineB),
      points: curveIntersections(curveA, curveB).intersections.map((hit) => hit.point),
      // Framed on the curves rather than on the control polygons: the control
      // points sit well outside the shape here, and framing on them would leave
      // the drawing marooned in the middle of a mostly empty card.
      viewBox: frameOf([...polylineA, ...polylineB]),
    };
  }, []);

  return (
    <button
      type="button"
      onClick={onLaunch}
      className="group block w-full overflow-hidden rounded-xl border border-ink-700 bg-ink-850 text-left shadow-xl shadow-black/40 transition-colors duration-300 hover:border-primary-400/40"
    >
      <span className="flex items-center gap-3 border-b border-ink-700 bg-ink-850 px-4 py-3">
        <span className="flex items-center gap-2" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="min-w-0 flex-1 truncate text-center font-mono text-[11px] text-muted">
          general-curve-intersection-toy
        </span>
      </span>

      <span className="relative block bg-ink-950">
        <svg
          viewBox={preview.viewBox}
          className="block w-full"
          role="img"
          aria-label="Two Bézier curves crossing at six marked points"
        >
          <path d={preview.pathA} fill="none" stroke="#60a5fa" strokeWidth={1.6} />
          <path d={preview.pathB} fill="none" stroke="#a78bfa" strokeWidth={1.6} />
          {preview.points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={3.2}
              fill="#22d3ee"
              stroke="#ffffff"
              strokeWidth={1}
            />
          ))}
        </svg>

        <span className="absolute inset-0 flex items-center justify-center bg-ink-950/70 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Launch
          </span>
        </span>
      </span>
    </button>
  );
}

/**
 * Smallest box containing every point, padded and then widened or heightened to
 * the card's aspect ratio so the drawing is centred rather than stretched.
 */
function frameOf(points: Array<{ x: number; y: number }>): string {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const padding = Math.max(maxX - minX, maxY - minY) * PREVIEW_PADDING;
  let width = maxX - minX + padding * 2;
  let height = maxY - minY + padding * 2;

  if (width / height < PREVIEW_ASPECT) {
    width = height * PREVIEW_ASPECT;
  } else {
    height = width / PREVIEW_ASPECT;
  }

  const x = (minX + maxX) / 2 - width / 2;
  const y = (minY + maxY) / 2 - height / 2;
  return `${x} ${y} ${width} ${height}`;
}

function toPath(points: Array<{ x: number; y: number }>): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
}
