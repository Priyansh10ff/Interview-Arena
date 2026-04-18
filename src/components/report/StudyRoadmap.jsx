import { useState } from 'react'

export default function StudyRoadmap({ roadmap }) {
  const [open,setOpen] = useState(null)
  if(!roadmap?.length) return null
  return (
    <div className="border-x border-b border-g-border bg-g-900">
      <div className="px-5 py-4 border-b border-g-border">
        <div className="text-white/30 font-mono text-xs">// study roadmap</div>
      </div>
      {roadmap.map((item,i)=>(
        <div key={i} className={i<roadmap.length-1?'border-b border-g-border':''}>
          <button onClick={()=>setOpen(open===i?null:i)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-g-800 transition-colors text-left">
            <div className="flex items-center gap-4">
              <span className="text-lime/50 font-mono text-xs w-5">{String(i+1).padStart(2,'0')}</span>
              <span className="text-white font-mono text-xs">{item.concept}</span>
            </div>
            <span className="text-white/25 font-mono text-xs">{open===i?'▲':'▼'}</span>
          </button>
          {open===i&&(
            <div className="px-5 pb-4 bg-g-800 border-t border-g-border animate-slide-up pt-4 space-y-2">
              <p className="text-white/50 font-mono text-xs leading-relaxed">{item.why}</p>
              <p className="text-lime/70 font-mono text-xs">→ {item.resource}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
