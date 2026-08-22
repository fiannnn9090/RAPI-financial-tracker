/* Smoke test F2 engine skor kesehatan finansial — fixture tetap, deterministik.
   Jalankan via bundle esbuild (pola advice.smoke.mjs). */
import { buildScore, previousMonthEnd, levelFor } from '../lib/score.js';

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

/* Fixture IDEAL: nabung 60%, budget aman, rutin ringan, buffer tebal, momentum baik */
function idealTx() {
  const tx = [];
  for (const [y, m] of [[2026, 5], [2026, 6], [2026, 7], [2026, 8]]) {
    tx.push(...monthTx(y, m, [
      [1, 'income', 'Gaji', 5000000],
      [3, 'expense', 'Makan & Minum', 1200000],
      [10, 'expense', 'Transportasi', 400000],
      [20, 'expense', 'Hiburan', 400000],
    ]));
  }
  return tx;
}
const idealBudgets = { 'Makan & Minum': 1500000, Transportasi: 500000, Hiburan: 500000 };
const idealRecurrings = [{ type: 'expense', title: 'Streaming', amount: 150000, frequency: 'monthly' }];

/* Fixture BURUK: habis semua, budget jebol, rutin berat, deficit memburuk */
function badTx() {
  const tx = [];
  for (const [y, m] of [[2026, 5], [2026, 6], [2026, 7], [2026, 8]]) {
    tx.push(...monthTx(y, m, [
      [1, 'income', 'Gaji', 5000000],
      [3, 'expense', 'Makan & Minum', 2600000],
      [10, 'expense', 'Transportasi', 900000],
      [20, 'expense', 'Hiburan', 1800000],
    ]));
  }
  return tx;
}
const badBudgets = { 'Makan & Minum': 1000000, Transportasi: 300000, Hiburan: 500000 };
const badRecurrings = [
  { type: 'expense', title: 'Kos', amount: 2500000, frequency: 'monthly' },
  { type: 'expense', title: 'Cicilan', amount: 1300000, frequency: 'monthly' },
];

let failures = 0;
function check(name, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  if (!cond) failures += 1;
}

const good = buildScore({ transactions: idealTx(), budgets: idealBudgets, recurrings: idealRecurrings, today: TODAY });
check('ideal → skor ≥85', good.score >= 85, `score=${good.score}`);
check('ideal → level sehat', good.level === 'sehat');
check('ideal → 5 komponen penuh bobot', good.basis === 5 && good.components.reduce((s, c) => s + c.max, 0) === 100);

const bad = buildScore({ transactions: badTx(), budgets: badBudgets, recurrings: badRecurrings, today: TODAY });
check('buruk → skor <40', bad.score < 40, `score=${bad.score}`);
check('buruk → level perhatian', bad.level === 'perhatian');

/* Tanpa budget: renormalisasi, tidak dihukum */
const noBudget = buildScore({ transactions: idealTx(), budgets: {}, recurrings: idealRecurrings, today: TODAY });
check('tanpa budget → basis 4', noBudget.basis === 4);
check('renormalisasi adil (≥80)', noBudget.score >= 80, `score=${noBudget.score}`);
const sumMax = noBudget.components.reduce((s, c) => s + c.max, 0);
check('bobot renormalisasi = 75', sumMax === 75);

/* Data kurang → null */
const thin = buildScore({ transactions: idealTx().slice(0, 3), budgets: {}, recurrings: [], today: TODAY });
check('data kurang → enoughData false', !thin.enoughData && thin.score === null);

/* Trend: previousMonthEnd benar & skor historis bisa dihitung */
check('previousMonthEnd', previousMonthEnd(TODAY) === '2026-07-31');
const hist = buildScore({ transactions: idealTx(), budgets: idealBudgets, recurrings: idealRecurrings, today: previousMonthEnd(TODAY) });
check('skor bulan lalu terhitung', hist.enoughData && typeof hist.score === 'number', `prev=${hist.score}`);

/* Determinisme */
const again = buildScore({ transactions: idealTx(), budgets: idealBudgets, recurrings: idealRecurrings, today: TODAY });
check('deterministik (2x identik)', JSON.stringify(good) === JSON.stringify(again));

/* Band level */
check('band 80/60/0', levelFor(80) === 'sehat' && levelFor(79) === 'waspada' && levelFor(60) === 'waspada' && levelFor(59) === 'perhatian');

console.log(failures ? `\n${failures} GAGAL` : '\nSEMUA PASS');
process.exit(failures ? 1 : 0);
