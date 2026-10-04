import { describe, it, expect } from 'vitest'
import { lineDiff } from '../lineDiff'

const fmt = (d) => d.map(x => ({ same: ' ', add: '+', remove: '-' }[x.type] + x.text)).join('|')

describe('lineDiff', () => {
  it('keeps unchanged lines aligned after an insertion', () => {
    expect(fmt(lineDiff('a\nb\nc', 'a\nX\nb\nc'))).toBe(' a|+X| b| c')
  })
  it('shows a modified line as remove + add in place', () => {
    expect(fmt(lineDiff('a\nb\nc', 'a\nB\nc'))).toBe(' a|-b|+B| c')
  })
  it('handles deletions and empty input', () => {
    expect(fmt(lineDiff('a\nb', 'a'))).toBe(' a|-b')
    expect(fmt(lineDiff('', 'x'))).toBe('-|+x')
    expect(fmt(lineDiff(null, null))).toBe(' ')
  })
})
