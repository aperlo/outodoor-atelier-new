// Comportamenti comuni a tutte le pagine: intestazione, contatori, azioni sulle schede,
// prima/dopo della home, mini-carrello e invio dei moduli statici.
import { cart, samples, compare, toggle, MAX_COMPARE } from '../lib/stores';
import { toast } from '../lib/toast';
import { site } from '../config/site';
import config from '../data/config.json';
import './cart-drawer';
import { captureOrigin, trackingValues } from '../lib/leads';
import { track } from '../lib/track';
import './analytics';

captureOrigin();

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
  // Invito ai campioni: mostra quanti ne sono già nel box.
  const ctaCount = $<HTMLElement>('[data-samples-cta-count]');
  if (ctaCount) {
    ctaCount.hidden = s.length === 0;
    ctaCount.textContent = `${s.length}/${MAX_SAMPLES}`;
  }
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
    else if (r === 'added') {
      toast(`${name} aggiunto al box campioni`, { href: '/campioni', label: 'Apri il box' });
      track('campione_aggiunto', { modello: sampleBtn.dataset.sample });
    }
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

/* Prima/dopo della home: il cursore sposta la linea di separazione. */
$$<HTMLElement>('[data-ba]').forEach((box) => {
  const range = $<HTMLInputElement>('input[type="range"]', box);
  range?.addEventListener('input', () => box.style.setProperty('--split', `${range.value}%`));
});

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
      const data = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
      for (const [key, value] of Object.entries(trackingValues())) data.set(key, value);
      const body = data.toString();
      if (isLocal) console.info('[richiesta simulata]', body);
      else {
        const res = await fetch(site.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
        if (!res.ok) throw new Error(String(res.status));
      }
      track('richiesta_inviata', { tipo: data.get('kind'), pagina: data.get('page'), origine: data.get('origin') });
      location.href = '/grazie';
    } catch {
      toast('Invio non riuscito. Riprova tra poco.');
      button.disabled = false;
      button.textContent = label;
    }
  });
});
