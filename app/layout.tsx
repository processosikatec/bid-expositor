import type { Metadata, Viewport } from 'next';
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import { EVENT } from '@/lib/event';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });

export const metadata: Metadata = {
  title: { default: `Guia do Expositor · ${EVENT.name}`, template: `%s · ${EVENT.name}` },
  description: `Guia e painel do expositor do ${EVENT.fullName}: manual, documentos, estande e onboarding.`,
};

export const viewport: Viewport = { themeColor: '#09031F' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
