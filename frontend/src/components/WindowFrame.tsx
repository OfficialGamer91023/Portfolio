import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { gsap } from 'gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface WindowFrameProps {
  open: boolean;
  onClose: () => void;
  /** Shown in the title bar, in mono — this is the binary's name. */
  title: string;
  /** Optional toolbar strip below the title bar. */
  toolbar?: ReactNode;
  children: ReactNode;
}

interface Offset {
  x: number;
  y: number;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps at least this much of the title bar on screen when dragging. */
const DRAG_MARGIN = 48;

/**
 * A draggable desktop-style window rendered over the page.
 *
 * Everything a real window manager gives you for free has to be rebuilt here:
 * the title bar drags the window, Escape and the backdrop close it, focus is
 * trapped inside while it is open and handed back to the launcher afterwards,
 * and the page behind it stops scrolling. Below `sm` the window pins to the
 * viewport and dragging is disabled, since there is nowhere to drag to.
 */
export function WindowFrame({ open, onClose, title, toolbar, children }: WindowFrameProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<Offset | null>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [maximized, setMaximized] = useState<boolean>(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Reset position each time it opens, so a window dragged into a corner in one
  // session does not open off-centre in the next.
  useEffect(() => {
    if (open) {
      setOffset({ x: 0, y: 0 });
      setMaximized(false);
    }
  }, [open]);

  // --- focus handoff -------------------------------------------------------
  useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const frame = windowRef.current;
    frame?.focus();

    return () => {
      restoreFocusTo.current?.focus?.();
    };
  }, [open]);

  // --- escape, tab trapping, scroll lock -----------------------------------
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const frame = windowRef.current;
      if (!frame) return;

      const focusable = Array.from(frame.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const { overflow, paddingRight } = document.body.style;
    // Compensating for the scrollbar keeps the page behind from shifting
    // sideways the moment it stops scrolling.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open, onClose]);

  // --- entrance ------------------------------------------------------------
  useLayoutEffect(() => {
    if (!open || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(backdropRef.current, { opacity: 0, duration: 0.25, ease: 'power2.out' });
      gsap.from(windowRef.current, {
        opacity: 0,
        scale: 0.96,
        y: 12,
        duration: 0.35,
        ease: 'power3.out',
      });
    });

    return () => ctx.revert();
  }, [open, prefersReducedMotion]);

  // --- dragging ------------------------------------------------------------
  const handleDragMove = useCallback((event: globalThis.PointerEvent) => {
    const origin = dragOrigin.current;
    if (!origin) return;

    setOffset({
      // Clamped so the title bar can never be dragged out of reach.
      x: clamp(event.clientX - origin.x, -window.innerWidth / 2, window.innerWidth / 2),
      y: clamp(event.clientY - origin.y, -window.innerHeight / 2, window.innerHeight / 2 - DRAG_MARGIN),
    });
  }, []);

  const endDrag = useCallback(() => {
    dragOrigin.current = null;
    document.removeEventListener('pointermove', handleDragMove);
    document.removeEventListener('pointerup', endDrag);
  }, [handleDragMove]);

  useEffect(() => endDrag, [endDrag]);

  function startDrag(event: ReactPointerEvent<HTMLDivElement>): void {
    // Only a primary press on the bar itself, and never while maximised or on
    // a viewport too small to have anywhere to drag to.
    if (event.button !== 0 || maximized || window.innerWidth < 640) return;
    if ((event.target as HTMLElement).closest('button')) return;

    dragOrigin.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
    document.addEventListener('pointermove', handleDragMove);
    document.addEventListener('pointerup', endDrag);
  }

  if (!open) return null;

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/85 p-0 backdrop-blur-sm sm:p-6"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={windowRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={maximized ? undefined : { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
        // The dialog is focused on open purely to seed the tab order, so it
        // must not paint the global focus ring the way a deliberate tab stop would.
        className={`flex flex-col overflow-hidden border border-ink-700 bg-ink-900 shadow-2xl shadow-black/60 outline-none focus-visible:ring-0 ${
          maximized
            ? 'h-full w-full rounded-none sm:rounded-xl'
            : 'h-full w-full rounded-none sm:h-auto sm:max-h-[88vh] sm:w-full sm:max-w-5xl sm:rounded-xl'
        }`}
      >
        {/* Title bar */}
        <div
          onPointerDown={startDrag}
          onDoubleClick={() => setMaximized((current) => !current)}
          className={`flex shrink-0 items-center gap-3 border-b border-ink-700 bg-ink-850 px-4 py-3 ${
            maximized ? '' : 'sm:cursor-grab sm:active:cursor-grabbing'
          }`}
        >
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>

          <p className="min-w-0 flex-1 truncate text-center font-mono text-xs text-muted">{title}</p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMaximized((current) => !current)}
              aria-pressed={maximized}
              className="hidden rounded p-1.5 text-muted transition-colors hover:bg-ink-700 hover:text-white sm:block"
            >
              <span className="sr-only">{maximized ? 'Restore window' : 'Maximise window'}</span>
              <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" aria-hidden="true">
                <rect x="2.5" y="2.5" width="9" height="9" strokeWidth="1.5" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1.5 text-muted transition-colors hover:bg-ink-700 hover:text-white"
            >
              <span className="sr-only">Close window</span>
              <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M3 3l8 8M11 3l-8 8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {toolbar && <div className="shrink-0 border-b border-ink-700 bg-ink-850/60">{toolbar}</div>}

        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
