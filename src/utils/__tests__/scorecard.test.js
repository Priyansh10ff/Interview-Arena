import { describe, it, expect } from 'vitest'
import { buildScorecardPrompt, normalizeScorecard, computeVerdict, renderTranscript } from '../scorecard'
import { getCompany, getRound } from '../../data/companies'
import { getRoundType } from '../../data/roundTypes'

const company = getCompany('razorpay')
const round = getRound('razorpay', 'machine_coding')
const type = getRoundType(round.type)
const rubric = type.rubric

const mk = (scores) => rubric.map((c, i) => ({ ...c, score: scores[i] }))

describe('computeVerdict', () => {
  it('all 4s is strong hire at 100%', () => {
    const v = computeVerdict(mk([4, 4, 4, 4]))
    expect(v.key).toBe('strong_hire'); expect(v.percent).toBe(100)
  })
  it('all 1s is no hire at 0%', () => {
    const v = computeVerdict(mk([1, 1, 1, 1]))
    expect(v.key).toBe('no_hire'); expect(v.percent).toBe(0)
  })
  it('all 3s is hire', () => {
    expect(computeVerdict(mk([3, 3, 3, 3])).key).toBe('hire')
  })
  it('weights matter', () => {
    // correctness .3, modularity .3, extensibility .2, communication .2
    const v = computeVerdict(mk([3, 3, 2, 2]))
    expect(v.weighted).toBe(2.6)
    expect(v.key).toBe('lean_no')
  })
  it('a 1 on a heavy criterion caps a hire', () => {
    const v = computeVerdict(mk([1, 4, 4, 4]))
    expect(v.weighted).toBeGreaterThanOrEqual(2.9)
    expect(v.key).toBe('lean_no')
    expect(v.capped).toBe(true)
  })
})

describe('normalizeScorecard', () => {
  it('matches by id, clamps scores and fills gaps', () => {
    const raw = {
      criteria: [
        { id: 'correctness', score: 7, evidence: 'ran end to end' },
        { id: 'modularity', score: '0' },
        { id: 'communication', score: 3.4 },
      ],
      summary: 'ok', strengths: ['a', 2, ''], redFlags: 'nope', nextSteps: ['x', 'y', 'z', 'w'],
    }
    const s = normalizeScorecard(raw, rubric)
    expect(s.criteria.map(c => c.score)).toEqual([4, 1, 2, 3])
    expect(s.criteria[2].evidence).toMatch(/Not assessed/)
    expect(s.strengths).toEqual(['a'])
    expect(s.redFlags).toEqual([])
    expect(s.nextSteps).toHaveLength(3)
  })
  it('falls back to positional matching when ids are wrong but count matches', () => {
    const raw = { criteria: [{ id: 'a', score: 4 }, { id: 'b', score: 3 }, { id: 'c', score: 2 }, { id: 'd', score: 1 }] }
    expect(normalizeScorecard(raw, rubric).criteria.map(c => c.score)).toEqual([4, 3, 2, 1])
  })
  it('survives garbage', () => {
    const s = normalizeScorecard(null, rubric)
    expect(s.criteria).toHaveLength(4)
    expect(s.criteria.every(c => c.score === 2)).toBe(true)
  })
})

describe('prompt', () => {
  const transcript = [
    { role: 'interviewer', text: 'Build a wallet.' },
    { role: 'candidate', text: 'I will use a ledger table.' },
  ]
  it('includes rubric ids, transcript and final code for code rounds', () => {
    const p = buildScorecardPrompt({ company, round, type, level: 'sde1', transcript, code: 'class Wallet {}' })
    for (const c of rubric) expect(p.user).toContain(c.id)
    expect(p.user).toContain('CANDIDATE: I will use a ledger table.')
    expect(p.user).toContain('class Wallet {}')
    expect(p.system).toContain('Razorpay')
  })
  it('keeps the tail of very long transcripts', () => {
    const long = Array.from({ length: 400 }, (_, i) => ({ role: 'candidate', text: `answer number ${i}` }))
    const r = renderTranscript(long)
    expect(r.length).toBeLessThanOrEqual(9001)
    expect(r).toContain('answer number 399')
    expect(r.startsWith('…')).toBe(true)
  })
})
