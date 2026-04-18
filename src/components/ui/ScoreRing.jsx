import { useEffect, useRef } from 'react'

export default function ScoreRing({ score, size = 110, color = '#a8ff3e', label }) {
  const circRef = useRef(null)
  const s = Math.min(100, Math.max(0, score || 0))
  const cx = size / 2
  const r = size / 2 - 11
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - s / 100)

  useEffect(() => {
    const el = circRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.strokeDashoffset = String(circ)
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)'
        el.style.strokeDashoffset = String(offset)
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block' }}
      >
        {/* track */}
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="7"
        />
        {/* fill */}
        <circle
          ref={circRef}
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={circ}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ willChange: 'stroke-dashoffset' }}
        />
        {/* score text */}
        <text
          x={cx} y={cx - 5}
          textAnchor="middle"
          fill="white"
          fontSize={size > 100 ? 22 : 17}
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >{s}</text>
        <text
          x={cx} y={cx + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
        >/100</text>
      </svg>
      {label && (
        <span className="text-white/30 font-mono text-xs">{label}</span>
      )}
    </div>
  )
}
