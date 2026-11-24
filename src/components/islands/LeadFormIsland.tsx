import { useState } from 'preact/hooks';
import { submitLead, type LeadKind } from '../../lib/leads';

export interface IslandField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  half?: boolean;
  textarea?: boolean;
}

interface Props {
  kind: LeadKind;
  fields: IslandField[];
  submitLabel: string;
  /** Dati aggiuntivi: un valore oppure una funzione letta al momento dell'invio. */
  payload?: unknown | (() => unknown);
  /** Campi già noti (es. il CAP inserito nel carrello). */
  extra?: Record<string, string>;
  successTitle?: string;
  successText?: string;
  onDone?: () => void;
  /** Mostra il consenso facoltativo ai consigli via email (sequenza dopo i campioni). */
  offerAdvice?: boolean;
}

// Suggerimenti per il riempimento automatico del browser.
const autofill: Record<string, string> = {
  name: 'name',
  email: 'email',
  phone: 'tel',
  address: 'street-address',
  city: 'address-level2',
  cap: 'postal-code',
  province: 'address-level1',
  company: 'organization',
};

export default function LeadFormIsland({ kind, fields, submitLabel, payload, extra, successTitle, successText, onDone, offerAdvice = false }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  // Aggiornamento funzionale: il riempimento automatico del browser compila più campi
  // nello stesso istante e nessuno deve sovrascrivere gli altri.
  const update = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }));
  const [advice, setAdvice] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  if (status === 'done') {
    return (
      <div class="border border-stone-line bg-white p-6" role="status">
        <p class="font-heading text-2xl">{successTitle ?? 'Grazie, abbiamo ricevuto la richiesta.'}</p>
        <p class="mt-2 text-sm leading-relaxed text-moss">{successText ?? "Un consulente ti risponde all'indirizzo email che hai indicato."}</p>
      </div>
    );
  }

  const submit = async (e: Event) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const data = typeof payload === 'function' ? (payload as () => unknown)() : payload;
      await submitLead(kind, { ...extra, ...values, ...(offerAdvice && advice ? { consigli: 'si' } : {}) }, data);
      setStatus('done');
      onDone?.();
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={submit} class="grid grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name} class={f.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
          <label for={`${kind}-${f.name}`} class="label text-moss">{f.label}{f.required && ' *'}</label>
          {f.textarea ? (
            <textarea id={`${kind}-${f.name}`} rows={3} class="field" required={f.required} value={values[f.name] ?? ''} onInput={(e) => update(f.name, e.currentTarget.value)} />
          ) : (
            <input id={`${kind}-${f.name}`} name={f.name} autoComplete={autofill[f.name]} type={f.type ?? 'text'} class="field" required={f.required} value={values[f.name] ?? ''} onInput={(e) => update(f.name, e.currentTarget.value)} />
          )}
        </div>
      ))}
      <label class="col-span-2 flex items-start gap-3 text-xs leading-relaxed text-moss">
        <input type="checkbox" required class="mt-0.5 size-4 accent-[#ad9870]" />
        <span>Ho letto l'<a href="/privacy" class="underline" target="_blank" rel="noopener">informativa sulla privacy</a> e acconsento a essere ricontattato per questa richiesta. *</span>
      </label>
      {offerAdvice && (
        <label class="col-span-2 flex items-start gap-3 text-xs leading-relaxed text-moss">
          <input type="checkbox" checked={advice} onChange={(e) => setAdvice(e.currentTarget.checked)} class="mt-0.5 size-4 accent-[#ad9870]" />
          <span>Facoltativo: mandatemi 3 email di consigli su come scegliere e posare il prato. Posso annullare in ogni momento.</span>
        </label>
      )}
      <button type="submit" class="btn-forest col-span-2" disabled={status === 'sending'}>{status === 'sending' ? 'Invio…' : submitLabel}</button>
      {status === 'error' && <p class="col-span-2 text-sm text-[#9c3b1f]" role="alert">Invio non riuscito. Controlla la connessione e riprova.</p>}
    </form>
  );
}
