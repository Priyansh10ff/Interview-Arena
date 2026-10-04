// Rubric-based scorecard: the model scores each criterion with evidence,
// but the hire verdict is computed deterministically from the weights.

const TRANSCRIPT_LIMIT = 9000
const CODE_LIMIT = 3000

const LEVEL_LABEL = { intern: 'intern', sde1: 'SDE-1', sde2: 'SDE-2' }

export function renderTranscript(transcript) {
  const text = (transcript || [])
    .map(t => `${t.role === 'interviewer' ? 'INTERVIEWER' : 'CANDIDATE'}: ${t.text}`)
    .join('\n')
  // keep the end of long interviews: that's where follow-ups and wrap-up live
  return text.length > TRANSCRIPT_LIMIT ? '…' + text.slice(-TRANSCRIPT_LIMIT) : text
}

export function buildScorecardPrompt({ company, round, type, level, transcript, code }) {
  const rubric = type.rubric.map(c => `- ${c.id} (${c.label}, weight ${c.weight}): ${c.desc}`).join('\n')
  const finalCode = type.workspace === 'code' && code
    ? `\nCANDIDATE FINAL CODE:\n${code.length > CODE_LIMIT ? code.slice(0, CODE_LIMIT) + '\n…' : code}\n`
    : ''
  return {
    system: `You are the ${company.name} interviewer writing your scorecard after a "${round.title}" round for a ${LEVEL_LABEL[level] || ''} candidate. Be fair but strict, like a real hiring committee. JSON only.`,
    user: `RUBRIC (score each 1-4: 1=strong no, 2=below bar, 3=meets bar, 4=exceeds bar for this level):
${rubric}

Score ONLY from what happened in the transcript. If a criterion was never demonstrated, score it 2 and say so.
Evidence must point at a specific moment or quote from the candidate.

TRANSCRIPT:
${renderTranscript(transcript)}
${finalCode}
Return:{"criteria":[{"id":"<rubric id>","score":<1-4>,"evidence":"<1 sentence>","improve":"<1 concrete tip>"}],"summary":"<2-3 sentence written feedback>","strengths":["..."],"redFlags":["..."],"nextSteps":["<3 specific things to practise>"]}`,
    maxTokens: 900,
  }
}

const clampScore = (n) => {
  const v = Math.round(Number(n))
  return Number.isFinite(v) ? Math.min(4, Math.max(1, v)) : 2
}
const strList = (a, max = 5) => (Array.isArray(a) ? a.filter(x => typeof x === 'string' && x.trim()).slice(0, max) : [])

export function normalizeScorecard(raw, rubric) {
  const items = Array.isArray(raw?.criteria) ? raw.criteria : []
  const criteria = rubric.map((c, i) => {
    const hit = items.find(x => x?.id === c.id)
      || items.find(x => typeof x?.id === 'string' && x.id.toLowerCase().includes(c.label.toLowerCase()))
      || (items.length === rubric.length ? items[i] : null)
    return {
      id: c.id,
      label: c.label,
      weight: c.weight,
      score: hit ? clampScore(hit.score) : 2,
      evidence: hit?.evidence || 'Not assessed in this round.',
      improve: hit?.improve || '',
    }
  })
  return {
    criteria,
    summary: typeof raw?.summary === 'string' ? raw.summary : '',
    strengths: strList(raw?.strengths),
    redFlags: strList(raw?.redFlags),
    nextSteps: strList(raw?.nextSteps, 3),
  }
}

export const VERDICTS = {
  strong_hire: { label: 'Strong Hire', color: 'text-lime', ring: '#a8ff3e' },
  hire:        { label: 'Hire', color: 'text-lime', ring: '#a8ff3e' },
  lean_no:     { label: 'Lean No Hire', color: 'text-yellow-400', ring: '#facc15' },
  no_hire:     { label: 'No Hire', color: 'text-red-400', ring: '#f87171' },
}

export function computeVerdict(criteria) {
  const totalW = criteria.reduce((s, c) => s + c.weight, 0) || 1
  const weighted = criteria.reduce((s, c) => s + c.weight * c.score, 0) / totalW
  const percent = Math.round(((weighted - 1) / 3) * 100)
  let key = weighted >= 3.5 ? 'strong_hire' : weighted >= 2.9 ? 'hire' : weighted >= 2.3 ? 'lean_no' : 'no_hire'
  // a strong-no on a heavily weighted criterion caps the verdict, like a real debrief
  const redFlag = criteria.some(c => c.weight >= 0.3 && c.score === 1)
  if (redFlag && (key === 'strong_hire' || key === 'hire')) key = 'lean_no'
  return { weighted: Math.round(weighted * 100) / 100, percent, key, ...VERDICTS[key], capped: redFlag }
}
