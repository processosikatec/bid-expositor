import { ONBOARDING_STEPS } from './event';
import type { DocumentType, ExhibitorDocument } from './types';

/** Último envio de cada tipo de documento. Espera docs ordenados por uploaded_at desc. */
export function latestByType(docs: ExhibitorDocument[]) {
  const map = new Map<string, ExhibitorDocument>();
  for (const d of docs) if (!map.has(d.document_type_id)) map.set(d.document_type_id, d);
  return map;
}

export function docsSummary(types: DocumentType[], docs: ExhibitorDocument[]) {
  const latest = latestByType(docs);
  const required = types.filter((t) => t.required);
  const sentRequired = required.filter((t) => {
    const d = latest.get(t.id);
    return d && d.status !== 'reprovado';
  });
  const approvedRequired = required.filter((t) => latest.get(t.id)?.status === 'aprovado');
  const rejected = types.filter((t) => latest.get(t.id)?.status === 'reprovado');
  return {
    latest,
    requiredCount: required.length,
    sentRequiredCount: sentRequired.length,
    approvedRequiredCount: approvedRequired.length,
    rejectedCount: rejected.length,
    allRequiredSent: required.length > 0 && sentRequired.length === required.length,
  };
}

export function onboardingProgress(steps: Record<string, string>, allRequiredDocsSent: boolean) {
  const done = ONBOARDING_STEPS.filter((s) => (s.auto === 'documentos' ? allRequiredDocsSent : !!steps?.[s.id]));
  return {
    done: done.length,
    total: ONBOARDING_STEPS.length,
    pct: (done.length / ONBOARDING_STEPS.length) * 100,
    isDone: (id: string) => done.some((s) => s.id === id),
  };
}
