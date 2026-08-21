export const BASE_XP = 10;
export const BONUS_XP = 5;
export const XP_PER_LEVEL_STEP = 50;

export function levelFromXp(xp) {
  return Math.floor(Math.sqrt(Math.max(0, Number(xp) || 0) / XP_PER_LEVEL_STEP)) + 1;
}

export function titleForLevel(level) {
  if (level >= 10) return 'Sultan Circle';
  if (level >= 6) return 'Jagoan Anggaran';
  if (level >= 3) return 'Rajin Cuan';
  return 'Pemula Nabung';
}

export function xpToReach(level) {
  return XP_PER_LEVEL_STEP * (level - 1) * (level - 1);
}

export function levelProgress(xp) {
  const safeXp = Math.max(0, Number(xp) || 0);
  const level = levelFromXp(safeXp);
  const floorXp = xpToReach(level);
  const ceilingXp = xpToReach(level + 1);
  const span = ceilingXp - floorXp;
  return {
    level,
    title: titleForLevel(level),
    xpIntoLevel: safeXp - floorXp,
    xpForNextLevel: span,
    percent: Math.min(100, Math.max(0, Math.round(((safeXp - floorXp) / span) * 100))),
  };
}

export function hitungXpEarned(transaction, transactions, budgets) {
  let xp = BASE_XP;
  const limit = budgets?.[transaction.category];
  if (transaction.type === 'expense' && Number.isFinite(limit) && limit > 0) {
    const monthKey = transaction.date.slice(0, 7);
    const spentBefore = transactions
      .filter((item) => item.type === 'expense' && item.category === transaction.category && item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + item.amount, 0);
    if (spentBefore + transaction.amount <= limit) xp += BONUS_XP;
  }
  return xp;
}
