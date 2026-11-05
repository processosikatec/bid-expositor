import { Clock, Hammer, MapPin, Ruler, Zap } from 'lucide-react';
import { requireExhibitor } from '@/lib/auth';
import { EVENT } from '@/lib/event';
import { formatRange } from '@/lib/format';
import { EmptyState, PageHeader } from '@/components/ui';
import { StandMap } from '@/components/stand-map';
import type { Stand } from '@/lib/types';

export const metadata = { title: 'Meu estande' };

export default async function StandPage() {
  const { supabase, exhibitor } = await requireExhibitor();
  const { data } = await supabase.from('stands').select('*').eq('exhibitor_id', exhibitor.id).maybeSingle();
  const stand = data as Stand | null;

  if (!stand) {
    return (
      <>
        <PageHeader title="Meu estande" />
        <EmptyState title="Seu estande ainda não foi definido">
          A organização vai cadastrar a localização e os horários em breve. Dúvidas: {EVENT.contacts.email}
        </EmptyState>
      </>
    );
  }

  const info = [
    { icon: MapPin, label: 'Localização', value: [stand.pavilion, stand.street].filter(Boolean).join(' · ') || '—' },
    { icon: Ruler, label: 'Área', value: stand.area_m2 ? `${stand.area_m2} m²` : '—' },
    { icon: Hammer, label: 'Tipo', value: stand.stand_type ?? '—' },
    { icon: Zap, label: 'Energia', value: stand.power_kva ? `${stand.power_kva} kVA` : '—' },
  ];

  return (
    <>
      <PageHeader title="Meu estande" description={`${EVENT.venue} · ${EVENT.address}`} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="card overflow-hidden">
            <div className="bg-institutional px-6 py-6 text-white">
              <p className="text-xs uppercase tracking-wider text-brand-100">Estande</p>
              <p className="text-4xl font-black">{stand.code}</p>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-bid-surface-soft">
              {info.map((i) => (
                <div key={i.label} className="bg-white p-4">
                  <dt className="flex items-center gap-1.5 text-xs text-bid-muted"><i.icon className="h-3.5 w-3.5" /> {i.label}</dt>
                  <dd className="mt-1 font-semibold">{i.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-bold"><Clock className="h-5 w-5 text-brand-600" /> Horários</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-bid-muted">Montagem</dt>
                <dd className="font-medium">{formatRange(stand.setup_start, stand.setup_end)}</dd>
              </div>
              <div>
                <dt className="text-bid-muted">Evento (aberto ao público)</dt>
                <dd className="font-medium">{EVENT.dateLabel} · {EVENT.hoursLabel}</dd>
              </div>
              <div>
                <dt className="text-bid-muted">Desmontagem</dt>
                <dd className="font-medium">{formatRange(stand.teardown_start, stand.teardown_end)}</dd>
              </div>
            </dl>
          </div>

          {stand.notes && (
            <div className="card p-6">
              <h2 className="font-bold">Observações da organização</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-bid-muted">{stand.notes}</p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Localização na planta</h2>
            <a href={EVENT.mapsUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-700 hover:underline">Como chegar</a>
          </div>
          <StandMap x={stand.map_x} y={stand.map_y} code={stand.code} />
          <p className="mt-3 text-xs text-bid-muted">Planta ilustrativa. A planta oficial está no manual do expositor.</p>
        </div>
      </div>
    </>
  );
}
