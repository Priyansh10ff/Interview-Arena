import { useState } from 'react'
import { getScoreColor } from '../../utils/scoreCalculator'

export default function QuestionReplay({ rounds }) {
  const [open, setOpen] = useState(null)
  if (!rounds?.length) return null

  return (
    <div className="bg-arena-700 border border-arena-border rounded-xl p-6">
      <h3 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Interview Replay</h3>
      <div className="space-y-3">
        {rounds.map((r, i) => (
          <div key={i} className="border border-arena-border rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-arena-600 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-arena-border ${getScoreColor(r.score * 10)}`}>
                  {r.score}
                </span>
                <div>
                  <p className="text-white text-sm line-clamp-1">{r.question}</p>
                  <p className="text-white/30 text-xs font-mono">{r.concept}</p>
                </div>
              </div>
              <span className="text-white/30 text-xs ml-4">{open === i ? '▲' : '▼'}</span>
            </button>
            {open === i && (
              <div className="px-4 pb-5 bg-arena-800 border-t border-arena-border animate-slide-up">
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-white/40 text-xs uppercase font-mono mb-1.5">Your Answer</div>
                    <p className="text-white/70 text-sm">{r.userAnswer}</p>
                  </div>
                  <div>
                    <div className="text-amber-400 text-xs uppercase font-mono mb-1.5">AI Feedback</div>
                    <p className="text-white/70 text-sm">{r.aiFeedback}</p>
                  </div>
                  <div>
                    <div className="text-emerald-400 text-xs uppercase font-mono mb-1.5">Ideal Answer</div>
                    <p className="text-white/60 text-sm italic">{r.idealAnswer}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
