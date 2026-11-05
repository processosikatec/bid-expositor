import type { ReactNode } from 'react';

const TONES = {
  gray: 'bg-bid-surface-soft text-bid-text ring-bid-text/10',
  blue: 'bg-brand-50 text-brand-700 ring-brand-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
} as const;

export type Tone = keyof typeof TONES;

export function Badge({ tone = 'gray', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}>
      {children}
    </span>
  );
}

const STATUS: Record<string, { label: string; tone: Tone }> = {
  // documentos
  pendente_envio: { label: 'Pendente', tone: 'gray' },
  enviado: { label: 'Em análise', tone: 'amber' },
  aprovado: { label: 'Aprovado', tone: 'green' },
  reprovado: { label: 'Reprovado', tone: 'red' },
  // expositor
  pendente: { label: 'Pendente', tone: 'amber' },
  confirmado: { label: 'Confirmado', tone: 'green' },
  cancelado: { label: 'Cancelado', tone: 'red' },
  // novos 2027
  novo: { label: 'Novo', tone: 'blue' },
  em_contato: { label: 'Em contato', tone: 'amber' },
  recusado: { label: 'Recusado', tone: 'red' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: 'gray' as Tone };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-bid-text">{title}</h1>
        {description && <p className="mt-1 text-sm text-bid-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between text-sm text-bid-muted">
        <span>{label}</span>
        {icon && <span className="text-brand-500">{icon}</span>}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-bid-muted">{hint}</div>}
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-bid-surface-soft" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${v}%` }} />
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-bid-text/20 bg-white p-8 text-center">
      <p className="font-medium text-bid-text">{title}</p>
      {children && <div className="mt-1 text-sm text-bid-muted">{children}</div>}
    </div>
  );
}

export function Alert({ tone = 'blue', children }: { tone?: 'blue' | 'red' | 'green' | 'amber'; children: ReactNode }) {
  const cls = {
    blue: 'border-brand-200 bg-brand-50 text-brand-900',
    red: 'border-red-200 bg-red-50 text-red-800',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
  }[tone];
  return <div className={`rounded-xl border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}
