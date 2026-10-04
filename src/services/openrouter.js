const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const PROXY_URL = '/api/ai'
const OPENROUTER_MODEL = 'openai/gpt-4o-mini'
const OPENAI_MODEL = 'gpt-4o-mini'
const LS_KEY = 'ia_api_key'
const TIMEOUT_MS = 45000
const MAX_RETRIES = 1

const env = () => import.meta.env || {}

// Server proxy mode (recommended for deployment): the AI key lives on the server,
// the browser sends a Firebase ID token. See api/ai.js.
export const usesProxy = () => ['true', '1'].includes(String(env().VITE_AI_PROXY || '').toLowerCase())

function safeStorage() {
  try { return typeof localStorage !== 'undefined' ? localStorage : null } catch { return null }
}

export function getApiKey() {
  if (usesProxy()) return { key: '', source: 'server', type: 'proxy' }
  // NOTE: VITE_* variables are bundled into the public JS. Only use these for local dev.
  const orEnv = env().VITE_OPENROUTER_API_KEY
  if (orEnv) return { key: orEnv, source: 'env', type: 'openrouter' }
  const oaiEnv = env().VITE_OPENAI_API_KEY
  if (oaiEnv) return { key: oaiEnv, source: 'env', type: 'openai' }
  const stored = safeStorage()?.getItem(LS_KEY)
  if (stored) {
    return { key: stored, source: 'localStorage', type: stored.startsWith('sk-or') ? 'openrouter' : 'openai' }
  }
  return null
}

export function hasApiKey() { return getApiKey() !== null }
export function saveKeyToStorage(key) { safeStorage()?.setItem(LS_KEY, key.trim()) }
export function clearStoredKey() { safeStorage()?.removeItem(LS_KEY) }

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

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const retryable = (status) => status === 429 || status >= 500

async function fetchWithTimeout(url, init) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('The AI took too long to respond. Try again.')
    throw new Error('Network error reaching the AI. Check your connection.')
  } finally {
    clearTimeout(timer)
  }
}

async function buildRequest(messages, maxTokens, temperature) {
  if (usesProxy()) {
    const { auth } = await import('./firebase')
    const token = await auth.currentUser?.getIdToken()
    if (!token) throw new Error('NOT_SIGNED_IN')
    return {
      url: PROXY_URL,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: { messages, maxTokens, temperature },
    }
  }
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('NO_KEY')
  const isOpenRouter = apiKey.type === 'openrouter'
  const headers = { 'Authorization': `Bearer ${apiKey.key}`, 'Content-Type': 'application/json' }
  if (isOpenRouter && typeof window !== 'undefined') {
    headers['HTTP-Referer'] = window.location.origin
    headers['X-Title'] = 'Interview Arena'
  }
  return {
    url: isOpenRouter ? OPENROUTER_URL : OPENAI_URL,
    headers,
    body: { model: isOpenRouter ? OPENROUTER_MODEL : OPENAI_MODEL, messages, temperature, max_tokens: maxTokens },
  }
}

// Multi-turn chat call. messages: [{ role: 'system'|'user'|'assistant', content }]
// Times out after 45s and retries once on 429/5xx.
export async function callAIChat(messages, maxTokens = 800, { temperature = 0.7 } = {}) {
  const req = await buildRequest(messages, maxTokens, temperature)
  let lastErr
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetchWithTimeout(req.url, {
      method: 'POST', headers: req.headers, body: JSON.stringify(req.body),
    })
    if (response.ok) {
      const data = await response.json()
      // proxy returns { content }, providers return { choices: [...] }
      const content = data.content ?? data.choices?.[0]?.message?.content ?? ''
      return parseJSONLoose(content)
    }
    if (response.status === 401) throw new Error('INVALID_KEY')
    if (response.status === 402) throw new Error('Your AI key is out of credits.')
    const text = await response.text().catch(() => '')
    lastErr = new Error(`API error ${response.status}: ${text.slice(0, 200)}`)
    if (!retryable(response.status) || attempt === MAX_RETRIES) break
    await sleep(1200 * (attempt + 1))
  }
  throw lastErr
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
