import { useEffect, useRef } from 'react'

export default function ScoreRing({ score, size = 140, color = '#f59e0b', label }) {
  const circleRef = useRef(null)
  const r = (size / 2) - 12
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = circ
      setTimeout(() => {
        if (circleRef.current) {
          circleRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)'
          circleRef.current.style.strokeDashoffset = offset
        }
      }, 100)
    }
  }, [score])

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke="#1c1c2c" strokeWidth="8"
        />
        <circle
          ref={circleRef}
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
        <text x={size/2} y={size/2 - 6} textAnchor="middle" fill="white" fontSize="28" fontWeight="600" fontFamily="Inter">{score}</text>
        <text x={size/2} y={size/2 + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="Inter">/100</text>
      </svg>
      {label && <span className="text-white/40 text-xs">{label}</span>}
    </div>
  )
}
