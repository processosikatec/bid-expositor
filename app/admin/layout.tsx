import { PanelShell } from '@/components/panel-shell';
import type { NavItem } from '@/components/nav-links';
import { requireAdmin } from '@/lib/auth';
import { EVENT } from '@/lib/event';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, email, exhibitor } = await requireAdmin();
  const [{ count: pendingDocs }, { count: newApps }] = await Promise.all([
    supabase.from('documents').select('id', { count: 'exact', head: true }).eq('status', 'enviado'),
    supabase.from('applications_2027').select('id', { count: 'exact', head: true }).eq('status', 'novo'),
  ]);

  const nav: NavItem[] = [
    { href: '/admin', label: 'Visão geral', icon: 'dashboard', exact: true },
    { href: '/admin/expositores', label: 'Expositores', icon: 'users' },
    { href: '/admin/documentos', label: 'Documentos', icon: 'review', badge: pendingDocs ?? 0 },
    { href: '/admin/novos-2027', label: `Novos ${EVENT.nextEdition}`, icon: 'new', badge: newApps ?? 0 },
    { href: '/manual', label: 'Manual (público)', icon: 'manual' },
  ];
  if (exhibitor) nav.push({ href: '/expositor', label: 'Ver como expositor', icon: 'home' });

  return (
    <PanelShell nav={nav} title="Organização BID" subtitle={email}>
      {children}
    </PanelShell>
  );
}
