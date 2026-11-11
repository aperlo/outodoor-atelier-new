import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { products } from '../../lib/quote';
import { img, Q } from '../../data/content';
import LeadFormIsland from './LeadFormIsland';

type Point = { x: number; y: number };

// Tonalità applicata alla texture in base all'aspetto del modello.
const tints: Record<string, string> = {
  default: 'saturate(1.05) brightness(1)',
  bicolore: 'saturate(0.95) hue-rotate(-6deg)',
  'verde intenso': 'saturate(1.3) brightness(1.05)',
  'verde oliva': 'saturate(0.8) hue-rotate(-14deg) brightness(0.95)',
};
const tintFor = (appearance: string) => tints[Object.keys(tints).find((k) => appearance.toLowerCase().includes(k)) ?? 'default'];

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

const examples = [Q.patio, Q.heroVilla, Q.balcony];

export default function Visualizer() {
  const [src, setSrc] = useState(img(Q.patio, 1600));
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [texture, setTexture] = useState<HTMLImageElement | null>(null);
  const [areas, setAreas] = useState<Point[][]>([]);
  const [draft, setDraft] = useState<Point[]>([]);
  const [slug, setSlug] = useState(products[0].slug);
  const [scale, setScale] = useState(0.35);
  const [split, setSplit] = useState(50);
  const canvas = useRef<HTMLCanvasElement>(null);
  const product = products.find((p) => p.slug === slug) ?? products[0];

  useEffect(() => {
    setPhoto(null);
    loadImage(src).then(setPhoto).catch(() => setPhoto(null));
  }, [src]);
  useEffect(() => {
    loadImage(img(Q.macro, 900)).then(setTexture).catch(() => setTexture(null));
  }, []);

  const draw = useCallback(() => {
    const c = canvas.current;
    if (!c || !photo) return;
    c.width = photo.naturalWidth;
    c.height = photo.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(photo, 0, 0);

    if (texture) {
      const tile = document.createElement('canvas');
      tile.width = Math.max(40, texture.naturalWidth * scale * (c.width / 1600));
      tile.height = tile.width * (texture.naturalHeight / texture.naturalWidth);
      const tctx = tile.getContext('2d')!;
      tctx.filter = tintFor(product.appearance);
      tctx.drawImage(texture, 0, 0, tile.width, tile.height);
      const pattern = ctx.createPattern(tile, 'repeat')!;
      for (const area of areas) {
        if (area.length < 3) continue;
        ctx.save();
        ctx.beginPath();
        area.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, c.width, c.height);
        // Le ombre della foto originale restano visibili sopra la texture.
        ctx.globalAlpha = 0.28;
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(photo, 0, 0);
        ctx.restore();
      }
    }

    const r = Math.max(4, c.width / 220);
    ctx.lineWidth = r / 2;
    ctx.strokeStyle = '#AD9870';
    ctx.fillStyle = '#FAF8F5';
    if (draft.length) {
      ctx.beginPath();
      draft.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
      for (const p of draft) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }, [photo, texture, areas, draft, scale, product]);
  useEffect(draw, [draw]);

  const closeArea = () => {
    if (draft.length < 3) return;
    setAreas([...areas, draft]);
    setDraft([]);
  };
  const onCanvasClick = (e: MouseEvent) => {
    const c = canvas.current!;
    const box = c.getBoundingClientRect();
    const p = { x: ((e.clientX - box.left) / box.width) * c.width, y: ((e.clientY - box.top) / box.height) * c.height };
    if (draft.length >= 3 && Math.hypot(p.x - draft[0].x, p.y - draft[0].y) < c.width / 40) return closeArea();
    setDraft([...draft, p]);
  };
  const reset = () => {
    setAreas([]);
    setDraft([]);
  };
  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(String(reader.result));
      reset();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div class="grid gap-10 lg:grid-cols-12">
      <div class="lg:col-span-8">
        {/* Il riquadro prende la forma della foto, senza superare l'altezza dello schermo. */}
        <div class="relative mx-auto w-fit max-w-full overflow-hidden bg-ivory">
          <canvas ref={canvas} onClick={onCanvasClick} class="block h-auto max-h-[78vh] w-auto max-w-full cursor-crosshair" aria-label="Foto del tuo spazio: clicca per tracciare l'area" />
          {areas.length > 0 && photo && (
            <>
              <img src={src} alt="Prima" class="pointer-events-none absolute inset-0 size-full object-cover" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }} />
              <div class="pointer-events-none absolute inset-y-0 w-0.5 bg-sand" style={{ left: `${split}%` }} />
              <span class="eyebrow pointer-events-none absolute left-3 top-3 bg-forest-deep/80 px-2 py-1 text-sand">Prima</span>
              <span class="eyebrow pointer-events-none absolute right-3 top-3 bg-brass px-2 py-1 text-forest-deep">Dopo</span>
            </>
          )}
          {!photo && <p class="p-16 text-center text-moss">Caricamento foto…</p>}
        </div>
        {areas.length > 0 && (
          <label class="mt-4 flex items-center gap-4 text-sm text-moss">
            Prima / Dopo
            <input type="range" min={0} max={100} value={split} onInput={(e) => setSplit(Number(e.currentTarget.value))} class="flex-1 accent-[#ad9870]" />
          </label>
        )}
        <p class="mt-3 text-sm text-moss">
          {draft.length === 0
            ? "Clicca sulla foto per posizionare i vertici dell'area da rivestire."
            : `${draft.length} punti · clicca sul primo punto o su “Chiudi area” per completare.`}
        </p>
      </div>

      <aside class="space-y-7 lg:col-span-4">
        <div>
          <p class="eyebrow text-brass-ink">1 · La tua foto</p>
          <label class="btn-forest mt-3 w-full cursor-pointer">
            Carica foto
            <input type="file" accept="image/*" class="sr-only" onChange={(e) => onFile(e.currentTarget.files?.[0])} />
          </label>
          <div class="mt-3 grid grid-cols-3 gap-2">
            {examples.map((id) => (
              <button type="button" key={id} aria-label="Usa foto di esempio" onClick={() => { setSrc(img(id, 1600)); reset(); }}>
                <img src={img(id, 300)} alt="" class="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
          <p class="mt-2 text-xs text-moss">La foto resta nel tuo browser: non viene caricata sui nostri server.</p>
        </div>

        <div>
          <p class="eyebrow text-brass-ink">2 · Seleziona l'area</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button type="button" class="chip" onClick={closeArea} disabled={draft.length < 3}>Chiudi area</button>
            <button type="button" class="chip" onClick={() => (draft.length ? setDraft(draft.slice(0, -1)) : setAreas(areas.slice(0, -1)))}>Annulla</button>
            <button type="button" class="chip" onClick={reset}>Azzera</button>
          </div>
          <p class="mt-2 font-mono text-xs text-moss">{areas.length} area/e selezionate</p>
        </div>

        <div>
          <p class="eyebrow text-brass-ink">3 · Superficie</p>
          <label for="viz-product" class="sr-only">Superficie</label>
          <select id="viz-product" class="field mt-3" value={slug} onChange={(e) => setSlug(e.currentTarget.value)}>
            {products.map((p) => <option key={p.slug} value={p.slug}>{p.name} · {p.height_mm} mm</option>)}
          </select>
          <label class="mt-4 block text-xs text-moss">
            Scala della texture (prospettiva)
            <input type="range" min={0.1} max={1} step={0.05} value={scale} onInput={(e) => setScale(Number(e.currentTarget.value))} class="mt-2 w-full accent-[#ad9870]" />
          </label>
        </div>

        <div class="space-y-3">
          <a href={`/progetta?prodotto=${slug}&step=2`} class="btn-forest w-full">Calcola dimensioni e preventivo</a>
          <details class="border border-stone-line bg-white p-5">
            <summary class="font-semibold">Invia a un consulente</summary>
            <div class="mt-5">
              <LeadFormIsland
                kind="visualizer_project"
                submitLabel="Invia richiesta"
                payload={() => ({ product: slug, areas: areas.length })}
                fields={[
                  { name: 'name', label: 'Nome', required: true, half: true },
                  { name: 'email', label: 'Email', type: 'email', required: true, half: true },
                  { name: 'message', label: 'Descrivi lo spazio', textarea: true },
                ]}
              />
            </div>
          </details>
        </div>
      </aside>
    </div>
  );
}
