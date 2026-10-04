import { describe, it, expect } from 'vitest'
import { normalizeTopicChallenge as norm } from '../topicChallenge'

describe('normalizeTopicChallenge', () => {
  it('repairs MCQ answerIndex strings and drops broken questions', () => {
    const r = norm('mcq', { questions: [
      { q: 'A?', options: ['x', 'y', 'z', 'w'], answerIndex: '2', explanation: 'e' },
      { q: 'B?', options: ['x'], answerIndex: 0 },
      { q: 'C?', options: ['x', 'y'], answerIndex: 5 },
    ] })
    expect(r.questions).toHaveLength(1)
    expect(r.questions[0].answerIndex).toBe(2)
  })
  it('throws instead of rendering an empty challenge', () => {
    expect(() => norm('mcq', { questions: [] })).toThrow()
    expect(() => norm('descriptive', null)).toThrow()
    expect(() => norm('coding', { title: 'x' })).toThrow()
  })
  it('fills coding defaults', () => {
    const r = norm('coding', { description: 'Sum two numbers', constraints: ['n<10', 3] })
    expect(r.title).toBe('Coding Challenge')
    expect(r.examples).toEqual([])
    expect(r.constraints).toEqual(['n<10'])
  })
})
