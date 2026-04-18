import { useMemo, useState } from 'react'
import { getSeverityBorder } from '../../utils/scoreCalculator'
import ScoreRing from '../ui/ScoreRing'

export default function CodeReviewCard({ review, onStartInterview, isLoading }) {
  const [showRefactor, setShowRefactor] = useState(false)

  const sortedIssues = useMemo(()=>{
    if(!review?.issues) return []
    const o={high:0,medium:1,low:2}
    return [...review.issues].sort((a,b)=>o[a.severity]-o[b.severity])
  },[review?.issues])

  const ringColor = review?.healthScore>=75?'#a8ff3e':review?.healthScore>=50?'#facc15':'#f87171'

  return (
    <div className="animate-slide-up space-y-0">
      {/* header */}
      <div className="border border-g-border bg-g-900 p-5 flex items-center justify-between">
        <div>
          <div className="text-lime font-mono text-xs mb-1">// code review</div>
          <h2 className="text-white font-mono font-bold text-lg">Analysis</h2>
          <p className="text-white/30 font-mono text-xs mt-0.5">AI scan of your submission</p>
        </div>
        <ScoreRing score={review?.healthScore??0} color={ringColor} label="health" size={100}/>
      </div>

      {/* strengths */}
      {review?.strengths?.length>0&&(
        <div className="border-x border-b border-g-border bg-g-900 p-5">
          <div className="text-lime font-mono text-xs mb-3">// strengths</div>
          <ul className="space-y-2">
            {review.strengths.map((s,i)=>(
              <li key={i} className="flex gap-3 font-mono text-xs text-white/60">
                <span className="text-lime shrink-0">+</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* issues */}
      {sortedIssues.length>0&&(
        <div className="border-x border-b border-g-border bg-g-900 p-5">
          <div className="text-red-400 font-mono text-xs mb-3">// issues ({sortedIssues.length})</div>
          <div className="space-y-2">
            {sortedIssues.map((issue,i)=>(
              <div key={i} className={`border px-3 py-2.5 ${getSeverityBorder(issue.severity)}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs font-bold uppercase">{issue.severity}</span>
                  {issue.line&&<span className="text-white/25 font-mono text-xs">ln {issue.line}</span>}
                </div>
                <p className="font-mono text-xs text-white/65 leading-relaxed">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* topics */}
      {review?.topicsToStudy?.length>0&&(
        <div className="border-x border-b border-g-border bg-g-900 p-5">
          <div className="text-yellow-400 font-mono text-xs mb-3">// study topics</div>
          <div className="flex flex-wrap gap-2">
            {review.topicsToStudy.map((t,i)=>(
              <span key={i} className="border border-yellow-400/30 text-yellow-400/80 font-mono text-xs px-2.5 py-1">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* refactored */}
      {review?.refactoredCode&&(
        <div className="border-x border-b border-g-border">
          <button onClick={()=>setShowRefactor(v=>!v)}
            className="w-full flex items-center justify-between px-5 py-3 text-white/40 hover:text-white font-mono text-xs transition-colors bg-g-900">
            <span>// refactored version</span>
            <span>{showRefactor?'▲':'▼'}</span>
          </button>
          {showRefactor&&(
            <pre className="p-5 font-mono text-xs text-white/70 overflow-x-auto bg-g-800 border-t border-g-border leading-relaxed code-scroll">
              {review.refactoredCode}
            </pre>
          )}
        </div>
      )}

      {/* cta */}
      <div className="border-x border-b border-g-border p-5 bg-g-900">
        <button onClick={onStartInterview} disabled={isLoading}
          className="w-full py-3 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {isLoading?'generating questions…':'START INTERVIEW →'}
        </button>
      </div>
    </div>
  )
}
