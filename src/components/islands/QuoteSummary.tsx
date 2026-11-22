import type { Quote } from '../../lib/quote';
import { eur } from '../../lib/format';
import Esempio from './Esempio';

/** Riepilogo dei totali, usato nel carrello. */
export default function QuoteSummary({ q }: { q: Quote }) {
  const s = q.shipping;
  return (
    <div class="space-y-2 text-sm">
      <div class="flex justify-between"><span class="text-moss">Merce (IVA escl.)</span><span class="font-mono">{eur(q.goods_subtotal)}</span></div>
      <div class="flex justify-between">
        <span class="text-moss">Spedizione<Esempio /></span>
        <span class="font-mono">{s.status === 'calculated' ? eur(s.amount ?? 0) : s.status === 'quote_required' ? 'Da quotare' : 'Inserisci CAP'}</span>
      </div>
      <div class="flex justify-between"><span class="text-moss">IVA {Math.round(q.vat_rate * 100)}%</span><span class="font-mono">{eur(q.vat_amount)}</span></div>
      <div class="flex justify-between border-t border-forest-deep pt-3 text-base font-semibold">
        <span>Totale{s.status === 'calculated' ? '' : ' (spedizione esclusa)'}<Esempio /></span>
        <span class="font-mono">{eur(q.total)}</span>
      </div>
      {s.status !== 'calculated' && <p class="text-xs text-moss">{s.message}</p>}
      {q.installation_estimate_min != null && (
        <p class="text-xs text-moss">Posa professionale stimata: {eur(q.installation_estimate_min, 0)}–{eur(q.installation_estimate_max ?? 0, 0)} + IVA (non inclusa, preventivo dopo sopralluogo).</p>
      )}
    </div>
  );
}
