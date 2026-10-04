// Helpers for the spoken interviewer (Web Speech API, no library).

const VOICE_PREFS = ['en-IN', 'en-GB', 'en-US']

export function pickVoice(voices) {
  if (!voices?.length) return null
  for (const lang of VOICE_PREFS) {
    const v = voices.find(x => x.lang?.replace('_', '-') === lang)
    if (v) return v
  }
  return voices.find(x => x.lang?.toLowerCase().startsWith('en')) || null
}

// strip markdown / code so the voice reads naturally
export function cleanForSpeech(text) {
  return (text || '')
    .replace(/```[\s\S]*?```/g, ' (see the code) ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[*_#>]/g, '')
    .replace(/\bO\(([^)]*)\)/g, 'O of $1')
    .replace(/\s+/g, ' ')
    .trim()
}
