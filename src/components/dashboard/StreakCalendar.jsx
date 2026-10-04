import { useMemo } from 'react'
import { localDateKey } from '../../utils/dates'

const LIME = '#a8ff3e'

function getCellColor(count) {
  if (count === 0) return '#181818'
  if (count === 1) return 'rgba(168,255,62,0.35)'
  if (count === 2) return 'rgba(168,255,62,0.60)'
  return LIME
}

export default function StreakCalendar({ dates = [] }) {
  const { weeks, stats } = useMemo(() => {
    // count sessions per date (user might have multiple per day)
    const counts = {}
    for (const d of dates) {
      if (d) counts[d] = (counts[d] || 0) + 1
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // build 364-day grid (52 full weeks)
    const allDays = []
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = localDateKey(d)
      allDays.push({ key, count: counts[key] || 0 })
    }

    // pad to start on Sunday
    const firstDow = new Date(allDays[0].key + 'T00:00:00').getDay()
    const padded   = [...Array(firstDow).fill(null), ...allDays]
    const weeks    = []
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7))

    // current streak (backwards from today)
    const dateSet = new Set(Object.keys(counts))
    let cur = 0
    const t = new Date(today)
    // a streak is still alive if today has no session yet but yesterday does
    if (!dateSet.has(localDateKey(t))) t.setDate(t.getDate() - 1)
    while (dateSet.has(localDateKey(t))) {
      cur++
      t.setDate(t.getDate() - 1)
    }

    // longest streak
    const sorted  = Object.keys(counts).sort()
    let longest = 0, run = 0
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) { run = 1 }
      else {
        const prev = new Date(sorted[i - 1])
        const curr = new Date(sorted[i])
        run = Math.round((curr - prev) / 86400000) === 1 ? run + 1 : 1
      }
      longest = Math.max(longest, run)
    }

    return {
      weeks,
      stats: {
        current: cur,
        longest,
        total: Object.keys(counts).length,
      }
    }
  }, [dates])

  // month labels
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = -1
    weeks.forEach((week, wi) => {
      const firstReal = week.find(d => d !== null)
      if (!firstReal) { labels.push(null); return }
      const m = new Date(firstReal.key + 'T00:00:00').getMonth()
      if (m !== lastMonth) { lastMonth = m; labels.push(m) }
      else labels.push(null)
    })
    return labels
  }, [weeks])

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="border border-g-border bg-g-900 p-5">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-white/30 font-mono text-xs">// activity</div>
        <div className="flex items-center gap-5">
          <div className="text-center">
            <div className="font-mono font-bold text-lg" style={{ color: LIME }}>
              {stats.current}
            </div>
            <div className="text-white/25 font-mono text-xs">streak</div>
          </div>
          <div className="text-center">
            <div className="text-white font-mono font-bold text-lg">{stats.longest}</div>
            <div className="text-white/25 font-mono text-xs">longest</div>
          </div>
          <div className="text-center">
            <div className="text-white font-mono font-bold text-lg">{stats.total}</div>
            <div className="text-white/25 font-mono text-xs">days</div>
          </div>
        </div>
      </div>

      {/* month labels */}
      <div className="overflow-x-auto code-scroll">
        <div style={{ minWidth: '680px' }}>
          {/* month row */}
          <div className="flex gap-px mb-1">
            {monthLabels.map((m, i) => (
              <div key={i} className="w-3 h-3 flex items-center">
                {m !== null && (
                  <span className="text-white/25 font-mono whitespace-nowrap" style={{ fontSize: '9px' }}>
                    {MONTH_NAMES[m]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* calendar grid */}
          <div className="flex gap-px">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-px">
                {Array.from({ length: 7 }).map((_, di) => {
                  const day = week[di]
                  return (
                    <div
                      key={di}
                      title={day ? `${day.key}${day.count > 0 ? ` · ${day.count} session${day.count > 1 ? 's' : ''}` : ''}` : ''}
                      style={{
                        width: '12px',
                        height: '12px',
                        background: day ? getCellColor(day.count) : 'transparent',
                        flexShrink: 0,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-white/15 font-mono text-xs">less</span>
        {[0, 1, 2, 3].map(level => (
          <div key={level} style={{
            width: '12px', height: '12px',
            background: getCellColor(level),
            flexShrink: 0,
          }} />
        ))}
        <span className="text-white/15 font-mono text-xs">more</span>
      </div>

      {/* empty state hint */}
      {stats.total === 0 && (
        <p className="text-white/20 font-mono text-xs mt-3">
          complete sessions to see activity here
        </p>
      )}
    </div>
  )
}
