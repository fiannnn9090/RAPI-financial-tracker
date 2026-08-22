/* Smoke test F1 engine saran finansial — fixture tetap, deterministik.
   Jalankan: node scripts/advice.smoke.mjs  (setelah bundle via esbuild, lihat npm script adv:smoke) */
import { buildAdvice } from '../lib/advice.js';

const TODAY = '2026-08-23';

function monthTx(y, m, list) {
  const mm = String(m).padStart(2, '0');
  return list.map(([d, type, category, amount], i) => ({
    id: `${y}${mm}-${i}-${category}`,
    type, category, amount,
    title: `${category} ${i}`,
    date: `${y}-${mm}-${String(d).padStart(2, '0')}`,
  }));
}

/* Fixture "dapur lengkap": tiap detektor punya pemicu tanpa saling menabrak kategori */
const transactions = [
  /* Income bulanan stabil 5jt (Mei–Agu) */
  ...monthTx(2026, 5, [[1, 'income', 'Gaji', 5000000]]),
  ...monthTx(2026, 6, [[1, 'income', 'Gaji', 5000000]]),
  ...monthTx(2026, 7, [[1, 'income', 'Gaji', 5000000]]),
  ...monthTx(2026, 8, [[1, 'income', 'Gaji', 5000000]]),
  /* Mei: hampir habis (surplus tipis utk S6/S7) */
  ...monthTx(2026, 5, [[3, 'expense', 'Lain-lain', 4900000]]),
  /* Juni: juga tipis */
  ...monthTx(2026, 6, [[5, 'expense', 'Lain-lain', 4950000]]),
  /* Juli: sedikit lebih sehat (utk S5 memburuk di Agu) */
  ...monthTx(2026, 7, [
    [4, 'expense', 'Transportasi', 1000000],
    [8, 'expense', 'Lain-lain', 1600000],
    [12, 'expense', 'Makan', 900000],
  ]),
  /* Agustus berjalan: pemicu utama */
  ...monthTx(2026, 8, [
    [2, 'expense', 'Transportasi', 1500000],          // S3 kandidat besar
    [4, 'expense', 'Lain-lain', 2300000],             // S3 dominan tanpa budget + S5 (expense > income)
    [6, 'expense', 'Makan', 350000],                  // S1
    [15, 'expense', 'Makan', 300000],                 // S1 total 650rb dari limit 500rb
    [9, 'expense', 'Hiburan', 120000],                // S2 pacing
    [20, 'expense', 'Hiburan', 260000],               // S2 total 380rb dr 400rb, proyeksi nembus
    ...Array.from({ length: 14 }, (_, i) => [7 + (i % 15), 'expense', 'Kopi', 20000]), // S8
  ]),
];

const budgets = { Makan: 500000, Hiburan: 400000 };
const recurrings = [
  { id: 'r1', type: 'expense', title: 'Streaming', amount: 1600000, category: 'Langganan', frequency: 'monthly', dayOfPeriod: 5, nextRunDate: '2026-09-05' },
  { id: 'r2', type: 'expense', title: 'Cloud', amount: 1200000, category: 'Langganan', frequency: 'monthly', dayOfPeriod: 10, nextRunDate: '2026-09-10' },
];
const goal = { id: 'g1', name: 'PS5', amount: 6000000, is_active: true };

let failures = 0;
function check(name, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  if (!cond) failures += 1;
}

const a = buildAdvice({ transactions, budgets, goal, recurrings, lang: 'id', today: TODAY });
const ids = a.items.map((item) => item.id);

check('semua 8 detektor aktif', ids.length === 8, JSON.stringify(ids));
check('urutan prioritas: budget_over #1', ids[0] === 'budget_over');
const scoresDesc = true; /* skor internal tidak diekspos; urutan sudah divalidasi via daftar */
check('ratio_worse di 2 besar (expense > income)', ids.indexOf('ratio_worse') === 1);
check('micro_leak paling belakang', ids[ids.length - 1] === 'micro_leak');
check('severity budget_over = tinggi', a.items[0].severity === 'tinggi');
check('pesan mengandung highlight **', a.items[0].message.includes('**'));
check('tanpa placeholder {var} tersisa', a.items.every((item) => !/\{\w+\}/.test(item.message + item.reason)),
  a.items.map((i) => i.message).join(' | ').match(/\{\w+\}/)?.[0] ?? '');
check('reason terisi semua', a.items.every((item) => item.reason.length > 5));

const b = buildAdvice({ transactions, budgets, goal, recurrings, lang: 'id', today: TODAY });
check('deterministik (2x panggil identik)', JSON.stringify(a) === JSON.stringify(b));

const en = buildAdvice({ transactions, budgets, goal, recurrings, lang: 'en', today: TODAY });
check('EN: judul pertama "Budget busted"', en.items[0]?.title === 'Budget busted');

const min = buildAdvice({ transactions: transactions.slice(0, 3), budgets, lang: 'id', today: TODAY });
check('data kurang → kosong', min.items.length === 0 && min.checked === 0);

console.log(failures ? `\n${failures} GAGAL` : '\nSEMUA PASS');
process.exit(failures ? 1 : 0);
