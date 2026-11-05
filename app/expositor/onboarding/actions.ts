'use server';

import { revalidatePath } from 'next/cache';
import { requireExhibitor } from '@/lib/auth';
import { ONBOARDING_STEPS } from '@/lib/event';

export async function toggleStep(form: FormData) {
  const { supabase, exhibitor } = await requireExhibitor();
  const step = String(form.get('step') ?? '');
  if (!ONBOARDING_STEPS.some((s) => s.id === step && !s.auto)) return;

  await supabase.rpc('set_onboarding_step', {
    p_exhibitor: exhibitor.id,
    p_step: step,
    p_done: form.get('done') === '1',
  });
  revalidatePath('/expositor', 'layout');
}
