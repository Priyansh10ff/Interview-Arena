import { useCallback, useEffect, useState } from 'react'
import { pickVoice, cleanForSpeech } from '../utils/speech'

const LS_KEY = 'ia_voice'

function readPref() {
  try { return localStorage.getItem(LS_KEY) !== 'off' } catch { return true }
}

export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [enabled, setEnabled]   = useState(readPref)
  const [speaking, setSpeaking] = useState(false)
  const [voice, setVoice]       = useState(null)

  useEffect(() => {
    if (!supported) return
    const load = () => setVoice(pickVoice(window.speechSynthesis.getVoices()))
    load()
    window.speechSynthesis.addEventListener?.('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [supported])

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  const speak = useCallback((text) => {
    if (!supported || !enabled) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(cleanForSpeech(text))
    if (voice) u.voice = voice
    u.rate = 1.03
    u.onstart = () => setSpeaking(true)
    u.onend = u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }, [supported, enabled, voice])

  const toggle = useCallback(() => {
    setEnabled(v => {
      const next = !v
      try { localStorage.setItem(LS_KEY, next ? 'on' : 'off') } catch { /* ignore */ }
      if (!next && supported) window.speechSynthesis.cancel()
      return next
    })
  }, [supported])

  return { supported, enabled, speaking, speak, stop, toggle }
}
