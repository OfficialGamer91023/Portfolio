import { useEffect, useState } from 'react';
import { Reveal } from '../components/Reveal';
import { NotebookCanvas } from '../components/NotebookCanvas';
import { CurveIntersectionToy } from '../components/toys/CurveIntersectionToy';

/**
 * The Lab makes the lib2geom intersection math playable. Inline, it shows a small
 * live figure of two curves crossing (the same decorative canvas as the hero);
 * clicking it opens the real, error-bounded solver from the GSoC work in a modal,
 * where every crossing is computed, not drawn. Keeping the heavy interactive toy
 * behind a click means it only mounts when asked for, so it never weighs on the
 * scroll or first paint.
 */
export function LabSection() {
  const [open, setOpen] = useState(false);

  // Lock body scroll and wire Escape-to-close only while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <section id="lab" className="relative border-t border-grid-bold">
      <div className="mx-auto max-w-[940px] px-6 py-11">
        <span className="section-idx">§ 02</span>
        <Reveal>
          <span className="section-lbl">the lab</span>
          <h2 className="nb-h2 mt-1.5">Where the geometry becomes playable</h2>
          <p className="mt-1.5 font-mono text-sm text-content-3">
            the same intersection math from lib2geom, but you drive it
          </p>
        </Reveal>

        <Reveal className="mt-2" delay={0.05}>
          {/* Clickable live preview (mockup `.labfig`) — opens the real solver. */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className="nb-card group relative block h-[280px] w-full overflow-hidden text-left transition-colors hover:border-plot/60 focus-visible:border-plot/60"
          >
            <NotebookCanvas
              className="absolute inset-0 h-full w-full"
              ariaLabel="Live preview of two curves crossing — click to open the interactive solver"
            />
            <span className="absolute right-3.5 top-2.5 font-mono text-[10px] text-plot">
              ▲ click to open · drag the curves
            </span>
            <span className="absolute bottom-2.5 left-3.5 font-mono text-[11px] text-content-3">
              fig.05 — curve intersection toy · live
            </span>
          </button>
        </Reveal>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Curve intersection solver"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close solver"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
          />

          {/* Panel — medium size, not full-bleed. */}
          <div className="nb-card relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 border-b border-grid px-4 py-2.5">
              <span className="font-mono text-[11px] text-plot">fig.05</span>
              <span className="font-mono text-[11px] text-content-3">
                curve intersection toy · live
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto rounded border border-edge px-2 py-1 font-mono text-[11px] text-content-3 transition-colors hover:border-plot hover:text-plot"
              >
                esc ✕
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <CurveIntersectionToy />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
