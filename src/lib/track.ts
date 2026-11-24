// Eventi di misurazione. Il sito li emette sempre; li registra src/scripts/analytics.ts
// solo se è configurata una chiave di analytics. Senza chiave non succede nulla.
export function track(name: string, props: Record<string, unknown> = {}) {
  window.dispatchEvent(new CustomEvent('oa:track', { detail: { name, props } }));
}
