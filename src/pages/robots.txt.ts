import type { APIRoute } from 'astro';
import { site } from '../config/site';

// Finché `site.indexable` è false, i motori di ricerca vengono tenuti fuori da tutto il sito.
export const GET: APIRoute = ({ site: base }) => {
  const body = site.indexable
    ? `User-agent: *\nAllow: /\nDisallow: /carrello\nDisallow: /grazie\nDisallow: /confronta\n\nSitemap: ${new URL('sitemap-index.xml', base).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
