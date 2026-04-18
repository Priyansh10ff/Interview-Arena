import { getScoreColor } from '../../utils/scoreCalculator'

export default function RoundCounter({ current, total, rounds }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Array.from({ length: total }).map((_, i) => {
          const done = i < rounds.length
          const active = i === rounds.length
          const round = rounds[i]
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                done
                  ? `bg-arena-600 border-arena-border-light ${getScoreColor(round.score * 10)}`
                  : active
                  ? 'bg-amber-500 border-amber-400 text-black'
                  : 'bg-arena-700 border-arena-border text-white/20'
              }`}>
                {done ? round.score : i + 1}
              </div>
              {done && (
                <div className="w-px h-1 bg-arena-border" />
              )}
            </div>
          )
        })}
      </div>
      <div className="text-right">
        <div className="text-white font-semibold text-sm">Round {current} of {total}</div>
        <div className="text-white/30 text-xs font-mono">interview phase</div>
      </div>
    </div>
  )
}
