// Stato condiviso tra le pagine, salvato nel browser (localStorage).
import { persistentAtom } from '@nanostores/persistent';
import type { WritableAtom } from 'nanostores';
import type { CartLine } from './quote';

const json = { encode: JSON.stringify, decode: JSON.parse };

export const cart = persistentAtom<CartLine[]>('oa-cart', [], json);
export const samples = persistentAtom<string[]>('oa-samples', [], json);
export const compare = persistentAtom<string[]>('oa-compare', [], json);
// Ultimo CAP di consegna inserito: evita di riscriverlo tra scheda prodotto e carrello.
export const deliveryCap = persistentAtom<string>('oa-cap', '');

/** Apre il mini-carrello (gestito da src/scripts/cart-drawer.ts). */
export function openCartDrawer() {
  window.dispatchEvent(new CustomEvent('oa:cart-open'));
}

export const MAX_COMPARE = 3;

export function toggle(store: WritableAtom<string[]>, slug: string, max: number): 'added' | 'removed' | 'full' {
  const list = store.get();
  if (list.includes(slug)) {
    store.set(list.filter((s) => s !== slug));
    return 'removed';
  }
  if (list.length >= max) return 'full';
  store.set([...list, slug]);
  return 'added';
}

export function addToCart(line: CartLine) {
  cart.set([...cart.get(), line]);
}
