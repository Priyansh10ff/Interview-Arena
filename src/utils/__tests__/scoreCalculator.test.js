import { describe, it, expect } from 'vitest'
import { calcInterviewScore, calcOverallScore, getGrade, normalizeReview, toScore10 } from '../scoreCalculator'

describe('scoreCalculator', () => {
  it('averages round scores onto a 0-100 scale', () => {
    expect(calcInterviewScore([{ score: 8 }, { score: 6 }])).toBe(70)
    expect(calcInterviewScore([])).toBe(0)
  })
  it('weights interview 60 / code 40', () => {
    expect(calcOverallScore(80, 50)).toBe(68)
  })
  it('maps scores to grades', () => {
    expect(getGrade(95).grade).toBe('S')
    expect(getGrade(40).grade).toBe('D')
  })
})

describe('model output guards', () => {
  it('toScore10 keeps low scores instead of replacing them', () => {
    expect(toScore10(0)).toBe(1)        // clamped, not replaced with the fallback
    expect(toScore10('7')).toBe(7)
    expect(toScore10(42)).toBe(10)
    expect(toScore10(undefined)).toBe(5)
  })
  it('normalizeReview coerces bad shapes', () => {
    const r = normalizeReview({ healthScore: '140', issues: [{ severity: 'critical', description: 'x' }, null], strengths: 'nope' })
    expect(r.healthScore).toBe(100)
    expect(r.issues).toEqual([{ severity: 'low', description: 'x' }])
    expect(r.strengths).toEqual([])
    expect(normalizeReview(null).healthScore).toBe(50)
  })
})
