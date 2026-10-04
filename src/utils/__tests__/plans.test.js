import { describe, it, expect } from 'vitest'
import { getPlan, monthKey, usageThisMonth, canStartRound } from '../plans'

describe('plans', () => {
  it('unknown plan falls back to free', () => {
    expect(getPlan('gold').id).toBe('free')
  })
  it('monthKey', () => {
    expect(monthKey(new Date(2026, 0, 5))).toBe('2026-01')
    expect(monthKey(new Date(2026, 9, 31))).toBe('2026-10')
  })
  it('counts only this month, from Firestore timestamps or startedAt', () => {
    const now = new Date(2026, 9, 15)
    const ts = (d) => ({ toMillis: () => d.getTime() })
    const sessions = [
      { createdAt: ts(new Date(2026, 9, 1)) },
      { createdAt: ts(new Date(2026, 9, 14)) },
      { startedAt: new Date(2026, 9, 2).getTime() },
      { createdAt: ts(new Date(2026, 8, 30)) },
      { createdAt: null },
    ]
    expect(usageThisMonth(sessions, now)).toBe(3)
  })
  it('free plan allows 3 rounds a month, pro is unlimited', () => {
    expect(canStartRound('free', 2)).toEqual({ allowed: true, remaining: 1, limit: 3 })
    expect(canStartRound('free', 3).allowed).toBe(false)
    expect(canStartRound('pro', 500).allowed).toBe(true)
  })
})
