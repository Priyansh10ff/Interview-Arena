import { useMemo } from 'react'

const METRICS = [
  { key: 'codeUnderstanding', label: 'Code Understanding' },
  { key: 'conceptClarity', label: 'Concept Clarity' },
  { key: 'optimizationAwareness', label: 'Optimization Awareness' },
  { key: 'communication', label: 'Communication' },
]

function Bar({ value, max = 10 }) {
  const pct = Math.round((value / max) * 100)
  const color = pct >= 70 ? 'bg-emerald-400' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-arena-500 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-white font-mono text-sm w-8 text-right">{value}/10</span>
    </div>
  )
}

export default function ScoreBreakdown({ breakdown }) {
  const avg = useMemo(() => {
    if (!breakdown) return 0
    const vals = Object.values(breakdown)
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length * 10)
  }, [breakdown])

  if (!breakdown) return null

  return (
    <div className="bg-arena-700 border border-arena-border rounded-xl p-6">
      <h3 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Performance Breakdown</h3>
      <div className="space-y-4">
        {METRICS.map(m => (
          <div key={m.key}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white/60 text-xs">{m.label}</span>
            </div>
            <Bar value={breakdown[m.key] ?? 0} />
          </div>
        ))}
      </div>
    </div>
  )
}
