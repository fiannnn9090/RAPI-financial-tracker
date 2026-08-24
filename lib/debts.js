/* F8 — Hutang & Piutang: logika murni tanpa dependency UI/DB.
   Arah (direction):
   - receivable = PIUTANG (orang lain berhutang ke user) -> pembayaran = income
   - payable    = HUTANG  (user berhutang)              -> pembayaran = expense
   Jadwal (schedule):
   - flex        : bayar manual kapan saja, nominal bebas <= sisa
   - installment : N kali nominal tetap; auto catch-up ala N6b memakai mesin
                   jadwal lib/recurring.js; cicilan terakhir di-clamp ke sisa.
   Semua nominal dibulatkan ke 2 desimal untuk menghindari drift float.
   Konvensi status:
   - active      : masih dihitung di Kekayaan Bersih
   - paid        : lunas (otomatis saat remaining mencapai 0, atau manual)
   - written_off : piutang tak tertagih / diampungi (manual + konfirmasi) */

import { nextOccurrence } from './recurring';

export const INSTALLMENT_CAP_PER_RUN = 6;

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

/* direction -> tipe transaksi pembayarannya */
export function paymentType(direction) {
  return direction === 'receivable' ? 'income' : 'expense';
}

export function isActive(debt) {
  return debt.status === 'active';
}

/* Ringkasan neraca: total sisa aktif per arah (+ jumlah itemnya) */
export function totalsByDirection(debts) {
  const acc = { receivable: 0, payable: 0, receivableCount: 0, payableCount: 0 };
  for (const debt of debts) {
    if (!isActive(debt)) continue;
    const amount = round2(debt.remaining);
    if (debt.direction === 'receivable') {
      acc.receivable = round2(acc.receivable + amount);
      acc.receivableCount += 1;
    } else {
      acc.payable = round2(acc.payable + amount);
      acc.payableCount += 1;
    }
  }
  return acc;
}

/* Kekayaan Bersih = Saldo kas + Piutang aktif - Hutang aktif.
   Saldo TIDAK berubah — metrik ini murni lapisan di atasnya. */
export function netWorth(balance, debts) {
  const t = totalsByDirection(debts);
  return round2(balance + t.receivable - t.payable);
}

/* Nominal satu angsuran: installment_amount, di-clamp ke sisa
   (angsuran terakhir boleh lebih kecil agar remaining tepat 0). */
export function installmentDueAmount(debt) {
  return round2(Math.min(Number(debt.installmentAmount) || 0, round2(debt.remaining)));
}

/* Masih ada angsuran terjadwal yang bisa dibayarkan manual lebih awal?
   Hanya saat TIDAK menunggak (next_run_date > hari ini) — kalau menunggak,
   catch-up otomatis yang menutupnya dan bayar manual akan dobel hitung. */
export function canPayInstallmentEarly(debt, todayStr) {
  return (
    isActive(debt) &&
    debt.schedule === 'installment' &&
    Number(debt.installmentsPaid) < Number(debt.installmentsTotal) &&
    !!debt.nextRunDate &&
    debt.nextRunDate > todayStr
  );
}

/* Bayar 1 angsuran lebih awal (tanggal = hari ini).
   Mengembalikan { transaction, patch } atau null bila tidak sah. */
export function payOneInstallment(debt, todayStr) {
  if (!canPayInstallmentEarly(debt, todayStr)) return null;
  const amount = installmentDueAmount(debt);
  const remaining = round2(debt.remaining - amount);
  const installmentsPaid = Number(debt.installmentsPaid) + 1;
  const rule = { frequency: debt.frequency, dayOfPeriod: debt.dayOfPeriod };
  /* Angsuran yang akan datang sudah ditutup → kursor maju melewati hari ini */
  let nextRunDate = nextOccurrence(rule, debt.nextRunDate);
  const finished = remaining <= 0;
  if (!finished && installmentsPaid >= Number(debt.installmentsTotal)) {
    /* Jadwal habis tapi sisa > 0 (kasus tak seharusnya dari form kami):
       jatuhkan ke mode fleksibel residual — tanpa jadwal lagi. */
    nextRunDate = null;
  }
  return {
    transaction: {
      type: paymentType(debt.direction),
      title: debt.title,
      amount,
      category: debt.category,
      date: todayStr,
      debtId: debt.id,
    },
    patch: {
      remaining,
      installmentsPaid,
      nextRunDate,
      status: finished ? 'paid' : 'active',
      paidAt: finished ? new Date().toISOString() : null,
    },
  };
}

/* Bayar manual bebas (flex, atau sisa residual tanpa jadwal).
   Nominal dibatasi 0 < amount <= remaining. */
export function payFlex(debt, amount) {
  if (!isActive(debt)) return null;
  const value = round2(amount);
  const remaining = round2(debt.remaining);
  if (!(value > 0) || value > remaining) return null;
  const left = round2(remaining - value);
  const finished = left <= 0;
  return {
    transaction: {
      type: paymentType(debt.direction),
      title: debt.title,
      amount: value,
      category: debt.category,
      date: null, /* diisi pemanggil (hari ini / pilihan user) */
      debtId: debt.id,
    },
    patch: {
      remaining: left,
      status: finished ? 'paid' : 'active',
      paidAt: finished ? new Date().toISOString() : null,
    },
  };
}

/* Tandai lunas / rugi TANPA membuat transaksi (dilunasi di luar app, diampungi).
   Sisa dinolkan supaya langsung keluar dari Kekayaan Bersih. */
export function settleWithoutPayment(debt, status) {
  if (!isActive(debt)) return null;
  if (status !== 'paid' && status !== 'written_off') return null;
  return { remaining: 0, status, paidAt: new Date().toISOString() };
}

/* Catch-up cicilan ala N6b (generateDue): buat transaksi untuk semua angsuran
   yang jatuh tempo s/d todayStr, cap per-run agar tidak banjir transaksi saat
   pertama kali migrasi/lama tak buka app. Sisa pengembalian:
   - rows    : transaksi siap insert (date sudah ISO yyyy-mm-dd)
   - updates : patch per debt (remaining, installmentsPaid, nextRunDate, status)
   Urutan aman dipakai bersama catch-up recurring di loader. */
export function generateDueInstallments(debts, todayStr, cap = INSTALLMENT_CAP_PER_RUN) {
  const rows = [];
  const updates = [];
  let generated = 0;
  for (const debt of debts) {
    if (!isActive(debt) || debt.schedule !== 'installment') continue;
    if (!debt.nextRunDate || debt.nextRunDate > todayStr) continue;
    let remaining = round2(debt.remaining);
    let installmentsPaid = Number(debt.installmentsPaid) || 0;
    let cursor = debt.nextRunDate;
    let taken = 0;
    while (
      taken < cap &&
      remaining > 0 &&
      installmentsPaid < Number(debt.installmentsTotal) &&
      cursor <= todayStr
    ) {
      const amount = installmentDueAmount({ ...debt, remaining });
      if (!(amount > 0)) break;
      rows.push({
        type: paymentType(debt.direction),
        title: debt.title,
        amount,
        category: debt.category,
        date: cursor,
        debtId: debt.id,
      });
      remaining = round2(remaining - amount);
      installmentsPaid += 1;
      taken += 1;
      cursor = nextOccurrence({ frequency: debt.frequency, dayOfPeriod: debt.dayOfPeriod }, cursor);
    }
    const finished = remaining <= 0;
    const scheduleExhausted = !finished && installmentsPaid >= Number(debt.installmentsTotal);
    updates.push({
      id: debt.id,
      patch: {
        remaining,
        installmentsPaid,
        /* Jadwal habis dengan sisa tersisa → hentikan kursor (mode residual) */
        nextRunDate: scheduleExhausted ? null : cursor,
        status: finished ? 'paid' : 'active',
        paidAt: finished ? new Date().toISOString() : null,
      },
    });
    generated += taken;
  }
  return { rows, updates, generated };
}

/* Utilitas form: bagi principal menjadi N angsuran (dibulatkan KE ATAS ke
   ribuan penuh agar nominal enak dibaca); angsuran terakhir otomatis lebih
   kecil via clamp saat eksekusi. Total N × amount selalu >= principal. */
export function splitPrincipal(principal, count) {
  const p = Number(principal) || 0;
  const n = Math.max(1, Math.floor(Number(count) || 0));
  if (!(p > 0) || n < 1) return 0;
  return Math.ceil(p / n / 1000) * 1000;
}

/* Mapper baris Supabase -> objek camelCase aplikasi */
export function mapDebt(row) {
  return {
    id: row.id,
    direction: row.direction,
    party: row.party ?? '',
    title: row.title ?? '',
    principal: Number(row.principal),
    remaining: Number(row.remaining),
    category: row.category ?? 'Lainnya',
    walletId: row.wallet_id ?? null,
    schedule: row.schedule ?? 'flex',
    installmentAmount: row.installment_amount != null ? Number(row.installment_amount) : null,
    installmentsTotal: row.installments_total ?? null,
    installmentsPaid: row.installments_paid ?? 0,
    frequency: row.frequency ?? null,
    dayOfPeriod: row.day_of_period ?? null,
    nextRunDate: row.next_run_date ?? null,
    status: row.status ?? 'active',
    paidAt: row.paid_at ?? null,
    note: row.note ?? '',
    createdAt: row.created_at ?? null,
  };
}

/* Payload insert/update balik ke snake_case (eksplisit, tanpa spread internal) */
export function debtPayload(debt) {
  return {
    direction: debt.direction,
    party: debt.party,
    title: debt.title,
    principal: debt.principal,
    remaining: debt.remaining,
    category: debt.category,
    ...(debt.walletId ? { wallet_id: debt.walletId } : {}),
    schedule: debt.schedule,
    ...(debt.schedule === 'installment'
      ? {
          installment_amount: debt.installmentAmount,
          installments_total: debt.installmentsTotal,
          installments_paid: debt.installmentsPaid ?? 0,
          frequency: debt.frequency,
          day_of_period: debt.dayOfPeriod,
          next_run_date: debt.nextRunDate,
        }
      : {}),
    status: debt.status ?? 'active',
    ...(debt.paidAt ? { paid_at: debt.paidAt } : {}),
    note: debt.note ?? '',
  };
}
