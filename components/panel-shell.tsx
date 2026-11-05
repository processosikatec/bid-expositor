import type { ReactNode } from 'react';
import { Logo } from './site-header';
import { NavLinks, type NavItem } from './nav-links';

export function PanelShell({
  nav,
  title,
  subtitle,
  children,
}: {
  nav: NavItem[];
  title: string;
  subtitle?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="bg-institutional relative overflow-hidden text-white lg:sticky lg:top-0 lg:h-dvh">
        <div className="tech-glow pointer-events-none absolute inset-0 opacity-80" />
        <div className="relative flex h-full flex-col gap-5 p-5">
          <Logo subtitle={null} />
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <p className="eyebrow text-bid-cyan">{subtitle ?? 'Painel'}</p>
            <p className="mt-0.5 truncate font-heading text-base font-semibold">{title}</p>
          </div>
          <NavLinks items={nav} />
          <form action="/auth/sair" method="post" className="mt-auto hidden lg:block">
            <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/55 transition hover:bg-white/10 hover:text-white">Sair</button>
          </form>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
