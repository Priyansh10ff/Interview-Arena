import { useState } from 'react'

export default function CodeFixes({ fixes }) {
  const [active,setActive] = useState(0)
  if(!fixes?.length) return null
  const fix = fixes[active]
  return (
    <div className="border-x border-b border-g-border bg-g-900">
      <div className="px-5 py-4 border-b border-g-border flex items-center justify-between">
        <div className="text-white/30 font-mono text-xs">// code fixes</div>
        {fixes.length>1&&(
          <div className="flex gap-1">
            {fixes.map((_,i)=>(
              <button key={i} onClick={()=>setActive(i)}
                className={`w-6 h-6 font-mono text-xs transition-colors border ${active===i?'bg-lime text-black border-lime':'border-g-border text-white/30 hover:text-white'}`}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-g-border">
        <div className="p-4">
          <div className="text-red-400 font-mono text-xs mb-2">before</div>
          <pre className="font-mono text-xs text-white/60 overflow-x-auto code-scroll leading-relaxed bg-g-800 border border-red-400/20 p-3">{fix.original}</pre>
        </div>
        <div className="p-4">
          <div className="text-lime font-mono text-xs mb-2">after</div>
          <pre className="font-mono text-xs text-white/60 overflow-x-auto code-scroll leading-relaxed bg-g-800 border border-lime/20 p-3">{fix.fixed}</pre>
        </div>
      </div>
      <div className="px-5 py-4 border-t border-g-border">
        <p className="text-white/40 font-mono text-xs leading-relaxed">{fix.explanation}</p>
      </div>
    </div>
  )
}
