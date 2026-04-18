import { useState, useRef, useEffect } from 'react'

export default function VoiceInput({ onTranscript, disabled }) {
  const [listening,setListening] = useState(false)
  const [supported,setSupported] = useState(false)
  const [interim,setInterim] = useState('')
  const recogRef = useRef(null)

  useEffect(()=>{
    setSupported(!!(window.SpeechRecognition||window.webkitSpeechRecognition))
    return ()=>recogRef.current?.stop()
  },[])

  function toggle() {
    if(listening){recogRef.current?.stop();setListening(false);setInterim('');return}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition
    if(!SR) return
    const r=new SR()
    r.continuous=true; r.interimResults=true; r.lang='en-US'
    r.onresult=e=>{
      let fin='',int=''
      for(const res of e.results) res.isFinal?fin+=res[0].transcript+' ':int+=res[0].transcript
      if(fin) onTranscript(fin)
      setInterim(int)
    }
    r.onend=()=>{setListening(false);setInterim('')}
    r.onerror=()=>{setListening(false);setInterim('')}
    recogRef.current=r; r.start(); setListening(true)
  }

  if(!supported) return null

  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={toggle} disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-xs transition-colors
          ${listening
            ? 'border-red-400/50 text-red-400 bg-red-400/5'
            : 'border-g-border text-white/35 hover:text-white hover:border-g-hi'}
          disabled:opacity-30 disabled:cursor-not-allowed`}>
        <span className={`w-1.5 h-1.5 ${listening?'bg-red-400 animate-pulse-lime':'bg-white/20'}`}/>
        {listening ? 'listening… click to stop' : '🎤 speak'}
      </button>
      {interim&&<p className="text-white/25 font-mono text-xs truncate max-w-xs">{interim}</p>}
    </div>
  )
}
