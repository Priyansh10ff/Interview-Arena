// Core of the AI proxy, kept framework-free so it can be unit tested.
// The browser never sees the AI key: it sends a Firebase ID token, we verify it,
// validate the request, lock the model, cap tokens and rate-limit per user.

export const LIMITS = {
  maxMessages: 60,
  maxChars: 60000,
  maxTokens: 1600,
  perMinute: 20,
}
const ROLES = new Set(['system', 'user', 'assistant'])

export function validateBody(body) {
  if (!body || typeof body !== 'object') return 'Body must be JSON.'
  const { messages, maxTokens, temperature } = body
  if (!Array.isArray(messages) || messages.length === 0) return 'messages must be a non-empty array.'
  if (messages.length > LIMITS.maxMessages) return 'Too many messages.'
  let chars = 0
  for (const m of messages) {
    if (!m || !ROLES.has(m.role) || typeof m.content !== 'string') return 'Invalid message.'
    chars += m.content.length
  }
  if (chars > LIMITS.maxChars) return 'Request too large.'
  if (maxTokens != null && !(Number.isFinite(maxTokens) && maxTokens > 0)) return 'Invalid maxTokens.'
  if (temperature != null && !(Number.isFinite(temperature) && temperature >= 0 && temperature <= 1.5)) return 'Invalid temperature.'
  return null
}

// sliding-window limiter; per server instance (good enough to stop runaway loops,
// use a shared store like Upstash/Redis for hard guarantees)
export function createRateLimiter(perMinute = LIMITS.perMinute, now = () => Date.now()) {
  const hits = new Map()
  return (key) => {
    const t = now()
    const recent = (hits.get(key) || []).filter(x => t - x < 60000)
    if (recent.length >= perMinute) { hits.set(key, recent); return false }
    recent.push(t)
    hits.set(key, recent)
    return true
  }
}

export function createHandler({ verifyToken, fetchImpl = fetch, env = process.env, limiter = createRateLimiter() }) {
  return async function handler(req, res) {
    const send = (status, payload) => res.status(status).json(payload)
    if (req.method !== 'POST') return send(405, { error: 'Method not allowed' })

    const key = env.OPENROUTER_API_KEY
    if (!key) return send(500, { error: 'Server AI key not configured.' })

    const auth = req.headers?.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return send(401, { error: 'Missing token' })

    let uid
    try { uid = await verifyToken(token) } catch { return send(401, { error: 'Invalid token' }) }
    if (!uid) return send(401, { error: 'Invalid token' })

    if (!limiter(uid)) return send(429, { error: 'Slow down: too many requests.' })

    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = null } }
    const invalid = validateBody(body)
    if (invalid) return send(400, { error: invalid })

    const upstream = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'Interview Arena' },
      body: JSON.stringify({
        model: env.AI_MODEL || 'openai/gpt-4o-mini',
        messages: body.messages,
        max_tokens: Math.min(LIMITS.maxTokens, body.maxTokens || 800),
        temperature: body.temperature ?? 0.7,
        user: uid,
      }),
    })
    if (!upstream.ok) {
      // never forward upstream bodies: they can contain account details
      return send(upstream.status === 429 ? 429 : 502, { error: `AI provider error (${upstream.status})` })
    }
    const data = await upstream.json()
    return send(200, { content: data.choices?.[0]?.message?.content ?? '' })
  }
}
