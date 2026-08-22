/* Export & import CSV transaksi — tanpa dependency.
   Format kolom terkontrol: tanggal,tipe,kategori,judul,nominal
   (ISO date, income|expense, angka polos). Escaper & parser RFC4180 mini.
   Pesan error validasi bilingual via tl(lang) — kontrak kolom tetap Indonesia. */

import { tl } from './i18n';

export function escapeCsvField(value) {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function dupKeyOf(tx) {
  return `${tx.date}|${tx.type}|${tx.category}|${tx.title}|${Number(tx.amount)}`;
}

export function transactionsToCsv(transactions) {
  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const lines = [['tanggal', 'tipe', 'kategori', 'judul', 'nominal'].join(',')];
  for (const tx of sorted) {
    lines.push([tx.date, tx.type, tx.category, tx.title, String(tx.amount)].map(escapeCsvField).join(','));
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

export function parseCsv(text) {
  let src = String(text);
  if (src.charCodeAt(0) === 0xFEFF) src = src.slice(1);
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      row.push(field);
      field = '';
      if (!(row.length === 1 && row[0] === '')) rows.push(row);
      row = [];
      if (ch === '\r' && src[i + 1] === '\n') i++;
    } else field += ch;
  }
  row.push(field);
  if (!(row.length === 1 && row[0] === '')) rows.push(row);
  return rows;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(s) {
  if (!ISO_DATE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

const REQUIRED_COLUMNS = ['tanggal', 'tipe', 'kategori', 'judul', 'nominal'];

export function csvToTransactions(text, existingKeys = new Set(), lang = 'id') {
  /* Kontrak format kolom TETAP Indonesia (tanggal,tipe,...) di semua bahasa
     supaya file ekspor lama tetap bisa diimpor ulang — hanya pesan error yang
     diterjemahkan via tl(lang, ...). */
  const rows = parseCsv(text);
  const invalid = [];
  const valid = [];
  let duplicateCount = 0;
  if (!rows.length) return { headerOk: false, valid, invalid: [{ row: 0, reason: tl(lang, 'csvErr.empty') }], duplicateCount };
  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const idx = Object.fromEntries(REQUIRED_COLUMNS.map((col) => [col, header.indexOf(col)]));
  const missing = REQUIRED_COLUMNS.filter((col) => idx[col] < 0);
  if (missing.length) {
    return { headerOk: false, valid, invalid: [{ row: 0, reason: tl(lang, 'csvErr.header') }], duplicateCount };
  }
  rows.slice(1).forEach((cells, i) => {
    const rowNum = i + 2;
    const get = (col) => (idx[col] < cells.length ? cells[idx[col]].trim() : '');
    const date = get('tanggal');
    const type = get('tipe').toLowerCase();
    const category = get('kategori');
    const title = get('judul');
    const rawAmount = get('nominal');
    const problems = [];
    if (!isValidIsoDate(date)) problems.push(tl(lang, 'csvErr.badDate'));
    if (type !== 'income' && type !== 'expense') problems.push(tl(lang, 'csvErr.badType'));
    if (!category || category.length > 60) problems.push(tl(lang, 'csvErr.badCategory'));
    if (!title || title.length > 120) problems.push(tl(lang, 'csvErr.badTitle'));
    if (!/^\d+(\.\d{1,2})?$/.test(rawAmount) || !(Number(rawAmount) > 0)) problems.push(tl(lang, 'csvErr.badAmount'));
    if (problems.length) {
      invalid.push({ row: rowNum, reason: problems.join('; ') });
      return;
    }
    const amount = Number(rawAmount);
    const key = `${date}|${type}|${category}|${title}|${amount}`;
    if (existingKeys.has(key)) {
      duplicateCount++;
      return;
    }
    existingKeys.add(key);
    valid.push({ date, type, category, title, amount });
  });
  return { headerOk: true, valid, invalid, duplicateCount };
}
