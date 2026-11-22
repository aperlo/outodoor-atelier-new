// Collezione: tela navigabile (trascina, scorri, zoom), vista a griglia e filtri sensoriali.
import { collectionLabels } from '../data/content';

const $ = <T extends Element>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

const root = $<HTMLElement>('[data-collection]');
if (root) init(root);

function init(root: HTMLElement) {
  const canvas = $<HTMLElement>('[data-canvas]', root)!;
  const items = $$<HTMLAnchorElement>('[data-item]', root);
  const cards = $$<HTMLElement>('[data-card]', root);
  const useMap: Record<string, string[]> = JSON.parse(root.dataset.useMap ?? '{}');
  const [worldW, worldH] = (root.dataset.world ?? '2400x1800').split('x').map(Number);

  /* ---------- Filtri ---------- */
  type Key = 'softness' | 'use' | 'tone' | 'collection';
  const filters: Record<Key, string> = { softness: '', use: '', tone: '', collection: '' };

  // Filtri dall'indirizzo: ?collezione=natural-look, ?uso=giardino (o il vecchio ?uso=garden)
  const params = new URLSearchParams(location.search);
  const col = params.get('collezione');
  if (col && collectionLabels[col]) filters.collection = col;
  const uso = params.get('uso');
  if (uso) filters.use = useMap[uso] ? uso : Object.keys(useMap).find((k) => useMap[k].includes(uso)) ?? '';

  const matches = (el: HTMLElement) => {
    const d = el.dataset;
    const uses = (d.uses ?? '').split(' ');
    return (
      (!filters.softness || d.softness === filters.softness) &&
      (!filters.tone || d.tone === filters.tone) &&
      (!filters.collection || d.collection === filters.collection) &&
      (!filters.use || (useMap[filters.use] ?? []).some((u) => uses.includes(u)))
    );
  };

  const labelFor = (key: Key, value: string) => {
    if (key === 'collection') return `Collezione: ${collectionLabels[value]}`;
    const btn = $<HTMLElement>(`[data-filter="${key}"][data-value="${value}"]`);
    return btn?.textContent?.trim() ?? value;
  };

  function apply() {
    let shown = 0;
    for (const item of items) {
      const ok = matches(item);
      item.classList.toggle('is-dim', !ok);
      item.tabIndex = ok ? 0 : -1;
      item.setAttribute('aria-hidden', String(!ok));
      if (ok) shown++;
    }
    for (const card of cards) card.hidden = !matches(card);

    $$('[data-count]').forEach((el) => (el.textContent = String(shown)));
    $<HTMLElement>('[data-canvas-empty]', root)!.hidden = shown > 0;
    $<HTMLElement>('[data-grid-empty]', root)!.hidden = shown > 0;

    const active = (Object.keys(filters) as Key[]).filter((k) => filters[k]);
    const counter = $('[data-filter-count]');
    if (counter) counter.textContent = active.length ? ` · ${active.length}` : '';
    $$<HTMLElement>('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(filters[b.dataset.filter as Key] === b.dataset.value)));

    // Filtri attivi, ciascuno rimovibile.
    const box = $<HTMLElement>('[data-active-filters]')!;
    box.replaceChildren(
      ...active.map((k) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'border border-forest bg-forest px-3 py-1.5 text-xs text-sand';
        b.textContent = `${labelFor(k, filters[k])} ×`;
        b.setAttribute('aria-label', `Rimuovi il filtro ${labelFor(k, filters[k])}`);
        b.addEventListener('click', () => {
          filters[k] = '';
          apply();
        });
        return b;
      }),
    );
  }

  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const chip = t.closest<HTMLElement>('[data-filter]');
    if (chip) {
      const key = chip.dataset.filter as Key;
      filters[key] = filters[key] === chip.dataset.value ? '' : chip.dataset.value!;
      apply();
      return;
    }
    if (t.closest('[data-reset-filters]')) {
      (Object.keys(filters) as Key[]).forEach((k) => (filters[k] = ''));
      apply();
    }
  });

  /* ---------- Pannelli (filtri, menu) ---------- */
  let lastTrigger: HTMLElement | null = null;
  const openSheet = (name: string, trigger: HTMLElement) => {
    const sheet = $<HTMLElement>(`[data-sheet="${name}"]`);
    if (!sheet) return;
    lastTrigger = trigger;
    sheet.dataset.open = 'true';
    sheet.inert = false;
    $<HTMLElement>('[role="dialog"] button, [role="dialog"] a', sheet)?.focus();
  };
  const closeSheets = () => {
    $$<HTMLElement>('[data-sheet][data-open="true"]').forEach((s) => {
      s.dataset.open = 'false';
      s.inert = true;
    });
    lastTrigger?.focus();
    lastTrigger = null;
  };
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const opener = t.closest<HTMLElement>('[data-open-sheet]');
    if (opener) openSheet(opener.dataset.openSheet!, opener);
    else if (t.closest('[data-close-sheet]')) closeSheets();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSheets();
  });

  /* ---------- Vista: tela o griglia ---------- */
  const setView = (view: 'canvas' | 'grid') => {
    root.dataset.view = view;
    $<HTMLElement>('[data-canvas-view]', root)!.hidden = view !== 'canvas';
    $<HTMLElement>('[data-grid-view]', root)!.hidden = view !== 'grid';
    $$<HTMLElement>('[data-view-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.viewBtn === view)));
    try {
      localStorage.setItem('oa-view', view);
    } catch {}
  };
  $$<HTMLElement>('[data-view-btn]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.viewBtn as 'canvas' | 'grid')));
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('oa-view');
  } catch {}
  setView(saved === 'grid' ? 'grid' : 'canvas');

  /* ---------- Tela: zoom ---------- */
  const MIN = 0.25; // abbastanza per vedere tutta la tela con "Tutto"
  const MAX = 1.4;
  let zoom = 0.8;
  const setZoom = (next: number, cx = canvas.clientWidth / 2, cy = canvas.clientHeight / 2) => {
    next = Math.min(MAX, Math.max(MIN, Math.round(next * 100) / 100));
    // Il punto sotto (cx, cy) resta fermo mentre lo zoom cambia.
    const wx = (canvas.scrollLeft + cx) / zoom;
    const wy = (canvas.scrollTop + cy) / zoom;
    zoom = next;
    canvas.style.setProperty('--z', String(zoom));
    canvas.scrollLeft = wx * zoom - cx;
    canvas.scrollTop = wy * zoom - cy;
  };
  const fit = () => setZoom(Math.min(canvas.clientWidth / worldW, canvas.clientHeight / worldH, 1), 0, 0);

  $$<HTMLElement>('[data-zoom]', root).forEach((b) =>
    b.addEventListener('click', () => {
      const z = b.dataset.zoom;
      if (z === 'fit') {
        fit();
        canvas.scrollTo({ left: 0, top: 0 });
      } else setZoom(zoom * (z === 'in' ? 1.2 : 1 / 1.2));
    }),
  );
  // Ctrl/⌘ + rotella (o pizzico sul trackpad) = zoom; la rotella semplice scorre.
  canvas.addEventListener(
    'wheel',
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const box = canvas.getBoundingClientRect();
      setZoom(zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), e.clientX - box.left, e.clientY - box.top);
    },
    { passive: false },
  );
  canvas.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') setZoom(zoom * 1.2);
    else if (e.key === '-') setZoom(zoom / 1.2);
  });

  /* ---------- Tela: trascinamento col mouse (al tocco basta lo scorrimento nativo) ---------- */
  let drag: { x: number; y: number; left: number; top: number; moved: boolean } | null = null;
  let suppressClick = false;
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, left: canvas.scrollLeft, top: canvas.scrollTop, moved: false };
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 5) {
      drag.moved = true;
      canvas.classList.add('is-dragging');
    }
    if (drag.moved) {
      canvas.scrollLeft = drag.left - dx;
      canvas.scrollTop = drag.top - dy;
    }
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    suppressClick = drag.moved;
    drag = null;
    canvas.classList.remove('is-dragging');
  });
  // Un trascinamento non deve aprire la superficie su cui finisce.
  canvas.addEventListener(
    'click',
    (e) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      }
    },
    true,
  );

  // Avvio: zoom adatto allo schermo, vista dall'angolo in alto a sinistra.
  setZoom(canvas.clientWidth < 640 ? 0.55 : 0.8, 0, 0);
  canvas.scrollTo({ left: 0, top: 0 });
  apply();
}

