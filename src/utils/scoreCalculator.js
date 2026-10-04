const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

// model output is untrusted: coerce the code review into a safe shape
export function normalizeReview(raw) {
  const r = raw && typeof raw === 'object' ? raw : {}
  const n = Number(r.healthScore)
  const sev = new Set(['high', 'medium', 'low'])
  return {
    ...r,
    healthScore: Number.isFinite(n) ? clamp(Math.round(n), 0, 100) : 50,
    strengths: Array.isArray(r.strengths) ? r.strengths.filter(x => typeof x === 'string') : [],
    issues: Array.isArray(r.issues)
      ? r.issues.filter(i => i && typeof i === 'object').map(i => ({ ...i, severity: sev.has(i.severity) ? i.severity : 'low' }))
      : [],
    topicsToStudy: Array.isArray(r.topicsToStudy) ? r.topicsToStudy.filter(x => typeof x === 'string') : [],
    refactoredCode: typeof r.refactoredCode === 'string' ? r.refactoredCode : '',
  }
}

// 1-10 score from a model; falls back only when the value is missing, not when it is 0/low
export function toScore10(v, fallback = 5) {
  const n = Number(v)
  return Number.isFinite(n) ? clamp(Math.round(n), 1, 10) : fallback
}

export function calcInterviewScore(rounds) {
  if (!rounds?.length) return 0
  return Math.round(rounds.reduce((s,r)=>s+(r.score||0),0)/rounds.length*10)
}
export function calcOverallScore(interviewScore, codeScore) {
  return Math.round(interviewScore*0.6 + codeScore*0.4)
}
export function getGrade(score) {
  if (score>=90) return {grade:'S',label:'Expert',color:'text-lime',ring:'#a8ff3e'}
  if (score>=75) return {grade:'A',label:'Strong Hire',color:'text-lime',ring:'#a8ff3e'}
  if (score>=60) return {grade:'B',label:'Solid',color:'text-yellow-400',ring:'#facc15'}
  if (score>=45) return {grade:'C',label:'Average',color:'text-yellow-400',ring:'#facc15'}
  return {grade:'D',label:'Needs Work',color:'text-red-400',ring:'#f87171'}
}
export function getScoreColor(score) {
  if (score>=75) return 'text-lime'
  if (score>=50) return 'text-yellow-400'
  return 'text-red-400'
}
export function getSeverityBorder(severity) {
  if (severity==='high') return 'border-red-400/40 text-red-400'
  if (severity==='medium') return 'border-yellow-400/40 text-yellow-400'
  return 'border-g-hi text-white/50'
}
