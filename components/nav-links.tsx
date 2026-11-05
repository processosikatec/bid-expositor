'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Rocket,
  Sparkles,
  Users,
} from 'lucide-react';

const ICONS = {
  home: Home,
  dashboard: LayoutDashboard,
  onboarding: Rocket,
  stand: MapPin,
  docs: FileText,
  manual: BookOpen,
  users: Users,
  review: ClipboardCheck,
  new: Sparkles,
} as const;

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; exact?: boolean; badge?: number };

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:pb-0">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? 'bg-white text-bid-purple-dark shadow-lg shadow-black/20' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? 'text-brand-600' : ''}`} />
            <span>{item.label}</span>
            {!!item.badge && (
              <span className="ml-auto rounded-full bg-bid-cyan px-1.5 text-[11px] font-bold text-bid-bg-dark">{item.badge}</span>
            )}
          </Link>
        );
      })}
      <form action="/auth/sair" method="post" className="lg:hidden">
        <button className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </form>
    </nav>
  );
}
