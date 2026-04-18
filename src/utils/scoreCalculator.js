export function calcInterviewScore(rounds) {
  if (!rounds || !rounds.length) return 0
  const avg = rounds.reduce((sum, r) => sum + (r.score || 0), 0) / rounds.length
  return Math.round(avg * 10)
}

export function calcOverallScore(interviewScore, codeScore) {
  return Math.round((interviewScore * 0.6) + (codeScore * 0.4))
}

export function getGrade(score) {
  if (score >= 90) return { grade: 'S', label: 'Expert Level', color: 'text-amber-400', ring: '#f59e0b' }
  if (score >= 75) return { grade: 'A', label: 'Strong Hire', color: 'text-emerald-400', ring: '#34d399' }
  if (score >= 60) return { grade: 'B', label: 'Solid', color: 'text-blue-400', ring: '#60a5fa' }
  if (score >= 45) return { grade: 'C', label: 'Average', color: 'text-yellow-400', ring: '#facc15' }
  return { grade: 'D', label: 'Needs Work', color: 'text-red-400', ring: '#f87171' }
}

export function getScoreColor(score) {
  if (score >= 75) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function getSeverityColor(severity) {
  if (severity === 'high') return 'text-red-400 bg-red-400/10 border-red-400/20'
  if (severity === 'medium') return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
  return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
}
