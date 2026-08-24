/* F1 — Saran finansial: engine rule-based DETERMINISTIK (tanpa AI/ML, tanpa API).
   Membaca data yang sudah ada di state Dashboard dan menghasilkan daftar saran/nudge
   kebiasaan budgeting — bukan nasihat investasi. Mirror pola recap.js: fungsi murni,
   narasi bilingual via tl(lang,...), angka diformat lewat `money` (fallback IDR singkat),
   highlight **...** dirender UI sebagai penanda kuning (konvensi N7).
   Deterministik: input + `today` sama → output identik. */

import { tl } from './i18n';

/* ---------- helper tanggal & agregasi ---------- */

function parts(today) {
  const [y, m, d] = today.split('-').map(Number);
  return { y, m, d };
}

export function monthKey(y, m) {
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function monthRange(y, m, upToDay = null) {
  const lastDay = new Date(y, m, 0).getDate();
  const end = upToDay ? String(upToDay).padStart(2, '0') : String(lastDay).padStart(2, '0');
  return { start: `${monthKey(y, m)}-01`, end: `${monthKey(y, m)}-${end}` };
}

export function shiftMonth(y, m, delta) {
  const total = (y * 12) + (m - 1) + delta;
  return { y: Math.floor(total / 12), m: (total % 12) + 1 };
}

function summarize(transactions, { start, end }) {
  let income = 0;
  let expense = 0;
  const byCategory = {};
  for (const tx of transactions) {
    if (!tx || tx.date < start || tx.date > end) continue;
    if (tx.type === 'income') {
      income += Number(tx.amount) || 0;
      continue;
    }
    const amount = Number(tx.amount) || 0;
    expense += amount;
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + amount;
  }
  return { income, expense, byCategory };
}

function defaultShort(n) {
  const value = Math.round(Number(n));
  if (value >= 1e6) return `Rp${(value / 1e6).toFixed(1).replace('.', ',').replace(',0', '')}jt`;
  if (value >= 1000) return `Rp${Math.round(value / 1000)}rb`;
  return `Rp${value}`;
}

function monthlyEquivalent(rule) {
  const amount = Number(rule.amount) || 0;
  return rule.frequency === 'weekly' ? amount * (52 / 12) : amount;
}

/* ---------- detektor sinyal ----------
   Tiap detektor menerima ctx hasil computeStats dan mengembalikan
   null | { id, icon, severity, score, vars }. Urutan eksekusi tidak penting;
   urutan OUTPUT ditentukan score (desc) di buildAdvice. */

function detectBudgetOver(ctx) {
  for (const [cat, limitRaw] of Object.entries(ctx.budgets)) {
    const limit = Number(limitRaw) || 0;
    if (limit <= 0) continue;
    const spent = ctx.cur.byCategory[cat];
    if (!spent || spent <= limit) continue;
    const pct = Math.round((spent / limit) * 100);
    const overPct = Math.round(((spent - limit) / limit) * 100);
    const overTxt = overPct >= 20 ? tl(ctx.lang, 'adv.overLot', { n: overPct }) : '';
    return {
      id: 'budget_over',
      icon: '🚨',
      severity: 'tinggi',
      score: 100 + Math.min(overPct, 50),
      vars: {
        cat: `${ctx.emoji(cat)} ${cat}`,
        spent: ctx.fmt(spent),
        limit: ctx.fmt(limit),
        pct,
        daysLeft: ctx.daysLeft,
        overLot: overTxt,
      },
    };
  }
  return null;
}

function detectFastPace(ctx) {
  for (const [cat, limitRaw] of Object.entries(ctx.budgets)) {
    const limit = Number(limitRaw) || 0;
    if (limit <= 0 || ctx.dayOfMonth < 3) continue;
    const spent = ctx.cur.byCategory[cat];
    if (!spent || spent > limit) continue; // sudah jebol → S1; belum jebol baru di sini
    const projected = (spent / ctx.dayOfMonth) * ctx.daysInMonth;
    if (projected <= limit * 1.15 || projected <= spent) continue;
    const pacePct = Math.round((projected / limit) * 100);
    return {
      id: 'pace_fast',
      icon: '⏳',
      severity: 'sedang',
      score: 70,
      vars: {
        cat: `${ctx.emoji(cat)} ${cat}`,
        projected: ctx.fmt(projected),
        limit: ctx.fmt(limit),
        pacePct,
        daysLeft: ctx.daysLeft,
      },
    };
  }
  return null;
}

function detectDominantNoBudget(ctx) {
  const entries = Object.entries(ctx.cur.byCategory).sort((a, b) => b[1] - a[1]);
  const top = entries[0];
  if (!top) return null;
  const [cat, total] = top;
  if (ctx.cur.expense <= 0 || total < ctx.cur.expense * 0.25) return null;
  if (ctx.budgets[cat] != null && Number(ctx.budgets[cat]) > 0) return null;
  const share = Math.round((total / ctx.cur.expense) * 100);
  return {
    id: 'no_budget',
    icon: '🎯',
    severity: 'ringan',
    score: 50,
    vars: { cat: `${ctx.emoji(cat)} ${cat}`, share, amt: ctx.fmt(total) },
  };
}

function detectRecurringBurden(ctx) {
  if (!ctx.recurrings.length || ctx.avgIncome <= 0) return null;
  const monthlyRecurring = ctx.recurrings
    .filter((rule) => rule.type === 'expense')
    .reduce((sum, rule) => sum + monthlyEquivalent(rule), 0);
  if (monthlyRecurring <= 0) return null;
  const burdenPct = Math.round((monthlyRecurring / ctx.avgIncome) * 100);
  if (burdenPct < 50) return null;
  return {
    id: 'recurring_burden',
    icon: '🔁',
    severity: burdenPct > 70 ? 'tinggi' : 'sedang',
    score: burdenPct > 70 ? 85 : 65,
    vars: {
      pct: burdenPct,
      recurring: ctx.fmt(monthlyRecurring),
      income: ctx.fmt(ctx.avgIncome),
      count: ctx.recurrings.filter((rule) => rule.type === 'expense').length,
    },
  };
}

function detectRatioWorse(ctx) {
  if (ctx.prev.expense <= 0 || ctx.cur.income <= 0) return null;
  const curRate = 1 - ctx.cur.expense / ctx.cur.income; // savings rate bulan ini
  const prevRate = 1 - ctx.prev.expense / ctx.prev.income;
  if (ctx.prev.income <= 0) return null;
  const worsening = ctx.cur.expense / ctx.cur.income > ctx.prev.expense / ctx.prev.income;
  if (!worsening || curRate >= 0.1) return null;
  return {
    id: 'ratio_worse',
    icon: '📉',
    severity: curRate < 0 ? 'tinggi' : 'sedang',
    score: curRate < 0 ? 80 : 65,
    vars: { prevPct: Math.max(0, Math.round(prevRate * 100)), curPct: Math.max(0, Math.round(curRate * 100)) },
  };
}

function detectSlowGoal(ctx) {
  if (!ctx.goal || !ctx.goal.amount || ctx.surplusAvg == null) return null;
  const target = Number(ctx.goal.amount) || 0;
  if (target <= 0) return null;
  if (ctx.surplusAvg <= 0) {
    return {
      id: 'goal_slow',
      icon: '🚀',
      severity: 'sedang',
      score: 58,
      msgKey: 'stall',
      vars: { name: ctx.goal.name, months: null, need: ctx.fmt(target / 6) },
    };
  }
  const months = Math.ceil(target / ctx.surplusAvg);
  if (months < 6) return null;
  const fasterMonths = Math.max(months - 3, 1);
  const extraNeeded = target / fasterMonths - ctx.surplusAvg;
  return {
    id: 'goal_slow',
    icon: '🚀',
    severity: 'ringan',
    score: 55,
    msgKey: extraNeeded > 0 ? 'boost' : 'months',
    vars: {
      name: ctx.goal.name,
      months,
      extra: extraNeeded > 0 ? ctx.fmt(extraNeeded) : '',
    },
  };
}

function detectThinBuffer(ctx) {
  if (ctx.buffer == null) return null;
  if (ctx.buffer.surplus3m >= ctx.buffer.monthlyExpense && ctx.buffer.monthlyExpense > 0) return null;
  if (ctx.buffer.monthlyExpense <= 0) return null;
  return {
    id: 'thin_buffer',
    icon: '🛟',
    severity: 'sedang',
    score: 60,
    vars: {
      saved: ctx.fmt(Math.max(ctx.buffer.surplus3m, 0)),
      monthly: ctx.fmt(ctx.buffer.monthlyExpense),
    },
  };
}

function detectMicroLeak(ctx) {
  if (ctx.cur.expense <= 0) return null;
  const micro = {};
  for (const tx of ctx.transactions) {
    if (tx.type !== 'expense' || tx.date < ctx.cur.start || tx.date > ctx.cur.end) continue;
    if (Number(tx.amount) > ctx.microMax) continue;
    micro[tx.category] = micro[tx.category] ?? { count: 0, total: 0 };
    micro[tx.category].count += 1;
    micro[tx.category].total += Number(tx.amount);
  }
  let worst = null;
  for (const [cat, info] of Object.entries(micro)) {
    if (info.count < 10 || info.total < ctx.cur.expense * 0.05) continue;
    if (!worst || info.total > worst.total) worst = { cat, ...info };
  }
  if (!worst) return null;
  return {
    id: 'micro_leak',
    icon: '☕',
    severity: 'ringan',
    score: 45,
    vars: {
      n: worst.count,
      cat: `${ctx.emoji(worst.cat)} ${worst.cat}`,
      total: ctx.fmt(worst.total),
    },
  };
}

const DETECTORS = [
  detectBudgetOver,
  detectRecurringBurden,
  detectRatioWorse,
  detectThinBuffer,
  detectFastPace,
  detectSlowGoal,
  detectDominantNoBudget,
  detectMicroLeak,
];

/* ---------- entry point ---------- */

/* ---------- statistik bersama (dipakai advice F1 & score F2) ----------
   Murni: transaksi + tanggal referensi → ringkasan bulan berjalan, bulan lalu,
   3 bulan penuh terakhir, income/pengeluaran rata-rata, surplus, buffer. */
export function computeStats(transactions, today) {
  const { y, m, d } = parts(today);

  const cur = summarize(transactions, monthRange(y, m, d));
  const pm = shiftMonth(y, m, -1);
  const prev = summarize(transactions, monthRange(pm.y, pm.m));
  const p2 = shiftMonth(y, m, -2);
  const p3 = shiftMonth(y, m, -3);
  const lastMonths = [
    summarize(transactions, monthRange(p3.y, p3.m)),
    summarize(transactions, monthRange(p2.y, p2.m)),
    summarize(transactions, monthRange(pm.y, pm.m)),
  ];

  const incomesFull = lastMonths.map((s) => s.income).filter((v) => v > 0);
  const avgIncome = incomesFull.length
    ? incomesFull.reduce((a, b) => a + b, 0) / incomesFull.length
    : (cur.income > 0 ? cur.income : 0);

  const expensesFull = lastMonths.map((s) => s.expense).filter((v) => v > 0);
  const monthlyExpense = expensesFull.length
    ? expensesFull.reduce((a, b) => a + b, 0) / expensesFull.length
    : cur.expense;

  /* Bulan tanpa aktivitas (income & expense 0) tidak ikut meratakan surplus:
     pengguna baru yang baru punya 1–2 bulan riwayat tidak boleh kepotong ETA
     karena pembagi tetap 3. Bulan aktif tapi deficit TETAP dihitung. */
  const activeMonths = lastMonths.filter((s) => s.income > 0 || s.expense > 0);
  const surplusList = activeMonths.map((s) => s.income - s.expense);
  const surplusAvg = surplusList.length
    ? surplusList.reduce((a, b) => a + b, 0) / surplusList.length
    : null;

  const buffer = {
    surplus3m: surplusList.reduce((a, b) => a + b, 0),
    monthlyExpense,
  };

  const daysInMonth = new Date(y, m, 0).getDate();

  return {
    y, m, d,
    cur, prev, lastMonths,
    avgIncome, monthlyExpense, surplusList, surplusAvg, buffer,
    daysInMonth, daysLeft: daysInMonth - d,
  };
}

/* Guard data minimum yang sama untuk F1/F2: butuh riwayat ≥14 hari & ≥5 transaksi */
export function hasEnoughData(transactions, today) {
  const dates = transactions.map((tx) => tx?.date).filter(Boolean).sort();
  if (dates.length < 5 || !dates[0]) return false;
  const historyDays = Math.round((new Date(`${today}T00:00:00`) - new Date(`${dates[0]}T00:00:00`)) / 86400000);
  return historyDays >= 14;
}

export function buildAdvice({
  transactions = [],
  budgets = {},
  goal = null,
  recurrings = [],
  lang = 'id',
  money = null,
  today = null,
  emojiOf = null,
}) {
  const fmt = money?.formatShort ?? ((n) => defaultShort(n));
  const emoji = emojiOf ?? (() => '✨');
  if (!today) today = new Date().toISOString().slice(0, 10);

  /* Guard data minimum: butuh riwayat ≥14 hari & ≥5 transaksi */
  if (!hasEnoughData(transactions, today)) return { items: [], checked: 0 };

  const stats = computeStats(transactions, today);
  const ctx = {
    transactions, budgets, recurrings, goal, lang, fmt,
    emoji,
    ...stats,
    dayOfMonth: stats.d,
    microMax: 25000,
  };

  const candidates = [];
  let checked = 0;
  for (const detect of DETECTORS) {
    try {
      const result = detect(ctx);
      if (!result) continue;
      checked += 1;
      candidates.push(result);
    } catch {
      /* detektor tak boleh menjatuhkan seluruh engine */
    }
  }

  /* Dedupe: maks satu saran per kategori (simpan yang skor tertinggi) */
  candidates.sort((a, b) => b.score - a.score);
  const seenCats = new Set();
  const items = [];
  for (const cand of candidates) {
    const catName = typeof cand.vars?.cat === 'string' ? cand.vars.cat.split(' ').slice(1).join(' ') : null;
    if (catName) {
      if (seenCats.has(catName)) continue;
      seenCats.add(catName);
    }
    items.push({
      id: cand.id,
      icon: cand.icon,
      severity: cand.severity,
      title: tl(lang, `adv.${cand.id}.title`, null, cand.id),
      message: tl(lang, `adv.${cand.id}.msg${cand.msgKey ? `.${cand.msgKey}` : ''}`, cand.vars),
      reason: tl(lang, `adv.${cand.id}.why`, cand.vars),
    });
  }

  return { items, checked };
}
