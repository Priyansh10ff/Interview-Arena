const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const OPENROUTER_MODEL = 'openai/gpt-4o-mini'
const OPENAI_MODEL = 'gpt-4o-mini'
const LS_KEY = 'ia_api_key'

export function getApiKey() {
  const env = import.meta.env || {}
  const orEnv = env.VITE_OPENROUTER_API_KEY
  if (orEnv) return { key: orEnv, source: 'env', type: 'openrouter' }
  const oaiEnv = env.VITE_OPENAI_API_KEY
  if (oaiEnv) return { key: oaiEnv, source: 'env', type: 'openai' }
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_KEY) : null
  if (stored) {
    return { key: stored, source: 'localStorage', type: stored.startsWith('sk-or') ? 'openrouter' : 'openai' }
  }
  return null
}

export function hasApiKey() { return getApiKey() !== null }
export function saveKeyToStorage(key) { localStorage.setItem(LS_KEY, key.trim()) }
export function clearStoredKey() { localStorage.removeItem(LS_KEY) }

// Pull a JSON object out of a model reply, tolerating code fences and stray prose.
export function parseJSONLoose(content) {
  const cleaned = (content || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try { return JSON.parse(cleaned) } catch { /* fall through */ }
  const first = cleaned.indexOf('{')
  const last  = cleaned.lastIndexOf('}')
  if (first !== -1 && last > first) {
    try { return JSON.parse(cleaned.slice(first, last + 1)) } catch { /* fall through */ }
  }
  throw new Error('AI returned invalid JSON. Try again.')
}

// Multi-turn chat call. messages: [{ role: 'system'|'user'|'assistant', content }]
export async function callAIChat(messages, maxTokens = 800, { temperature = 0.7 } = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('NO_KEY')

  const isOpenRouter = apiKey.type === 'openrouter'
  const url = isOpenRouter ? OPENROUTER_URL : OPENAI_URL
  const model = isOpenRouter ? OPENROUTER_MODEL : OPENAI_MODEL

  const headers = {
    'Authorization': `Bearer ${apiKey.key}`,
    'Content-Type': 'application/json',
  }
  if (isOpenRouter && typeof window !== 'undefined') {
    headers['HTTP-Referer'] = window.location.origin
    headers['X-Title'] = 'Interview Arena'
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
  })

  if (!response.ok) {
    const err = await response.text()
    if (response.status === 401) throw new Error('INVALID_KEY')
    throw new Error(`API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return parseJSONLoose(data.choices?.[0]?.message?.content || '')
}

export async function callAI(systemPrompt, userPrompt, maxTokens = 800) {
  return callAIChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    maxTokens
  )
}
