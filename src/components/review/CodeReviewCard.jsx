import { useMemo, useState } from 'react'
import { getSeverityColor } from '../../utils/scoreCalculator'
import ScoreRing from '../ui/ScoreRing'

export default function CodeReviewCard({ review, onStartInterview, isLoading }) {
  const [showRefactor, setShowRefactor] = useState(false)

  const sortedIssues = useMemo(() => {
    if (!review?.issues) return []
    const order = { high: 0, medium: 1, low: 2 }
    return [...review.issues].sort((a, b) => order[a.severity] - order[b.severity])
  }, [review?.issues])

  const ringColor = review?.healthScore >= 75 ? '#34d399' : review?.healthScore >= 50 ? '#f59e0b' : '#f87171'

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-xl">Code Review</h2>
          <p className="text-white/40 text-sm mt-0.5">AI analysis of your submission</p>
        </div>
        <ScoreRing score={review?.healthScore ?? 0} color={ringColor} label="Code Health" size={120} />
      </div>

      {review?.strengths?.length > 0 && (
        <div className="bg-arena-700 border border-arena-border rounded-xl p-5">
          <h3 className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">✓ Strengths</h3>
          <ul className="space-y-1.5">
            {review.strengths.map((s, i) => (
              <li key={i} className="text-white/70 text-sm flex gap-2">
                <span className="text-emerald-400 mt-0.5">—</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sortedIssues.length > 0 && (
        <div className="bg-arena-700 border border-arena-border rounded-xl p-5">
          <h3 className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">⚠ Issues Found</h3>
          <div className="space-y-3">
            {sortedIssues.map((issue, i) => (
              <div key={i} className={`border rounded-lg p-3 ${getSeverityColor(issue.severity)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-mono uppercase font-semibold`}>{issue.severity}</span>
                  {issue.line && <span className="text-white/30 text-xs font-mono">line {issue.line}</span>}
                </div>
                <p className="text-sm text-white/80">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {review?.topicsToStudy?.length > 0 && (
        <div className="bg-arena-700 border border-arena-border rounded-xl p-5">
          <h3 className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">📚 Topics to Study</h3>
          <div className="flex flex-wrap gap-2">
            {review.topicsToStudy.map((t, i) => (
              <span key={i} className="px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs rounded-full font-mono">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {review?.refactoredCode && (
        <div className="bg-arena-700 border border-arena-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowRefactor(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm text-white/60 hover:text-white transition-colors"
          >
            <span className="font-semibold text-xs uppercase tracking-wider">🔧 Refactored Version</span>
            <span>{showRefactor ? '▲' : '▼'}</span>
          </button>
          {showRefactor && (
            <pre className="p-5 text-xs font-mono text-white/80 overflow-x-auto bg-arena-800 border-t border-arena-border leading-relaxed">
              {review.refactoredCode}
            </pre>
          )}
        </div>
      )}

      <button
        onClick={onStartInterview}
        disabled={isLoading}
        className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors text-sm tracking-wide"
      >
        {isLoading ? 'Generating Questions...' : 'Start Interview →'}
      </button>
    </div>
  )
}
