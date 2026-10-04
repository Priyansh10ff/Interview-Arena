// Turns scored arena sessions into per-company readiness.
// Readiness = average over ALL rounds in a company's loop, where each round uses
// recent form (mean of the last 2 attempts) and unattempted rounds count as 0.
// You are only "ready" for a company once you can pass its whole loop.

const scored = (sessions) => (sessions || []).filter(s => s.status === 'scored' && s.scorecard?.verdict)

const ts = (s) => s.scoredAt || s.endedAt || s.createdAt?.toMillis?.() || 0

export function roundStats(sessions, companyId, roundId) {
  const list = scored(sessions)
    .filter(s => s.companyId === companyId && s.roundId === roundId)
    .sort((a, b) => ts(b) - ts(a))
  if (!list.length) return null
  const recent = list.slice(0, 2)
  const percent = Math.round(recent.reduce((s, x) => s + x.scorecard.verdict.percent, 0) / recent.length)
  return { percent, attempts: list.length, lastVerdict: list[0].scorecard.verdict.key, lastId: list[0].id }
}

export function companyReadiness(sessions, company) {
  const rounds = {}
  let sum = 0, attempted = 0
  for (const r of company.rounds) {
    const st = roundStats(sessions, company.id, r.id)
    rounds[r.id] = st
    if (st) { sum += st.percent; attempted++ }
  }
  if (!attempted) return null
  return { percent: Math.round(sum / company.rounds.length), attempted, total: company.rounds.length, rounds }
}

export function readinessMap(sessions, companies) {
  const out = {}
  for (const c of companies) {
    const r = companyReadiness(sessions, c)
    if (r) out[c.id] = r
  }
  return out
}

// lowest-scoring rubric criteria across all scored rounds (min 2 data points each)
export function weakestCriteria(sessions, n = 3) {
  const agg = {}
  for (const s of scored(sessions)) {
    for (const c of s.scorecard.criteria || []) {
      const a = (agg[c.label] ||= { label: c.label, total: 0, count: 0 })
      a.total += c.score; a.count++
    }
  }
  return Object.values(agg)
    .filter(a => a.count >= 2)
    .map(a => ({ label: a.label, avg: Math.round((a.total / a.count) * 10) / 10, count: a.count }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, n)
}
