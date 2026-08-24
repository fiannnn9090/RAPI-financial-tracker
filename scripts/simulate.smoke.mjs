/* Unit test buildSimulation (F6) — deterministik, tanpa jaringan.
   Jalankan: node scripts/simulate.smoke.build.mjs && node scripts/simulate.smoke.mjs */
import { buildSimulation } from '../lib/simulate';

const TODAY = '2026-08-23';
let failures = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) { failures += 1; console.log(`  GAGAL ${name}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`); }
  else console.log(`  ok ${name}`);
}

/* Pola stabil Mei–Jul: income 4jt, expense 3.5jt → surplus rata-rata 500rb/bln */
function stableMonth(y, m) {
  return [
    { date: `${y}-${m}-05`, type: 'income', amount: 4000000, category: 'Gaji' },
    { date: `${y}-${m}-10`, type: 'expense', amount: 2000000, category: 'Makan' },
    { date: `${y}-${m}-20`, type: 'expense', amount: 1500000, category: 'Transport' },
  ];
}
const stableTx = [
  ...stableMonth('2026', '05'), ...stableMonth('2026', '06'), ...stableMonth('2026', '07'),
  { date: '2026-08-01', type: 'income', amount: 4000000, category: 'Gaji' },
  { date: '2026-08-02', type: 'expense', amount: 100000, category: 'Makan' },
];

console.log('1) goal + surplus positif: baseline vs what-if');
{
  const base = buildSimulation({ transactions: stableTx, totalBalance: 2000000, goal: { name: 'PS5', amount: 5000000 }, extraMonthly: 0, today: TODAY });
  check('enoughData', base.enoughData, true);
  check('surplusAvg', base.surplusAvg, 500000);
  check('baselineMonths (3jt/500rb)', base.baselineMonths, 6);
  const extra = buildSimulation({ transactions: stableTx, totalBalance: 2000000, goal: { name: 'PS5', amount: 5000000 }, extraMonthly: 100000, today: TODAY });
  check('monthsToGoal (3jt/600rb)', extra.monthsToGoal, 5);
  check('monthsSaved', extra.monthsSaved, 1);
}

console.log('2) deficit: surplus negatif tanpa ekstra');
{
  const deficitTx = [
    { date: '2026-05-05', type: 'income', amount: 3000000, category: 'Gaji' },
    { date: '2026-05-15', type: 'expense', amount: 3200000, category: 'Makan' },
    { date: '2026-06-05', type: 'income', amount: 3000000, category: 'Gaji' },
    { date: '2026-06-15', type: 'expense', amount: 3200000, category: 'Makan' },
    { date: '2026-07-05', type: 'income', amount: 3000000, category: 'Gaji' },
    { date: '2026-07-15', type: 'expense', amount: 3200000, category: 'Makan' },
    { date: '2026-08-02', type: 'expense', amount: 50000, category: 'Makan' },
  ];
  const sim = buildSimulation({ transactions: deficitTx, totalBalance: 1000000, goal: { name: 'PS5', amount: 5000000 }, extraMonthly: 0, today: TODAY });
  check('reason deficit', sim.reason, 'deficit');
  check('surplusAvg -200rb', sim.surplusAvg, -200000);
  check('monthsToGoal null', sim.monthsToGoal, null);
  const rescued = buildSimulation({ transactions: deficitTx, totalBalance: 1000000, goal: { name: 'PS5', amount: 5000000 }, extraMonthly: 700000, today: TODAY });
  check('ekstra menyelamatkan: monthly 500rb', rescued.monthly, 500000);
  check('eta 4jt/500rb=8 bln', rescued.monthsToGoal, 8);
}

console.log('3) goal sudah tercapai');
{
  const sim = buildSimulation({ transactions: stableTx, totalBalance: 6000000, goal: { name: 'PS5', amount: 5000000 }, extraMonthly: 0, today: TODAY });
  check('reason reached', sim.reason, 'reached');
  check('monthsToGoal 0', sim.monthsToGoal, 0);
}

console.log('4) tanpa goal: proyeksi saldo saja');
{
  const sim = buildSimulation({ transactions: stableTx, totalBalance: 2000000, goal: null, extraMonthly: 0, today: TODAY });
  check('monthsToGoal null', sim.monthsToGoal, null);
  check('proyeksi 6 bln', sim.projections[0], { months: 6, balance: 5000000 });
  check('proyeksi 12 bln', sim.projections[1], { months: 12, balance: 8000000 });
}

console.log('5) data tipis & tanpa riwayat income');
{
  const few = [
    { date: '2026-08-01', type: 'expense', amount: 50000, category: 'Makan' },
    { date: '2026-08-02', type: 'expense', amount: 50000, category: 'Makan' },
    { date: '2026-08-03', type: 'expense', amount: 50000, category: 'Makan' },
  ];
  const thin = buildSimulation({ transactions: few, totalBalance: 0, goal: null, extraMonthly: 0, today: TODAY });
  check('few tx → thin', [thin.enoughData, thin.reason], [false, 'thin']);
  const noIncome = [
    { date: '2026-06-01', type: 'expense', amount: 50000, category: 'Makan' },
    { date: '2026-06-02', type: 'expense', amount: 50000, category: 'Makan' },
    { date: '2026-07-01', type: 'expense', amount: 50000, category: 'Makan' },
    { date: '2026-07-02', type: 'expense', amount: 50000, category: 'Makan' },
    { date: '2026-08-01', type: 'expense', amount: 50000, category: 'Makan' },
    { date: '2026-08-02', type: 'expense', amount: 50000, category: 'Makan' },
  ];
  const noInc = buildSimulation({ transactions: noIncome, totalBalance: 0, goal: null, extraMonthly: 0, today: TODAY });
  check('tanpa income bulan penuh → thin', [noInc.enoughData, noInc.reason], [false, 'thin']);
}

console.log('6) riwayat sparse: bulan kosong tidak mendilusi surplusAvg (bug DP9b #8)');
{
  const sparseTx = [
    ...stableMonth('2026', '07'),
    { date: '2026-08-01', type: 'income', amount: 4000000, category: 'Gaji' },
    { date: '2026-08-02', type: 'expense', amount: 100000, category: 'Makan' },
    { date: '2026-08-03', type: 'expense', amount: 50000, category: 'Transport' },
  ];
  /* Mei & Juni kosong; hanya Juli aktif (+500rb). Pembagi lama = 3 → 167rb. */
  const sim = buildSimulation({ transactions: sparseTx, totalBalance: 1000000, goal: { name: 'PS5', amount: 4000000 }, extraMonthly: 0, today: TODAY });
  check('surplusAvg tak terdilusi 500rb', sim.surplusAvg, 500000);
  check('baselineMonths 3jt/500rb=6 (bukan 18)', sim.baselineMonths, 6);
}

console.log(failures ? `\n${failures} CEK GAGAL` : '\nSEMUA PASS');
process.exit(failures ? 1 : 0);
