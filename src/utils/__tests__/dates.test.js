import { describe, it, expect } from 'vitest'
import { localDateKey, toMillis } from '../dates'

describe('localDateKey', () => {
  it('uses local calendar date, not UTC', () => {
    const early = new Date(2026, 9, 5, 1, 30) // 1:30am local
    expect(localDateKey(early)).toBe('2026-10-05')
  })
  it('handles bad input', () => {
    expect(localDateKey('nope')).toBeNull()
  })
  it('toMillis handles Firestore timestamps, numbers and nulls', () => {
    expect(toMillis({ toMillis: () => 5 })).toBe(5)
    expect(toMillis(7)).toBe(7)
    expect(toMillis(null)).toBe(0)
  })
})
