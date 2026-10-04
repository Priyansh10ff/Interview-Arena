import { describe, it, expect } from 'vitest'
import { pickVoice, cleanForSpeech } from '../speech'

describe('pickVoice', () => {
  it('prefers Indian English, then GB, then US', () => {
    const v = [{ lang: 'en-US', n: 1 }, { lang: 'en-GB', n: 2 }, { lang: 'en-IN', n: 3 }]
    expect(pickVoice(v).n).toBe(3)
    expect(pickVoice(v.slice(0, 2)).n).toBe(2)
  })
  it('falls back to any English, else null', () => {
    expect(pickVoice([{ lang: 'fr-FR' }, { lang: 'en-AU', n: 9 }]).n).toBe(9)
    expect(pickVoice([{ lang: 'fr-FR' }])).toBeNull()
    expect(pickVoice([])).toBeNull()
  })
})

describe('cleanForSpeech', () => {
  it('drops code blocks and markdown, reads big-O', () => {
    expect(cleanForSpeech('Look at **this**:\n```js\nx()\n```\nIt is `O(n log n)`'))
      .toBe('Look at this: (see the code) It is O of n log n')
  })
})
