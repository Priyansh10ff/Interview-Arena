import { useState } from 'react'

export default function CodeFixes({ fixes }) {
  const [active, setActive] = useState(0)
  if (!fixes?.length) return null

  const fix = fixes[active]

  return (
    <div className="bg-arena-700 border border-arena-border rounded-xl p-6">
      <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">🔧 Code Fixes</h3>

      {fixes.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {fixes.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-3 py-1 text-xs rounded-md font-mono transition-colors ${
                active === i
                  ? 'bg-amber-500 text-black'
                  : 'bg-arena-600 border border-arena-border text-white/50 hover:text-white'
              }`}
            >
              Fix {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-red-400 text-xs font-mono mb-2 uppercase">Before</div>
          <pre className="text-xs font-mono text-white/70 bg-arena-800 border border-red-400/20 rounded-lg p-4 overflow-x-auto leading-relaxed">{fix.original}</pre>
        </div>
        <div>
          <div className="text-emerald-400 text-xs font-mono mb-2 uppercase">After</div>
          <pre className="text-xs font-mono text-white/70 bg-arena-800 border border-emerald-400/20 rounded-lg p-4 overflow-x-auto leading-relaxed">{fix.fixed}</pre>
        </div>
      </div>
      <p className="text-white/50 text-sm mt-4 border-t border-arena-border pt-4">{fix.explanation}</p>
    </div>
  )
}
