import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { QrCode } from 'lucide-react';
import { Logo } from '@/components/site-header';
import { Alert } from '@/components/ui';
import { EVENT } from '@/lib/event';
import { LoginForm } from './form';

export const metadata: Metadata = { title: 'Entrar' };

const ERRORS: Record<string, string> = {
  'link-invalido': 'Este link ou QR code é inválido, expirou ou foi revogado. Peça um novo à organização ou entre com seu e-mail.',
  'link-expirado': 'O link mágico expirou ou já foi usado. Solicite um novo abaixo.',
  'sem-expositor': 'Seu e-mail não está vinculado a nenhum expositor. Fale com a organização.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-bid-bg-dark px-4 py-12">
      <Image src="/brand/hero-palco.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-30" />
      <div className="bg-institutional absolute inset-0 -z-10 opacity-90" />
      <div className="tech-glow absolute inset-0 -z-10" />

      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        <div className="card p-7 sm:p-9">
          <p className="eyebrow text-brand-600">{EVENT.name} · Área do expositor</p>
          <h1 className="mt-2 text-2xl font-bold">Acesse seu painel</h1>
          <p className="mt-1 text-sm text-bid-muted">Sem senha: enviamos um link mágico para o e-mail cadastrado.</p>
          {erro && ERRORS[erro] && (
            <div className="mt-5">
              <Alert tone="red">{ERRORS[erro]}</Alert>
            </div>
          )}
          <div className="mt-6">
            <LoginForm />
          </div>
          <div className="mt-6 flex gap-3 rounded-2xl bg-bid-surface-soft p-4 text-sm text-bid-muted">
            <QrCode className="h-5 w-5 shrink-0 text-brand-600" />
            <p>
              <strong className="text-bid-text">Tem um QR code?</strong> Aponte a câmera do celular para o QR enviado pela organização e entre direto.
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-white/60">
          Só quer consultar?{' '}
          <Link href="/manual" className="font-semibold text-bid-cyan hover:underline">
            Abra o manual do expositor
          </Link>
        </p>
      </div>
    </div>
  );
}
