import { useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { config, quote, materialFor, type CartLine } from '../../lib/quote';
import { addToCart, deliveryCap, openCartDrawer } from '../../lib/stores';
import { eur, num, uid, isCap } from '../../lib/format';
import Esempio from './Esempio';
import { track } from '../../lib/track';

interface Props {
  slug: string;
  name: string;
  price: number;
}

const ROLL = config.roll_width_m;

export default function ProductBuy({ slug, name, price }: Props) {
  const formats = config.standard_formats;
  const [format, setFormat] = useState(formats[0].label);
  const [length, setLength] = useState(4);
  const [width, setWidth] = useState(3);
  const cap = useStore(deliveryCap);

  const custom = format === 'custom';
  const std = formats.find((f) => f.label === format);
  // Su misura: misure libere dello spazio; il materiale si calcola sui teli da 2 m.
  const mat = custom ? materialFor(length, width) : null;
  const sqm = custom ? mat!.material : std ? std.length * std.width : 0;

  const line: CartLine | null =
    sqm > 0
      ? {
          id: 'preview',
          product_slug: slug,
          sqm,
          custom_cut: custom,
          accessories: [],
          installation: { mode: 'diy' },
          environment: null,
          sections: custom ? [{ length, width }] : std ? [{ length: std.length, width: std.width }] : [],
          waste_pct: custom && mat!.area > 0 ? Math.round((mat!.material / mat!.area - 1) * 1000) / 10 : 0,
          format_label: custom ? `Su misura ${num(length)} × ${num(width)} m` : format,
        }
      : null;
  const q = line ? quote([line], isCap(cap) ? cap : null) : null;
  const ship = q?.shipping;

  const add = () => {
    if (!line) return;
    addToCart({ ...line, id: uid() });
    openCartDrawer();
    track('carrello_aggiunto', { modello: slug, mq: line.sqm, fonte: 'scheda' });
  };

  return (
    <div class="mt-7">
      <p class="label text-moss">Scegli il formato</p>
      <div class="flex flex-wrap gap-2">
        {formats.map((f) => (
          <button type="button" class="chip" aria-pressed={format === f.label} onClick={() => setFormat(f.label)}>{f.label}</button>
        ))}
        <button type="button" class="chip" aria-pressed={custom} onClick={() => setFormat('custom')}>Sulle mie misure</button>
      </div>

      {custom && mat && (
        <div class="mt-4 border border-stone-line bg-white p-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="buy-length" class="label text-moss">Lunghezza dello spazio (m)</label>
              <input id="buy-length" type="number" class="field font-mono" min={config.min_cut_length_m} step={0.1} value={length} onInput={(e) => setLength(Math.max(0, Number(e.currentTarget.value)))} />
            </div>
            <div>
              <label for="buy-width" class="label text-moss">Larghezza dello spazio (m)</label>
              <input id="buy-width" type="number" class="field font-mono" min={0.5} step={0.1} value={width} onInput={(e) => setWidth(Math.max(0, Number(e.currentTarget.value)))} />
            </div>
          </div>
          {mat.area > 0 && (
            <p class="mt-3 text-xs leading-relaxed text-moss">
              Spazio di {num(mat.area)} m²: {mat.strips === 1 ? `un telo da ${ROLL} m` : `${mat.strips} teli da ${ROLL} m affiancati`} lunghi {num(mat.stripLength)} m,
              cioè <b class="text-forest-deep">{num(mat.material)} m² di materiale</b>
              {mat.seams > 0 && <> e {num(mat.seams)} m di giunte tra i teli (nastro e collante: <a class="underline" href={`/progetta?prodotto=${slug}&step=2`}>li calcola il configuratore</a>)</>}.
            </p>
          )}
        </div>
      )}

      <div class="mt-4 max-w-56">
        <label for="buy-cap" class="label text-moss">CAP di consegna</label>
        <input id="buy-cap" class="field font-mono" inputMode="numeric" maxLength={5} placeholder="es. 20121" value={cap} onInput={(e) => deliveryCap.set(e.currentTarget.value.replace(/\D/g, ''))} />
      </div>

      {q && (
        <dl class="mt-5 space-y-1.5 border-y border-stone-line py-4 text-sm">
          <div class="flex justify-between"><dt class="text-moss">{num(sqm)} m² × {eur(price)}</dt><dd class="font-mono">{eur(sqm * price)}</dd></div>
          {custom && <div class="flex justify-between"><dt class="text-moss">Taglio su misura</dt><dd class="font-mono">{eur(config.custom_cut_fee)}</dd></div>}
          <div class="flex justify-between">
            <dt class="text-moss">Spedizione{ship && ship.status === 'calculated' ? ` · ${num(ship.weight_kg, 0)} kg` : ''}<Esempio /></dt>
            <dd class="font-mono">{ship?.status === 'calculated' ? eur(ship.amount ?? 0) : ship?.status === 'quote_required' ? 'Da quotare' : 'Inserisci il CAP'}</dd>
          </div>
          <div class="flex justify-between"><dt class="text-moss">IVA {Math.round(q.vat_rate * 100)}%</dt><dd class="font-mono">{eur(q.vat_amount)}</dd></div>
          <div class="flex justify-between pt-2 text-base font-semibold">
            <dt>Totale{ship?.status === 'calculated' ? '' : ' (spedizione esclusa)'}<Esempio /></dt>
            <dd class="font-mono">{eur(q.total)}</dd>
          </div>
          {ship && ship.status === 'quote_required' && <p class="pt-1 text-xs text-moss">{ship.message}</p>}
        </dl>
      )}

      <div class="mt-4 flex flex-col gap-3 sm:flex-row">
        <button type="button" class="btn-forest flex-1" onClick={add} disabled={!line}>Aggiungi al carrello</button>
        <a href={`/progetta?prodotto=${slug}&step=2`} class="btn-line flex-1">Progetta con questa superficie</a>
      </div>
    </div>
  );
}
