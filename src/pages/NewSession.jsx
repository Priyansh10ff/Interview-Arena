import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuthContext } from '../context/AuthContext'
import { useSession } from '../hooks/useSession'
import { useSessionContext } from '../context/SessionContext'
import { hasApiKey } from '../services/openrouter'

const LANGS = ['javascript','typescript','python','java','c++','go','rust','other']
const DIFFS = [
  {v:'easy',label:'EASY',desc:'junior level',cls:'lime'},
  {v:'mid',label:'MID',desc:'mid-level SWE',cls:'yellow'},
  {v:'senior',label:'SENIOR',desc:'staff / senior',cls:'red'},
]
const PLACEHOLDER=`// paste your code here
// e.g.
function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}`

export default function NewSession() {
  const [code,setCode]=useState('')
  const [lang,setLang]=useState('javascript')
  const [diff,setDiff]=useState('mid')
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')
  const { user } = useAuthContext()
  const { startSession } = useSession()
  const { dispatch } = useSessionContext()
  const navigate = useNavigate()

  async function handleStart() {
    if(!code.trim()){setErr('paste some code first.');return}
    // security: don't create session in DB if no key
    if(!hasApiKey()){
      setErr('no API key configured. add your key in settings first.')
      return
    }
    setErr('')
    setLoading(true)
    dispatch({ type:'RESET' })
    try {
      const id = await startSession(user.uid, code.trim(), lang, diff)
      navigate(`/session/${id}`)
    } catch(e){ setErr(e.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="text-lime text-xs font-mono mb-1">// new session</div>
          <h1 className="text-white font-bold font-mono text-2xl">Enter the Arena</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-g-border">
          {/* code input */}
          <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-g-border">
            <div className="border-b border-g-border px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400/50" />
              <span className="w-2 h-2 rounded-full bg-yellow-400/50" />
              <span className="w-2 h-2 rounded-full bg-lime/50" />
              <span className="text-white/25 font-mono text-xs ml-2">paste-code.js</span>
            </div>
            <textarea
              value={code}
              onChange={e=>setCode(e.target.value)}
              placeholder={PLACEHOLDER}
              className="code-editor w-full h-80 bg-g-900 text-white/80 placeholder-white/10 p-5 focus:outline-none border-0"
            />
            <div className="border-t border-g-border px-4 py-2 flex items-center justify-between">
              <span className="text-white/20 font-mono text-xs">{code.length} chars</span>
              {code.length>5000&&<span className="text-yellow-400/60 text-xs font-mono">large — first 900 chars used for AI</span>}
            </div>
          </div>

          {/* config */}
          <div className="p-5 space-y-6">
            <div>
              <div className="text-white/30 font-mono text-xs mb-3">// language</div>
              <div className="grid grid-cols-2 gap-1">
                {LANGS.map(l=>(
                  <button key={l} onClick={()=>setLang(l)}
                    className={`py-1.5 font-mono text-xs transition-colors ${lang===l?'bg-lime text-black font-bold':'text-white/35 hover:text-white border border-g-border hover:border-g-hi'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-white/30 font-mono text-xs mb-3">// difficulty</div>
              <div className="space-y-1">
                {DIFFS.map(d=>(
                  <button key={d.v} onClick={()=>setDiff(d.v)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 font-mono text-xs transition-colors border ${
                      diff===d.v
                        ? d.cls==='lime'?'bg-lime/10 border-lime text-lime':d.cls==='yellow'?'bg-yellow-400/10 border-yellow-400 text-yellow-400':'bg-red-400/10 border-red-400 text-red-400'
                        : 'border-g-border text-white/35 hover:border-g-hi hover:text-white'
                    }`}>
                    <span className="font-bold">{d.label}</span>
                    <span className="opacity-60">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {err && <p className="text-red-400 font-mono text-xs border border-red-400/20 px-3 py-2">
              {err}{err.includes('settings') && <> <Link to="/settings" className="underline">go →</Link></>}
            </p>}

            <button
              onClick={handleStart}
              disabled={!code.trim()||loading}
              className="w-full py-3 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              {loading ? 'starting...' : 'START SESSION →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
