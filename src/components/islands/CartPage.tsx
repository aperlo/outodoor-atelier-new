import { useEffect, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { quote, config } from '../../lib/quote';
import { cart, deliveryCap } from '../../lib/stores';
import { resize } from '../../data/content';
import { eur, num, isCap } from '../../lib/format';
import QuoteSummary from './QuoteSummary';
import LeadFormIsland from './LeadFormIsland';

export default function CartPage() {
  const lines = useStore(cart);
  // CAP: dall'indirizzo (?cap=) oppure l'ultimo inserito sul sito.
  const storedCap = useStore(deliveryCap);
  useEffect(() => {
    const fromUrl = new URLSearchParams(location.search).get('cap');
    if (fromUrl) deliveryCap.set(fromUrl);
  }, []);
  const cap = storedCap;
  const setCap = (v: string) => deliveryCap.set(v);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div class="border border-stone-line bg-white p-8">
        <p class="eyebrow text-brass-ink">Richiesta d'ordine inviata</p>
        <h2 class="mt-3 text-3xl">Grazie, abbiamo ricevuto il tuo progetto.</h2>
        <p class="mt-3 max-w-xl leading-relaxed text-moss">Un consulente verifica disponibilità e tempi di consegna e ti scrive con la conferma e le istruzioni per il pagamento. Nessun importo viene addebitato ora.</p>
        <a href="/collezione" class="btn-forest mt-6">Torna alla collezione</a>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div class="border border-stone-line bg-white p-10 text-center">
        <p class="text-moss">Il carrello è vuoto.</p>
        <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/collezione" class="btn-forest">Collezione</a>
          <a href="/progetta" class="btn-line">Configuratore</a>
        </div>
      </div>
    );
  }

  const q = quote(lines, isCap(cap) ? cap : null);
  const setSqm = (id: string, sqm: number) => cart.set(lines.map((l) => (l.id === id ? { ...l, sqm: Math.max(0.5, sqm) } : l)));

  return (
    <div class="grid gap-10 lg:grid-cols-12">
      <div class="lg:col-span-7">
        <ul class="divide-y divide-stone-line border-y border-stone-line">
          {lines.map((line) => {
            const ql = q.lines.find((x) => x.line_id === line.id);
            const detail =
              line.format_label ??
              `${line.sections.length ? line.sections.map((s) => `${num(s.length)}×${num(s.width)}`).join(' + ') + ' m · ' : ''}materiale in più ${num(line.waste_pct)}%`;
            return (
              <li key={line.id} class="flex gap-4 py-5">
                {ql && <img src={resize(ql.image, 200)} alt="" class="size-20 shrink-0 object-cover sm:size-24" />}
                <div class="min-w-0 flex-1">
                  <p class="font-heading text-xl">{ql?.product_name ?? line.product_slug}</p>
                  <p class="mt-1 text-xs text-moss">{detail} · posa {line.installation.mode === 'pro' ? `professionale (${line.installation.cap ?? 'CAP da indicare'})` : 'fai-da-te'}</p>
                  {ql && ql.accessories.length > 0 && <p class="mt-1 text-xs text-moss">Accessori: {ql.accessories.map((a) => `${a.name} ×${num(a.qty)}`).join(', ')}</p>}
                  {ql && ql.custom_cut_fee > 0 && <p class="mt-1 text-xs text-moss">Taglio su misura: {eur(ql.custom_cut_fee)}</p>}
                  <label class="mt-3 inline-flex items-center gap-2 text-xs text-moss">
                    m²
                    <input type="number" class="field w-24 py-2 font-mono" min={0.5} step={0.5} value={line.sqm} onInput={(e) => setSqm(line.id, Number(e.currentTarget.value))} />
                  </label>
                </div>
                <div class="flex flex-col items-end justify-between">
                  <button type="button" class="text-xs text-moss underline" onClick={() => cart.set(lines.filter((l) => l.id !== line.id))}>Rimuovi</button>
                  <span class="font-mono">{ql ? eur(ql.line_subtotal) : '—'}</span>
                </div>
              </li>
            );
          })}
        </ul>
        {config.demo_values && <p class="note mt-4">Prezzi, tariffe di spedizione e stime di posa sono valori dimostrativi. L'importo definitivo è quello confermato dal consulente.</p>}
      </div>

      <aside class="lg:col-span-5">
        <div class="border border-stone-line bg-white p-6 lg:sticky lg:top-28">
          <label for="cart-cap" class="label text-moss">CAP di consegna</label>
          <input id="cart-cap" class="field font-mono" inputMode="numeric" maxLength={5} placeholder="es. 20121" value={cap} onInput={(e) => setCap(e.currentTarget.value.replace(/\D/g, ''))} />
          <div class="mt-5"><QuoteSummary q={q} /></div>

          <div class="mt-7 border-t border-stone-line pt-6">
            <p class="eyebrow text-brass-ink">Richiesta d'ordine</p>
            <p class="mb-5 mt-2 text-sm leading-relaxed text-moss">Nessun pagamento online: invii la richiesta, un consulente conferma disponibilità, tempi e spedizione, poi ricevi le istruzioni per il pagamento.</p>
            <LeadFormIsland
              kind="order_request"
              submitLabel="Invia la richiesta d'ordine"
              extra={{ cap }}
              payload={() => ({ lines: cart.get(), cap, totals: { goods: q.goods_subtotal, shipping: q.shipping, vat: q.vat_amount, total: q.total } })}
              onDone={() => {
                setSent(true);
                cart.set([]);
              }}
              fields={[
                { name: 'name', label: 'Nome e cognome', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true, half: true },
                { name: 'phone', label: 'Telefono', type: 'tel', required: true, half: true },
                { name: 'address', label: 'Indirizzo di consegna', required: true },
                { name: 'city', label: 'Comune', required: true, half: true },
                { name: 'province', label: 'Provincia', half: true },
                { name: 'company', label: 'Azienda (facoltativo)', half: true },
                { name: 'vat', label: 'P. IVA / Codice fiscale', half: true },
                { name: 'message', label: 'Note per la consegna', textarea: true },
              ]}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
