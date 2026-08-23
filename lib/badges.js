export const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 };

export const FALLBACK_BADGE_DEFS = [
  { code: 'first_step', title: 'Langkah pertama', icon: '🌱', note: 'Mulai mencatat!', rarity: 'common' },
  { code: 'first_income', title: 'Cuan masuk', icon: '💸', note: 'Pemasukan pertama', rarity: 'common' },
  { code: 'five_logged', title: 'Rajin mencatat', icon: '🔥', note: '5 transaksi tercatat', rarity: 'rare' },
  { code: 'logged_25', title: 'Kolektor momen', icon: '💎', note: '25 transaksi tercatat', rarity: 'rare' },
  { code: 'consistent_3d', title: 'Konsisten', icon: '⚡', note: 'Catat di 3 hari berbeda', rarity: 'epic' },
  { code: 'wishlist_done', title: 'Wishlist tercapai', icon: '🏆', note: 'Satu impian berhasil diwujudkan', rarity: 'epic' },
  { code: 'streak_7', title: 'Setia datang', icon: '📅', note: 'Streak 7 hari beruntun', rarity: 'epic' },
  { code: 'challenge_1', title: 'Menang pertama', icon: '🥇', note: 'Selesaikan 1 tantangan mingguan', rarity: 'common' },
  { code: 'challenge_5', title: 'Pemburu tantangan', icon: '🎖️', note: 'Selesaikan 5 tantangan mingguan', rarity: 'rare' },
  { code: 'level_6', title: 'Jagoan Anggaran', icon: '🚀', note: 'Capai level 6', rarity: 'legendary' },
];

export const BADGE_METRICS = {
  first_step: { metric: 'transactions', target: 1 },
  first_income: { metric: 'income', target: 1 },
  five_logged: { metric: 'transactions', target: 5 },
  logged_25: { metric: 'transactions', target: 25 },
  consistent_3d: { metric: 'active_days', target: 3 },
  wishlist_done: { metric: 'goals_claimed', target: 1 },
  streak_7: { metric: 'streak', target: 7 },
  challenge_1: { metric: 'challenges_won', target: 1 },
  challenge_5: { metric: 'challenges_won', target: 5 },
  level_6: { metric: 'level', target: 6 },
};

export function badgeStats({ transactions, achievements, streakCurrent, level, challengesWon = 0 }) {
  return {
    transactions: transactions.length,
    income: transactions.some((item) => item.type === 'income') ? 1 : 0,
    active_days: new Set(transactions.map((item) => item.date)).size,
    goals_claimed: achievements.length,
    streak: streakCurrent ?? 0,
    challenges_won: challengesWon,
    level: level ?? 1,
  };
}

/* Title & note badge bilingual: kunci DICT per code (badge.<code>.title/.note).
   Badge dari DB yang tak punya terjemahan tetap pakai title/note aslinya (fallback). */
import { tl } from './i18n';

export function evaluateBadges(defs, stats, unlockedCodes, lang = 'id') {
  return defs
    .map((def) => {
      const config = BADGE_METRICS[def.code] ?? { metric: 'transactions', target: 1 };
      const current = stats[config.metric] ?? 0;
      const unlocked = current >= config.target || unlockedCodes.has(def.code);
      return {
        ...def,
        title: tl(lang, `badge.${def.code}.title`, undefined, def.title),
        note: tl(lang, `badge.${def.code}.note`, undefined, def.note),
        current,
        target: config.target,
        progress: Math.min(1, current / config.target),
        unlocked,
      };
    })
    .sort((a, b) => (
      Number(b.unlocked) - Number(a.unlocked)
      || RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]
      || b.progress - a.progress
    ));
}
