/* F2 — Skor kesehatan finansial: satu angka 0-100 DETERMINISTIK dari 5 komponen
   berbobot (savings rate, budget adherence, beban rutin, buffer darurat, momentum).
   Murni recompute historis dari transaksi — tanpa tabel/skema baru. Komponen yang
   tidak relevan (mis. belum ada budget sama sekali) diskip dan bobotnya
   direnormalisasi proporsional, bukan dihukum (prinsip "thin file").
   Bukan nasihat investasi; hanya ringkasan kebiasaan. */

import { computeStats, hasEnoughData, shiftMonth, monthRange } from './advice';

export const SCORE_WEIGHTS = {
  savings: 35,
  budget: 25,
  recurring: 15,
  buffer: 15,
  momentum: 10,
};

function monthlyEquivalent(rule) {
  const amount = Number(rule.amount) || 0;
  return rule.frequency === 'weekly' ? amount * (52 / 12) : amount;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/* --- komponen a: savings rate rata-rata bulan penuh (maks 35)
   ≥20% = penuh · linier menuju 0 di titik 0% · negatif = 0.
   Fallback: bulan berjalan jika sudah ≥15 hari (user baru). */
function scoreSavings(stats) {
  const months = stats.lastMonths.filter((s) => s.income > 0);
  if (!months.length && stats.d >= 15 && stats.cur.income > 0) {
    months.push(stats.cur);
  }
  if (!months.length) return null;
  const avgRate = months.reduce((sum, s) => sum + (s.income - s.expense) / s.income, 0) / months.length;
  return { id: 'savings', score: clamp(avgRate / 0.2, 0, 1), raw: Math.round(avgRate * 100) };
}

/* --- komponen b: budget adherence (maks 25)
   Pasangan (kategori × window) aman bila spend ≤ limit; window = bulan lalu
   penuh + bulan berjalan to-date. Skip seluruh komponen saat tak ada budget. */
function scoreBudget(stats, budgets) {
  const entries = Object.entries(budgets).filter(([, limit]) => Number(limit) > 0);
  if (!entries.length) return null;
  let safe = 0;
  for (const [cat, limitRaw] of entries) {
    const limit = Number(limitRaw);
    if ((stats.prev.byCategory[cat] ?? 0) <= limit) safe += 1;
    if ((stats.cur.byCategory[cat] ?? 0) <= limit) safe += 1;
  }
  return { id: 'budget', score: safe / (entries.length * 2), raw: safe };
}

/* --- komponen c: beban rutin vs income (maks 15)
   ≤30% = penuh · 30-70% linier turun · >70% = 5/15. */
function scoreRecurring(stats, recurrings) {
  if (!recurrings.length || stats.avgIncome <= 0) return null;
  const burden = recurrings
    .filter((rule) => rule.type === 'expense')
    .reduce((sum, rule) => sum + monthlyEquivalent(rule), 0);
  if (burden <= 0) return null;
  const ratio = burden / stats.avgIncome;
  let frac;
  if (ratio <= 0.3) frac = 1;
  else if (ratio >= 0.7) frac = 5 / SCORE_WEIGHTS.recurring;
  else frac = 1 - ((ratio - 0.3) / 0.4) * (10 / SCORE_WEIGHTS.recurring);
  return { id: 'recurring', score: clamp(frac, 0, 1), raw: Math.round(ratio * 100) };
}

/* --- komponen d: buffer darurat (maks 15)
   coverage = surplus 3 bln ÷ pengeluaran bulanan; ≥3× = penuh · ≤0,25× = 0 · linier. */
function scoreBuffer(stats) {
  if (!stats.buffer.monthlyExpense || stats.buffer.surplus3m == null) return null;
  const coverage = stats.buffer.surplus3m / stats.buffer.monthlyExpense;
  const frac = coverage >= 3 ? 1 : clamp((coverage - 0.25) / (3 - 0.25), 0, 1);
  return { id: 'buffer', score: frac, raw: Math.round(coverage * 10) / 10 };
}

/* --- komponen e: momentum arah pengeluaran (maks 10)
   Membaik = penuh · setara = 8/10 · memburuk tapi masih surplus = 5/10 ·
   memburuk & deficit = 0. */
function scoreMomentum(stats) {
  if (stats.prev.expense <= 0 || stats.cur.income <= 0 || stats.cur.expense <= 0) return null;
  const curRatio = stats.cur.expense / stats.cur.income;
  const prevRatio = stats.prev.expense / stats.prev.income;
  let frac;
  if (curRatio < prevRatio) frac = 1;
  else if (curRatio === prevRatio) frac = 0.8;
  else if (stats.cur.income - stats.cur.expense >= 0) frac = 0.5;
  else frac = 0;
  return { id: 'momentum', score: frac, raw: Math.round((curRatio - prevRatio) * 100) };
}

const SCORERS = [
  (stats, budgets, recurrings) => scoreSavings(stats),
  (stats, budgets, recurrings) => scoreBudget(stats, budgets),
  (stats, budgets, recurrings) => scoreRecurring(stats, recurrings),
  (stats, budgets, recurrings) => scoreBuffer(stats),
  (stats, budgets, recurrings) => scoreMomentum(stats),
];

export function levelFor(score) {
  if (score >= 80) return 'sehat';
  if (score >= 60) return 'waspada';
  return 'perhatian';
}

/* Snapshot skor untuk satu tanggal referensi. Trend dihitung pemanggil
   dengan memanggil ulang memakai previousMonthEnd(today). */
export function buildScore({ transactions = [], budgets = {}, recurrings = [], today }) {
  if (!hasEnoughData(transactions, today)) {
    return { enoughData: false, score: null, level: null, components: [], basis: 0 };
  }
  const stats = computeStats(transactions, today);

  const components = [];
  for (const run of SCORERS) {
    const result = run(stats, budgets, recurrings);
    if (result) components.push({ ...result, max: SCORE_WEIGHTS[result.id] });
  }

  /* Renormalisasi: bobot komponen yang tersedia menentukan skala penuh */
  const possibleMax = components.reduce((sum, c) => sum + c.max, 0);
  if (!possibleMax) return { enoughData: true, score: null, level: null, components: [], basis: 0 };

  const earned = components.reduce((sum, c) => sum + c.score * c.max, 0);
  const score = Math.round((earned / possibleMax) * 100);

  return {
    enoughData: true,
    score,
    level: levelFor(score),
    components: components.map(({ id, max, score: frac, raw }) => ({ id, max, points: Math.round(frac * max), raw })),
    basis: components.length,
  };
}

/* Hari terakhir bulan lalu — dipakai untuk skor historis (trend) */
export function previousMonthEnd(today) {
  const [y, m] = today.split('-').map(Number);
  const pm = shiftMonth(y, m, -1);
  return monthRange(pm.y, pm.m).end;
}
