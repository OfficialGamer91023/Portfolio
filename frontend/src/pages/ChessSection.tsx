import { useCallback, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Color, PieceSymbol, Square } from 'chess.js';
import { Reveal } from '../components/Reveal';

const GLYPH: Record<Color, Record<PieceSymbol, string>> = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};
const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

function squareName(file: number, rankRow: number): Square {
  return `${FILES[file]}${8 - rankRow}` as Square;
}

/**
 * "Play me at chess" — the interactive front end for a bigger project (a model
 * trained on Rafay's own games). The engine here is a stand-in: greedy captures,
 * otherwise random. Client-side only; loaded in its own chunk so chess.js is not
 * in the first paint.
 */
export default function ChessSection() {
  const gameRef = useRef(new Chess());
  const [, force] = useState(0);
  const rerender = useCallback(() => force((n) => n + 1), []);

  const [selected, setSelected] = useState<Square | null>(null);
  const [status, setStatus] = useState<string>("Your move. You're White.");
  const [over, setOver] = useState<boolean>(false);

  const game = gameRef.current;

  const targets = useMemo<Set<string>>(() => {
    if (!selected) return new Set();
    return new Set(game.moves({ square: selected, verbose: true }).map((m) => m.to));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, game.fen()]);

  const checkEnd = useCallback((): boolean => {
    if (game.isCheckmate()) {
      setOver(true);
      setStatus(game.turn() === 'w' ? 'Rafay wins. Told you. ✓' : 'You beat me. Respect. ✓');
      return true;
    }
    if (game.isDraw() || game.isStalemate()) {
      setOver(true);
      setStatus('Draw.');
      return true;
    }
    if (game.isCheck()) {
      setStatus(`${game.turn() === 'w' ? 'You are' : 'Rafay is'} in check.`);
    }
    return false;
  }, [game]);

  const botMove = useCallback((): void => {
    if (over) return;
    const moves = game.moves({ verbose: true });
    if (!moves.length) return;
    // greedy: best capture, else random — a stand-in for the trained model.
    moves.sort((a, b) => (VALUE[b.captured ?? 'k'] ?? 0) - (VALUE[a.captured ?? 'k'] ?? 0));
    const best = (VALUE[moves[0].captured ?? 'k'] ?? 0) > 0 ? moves[0] : moves[Math.floor(Math.random() * moves.length)];
    game.move(best);
    rerender();
    if (!checkEnd()) setStatus('Your move.');
  }, [game, over, checkEnd, rerender]);

  const onSquareClick = useCallback(
    (name: Square): void => {
      if (over || game.turn() !== 'w') return;
      const piece = game.get(name);

      if (selected) {
        const legal = game
          .moves({ square: selected, verbose: true })
          .find((m) => m.to === name);
        if (legal) {
          game.move({ from: selected, to: name, promotion: 'q' });
          setSelected(null);
          rerender();
          if (!checkEnd()) {
            setStatus('Rafay is thinking…');
            window.setTimeout(botMove, 520);
          }
          return;
        }
      }
      setSelected(piece && piece.color === 'w' ? name : null);
    },
    [game, over, selected, checkEnd, botMove, rerender],
  );

  const newGame = useCallback((): void => {
    gameRef.current = new Chess();
    setSelected(null);
    setOver(false);
    setStatus("Your move. You're White.");
    rerender();
  }, [rerender]);

  const history = game.history();
  const moveLog =
    history.reduce((acc, san, i) => {
      if (i % 2 === 0) return `${acc}${i / 2 + 1}. ${san} `;
      return `${acc}${san}  `;
    }, '') || '1. ';

  const board = game.board();

  return (
    <section id="off" className="relative border-t border-grid-bold">
      <div className="mx-auto max-w-[940px] px-6 py-11">
        <span className="section-idx">§ 04</span>
        <Reveal>
          <span className="section-lbl plot">interactive · Tier-1 mock</span>
          <h2 className="nb-h2 mt-1.5">Play me at chess</h2>
          <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-content-2">
            Yes, really. You&apos;re playing <b className="text-content">Rafay (approx)</b> — a bot
            whose opening leans on my own games, backed by a move engine after that. This is the fun
            front end for a bigger project: a model trained to actually play in my style.
          </p>
        </Reveal>

        <Reveal className="mt-8" delay={0.05}>
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[auto_1fr]">
            {/* Board */}
            <div
              className="grid aspect-square w-[min(360px,80vw)] grid-cols-8 grid-rows-8 overflow-hidden rounded-md border border-content shadow-xl"
              role="grid"
              aria-label="chess board"
            >
              {board.map((row, r) =>
                row.map((piece, f) => {
                  const name = squareName(f, r);
                  const isDark = (r + f) % 2 === 1;
                  const isSel = selected === name;
                  const isTarget = targets.has(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onSquareClick(name)}
                      className="relative flex items-center justify-center text-[min(6vw,30px)] leading-none"
                      style={{ background: isDark ? 'var(--sq-dark)' : 'var(--sq-lite)' }}
                      aria-label={name}
                    >
                      {isSel && (
                        <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_3px_var(--plot)]" />
                      )}
                      {isTarget && !piece && (
                        <span className="pointer-events-none absolute h-[26%] w-[26%] rounded-full bg-verify/50" />
                      )}
                      {isTarget && piece && (
                        <span className="pointer-events-none absolute inset-[8%] rounded-full border-[3px] border-plot/60" />
                      )}
                      {piece && (
                        <span
                          className="pointer-events-none"
                          style={{
                            color: piece.color === 'w' ? 'var(--pc-w)' : 'var(--pc-b)',
                            textShadow: piece.color === 'w' ? '0 1px 0 var(--pc-wsh)' : undefined,
                          }}
                        >
                          {GLYPH[piece.color][piece.type]}
                        </span>
                      )}
                    </button>
                  );
                }),
              )}
            </div>

            {/* Side panel */}
            <div className="font-mono">
              <div className="mb-3.5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-content text-sm font-bold text-paper">
                  R
                </div>
                <div>
                  <div className="text-sm font-semibold text-content">Rafay (approx)</div>
                  <div className="text-[11px] text-content-3">~1600 · opening from 1,240 of my games</div>
                </div>
              </div>

              <div className="mb-3 min-h-[1.4em] text-[13px] text-content-2">
                {status.includes('✓') ? (
                  <>
                    {status.replace('✓', '')}
                    <span className="text-verify">✓</span>
                  </>
                ) : (
                  status
                )}
              </div>

              <pre className="max-h-[120px] overflow-y-auto whitespace-pre-wrap rounded-md border border-edge bg-card px-3 py-2.5 text-xs leading-[1.7] text-content-3">
                {moveLog}
              </pre>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={newGame}
                  className="rounded-md border border-content bg-content px-3.5 py-2 text-xs text-paper transition-opacity hover:opacity-90"
                >
                  New game
                </button>
              </div>

              <p className="mt-4 text-xs text-content-3">
                // mock engine: greedy + random. real build swaps in the trained model{' '}
                <span className="text-verify">✓</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
