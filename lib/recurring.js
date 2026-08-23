/* Logika murni transaksi berulang — tanpa dependency, bisa dites via Node.
   Semantik day_of_period:
   - monthly: tanggal 1-28
   - weekly : hari dalam minggu, 1=Senin ... 7=Minggu */

export function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isoDow(dateStr) {
  const dow = new Date(`${dateStr}T00:00:00`).getDay();
  return dow === 0 ? 7 : dow;
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function monthlyDate(year, monthIndex, day) {
  const clampedDay = Math.min(day, daysInMonth(year, monthIndex));
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
}

function shiftMonth(year, monthIndex, delta) {
  const total = year * 12 + monthIndex + delta;
  return [Math.floor(total / 12), ((total % 12) + 12) % 12];
}

/* Occurrence pertama pada atau setelah fromDate */
export function occurrenceOnOrAfter({ frequency, dayOfPeriod }, fromDate) {
  const d = new Date(`${fromDate}T00:00:00`);
  if (frequency === 'weekly') {
    const delta = (dayOfPeriod - isoDow(fromDate) + 7) % 7;
    return addDays(fromDate, delta);
  }
  let [year, month] = [d.getFullYear(), d.getMonth()];
  for (let i = 0; i < 13; i += 1) {
    const candidate = monthlyDate(year, month, dayOfPeriod);
    if (candidate >= fromDate) return candidate;
    [year, month] = shiftMonth(year, month, 1);
  }
  return fromDate;
}

/* Occurrence pertama setelah-lewat-fromDate (ketat) */
export function nextOccurrence(rule, afterDate) {
  return occurrenceOnOrAfter(rule, addDays(afterDate, 1));
}

/* Semua jatuh tempo dari fromDate (inklusif) s/d toDate (inklusif) */
export function dueDatesBetween(rule, fromDate, toDate) {
  const dates = [];
  let cursor = occurrenceOnOrAfter(rule, fromDate);
  while (cursor <= toDate && dates.length < 400) {
    dates.push(cursor);
    cursor = nextOccurrence(rule, cursor);
  }
  return dates;
}

/* Kumpulkan transaksi yang jatuh tempo s/d todayStr.
   Cap per aturan: kalau terlewat lebih dari `cap`, sisanya di-fast-forward. */
export function generateDue(recurrings, todayStr, cap = 6) {
  const rows = [];
  const updates = [];
  let generated = 0;
  for (const rule of recurrings) {
    if (!rule.isActive || rule.nextRunDate > todayStr) continue;
    const dates = dueDatesBetween(rule, rule.nextRunDate, todayStr);
    const taken = dates.slice(0, cap);
    for (const date of taken) {
      /* ruleId hanya untuk konsumsi pemanggil (resolusi wallet_id F4) —
         wajib distrip sebelum INSERT ke tabel transactions. */
      rows.push({ type: rule.type, title: rule.title, amount: rule.amount, category: rule.category, date, ruleId: rule.id });
      generated += 1;
    }
    updates.push({ id: rule.id, nextRunDate: nextOccurrence(rule, todayStr) });
  }
  return { rows, updates, generated };
}
