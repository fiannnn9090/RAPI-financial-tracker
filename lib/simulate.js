/* F6 — Simulasi nabung: proyeksi sederhana dari pola historis.
   Sumber: computeStats() (surplusAvg = rata-rata surplus bulan penuh AKTIF
   terakhir; bulan kosong tidak mendilusi) + saldo gabungan semua dompet.
   Formula: saldo(n) = totalBalance + (surplusAvg + extra) × n.
   Murni recompute — tanpa tabel/tulisan DB. Bukan janji hasil; angka ikut
   berubah begitu datamu berubah (konsisten disclaimer F1). */

import { computeStats, hasEnoughData } from './advice';

export const SIM_SLIDER_MAX = 2_000_000;
export const SIM_SLIDER_STEP = 50_000;
export const SIM_MAX_MONTHS = 240;

export const SIM_PROJECTION_MONTHS = [6, 12];

export function buildSimulation({ transactions = [], totalBalance = 0, goal = null, extraMonthly = 0, today }) {
  if (!hasEnoughData(transactions, today)) {
    return { enoughData: false, reason: 'thin', surplusAvg: null, baseMonthly: null, monthly: 0, remaining: null, monthsToGoal: null, baselineMonths: null, monthsSaved: null, projections: [] };
  }
  const stats = computeStats(transactions, today);

  /* Butuh minimal satu bulan penuh berasuhan income agar pola bisa dipercaya */
  const hasIncomeHistory = stats.lastMonths.some((s) => s.income > 0);
  if (!hasIncomeHistory) {
    return { enoughData: false, reason: 'thin', surplusAvg: null, baseMonthly: null, monthly: 0, remaining: null, monthsToGoal: null, baselineMonths: null, monthsSaved: null, projections: [] };
  }

  const surplusAvg = Math.round(stats.surplusAvg ?? 0);
  const extra = Math.max(0, Math.round(Number(extraMonthly) || 0));
  const baseMonthly = surplusAvg;
  const monthly = surplusAvg + extra;

  const remaining = goal?.amount ? goal.amount - totalBalance : null;

  const etaFor = (rate) => (remaining != null && rate > 0
    ? Math.min(SIM_MAX_MONTHS, Math.max(0, Math.ceil(remaining / rate)))
    : null);

  const reached = remaining != null && remaining <= 0;
  const baselineMonths = reached ? 0 : etaFor(baseMonthly);
  const monthsToGoal = reached ? 0 : etaFor(monthly);
  const monthsSaved = monthsToGoal != null && baselineMonths != null
    ? Math.max(0, baselineMonths - monthsToGoal)
    : null;

  const projections = SIM_PROJECTION_MONTHS.map((months) => ({
    months,
    balance: totalBalance + monthly * months,
  }));

  return {
    enoughData: true,
    reason: reached ? 'reached' : monthly <= 0 ? 'deficit' : null,
    surplusAvg,
    baseMonthly,
    monthly,
    remaining,
    monthsToGoal,
    baselineMonths,
    monthsSaved,
    projections,
  };
}
