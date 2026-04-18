import { useState } from 'react'

export default function StudyRoadmap({ roadmap }) {
  const [open, setOpen] = useState(null)

  if (!roadmap?.length) return null

  return (
    <div className="bg-arena-700 border border-arena-border rounded-xl p-6">
      <h3 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">📚 Study Roadmap</h3>
      <div className="space-y-3">
        {roadmap.map((item, i) => (
          <div key={i} className="border border-arena-border rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-arena-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs flex items-center justify-center font-mono">{i + 1}</span>
                <span className="text-white text-sm font-medium">{item.concept}</span>
              </div>
              <span className="text-white/30 text-xs">{open === i ? '▲' : '▼'}</span>
            </button>
            {open === i && (
              <div className="px-4 pb-4 bg-arena-800 border-t border-arena-border animate-slide-up">
                <p className="text-white/60 text-sm mt-3 mb-2">{item.why}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-amber-400 text-xs font-mono">→</span>
                  <span className="text-amber-300 text-sm">{item.resource}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
