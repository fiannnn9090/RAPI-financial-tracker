/* F3 — Rekomendasi pembagian budget 50/30/20 (kebutuhan/keinginan/tabungan).
   Membandingkan alokasi aktual pengeluaran bulan berjalan vs ideal dari income
   (bulan berjalan, fallback rata-rata 3 bulan penuh). Deterministik, murni,
   reuse computeStats dari engine advice/score. Bukan nasihat investasi. */

import { computeStats } from './advice';

export const SPLIT_IDEAL = { kebutuhan: 0.5, keinginan: 0.3, tabungan: 0.2 };
const STATUS_TOLERANCE = 0.1; /* ±10% dari ideal dianggap pas */

/* allocationMap: name → bucket. Pemanggil menyusunnya dari state kategori
   (allocationType row DB) + fallback default; kategori yang sudah terhapus
   tapi masih dipakai transaksi lama tetap terklasifikasi lewat fallback. */
export function buildBudgetRecommendation({
  transactions = [],
  categories = [],
  allocationMap = null,
  today,
}) {
  if (!hasExpense(transactions, today)) {
    return { enoughData: false, incomeBase: 0, buckets: [] };
  }
  const stats = computeStats(transactions, today);
  const incomeBase = stats.cur.income > 0 ? stats.cur.income : stats.avgIncome;
  if (!(incomeBase > 0)) return { enoughData: false, incomeBase: 0, buckets: [] };

  const map = allocationMap ?? Object.fromEntries(categories.map((c) => [c.name, c.allocationType ?? 'kebutuhan']));
  const actuals = { kebutuhan: 0, keinginan: 0, tabungan: 0 };
  for (const tx of transactions) {
    if (tx.type !== 'expense' || !tx.date.startsWith(`${today.slice(0, 7)}`)) continue;
    const bucket = map[tx.category] ?? 'kebutuhan';
    actuals[bucket] += Number(tx.amount) || 0;
  }

  const buckets = Object.entries(SPLIT_IDEAL).map(([id, pct]) => {
    const ideal = incomeBase * pct;
    const ratio = ideal > 0 ? actuals[id] / ideal : 0;
    let status;
    if (ratio >= 1 - STATUS_TOLERANCE && ratio <= 1 + STATUS_TOLERANCE) status = 'pas';
    else status = ratio > 1 ? 'over' : 'under';
    return { id, actual: actuals[id], ideal, status };
  });

  return { enoughData: true, incomeBase, buckets };
}

function hasExpense(transactions, today) {
  const prefix = today.slice(0, 7);
  return transactions.some((tx) => tx.type === 'expense' && tx.date?.startsWith(prefix));
}
