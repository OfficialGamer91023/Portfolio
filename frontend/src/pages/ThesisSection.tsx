import { Reveal } from '../components/Reveal';

const CHIPS = [
  { label: 'interval arithmetic', ctx: '/ lib2geom' },
  { label: '12-gate risk kernel', ctx: '/ Vigil' },
  { label: 'HIPAA audit trail', ctx: '/ voice agent' },
  { label: 'mypy --strict', ctx: '/ 241 tests' },
] as const;

export function ThesisSection() {
  return (
    <section id="thesis" className="relative border-t border-grid-bold">
      <div className="mx-auto max-w-[940px] px-6 py-[34px]">
        <span className="section-idx">§ 00</span>
        <Reveal>
          <span className="section-lbl">the through-line</span>
          <p className="mt-3 max-w-[24ch] text-balance font-serif font-semibold leading-[1.25] tracking-[-0.01em] text-content [font-size:clamp(22px,3.6vw,32px)]">
            Systems and AI aren&apos;t two hats. They&apos;re the same instinct:{' '}
            <span className="text-plot underline decoration-plot/40 decoration-1 underline-offset-[5px]">
              never let unverified output reach the world.
            </span>
          </p>

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {CHIPS.map((chip) => (
              <li
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-card px-3 py-1.5 font-mono text-xs text-content-2"
              >
                <span className="text-verify">✓</span>
                <span className="text-content">{chip.label}</span>
                <span className="text-content-3">{chip.ctx}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
