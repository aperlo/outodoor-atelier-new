import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Indirizzo pubblico del sito: impostare SITE_URL in produzione.
// Su Netlify, in assenza di SITE_URL, viene usata la variabile URL fornita dalla piattaforma.
const site = process.env.SITE_URL || process.env.URL || 'http://localhost:4321';

// Pagine di servizio escluse dalla sitemap.
const excluded = ['/grazie', '/carrello', '/confronta', '/404'];

export default defineConfig({
  site,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    preact(),
    sitemap({ filter: (page) => !excluded.some((p) => new URL(page).pathname.startsWith(p)) }),
  ],
  vite: { plugins: [tailwindcss()] },
});
