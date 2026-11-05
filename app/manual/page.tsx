import type { Metadata } from 'next';
import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { SiteFooter, SiteHeader } from '@/components/site-header';
import { DarkHero } from '@/components/dark-hero';
import { EVENT, MANUAL_SECTIONS } from '@/lib/event';

export const metadata: Metadata = { title: 'Manual do Expositor' };

export default function ManualPage() {
  return (
    <>
      <SiteHeader />
      <DarkHero eyebrow={`${EVENT.name} · ${EVENT.dateLabel}`} title="Manual do Expositor">
        Regras, prazos e orientações para participar do evento no {EVENT.venue}. Em caso de dúvida, fale com o atendimento ao expositor.
      </DarkHero>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="card p-3 text-sm">
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-bid-muted/70">Seções</p>
              {MANUAL_SECTIONS.map((s, i) => (
                <a key={s.id} href={`#${s.id}`} className="flex gap-2 rounded-lg px-2 py-1.5 text-bid-muted hover:bg-bid-surface-soft hover:text-bid-text">
                  <span className="text-bid-muted/70">{i + 1}.</span> {s.title}
                </a>
              ))}
            </nav>
            <div className="card mt-4 space-y-2 p-4 text-sm text-bid-muted">
              <p className="font-semibold text-bid-text">Atendimento</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-600" /> {EVENT.contacts.email}</p>
              <p className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-brand-600" /> {EVENT.contacts.whatsapp}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-600" /> {EVENT.venue}</p>
            </div>
          </aside>

          <div className="space-y-8">
            {MANUAL_SECTIONS.map((s, i) => (
              <section key={s.id} id={s.id} className="card scroll-mt-24 p-6">
                <p className="eyebrow text-brand-600">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="mt-1 text-2xl font-bold">{s.title}</h2>
                {s.intro && <p className="mt-1 text-sm text-bid-muted">{s.intro}</p>}
                <div className="mt-4 divide-y divide-bid-text/8">
                  {s.items.map((it) => (
                    <details key={it.title} className="group py-3" open={s.id !== 'faq'}>
                      <summary className="cursor-pointer list-none font-medium text-bid-text marker:hidden">
                        <span className="mr-2 inline-block text-bid-muted/70 transition group-open:rotate-90">›</span>
                        {it.title}
                      </summary>
                      <p className="mt-2 pl-5 text-sm leading-relaxed text-bid-muted">{it.body}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
