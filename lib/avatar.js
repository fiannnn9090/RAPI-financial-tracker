/* F9 — Avatar & Misi Border (fungsi murni, tanpa React/DB).
   Avatar: DiceBear offline (paket npm, deterministik dari seed — tanpa network).
   Misi border: evaluasi murni dari profil + flag feature_usage. */

import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';

export const AVATAR_STYLE = 'adventurer';
export const GRID_SIZE = 12;

export const BORDER_TIERS = ['none', 'bronze', 'silver', 'gold', 'platinum'];

/* Urutan misi = urutan tier; unlock dihitung ulang tiap render (pola badge),
   persist di user_missions agar perayaan hanya sekali & tier tidak menurun. */
export const MISSIONS = [
  { code: 'bronze_profile', tier: 'bronze' },
  { code: 'silver_streak', tier: 'silver' },
  { code: 'gold_level5', tier: 'gold' },
  { code: 'platinum_explore', tier: 'platinum' },
];

const TIER_RANK = { none: 0, bronze: 1, silver: 2, gold: 3, platinum: 4 };

const missionByCode = Object.fromEntries(MISSIONS.map((mission) => [mission.code, mission]));

/* SVG string avatar untuk sebuah seed. Hasil deterministik: seed sama →
   SVG identik, aman di-memoize/di-cache di mana pun. */
export function avatarSvg(seed, size = 96) {
  return createAvatar(adventurer, { seed: String(seed ?? ''), size }).toString();
}

/* 12 seed grid pemilih: deterministik per (username, batch) supaya kembali
   ke halaman tidak mengacak-acak pilihan; tombol "Acak lagi" naikkan batch. */
export function seedsBatch(username, batch = 0) {
  const base = String(username ?? '').trim().toLowerCase() || 'rapi';
  return Array.from({ length: GRID_SIZE }, (_, i) => `${base}#${Number(batch) || 0}#${i + 1}`);
}

/* Evaluasi misi — semua input dari data yang sudah ada di memori:
   - bronze: avatar_seed terisi DAN username pernah diganti (flag username_changed)
   - silver: streak_current >= 7
   - gold:   level >= 5
   - platinum: 4 flag jelajah lengkap */
export function evaluateMissions({ avatarSeed = null, usernameChanged = false, streakCurrent = 0, level = 1, usage = [] } = {}) {
  const flags = usage instanceof Set ? usage : new Set(usage);
  const safeLevel = Math.max(0, Number(level) || 0);
  const safeStreak = Math.max(0, Number(streakCurrent) || 0);
  const exploreDone = ['simulate', 'goal', 'debts', 'theme'].every((feature) => flags.has(feature));
  const conditions = {
    bronze_profile: Boolean(avatarSeed) && (Boolean(usernameChanged) || flags.has('username_changed')),
    silver_streak: safeStreak >= 7,
    gold_level5: safeLevel >= 5,
    platinum_explore: exploreDone,
  };
  return MISSIONS.map((mission) => ({ ...mission, unlocked: Boolean(conditions[mission.code]) }));
}

/* Tier tertinggi dari kumpulan kode misi yang dimiliki ('none' bila kosong). */
export function highestTier(codes = []) {
  let best = 'none';
  for (const code of codes) {
    const mission = missionByCode[code];
    if (mission && TIER_RANK[mission.tier] > TIER_RANK[best]) best = mission.tier;
  }
  return best;
}

export function borderRank(tier) {
  return TIER_RANK[tier] ?? 0;
}
