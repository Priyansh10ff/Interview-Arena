import { describe, it, expect } from 'vitest'
import { roundStats, companyReadiness, readinessMap, weakestCriteria } from '../readiness'
import { COMPANIES, getCompany } from '../../data/companies'

const s = (companyId, roundId, percent, scoredAt, criteria = []) => ({
  id: `${roundId}-${scoredAt}`, companyId, roundId, status: 'scored', scoredAt,
  scorecard: { verdict: { percent, key: percent >= 63 ? 'hire' : 'lean_no' }, criteria },
})

const flipkart = getCompany('flipkart') // 3 rounds

describe('roundStats', () => {
  it('uses the mean of the last two attempts', () => {
    const list = [s('flipkart', 'machine_coding', 20, 1), s('flipkart', 'machine_coding', 60, 2), s('flipkart', 'machine_coding', 80, 3)]
    const st = roundStats(list, 'flipkart', 'machine_coding')
    expect(st.percent).toBe(70)
    expect(st.attempts).toBe(3)
    expect(st.lastId).toBe('machine_coding-3')
  })
  it('ignores unscored sessions', () => {
    expect(roundStats([{ companyId: 'flipkart', roundId: 'hm', status: 'ended' }], 'flipkart', 'hm')).toBeNull()
  })
})

describe('companyReadiness', () => {
  it('counts unattempted rounds as zero', () => {
    const r = companyReadiness([s('flipkart', 'machine_coding', 90, 1)], flipkart)
    expect(r.percent).toBe(30)
    expect(r.attempted).toBe(1)
    expect(r.total).toBe(3)
  })
  it('is null with no attempts, and the map skips it', () => {
    expect(companyReadiness([], flipkart)).toBeNull()
    expect(readinessMap([s('google', 'phone', 50, 1)], COMPANIES)).toHaveProperty('google')
    expect(readinessMap([s('google', 'phone', 50, 1)], COMPANIES)).not.toHaveProperty('flipkart')
  })
})

describe('weakestCriteria', () => {
  it('ranks lowest averages with at least two data points', () => {
    const c = (label, score) => ({ label, score })
    const list = [
      s('google', 'phone', 50, 1, [c('Communication', 2), c('Complexity analysis', 1), c('Rare', 1)]),
      s('google', 'onsite', 50, 2, [c('Communication', 3), c('Complexity analysis', 2)]),
    ]
    const w = weakestCriteria(list)
    expect(w.map(x => x.label)).toEqual(['Complexity analysis', 'Communication'])
    expect(w[0].avg).toBe(1.5)
  })
})
