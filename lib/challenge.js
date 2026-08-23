/* F5 — Tantangan hemat mingguan: katalog + evaluasi deterministik.
   Semua progres dihitung murni dari transaksi (tanpa state tersimpan), jadi
   hasil identik dihitung ulang kapan pun dan tidak terpengaruh lensa dompet
   (prinsip F4: gamifikasi global). Minggu = kalender Senin-Minggu.
   Bilingual via tl(lang, ...) — teks aturan ada di i18n (ch.*). */

import { tl } from './i18n';

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export { addDays };

/* Senin dari minggu dateStr. getDay(): Min=0, Sen=1 .. Sab=6. */
export function weekStartOf(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const shift = (d.getDay() + 6) % 7;
  return addDays(dateStr, -shift);
}

export function dayOfWeekMon1(dateStr) {
  return (new Date(`${dateStr}T00:00:00`).getDay() + 6) % 7 + 1; /* 1=Sen .. 7=Min */
}

export function daysBetween(fromDate, toDate) {
  return Math.round((new Date(`${toDate}T00:00:00`) - new Date(`${fromDate}T00:00:00`)) / 86400000);
}

/* XP bonus per jenis — naik dengan kesulitan (bukan flat seragam). */
export const CHALLENGE_DEFS = [
  { code: 'log_5_days', icon: '📓', xp: 15 },
  { code: 'no_spend_weekend', icon: '🛡️', xp: 25 },
  { code: 'want_control', icon: '🎯', xp: 30 },
  { code: 'save_20', icon: '📉', xp: 35 },
];

const WEEKEND_DAYS = [6, 7]; /* Sabtu, Minggu (Senin=1) */

/* Progress { current, target, percent, done, failed } untuk SATU kode pada
   minggu weekStart. `wantsByCategory` = Set nama kategori ber-alokasi keinginan.
   done boleh true sebelum minggu usai bila target sudah mustahil dibalik
   (log/want) atau sudah terkunci (weekend kedua hari lewat bersih); save_20
   baru final saat minggu berakhir karena sisa hari masih bisa mengubah hasil.
   failed = sudah pasti gagal walau minggu belum usai. */
export function challengeProgress(code, { transactions = [], wantsByCategory = new Set(), today, weekStart }) {
  const weekEnd = addDays(weekStart, 6);
  const inWeek = transactions.filter((tx) => tx.date >= weekStart && tx.date <= weekEnd);
  const expenses = inWeek.filter((tx) => tx.type === 'expense');
  const elapsedDays = Math.min(7, daysBetween(weekStart, today) + 1);

  if (code === 'log_5_days') {
    const current = new Set(inWeek.map((tx) => tx.date)).size;
    return { current, target: 5, percent: Math.min(100, Math.round((current / 5) * 100)), done: current >= 5, failed: false };
  }

  if (code === 'no_spend_weekend') {
    const weekendDates = WEEKEND_DAYS.map((dow) => addDays(weekStart, dow - 1));
    /* Gagal cepat: pengeluaran mendarat di hari weekend yang sudah lewat. */
    for (const day of weekendDates) {
      if (day <= today && expenses.some((tx) => tx.date === day)) {
        return { current: 0, target: 2, percent: 0, done: false, failed: true };
      }
    }
    /* Hanya hari yang sudah berlalu dihitung bersih. */
    const passed = weekendDates.filter((day) => day <= today);
    const done = passed.length === 2;
    return { current: passed.length, target: 2, percent: Math.round((passed.length / 2) * 100), done, failed: false };
  }

  if (code === 'want_control') {
    /* Syarat minimal 3 transaksi keinginan tercatat agar tidak trivial. */
    const wantTx = expenses.filter((tx) => wantsByCategory.has(tx.category));
    const wantTotal = wantTx.reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const share = totalExpense > 0 ? wantTotal / totalExpense : 0;
    const enoughSamples = wantTx.length >= 3;
    /* Final hanya saat minggu tuntas; sebelum itu cuma indikasi pace. */
    const weekOver = today > weekEnd;
    return {
      current: Math.round(share * 100),
      target: 40,
      percent: weekOver ? (enoughSamples && share < 0.4 ? 100 : Math.min(99, Math.round(share * 100))) : Math.min(99, Math.round(share * 100)),
      done: weekOver && enoughSamples && share < 0.4,
      failed: false,
    };
  }

  if (code === 'save_20') {
    /* Bandingkan rate harian minggu ini vs rata-rata harian 28 hari sebelumnya. */
    const histStart = addDays(weekStart, -28);
    const histEnd = addDays(weekStart, -1);
    const history = transactions.filter((tx) => tx.type === 'expense' && tx.date >= histStart && tx.date <= histEnd);
    const histRate = history.reduce((sum, tx) => sum + tx.amount, 0) / 28;
    const spentSoFar = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const budgetAtRate = histRate * 0.8 * elapsedDays;
    const weekOver = today > weekEnd;
    return {
      current: Math.round(spentSoFar),
      target: Math.round(budgetAtRate),
      percent: budgetAtRate > 0 ? Math.min(100, Math.round((spentSoFar / budgetAtRate) * 100)) : 0,
      /* done = minggu usai DAN belanja < 80% rate historis. */
      done: weekOver && budgetAtRate > 0 && spentSoFar < budgetAtRate,
      failed: weekOver,
    };
  }

  return { current: 0, target: 1, percent: 0, done: false, failed: false };
}

/* Apakah tantangan masih bisa diaktifkan untuk minggu weekStart?
   Return { ok, reason }: reason = key i18n kalau tak memenuhi syarat. */
export function challengeEligibility(code, { transactions = [], today, weekStart }) {
  if (code === 'log_5_days') return { ok: true };
  if (code === 'want_control') return { ok: true };

  if (code === 'no_spend_weekend') {
    /* Sudah ada pengeluaran di hari weekend yang lewat → percuma. */
    const weekEnd = addDays(weekStart, 6);
    for (const dow of WEEKEND_DAYS) {
      const day = addDays(weekStart, dow - 1);
      if (day <= today && transactions.some((tx) => tx.type === 'expense' && tx.date === day)) {
        return { ok: false, reason: 'ch.elig.weekendSpent' };
      }
    }
    if (today > weekEnd) return { ok: false, reason: 'ch.elig.weekGone' };
    return { ok: true };
  }

  if (code === 'save_20') {
    const histStart = addDays(weekStart, -28);
    const histEnd = addDays(weekStart, -1);
    const distinct = new Set(transactions.filter((tx) => tx.type === 'expense' && tx.date >= histStart && tx.date <= histEnd).map((tx) => tx.date)).size;
    if (distinct < 14) return { ok: false, reason: 'ch.elig.history' };
    if (today > addDays(weekStart, 6)) return { ok: false, reason: 'ch.elig.weekGone' };
    return { ok: true };
  }

  return { ok: false, reason: 'ch.elig.unknown' };
}

/* Narasi progress kartu aktif — angka + satuan per jenis (bilingual). */
export function challengeProgressLabel(code, progress, lang = 'id') {
  if (code === 'log_5_days') return tl(lang, 'ch.prog.log5', { n: progress.current });
  if (code === 'no_spend_weekend') return tl(lang, 'ch.prog.weekend', { n: progress.current });
  if (code === 'want_control') return tl(lang, 'ch.prog.want', { n: progress.current });
  if (code === 'save_20') return tl(lang, 'ch.prog.save', { pct: progress.percent });
  return '';
}
