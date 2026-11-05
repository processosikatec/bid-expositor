import Image from 'next/image';
import Link from 'next/link';
import { EVENT } from '@/lib/event';
import { HeaderAuthButton } from './header-auth-button';

/** Logo oficial (versão branca) — usar sobre fundo escuro. */
export function Logo({ subtitle = 'Guia do Expositor', size = 'md' }: { subtitle?: string | null; size?: 'md' | 'lg' }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${EVENT.fullName} — início`}>
      <Image
        src="/brand/logo-bid-white.png"
        alt="BID — Business Innovation Day"
        width={843}
        height={249}
        priority
        className={size === 'lg' ? 'h-12 w-auto' : 'h-9 w-auto'}
      />
      {subtitle && (
        <span className="hidden border-l border-white/20 pl-3 text-[11px] font-bold uppercase leading-tight tracking-[0.14em] text-bid-cyan sm:block">
          {subtitle}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-bid-bg-dark/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/manual" className="hidden rounded-full px-4 py-2 font-medium text-white/75 transition hover:text-white sm:block">
            Manual
          </Link>
          <Link href="/novos-expositores-2027" className="hidden rounded-full px-4 py-2 font-medium text-white/75 transition hover:text-white md:block">
            Expor em {EVENT.nextEdition}
          </Link>
          <a href={EVENT.siteUrl} target="_blank" rel="noreferrer" className="hidden rounded-full px-4 py-2 font-medium text-white/75 transition hover:text-white lg:block">
            conexao.bid
          </a>
          <HeaderAuthButton />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-bid-bg-dark text-white/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo subtitle={null} />
          <p className="mt-4 max-w-sm text-sm">{EVENT.tagline} Negócios que transformam.</p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3 text-bid-cyan">Evento</p>
          <p className="text-white">{EVENT.dateLabel}</p>
          <p>{EVENT.venue} · {EVENT.city}</p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3 text-bid-cyan">Atendimento ao expositor</p>
          <p>{EVENT.contacts.email}</p>
          <p>{EVENT.contacts.whatsapp}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">© {EVENT.edition} BID — Bauru Innovation Day</div>
    </footer>
  );
}
