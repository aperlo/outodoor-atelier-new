// Mini-carrello a scomparsa: si apre dall'icona del carrello o dopo un "Aggiungi al carrello",
// senza lasciare la pagina. Il riepilogo completo e la richiesta d'ordine restano in /carrello.
import { cart } from '../lib/stores';
import { quote } from '../lib/quote';
import { resize } from '../data/content';
import { eur, num } from '../lib/format';

const drawer = document.querySelector<HTMLElement>('[data-cart-drawer]');
if (drawer) init(drawer);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function init(drawer: HTMLElement) {
  const panel = drawer.querySelector<HTMLElement>('[data-cart-panel]')!;
  const list = drawer.querySelector<HTMLElement>('[data-cart-lines]')!;
  const empty = drawer.querySelector<HTMLElement>('[data-cart-empty]')!;
  const foot = drawer.querySelector<HTMLElement>('[data-cart-foot]')!;
  const subtotal = drawer.querySelector<HTMLElement>('[data-cart-subtotal]')!;
  let returnFocus: HTMLElement | null = null;

  function render() {
    const lines = cart.get();
    empty.hidden = lines.length > 0;
    foot.hidden = lines.length === 0;
    if (!lines.length) {
      list.innerHTML = '';
      return;
    }
    const q = quote(lines, null);
    list.innerHTML = lines
      .map((line) => {
        const ql = q.lines.find((x) => x.line_id === line.id);
        const name = esc(ql?.product_name ?? line.product_slug);
        const detail = esc(line.format_label ?? (line.environment ? 'Progetto configurato' : 'Taglio su misura'));
        const pose = line.installation.mode === 'pro' ? ' · posa professionale (stima)' : '';
        const acc = ql && ql.accessories.length ? `<p class="mt-1 text-xs text-moss">+ ${ql.accessories.length} accessori</p>` : '';
        return `<li class="flex gap-4 border-b border-stone-line py-4">
          ${ql ? `<img src="${esc(resize(ql.image, 200))}" alt="" class="size-20 shrink-0 object-cover" />` : ''}
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <p class="font-heading text-lg leading-tight">${name}</p>
              <button type="button" class="text-xs text-moss underline" data-line-remove="${esc(line.id)}">Rimuovi</button>
            </div>
            <p class="mt-1 text-xs text-moss">${detail}${pose}</p>${acc}
            <div class="mt-3 flex items-center justify-between">
              <div class="inline-flex items-center border border-stone">
                <button type="button" class="size-8" aria-label="Un metro quadro in meno" data-line-step="${esc(line.id)}" data-step="-1">−</button>
                <span class="min-w-16 text-center font-mono text-sm">${num(line.sqm)} m²</span>
                <button type="button" class="size-8" aria-label="Un metro quadro in più" data-line-step="${esc(line.id)}" data-step="1">+</button>
              </div>
              <span class="font-mono text-sm">${ql ? eur(ql.line_subtotal) : '—'}</span>
            </div>
          </div>
        </li>`;
      })
      .join('');
    subtotal.textContent = eur(q.goods_subtotal);
  }

  const open = () => {
    returnFocus = document.activeElement as HTMLElement | null;
    render();
    drawer.dataset.open = 'true';
    drawer.inert = false;
    document.documentElement.style.overflow = 'hidden';
    panel.focus();
  };
  const close = () => {
    if (drawer.dataset.open !== 'true') return;
    drawer.dataset.open = 'false';
    drawer.inert = true;
    document.documentElement.style.overflow = '';
    returnFocus?.focus();
  };

  window.addEventListener('oa:cart-open', open);
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const trigger = t.closest('[data-cart-open]');
    if (trigger) {
      e.preventDefault();
      open();
      return;
    }
    if (t.closest('[data-cart-close]')) close();
    const remove = t.closest<HTMLElement>('[data-line-remove]');
    if (remove) cart.set(cart.get().filter((l) => l.id !== remove.dataset.lineRemove));
    const step = t.closest<HTMLElement>('[data-line-step]');
    if (step) {
      const delta = Number(step.dataset.step);
      cart.set(cart.get().map((l) => (l.id === step.dataset.lineStep ? { ...l, sqm: Math.max(1, Math.round((l.sqm + delta) * 10) / 10) } : l)));
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  cart.listen(() => {
    if (drawer.dataset.open === 'true') render();
  });
}
