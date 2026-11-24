import { useMemo, useState } from 'preact/hooks';
import {
  products, accessories, config, quote, seams, suggestedWaste, geometricWastePct, recommendAccessories, installationFor,
  type Section, type CartLine,
} from '../../lib/quote';
import { addToCart } from '../../lib/stores';
import { toast } from '../../lib/toast';
import { environments, useLabels, img, resize, demoNote } from '../../data/content';
import { eur, num, uid, isCap } from '../../lib/format';
import LeadFormIsland from './LeadFormIsland';
import Esempio from './Esempio';
import { track } from '../../lib/track';

const STEPS = ['Ambiente', 'Dimensioni', 'Superficie', 'Personalizza', 'Posa', 'Preventivo', 'Carrello'];
const ROLL = config.roll_width_m;

/** Pianta indicativa delle sezioni, con le giunte tra i teli. */
function Plan({ sections }: { sections: Section[] }) {
  const gap = 1.2;
  const totalLength = sections.reduce((s, x) => s + x.length, 0) + gap * (sections.length - 1);
  const maxWidth = Math.max(...sections.map((s) => s.width), 1);
  const scale = Math.min(528 / Math.max(totalLength, 1), 210 / maxWidth);
  let x = 16;
  return (
    <svg viewBox="0 0 560 260" class="w-full" role="img" aria-label="Pianta indicativa delle sezioni">
      <defs>
        <pattern id="turf" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#3d5a45" />
          <path d="M0 6 L3 0 M3 6 L6 0" stroke="#4e6e55" stroke-width="0.8" />
        </pattern>
      </defs>
      <rect width="560" height="260" fill="#F3F0E8" />
      {sections.map((s, i) => {
        const w = s.length * scale;
        const h = s.width * scale;
        const left = x;
        x += w + gap * scale;
        const strips = Math.ceil(s.width / ROLL);
        return (
          <g key={i}>
            <rect x={left} y={16} width={w} height={h} fill="url(#turf)" stroke="#172820" stroke-width="1" />
            {Array.from({ length: strips - 1 }).map((_, n) => (
              <line key={n} x1={left} x2={left + w} y1={16 + (n + 1) * ROLL * scale} y2={16 + (n + 1) * ROLL * scale} stroke="#AD9870" stroke-dasharray="4 3" stroke-width="1.2" />
            ))}
            <text x={left + w / 2} y={16 + h + 14} text-anchor="middle" font-size="10" font-family="JetBrains Mono Variable, monospace" fill="#5A675E">
              {num(s.length)} × {num(s.width)} m
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Row({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div class={`flex justify-between gap-6 px-4 py-2.5 text-sm ${muted ? 'text-moss' : ''} ${strong ? 'bg-ivory font-semibold' : ''}`}>
      <span>{label}</span>
      <span class="font-mono">{value}</span>
    </div>
  );
}

export default function Configurator() {
  const params = new URLSearchParams(location.search);
  const [step, setStep] = useState(() => Math.min(Math.max(Number(params.get('step') ?? 1) || 1, 1), 6));
  const [env, setEnv] = useState(() => (environments.some((e) => e.id === params.get('ambiente')) ? params.get('ambiente')! : 'garden'));
  const [totalMode, setTotalMode] = useState(false);
  const [sections, setSections] = useState<Section[]>([{ length: 6, width: 4 }]);
  const [totalSqm, setTotalSqm] = useState(20);
  const [wasteOverride, setWasteOverride] = useState<number | null>(null);
  const [productSlug, setProductSlug] = useState<string | null>(params.get('prodotto'));
  const [accOverride, setAccOverride] = useState<Record<string, number> | null>(null);
  const [customCut, setCustomCut] = useState(true);
  const [install, setInstall] = useState<'diy' | 'pro'>('diy');
  const [instCap, setInstCap] = useState('');
  const [shipCap, setShipCap] = useState('');

  const valid = sections.filter((s) => s.length > 0 && s.width > 0);
  const suggested = suggestedWaste(valid, totalMode);
  const geometric = Math.ceil(geometricWastePct(valid));
  const waste = wasteOverride ?? suggested;
  const net = totalMode ? totalSqm : valid.reduce((s, x) => s + x.length * x.width, 0);
  const sqm = Math.round(net * (1 + waste / 100) * 10) / 10;
  const seamM = seams(valid, totalMode, sqm);

  const envObj = environments.find((e) => e.id === env)!;
  const sorted = useMemo(
    () => [...products].sort((a, b) => Number(b.uses.some((u) => envObj.rec.includes(u))) - Number(a.uses.some((u) => envObj.rec.includes(u)))),
    [envObj],
  );
  const recommended = sorted.filter((p) => p.uses.some((u) => envObj.rec.includes(u)));
  const product = products.find((p) => p.slug === productSlug) ?? recommended[0] ?? sorted[0];

  const recs = useMemo(() => recommendAccessories(env, seamM, sqm), [env, seamM, sqm]);
  const accQty = accOverride ?? Object.fromEntries(recs.filter((r) => r.level !== 'opzionale').map((r) => [r.id, r.qty]));
  const accList = Object.entries(accQty).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty }));
  const missingRequired = recs.some((r) => r.level === 'richiesto' && !accQty[r.id]);

  const line: CartLine | null =
    product && sqm > 0
      ? { id: 'preview', product_slug: product.slug, sqm, custom_cut: customCut, accessories: accList, installation: { mode: install, cap: install === 'pro' ? instCap : null }, environment: env, sections: totalMode ? [] : valid, waste_pct: waste, format_label: null }
      : null;
  const cap = shipCap || (install === 'pro' ? instCap : '');
  const q = line ? quote([line], isCap(cap) ? cap : null) : null;
  const ql = q?.lines[0];
  const inst = install === 'pro' ? installationFor(instCap, sqm) : null;

  const canContinue = step === 2 ? sqm > 0 && sqm <= 20000 : step === 3 ? !!product : step !== 5 || install === 'diy' || isCap(instCap);
  const go = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const updateSection = (i: number, key: keyof Section, value: number) => setSections((prev) => prev.map((s, n) => (n === i ? { ...s, [key]: value } : s)));

  const addProject = () => {
    if (!line) return;
    addToCart({ ...line, id: uid() });
    track('carrello_aggiunto', { modello: line.product_slug, mq: line.sqm, fonte: 'configuratore' });
    toast('Progetto aggiunto al carrello');
    go(7);
  };

  return (
    <div>
      {/* Passi */}
      <ol class="flex gap-1 overflow-x-auto border-b border-stone-line pb-4">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const reachable = n <= step || (n <= 6 && !!product && sqm > 0);
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!reachable || n === 7}
                aria-current={n === step ? 'step' : undefined}
                onClick={() => go(n)}
                class={`flex items-center gap-2 border-b-2 px-3 py-2 text-left disabled:cursor-default ${n === step ? 'border-forest text-forest-deep' : n < step ? 'border-brass text-forest-deep' : 'border-transparent text-moss'}`}
              >
                <span class="font-mono text-xs">0{n}</span>
                <span class="eyebrow whitespace-nowrap">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div class="mt-10 grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-8">
          {step === 1 && (
            <section>
              <h2 class="text-3xl sm:text-4xl">Dove prende vita il progetto?</h2>
              <p class="mt-3 text-moss">Scegli l'ambiente: suggeriremo le superfici e gli accessori più adatti.</p>
              <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {environments.map((e) => (
                  <button type="button" key={e.id} aria-pressed={env === e.id} onClick={() => { setEnv(e.id); setAccOverride(null); }} class={`relative isolate flex aspect-[4/3] items-end overflow-hidden p-4 text-left text-sand outline-2 outline-offset-2 ${env === e.id ? 'outline outline-brass' : ''}`}>
                    <img src={img(e.image, 600)} alt="" loading="lazy" class="absolute inset-0 -z-10 size-full object-cover" />
                    <span class="absolute inset-0 -z-10 bg-gradient-to-t from-forest-deep/85 to-transparent" />
                    <span class="font-heading text-xl">{e.label}</span>
                    {env === e.id && <span class="absolute right-3 top-3 flex size-7 items-center justify-center bg-brass text-forest-deep" aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 class="text-3xl sm:text-4xl">Le dimensioni del tuo spazio</h2>
              <p class="mt-3 text-moss">Aggiungi una o più sezioni rettangolari, oppure inserisci direttamente i metri quadri. Nessun minimo d'ordine.</p>
              <div class="mt-6 inline-flex border border-stone">
                <button type="button" class={`px-5 py-2.5 text-sm ${!totalMode ? 'bg-forest text-sand' : ''}`} aria-pressed={!totalMode} onClick={() => setTotalMode(false)}>Sezioni</button>
                <button type="button" class={`px-5 py-2.5 text-sm ${totalMode ? 'bg-forest text-sand' : ''}`} aria-pressed={totalMode} onClick={() => setTotalMode(true)}>m² totali</button>
              </div>

              {totalMode ? (
                <div class="mt-6 max-w-xs">
                  <label for="cfg-total" class="label text-moss">Superficie totale (m²)</label>
                  <input id="cfg-total" type="number" min={1} class="field font-mono" value={totalSqm} onInput={(e) => setTotalSqm(Math.max(0, Number(e.currentTarget.value)))} />
                </div>
              ) : (
                <div class="mt-6 space-y-3">
                  {sections.map((s, i) => (
                    <div key={i} class="flex flex-wrap items-end gap-3 border border-stone-line bg-white p-4">
                      <span class="pb-3 font-mono text-xs text-moss">#{i + 1}</span>
                      <div>
                        <label for={`cfg-l-${i}`} class="label text-moss">Lunghezza (m)</label>
                        <input id={`cfg-l-${i}`} type="number" min={0.5} step={0.1} class="field w-28 font-mono" value={s.length} onInput={(e) => updateSection(i, 'length', Number(e.currentTarget.value))} />
                      </div>
                      <div>
                        <label for={`cfg-w-${i}`} class="label text-moss">Larghezza (m)</label>
                        <input id={`cfg-w-${i}`} type="number" min={0.5} step={0.1} class="field w-28 font-mono" value={s.width} onInput={(e) => updateSection(i, 'width', Number(e.currentTarget.value))} />
                      </div>
                      <span class="pb-3 font-mono text-sm">= {num(s.length * s.width)} m²</span>
                      {sections.length > 1 && <button type="button" class="ml-auto pb-3 text-xs text-moss underline" onClick={() => setSections(sections.filter((_, n) => n !== i))}>Rimuovi</button>}
                    </div>
                  ))}
                  <div class="flex flex-wrap gap-2">
                    <button type="button" class="chip" onClick={() => setSections([...sections, { length: 4, width: 2 }])}>+ Aggiungi sezione</button>
                    {config.standard_formats.map((f) => (
                      <button type="button" key={f.label} class="chip" onClick={() => setSections([{ length: f.length, width: f.width }])}>{f.label}</button>
                    ))}
                  </div>
                </div>
              )}

              <div class="mt-8 grid gap-4 sm:grid-cols-4">
                <div>
                  <label for="cfg-waste" class="label text-moss">Materiale in più per i tagli (%)</label>
                  <input id="cfg-waste" type="number" min={0} max={100} class="field font-mono" value={waste} onInput={(e) => setWasteOverride(Math.max(0, Number(e.currentTarget.value)))} />
                </div>
                <div class="border border-stone-line bg-white p-4"><p class="eyebrow text-moss">Superficie netta</p><p class="mt-1 font-mono text-xl">{num(net)} m²</p></div>
                <div class="border border-stone-line bg-white p-4"><p class="eyebrow text-moss">Da ordinare</p><p class="mt-1 font-mono text-xl">{num(sqm)} m²</p></div>
                <div class="border border-stone-line bg-white p-4"><p class="eyebrow text-moss">Giunte tra i teli</p><p class="mt-1 font-mono text-xl">{num(seamM)} m</p></div>
              </div>
              <p class="mt-3 text-xs leading-relaxed text-moss">
                {totalMode
                  ? `Materiale in più suggerito: ${suggested}%. Con i soli metri quadri non possiamo valutare la forma: per un calcolo più preciso inserisci le sezioni.`
                  : `Materiale in più suggerito: ${suggested}%. I teli sono larghi ${ROLL} m, quindi una misura che non è multipla di ${ROLL} m richiede materiale in più${geometric > config.default_waste_pct ? ` (qui circa ${geometric}%)` : ''}.`}
                {wasteOverride !== null && wasteOverride !== suggested && <> <button type="button" class="underline" onClick={() => setWasteOverride(null)}>Usa il valore suggerito</button></>}
              </p>

              {!totalMode && valid.length > 0 && (
                <div class="mt-6 border border-stone-line bg-white p-4">
                  <div class="mb-2 flex items-center justify-between text-xs text-moss">
                    <span>Pianta indicativa · teli da {ROLL} m</span>
                    <span class="flex items-center gap-2"><span class="inline-block w-5 border-t border-dashed border-brass" /> giunte</span>
                  </div>
                  <Plan sections={valid} />
                </div>
              )}
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 class="text-3xl sm:text-4xl">La superficie giusta per {envObj.label.toLowerCase()}</h2>
              <p class="mt-3 text-moss">In evidenza i modelli consigliati per l'ambiente scelto. Prezzi al m²<Esempio /></p>
              <div class="mt-8 grid gap-3 sm:grid-cols-2">
                {sorted.map((p) => {
                  const rec = recommended.includes(p);
                  const on = product?.slug === p.slug;
                  return (
                    <button type="button" key={p.slug} aria-pressed={on} onClick={() => setProductSlug(p.slug)} class={`flex gap-4 border-2 bg-white p-3 text-left transition-colors ${on ? 'border-brass' : 'border-stone-line hover:border-stone'}`}>
                      <img src={resize(p.image, 200)} alt="" loading="lazy" class="size-20 shrink-0 object-cover" />
                      <span class="min-w-0 flex-1">
                        <span class="flex items-center justify-between gap-2"><span class="font-heading text-lg">{p.name}</span>{on && <span aria-hidden="true">✓</span>}</span>
                        <span class="block text-xs text-moss">{p.height_mm} mm · {p.appearance}</span>
                        <span class="mt-2 flex items-center justify-between gap-2">
                          <span class="font-mono text-sm">{eur(p.price_m2)}/m²</span>
                          {rec && <span class="bg-forest px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-sand">Consigliato</span>}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {config.demo_values && <p class="note mt-4">{demoNote}</p>}
            </section>
          )}

          {step === 4 && (
            <section>
              <h2 class="text-3xl sm:text-4xl">Personalizza il progetto</h2>
              <p class="mt-3 text-moss">Gli accessori <b>richiesti</b> servono per una posa corretta; quelli consigliati e opzionali sono a tua scelta. Nulla viene aggiunto senza il tuo consenso. Prezzi<Esempio /></p>
              <label class="mt-6 flex items-center justify-between gap-4 border border-stone-line bg-white p-4">
                <span>
                  <span class="block font-semibold">Taglio su misura</span>
                  <span class="block text-xs text-moss">Teli tagliati sulle tue sezioni · {eur(config.custom_cut_fee)} a progetto</span>
                </span>
                <input type="checkbox" class="size-5 accent-[#ad9870]" checked={customCut} onChange={(e) => setCustomCut(e.currentTarget.checked)} />
              </label>
              <div class="mt-4 space-y-3">
                {recs.map((r) => {
                  const item = accessories.find((a) => a.id === r.id);
                  if (!item) return null;
                  const qty = accQty[r.id] ?? 0;
                  return (
                    <div key={r.id} class={`flex flex-wrap items-center gap-4 border bg-white p-4 ${qty > 0 ? 'border-forest/40' : 'border-stone-line'}`}>
                      <input type="checkbox" class="size-5 accent-[#ad9870]" aria-label={`Includi ${item.name}`} checked={qty > 0} onChange={(e) => setAccOverride({ ...accQty, [r.id]: e.currentTarget.checked ? r.qty : 0 })} />
                      <div class="min-w-48 flex-1">
                        <p class="flex flex-wrap items-center gap-2 font-semibold">
                          {item.name}
                          <span class={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${r.level === 'richiesto' ? 'bg-forest text-sand' : r.level === 'consigliato' ? 'bg-ivory' : 'border border-stone text-moss'}`}>{r.level}</span>
                        </p>
                        <p class="mt-1 text-xs text-moss">{r.why} · {item.desc}</p>
                      </div>
                      <input type="number" min={0} class="field w-20 py-2 font-mono" aria-label={`Quantità ${item.name}`} value={qty} onInput={(e) => setAccOverride({ ...accQty, [r.id]: Math.max(0, Number(e.currentTarget.value)) })} />
                      <span class="w-12 text-xs text-moss">{item.unit}</span>
                      <span class="w-20 text-right font-mono text-sm">{eur(item.price * qty)}</span>
                    </div>
                  );
                })}
              </div>
              {missingRequired && <p class="note mt-4">Hai escluso accessori necessari alla posa: assicurati di averli già.</p>}
            </section>
          )}

          {step === 5 && (
            <section>
              <h2 class="text-3xl sm:text-4xl">Come vuoi installarlo?</h2>
              <div class="mt-8 grid gap-4 sm:grid-cols-2">
                {([
                  ['diy', 'Opzione A — Fai-da-te', 'Ricevi materiale e istruzioni di posa illustrate. Ideale per balconi, terrazze e piccoli giardini.'],
                  ['pro', 'Opzione B — Posa professionale', 'Inserisci il CAP: ti mostriamo una stima indicativa e puoi richiedere la valutazione di un installatore.'],
                ] as const).map(([id, title, text]) => (
                  <button type="button" key={id} aria-pressed={install === id} onClick={() => setInstall(id)} class={`border-2 bg-white p-5 text-left ${install === id ? 'border-brass' : 'border-stone-line hover:border-stone'}`}>
                    <span class="flex items-center justify-between font-heading text-xl">{title}{install === id && <span aria-hidden="true">✓</span>}</span>
                    <span class="mt-2 block text-sm leading-relaxed text-moss">{text}</span>
                  </button>
                ))}
              </div>

              {install === 'pro' && (
                <div class="mt-6 space-y-5">
                  <div class="max-w-xs">
                    <label for="cfg-instcap" class="label text-moss">CAP del cantiere</label>
                    <input id="cfg-instcap" class="field font-mono" inputMode="numeric" maxLength={5} placeholder="es. 20121" value={instCap} onInput={(e) => setInstCap(e.currentTarget.value.replace(/\D/g, ''))} />
                  </div>
                  {inst && (
                    <div class="border border-stone-line bg-ivory p-5">
                      {inst.available ? (
                        <>
                          <p class="text-sm">Zona di riferimento: <b>{inst.zone_label}</b> · {eur(inst.rate_min, 0)}–{eur(inst.rate_max, 0)}/m²</p>
                          <p class="mt-2 font-mono text-2xl">{eur(inst.estimate_min, 0)} – {eur(inst.estimate_max, 0)} <span class="text-xs text-moss">+ IVA</span></p>
                        </>
                      ) : (
                        <p class="text-sm">{inst.message}</p>
                      )}
                      <p class="mt-3 text-xs text-moss">Valori preliminari di riferimento, non un preventivo vincolante. Non promettiamo disponibilità senza un partner locale verificato.</p>
                    </div>
                  )}
                  <div>
                    <p class="eyebrow text-moss">Tabella di riferimento</p>
                    <p class="mt-1 text-xs text-moss">Fonte: tariffe indicative degli installatori comunicate dal produttore, ottobre 2026. Il prezzo vero arriva dopo il sopralluogo.</p>
                    <ul class="mt-2 divide-y divide-stone-line border-y border-stone-line text-sm">
                      {config.installation_zones.map((z) => (
                        <li key={z.id} class="flex justify-between py-2.5"><span>{z.label}</span><span class="font-mono">{eur(z.rate_min, 0)}–{eur(z.rate_max, 0)}/m²</span></li>
                      ))}
                    </ul>
                  </div>
                  <details class="border border-stone-line bg-white p-5">
                    <summary class="font-semibold">Richiedi la valutazione di un installatore →</summary>
                    <div class="mt-5">
                      <LeadFormIsland
                        kind="installer_assessment"
                        submitLabel="Richiedi sopralluogo"
                        extra={{ cap: instCap }}
                        payload={() => ({ cap: instCap, sqm, product: product?.slug, environment: env })}
                        fields={[
                          { name: 'name', label: 'Nome', required: true, half: true },
                          { name: 'email', label: 'Email', type: 'email', required: true, half: true },
                          { name: 'phone', label: 'Telefono', type: 'tel', half: true },
                          { name: 'city', label: 'Comune', half: true },
                          { name: 'message', label: 'Note sul cantiere', textarea: true },
                        ]}
                      />
                    </div>
                  </details>
                </div>
              )}
            </section>
          )}

          {step === 6 && q && ql && (
            <section>
              <h2 class="text-3xl sm:text-4xl">Il tuo preventivo, voce per voce.<Esempio /></h2>
              <div class="mt-6 max-w-xs">
                <label for="cfg-shipcap" class="label text-moss">CAP di consegna (per la spedizione)</label>
                <input id="cfg-shipcap" class="field font-mono" inputMode="numeric" maxLength={5} placeholder="es. 00186" value={cap} onInput={(e) => setShipCap(e.currentTarget.value.replace(/\D/g, ''))} />
              </div>
              <div class="mt-6 divide-y divide-stone-line border border-stone-line bg-white">
                <Row label={`${ql.product_name} · ${num(ql.sqm)} m² × ${eur(ql.price_m2)}`} value={eur(ql.material_subtotal)} />
                {ql.accessories.map((a) => <Row key={a.id} muted label={`${a.name} · ${num(a.qty)} ${a.unit} × ${eur(a.unit_price)}`} value={eur(a.subtotal)} />)}
                {ql.custom_cut_fee > 0 && <Row muted label="Taglio su misura" value={eur(ql.custom_cut_fee)} />}
                <Row strong label="Subtotale merce" value={eur(q.goods_subtotal)} />
                <Row label={`Spedizione · ${num(q.shipping.weight_kg, 0)} kg`} value={q.shipping.status === 'calculated' ? eur(q.shipping.amount ?? 0) : q.shipping.status === 'quote_required' ? 'Da quotare' : 'Inserisci il CAP'} />
                <Row label={`IVA ${Math.round(q.vat_rate * 100)}%`} value={eur(q.vat_amount)} />
              </div>
              <div class="mt-4 flex items-end justify-between bg-forest-deep p-5 text-sand">
                <div>
                  <p class="eyebrow text-brass">Totale<Esempio /></p>
                  <p class="text-xs text-stone">IVA inclusa{q.shipping.status === 'calculated' ? '' : ' · spedizione esclusa'}</p>
                </div>
                <p class="font-mono text-3xl">{eur(q.total)}</p>
              </div>
              {q.installation_estimate_min != null && (
                <div class="mt-4 border border-stone-line bg-ivory p-4 text-sm">
                  <p><b>Posa professionale (stima, non inclusa):</b> <span class="font-mono">{eur(q.installation_estimate_min, 0)} – {eur(q.installation_estimate_max ?? 0, 0)}</span> + IVA</p>
                  <p class="mt-1 text-xs text-moss">Il preventivo definitivo arriva dopo il sopralluogo dell'installatore.</p>
                </div>
              )}
              {q.shipping.status !== 'calculated' && <p class="mt-3 text-sm text-moss">{q.shipping.message}</p>}
              {config.demo_values && <p class="note mt-4">Prezzi, tariffe di spedizione e stime di posa sono valori dimostrativi. Nessun costo nascosto: ogni voce è indicata qui sopra.</p>}

              <div class="mt-8 flex flex-col gap-4">
                <button type="button" class="btn-forest self-start" onClick={addProject}>Aggiungi al carrello →</button>
                <details class="border border-stone-line bg-white p-5">
                  <summary class="font-semibold">Salva il progetto o chiedi una consulenza</summary>
                  <div class="mt-5">
                    <LeadFormIsland
                      kind="consultation"
                      submitLabel="Invia il progetto"
                      payload={() => ({ environment: env, sections: valid, sqm, waste_pct: waste, product: product?.slug, accessories: accList, installation: { mode: install, cap: instCap }, quote_total: q.total })}
                      fields={[
                        { name: 'name', label: 'Nome', required: true, half: true },
                        { name: 'email', label: 'Email', type: 'email', required: true, half: true },
                        { name: 'phone', label: 'Telefono', type: 'tel' },
                        { name: 'message', label: 'Domande per il consulente', textarea: true },
                      ]}
                    />
                  </div>
                </details>
              </div>
            </section>
          )}

          {step === 7 && (
            <section>
              <span class="flex size-12 items-center justify-center bg-forest text-xl text-sand" aria-hidden="true">✓</span>
              <h2 class="mt-6 text-3xl sm:text-4xl">Il progetto è nel carrello.</h2>
              <p class="mt-3 max-w-xl text-moss">Dimensioni, superficie, accessori e modalità di posa sono stati salvati. Puoi inviare la richiesta d'ordine o configurare un'altra area.</p>
              <div class="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="/carrello" class="btn-forest">Vai al carrello</a>
                <button type="button" class="btn-line" onClick={() => { setSections([{ length: 4, width: 2 }]); setAccOverride(null); setWasteOverride(null); go(1); }}>Nuovo progetto</button>
                <a href="/campioni" class="btn-line">Prima voglio i campioni</a>
              </div>
            </section>
          )}

          {step < 7 && (
            <div class="mt-10 flex items-center justify-between border-t border-stone-line pt-6">
              <button type="button" class="btn-line" disabled={step === 1} onClick={() => go(step - 1)}>← Indietro</button>
              {step < 6 && <button type="button" class="btn-forest" disabled={!canContinue} onClick={() => go(step + 1)}>Continua →</button>}
            </div>
          )}
        </div>

        {/* Riepilogo */}
        <aside class="lg:col-span-4">
          <div class="border border-stone-line bg-white p-6 lg:sticky lg:top-28">
            <p class="eyebrow text-brass-ink">Il tuo progetto</p>
            <dl class="mt-4 space-y-2.5 text-sm">
              {([
                ['Ambiente', envObj.label, false],
                ['Superficie da ordinare', `${num(sqm)} m²`, true],
                ['Materiale in più', `${num(waste)}%`, true],
                ['Superficie', product?.name ?? '—', false],
                ['Accessori', String(accList.length), true],
                ['Posa', install === 'pro' ? `Professionale${instCap ? ` · ${instCap}` : ''}` : 'Fai-da-te', false],
              ] as const).map(([l, v, mono]) => (
                <div key={l} class="flex justify-between gap-4"><dt class="text-moss">{l}</dt><dd class={`text-right ${mono ? 'font-mono' : ''}`}>{v}</dd></div>
              ))}
            </dl>
            <div class="mt-5 space-y-2 border-t border-stone-line pt-4 text-sm">
              <div class="flex justify-between"><span class="text-moss">Merce (IVA escl.)</span><span class="font-mono">{q ? eur(q.goods_subtotal) : '—'}</span></div>
              <div class="flex justify-between font-semibold"><span>Totale IVA incl.<Esempio /></span><span class="font-mono">{q ? eur(q.total) : '—'}</span></div>
              {q?.shipping.status !== 'calculated' && <p class="text-xs text-moss">Spedizione calcolata con il CAP al passo 6.</p>}
            </div>
            <p class="mt-5 text-xs leading-relaxed text-moss">Puoi ordinare anche pochi metri quadri: non c'è un minimo d'ordine.</p>
            <p class="mt-2 text-xs text-moss">Destinazioni: {product ? product.uses.map((u) => useLabels[u]).join(', ') : '—'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
