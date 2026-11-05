import { PanelShell } from '@/components/panel-shell';
import type { NavItem } from '@/components/nav-links';
import { requireExhibitor } from '@/lib/auth';

const NAV: NavItem[] = [
  { href: '/expositor', label: 'Início', icon: 'home', exact: true },
  { href: '/expositor/onboarding', label: 'Onboarding', icon: 'onboarding' },
  { href: '/expositor/estande', label: 'Meu estande', icon: 'stand' },
  { href: '/expositor/documentos', label: 'Documentos', icon: 'docs' },
  { href: '/manual', label: 'Manual do expositor', icon: 'manual' },
];

export default async function ExhibitorLayout({ children }: { children: React.ReactNode }) {
  const { exhibitor, role } = await requireExhibitor();
  const nav = role === 'admin' ? [...NAV, { href: '/admin', label: 'Admin', icon: 'dashboard' } as NavItem] : NAV;
  return (
    <PanelShell nav={nav} title={exhibitor.trade_name || exhibitor.company_name} subtitle={`Expositor · edição ${exhibitor.edition}`}>
      {children}
    </PanelShell>
  );
}
