/* Smoke test F3 rekomendasi 50/30/20 — fixture tetap, deterministik. */
import { buildBudgetRecommendation } from '../lib/recommend.js';

const TODAY = '2026-08-23';
const CATS = [
  { name: 'Makan & Minum', allocationType: 'kebutuhan' },
  { name: 'Transportasi', allocationType: 'kebutuhan' },
  { name: 'Hiburan', allocationType: 'keinginan' },
  { name: 'Nabung', allocationType: 'tabungan' },
];

function tx(date, type, category, amount) {
  return { id: `${date}-${category}`, type, category, amount, title: category, date };
}

/* Agu: income 5jt; kebutuhan 2jt (pas), keinginan 1,8jt (over dari ideal 1,5jt),
   tabungan 0 (under dari ideal 1jt) */
const txs = [
  tx('2026-08-01', 'income', 'Gaji', 5000000),
  tx('2026-08-03', 'expense', 'Makan & Minum', 2400000),
  tx('2026-08-10', 'expense', 'Transportasi', 100000),
  tx('2026-08-12', 'expense', 'Hiburan', 1800000),
  /* bulan lalu — tidak boleh ikut terhitung */
  tx('2026-07-15', 'expense', 'Nabung', 9000000),
];

let failures = 0;
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  if (!cond) failures += 1;
};

const r = buildBudgetRecommendation({ transactions: txs, categories: CATS, today: TODAY });
check('enoughData true', r.enoughData);
check('incomeBase = income bulan ini', r.incomeBase === 5000000);
const byId = Object.fromEntries(r.buckets.map((b) => [b.id, b]));
check('kebutuhan pas (2,4jt ≈ ideal 2,5jt)', byId.kebutuhan.status === 'pas', `actual=${byId.kebutuhan.actual}`);
check('keinginan over (1,8jt > 1,65jt)', byId.keinginan.status === 'over');
check('tabungan under (0 < 900rb)', byId.tabungan.status === 'under');
check('ideal mengikuti 50/30/20', byId.kebutuhan.ideal === 2500000 && byId.keinginan.ideal === 1500000 && byId.tabungan.ideal === 1000000);

/* Fallback kategori tak dikenal → kebutuhan */
const r2 = buildBudgetRecommendation({
  transactions: [tx('2026-08-01', 'income', 'Gaji', 1000000), tx('2026-08-05', 'expense', 'KategoriHilang', 300000)],
  categories: [], today: TODAY,
});
check('kategori tak dikenal fallback kebutuhan', r2.buckets[0].id === 'kebutuhan' && r2.buckets[0].actual === 300000 && r2.buckets[0].status === 'under');

/* Tanpa expense bulan ini → kosong */
const r3 = buildBudgetRecommendation({ transactions: [tx('2026-07-01', 'expense', 'Makan', 100)], categories: CATS, today: TODAY });
check('tanpa expense bulan ini → enoughData false', !r3.enoughData);

/* Determinisme */
const again = buildBudgetRecommendation({ transactions: txs, categories: CATS, today: TODAY });
check('deterministik (2x identik)', JSON.stringify(r) === JSON.stringify(again));

console.log(failures ? `\n${failures} GAGAL` : '\nSEMUA PASS');
process.exit(failures ? 1 : 0);
