// Analytics con PostHog, attive solo se su Netlify è impostata PUBLIC_POSTHOG_KEY.
// Configurazione senza cookie e senza memoria nel browser (persistence: 'memory'):
// conta visite ed eventi, non riconosce lo stesso visitatore tra una visita e l'altra.
// Nessuna registrazione delle sessioni.

const key = import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined;
const host = (import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com';

type Pending = { name: string; props: Record<string, unknown> };
const queue: Pending[] = [];
let capture: ((name: string, props: Record<string, unknown>) => void) | null = null;

// Gli eventi emessi prima del caricamento vengono messi in coda.
window.addEventListener('oa:track', (e) => {
  const { name, props } = (e as CustomEvent<Pending>).detail;
  if (capture) capture(name, props);
  else if (key) queue.push({ name, props });
});

if (key) {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: host,
      persistence: 'memory',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false,
      disable_session_recording: true,
      disable_surveys: true,
    });
    // sendBeacon: l'evento parte anche se subito dopo la pagina cambia (es. invio di un modulo).
    capture = (name, props) => posthog.capture(name, props, { transport: 'sendBeacon' });
    queue.splice(0).forEach(({ name, props }) => capture!(name, props));
  });
}
