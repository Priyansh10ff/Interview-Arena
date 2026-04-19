import { useState, useMemo } from 'react'

function computeDiff(before, after) {
  const bLines = String(before || '').split('\n')
  const aLines = String(after  || '').split('\n')
  const out = []
  let bi = 0, ai = 0
  while (bi < bLines.length || ai < aLines.length) {
    if (bi < bLines.length && ai < aLines.length && bLines[bi] === aLines[ai]) {
      out.push({ type: 'same',   text: bLines[bi] }); bi++; ai++
    } else if (ai < aLines.length && (bi >= bLines.length || bLines[bi] !== aLines[ai])) {
      out.push({ type: 'add',    text: aLines[ai] }); ai++
    } else {
      out.push({ type: 'remove', text: bLines[bi] }); bi++
    }
  }
  return out
}

export default function CodeDiff({ fixes }) {
  const [idx, setIdx] = useState(0)
  const fix   = fixes?.[idx]
  const lines  = useMemo(() => fix ? computeDiff(fix.original, fix.fixed) : [], [fix])

  if (!fixes?.length) return null

  return (
    <div className="border-x border-b border-g-border bg-g-900">
      {/* header */}
      <div className="px-5 py-4 border-b border-g-border flex items-center justify-between">
        <div className="text-white/30 font-mono text-xs">// code diff</div>
        {fixes.length > 1 && (
          <div className="flex gap-1">
            {fixes.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-6 h-6 font-mono text-xs border transition-colors ${
                  idx === i
                    ? 'bg-lime text-black border-lime'
                    : 'border-g-border text-white/30 hover:text-white'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* unified diff */}
      <div className="overflow-x-auto code-scroll">
        <table className="w-full border-collapse font-mono text-xs" style={{ minWidth: '400px' }}>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} style={{
                background: line.type === 'add'
                  ? 'rgba(168,255,62,0.08)'
                  : line.type === 'remove'
                  ? 'rgba(248,113,113,0.08)'
                  : 'transparent'
              }}>
                <td className={`pl-3 pr-2 py-0.5 select-none w-5 text-right font-mono text-xs ${
                  line.type === 'add'    ? 'text-lime'
                  : line.type === 'remove' ? 'text-red-400'
                  : 'text-white/15'
                }`}>
                  {line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' '}
                </td>
                <td className={`pr-4 py-0.5 leading-relaxed whitespace-pre font-mono text-xs ${
                  line.type === 'add'    ? 'text-lime/90'
                  : line.type === 'remove' ? 'text-red-400/70 line-through'
                  : 'text-white/60'
                }`}>
                  {line.text || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* explanation */}
      {fix?.explanation && (
        <div className="px-5 py-4 border-t border-g-border">
          <p className="text-white/40 font-mono text-xs leading-relaxed">{fix.explanation}</p>
        </div>
      )}
    </div>
  )
}
