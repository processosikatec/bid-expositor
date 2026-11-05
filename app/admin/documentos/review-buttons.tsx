'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { SubmitButton } from '@/components/submit-button';
import { reviewDocumentAction } from '../actions';

export function ReviewButtons({ docId }: { docId: string }) {
  const [rejecting, setRejecting] = useState(false);

  if (rejecting) {
    return (
      <form action={reviewDocumentAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={docId} />
        <input type="hidden" name="decision" value="reprovado" />
        <input name="note" required autoFocus placeholder="Motivo da reprovação" className="input w-56 py-1.5" />
        <SubmitButton className="btn-danger px-3 py-1.5 text-xs" pendingText="…">Reprovar</SubmitButton>
        <button type="button" onClick={() => setRejecting(false)} className="text-xs text-bid-muted">cancelar</button>
      </form>
    );
  }

  return (
    <div className="flex gap-2">
      <form action={reviewDocumentAction}>
        <input type="hidden" name="id" value={docId} />
        <input type="hidden" name="decision" value="aprovado" />
        <SubmitButton className="btn px-3 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700" pendingText="…">
          <Check className="h-3.5 w-3.5" /> Aprovar
        </SubmitButton>
      </form>
      <button type="button" onClick={() => setRejecting(true)} className="btn-danger px-3 py-1.5 text-xs">
        <X className="h-3.5 w-3.5" /> Reprovar
      </button>
    </div>
  );
}
