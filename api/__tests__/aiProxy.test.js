import { describe, it, expect, vi } from 'vitest'
import { createHandler, createRateLimiter, validateBody, LIMITS } from '../_aiProxy.js'

function mockRes() {
  const res = { statusCode: 0, body: null }
  res.status = (c) => { res.statusCode = c; return res }
  res.json = (b) => { res.body = b; return res }
  return res
}
const okFetch = vi.fn(async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: '{"a":1}' } }] }) }))
const env = { OPENROUTER_API_KEY: 'sk-or-secret' }
const req = (over = {}) => ({
  method: 'POST',
  headers: { authorization: 'Bearer good' },
  body: { messages: [{ role: 'user', content: 'hi' }], maxTokens: 5000 },
  ...over,
})
const verifyToken = async (t) => { if (t !== 'good') throw new Error('bad'); return 'uid-1' }

describe('validateBody', () => {
  it('accepts a normal request', () => expect(validateBody(req().body)).toBeNull())
  it('rejects bad shapes', () => {
    expect(validateBody(null)).toBeTruthy()
    expect(validateBody({ messages: [] })).toBeTruthy()
    expect(validateBody({ messages: [{ role: 'tool', content: 'x' }] })).toBeTruthy()
    expect(validateBody({ messages: [{ role: 'user', content: 5 }] })).toBeTruthy()
    expect(validateBody({ messages: [{ role: 'user', content: 'x'.repeat(LIMITS.maxChars + 1) }] })).toBeTruthy()
    expect(validateBody({ messages: [{ role: 'user', content: 'x' }], temperature: 9 })).toBeTruthy()
  })
})

describe('rate limiter', () => {
  it('allows N per minute per key', () => {
    let t = 0
    const lim = createRateLimiter(2, () => t)
    expect(lim('a')).toBe(true); expect(lim('a')).toBe(true); expect(lim('a')).toBe(false)
    expect(lim('b')).toBe(true)
    t = 61000
    expect(lim('a')).toBe(true)
  })
})

describe('handler', () => {
  it('proxies with server key, locked model and capped tokens', async () => {
    const fetchImpl = vi.fn(okFetch)
    const res = mockRes()
    await createHandler({ verifyToken, fetchImpl, env })(req(), res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ content: '{"a":1}' })
    const [, init] = fetchImpl.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer sk-or-secret')
    const sent = JSON.parse(init.body)
    expect(sent.model).toBe('openai/gpt-4o-mini')
    expect(sent.max_tokens).toBe(LIMITS.maxTokens)
    expect(sent.user).toBe('uid-1')
  })
  it('rejects missing or invalid tokens', async () => {
    const h = createHandler({ verifyToken, fetchImpl: okFetch, env })
    let res = mockRes(); await h(req({ headers: {} }), res); expect(res.statusCode).toBe(401)
    res = mockRes(); await h(req({ headers: { authorization: 'Bearer bad' } }), res); expect(res.statusCode).toBe(401)
  })
  it('rejects non-POST, bad bodies and missing server key', async () => {
    let res = mockRes(); await createHandler({ verifyToken, fetchImpl: okFetch, env })(req({ method: 'GET' }), res)
    expect(res.statusCode).toBe(405)
    res = mockRes(); await createHandler({ verifyToken, fetchImpl: okFetch, env })(req({ body: '{bad' }), res)
    expect(res.statusCode).toBe(400)
    res = mockRes(); await createHandler({ verifyToken, fetchImpl: okFetch, env: {} })(req(), res)
    expect(res.statusCode).toBe(500)
  })
  it('rate limits per user', async () => {
    const h = createHandler({ verifyToken, fetchImpl: okFetch, env, limiter: createRateLimiter(1) })
    let res = mockRes(); await h(req(), res); expect(res.statusCode).toBe(200)
    res = mockRes(); await h(req(), res); expect(res.statusCode).toBe(429)
  })
  it('does not leak upstream error bodies', async () => {
    const fetchImpl = async () => ({ ok: false, status: 401, text: async () => 'account secret details' })
    const res = mockRes()
    await createHandler({ verifyToken, fetchImpl, env })(req(), res)
    expect(res.statusCode).toBe(502)
    expect(JSON.stringify(res.body)).not.toContain('secret')
  })
})
