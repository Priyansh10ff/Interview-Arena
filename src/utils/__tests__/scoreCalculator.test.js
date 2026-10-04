import { describe, it, expect } from 'vitest'
import { calcInterviewScore, calcOverallScore, getGrade } from '../scoreCalculator'

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
