// Planta simplificada do pavilhão (grade 12x8). Substitua por uma imagem/SVG
// real da planta quando disponível.
const COLS = 12;
const ROWS = 8;

export function StandMap({ x, y, code }: { x: number | null; y: number | null; code: string }) {
  const hasPos = x != null && y != null && x >= 1 && x <= COLS && y >= 1 && y <= ROWS;
  return (
    <div>
      <svg viewBox={`0 0 ${COLS * 10 + 4} ${ROWS * 10 + 14}`} className="w-full" role="img" aria-label={`Planta com o estande ${code}`}>
        <rect x="0" y="0" width={COLS * 10 + 4} height={ROWS * 10 + 4} rx="3" className="fill-bid-surface-soft" />
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((__, c) => {
            const isMine = hasPos && c + 1 === x && r + 1 === y;
            const isAisle = c === 3 || c === 8; // corredores
            if (isAisle) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={2 + c * 10 + 0.6}
                y={2 + r * 10 + 0.6}
                width={8.8}
                height={8.8}
                rx="1"
                className={isMine ? 'fill-brand-600' : 'fill-white stroke-bid-text/20'}
                strokeWidth={0.3}
              />
            );
          })
        )}
        {hasPos && (
          <text x={2 + (x! - 1) * 10 + 5} y={2 + (y! - 1) * 10 + 6.2} textAnchor="middle" className="fill-white" fontSize="3.4" fontWeight="700">
            {code}
          </text>
        )}
        <text x={(COLS * 10 + 4) / 2} y={ROWS * 10 + 11} textAnchor="middle" className="fill-bid-muted" fontSize="3.5">
          ▲ Entrada principal
        </text>
      </svg>
      {!hasPos && <p className="mt-2 text-xs text-bid-muted">Posição na planta ainda não definida pela organização.</p>}
    </div>
  );
}
