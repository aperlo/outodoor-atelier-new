# The Outdoor Atelier

Sito di The Outdoor Atelier: catalogo di erba sintetica, configuratore con preventivo, box campioni, visualizzatore foto e richiesta d'ordine.

È un sito **statico**: ogni pagina è HTML già pronto, senza server né database. I moduli sono ricevuti da Netlify Forms. Ricostruito a novembre 2026 a partire dal prototipo Emergent, da cui non dipende più.

## Avvio

Serve Node.js 22 o successivo.

```bash
npm install
```

```bash
npm run dev
```

Il sito è su http://localhost:4321. Per provare la versione di produzione:

```bash
npm run build
```

```bash
npm run preview
```

In locale i moduli non inviano nulla: la richiesta è solo simulata e scritta nella console del browser.

## Dove si cambia cosa

| Cosa | File |
|---|---|
| Prodotti (nome, prezzo, specifiche, immagine) | `src/data/products.json` |
| Accessori | `src/data/accessories.json` |
| IVA, formati, sfrido di base, spedizione, zone di posa, sconti professionali | `src/data/config.json` |
| Settori, ambientazioni, menu, testi ricorrenti, immagini | `src/data/content.ts` |
| Toni di verde, gruppi "Uso" e morbidezza dei filtri | `src/data/content.ts` (`tones`, `useGroups`, `softnessLabels`) |
| Tono di verde e documenti tecnici di ogni modello | `src/data/products.json` (`tone`, `documents`) |
| Nome, marchio del produttore, indicizzazione, dati societari | `src/config/site.ts` |
| Colori e caratteri | `src/styles/global.css` |
| Calcolo di preventivo, spedizione, sfrido e giunte | `src/lib/quote.ts` |
| Intestazioni di sicurezza e reindirizzamenti | `netlify.toml` |

Aggiungere un prodotto in `products.json` crea da solo la sua pagina `/superfici/<slug>` e lo inserisce in catalogo, configuratore, campioni e confronto. Lo stesso vale per i settori in `content.ts`.

## Struttura

```
src/
  config/site.ts          impostazioni del sito
  data/                   catalogo, parametri e contenuti
  lib/                    calcolo preventivo, stato del carrello, invio moduli
  layouts/Base.astro      pagina tipo: metadati, intestazione, piè di pagina
  components/             parti statiche (scheda prodotto, moduli, apertura di pagina)
  components/islands/     parti interattive (configuratore, carrello, campioni, confronto, visualizzatore)
  scripts/site.ts         contatori, filtri del catalogo, invio dei moduli statici
  pages/                  una pagina per file; [slug] genera schede e settori
```

Carrello, campioni, confronto, ultimo CAP e vista della collezione sono salvati nel browser del visitatore (`oa-cart`, `oa-samples`, `oa-compare`, `oa-cap`, `oa-view`). Il sito non usa cookie.

## Esperienza di navigazione

- **Collezione come tela** (`/collezione`): le superfici sono disposte su un piano che si esplora trascinando o scorrendo, con zoom (pulsanti, Ctrl + rotella, tasti + e −). Un interruttore passa alla **griglia con prezzi**. In basso, barra con Menu, Filtra e Campioni.
- **Filtri sensoriali**: Morbidezza, Uso (Giardino, Piscina, Terrazza, Animali, Commerciale), Tono di verde. Funzionano su tela e griglia; sulla tela le superfici escluse restano visibili ma spente. Gli indirizzi `/collezione?collezione=…` e `?uso=…` aprono la collezione già filtrata.
- **Mini-carrello a scomparsa**: si apre dall'icona del carrello e dopo "Aggiungi al carrello", senza lasciare la pagina.
- **Campioni sempre a portata**: pulsante fisso in basso a destra su quasi tutte le pagine, e in apertura della home.
- **Home a capitoli** (I–V) con indice, e prima/dopo trascinabile che rimanda al visualizzatore completo.
- **Scheda prodotto**: misure libere dello spazio, calcolo dei teli da 2 m e della giunta, spedizione e totale con IVA in tempo reale dal CAP.
- **Documenti tecnici**: link al documento quando in `products.json` c'è l'indirizzo (es. `{ "label": "Scheda tecnica", "url": "https://…" }`), altrimenti "disponibile su richiesta". Il link generale alle schede del produttore si imposta in `src/config/site.ts` (`supplier.docsUrl`).

## Recensioni

Le recensioni stanno in `src/data/reviews.json` e compaiono in home e in ogni scheda prodotto (prima quelle del modello).

- Oggi il file contiene solo **esempi** (`"example": true`): servono a vedere dove e come compariranno. Escono sempre con l'etichetta ESEMPIO e un avviso, e non finiscono mai nei dati strutturati per i motori di ricerca.
- Per aggiungere una recensione vera: nuova voce con `"example": false`, nome come lo autorizza il cliente (es. "Marta B."), città, spazio, `product` (lo slug del modello), `rating` da 1 a 5, `text` con le sue parole e `date`. Conservare la prova (email o messaggio del cliente).
- **Appena c'è una recensione vera, gli esempi spariscono da soli** e compare la media calcolata solo sulle recensioni vere. Gli esempi spariscono anche quando `demo_values` diventa `false`, oppure subito con `showExampleReviews: false` in `src/config/site.ts`.
- Mai recensioni scritte da noi presentate come vere: è una pratica commerciale scorretta per il Codice del Consumo.

## Come funziona l'ordine

Non c'è pagamento online. Dal carrello il cliente invia una **richiesta d'ordine**; arriva come modulo, un consulente conferma disponibilità, tempi e spedizione e comunica come pagare. Gli indirizzi `/checkout` e `/pagamento/*` del prototipo rimandano al carrello.

## Misurazione e email (si accendono con le chiavi)

Tutto è già nel codice e resta spento finché su Netlify (Project configuration → Environment variables) non ci sono le variabili. Dopo averle aggiunte serve una nuova pubblicazione.

| Cosa | Variabili | Effetto |
|---|---|---|
| Statistiche di visita (PostHog, server UE, senza cookie) | `PUBLIC_POSTHOG_KEY` (facoltativa `PUBLIC_POSTHOG_HOST`, predefinito `https://eu.i.posthog.com`) | Pagine viste ed eventi `richiesta_inviata`, `campione_aggiunto`, `carrello_aggiunto`, con tipo, pagina e provenienza |
| Email di conferma al cliente (Brevo) | `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (mittente verificato), facoltativa `BREVO_SENDER_NAME` | Conferma automatica di richiesta campioni, d'ordine e consulenza |
| Sequenza di consigli dopo i campioni | anche `BREVO_LIST_ID` | Chi spunta il consenso facoltativo entra nella lista; l'automazione in Brevo manda le 3 email di `docs/sequenza-email-campioni.md` |

La provenienza di ogni contatto (utm o sito di arrivo, pagina d'ingresso, pagina della richiesta) arriva comunque in Netlify Forms, anche senza analytics. Per misurare una campagna basta aggiungere al link `?utm_source=instagram&utm_medium=social&utm_campaign=nome`.

I tre numeri da guardare: richieste di campioni per canale, richieste campioni che diventano richieste d'ordine, costo per richiesta (spesa della campagna diviso richieste).

## Pubblicazione su Netlify

1. Collega il repository a Netlify: comando di build e cartella di pubblicazione sono già in `netlify.toml`.
2. Imposta la variabile `SITE_URL` con il dominio definitivo (es. `https://www.esempio.it`). Serve per indirizzi canonici e sitemap.
3. Dopo la prima pubblicazione, in **Forms** compare il modulo `richiesta`: attiva la notifica via email verso la casella che deve ricevere le richieste.
4. Collega il dominio.

Ogni richiesta ha un campo `kind` che dice di che tipo è (campioni, consulenza, richiesta d'ordine, professionisti…) e un campo `payload` con i dettagli del progetto in formato JSON.

## Prima di aprire al pubblico

- [ ] Compilare i dati societari in `src/config/site.ts` (`company`). Finché sono vuoti, le pagine legali mostrano l'avviso di bozza.
- [ ] Far rivedere a un legale `privacy`, `cookie` e `condizioni-di-vendita` e completare le parti tra parentesi quadre.
- [ ] Ottenere l'autorizzazione scritta all'uso del marchio del produttore, oppure mettere `supplier.show` a `false`.
- [ ] Sostituire il catalogo dimostrativo con quello validato e mettere `demo_values` a `false` in `config.json`: spariscono gli avvisi sui valori dimostrativi.
- [ ] Verificare tariffe di spedizione e zone di posa in `config.json`.
- [ ] Sostituire le immagini di Unsplash e Pexels con fotografie proprie salvate in `public/`, poi togliere i due domini dalla `Content-Security-Policy` in `netlify.toml`.
- [ ] Provare l'invio di un modulo sul sito pubblicato e controllare che la notifica arrivi.
- [ ] Solo alla fine: `indexable: true` in `src/config/site.ts`, per farsi trovare dai motori di ricerca.

## Differenze rispetto al prototipo Emergent

- Pagine generate in HTML statico: testi e prezzi sono leggibili dai motori di ricerca senza eseguire JavaScript.
- Nessun server, nessun database, nessun cookie.
- Pagamento con carta rimosso: al suo posto la richiesta d'ordine.
- Niente etichette "Disponibile a magazzino": il magazzino non esiste, i tempi si confermano alla richiesta.
- Le ambientazioni non riportano più località e metrature, perché non sono installazioni realizzate.
- Lo sfrido suggerito tiene conto della larghezza dei teli (2 m), non è più fisso al 5%.
- Aggiunte pagine legali in bozza, consenso privacy nei moduli, intestazioni di sicurezza, sitemap e robots.
- Non ricostruiti: le animazioni allo scorrimento, la tabella di confronto dentro il configuratore.
