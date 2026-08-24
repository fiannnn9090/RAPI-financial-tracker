/* Smoke test F9 — lib/avatar.js (murni, tanpa DB/UI).
   Jalankan: npx --no-install esbuild scripts/avatar.smoke.mjs --bundle --platform=node --format=esm --outfile=/tmp/sm_avatar.mjs && node /tmp/sm_avatar.mjs */
import assert from 'node:assert';
import {
  AVATAR_STYLE,
  BORDER_TIERS,
  GRID_SIZE,
  MISSIONS,
  avatarSvg,
  borderRank,
  evaluateMissions,
  highestTier,
  seedsBatch,
} from '../lib/avatar';

let passed = 0;
function ok(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}\n${error.message}`);
    process.exitCode = 1;
  }
}

console.log('F9 avatar.smoke');

ok('avatarSvg deterministik & berbeda antar seed', () => {
  const a1 = avatarSvg('fiande#0#1', 96);
  const a2 = avatarSvg('fiande#0#1', 96);
  const b = avatarSvg('budi#0#1', 96);
  assert.equal(a1, a2);
  assert.notEqual(a1, b);
  assert.ok(a1.startsWith('<svg'));
});

ok('avatarSvg ukuran mempengaruhi width/height', () => {
  assert.ok(avatarSvg('x', 40).includes('width="40"'));
  assert.ok(avatarSvg('x', 120).includes('width="120"'));
});

ok('seedsBatch: 12 unik, deterministik, batch mengubah hasil', () => {
  const s0 = seedsBatch('Fiande', 0);
  assert.equal(s0.length, GRID_SIZE);
  assert.equal(new Set(s0).size, GRID_SIZE);
  assert.deepEqual(s0, seedsBatch(' fiande ', 0));
  assert.notDeepEqual(s0, seedsBatch('Fiande', 1));
  assert.ok(seedsBatch('', 0).every((seed) => seed.startsWith('rapi#')));
});

ok('evaluateMissions kosong → semua terkunci', () => {
  for (const mission of evaluateMissions({})) assert.equal(mission.unlocked, false);
});

ok('bronze butuh avatar DAN username_changed', () => {
  const onlyAvatar = evaluateMissions({ avatarSeed: 's', usage: [] });
  const onlyName = evaluateMissions({ usernameChanged: true, usage: [] });
  const both = evaluateMissions({ avatarSeed: 's', usernameChanged: true, usage: [] });
  assert.equal(onlyAvatar.find((m) => m.code === 'bronze_profile').unlocked, false);
  assert.equal(onlyName.find((m) => m.code === 'bronze_profile').unlocked, false);
  assert.equal(both.find((m) => m.code === 'bronze_profile').unlocked, true);
});

ok('silver di streak 7, tidak di 6; Set maupun array diterima', () => {
  const six = evaluateMissions({ streakCurrent: 6 });
  const sevenArr = evaluateMissions({ streakCurrent: 7, usage: [] });
  const sevenSet = evaluateMissions({ streakCurrent: 7, usage: new Set() });
  assert.equal(six.find((m) => m.code === 'silver_streak').unlocked, false);
  assert.equal(sevenArr.find((m) => m.code === 'silver_streak').unlocked, true);
  assert.equal(sevenSet.find((m) => m.code === 'silver_streak').unlocked, true);
});

ok('gold di level 5, tidak di level 4; input kotor aman', () => {
  assert.equal(evaluateMissions({ level: 4 }).find((m) => m.code === 'gold_level5').unlocked, false);
  assert.equal(evaluateMissions({ level: 5 }).find((m) => m.code === 'gold_level5').unlocked, true);
  assert.equal(evaluateMissions({ level: '9' }).find((m) => m.code === 'gold_level5').unlocked, true);
  assert.equal(evaluateMissions({ level: null }).find((m) => m.code === 'gold_level5').unlocked, false);
});

ok('platinum butuh 4 flag lengkap', () => {
  const three = evaluateMissions({ usage: ['simulate', 'goal', 'debts'] });
  const four = evaluateMissions({ usage: ['simulate', 'goal', 'debts', 'theme'] });
  assert.equal(three.find((m) => m.code === 'platinum_explore').unlocked, false);
  assert.equal(four.find((m) => m.code === 'platinum_explore').unlocked, true);
});

ok('kombinasi lengkap: 4 misi terbuka sekaligus', () => {
  const all = evaluateMissions({ avatarSeed: 's', usernameChanged: true, streakCurrent: 9, level: 6, usage: ['simulate', 'goal', 'debts', 'theme'] });
  assert.deepEqual(all.filter((m) => m.unlocked).map((m) => m.tier), ['bronze', 'silver', 'gold', 'platinum']);
});

ok('highestTier & borderRank urut none<bronze<silver<gold<platinum', () => {
  assert.deepEqual(BORDER_TIERS, ['none', 'bronze', 'silver', 'gold', 'platinum']);
  assert.equal(highestTier([]), 'none');
  assert.equal(highestTier(['bronze_profile']), 'bronze');
  assert.equal(highestTier(['bronze_profile', 'gold_level5']), 'gold');
  assert.equal(highestTier(['silver_streak', 'platinum_explore', 'unknown_code']), 'platinum');
  assert.equal(borderRank('none'), 0);
  assert.equal(borderRank('platinum'), 4);
});

console.log(`Selesai: ${passed} case PASS${process.exitCode ? ' (ADA YANG GAGAL)' : ''}`);
