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
