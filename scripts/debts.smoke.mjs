/* Smoke test F8 — lib/debts.js (murni, tanpa DB/UI).
   Jalankan: npx --no-install esbuild scripts/debts.smoke.mjs --bundle --platform=node --format=esm --outfile=/tmp/sm_debts.mjs && node /tmp/sm_debts.mjs */
import assert from 'node:assert';
import {
  INSTALLMENT_CAP_PER_RUN,
  generateDueInstallments,
  installmentDueAmount,
  mapDebt,
  netWorth,
  payFlex,
  payOneInstallment,
  paymentType,
  settleWithoutPayment,
  splitPrincipal,
  totalsByDirection,
} from '../lib/debts';

const debt = (over = {}) => ({
  id: over.id ?? 'd1',
  direction: 'payable',
  party: 'Andi',
  title: 'Pinjaman motor',
  principal: 3_000_000,
  remaining: 3_000_000,
  category: 'Cicilan',
  walletId: null,
  schedule: 'flex',
  installmentAmount: null,
  installmentsTotal: null,
  installmentsPaid: 0,
  frequency: null,
  dayOfPeriod: null,
  nextRunDate: null,
  status: 'active',
  paidAt: null,
  note: '',
  ...over,
});

/* --- 1. netWorth & totalsByDirection ----------------------------------- */
{
  const debts = [
    debt({ id: 'a', direction: 'receivable', remaining: 500_000 }),
    debt({ id: 'b', remaining: 1_200_000 }),
    debt({ id: 'c', status: 'paid', remaining: 0 }),
    debt({ id: 'd', direction: 'receivable', status: 'written_off', remaining: 0 }),
  ];
  const t = totalsByDirection(debts);
  assert.strictEqual(t.receivable, 500_000);
  assert.strictEqual(t.payable, 1_200_000);
  assert.strictEqual(t.receivableCount, 1);
  assert.strictEqual(t.payableCount, 1);
  /* saldo 2jt + piutang 500rb - hutang 1.2jt = 1.3jt; lunas/rugi tak dihitung */
  assert.strictEqual(netWorth(2_000_000, debts), 1_300_000);
  assert.strictEqual(netWorth(0, []), 0);
}

/* --- 2. paymentType ----------------------------------------------------- */
assert.strictEqual(paymentType('receivable'), 'income');
assert.strictEqual(paymentType('payable'), 'expense');

/* --- 3. catch-up cicilan bulanan lintas bulan --------------------------- */
{
  const d = debt({
    schedule: 'installment',
    installmentAmount: 1_000_000,
    installmentsTotal: 3,
    frequency: 'monthly',
    dayOfPeriod: 5,
    nextRunDate: '2026-06-05', /* telat 3 angsuran per 2026-08-24 */
  });
  const { rows, updates, generated } = generateDueInstallments([d], '2026-08-24');
  assert.strictEqual(generated, 3);
  assert.deepStrictEqual(rows.map((r) => r.date), ['2026-06-05', '2026-07-05', '2026-08-05']);
  assert.ok(rows.every((r) => r.type === 'expense' && r.debtId === 'd1'));
  const u = updates[0].patch;
  /* 3 × 1jt = principal habis → otomatis lunas */
  assert.strictEqual(u.remaining, 0);
  assert.strictEqual(u.installmentsPaid, 3);
  assert.strictEqual(u.nextRunDate, '2026-09-05');
  assert.strictEqual(u.status, 'paid');
  assert.ok(u.paidAt);
}

/* --- 3b. menunggak sebagian: sisa masih ada ------------------------------ */
{
  const d = debt({
    schedule: 'installment',
    installmentAmount: 500_000,
    installmentsTotal: 4,
    frequency: 'monthly',
    dayOfPeriod: 5,
    nextRunDate: '2026-07-05', /* 2 tempo lewat (Jul, Agu) dari 4 */
  });
  const { rows, updates } = generateDueInstallments([d], '2026-08-24');
  assert.strictEqual(rows.length, 2);
  const u = updates[0].patch;
  assert.strictEqual(u.remaining, 2_000_000);
  assert.strictEqual(u.installmentsPaid, 2);
  assert.strictEqual(u.nextRunDate, '2026-09-05'); /* kursor maju melewati today */
  assert.strictEqual(u.status, 'active');
}

/* --- 4. cap per-run ------------------------------------------------------ */
{
  const d = debt({
    schedule: 'installment',
    installmentAmount: 100_000,
    installmentsTotal: 12,
    frequency: 'weekly',
    dayOfPeriod: 1,
    nextRunDate: '2026-04-06',
  });
  const { generated, rows } = generateDueInstallments([d], '2026-08-24');
  assert.strictEqual(generated, INSTALLMENT_CAP_PER_RUN);
  assert.strictEqual(rows.length, INSTALLMENT_CAP_PER_RUN);
  /* sisa pengembalian berikutnya tetap menunggak → catch-up lanjutan menyusul */
}

/* --- 5. clamp angsuran terakhir → tepat 0 → status paid ------------------ */
{
  const d = debt({
    principal: 100_000,
    remaining: 100_000,
    schedule: 'installment',
    installmentAmount: 40_000,
    installmentsTotal: 3,
    frequency: 'monthly',
    dayOfPeriod: 10,
    nextRunDate: '2026-06-10',
  });
  const { rows, updates } = generateDueInstallments([d], '2030-01-01');
  /* 3 tempo bulanan (Jun–Agu 2026) semua lewat → sekali jalan tuntas */
  assert.strictEqual(rows.length, 3);
  assert.deepStrictEqual(
    rows.map((r) => r.amount),
    [40_000, 40_000, 20_000], /* terakhir di-clamp ke sisa */
  );
  const cur = { ...d, ...updates[0].patch };
  assert.strictEqual(cur.remaining, 0);
  assert.strictEqual(cur.installmentsPaid, 3);
  assert.strictEqual(cur.status, 'paid');
  assert.ok(cur.paidAt);
}

/* --- 6. start date di masa depan → tidak ada yang dibuat ----------------- */
{
  const d = debt({
    schedule: 'installment',
    installmentAmount: 50_000,
    installmentsTotal: 4,
    frequency: 'monthly',
    dayOfPeriod: 15,
    nextRunDate: '2026-09-15',
  });
  const { generated, updates } = generateDueInstallments([d], '2026-08-24');
  assert.strictEqual(generated, 0);
  assert.deepStrictEqual(updates, []);
}

/* --- 7. payOneInstallment: sah hanya saat tidak menunggak ---------------- */
{
  const late = debt({
    schedule: 'installment',
    installmentAmount: 100_000,
    installmentsTotal: 3,
    frequency: 'monthly',
    dayOfPeriod: 1,
    nextRunDate: '2026-08-01',
  });
  assert.strictEqual(payOneInstallment(late, '2026-08-24'), null); /* menunggak */

  const ok = debt({
    schedule: 'installment',
    installmentAmount: 100_000,
    installmentsTotal: 3,
    installmentsPaid: 2,
    remaining: 100_000,
    frequency: 'monthly',
    dayOfPeriod: 25,
    nextRunDate: '2026-09-25',
  });
  const res = payOneInstallment(ok, '2026-08-24');
  assert.strictEqual(res.transaction.amount, 100_000);
  assert.strictEqual(res.transaction.type, 'expense');
  assert.strictEqual(res.patch.remaining, 0);
  assert.strictEqual(res.patch.installmentsPaid, 3);
  assert.strictEqual(res.patch.status, 'paid');

  /* bukan angsuran terakhir: kursor maju ke occurrence berikutnya */
  const mid = debt({
    schedule: 'installment',
    installmentAmount: 100_000,
    installmentsTotal: 4,
    installmentsPaid: 1,
    remaining: 300_000,
    frequency: 'monthly',
    dayOfPeriod: 25,
    nextRunDate: '2026-09-25',
  });
  const midRes = payOneInstallment(mid, '2026-08-24');
  assert.strictEqual(midRes.patch.remaining, 200_000);
  assert.strictEqual(midRes.patch.nextRunDate, '2026-10-25');
  assert.strictEqual(midRes.patch.status, 'active');
}

/* --- 8. payFlex: batas nominal & auto-lunas ------------------------------ */
{
  const d = debt({ remaining: 250_000 });
  assert.strictEqual(payFlex(d, 0), null);
  assert.strictEqual(payFlex(d, 300_000), null); /* melebihi sisa */
  const part = payFlex(d, 150_000);
  assert.strictEqual(part.transaction.amount, 150_000);
  assert.strictEqual(part.patch.remaining, 100_000);
  assert.strictEqual(part.patch.status, 'active');
  const full = payFlex(d, 250_000);
  assert.strictEqual(full.patch.remaining, 0);
  assert.strictEqual(full.patch.status, 'paid');
  assert.strictEqual(payFlex(debt({ status: 'paid' }), 1), null);
}

/* --- 9. settleWithoutPayment -------------------------------------------- */
{
  const d = debt({ remaining: 90_000 });
  const settled = settleWithoutPayment(d, 'paid');
  assert.strictEqual(settled.remaining, 0);
  assert.strictEqual(settled.status, 'paid');
  assert.ok(settled.paidAt);
  assert.strictEqual(settleWithoutPayment(d, 'written_off').status, 'written_off');
  assert.strictEqual(settleWithoutPayment(d, 'nonsense'), null);
  assert.strictEqual(settleWithoutPayment(debt({ status: 'paid' }), 'paid'), null);
}

/* --- 10. splitPrincipal & installmentDueAmount --------------------------- */
assert.strictEqual(splitPrincipal(3_000_000, 3), 1_000_000);
assert.strictEqual(splitPrincipal(1_000_000, 3), 334_000); /* ceil ke ribuan */
assert.strictEqual(splitPrincipal(0, 3), 0);
assert.strictEqual(
  installmentDueAmount({ installmentAmount: 40_000, remaining: 20_000 }),
  20_000,
);

/* --- 11. mapDebt round-trip dasar ---------------------------------------- */
{
  const m = mapDebt({
    id: 'x',
    direction: 'receivable',
    party: 'Budi',
    title: 'Utang bensin',
    principal: '50000.00',
    remaining: '25000.00',
    category: 'Lainnya',
    wallet_id: 'w1',
    schedule: 'flex',
    installment_amount: null,
    installments_total: null,
    installments_paid: 0,
    next_run_date: null,
    status: 'active',
    note: null,
  });
  assert.strictEqual(m.principal, 50_000);
  assert.strictEqual(m.remaining, 25_000);
  assert.strictEqual(m.walletId, 'w1');
  assert.strictEqual(m.schedule, 'flex');
}

console.log('SMOKE debts: semua case PASS ✓');
