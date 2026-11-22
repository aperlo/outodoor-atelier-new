// Impostazioni del sito. Tutto ciò che cambia al lancio si modifica qui.

export const site = {
  name: 'The Outdoor Atelier',
  claim: 'Il tuo spazio. La tua natura. A modo tuo.',

  // Marchio del produttore. Mettere `show: false` finché non c'è un'autorizzazione scritta all'uso.
  // `docsUrl`: pagina pubblica delle schede tecniche del produttore. Vuoto = nessun link.
  // I documenti del singolo modello si indicano in products.json, campo `documents`
  // (es. { "label": "Scheda tecnica", "url": "https://…" }). Mai link inventati.
  supplier: { show: true, name: 'Limonta Sport', docsUrl: '' },

  // false = il sito chiede ai motori di ricerca di non indicizzare (meta robots + robots.txt).
  // Portare a true solo con catalogo, prezzi e pagine legali definitivi.
  indexable: false,

  // Recensioni di esempio (src/data/reviews.json, "example": true): mostrano dove e come
  // compariranno le recensioni. Escono sempre con l'etichetta ESEMPIO, solo finché non c'è
  // nessuna recensione vera e solo mentre il catalogo è dimostrativo. false = mai.
  showExampleReviews: true,

  // false = nessuna etichetta di disponibilità sulle schede (non esiste magazzino).
  showAvailability: false,
  deliveryNote: 'Su ordinazione · tempi di consegna confermati alla richiesta',

  // Dati societari: obbligatori prima della pubblicazione. Finché `legalName` è vuoto,
  // le pagine legali mostrano l'avviso "bozza" e il piè di pagina non riporta i dati.
  company: {
    legalName: '',
    address: '',
    vatId: '',
    rea: '',
    email: '',
    pec: '',
    phone: '',
  },

  // Destinazione dei moduli. '/' = Netlify Forms (modulo "richiesta").
  formEndpoint: '/',
  formName: 'richiesta',
};

export const supplierName = site.supplier.show ? site.supplier.name : '';
export const companyReady = site.company.legalName.trim().length > 0;
