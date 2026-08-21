const DAY_MS = 86400000;

export function todayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function dayKey(value) {
  return value ? String(value).slice(0, 10) : null;
}

function daysBetween(fromKey, toKey) {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS);
}

export function nextStreak(lastActivityDate, streakCurrent = 0, streakLongest = 0) {
  const today = todayStr();
  const last = dayKey(lastActivityDate);
  let current = streakCurrent ?? 0;
  if (!last) {
    current = 1;
  } else {
    const gap = daysBetween(last, today);
    if (gap === 1) current += 1;
    else if (gap > 1) current = 1;
  }
  return { streakCurrent: current, streakLongest: Math.max(streakLongest ?? 0, current), today };
}
