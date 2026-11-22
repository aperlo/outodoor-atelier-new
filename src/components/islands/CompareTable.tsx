import { useStore } from '@nanostores/preact';
import { products, config, type Product } from '../../lib/quote';
import { compare } from '../../lib/stores';
import { collectionFull, useLabels, resize } from '../../data/content';
import { eur, num } from '../../lib/format';

const rows: [string, (p: Product) => string][] = [
  ['Linea', (p) => collectionFull(p.collection)],
  ['Altezza', (p) => `${p.height_mm} mm`],
  ['Aspetto', (p) => p.appearance],
  ['Morbidezza', (p) => p.softness],
  ['Fibra', (p) => p.fibre_type],
  ['Densità', (p) => p.density],
  ['Peso', (p) => `${num(p.weight_kg_m2)} kg/m²`],
  ['Drenaggio', (p) => p.drainage],
  ['Applicazioni', (p) => p.uses.map((u) => useLabels[u]).join(', ')],
  ['Prezzo', (p) => `${eur(p.price_m2)}/m² + IVA${config.demo_values ? ' · esempio' : ''}`],
];

export default function CompareTable() {
  const slugs = useStore(compare);
  const list = slugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as Product[];

  if (list.length === 0) {
    return (
      <div class="border border-stone-line bg-white p-10 text-center">
        <p class="text-moss">Nessun modello selezionato.</p>
        <a href="/collezione" class="btn-forest mt-6">Vai alla collezione</a>
      </div>
    );
  }

  return (
    <div class="overflow-x-auto">
      <table class="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th class="w-36"></th>
            {list.map((p) => (
              <th key={p.slug} class="p-3 text-left align-top font-normal">
                <div class="relative">
                  <img src={resize(p.image, 400)} alt="" class="aspect-[4/3] w-full object-cover" />
                  <button type="button" aria-label={`Rimuovi ${p.name}`} class="absolute right-2 top-2 flex size-7 items-center justify-center bg-sand" onClick={() => compare.set(slugs.filter((s) => s !== p.slug))}>×</button>
                </div>
                <a href={`/superfici/${p.slug}`} class="mt-3 block font-heading text-xl underline-offset-4 hover:underline">{p.name}</a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} class="border-t border-stone-line">
              <td class="py-3 pr-3 text-moss">{label}</td>
              {list.map((p) => <td key={p.slug} class="p-3 font-mono text-[13px] capitalize">{value(p)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
