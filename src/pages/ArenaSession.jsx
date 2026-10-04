import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/ui/Loader'
import TypingIndicator from '../components/ui/TypingIndicator'
import VoiceInput from '../components/ui/VoiceInput'
import { getCompany, getRound } from '../data/companies'
import { getRoundType } from '../data/roundTypes'
import { getArenaSession, updateArenaSession } from '../services/firestore'
import { callAIChat } from '../services/openrouter'
import { useSpeech } from '../hooks/useSpeech'
import {
  buildInterviewerSystemPrompt, interviewerTurn,
  shouldForceWrapup, formatClock, turnBudget, candidateTurns,
} from '../utils/arenaEngine'

const CODE_LANGS = ['javascript', 'python', 'java', 'c++', 'go', 'typescript']

function errorText(msg) {
  if (msg === 'NO_KEY') return 'No API key configured. Add one in Settings.'
  if (msg === 'INVALID_KEY') return 'API key rejected. Check it has credits.'
  return msg || 'The interviewer did not respond.'
}

export default function ArenaSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session,    setSession]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [transcript, setTranscript] = useState([])
  const [code,       setCode]       = useState('')
  const [codeLang,   setCodeLang]   = useState('javascript')
  const [input,      setInput]      = useState('')
  const [thinking,   setThinking]   = useState(false)
  const [error,      setError]      = useState('')
  const [done,       setDone]       = useState(false)
  const [now,        setNow]        = useState(Date.now())

  const { supported: ttsOk, enabled: ttsOn, speaking, speak, stop: stopSpeech, toggle: toggleTts } = useSpeech()
  const spokenRef   = useRef(-1)   // index of the last interviewer message already spoken
  const startedRef  = useRef(false)
  const lastCodeRef = useRef('')
  const bottomRef   = useRef(null)
  const mountedRef  = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const company = session ? getCompany(session.companyId) : null
  const round   = session ? getRound(session.companyId, session.roundId) : null
  const type    = round ? getRoundType(round.type) : null
  const isCode  = type?.workspace === 'code'

  const system = useMemo(
    () => (company && round ? buildInterviewerSystemPrompt({ company, round, type, level: session.level }) : ''),
    [company, round, type, session?.level]
  )

  const startedAt = session?.startedAt || now
  const elapsed   = Math.floor(((done && session?.endedAt ? session.endedAt : now) - startedAt) / 1000)

  // ── interviewer turn ──────────────────────────────────────────────
  const askInterviewer = useCallback(async (base, { forceWrapup = false } = {}) => {
    setThinking(true); setError('')
    try {
      const { transcript: next, done: ended } = await interviewerTurn(callAIChat, system, base, { forceWrapup })
      if (!mountedRef.current) return
      setTranscript(next)
      const patch = { transcript: next, code, codeLang }
      if (ended) {
        const endedAt = Date.now()
        Object.assign(patch, { status: 'ended', endedAt })
        setSession(s => ({ ...s, endedAt }))
        setDone(true)
      }
      await updateArenaSession(sessionId, patch)
    } catch (e) {
      if (mountedRef.current) setError(errorText(e.message))
    } finally {
      if (mountedRef.current) setThinking(false)
    }
  }, [system, code, codeLang, sessionId])

  // ── load ──────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true
    getArenaSession(sessionId).then(async s => {
      if (!alive) return
      if (!s || !getRound(s.companyId, s.roundId)) { navigate('/arena', { replace: true }); return }
      if (s.status === 'scored') { navigate(`/arena/report/${sessionId}`, { replace: true }); return }
      if (!s.startedAt) {
        s.startedAt = Date.now()
        updateArenaSession(sessionId, { startedAt: s.startedAt }).catch(() => {})
      }
      setSession(s)
      setTranscript(s.transcript || [])
      spokenRef.current = (s.transcript || []).length - 1
      setCode(s.code || '')
      lastCodeRef.current = s.code || ''
      setCodeLang(s.codeLang || 'javascript')
      setDone(s.status === 'ended')
      setLoading(false)
    })
    return () => { alive = false }
  }, [sessionId, navigate])

  // kick off the interview once
  useEffect(() => {
    if (!session || !system || startedRef.current) return
    startedRef.current = true
    if (!session.transcript?.length && session.status === 'live') askInterviewer([])
  }, [session, system, askInterviewer])

  // clock
  useEffect(() => {
    if (done) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [done])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [transcript, thinking])

  // speak each new interviewer message once
  useEffect(() => {
    const i = transcript.length - 1
    if (i <= spokenRef.current) return
    spokenRef.current = i
    if (transcript[i]?.role === 'interviewer') speak(transcript[i].text)
  }, [transcript, speak])

  // ── candidate turn ────────────────────────────────────────────────
  async function handleSend() {
    if (thinking || done) return
    const text = input.trim()
    const codeChanged = isCode && code.trim() && code !== lastCodeRef.current
    if (!text && !codeChanged) return
    stopSpeech()
    const item = { role: 'candidate', text: text || '(shared updated code)', at: Date.now() }
    if (codeChanged) { item.code = code; lastCodeRef.current = code }
    const next = [...transcript, item]
    setTranscript(next)
    setInput('')
    await askInterviewer(next, { forceWrapup: shouldForceWrapup(next, round, elapsed) })
  }

  function handleRetry() { askInterviewer(transcript) }
  function handleEnd() { if (!thinking && !done) askInterviewer(transcript, { forceWrapup: true }) }

  function onEditorKey(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.target, s = el.selectionStart, en = el.selectionEnd
      const v = code.slice(0, s) + '  ' + code.slice(en)
      setCode(v)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2 })
    }
  }
  function onInputKey(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend() }
  }

  if (loading) return (
    <div className="min-h-screen bg-g-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><Loader message="joining the interview room…" /></div>
    </div>
  )

  const limitSec = round.durationMin * 60
  const overTime = elapsed > limitSec
  const turns    = candidateTurns(transcript)

  const chat = (
    <div className="flex flex-col min-h-0 h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {transcript.map((t, i) => (
          <div key={i} className={`animate-fade-in ${t.role === 'candidate' ? 'pl-8' : 'pr-8'}`}>
            <div className={`font-mono text-xs mb-1 ${t.role === 'candidate' ? 'text-white/25 text-right' : 'text-lime'}`}>
              {t.role === 'candidate' ? 'you' : `interviewer · ${company.name}`}
            </div>
            <div className={`border px-3 py-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap ${
              t.role === 'candidate' ? 'border-g-border bg-g-800 text-white/80' : 'border-lime/20 bg-g-900 text-white'
            }`}>
              {t.text}
              {t.code && <div className="mt-2 text-white/25">[code shared · {t.code.split('\n').length} lines]</div>}
            </div>
          </div>
        ))}
        {thinking && <div className="pr-8"><TypingIndicator label="interviewer is thinking…" /></div>}
        {error && (
          <div className="border border-red-400/30 px-3 py-2 flex items-center justify-between gap-3">
            <span className="text-red-400 font-mono text-xs">{error}</span>
            <button onClick={handleRetry} className="text-lime font-mono text-xs underline shrink-0">retry</button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {done ? (
        <div className="border-t border-g-border p-4 space-y-3">
          <div className="text-lime font-mono text-xs">// round complete · {formatClock(elapsed)} · {turns} replies</div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/arena" className="px-4 py-2 border border-g-border text-white/60 font-mono text-xs hover:text-white">← arena</Link>
          </div>
        </div>
      ) : (
        <div className="border-t border-g-border p-3 space-y-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={isCode ? 'Talk through your approach… (your editor code is sent with each reply)' : 'Your answer…'}
            className="code-editor w-full h-24 bg-g-800 border border-g-border text-white placeholder-white/15 p-3 focus:outline-none focus:border-lime/40"
            disabled={thinking}
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <VoiceInput onTranscript={t => setInput(p => (p ? p.trimEnd() + ' ' + t : t))} disabled={thinking} />
            <div className="flex items-center gap-2">
              <span className="text-white/20 font-mono text-xs hidden sm:inline">ctrl+enter</span>
              <button onClick={handleSend} disabled={thinking}
                className="px-5 py-2 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim disabled:opacity-40 transition-colors">
                SEND →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="h-screen bg-g-950 flex flex-col">
      <Navbar />
      <div className="border-b border-g-border px-4 py-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-lime font-mono text-xs">{company.name}</span>
          <span className="text-white/30 font-mono text-xs"> · {round.title} · {session.level}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {ttsOk && (
            <button onClick={toggleTts} title="Interviewer voice"
              className={`px-2 py-1 border font-mono text-xs transition-colors ${
                ttsOn ? 'border-lime/40 text-lime' : 'border-g-border text-white/30 hover:text-white'
              } ${speaking ? 'animate-pulse-lime' : ''}`}>
              {ttsOn ? '🔊 voice' : '🔇 muted'}
            </button>
          )}
          <span className="text-white/25 font-mono text-xs hidden sm:inline">{turns}/{turnBudget(round.durationMin)} replies</span>
          <span className={`font-mono text-sm font-bold ${overTime ? 'text-red-400' : 'text-white'}`}>
            {formatClock(elapsed)}<span className="text-white/25 font-normal text-xs"> / {round.durationMin}:00</span>
          </span>
          {!done && (
            <button onClick={handleEnd} disabled={thinking}
              className="px-3 py-1 border border-red-400/40 text-red-400 font-mono text-xs hover:bg-red-400/5 disabled:opacity-40">
              END
            </button>
          )}
        </div>
      </div>

      {isCode ? (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 md:divide-x divide-g-border">
          <div className="min-h-0 flex flex-col">{chat}</div>
          <div className="min-h-0 flex flex-col border-t md:border-t-0 border-g-border">
            <div className="px-3 py-2 border-b border-g-border flex items-center justify-between">
              <span className="text-white/30 font-mono text-xs">editor</span>
              <select value={codeLang} onChange={e => setCodeLang(e.target.value)} disabled={done}
                className="bg-g-800 border border-g-border text-white/60 font-mono text-xs px-2 py-1 focus:outline-none">
                {CODE_LANGS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={onEditorKey}
              readOnly={done}
              spellCheck={false}
              placeholder="// write your solution here"
              className="code-editor flex-1 w-full min-h-[240px] bg-g-900 text-white placeholder-white/15 p-4 focus:outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 max-w-3xl w-full mx-auto">{chat}</div>
      )}
    </div>
  )
}
