/* Recap cerita mingguan/bulanan — data storytelling dengan TEMPLATE deterministik.
   Tidak ada AI/backend tambahan: semua fakta dihitung dari transaksi, narasi dirakit
   dari pilihan varian + variabel. Konvensi highlight: teks di antara **...** dirender
   UI sebagai penanda kuning. Nama kategori SELALU dari data aktual (tidak hardcode). */

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function periodRange(period, today) {
  if (period === 'month') {
    const [y, m] = today.split('-').map(Number);
    const prevY = m === 1 ? y - 1 : y;
    const prevM = m === 1 ? 12 : m - 1;
    const lastDayPrev = new Date(prevY, prevM, 0).getDate();
    return {
      cur: { start: `${y}-${String(m).padStart(2, '0')}-01`, end: today },
      prev: { start: `${prevY}-${String(prevM).padStart(2, '0')}-01`, end: `${prevY}-${String(prevM).padStart(2, '0')}-${String(lastDayPrev).padStart(2, '0')}` },
    };
  }
  /* Minggu = 7 hari bergulir */
  return {
    cur: { start: addDays(today, -6), end: today },
    prev: { start: addDays(today, -13), end: addDays(today, -7) },
  };
}

export function fmtShort(n) {
  if (n >= 1e6) return `Rp${(n / 1e6).toFixed(1).replace('.', ',').replace(',0', '')}jt`;
  if (n >= 1000) return `Rp${Math.round(n / 1000)}rb`;
  return `Rp${Math.round(n)}`;
}

function summarize(transactions, { start, end }) {
  let income = 0;
  let expense = 0;
  let count = 0;
  let biggest = null;
  const byCategory = {};
  const days = new Set();
  for (const tx of transactions) {
    if (tx.date < start || tx.date > end) continue;
    count += 1;
    days.add(tx.date);
    if (tx.type === 'income') {
      income += tx.amount;
      continue;
    }
    expense += tx.amount;
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;
    if (!biggest || tx.amount > biggest.amount) biggest = { title: tx.title, amount: tx.amount };
  }
  let topCategory = null;
  for (const [name, total] of Object.entries(byCategory)) {
    if (!topCategory || total > topCategory.total) topCategory = { name, total };
  }
  if (topCategory && expense > 0) topCategory = { ...topCategory, share: Math.round((topCategory.total / expense) * 100) };
  return { income, expense, count, activeDays: days.size, topCategory, biggest };
}

const REF_TEXT = { week: 'minggu lalu', month: 'bulan lalu' };

export function buildRecap({ transactions, period = 'week', streak = 0 }) {
  const today = new Date().toISOString().slice(0, 10);
  const { cur, prev } = periodRange(period, today);
  const now = summarize(transactions, cur);
  const before = summarize(transactions, prev);

  const base = {
    period,
    stats: { income: now.income, expense: now.expense, activeDays: now.activeDays },
    topCategory: now.topCategory,
  };

  if (now.count === 0) return { ...base, isEmpty: true, lines: [] };

  const delta = before.expense > 0 ? Math.round(((now.expense - before.expense) / before.expense) * 100) : null;
  const ref = REF_TEXT[period];
  const cat = now.topCategory;
  const lines = [`**${now.count}** transaksi tercatat periode ini.`];

  let variant;
  if (now.expense === 0) {
    variant = 'zero';
    lines.push('Nol pengeluaran — dompet aman banget 🛡️');
  } else if (delta !== null && delta > 25) {
    variant = 'warning';
    lines.push(`Pengeluaran **naik ${delta}%** dari ${ref} 👀`);
    lines.push(`**${cat.name}** jadi biang keroknya (**${fmtShort(cat.total)}**, ${cat.share}% dari total). Tenang masih sempat — gas geser 10% ke tabungan!`);
  } else if (delta !== null && delta < -15) {
    variant = 'praise';
    lines.push(`Pengeluaran **turun ${Math.abs(delta)}%** dari ${ref} — self-control level dewa 🔥`);
    lines.push(`**${cat.name}** masih favoritmu (**${fmtShort(cat.total)}**), tapi semuanya aman terkendali. Pertahankan ✨`);
  } else {
    variant = 'neutral';
    lines.push(delta === null ? 'Belum ada pembanding periode lalu, mulai bangun riwayatmu ya.' : `Pengeluaran stabil dibanding ${ref}.`);
    lines.push(`**${cat.name}** menang besar periode ini (**${fmtShort(cat.total)}**). Lancar terus ✨`);
  }

  if (now.biggest && now.expense > 0 && now.biggest.amount >= now.expense * 0.2) {
    lines.push(`Rekor satuan: **${now.biggest.title}** (**${fmtShort(now.biggest.amount)}**).`);
  }
  if (streak >= 3) {
    lines.push(`Plus, streak-mu udah **${streak} hari** — jangan sampai putus ya bestie!`);
  }

  return { ...base, isEmpty: false, variant, delta, lines };
}
