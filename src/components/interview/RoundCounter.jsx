import { getScoreColor } from '../../utils/scoreCalculator'

export default function RoundCounter({ current, total, rounds }) {
  return (
    <div className="flex items-center justify-between border border-g-border bg-g-900 px-4 py-3">
      <div className="flex items-center gap-2">
        {Array.from({length:total}).map((_,i)=>{
          const done=i<rounds.length
          const active=i===rounds.length
          const r=rounds[i]
          return (
            <div key={i} className={`w-8 h-8 flex items-center justify-center font-mono text-xs font-bold border transition-all
              ${done ? `bg-g-800 border-g-hi ${getScoreColor(r.score*10)}`
               : active ? 'bg-lime border-lime text-black'
               : 'bg-g-900 border-g-border text-white/20'}`}>
              {done?r.score:i+1}
            </div>
          )
        })}
      </div>
      <div className="text-right">
        <div className="text-white font-mono text-sm">{current}/{total}</div>
        <div className="text-white/25 font-mono text-xs">interview</div>
      </div>
    </div>
  )
}
