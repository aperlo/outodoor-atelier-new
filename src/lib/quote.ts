// Calcolo del preventivo, interamente nel browser.
// Parametri in src/data/config.json; catalogo in products.json e accessories.json.

import config from '../data/config.json';
import productsData from '../data/products.json';
import accessoriesData from '../data/accessories.json';
import { isCap } from './format';

export type Product = (typeof productsData)[number];
export type Accessory = (typeof accessoriesData)[number];
export const products: Product[] = productsData;
export const accessories: Accessory[] = accessoriesData;
export { config };

export interface Section {
  length: number;
  width: number;
}

export interface CartLine {
  id: string;
  product_slug: string;
  sqm: number;
  custom_cut: boolean;
  accessories: { id: string; qty: number }[];
  installation: { mode: 'diy' | 'pro'; cap?: string | null };
  environment: string | null;
  sections: Section[];
  waste_pct: number;
  format_label: string | null;
}

const ROLL = config.roll_width_m;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Metri lineari di giunta tra i teli. */
export function seams(sections: Section[], totalMode: boolean, sqm: number, roll = ROLL) {
  if (totalMode) {
    const side = Math.sqrt(sqm);
    return Math.max(0, (Math.ceil(side / roll) - 1) * side);
  }
  return sections.reduce((sum, s) => sum + Math.max(0, Math.ceil(s.width / roll) - 1) * s.length, 0);
}

/**
 * Sfrido geometrico: materiale in più dovuto alla larghezza fissa dei teli.
 * Per ogni sezione si prova la posa nei due versi e si tiene quello che consuma meno.
 */
export function geometricWastePct(sections: Section[], roll = ROLL) {
  let area = 0;
  let material = 0;
  for (const s of sections) {
    const a = s.length * s.width;
    if (a <= 0) continue;
    const alongLength = Math.ceil(s.width / roll) * roll * s.length;
    const alongWidth = Math.ceil(s.length / roll) * roll * s.width;
    area += a;
    material += Math.min(alongLength, alongWidth);
  }
  return area > 0 ? Math.max(0, (material / area - 1) * 100) : 0;
}

/**
 * Materiale da acquistare per un rettangolo di misure libere, con teli larghi `roll` metri
 * posati nel verso che consuma meno.
 */
export function materialFor(length: number, width: number, roll = ROLL) {
  const area = Math.max(0, length) * Math.max(0, width);
  if (area <= 0) return { area: 0, material: 0, strips: 0, stripLength: 0, seams: 0 };
  const optionA = { strips: Math.ceil(width / roll), stripLength: length };
  const optionB = { strips: Math.ceil(length / roll), stripLength: width };
  const a = optionA.strips * roll * optionA.stripLength;
  const b = optionB.strips * roll * optionB.stripLength;
  const best = a <= b ? optionA : optionB;
  return {
    area,
    material: Math.round(Math.min(a, b) * 10) / 10,
    strips: best.strips,
    stripLength: best.stripLength,
    seams: (best.strips - 1) * best.stripLength,
  };
}

/** Sfrido suggerito: il maggiore tra il valore di base e quello geometrico. */
export function suggestedWaste(sections: Section[], totalMode: boolean) {
  if (totalMode) return config.default_waste_pct;
  return Math.max(config.default_waste_pct, Math.ceil(geometricWastePct(sections)));
}

export type AccessoryLevel = 'richiesto' | 'consigliato' | 'opzionale';

export function recommendAccessories(env: string, seamM: number, sqm: number) {
  const onSoil = ['garden', 'pet'].includes(env);
  const onHardFloor = ['terrace', 'rooftop', 'balcony', 'pool'].includes(env);
  const list: { id: string; qty: number; level: AccessoryLevel; why: string }[] = [];
  if (seamM > 0) {
    list.push({ id: 'tape', qty: Math.ceil(seamM), level: 'richiesto', why: `${seamM.toFixed(1).replace('.', ',')} m di giunte tra i teli da ${ROLL} m` });
    list.push({ id: 'adhesive', qty: Math.max(1, Math.ceil(seamM / 15)), level: 'richiesto', why: 'Per incollare la banda di giunzione' });
  }
  if (onSoil) {
    list.push({ id: 'geotextile', qty: Math.ceil(sqm), level: 'consigliato', why: 'Posa su terreno' });
    list.push({ id: 'pegs', qty: Math.max(1, Math.ceil(sqm / 25)), level: 'consigliato', why: 'Fissaggio perimetrale' });
  }
  if (onHardFloor) {
    list.push({ id: 'underlay', qty: Math.ceil(sqm), level: 'consigliato', why: 'Su piastrelle o massetto (dove appropriato)' });
  }
  list.push({ id: 'sand', qty: Math.max(1, Math.ceil((sqm * 5) / 25)), level: 'opzionale', why: 'Intaso: quantità indicativa da verificare' });
  list.push({ id: 'diy-kit', qty: 1, level: 'opzionale', why: 'Utile se posi da solo' });
  return list;
}

export function installationFor(cap: string | null | undefined, sqm: number) {
  if (!isCap(cap)) return null;
  const zone = config.installation_zones.find((z) => z.cap_prefixes.some((p) => cap!.startsWith(p)));
  if (!zone) {
    return {
      available: false as const,
      message: 'Per questo CAP non abbiamo ancora una stima di riferimento: richiedi la valutazione di un installatore.',
    };
  }
  return {
    available: true as const,
    zone_label: zone.label,
    rate_min: zone.rate_min,
    rate_max: zone.rate_max,
    estimate_min: round2(zone.rate_min * sqm),
    estimate_max: round2(zone.rate_max * sqm),
  };
}

export function quote(lines: CartLine[], cap: string | null) {
  let goods = 0;
  let weight = 0;
  let instMin: number | null = null;
  let instMax: number | null = null;

  const outLines = lines.flatMap((line) => {
    const product = products.find((p) => p.slug === line.product_slug);
    if (!product) return [];
    const material = round2(product.price_m2 * line.sqm);
    const acc = line.accessories.flatMap((a) => {
      const item = accessories.find((x) => x.id === a.id);
      if (!item || a.qty <= 0) return [];
      return [{ id: item.id, name: item.name, unit: item.unit, qty: a.qty, unit_price: item.price, subtotal: round2(item.price * a.qty), weight: item.weight_kg * a.qty }];
    });
    const cutFee = line.custom_cut ? config.custom_cut_fee : 0;
    const subtotal = round2(material + acc.reduce((s, a) => s + a.subtotal, 0) + cutFee);
    goods += subtotal;
    weight += product.weight_kg_m2 * line.sqm + acc.reduce((s, a) => s + a.weight, 0);

    const installation = line.installation.mode === 'pro' ? installationFor(line.installation.cap, line.sqm) : null;
    if (installation?.available) {
      instMin = (instMin ?? 0) + installation.estimate_min;
      instMax = (instMax ?? 0) + installation.estimate_max;
    }
    return [{
      line_id: line.id,
      product_slug: product.slug,
      product_name: product.name,
      image: product.image,
      sqm: line.sqm,
      price_m2: product.price_m2,
      material_subtotal: material,
      accessories: acc,
      custom_cut_fee: cutFee,
      line_subtotal: subtotal,
      installation,
    }];
  });

  goods = round2(goods);
  const ship = config.shipping;
  let shipping: { status: 'calculated' | 'quote_required' | 'cap_missing'; amount: number | null; weight_kg: number; message: string };
  if (!isCap(cap)) {
    shipping = { status: 'cap_missing', amount: null, weight_kg: weight, message: 'Inserisci il CAP di consegna per calcolare la spedizione.' };
  } else if (weight > ship.max_weight_kg || ship.quote_required_cap_prefixes.some((p) => cap!.startsWith(p))) {
    shipping = { status: 'quote_required', amount: null, weight_kg: weight, message: `Per isole, località disagiate o carichi oltre ${ship.max_weight_kg} kg prepariamo una quotazione di spedizione dedicata.` };
  } else {
    shipping = { status: 'calculated', amount: round2(ship.base_fee + ship.per_kg * weight), weight_kg: weight, message: '' };
  }

  const taxable = goods + (shipping.amount ?? 0);
  const vat = round2(taxable * config.vat_rate);
  return {
    lines: outLines,
    goods_subtotal: goods,
    shipping,
    vat_rate: config.vat_rate,
    vat_amount: vat,
    total: round2(taxable + vat),
    installation_estimate_min: instMin as number | null,
    installation_estimate_max: instMax as number | null,
  };
}

export type Quote = ReturnType<typeof quote>;
