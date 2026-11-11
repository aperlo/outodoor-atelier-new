// Notifica breve in basso a destra. Nessuna dipendenza.
export function toast(message: string, link?: { href: string; label: string }) {
  let host = document.getElementById('toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast-host';
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  if (link) {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.label;
    el.appendChild(a);
  }
  host.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}
