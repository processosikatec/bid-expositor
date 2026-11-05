import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { SiteFooter, SiteHeader } from '@/components/site-header';
import { DarkHero } from '@/components/dark-hero';
import { EVENT } from '@/lib/event';
import { ApplicationForm } from './form';

export const metadata: Metadata = { title: `Novos expositores ${EVENT.nextEdition}` };

export default function NewExhibitorsPage() {
  return (
    <>
      <SiteHeader />
      <DarkHero
        eyebrow="Novos expositores"
        title={
          <>
            Exponha no BID <span className="text-bid-cyan">{EVENT.nextEdition}</span>.
          </>
        }
      >
        Faça o pré-cadastro da sua empresa para a próxima edição. Nossa equipe comercial entra em contato com a planta, as cotas disponíveis e as
        condições de participação.
      </DarkHero>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="eyebrow text-brand-600">Por que se cadastrar agora</p>
          <h2 className="mt-2 text-2xl font-bold">Conecte sua marca ao ecossistema de inovação do interior paulista.</h2>
          <ul className="mt-6 space-y-3 text-sm text-bid-text">
            {[
              'Prioridade na escolha de espaço para quem se cadastrar antes',
              'Acesso ao painel do expositor assim que a participação for confirmada',
              'Manual, documentos e onboarding em um só lugar',
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-bid-muted">
            Dúvidas: {EVENT.contacts.email} · {EVENT.contacts.whatsapp}
          </p>
        </div>
        <div className="card p-6">
          <ApplicationForm />
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
