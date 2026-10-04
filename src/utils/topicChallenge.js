// Validate/repair AI-generated topic challenges before rendering them.
// Returns a clean object or throws, so the UI never renders a blank screen.

const str = (v) => (typeof v === 'string' ? v.trim() : '')

export function normalizeTopicChallenge(type, raw) {
  const d = raw && typeof raw === 'object' ? raw : {}
  if (type === 'mcq') {
    const questions = (Array.isArray(d.questions) ? d.questions : [])
      .map(q => {
        const options = Array.isArray(q?.options) ? q.options.map(str).filter(Boolean).slice(0, 4) : []
        const answerIndex = Number(q?.answerIndex)
        return { q: str(q?.q), options, answerIndex, explanation: str(q?.explanation) }
      })
      .filter(q => q.q && q.options.length >= 2 && Number.isInteger(q.answerIndex)
        && q.answerIndex >= 0 && q.answerIndex < q.options.length)
    if (!questions.length) throw new Error('The AI returned unusable questions. Try again.')
    return { questions }
  }
  if (type === 'descriptive') {
    const questions = (Array.isArray(d.questions) ? d.questions : [])
      .map(q => ({ q: str(q?.q), keyPoints: str(q?.keyPoints) }))
      .filter(q => q.q)
    if (!questions.length) throw new Error('The AI returned unusable questions. Try again.')
    return { questions }
  }
  // coding
  if (!str(d.description)) throw new Error('The AI returned an incomplete problem. Try again.')
  return {
    ...d,
    title: str(d.title) || 'Coding Challenge',
    description: str(d.description),
    examples: Array.isArray(d.examples) ? d.examples.filter(e => e && typeof e === 'object') : [],
    constraints: Array.isArray(d.constraints) ? d.constraints.map(str).filter(Boolean) : [],
  }
}
