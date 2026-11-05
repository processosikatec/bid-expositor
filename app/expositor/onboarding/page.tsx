import Link from 'next/link';
import { CheckCircle2, Circle, ExternalLink, PartyPopper } from 'lucide-react';
import { requireExhibitor } from '@/lib/auth';
import { loadExhibitorData } from '@/lib/server/exhibitor-data';
import { docsSummary, onboardingProgress } from '@/lib/progress';
import { ONBOARDING_STEPS } from '@/lib/event';
import { Alert, PageHeader, Progress } from '@/components/ui';
import { toggleStep } from './actions';

export const metadata = { title: 'Onboarding' };

export default async function OnboardingPage() {
  const { supabase, exhibitor } = await requireExhibitor();
  const { types, docs } = await loadExhibitorData(supabase, exhibitor);
  const ds = docsSummary(types, docs);
  const ob = onboardingProgress(exhibitor.onboarding_steps, ds.allRequiredSent);

  return (
    <>
      <PageHeader title="Onboarding" description="Seu passo a passo até a abertura do evento. Marque cada etapa ao concluir." />

      <div className="card mb-6 p-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium">{ob.done} de {ob.total} etapas concluídas</span>
          <span className="text-bid-muted">{Math.round(ob.pct)}%</span>
        </div>
        <Progress value={ob.pct} />
      </div>

      {ob.done === ob.total && (
        <div className="mb-6">
          <Alert tone="green">
            <span className="flex items-center gap-2"><PartyPopper className="h-4 w-4" /> Tudo pronto! Nos vemos no evento.</span>
          </Alert>
        </div>
      )}

      <ol className="space-y-3">
        {ONBOARDING_STEPS.map((step, i) => {
          const done = ob.isDone(step.id);
          return (
            <li key={step.id} className={`card flex items-start gap-4 p-5 ${done ? 'bg-emerald-50/40' : ''}`}>
              {step.auto ? (
                <span className="mt-0.5" title="Concluída automaticamente">
                  {done ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <Circle className="h-6 w-6 text-bid-text/20" />}
                </span>
              ) : (
                <form action={toggleStep}>
                  <input type="hidden" name="step" value={step.id} />
                  <input type="hidden" name="done" value={done ? '0' : '1'} />
                  <button className="mt-0.5" aria-label={done ? 'Desmarcar etapa' : 'Marcar como concluída'}>
                    {done ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <Circle className="h-6 w-6 text-bid-text/20 hover:text-brand-500" />}
                  </button>
                </form>
              )}
              <div className="flex-1">
                <p className={`font-semibold ${done ? 'text-bid-muted line-through decoration-bid-text/20' : ''}`}>
                  <span className="mr-2 text-bid-muted/70">{i + 1}.</span>
                  {step.title}
                </p>
                <p className="mt-0.5 text-sm text-bid-muted">{step.description}</p>
              </div>
              {step.href && (
                <Link href={step.href} className="btn-secondary shrink-0 px-3 py-1.5 text-xs">
                  Abrir <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
