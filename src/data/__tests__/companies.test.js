import { describe, it, expect } from 'vitest'
import { COMPANIES, getCompany, getRound } from '../companies'
import { ROUND_TYPES, getRoundType } from '../roundTypes'

describe('round types', () => {
  it.each(Object.entries(ROUND_TYPES))('%s rubric weights sum to 1', (_, t) => {
    expect(t.rubric.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1, 5)
  })
  it.each(Object.entries(ROUND_TYPES))('%s rubric ids are unique', (_, t) => {
    const ids = t.rubric.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('workspace is code or text', () => {
    for (const t of Object.values(ROUND_TYPES)) expect(['code', 'text']).toContain(t.workspace)
  })
})

describe('companies', () => {
  it('company ids are unique', () => {
    const ids = COMPANIES.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it.each(COMPANIES.map(c => [c.id, c]))('%s has valid rounds', (_, c) => {
    expect(c.rounds.length).toBeGreaterThan(0)
    const ids = c.rounds.map(r => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const r of c.rounds) {
      expect(getRoundType(r.type), `${c.id}/${r.id} type`).not.toBeNull()
      expect(r.durationMin).toBeGreaterThan(0)
      expect(r.persona.length).toBeGreaterThan(10)
      expect(r.focus.length).toBeGreaterThan(0)
    }
  })
  it('lookup helpers', () => {
    expect(getCompany('flipkart').name).toBe('Flipkart')
    expect(getRound('flipkart', 'machine_coding').type).toBe('machine_coding')
    expect(getRound('flipkart', 'nope')).toBeNull()
    expect(getCompany('nope')).toBeNull()
  })
})
