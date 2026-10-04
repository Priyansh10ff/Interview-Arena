// Vercel serverless function: POST /api/ai
// Env vars (server-side, NOT prefixed with VITE_):
//   OPENROUTER_API_KEY   your OpenRouter key
//   FIREBASE_PROJECT_ID  your Firebase project id
//   AI_MODEL             optional, defaults to openai/gpt-4o-mini
// Client: set VITE_AI_PROXY=true so the app calls this instead of the provider.
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { createHandler } from './_aiProxy.js'

const JWKS = createRemoteJWKSet(new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
))

async function verifyFirebaseToken(token) {
  const projectId = process.env.FIREBASE_PROJECT_ID
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID not set')
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  })
  return payload.sub || null
}

export default createHandler({ verifyToken: verifyFirebaseToken })
