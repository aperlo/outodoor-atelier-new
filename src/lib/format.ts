export const eur = (n: number, digits = 2) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);

export const num = (n: number, digits = 1) =>
  new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits }).format(n);

export const uid = () => Math.random().toString(36).slice(2, 10);

export const isCap = (v: string | null | undefined) => /^\d{5}$/.test(v ?? '');
