import { useState, useRef, useEffect } from 'react'

export default function VoiceInput({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const [interim, setInterim] = useState('')
  const recogRef = useRef(null)

  useEffect(() => {
    setSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
    return () => recogRef.current?.stop()
  }, [])

  function toggle() {
    if (listening) {
      recogRef.current?.stop()
      setListening(false)
      setInterim('')
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const recog = new SR()
    recog.continuous = true
    recog.interimResults = true
    recog.lang = 'en-US'

    recog.onresult = (e) => {
      let final = ''
      let interimText = ''
      for (const result of e.results) {
        if (result.isFinal) final += result[0].transcript + ' '
        else interimText += result[0].transcript
      }
      if (final) onTranscript(final)
      setInterim(interimText)
    }

    recog.onend = () => { setListening(false); setInterim('') }
    recog.onerror = () => { setListening(false); setInterim('') }

    recogRef.current = recog
    recog.start()
    setListening(true)
  }

  if (!supported) return null

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        title={listening ? 'Stop speaking' : 'Speak your answer'}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all border ${
          listening
            ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
            : 'bg-arena-700 border-arena-border text-white/50 hover:text-white hover:border-arena-border-light'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <span className={`w-2 h-2 rounded-full ${listening ? 'bg-red-400' : 'bg-white/30'}`} />
        {listening ? 'Listening… (click to stop)' : '🎤 Speak answer'}
      </button>
      {interim && (
        <p className="text-white/30 text-xs font-mono italic px-1 truncate max-w-xs">
          {interim}
        </p>
      )}
    </div>
  )
}
