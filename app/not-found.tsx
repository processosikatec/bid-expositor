import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="text-5xl font-black text-brand-600">404</p>
        <p className="mt-2 text-bid-muted">Página não encontrada.</p>
        <Link href="/" className="btn-primary mt-6">Voltar ao início</Link>
      </div>
    </div>
  );
}
