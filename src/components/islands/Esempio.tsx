import { config } from '../../lib/quote';

/** Etichetta ESEMPIO accanto a importi dimostrativi (stessa regola di Esempio.astro). */
export default function Esempio({ class: cls = '' }: { class?: string }) {
  if (!config.demo_values) return null;
  return <span class={`esempio ${cls}`} title="Valore di esempio: sarà sostituito dal listino validato">Esempio</span>;
}
