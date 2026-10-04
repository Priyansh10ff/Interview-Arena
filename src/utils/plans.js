// Plans and usage limits for Arena rounds.
// NOTE: limits are enforced client-side for now. Before charging real money,
// move enforcement server-side (Cloud Function that creates arena sessions).

export const PLANS = {
  free: {
    id: 'free', name: 'Free', priceInr: 0,
    arenaRoundsPerMonth: 3,
    features: [
      '3 company rounds per month',
      'Live AI interviewer with voice',
      'Rubric scorecard + hire verdict',
      'Unlimited code review sessions (your own API key)',
    ],
  },
  pro: {
    id: 'pro', name: 'Pro', priceInr: 299,
    arenaRoundsPerMonth: Infinity,
    features: [
      'Unlimited company rounds',
      'All 9 company tracks, every round type',
      'Company readiness tracking',
      'Priority access to new companies and rounds',
    ],
  },
}

export const getPlan = (id) => PLANS[id] || PLANS.free

export function monthKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const sessionTime = (s) => s.createdAt?.toMillis?.() ?? s.startedAt ?? null

export function usageThisMonth(sessions, now = new Date()) {
  const key = monthKey(now)
  return (sessions || []).filter(s => {
    const t = sessionTime(s)
    return t != null && monthKey(t) === key
  }).length
}

export function canStartRound(planId, used) {
  const limit = getPlan(planId).arenaRoundsPerMonth
  const remaining = Math.max(0, limit - used)
  return { allowed: used < limit, remaining, limit }
}
