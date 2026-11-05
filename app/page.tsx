import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, FileText, MapPin, QrCode, Rocket, Sparkles } from 'lucide-react';
import { SiteFooter, SiteHeader } from '@/components/site-header';
import { EVENT, KEY_DATES, MANUAL_SECTIONS } from '@/lib/event';
import { daysUntil, formatDate } from '@/lib/format';

// Estática com revalidação a cada hora (contagem regressiva é em dias)
export const revalidate = 3600;

export default function Home() {
  const eventDays = daysUntil('2026-11-11');

  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-bid-bg-dark text-white">
        <Image src="/brand/hero-palco.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[50%_35%] opacity-45" />
        <div className="bg-institutional absolute inset-0 -z-10 opacity-85" />
        <div className="tech-glow absolute inset-0 -z-10" />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 md:pt-24 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-bid-cyan backdrop-blur">
              <CalendarDays className="h-3.5 w-3.5" /> {EVENT.dateLabel} · {EVENT.venue} · {EVENT.city}
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-[0.95] md:text-7xl">
              Guia do
              <br />
              <span className="bg-gradient-to-r from-bid-lilac via-white to-bid-cyan bg-clip-text text-transparent">Expositor.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/75">
              Tudo o que sua empresa precisa para expor no {EVENT.name}: manual, documentos, seu estande e o passo a passo até a abertura.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/entrar" className="btn-primary">
                Acessar meu painel <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/manual" className="btn-ghost-light">
                <BookOpen className="h-4 w-4" /> Ler o manual
              </Link>
            </div>
          </div>

          <div className="rounded-4xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-xl md:p-7">
            <div className="flex items-baseline justify-between">
              <h2 className="eyebrow text-bid-cyan">Datas importantes</h2>
              {eventDays > 0 && (
                <span className="font-heading text-sm text-white/70">
                  faltam <strong className="text-2xl text-white">{eventDays}</strong> dias
                </span>
              )}
            </div>
            <ol className="mt-5 space-y-1">
              {KEY_DATES.map((d) => {
                const left = daysUntil(d.date);
                return (
                  <li key={d.label} className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition hover:bg-white/5">
                    <div className="flex items-center gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 font-heading text-lg font-bold leading-none">
                        {formatDate(d.date).slice(0, 2)}
                        <span className="sr-only">/{formatDate(d.date).slice(3, 5)}</span>
                      </span>
                      <div>
                        <p className="font-semibold">{d.label}</p>
                        <p className="text-sm text-white/55">{d.note ?? formatDate(d.date)}</p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                        left < 0 ? 'bg-white/5 text-white/40' : left <= 2 ? 'bg-bid-yellow text-bid-bg-dark' : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {left > 0 ? `em ${left}d` : left === 0 ? 'hoje' : 'ok'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* PAINEL */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="eyebrow text-brand-600">Para expositores confirmados</p>
        <h2 className="mt-2 max-w-2xl text-4xl font-bold leading-tight">
          Um painel. <span className="text-bid-muted">Tudo do seu estande.</span>
        </h2>
        <p className="mt-3 max-w-2xl text-bid-muted">Entre com o link mágico enviado ao seu e-mail ou com o QR code recebido da organização. Sem senha.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Rocket, title: 'Onboarding', text: 'Checklist com cada etapa até o dia do evento.', href: '/expositor/onboarding', tone: 'from-bid-violet to-bid-violet-light' },
            { icon: MapPin, title: 'Meu estande', text: 'Local na planta, metragem e horários de montagem.', href: '/expositor/estande', tone: 'from-bid-purple to-bid-violet' },
            { icon: FileText, title: 'Documentos', text: 'Envie e acompanhe a aprovação dos documentos.', href: '/expositor/documentos', tone: 'from-bid-violet-light to-bid-cyan' },
            { icon: QrCode, title: 'Acesso por QR', text: 'Escaneie o QR code e entre direto pelo celular.', href: '/entrar', tone: 'from-bid-cyan to-bid-violet-light' },
          ].map((c) => (
            <Link key={c.title} href={c.href} className="card group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${c.tone} text-white shadow-lg shadow-brand-600/25`}>
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-bid-muted">{c.text}</p>
              <ArrowUpRight className="absolute right-5 top-5 h-5 w-5 text-bid-muted/40 transition group-hover:text-brand-600" />
            </Link>
          ))}
        </div>
      </section>

      {/* MANUAL + 2027 */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-24 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="card p-8">
          <p className="eyebrow text-brand-600">Manual do expositor</p>
          <h2 className="mt-2 text-2xl font-bold">Regras, prazos e orientações</h2>
          <ul className="mt-6 grid gap-x-6 sm:grid-cols-2">
            {MANUAL_SECTIONS.map((s, i) => (
              <li key={s.id} className="border-b border-bid-text/8">
                <Link href={`/manual#${s.id}`} className="group flex items-center gap-3 py-3.5 text-sm font-medium hover:text-brand-600">
                  <span className="font-heading text-xs font-bold text-bid-muted/60">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                  <ArrowRight className="ml-auto h-4 w-4 text-bid-muted/40 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-institutional relative overflow-hidden rounded-4xl p-8 text-white">
          <div className="tech-glow absolute inset-0" />
          <div className="relative flex h-full flex-col">
            <p className="eyebrow inline-flex items-center gap-2 text-bid-cyan">
              <Sparkles className="h-4 w-4" /> Novos expositores
            </p>
            <h2 className="mt-3 text-4xl font-bold leading-tight">
              Exponha no BID <span className="text-bid-cyan">{EVENT.nextEdition}</span>.
            </h2>
            <p className="mt-3 max-w-md text-white/70">
              Faça o pré-cadastro da sua empresa. A organização entra em contato com planta, cotas e condições da próxima edição.
            </p>
            <Link href="/novos-expositores-2027" className="btn-primary mt-8 self-start">
              Quero expor em {EVENT.nextEdition} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
