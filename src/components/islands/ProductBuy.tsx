import { useState } from 'preact/hooks';
import { config } from '../../lib/quote';
import { addToCart } from '../../lib/stores';
import { toast } from '../../lib/toast';
import { eur, num, uid } from '../../lib/format';

interface Props {
  slug: string;
  name: string;
  price: number;
}

export default function ProductBuy({ slug, name, price }: Props) {
  const formats = config.standard_formats;
  const [format, setFormat] = useState(formats[0].label);
  const [length, setLength] = useState(3);
  const [width, setWidth] = useState(config.roll_width_m);

  const custom = format === 'custom';
  const std = formats.find((f) => f.label === format);
  const sqm = custom ? Math.round(length * width * 10) / 10 : std ? std.length * std.width : 0;
  const cutFee = custom ? config.custom_cut_fee : 0;

  const add = () => {
    if (sqm <= 0) return;
    addToCart({
      id: uid(),
      product_slug: slug,
      sqm,
      custom_cut: custom,
      accessories: [],
      installation: { mode: 'diy' },
      environment: null,
      sections: custom ? [{ length, width }] : std ? [{ length: std.length, width: std.width }] : [],
      waste_pct: 0,
      format_label: custom ? `Su misura ${num(length)} × ${num(width)} m` : format,
    });
    toast(`${name} · ${num(sqm)} m² aggiunto al carrello`, { href: '/carrello', label: 'Vedi carrello' });
  };

  return (
    <div class="mt-7">
      <p class="label text-moss">Scegli il formato</p>
      <div class="flex flex-wrap gap-2">
        {formats.map((f) => (
          <button type="button" class="chip" aria-pressed={format === f.label} onClick={() => setFormat(f.label)}>{f.label}</button>
        ))}
        <button type="button" class="chip" aria-pressed={custom} onClick={() => setFormat('custom')}>Su misura</button>
      </div>

      {custom && (
        <div class="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label for="buy-length" class="label text-moss">Lunghezza (m)</label>
            <input id="buy-length" type="number" class="field font-mono" min={config.min_cut_length_m} step={0.5} value={length} onInput={(e) => setLength(Math.max(0, Number(e.currentTarget.value)))} />
          </div>
          <div>
            <label for="buy-width" class="label text-moss">Larghezza (m, max {config.roll_width_m})</label>
            <input id="buy-width" type="number" class="field font-mono" min={0.5} max={config.roll_width_m} step={0.5} value={width} onInput={(e) => setWidth(Math.min(Math.max(0, Number(e.currentTarget.value)), config.roll_width_m))} />
          </div>
        </div>
      )}

      <div class="mt-5 flex items-baseline justify-between border-y border-stone-line py-4">
        <span class="font-mono text-sm text-moss">{num(sqm)} m²{custom && ` + taglio ${eur(cutFee)}`}</span>
        <span class="font-mono text-xl">{eur(sqm * price + cutFee)} <span class="text-xs text-moss">+ IVA</span></span>
      </div>
      <div class="mt-4 flex flex-col gap-3 sm:flex-row">
        <button type="button" class="btn-forest flex-1" onClick={add} disabled={sqm <= 0}>Aggiungi al carrello</button>
        <a href={`/progetta?prodotto=${slug}&step=2`} class="btn-line flex-1">Progetta con questa superficie</a>
      </div>
    </div>
  );
}
