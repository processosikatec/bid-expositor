import type { ReactNode } from 'react';

/** Faixa escura institucional usada no topo das páginas públicas internas. */
export function DarkHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="bg-institutional relative overflow-hidden text-white">
      <div className="tech-glow absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 md:pb-16 md:pt-16">
        <p className="eyebrow text-bid-cyan">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-white/70">{children}</div>}
      </div>
    </section>
  );
}
