// Parte da sola a ogni richiesta ricevuta da Netlify Forms (evento "submission-created").
// Con Brevo configurato:
//  1. manda al cliente una conferma della richiesta (campioni, ordine, consulenza);
//  2. se il cliente ha accettato i consigli via email, lo iscrive alla lista Brevo che fa
//     partire la sequenza di email (testi in docs/sequenza-email-campioni.md).
// Senza le variabili d'ambiente non fa nulla: le richieste restano comunque in Netlify Forms.
//
// Variabili su Netlify: BREVO_API_KEY, BREVO_SENDER_EMAIL (mittente verificato su Brevo),
// BREVO_SENDER_NAME (facoltativa), BREVO_LIST_ID (facoltativa: lista dei consigli).

const BREVO = 'https://api.brevo.com/v3';

const subjects = {
  sample_request: 'Abbiamo ricevuto la tua richiesta di campioni',
  order_request: "Abbiamo ricevuto la tua richiesta d'ordine",
  consultation: 'Abbiamo ricevuto la tua richiesta',
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function bodyFor(kind, data) {
  const name = esc((data.name || '').split(' ')[0]);
  const hello = name ? `Ciao ${name},` : 'Ciao,';
  let lines;
  if (kind === 'sample_request') {
    let samples = [];
    try {
      const p = JSON.parse(data.payload || '{}');
      samples = p.names || p.samples || [];
    } catch {}
    lines = [
      'abbiamo ricevuto la tua richiesta di campioni' + (samples.length ? ` (${samples.map(esc).join(', ')})` : '') + '.',
      'Ti scriviamo di nuovo quando partono, con i tempi di consegna.',
      'Quando arrivano, guardali alla luce del tuo spazio a ore diverse e passaci sopra a piedi nudi: è il modo più rapido per scegliere.',
    ];
  } else if (kind === 'order_request') {
    lines = [
      "abbiamo ricevuto la tua richiesta d'ordine.",
      'Un consulente verifica disponibilità, tempi e spedizione e ti scrive con la conferma e le istruzioni per il pagamento.',
      'Finché non confermi, non ti viene addebitato nulla.',
    ];
  } else {
    lines = ['abbiamo ricevuto la tua richiesta. Un consulente la legge e ti risponde a questo indirizzo.'];
  }
  return `<p>${hello}</p>${lines.map((l) => `<p>${l}</p>`).join('')}<p>The Outdoor Atelier</p>`;
}

async function brevo(path, key, payload) {
  const res = await fetch(`${BREVO}${path}`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) console.error(`Brevo ${path}: ${res.status} ${await res.text()}`);
}

export const handler = async (event) => {
  const key = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SENDER_EMAIL;
  if (!key || !sender) return { statusCode: 200, body: 'Brevo non configurato' };

  let data = {};
  try {
    data = JSON.parse(event.body || '{}').payload?.data || {};
  } catch {}
  const email = (data.email || '').trim();
  if (!email || data['bot-field']) return { statusCode: 200, body: 'nessun invio' };

  const kind = data.kind;
  if (subjects[kind]) {
    await brevo('/smtp/email', key, {
      sender: { email: sender, name: process.env.BREVO_SENDER_NAME || 'The Outdoor Atelier' },
      to: [{ email, name: data.name || undefined }],
      subject: subjects[kind],
      htmlContent: bodyFor(kind, data),
    });
  }

  const listId = Number(process.env.BREVO_LIST_ID);
  if (listId && data.consigli === 'si') {
    await brevo('/contacts', key, {
      email,
      attributes: { NOME: data.name || '', ORIGINE: data.origin || '', RICHIESTA: kind || '' },
      listIds: [listId],
      updateEnabled: true,
    });
  }
  return { statusCode: 200, body: 'ok' };
};
