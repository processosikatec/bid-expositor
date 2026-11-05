import { EVENT } from './event';

const TZ = EVENT.timezone;

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  // Datas puras (YYYY-MM-DD) não têm fuso: evita voltar um dia.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return d.toLocaleDateString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'A definir';
  return `${formatDateTime(start)} → ${formatDateTime(end)}`;
}

/** timestamptz → valor de <input type="datetime-local"> no fuso do evento. */
export function toLocalInput(value: string | null | undefined): string {
  if (!value) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/** <input type="datetime-local"> (fuso do evento, BRT) → ISO com offset. */
export function fromLocalInput(value: FormDataEntryValue | null): string | null {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  return `${v}:00-03:00`;
}

export function formatBytes(n: number | null | undefined): string {
  if (!n) return '';
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function daysUntil(date: string): number {
  const target = new Date(`${date}T23:59:59-03:00`).getTime();
  return Math.ceil((target - Date.now()) / 86_400_000);
}

export function str(form: FormData, key: string, max = 500): string | null {
  const v = form.get(key);
  if (typeof v !== 'string') return null;
  const t = v.trim().slice(0, max);
  return t.length ? t : null;
}

export function num(form: FormData, key: string): number | null {
  const v = str(form, key, 30);
  if (!v) return null;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
