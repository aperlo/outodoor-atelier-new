// Invio delle richieste (campioni, consulenze, richieste d'ordine).
// In produzione i dati vanno a Netlify Forms, modulo definito in src/layouts/Base.astro.
import { site } from '../config/site';

export const leadKinds = {
  consultation: 'Consulenza',
  sample_request: 'Richiesta campioni',
  order_request: "Richiesta d'ordine",
  shipping_quote: 'Quotazione spedizione',
  trade_quote: 'Preventivo dedicato',
  professional_registration: 'Registrazione professionista',
  project_submission: 'Progetto per capitolato',
  installer_network: 'Candidatura installatore',
  installer_assessment: 'Valutazione installatore',
  visualizer_project: 'Progetto dal visualizzatore',
} as const;

export type LeadKind = keyof typeof leadKinds;

// Campi accettati dal modulo: devono coincidere con quelli dichiarati in Base.astro.
export const leadFields = ['name', 'email', 'phone', 'company', 'role', 'vat', 'address', 'city', 'cap', 'province', 'sqm', 'message'] as const;

export async function submitLead(kind: LeadKind, fields: Record<string, string>, payload?: unknown) {
  const body = new URLSearchParams();
  body.set('form-name', site.formName);
  body.set('kind', kind);
  for (const key of leadFields) if (fields[key]) body.set(key, fields[key]);
  body.set('privacy', 'accettata');
  if (payload !== undefined) body.set('payload', JSON.stringify(payload));

  // In locale non esiste un servizio che riceve i moduli: la richiesta viene solo simulata.
  if (import.meta.env.DEV || ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    console.info('[richiesta simulata]', Object.fromEntries(body));
    return;
  }
  const res = await fetch(site.formEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Invio non riuscito (${res.status})`);
}
