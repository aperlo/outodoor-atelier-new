// Comportamenti comuni a tutte le pagine: intestazione, contatori, azioni sulle schede,
// filtri del catalogo e invio dei moduli statici.
import { cart, samples, compare, toggle, MAX_COMPARE } from '../lib/stores';
import { toast } from '../lib/toast';
import { site } from '../config/site';
import config from '../data/config.json';
import { heightBands } from '../data/content';

const $ = <T extends Element>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const MAX_SAMPLES = config.sample_service.max_samples;

/* Intestazione trasparente sopra l'immagine di apertura. */
const header = $<HTMLElement>('.site-header[data-has-hero]');
if (header) {
  const update = () => (header.dataset.overHero = window.scrollY > 40 ? 'false' : 'true');
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* Contatori di campioni, carrello e confronto. */
function renderCounts() {
  const s = samples.get();
  const c = compare.get();
  $$('[data-samples-count]').forEach((el) => (el.textContent = String(s.length)));
  $$<HTMLElement>('[data-cart-count]').forEach((el) => {
    el.textContent = String(cart.get().length);
    el.hidden = cart.get().length === 0;
  });
  $$<HTMLElement>('[data-sample]').forEach((b) => b.setAttribute('aria-pressed', String(s.includes(b.dataset.sample!))));
  $$<HTMLElement>('[data-compare]').forEach((b) => b.setAttribute('aria-pressed', String(c.includes(b.dataset.compare!))));
  const tray = $<HTMLElement>('[data-compare-tray]');
  if (tray) {
    tray.hidden = c.length === 0 || location.pathname.startsWith('/confronta');
    $('[data-compare-count]', tray)!.textContent = String(c.length);
  }
}
samples.listen(renderCounts);
compare.listen(renderCounts);
cart.listen(renderCounts);
renderCounts();

/* Pulsanti "campione" e "confronta" sulle schede. */
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const sampleBtn = target.closest<HTMLElement>('[data-sample]');
  if (sampleBtn) {
    const name = sampleBtn.dataset.name ?? 'Campione';
    const r = toggle(samples, sampleBtn.dataset.sample!, MAX_SAMPLES);
    if (r === 'full') toast(`Il box contiene già ${MAX_SAMPLES} campioni`, { href: '/campioni', label: 'Apri il box' });
    else if (r === 'added') toast(`${name} aggiunto al box campioni`, { href: '/campioni', label: 'Apri il box' });
    else toast('Campione rimosso');
    return;
  }
  const compareBtn = target.closest<HTMLElement>('[data-compare]');
  if (compareBtn) {
    if (toggle(compare, compareBtn.dataset.compare!, MAX_COMPARE) === 'full') toast(`Puoi confrontare fino a ${MAX_COMPARE} modelli`);
    return;
  }
  if (target.closest('[data-compare-clear]')) compare.set([]);
});

/* Filtri del catalogo: le schede sono già nell'HTML, qui si nascondono quelle escluse. */
const catalog = $<HTMLElement>('[data-catalog]');
if (catalog) {
  const form = $<HTMLFormElement>('[data-filters]', catalog)!;
  const cards = $$<HTMLElement>('[data-card]', catalog);
  const count = $('[data-result-count]', catalog)!;
  const empty = $<HTMLElement>('[data-empty]', catalog)!;
  const reset = $<HTMLElement>('[data-reset]', catalog)!;
  const priceOut = $('[data-price-out]', catalog)!;

  // Filtri iniziali dall'indirizzo, es. /collezione?collezione=natural-look
  const params = new URLSearchParams(location.search);
  for (const [key, field] of [['collezione', 'collection'], ['uso', 'use']] as const) {
    const el = form.elements.namedItem(field) as HTMLSelectElement | null;
    const v = params.get(key);
    if (el && v) el.value = v;
  }

  const apply = () => {
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const q = (f.q ?? '').trim().toLowerCase();
    const maxPrice = Number(f.maxPrice ?? 0);
    const band = f.height ? heightBands[f.height] : null;
    let shown = 0;
    for (const card of cards) {
      const d = card.dataset;
      const h = Number(d.height);
      const ok =
        (!q || d.text!.includes(q)) &&
        (!band || (h >= band[0] && h <= band[1])) &&
        (!f.use || d.uses!.split(' ').includes(f.use)) &&
        (!f.appearance || d.appearance === f.appearance) &&
        (!f.softness || d.softness === f.softness) &&
        (!f.drainage || d.drainage === f.drainage) &&
        (!f.collection || d.collection === f.collection) &&
        (!maxPrice || Number(d.price) <= maxPrice);
      card.hidden = !ok;
      if (ok) shown++;
    }
    count.textContent = String(shown);
    empty.hidden = shown > 0;
    priceOut.textContent = maxPrice ? `fino a ${maxPrice} €/m²` : 'tutti';
    const active = Object.entries(f).some(([k, v]) => (k === 'maxPrice' ? Number(v) > 0 : v !== ''));
    reset.hidden = !active;
  };
  form.addEventListener('input', apply);
  form.addEventListener('submit', (e) => e.preventDefault());
  reset.addEventListener('click', () => {
    form.reset();
    apply();
  });
  apply();
}

/* Moduli statici: invio in background, poi pagina di conferma. */
const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
$$<HTMLFormElement>('form[data-lead]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = $<HTMLButtonElement>('button[type="submit"]', form)!;
    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'Invio…';
    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
      if (isLocal) console.info('[richiesta simulata]', body);
      else {
        const res = await fetch(site.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
        if (!res.ok) throw new Error(String(res.status));
      }
      location.href = '/grazie';
    } catch {
      toast('Invio non riuscito. Riprova tra poco.');
      button.disabled = false;
      button.textContent = label;
    }
  });
});
