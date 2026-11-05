import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

// Roteia após login: admin → /admin, expositor → /expositor
export default async function PainelRedirect() {
  const s = await getSession();
  if (!s) redirect('/entrar');
  redirect(s.role === 'admin' ? '/admin' : '/expositor');
}
