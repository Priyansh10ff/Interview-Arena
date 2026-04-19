import { useMemo } from 'react'
import { getScoreColor } from '../../utils/scoreCalculator'

export default function WeeklyReport({ sessions }) {
  const report = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)

    const thisWeek = sessions.filter(s => {
      const d = s.createdAt?.toDate?.()
      return d && d >= weekAgo
    })

    if (!thisWeek.length) return null

    const completed = thisWeek.filter(s => s.status === 'completed')
    const avgScore = completed.length
      ? Math.round(completed.reduce((a, s) => a + (s.finalReport?.overallScore || 0), 0) / completed.length)
      : null

    // find most struggled concept across all rounds this week
    const conceptCounts = {}
    completed.forEach(s => {
      s.rounds?.forEach(r => {
        if (r.score <= 5 && r.concept) {
          conceptCounts[r.concept] = (conceptCounts[r.concept] || 0) + 1
        }
      })
    })
    const weakest = Object.entries(conceptCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

    // compare to previous week
    const twoWeeksAgo = new Date(now)
    twoWeeksAgo.setDate(now.getDate() - 14)
    const prevWeek = sessions.filter(s => {
      const d = s.createdAt?.toDate?.()
      return d && d >= twoWeeksAgo && d < weekAgo && s.status === 'completed'
    })
    const prevAvg = prevWeek.length
      ? Math.round(prevWeek.reduce((a, s) => a + (s.finalReport?.overallScore || 0), 0) / prevWeek.length)
      : null

    const delta = avgScore !== null && prevAvg !== null ? avgScore - prevAvg : null

    return { count: thisWeek.length, completed: completed.length, avgScore, weakest, delta }
  }, [sessions])

  if (!report) return null

  return (
    <div className="border border-lime/20 bg-lime/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lime font-mono text-xs">// this week</div>
        {report.delta !== null && (
          <span className={`font-mono text-xs ${report.delta > 0 ? 'text-lime' : report.delta < 0 ? 'text-red-400' : 'text-white/30'}`}>
            {report.delta > 0 ? '↑' : report.delta < 0 ? '↓' : '→'} {Math.abs(report.delta)} vs last week
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-white font-mono font-bold text-xl">{report.count}</div>
          <div className="text-white/30 font-mono text-xs">sessions</div>
        </div>
        <div>
          <div className={`font-mono font-bold text-xl ${report.avgScore !== null ? getScoreColor(report.avgScore) : 'text-white/30'}`}>
            {report.avgScore ?? '—'}
          </div>
          <div className="text-white/30 font-mono text-xs">avg score</div>
        </div>
        <div>
          <div className="text-white font-mono font-bold text-sm leading-tight line-clamp-1">
            {report.weakest || '—'}
          </div>
          <div className="text-white/30 font-mono text-xs">struggled with</div>
        </div>
      </div>
    </div>
  )
}
