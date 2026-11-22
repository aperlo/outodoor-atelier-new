import { site } from '../config/site';

// Nome del produttore nelle frasi: con marchio oppure in forma generica.
export const P = site.supplier.show ? site.supplier.name : 'il produttore';
export const daP = site.supplier.show ? `da ${site.supplier.name}` : 'dal produttore';
export const tagline = site.supplier.show ? `Superfici ${site.supplier.name}` : 'Superfici Made in Italy';

// Immagini di ambientazione (Unsplash / Pexels). Da sostituire con fotografie reali.
export const img = (id: string, w = 1600) =>
  id.startsWith('http') ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
export const resize = (url: string, w: number) => url.replace('w=1400', `w=${w}`);

export const Q = {
  heroVilla: 'photo-1721222203704-da4b946207a5',
  villaPool: 'photo-1721989518229-3e84837fc398',
  rooftop: 'photo-1762195804066-2fece9b24496',
  pool: 'photo-1758448756167-88dc934c58e4',
  patio: 'photo-1693643449872-67f203f99560',
  aerial: 'photo-1711110065992-6d6aff9ae35c',
  macro: 'photo-1633320620193-0d4db54fb8a1',
  macro2: 'photo-1719536753784-bd0881701b1a',
  dogs: 'photo-1569203685368-118435c389dd',
  dog2: 'photo-1568393691622-c7ba131d63b4',
  balcony: 'photo-1747389305146-40992888976e',
  hotel: 'photo-1775896732714-d540d13884f8',
  hotel2: 'photo-1773370526423-c76f5057d285',
  padel: 'photo-1770230901556-4e1c0bacfb09',
  minigolf: 'photo-1657085716783-c0afbdabf96e',
  kinder: 'photo-1707013269128-0cdc68cb8d42',
  park: 'photo-1781280489619-1e852cf6e3de',
  interior: 'photo-1790156591960-0912f208db97',
  event: 'photo-1533120921505-7f40f5237ee1',
  spa: 'photo-1561501900-3701fa6a0864',
  spa3: 'https://images.pexels.com/photos/9116592/pexels-photo-9116592.jpeg?auto=compress&cs=tinysrgb&w=1600',
};

export const useLabels: Record<string, string> = {
  garden: 'Giardino',
  terrace: 'Terrazza',
  rooftop: 'Rooftop',
  balcony: 'Balcone',
  pool: 'Piscina',
  commercial: 'Spazi commerciali',
  pet: 'Animali',
  sport: 'Sport light',
  event: 'Fiere & eventi',
  indoor: 'Interni',
  public: 'Spazi pubblici',
};

export const collectionLabels: Record<string, string> = {
  'natural-look': 'Natural Look',
  'premium-comfort': 'Premium Comfort',
  'family-pets': 'Family & Pets',
  'high-performance': 'High Performance',
};

export const availabilityLabels: Record<string, string> = {
  disponibile: 'Disponibile a magazzino',
  limitata: 'Disponibilità limitata',
  'su-ordinazione': 'Su ordinazione',
};

export const heightBands: Record<string, [number, number, string]> = {
  short: [0, 20, 'Fino a 20 mm'],
  mid: [21, 35, '21–35 mm'],
  tall: [36, 99, 'Oltre 35 mm'],
};

// Tono di verde: filtro "sensoriale" della collezione. Il colore è solo un riferimento visivo.
export const tones: Record<string, { label: string; color: string }> = {
  naturale: { label: 'Naturale', color: '#6d8a4a' },
  salvia: { label: 'Salvia', color: '#8fa38a' },
  brillante: { label: 'Brillante', color: '#5c9e3a' },
  oliva: { label: 'Oliva', color: '#6e7a38' },
  smeraldo: { label: 'Smeraldo', color: '#2e8a5a' },
};

export const softnessLabels: Record<string, string> = {
  alta: 'Alta · piedi nudi',
  media: 'Media',
  tecnica: 'Tecnica · calpestio intenso',
};

// "Uso" raggruppa le destinazioni del catalogo in cinque scelte comprensibili.
export const useGroups: Record<string, { label: string; uses: string[] }> = {
  giardino: { label: 'Giardino', uses: ['garden'] },
  piscina: { label: 'Piscina', uses: ['pool'] },
  terrazza: { label: 'Terrazza', uses: ['terrace', 'rooftop', 'balcony'] },
  animali: { label: 'Animali', uses: ['pet'] },
  commerciale: { label: 'Commerciale', uses: ['commercial', 'event', 'indoor', 'public'] },
};

export const worlds = [
  { id: 'giardini', title: 'Giardini privati', line: "Il prato che accompagna la vita della villa, tutto l'anno.", image: Q.heroVilla, href: '/settori/erba-sintetica-per-giardini' },
  { id: 'terrazze', title: 'Terrazze & Rooftop', line: 'Superfici leggere e drenanti, sopra la città.', image: Q.rooftop, href: '/settori/erba-sintetica-per-terrazzi' },
  { id: 'piscina', title: 'Piscina & Wellness', line: "Comfort a piedi nudi, dove l'acqua incontra il verde.", image: Q.pool, href: '/settori/erba-sintetica-per-piscine' },
  { id: 'famiglia', title: 'Famiglia & Animali', line: 'Spazi vissuti, facili da curare, sempre in ordine.', image: Q.dogs, href: '/settori/erba-sintetica-per-animali' },
];

export interface Sector {
  slug: string;
  group: 'living' | 'pubblico' | 'eventi' | 'sport';
  nav: string;
  title: string;
  seoTitle: string;
  intro: string;
  image: string;
  uses: string[];
  env: string;
  points: string[];
}

export const sectors: Sector[] = [
  { slug: 'erba-sintetica-per-giardini', group: 'living', nav: 'Giardini', title: 'Erba sintetica per giardini', seoTitle: 'Erba sintetica per giardini — prato sintetico di alta qualità', intro: 'Un prato sempre perfetto per ville e giardini di famiglia: niente irrigazione intensiva, niente tagli, la stessa eleganza in ogni stagione.', image: Q.heroVilla, uses: ['garden'], env: 'garden', points: ['Aspetto bicolore naturale', 'Posa su terreno con geotessile', 'Tagli su misura per ridurre gli sfridi'] },
  { slug: 'erba-sintetica-per-terrazzi', group: 'living', nav: 'Terrazze', title: 'Erba sintetica per terrazzi', seoTitle: 'Erba sintetica per terrazzi e balconi', intro: 'Trasforma piastrelle e massetti in un salotto verde. Modelli leggeri, con materassino drenante consigliato.', image: Q.patio, uses: ['terrace', 'balcony'], env: 'terrace', points: ['Peso al m² dichiarato per ogni modello', 'Materassino drenante opzionale', 'Formati 5×2 e 10×2 pronti'] },
  { slug: 'erba-sintetica-per-rooftop', group: 'living', nav: 'Rooftop', title: 'Erba sintetica per rooftop', seoTitle: 'Erba sintetica per rooftop e attici', intro: 'Rooftop e attici chiedono superfici leggere, drenanti e facili da trasportare in quota.', image: Q.rooftop, uses: ['rooftop'], env: 'rooftop', points: ['Valutazione dei carichi con il tuo tecnico', 'Rotoli tagliati per il trasporto in ascensore', 'Consegna da concordare'] },
  { slug: 'erba-sintetica-per-balconi', group: 'living', nav: 'Balconi', title: 'Erba sintetica per balconi', seoTitle: 'Erba sintetica per balconi', intro: 'Anche 6 m² meritano un progetto: un balcone verde, morbido, pronto in un pomeriggio.', image: Q.balcony, uses: ['balcony'], env: 'balcony', points: ['Taglio su misura anche per piccole metrature', 'Kit fai-da-te', "Nessun minimo d'ordine"] },
  { slug: 'erba-sintetica-per-piscine', group: 'living', nav: 'Piscine', title: 'Erba sintetica per piscine', seoTitle: 'Erba sintetica per bordo piscina', intro: 'Il bordo piscina diventa un prato: comfort per i piedi nudi, aspetto naturale, manutenzione semplice.', image: Q.pool, uses: ['pool'], env: 'pool', points: ['Fibre morbide per il contatto a piedi nudi', 'Drenaggio del supporto da verificare per modello', 'Raccordi e giunte invisibili'] },
  { slug: 'erba-sintetica-per-animali', group: 'living', nav: 'Famiglia & animali', title: 'Erba sintetica per animali', seoTitle: 'Erba sintetica per cani e animali domestici', intro: 'Un giardino che resiste al gioco e si risciacqua in pochi minuti. Pensato per famiglie, bambini e animali.', image: Q.dog2, uses: ['pet'], env: 'pet', points: ['Superficie facile da risciacquare', 'Filo resiliente al calpestio', 'Consigli di posa per aree cani'] },
  { slug: 'erba-sintetica-per-hotel', group: 'living', nav: 'Hospitality', title: 'Erba sintetica per hotel', seoTitle: 'Erba sintetica per hotel, resort e beach club', intro: 'Boutique hotel, resort e beach club: superfici che restano impeccabili anche in alta stagione.', image: Q.hotel, uses: ['commercial', 'pool'], env: 'commercial', points: ['Consulente dedicato', 'Campionature di grande formato', 'Pianificazione posa fuori stagione'] },
  { slug: 'erba-sintetica-premium', group: 'living', nav: 'Premium', title: 'Erba sintetica premium', seoTitle: 'Erba sintetica premium Made in Italy', intro: `La collezione selezionata da The Outdoor Atelier: manifattura italiana per chi cerca il meglio, a prezzi trasparenti.`, image: Q.villaPool, uses: ['garden', 'pool', 'terrace'], env: 'garden', points: ['Manifattura italiana', 'Prezzi chiari al m²', 'Campioni gratuiti'] },
  { slug: 'erba-sintetica-made-in-italy', group: 'living', nav: 'Made in Italy', title: 'Erba sintetica made in Italy', seoTitle: 'Erba sintetica made in Italy', intro: `Prodotta in Italia ${daP}. Tracciabilità della filiera e documentazione tecnica fornita dal produttore.`, image: Q.aerial, uses: ['garden', 'terrace', 'pool'], env: 'garden', points: ['Produttore italiano', 'Documentazione tecnica su richiesta', 'Assistenza in italiano'] },
  { slug: 'prato-sintetico-alta-qualita', group: 'living', nav: 'Alta qualità', title: 'Prato sintetico di alta qualità', seoTitle: 'Prato sintetico di alta qualità', intro: 'Come riconoscere un prato sintetico di qualità: fibra, supporto, densità, documentazione. E come sceglierlo per il tuo spazio.', image: Q.macro, uses: ['garden', 'terrace'], env: 'garden', points: ['Guida alla scelta', 'Confronto modelli', 'Campioni per toccare con mano'] },
  { slug: 'erba-sintetica-per-asili', group: 'pubblico', nav: 'Asili & scuole', title: 'Erba sintetica per asili e scuole', seoTitle: 'Erba sintetica per asili e scuole', intro: 'Cortili e aree gioco per i più piccoli. Requisiti antitrauma, reazione al fuoco e documentazione sono verificati progetto per progetto con il produttore.', image: Q.kinder, uses: ['public'], env: 'commercial', points: ['Supporto a capitolati e gare', 'Documentazione dal produttore', 'Posa con installatori qualificati'] },
  { slug: 'aiuole-e-spazi-pubblici', group: 'pubblico', nav: 'Aiuole & verde pubblico', title: 'Aiuole, rotatorie e verde pubblico', seoTitle: 'Erba sintetica per aiuole e spazi pubblici', intro: 'Spartitraffico, rotatorie, aiuole urbane e parchi: verde ordinato con manutenzione ridotta per enti e amministrazioni.', image: Q.park, uses: ['public', 'commercial'], env: 'commercial', points: ['Preventivi per enti pubblici', 'Grandi metrature a rotolo intero', 'Consulenza tecnica'] },
  { slug: 'centri-commerciali-e-uffici', group: 'pubblico', nav: 'Centri & uffici', title: 'Centri commerciali, uffici e retail', seoTitle: 'Erba sintetica per centri commerciali e uffici', intro: 'Piazze interne, aree relax, corporate garden: superfici verdi per spazi ad alto passaggio.', image: Q.interior, uses: ['commercial', 'indoor'], env: 'commercial', points: ['Modelli per traffico intenso', 'Pianificazione notturna della posa', 'Referente unico'] },
  { slug: 'fiere-ed-eventi', group: 'eventi', nav: 'Fiere & eventi mondani', title: 'Fiere, gala ed eventi mondani', seoTitle: 'Erba sintetica per fiere, stand ed eventi', intro: 'Stand espositivi, matrimoni, gala e presentazioni di prodotto: un tappeto verde che fa scena e si riavvolge a fine evento.', image: Q.event, uses: ['event'], env: 'commercial', points: ['Consegna programmata in fiera', 'Reazione al fuoco da verificare per allestimento', 'Metrature anche per un solo giorno'] },
  { slug: 'arredi-interni', group: 'eventi', nav: 'Arredi interni', title: 'Il verde negli interni', seoTitle: "Erba sintetica per arredo d'interni e showroom", intro: "Showroom, uffici, boutique e hospitality indoor: il prato diventa materiale d'arredo.", image: Q.interior, uses: ['indoor'], env: 'commercial', points: ['Superfici a filo corto', 'Tagli sartoriali', 'Abbinamento con pareti verdi'] },
  { slug: 'padel-e-sport-light', group: 'sport', nav: 'Padel', title: 'Padel & sport light', seoTitle: 'Erba sintetica per padel privato', intro: 'Il campo da padel di casa, del resort o del club. Specifiche e omologazioni da definire con il produttore per ogni progetto.', image: Q.padel, uses: ['sport'], env: 'commercial', points: ['Consulenza tecnica dedicata', 'Intaso e sottofondo da progettare', 'Installatori sportivi'] },
  { slug: 'minigolf-e-putting-green', group: 'sport', nav: 'Minigolf & putting green', title: 'Minigolf e putting green', seoTitle: 'Erba sintetica per minigolf e putting green', intro: 'Minigolf per resort e campeggi, putting green privati in giardino: superfici a filo corto per una rotolata uniforme.', image: Q.minigolf, uses: ['sport'], env: 'garden', points: ['Superfici a filo corto', 'Disegno del percorso', 'Accessori e bordure'] },
  { slug: 'leisure-e-spa', group: 'sport', nav: 'Leisure & spa', title: 'Leisure, spa e wellness', seoTitle: 'Erba sintetica per spa, resort e aree leisure', intro: "Solarium, giardini spa, aree yoga e leisure: superfici morbide per il benessere all'aperto.", image: Q.spa, uses: ['pool', 'commercial'], env: 'pool', points: ['Comfort a piedi nudi', 'Bordi piscina', 'Progetti hospitality'] },
];

export const sectorGroups = [
  { id: 'pubblico', label: 'Spazi pubblici & nicchie', lead: 'Asili, aiuole, centri' },
  { id: 'eventi', label: 'Fiere, eventi & interni', lead: 'Allestimenti di prestigio' },
  { id: 'sport', label: 'Sport light', lead: 'Padel, minigolf, leisure & spa' },
];

// Ambientazioni illustrative: non sono progetti realizzati.
export const projects = [
  { id: 'villa-brianza', title: 'Villa privata', place: 'Giardino', image: Q.villaPool, product: 'villa-borromeo-45', tall: true },
  { id: 'rooftop-milano', title: 'Attico in città', place: 'Rooftop', image: Q.rooftop, product: 'portofino-35', tall: false },
  { id: 'resort-pool', title: 'Resort sul mare', place: 'Bordo piscina', image: Q.spa3, product: 'capri-38', tall: false },
  { id: 'family-garden', title: 'Giardino di famiglia', place: 'Area gioco', image: Q.dogs, product: 'brera-30-pet', tall: true },
  { id: 'terrazza-roma', title: 'Terrazza urbana', place: 'Terrazza', image: Q.patio, product: 'como-lago-40', tall: false },
  { id: 'gala-event', title: 'Gala estivo', place: 'Allestimento', image: Q.event, product: 'milano-expo-20', tall: false },
  { id: 'padel-club', title: 'Padel privato', place: 'Campo', image: Q.padel, product: 'padel-tour-12', tall: false },
  { id: 'showroom', title: 'Showroom', place: 'Interni', image: Q.interior, product: 'lumen-indoor-18', tall: true },
  { id: 'hotel-garden', title: 'Boutique hotel', place: 'Giardino', image: Q.hotel2, product: 'capri-38', tall: false },
];

export const environments = [
  { id: 'garden', label: 'Giardino', image: Q.heroVilla, rec: ['garden'] },
  { id: 'terrace', label: 'Terrazza', image: Q.patio, rec: ['terrace'] },
  { id: 'rooftop', label: 'Rooftop', image: Q.rooftop, rec: ['rooftop', 'terrace'] },
  { id: 'balcony', label: 'Balcone', image: Q.balcony, rec: ['balcony'] },
  { id: 'pool', label: 'Piscina', image: Q.pool, rec: ['pool'] },
  { id: 'commercial', label: 'Spazio commerciale', image: Q.hotel, rec: ['commercial'] },
  { id: 'pet', label: 'Area animali', image: Q.dog2, rec: ['pet'] },
];

const s = (slug: string) => `/settori/${slug}`;

export const nav = [
  { id: 'scopri', label: 'Scopri', to: s('erba-sintetica-per-giardini'), cols: [{ title: 'Ambienti', links: [
    { label: 'Giardini', to: s('erba-sintetica-per-giardini') },
    { label: 'Terrazze', to: s('erba-sintetica-per-terrazzi') },
    { label: 'Rooftop', to: s('erba-sintetica-per-rooftop') },
    { label: 'Piscine', to: s('erba-sintetica-per-piscine') },
    { label: 'Balconi', to: s('erba-sintetica-per-balconi') },
    { label: 'Hospitality', to: s('erba-sintetica-per-hotel') },
  ] }] },
  { id: 'superfici', label: 'Superfici', to: '/collezione', cols: [{ title: 'Collezioni', links: [
    { label: 'Natural Look', to: '/collezione?collezione=natural-look' },
    { label: 'Premium Comfort', to: '/collezione?collezione=premium-comfort' },
    { label: 'Family & Pets', to: '/collezione?collezione=family-pets' },
    { label: 'High Performance', to: '/collezione?collezione=high-performance' },
    { label: 'Collezione completa', to: '/collezione' },
    { label: 'Confronta modelli', to: '/confronta' },
  ] }] },
  { id: 'progetta', label: 'Progetta', to: '/progetta', cols: [{ title: 'Il tuo progetto', links: [
    { label: 'Inizia un progetto', to: '/progetta' },
    { label: 'Calcola le dimensioni', to: '/progetta?step=2' },
    { label: 'Carica la tua foto', to: '/visualizzatore' },
    { label: 'Richiedi i campioni', to: '/campioni' },
  ] }] },
  { id: 'settori', label: 'Settori', to: s('fiere-ed-eventi'), cols: sectorGroups.map((g) => ({
    title: g.label,
    links: sectors.filter((x) => x.group === g.id).map((x) => ({ label: x.nav, to: s(x.slug) })),
  })) },
  { id: 'qualita', label: 'Qualità', to: '/qualita', cols: [{ title: 'Qualità', links: [
    { label: 'Manifattura italiana', to: '/qualita#manifattura' },
    { label: 'Documentazione', to: '/qualita#documentazione' },
    { label: 'Scelta guidata', to: '/qualita#scelta' },
    { label: 'Prezzi trasparenti', to: '/qualita#prezzi' },
  ] }] },
  { id: 'professionisti', label: 'Professionisti', to: '/professionisti', cols: [{ title: 'Per chi progetta', links: [
    { label: 'Listino professionale', to: '/professionisti#listino' },
    { label: 'Invia un progetto', to: '/professionisti#progetto' },
    { label: 'Installatori', to: '/professionisti#installatori' },
  ] }] },
  { id: 'ispirazione', label: 'Ispirazione', to: '/progetti', cols: [{ title: 'Ispirazione', links: [
    { label: 'Ambientazioni', to: '/progetti' },
    { label: 'Visualizzatore foto', to: '/visualizzatore' },
  ] }] },
];

export const marquee = [
  `Manifattura italiana${site.supplier.show ? ' ' + site.supplier.name : ''}`,
  'Taglio su misura',
  "Nessun minimo d'ordine",
  'Campioni gratuiti',
  'Prezzi trasparenti al m²',
  'Rete di posatori in costruzione',
  'Configuratore con preventivo immediato',
];

export const demoNote =
  'Valori dimostrativi: specifiche, prezzi e tempi saranno sostituiti dal catalogo validato dal produttore.';
