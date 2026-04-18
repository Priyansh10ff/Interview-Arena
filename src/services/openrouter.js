const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const OPENROUTER_MODEL = 'openai/gpt-4o-mini'
const OPENAI_MODEL = 'gpt-4o-mini'
const LS_KEY = 'ia_api_key'

export function getApiKey() {
  const orEnv = import.meta.env.VITE_OPENROUTER_API_KEY
  if (orEnv) return { key: orEnv, source: 'env', type: 'openrouter' }
  const oaiEnv = import.meta.env.VITE_OPENAI_API_KEY
  if (oaiEnv) return { key: oaiEnv, source: 'env', type: 'openai' }
  const stored = localStorage.getItem(LS_KEY)
  if (stored) {
    return { key: stored, source: 'localStorage', type: stored.startsWith('sk-or') ? 'openrouter' : 'openai' }
  }
  return null
}

export function hasApiKey() { return getApiKey() !== null }
export function saveKeyToStorage(key) { localStorage.setItem(LS_KEY, key.trim()) }
export function clearStoredKey() { localStorage.removeItem(LS_KEY) }

export async function callAI(systemPrompt, userPrompt, maxTokens = 800) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('NO_KEY')

  const isOpenRouter = apiKey.type === 'openrouter'
  const url = isOpenRouter ? OPENROUTER_URL : OPENAI_URL
  const model = isOpenRouter ? OPENROUTER_MODEL : OPENAI_MODEL

  const headers = {
    'Authorization': `Bearer ${apiKey.key}`,
    'Content-Type': 'application/json',
  }
  if (isOpenRouter) {
    headers['HTTP-Referer'] = window.location.origin
    headers['X-Title'] = 'Interview Arena'
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    if (response.status === 401) throw new Error('INVALID_KEY')
    throw new Error(`API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('AI returned invalid JSON. Try again.')
  }
}
