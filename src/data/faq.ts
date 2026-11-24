// Domande frequenti. Risposte oneste: niente numeri senza fonte, niente promesse sui tempi.
// Le specifiche dei singoli modelli rimandano alla documentazione del produttore.

export interface Faq {
  q: string;
  a: string;
  /** In home si mostrano solo le domande con home: true. */
  home?: boolean;
}

export const faqs: Faq[] = [
  {
    q: "D'estate si scalda?",
    a: "Sì. Al sole pieno l'erba sintetica diventa più calda del prato naturale, come la pietra o il legno di un terrazzo. Nelle ore più calde aiuta una sciacquata con la gomma; nelle zone d'ombra il problema quasi non si pone. Per bordi piscina e bambini scegli modelli chiari e morbidi e chiedici un campione da provare al sole.",
    home: true,
  },
  {
    q: 'E le microplastiche?',
    a: "Il tema riguarda soprattutto i granuli di gomma usati come intaso nei campi sportivi, oggi limitati dal Regolamento (UE) 2023/2055. Nei giardini e nei terrazzi consigliamo intaso di sabbia silicea, non granuli di plastica. Le informazioni su fibre e fine vita di ogni modello le pubblichiamo solo quando le fornisce il produttore.",
    home: true,
  },
  {
    q: 'Va bene con il cane?',
    a: "Sì: si risciacqua con acqua, le deiezioni solide si tolgono come su un prato vero e non c'è fango. Per le zone dove il cane torna sempre, una pulizia periodica con un detergente enzimatico per superfici esterne evita gli odori. Il supporto drenante fa scorrere l'acqua sotto il manto.",
    home: true,
  },
  {
    q: "Dove va l'acqua quando piove?",
    a: "Attraverso i fori del supporto, nel terreno sotto. Su piastrelle e massetto serve una pendenza che porti l'acqua agli scarichi, e un materassino drenante aiuta a farla defluire più in fretta.",
    home: true,
  },
  {
    q: 'Posso posarlo da solo?',
    a: "Su balconi e terrazzi piccoli sì, con il kit di posa e la guida illustrata. Su giardini grandi o terreni da preparare conviene un installatore: il configuratore ti mostra una stima di posa per la tua zona e puoi chiedere un sopralluogo.",
  },
  {
    q: "C'è un minimo d'ordine?",
    a: "No. Tagliamo su misura anche pochi metri quadri. I teli sono larghi 2 metri: per spazi più larghi si affiancano e si uniscono con nastro e collante, e il calcolo lo fa il configuratore.",
  },
  {
    q: 'I campioni sono davvero gratuiti?',
    a: "Sì: fino a 4 campioni, spediti a casa, senza impegno d'acquisto. Servono a vedere il colore alla luce del tuo spazio e a toccare la fibra prima di scegliere.",
  },
  {
    q: 'Quanto dura?',
    a: "Dipende dal modello, dall'esposizione e dall'uso. La durata e le eventuali garanzie del produttore le indichiamo nella scheda di ogni modello solo quando sono documentate. In ogni caso vale la garanzia legale di conformità di due anni.",
  },
  {
    q: 'Come si paga?',
    a: "Non paghi nulla online. Invii la richiesta d'ordine, un consulente conferma disponibilità, tempi e spedizione e ti manda le istruzioni per il pagamento.",
  },
];
