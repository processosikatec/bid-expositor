// Esqueleto exibido instantaneamente na navegação enquanto o servidor carrega.
export function PanelSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Carregando">
      <div className="mb-2 h-8 w-64 rounded-xl bg-bid-text/10" />
      <div className="mb-8 h-4 w-96 max-w-full rounded-lg bg-bid-text/5" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-28" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card h-64" />
        <div className="card h-64" />
      </div>
    </div>
  );
}
