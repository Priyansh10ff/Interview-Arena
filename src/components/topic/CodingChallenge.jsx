import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '../layout/Navbar'
import VoiceInput from '../ui/VoiceInput'
import { useAI } from '../../hooks/useAI'
import { buildHintPrompt, buildCodingEvalPrompt } from '../../utils/promptBuilder'
import { useSessionContext } from '../../context/SessionContext'

const HINT_PENALTY = 8
const HINT_PROMPT_AFTER = 480  // 8 minutes in seconds

const STARTER = {
  javascript:'function solution() {\n  // your code here\n}\n',
  python:'def solution():\n    # your code here\n    pass\n',
  java:'class Solution {\n    public void solve() {\n        // your code here\n    }\n}\n',
  'c++':'#include <bits/stdc++.h>\nusing namespace std;\nvoid solution() {\n    // your code here\n}\n',
}

export default function CodingChallenge({ domain, diff, data, onResult }) {
  const [lang, setLang] = useState('javascript')
  const [code, setCode] = useState(STARTER.javascript)
  const [elapsed, setElapsed] = useState(0)       // seconds
  const [started, setStarted] = useState(false)
  const [hints, setHints] = useState([])
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHintBtn, setShowHintBtn] = useState(false)
  const [hintLoading, setHintLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { runAI } = useAI()
  const { state } = useSessionContext()
  const timerRef = useRef(null)
  const codeRef = useRef(code)
  codeRef.current = code

  // timer
  useEffect(() => {
    if (started) {
      timerRef.current = setInterval(() => {
        setElapsed(e => {
          const n = e + 1
          if (n >= HINT_PROMPT_AFTER && !showHintBtn) setShowHintBtn(true)
          return n
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [started])

  function fmt(s) {
    const m = Math.floor(s / 60).toString().padStart(2,'0')
    const sec = (s % 60).toString().padStart(2,'0')
    return `${m}:${sec}`
  }

  function handleCode(e) {
    setCode(e.target.value)
    if (!started && e.target.value.trim()) setStarted(true)
  }

  function handleTab(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const s = e.target.selectionStart, end = e.target.selectionEnd
      const v = e.target.value
      const next = v.slice(0,s) + '  ' + v.slice(end)
      setCode(next)
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2 }, 0)
    }
  }

  function changeLang(l) {
    setLang(l)
    setCode(STARTER[l] || '// your code here\n')
  }

  async function getHint() {
    if (hintsUsed >= 3 || hintLoading) return
    setHintLoading(true)
    try {
      const { system, user, maxTokens } = buildHintPrompt(
        data.description || data.title, codeRef.current
      )
      const res = await runAI(system, user, maxTokens)
      setHints(h => [...h, res.hint])
      setHintsUsed(n => n + 1)
    } catch {}
    finally { setHintLoading(false) }
  }

  async function handleSubmit() {
    if (!code.trim() || submitting) return
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      const { system, user, maxTokens } = buildCodingEvalPrompt(
        data.description || data.title, code, lang
      )
      const res = await runAI(system, user, maxTokens)
      const raw = Math.max(0, (res.score || 60) - hintsUsed * HINT_PENALTY)
      onResult(raw, `Time: ${fmt(elapsed)} · TC: ${res.timeComplexity||'?'} · SC: ${res.spaceComplexity||'?'} · ${res.feedback||''} ${res.improvement||''}`)
    } catch { setSubmitting(false) }
  }

  const problem = data || {}
  const LANGS = ['javascript','python','java','c++']

  return (
    <div className="min-h-screen bg-g-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        {/* top bar */}
        <div className="border-b border-g-border px-4 py-2 flex items-center justify-between bg-g-900">
          <div className="flex items-center gap-3">
            <span className="text-lime font-mono text-xs font-bold">{problem.title||'Coding Challenge'}</span>
            <span className={`font-mono text-xs px-1.5 border ${diff==='easy'?'text-lime border-lime/30':diff==='medium'?'text-yellow-400 border-yellow-400/30':'text-red-400 border-red-400/30'}`}>
              {problem.difficulty||diff}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`font-mono text-sm ${elapsed>HINT_PROMPT_AFTER?'text-yellow-400':'text-white/30'}`}>
              ⏱ {fmt(elapsed)}
            </span>
            {hintsUsed>0 && <span className="text-white/30 font-mono text-xs">hints:{hintsUsed}/3 (-{hintsUsed*HINT_PENALTY}pts)</span>}
          </div>
        </div>

        {/* main split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-g-border overflow-hidden">

          {/* problem panel */}
          <div className="overflow-y-auto p-6 code-scroll">
            <h2 className="text-white font-mono font-bold text-base mb-4">{problem.title}</h2>
            <p className="text-white/60 font-mono text-xs leading-relaxed mb-5">{problem.description}</p>

            {problem.examples?.map((ex,i) => (
              <div key={i} className="mb-4">
                <div className="text-white/30 font-mono text-xs mb-1">Example {i+1}</div>
                <div className="bg-g-800 border border-g-border p-3 font-mono text-xs">
                  <div className="text-white/50">Input: <span className="text-white">{ex.input}</span></div>
                  <div className="text-white/50">Output: <span className="text-white">{ex.output}</span></div>
                  {ex.explanation && <div className="text-white/35 mt-1">{ex.explanation}</div>}
                </div>
              </div>
            ))}

            {problem.constraints?.length > 0 && (
              <div>
                <div className="text-white/30 font-mono text-xs mb-2">Constraints</div>
                <ul className="space-y-1">
                  {problem.constraints.map((c,i) => (
                    <li key={i} className="text-white/40 font-mono text-xs">• {c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* hints section */}
            {hints.length > 0 && (
              <div className="mt-6 space-y-2">
                <div className="text-yellow-400 font-mono text-xs">hints used ({hintsUsed}/3)</div>
                {hints.map((h,i) => (
                  <div key={i} className="border border-yellow-400/20 bg-yellow-400/5 px-3 py-2 text-yellow-400/80 font-mono text-xs leading-relaxed">
                    💡 {h}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* editor panel */}
          <div className="flex flex-col overflow-hidden">
            <div className="border-b border-g-border px-3 py-2 flex items-center gap-2 bg-g-900">
              {LANGS.map(l => (
                <button key={l} onClick={() => changeLang(l)}
                  className={`px-2 py-0.5 font-mono text-xs transition-colors ${lang===l?'text-lime bg-lime/10':'text-white/30 hover:text-white'}`}>
                  {l}
                </button>
              ))}
            </div>

            <textarea
              value={code}
              onChange={handleCode}
              onKeyDown={handleTab}
              spellCheck={false}
              className="code-editor code-scroll flex-1 bg-g-900 text-white/85 p-4 focus:outline-none min-h-64"
            />

            {/* bottom bar */}
            <div className="border-t border-g-border p-3 flex items-center justify-between gap-3 bg-g-900 flex-wrap">
              <div className="flex items-center gap-3">
                {showHintBtn && hintsUsed < 3 && !submitting && (
                  <button onClick={getHint} disabled={hintLoading}
                    className="px-3 py-1.5 border border-yellow-400/30 text-yellow-400/70 hover:text-yellow-400 font-mono text-xs hover:border-yellow-400/60 transition-colors disabled:opacity-40">
                    {hintLoading ? 'thinking...' : `💡 hint (-${HINT_PENALTY}pts)`}
                  </button>
                )}
                {hintsUsed >= 3 && <span className="text-white/20 font-mono text-xs">max hints reached</span>}
              </div>
              <button onClick={handleSubmit} disabled={!code.trim()||submitting||state.isAILoading}
                className="px-5 py-2 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {submitting ? 'evaluating...' : 'SUBMIT →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
