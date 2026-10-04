// Pure logic for the live AI interviewer. No React, no network: easy to test.

export const STAGES = ['intro', 'problem', 'probing', 'followup', 'wrapup']
const CODE_LIMIT = 4000

const LEVEL_LABEL = { intern: 'an intern', sde1: 'an SDE-1 (new grad)', sde2: 'an SDE-2 (2-4 years)' }

// how many candidate replies before the interviewer must wrap up
export function turnBudget(durationMin) {
  return Math.min(14, Math.max(6, Math.round((durationMin || 45) / 6)))
}

export function buildInterviewerSystemPrompt({ company, round, type, level }) {
  const maxTurns = turnBudget(round.durationMin)
  const codeRule = type.workspace === 'code'
    ? 'The candidate has a code editor. Their latest code arrives inside [CODE]...[/CODE]. Read it, point at specific lines, ask them to trace an example or fix bugs.'
    : 'This is a discussion round with no code editor. Ask the candidate to talk through their thinking.'
  return [
    `You are a real interviewer at ${company.name} running a "${round.title}" round (${type.label}) for ${LEVEL_LABEL[level] || 'a candidate'}.`,
    `Round format: ${round.brief}`,
    `Your persona: ${round.persona}`,
    `What you evaluate: ${round.focus.join(', ')}.`,
    codeRule,
    'Rules:',
    '- Stay in character. Speak like a person, not a chatbot: short, natural, max 90 words per turn.',
    '- One question or prompt per turn. Never lecture.',
    '- Never give the full solution. Small hints only if the candidate is clearly stuck.',
    '- If an answer is vague or says "we", push for specifics: what exactly, how, what was the result.',
    '- Answer clarifying questions the way a real interviewer would, inventing reasonable constraints.',
    '- Around the middle of the round, add one twist or follow-up that changes a constraint.',
    `- You have about ${maxTurns} candidate replies. Then wrap up: thank them and set "done": true.`,
    '- Do not score or grade the candidate during the interview.',
    'Reply with JSON only: {"message":"<what you say>","stage":"intro|problem|probing|followup|wrapup","done":false}',
  ].join('\n')
}

export const START_MESSAGE = '[START] Greet the candidate in one line, then present the problem or first question.'
export const WRAPUP_MESSAGE = '[TIME] The round is out of time. Wrap up now in 1-2 sentences and set "done": true.'

export function truncateCode(code) {
  if (!code) return ''
  return code.length > CODE_LIMIT ? code.slice(0, CODE_LIMIT) + '\n// …truncated' : code
}

// transcript item: { role: 'interviewer'|'candidate', text, code?, stage? }
// Only the latest candidate code is sent in full, older snapshots are elided to save tokens.
export function toApiMessages(system, transcript, { forceWrapup = false } = {}) {
  const lastCodeIdx = transcript.reduce((acc, t, i) => (t.role === 'candidate' && t.code ? i : acc), -1)
  const msgs = [{ role: 'system', content: system }, { role: 'user', content: START_MESSAGE }]
  transcript.forEach((t, i) => {
    if (t.role === 'interviewer') {
      msgs.push({ role: 'assistant', content: JSON.stringify({ message: t.text, stage: t.stage || 'probing', done: false }) })
    } else {
      let content = t.text || '(no answer)'
      if (t.code) {
        content += i === lastCodeIdx
          ? `\n[CODE]\n${truncateCode(t.code)}\n[/CODE]`
          : '\n[earlier code snapshot omitted]'
      }
      msgs.push({ role: 'user', content })
    }
  })
  if (forceWrapup) msgs.push({ role: 'user', content: WRAPUP_MESSAGE })
  return msgs
}

export function normalizeInterviewerReply(raw) {
  const message = typeof raw?.message === 'string' && raw.message.trim()
    ? raw.message.trim()
    : 'Sorry, could you repeat that?'
  const stage = STAGES.includes(raw?.stage) ? raw.stage : 'probing'
  const done = raw?.done === true || raw?.done === 'true' || stage === 'wrapup' && raw?.done !== false
  return { message, stage, done: !!done }
}

export const candidateTurns = (transcript) => transcript.filter(t => t.role === 'candidate').length

export function shouldForceWrapup(transcript, round, elapsedSec) {
  const overTurns = candidateTurns(transcript) >= turnBudget(round.durationMin)
  const overTime = elapsedSec != null && elapsedSec >= round.durationMin * 60
  return overTurns || overTime
}

export function formatClock(sec) {
  const s = Math.max(0, Math.floor(sec || 0))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// One interviewer turn. chatFn(messages, maxTokens) -> parsed JSON (callAIChat in the app).
export async function interviewerTurn(chatFn, system, transcript, { forceWrapup = false, now = Date.now } = {}) {
  const raw = await chatFn(toApiMessages(system, transcript, { forceWrapup }), 320)
  const reply = normalizeInterviewerReply(raw)
  const item = { role: 'interviewer', text: reply.message, stage: reply.stage, at: now() }
  return { transcript: [...transcript, item], done: reply.done || forceWrapup, reply }
}
