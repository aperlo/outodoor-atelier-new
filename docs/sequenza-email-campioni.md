# Sequenza di email dopo la richiesta campioni

Parte solo per chi, nel modulo dei campioni, spunta «mandatemi 3 email di consigli». La funzione `netlify/functions/submission-created.mjs` iscrive quel contatto alla lista Brevo indicata in `BREVO_LIST_ID`; in Brevo si crea un'automazione «Contatto aggiunto alla lista» con le tre email qui sotto.

Regole: niente numeri senza fonte, nessuna urgenza inventata, link di disiscrizione in ogni email (Brevo lo aggiunge da solo).

---

## Email 1 · il giorno dopo la richiesta

**Oggetto:** Come guardare i campioni quando arrivano

Ciao {{ contact.NOME }},

i campioni sono in preparazione. Quando arrivano, tre prove da fare prima di decidere:

1. **Alla luce vera.** Appoggiali nello spazio che vuoi rivestire, al mattino e al tramonto. Il verde cambia molto con la luce.
2. **A piedi nudi.** Se il prato è per bordo piscina o per i bambini, la morbidezza conta più dell'aspetto.
3. **Con la mano contropelo.** Una fibra che si rialza subito resta bella più a lungo dove si cammina tanto.

Se hai dubbi tra due modelli, rispondi a questa email con una foto del tuo spazio.

The Outdoor Atelier

---

## Email 2 · 4 giorni dopo

**Oggetto:** Quanto materiale ti serve davvero

Ciao {{ contact.NOME }},

i rotoli sono larghi 2 metri. Per questo uno spazio largo 3 metri richiede due teli affiancati e una giunta, e il materiale da ordinare è più della superficie.

Il configuratore fa il calcolo per te: inserisci le misure delle varie zone e ti dice materiale, giunte, accessori necessari e prezzo, spedizione compresa.

[Calcola il tuo progetto]({{ params.SITE_URL }}/progetta)

The Outdoor Atelier

---

## Email 3 · 9 giorni dopo

**Oggetto:** Posarlo da te o farlo posare?

Ciao {{ contact.NOME }},

su balconi e terrazzi piccoli la posa fai da te è alla portata: kit, guida illustrata e un pomeriggio. Su giardini da preparare (via l'erba vecchia, sottofondo, livellamento) conviene un installatore.

Nel configuratore, al passo «Posa», inserisci il CAP: vedi una stima indicativa per la tua zona e puoi chiedere un sopralluogo.

Quando sei pronto, dal carrello invii la richiesta d'ordine: un consulente conferma tutto prima che tu paghi qualcosa.

The Outdoor Atelier
