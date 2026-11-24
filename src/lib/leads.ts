// Invio delle richieste (campioni, consulenze, richieste d'ordine).
// In produzione i dati vanno a Netlify Forms, modulo definito in src/layouts/Base.astro.
import { site } from '../config/site';
import { track } from './track';

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
export const leadFields = ['name', 'email', 'phone', 'company', 'role', 'vat', 'address', 'city', 'cap', 'province', 'sqm', 'message', 'consigli'] as const;

// Campi di misurazione, aggiunti a ogni richiesta: da quale pagina parte e da dove è arrivato il visitatore.
export const trackingFields = ['page', 'origin', 'landing'] as const;

const ORIGIN_KEY = 'oa-origin';

/**
 * Registra la prima provenienza del visitatore (parametri utm_ o sito di provenienza) e la pagina
 * d'ingresso. Si scrive una volta sola: è la fonte "primo contatto" da cui misurare i canali.
 */
export function captureOrigin() {
  try {
    if (localStorage.getItem(ORIGIN_KEY)) return;
    const params = new URLSearchParams(location.search);
    const utm = ['utm_source', 'utm_medium', 'utm_campaign']
      .map((k) => params.get(k))
      .filter(Boolean)
      .join(' / ');
    let referrer = '';
    if (document.referrer) {
      const host = new URL(document.referrer).host;
      if (host && host !== location.host) referrer = host;
    }
    const origin = utm || (referrer ? `da ${referrer}` : 'diretto');
    localStorage.setItem(ORIGIN_KEY, JSON.stringify({ origin, landing: location.pathname, date: new Date().toISOString().slice(0, 10) }));
  } catch {}
}

/** Valori di misurazione da allegare a una richiesta. */
export function trackingValues(): Record<(typeof trackingFields)[number], string> {
  let stored: { origin?: string; landing?: string; date?: string } = {};
  try {
    stored = JSON.parse(localStorage.getItem(ORIGIN_KEY) ?? '{}');
  } catch {}
  return {
    page: location.pathname,
    origin: stored.origin ? `${stored.origin}${stored.date ? ` (${stored.date})` : ''}` : 'sconosciuta',
    landing: stored.landing ?? '',
  };
}

export async function submitLead(kind: LeadKind, fields: Record<string, string>, payload?: unknown) {
  const body = new URLSearchParams();
  body.set('form-name', site.formName);
  body.set('kind', kind);
  for (const key of leadFields) if (fields[key]) body.set(key, fields[key]);
  for (const [key, value] of Object.entries(trackingValues())) body.set(key, value);
  body.set('privacy', 'accettata');
  if (payload !== undefined) body.set('payload', JSON.stringify(payload));

  // In locale non esiste un servizio che riceve i moduli: la richiesta viene solo simulata.
  if (import.meta.env.DEV || ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    console.info('[richiesta simulata]', Object.fromEntries(body));
  } else {
    const res = await fetch(site.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!res.ok) throw new Error(`Invio non riuscito (${res.status})`);
  }
  track('richiesta_inviata', { tipo: kind, pagina: body.get('page'), origine: body.get('origin') });
}
