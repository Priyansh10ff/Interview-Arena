import { useMemo } from 'react'

const METRICS = [
  {key:'codeUnderstanding',label:'Code Understanding'},
  {key:'conceptClarity',label:'Concept Clarity'},
  {key:'optimizationAwareness',label:'Optimization Awareness'},
  {key:'communication',label:'Communication'},
]

export default function ScoreBreakdown({ breakdown }) {
  if(!breakdown) return null
  return (
    <div className="border-x border-b border-g-border bg-g-900 p-5">
      <div className="text-white/30 font-mono text-xs mb-4">// breakdown</div>
      <div className="space-y-4">
        {METRICS.map(m=>{
          const v=breakdown[m.key]??0
          const pct=Math.round(v/10*100)
          const bar=pct>=70?'bg-lime':pct>=40?'bg-yellow-400':'bg-red-400'
          return (
            <div key={m.key}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-white/50 font-mono text-xs">{m.label}</span>
                <span className="text-white font-mono text-xs font-bold">{v}/10</span>
              </div>
              <div className="h-1 bg-g-700 w-full">
                <div className={`h-full ${bar} bar-fill`} style={{width:`${pct}%`}}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
