import { describe, it, expect } from 'vitest'
import {
  turnBudget, buildInterviewerSystemPrompt, toApiMessages, normalizeInterviewerReply,
  shouldForceWrapup, formatClock, truncateCode, START_MESSAGE, WRAPUP_MESSAGE,
} from '../arenaEngine'
import { getCompany, getRound } from '../../data/companies'
import { getRoundType } from '../../data/roundTypes'
import { parseJSONLoose } from '../../services/openrouter'

const company = getCompany('flipkart')
const round = getRound('flipkart', 'machine_coding')
const type = getRoundType(round.type)

describe('turnBudget', () => {
  it('clamps between 6 and 14', () => {
    expect(turnBudget(10)).toBe(6)
    expect(turnBudget(45)).toBe(8)
    expect(turnBudget(90)).toBe(14)
    expect(turnBudget(500)).toBe(14)
  })
})

describe('system prompt', () => {
  it('includes company, persona, level and code rule', () => {
    const p = buildInterviewerSystemPrompt({ company, round, type, level: 'intern' })
    expect(p).toContain('Flipkart')
    expect(p).toContain(round.persona)
    expect(p).toContain('an intern')
    expect(p).toContain('[CODE]')
    expect(p).toContain(`about ${turnBudget(90)} candidate replies`)
  })
  it('text rounds have no code editor rule', () => {
    const r = getRound('amazon', 'lp')
    const p = buildInterviewerSystemPrompt({ company: getCompany('amazon'), round: r, type: getRoundType(r.type), level: 'sde1' })
    expect(p).toContain('no code editor')
  })
})

describe('toApiMessages', () => {
  const transcript = [
    { role: 'interviewer', text: 'Hi, build a parking lot.', stage: 'problem' },
    { role: 'candidate', text: 'Sure', code: 'class A {}' },
    { role: 'interviewer', text: 'Why a class?', stage: 'probing' },
    { role: 'candidate', text: 'Updated', code: 'class B {}' },
  ]
  it('maps roles and only sends latest code', () => {
    const m = toApiMessages('SYS', transcript)
    expect(m[0]).toEqual({ role: 'system', content: 'SYS' })
    expect(m[1].content).toBe(START_MESSAGE)
    expect(m[2].role).toBe('assistant')
    expect(JSON.parse(m[2].content).message).toBe('Hi, build a parking lot.')
    expect(m[3].content).toContain('earlier code snapshot omitted')
    expect(m[3].content).not.toContain('class A')
    expect(m[5].content).toContain('[CODE]\nclass B {}')
  })
  it('appends wrap-up instruction when forced', () => {
    const m = toApiMessages('SYS', transcript, { forceWrapup: true })
    expect(m.at(-1).content).toBe(WRAPUP_MESSAGE)
  })
})

describe('normalizeInterviewerReply', () => {
  it('passes valid replies through', () => {
    expect(normalizeInterviewerReply({ message: ' hi ', stage: 'intro', done: false }))
      .toEqual({ message: 'hi', stage: 'intro', done: false })
  })
  it('repairs bad shapes', () => {
    expect(normalizeInterviewerReply(null)).toEqual({ message: 'Sorry, could you repeat that?', stage: 'probing', done: false })
    expect(normalizeInterviewerReply({ message: 'x', stage: 'weird' }).stage).toBe('probing')
    expect(normalizeInterviewerReply({ message: 'x', done: 'true' }).done).toBe(true)
  })
  it('wrapup stage ends unless explicitly not done', () => {
    expect(normalizeInterviewerReply({ message: 'bye', stage: 'wrapup' }).done).toBe(true)
    expect(normalizeInterviewerReply({ message: 'one more', stage: 'wrapup', done: false }).done).toBe(false)
  })
})

describe('wrap-up and clock', () => {
  it('forces wrap-up on turns or time', () => {
    const r = { durationMin: 45 }
    const t = Array.from({ length: 8 }, () => ({ role: 'candidate', text: 'a' }))
    expect(shouldForceWrapup(t, r, 0)).toBe(true)
    expect(shouldForceWrapup(t.slice(0, 2), r, 45 * 60)).toBe(true)
    expect(shouldForceWrapup(t.slice(0, 2), r, 100)).toBe(false)
  })
  it('formats mm:ss', () => {
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(605)).toBe('10:05')
  })
  it('truncates long code', () => {
    expect(truncateCode('a'.repeat(5000))).toContain('truncated')
    expect(truncateCode('short')).toBe('short')
  })
})

describe('parseJSONLoose', () => {
  it('handles fences and surrounding prose', () => {
    expect(parseJSONLoose('```json\n{"a":1}\n```')).toEqual({ a: 1 })
    expect(parseJSONLoose('Sure! {"a":2} hope that helps')).toEqual({ a: 2 })
  })
  it('throws on garbage', () => {
    expect(() => parseJSONLoose('nope')).toThrow(/invalid JSON/)
  })
})

describe('interviewerTurn (simulated interview)', async () => {
  const { interviewerTurn, buildInterviewerSystemPrompt: sp } = await import('../arenaEngine')
  const system = sp({ company, round, type, level: 'sde1' })

  it('runs a full scripted interview against a fake model', async () => {
    const replies = [
      { message: 'Hi! Build a parking lot system.', stage: 'problem', done: false },
      'not json at all',                                   // model glitch -> normalised
      { message: 'Now add EV charging spots.', stage: 'followup' },
      { message: 'Thanks, that is time.', stage: 'wrapup', done: true },
    ]
    const seen = []
    const fake = async (messages) => {
      seen.push(messages)
      const r = replies[seen.length - 1]
      return typeof r === 'string' ? null : r
    }
    let t = []
    let res = await interviewerTurn(fake, system, t)
    expect(res.done).toBe(false)
    t = [...res.transcript, { role: 'candidate', text: 'Clarify: how many floors?', code: 'class Lot {}' }]
    res = await interviewerTurn(fake, system, t)
    expect(res.reply.message).toBe('Sorry, could you repeat that?')
    t = [...res.transcript, { role: 'candidate', text: 'Added Floor class', code: 'class Lot {}\nclass Floor {}' }]
    res = await interviewerTurn(fake, system, t)
    expect(res.reply.stage).toBe('followup')
    t = [...res.transcript, { role: 'candidate', text: 'Strategy pattern for spot types' }]
    res = await interviewerTurn(fake, system, t)
    expect(res.done).toBe(true)
    expect(res.transcript.filter(x => x.role === 'interviewer')).toHaveLength(4)
    // last request only carries the latest code snapshot
    const lastReq = seen.at(-1).filter(m => m.role !== 'system').map(m => m.content).join('\n')
    expect(lastReq).toContain('class Floor {}')
    expect(lastReq.match(/\[CODE\]/g)).toHaveLength(1)
  })

  it('forced wrap-up always ends the round', async () => {
    const fake = async () => ({ message: 'ok, one more question', stage: 'probing', done: false })
    const res = await interviewerTurn(fake, system, [], { forceWrapup: true })
    expect(res.done).toBe(true)
  })
})
