// Calendar-day keys in the user's LOCAL timezone.
// toISOString() is UTC: in India (UTC+5:30) it put every day before 5:30am on
// the previous date and made "today" look like yesterday on the streak calendar.
export function localDateKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d)) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const toDate = (ts) => (ts?.toDate ? ts.toDate() : ts != null ? new Date(ts) : null)
export const toMillis = (ts) => ts?.toMillis?.() ?? (ts != null ? new Date(ts).getTime() : 0)
