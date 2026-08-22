/* Kurs mata uang untuk TAMPILAN saja — database & seluruh penyimpanan tetap IDR.
   Sumber: fawazahmed0 currency-api (jsDelivr → mirror Cloudflare Pages),
   cadangan open.er-api.com. Fetch native, tanpa dependency.
   Cache di localStorage, refresh maksimal sekali per 24 jam. */

export const CURRENCIES = [
  ['IDR', 'Rupiah (IDR)'],
  ['USD', 'US Dollar (USD)'],
  ['EUR', 'Euro (EUR)'],
  ['SGD', 'Dolar Singapura (SGD)'],
  ['MYR', 'Ringgit Malaysia (MYR)'],
  ['JPY', 'Yen Jepang (JPY)'],
];

const CACHE_KEY = 'rapi.fx.rates';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const REQUIRED_RATES = ['usd', 'eur', 'sgd', 'myr', 'jpy'];

export function loadCachedFx() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.rates !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveFxCache(payload) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch {}
}

export function isStale(cache) {
  if (!cache?.fetchedAt) return true;
  return Date.now() - cache.fetchedAt > MAX_AGE_MS;
}

/* Normalisasi & validasi: kunci lowercase, angka positif, semua kode wajib ada */
export function validateRates(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const out = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) out[key.toLowerCase()] = value;
  }
  return REQUIRED_RATES.every((code) => out[code] > 0) ? out : null;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* Mengambil rates relatif terhadap IDR dari rantai sumber */
export async function fetchRates() {
  const sources = [
    async () => {
      const json = await fetchJson('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/idr.json');
      return { rates: validateRates(json?.idr), date: json?.date ?? null };
    },
    async () => {
      const json = await fetchJson('https://latest.currency-api.pages.dev/v1/currencies/idr.json');
      return { rates: validateRates(json?.idr), date: json?.date ?? null };
    },
    async () => {
      const json = await fetchJson('https://open.er-api.com/v6/latest/IDR');
      return { rates: validateRates(json?.rates), date: typeof json?.time_last_update_utc === 'string' ? json.time_last_update_utc.slice(5, 16) : null };
    },
  ];
  let lastError = null;
  for (const source of sources) {
    try {
      const { rates, date } = await source();
      if (rates) return { rates, date };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('Semua sumber kurs gagal');
}

/* Sekali panggil: pakai cache bila masih segar, kalau stale/absen → fetch + simpan.
   Resolve payload terbaru, atau null kalau fetch gagal (pemanggil menentukan fallback). */
export async function refreshFxCache(current) {
  const cache = current ?? loadCachedFx();
  if (!isStale(cache)) return cache;
  try {
    const { rates, date } = await fetchRates();
    const payload = { rates, date, fetchedAt: Date.now() };
    saveFxCache(payload);
    return payload;
  } catch {
    return null;
  }
}

/* Format singkat gaya lama IDR (Rp240rb / Rp4,2jt) */
export function fmtIdrShort(n) {
  const value = Math.round(Number(n));
  if (value >= 1e6) return `Rp${(value / 1e6).toFixed(1).replace('.', ',').replace(',0', '')}jt`;
  if (value >= 1000) return `Rp${Math.round(value / 1000)}rb`;
  return `Rp${value}`;
}

/* Formatter uang aktif. Konversi murni tampilan; bila kurs tidak valid
   otomatis jatuh ke tampilan IDR apa adanya (rate efektif 1). */
export function makeMoneyFormatter(code, rates) {
  const requested = String(code ?? 'IDR').toUpperCase();
  const rawRate = Number(rates?.[requested.toLowerCase()]);
  const ok = requested === 'IDR' || (Number.isFinite(rawRate) && rawRate > 0);
  const rate = ok ? (requested === 'IDR' ? 1 : rawRate) : 1;
  const active = ok ? requested : 'IDR';
  let fullFmt = null;
  let shortFmt = null;
  return {
    code: active,
    ok,
    format(amount) {
      if (!fullFmt) fullFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: active, maximumFractionDigits: active === 'JPY' ? 0 : 2 });
      return fullFmt.format(Number(amount) * rate);
    },
    formatShort(amount) {
      const value = Number(amount);
      if (active === 'IDR') return fmtIdrShort(value);
      if (!shortFmt) shortFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: active, notation: 'compact', maximumFractionDigits: 1 });
      return shortFmt.format(value * rate);
    },
  };
}
