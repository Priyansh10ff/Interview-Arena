import { useState } from 'react'
import { getScoreColor } from '../../utils/scoreCalculator'

export default function QuestionReplay({ rounds }) {
  const [open,setOpen] = useState(null)
  if(!rounds?.length) return null
  return (
    <div className="border-x border-b border-g-border bg-g-900">
      <div className="px-5 py-4 border-b border-g-border">
        <div className="text-white/30 font-mono text-xs">// interview replay</div>
      </div>
      {rounds.map((r,i)=>(
        <div key={i} className={i<rounds.length-1?'border-b border-g-border':''}>
          <button onClick={()=>setOpen(open===i?null:i)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-g-800 transition-colors text-left">
            <div className="flex items-center gap-4">
              <span className={`font-mono font-bold text-lg w-6 text-center ${getScoreColor(r.score*10)}`}>{r.score}</span>
              <div>
                <p className="text-white font-mono text-xs line-clamp-1">{r.question}</p>
                <p className="text-white/25 font-mono text-xs mt-0.5">{r.concept}</p>
              </div>
            </div>
            <span className="text-white/25 font-mono text-xs ml-4">{open===i?'▲':'▼'}</span>
          </button>
          {open===i&&(
            <div className="px-5 pb-5 bg-g-800 border-t border-g-border animate-slide-up space-y-4 pt-4">
              <div>
                <div className="text-white/25 font-mono text-xs mb-2">your answer</div>
                <p className="text-white/60 font-mono text-xs leading-relaxed">{r.userAnswer}</p>
              </div>
              <div>
                <div className="text-yellow-400/70 font-mono text-xs mb-2">ai feedback</div>
                <p className="text-white/60 font-mono text-xs leading-relaxed">{r.aiFeedback}</p>
              </div>
              <div>
                <div className="text-lime/70 font-mono text-xs mb-2">ideal answer</div>
                <p className="text-white/45 font-mono text-xs leading-relaxed italic">{r.idealAnswer}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
