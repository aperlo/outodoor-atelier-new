import { useStore } from '@nanostores/preact';
import { products, config } from '../../lib/quote';
import { samples, toggle } from '../../lib/stores';
import { toast } from '../../lib/toast';
import { resize } from '../../data/content';
import LeadFormIsland from './LeadFormIsland';

export default function SamplesBox() {
  const selected = useStore(samples);
  const max = config.sample_service.max_samples;
  const available = products.filter((p) => p.sample_available);

  return (
    <div class="grid gap-10 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <div class="flex items-center justify-between">
          <p class="eyebrow text-brass-ink">Scegli le superfici</p>
          <span class="font-mono text-sm">{selected.length}/{max}</span>
        </div>
        <div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {available.map((p) => {
            const on = selected.includes(p.slug);
            return (
              <button
                type="button"
                key={p.slug}
                aria-pressed={on}
                onClick={() => toggle(samples, p.slug, max) === 'full' && toast(`Massimo ${max} campioni`)}
                class={`relative border-2 bg-white text-left transition-colors ${on ? 'border-brass' : 'border-transparent hover:border-stone'}`}
              >
                <img src={resize(p.image, 500)} alt="" loading="lazy" class="aspect-[4/3] w-full object-cover" />
                <span class="block p-3">
                  <span class="block font-heading text-lg leading-tight">{p.name}</span>
                  <span class="mt-1 block text-xs text-moss">{p.height_mm} mm · {p.appearance}</span>
                </span>
                <span class={`absolute right-2 top-2 flex size-7 items-center justify-center text-sm ${on ? 'bg-brass text-forest-deep' : 'bg-sand/90 text-forest-deep'}`} aria-hidden="true">{on ? '✓' : '+'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <aside class="lg:col-span-4">
        <div class="border border-stone-line bg-ivory p-6 lg:sticky lg:top-28">
          <p class="eyebrow text-brass-ink">Il tuo box</p>
          <ul class="mt-4 space-y-1.5 text-sm">
            {selected.length === 0 ? (
              <li class="text-moss">Nessun campione selezionato.</li>
            ) : (
              selected.map((s) => <li key={s}>· {products.find((p) => p.slug === s)?.name ?? s}</li>)
            )}
          </ul>
          <div class="mt-6">
            {selected.length > 0 ? (
              <LeadFormIsland
                kind="sample_request"
                submitLabel="Richiedi il box campioni"
                payload={() => ({ samples: samples.get() })}
                successTitle="Box campioni richiesto."
                successText="Ti confermiamo via email la spedizione dei campioni."
                onDone={() => samples.set([])}
                fields={[
                  { name: 'name', label: 'Nome e cognome', required: true },
                  { name: 'email', label: 'Email', type: 'email', required: true, half: true },
                  { name: 'phone', label: 'Telefono', type: 'tel', half: true },
                  { name: 'address', label: 'Indirizzo', required: true },
                  { name: 'city', label: 'Comune', required: true, half: true },
                  { name: 'cap', label: 'CAP', required: true, half: true },
                ]}
              />
            ) : (
              <p class="text-sm text-moss">Seleziona almeno un campione per continuare.</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
