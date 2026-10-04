import React from 'react'
import { useState, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuthContext } from '../context/AuthContext'
import { useSession } from '../hooks/useSession'
import { useSessionContext } from '../context/SessionContext'
import { hasApiKey } from '../services/openrouter'
import { CODE_LIMITS } from '../utils/promptBuilder'

const MAX_FILE_BYTES = 200 * 1024 // skip generated/minified blobs

const LANGS = ['c++', 'java', 'python', 'javascript', 'typescript', 'go', 'rust', 'other']
const DIFFS = [
  { v: 'easy',   label: 'EASY',   desc: 'junior level',   cls: 'lime'   },
  { v: 'mid',    label: 'MID',    desc: 'mid-level SWE',  cls: 'yellow' },
  { v: 'senior', label: 'SENIOR', desc: 'staff / senior', cls: 'red'    },
]

const READABLE_EXTS = new Set([
  'js','jsx','ts','tsx','py','java','cpp','cc','cxx','c','h','hpp',
  'go','rs','rb','php','cs','kt','swift','scala','sql','md','txt','json',
  'yaml','yml','toml','sh','bash','zsh',
])

function extOf(name) { return name.split('.').pop().toLowerCase() }
function isReadable(name) { return READABLE_EXTS.has(extOf(name)) }

function langFromFiles(files) {
  const counts = {}
  for (const f of files) {
    const e = extOf(f.name)
    counts[e] = (counts[e] || 0) + 1
  }
  const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]
  const map = { js:'javascript', jsx:'javascript', ts:'typescript', tsx:'typescript',
                py:'python', java:'java', cpp:'c++', cc:'c++', cxx:'c++', c:'c++',
                go:'go', rs:'rust', rb:'other', cs:'other', kt:'other' }
  return map[top] || 'other'
}

const PLACEHOLDER = `// paste your code here…
// example:
function debounce(fn, delay) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}`

export default function NewSession() {
  const [tab, setTab] = useState('paste')        // 'paste' | 'upload'
  const [code, setCode] = useState('')
  const [lang, setLang] = useState('javascript')
  const [diff, setDiff] = useState('mid')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])  // { name, content }[]
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  const { user } = useAuthContext()
  const { startSession } = useSession()
  const { dispatch } = useSessionContext()
  const navigate = useNavigate()
  const location = useLocation()

  // prefill from retry
  React.useEffect(() => {
    const s = location.state
    if (s?.prefillCode) { setCode(s.prefillCode); setTab('paste') }
    if (s?.prefillLang) setLang(s.prefillLang)
  }, [])

  // ── file reading ────────────────────────────────────────────────────
  function readFile(file) {
    return new Promise((resolve) => {
      const r = new FileReader()
      r.onload = e => resolve({ name: file.name, content: e.target.result })
      r.onerror = () => resolve({ name: file.name, content: '// could not read' })
      r.readAsText(file)
    })
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList)
      .filter(f => isReadable(f.name) && f.size <= MAX_FILE_BYTES && !/node_modules|\.min\.|dist\//.test(f.webkitRelativePath || f.name))
      .slice(0, 30)
    if (!files.length) { setErr('no readable code files found (max 200kb each).'); return }
    setErr('')
    const results = await Promise.all(files.map(readFile))
    setUploadedFiles(results)
    // auto-detect language
    const detected = langFromFiles(files)
    setLang(detected)
    // build combined code string, splitting the prompt budget across files
    const perFile = Math.max(600, Math.floor(CODE_LIMITS.project / results.length))
    const combined = results.map(f =>
      `// ── ${f.name} ──\n${f.content.slice(0, perFile)}`
    ).join('\n\n')
    setCode(combined)
  }

  function handleDrop(e) {
    e.preventDefault(); setIsDragging(false)
    // entry.file() is async: wait for every file instead of guessing with a timeout
    const entries = Array.from(e.dataTransfer.items || [])
      .map(item => item.webkitGetAsEntry?.())
      .filter(entry => entry?.isFile)
    if (!entries.length) { handleFiles(e.dataTransfer.files); return }
    Promise.all(entries.map(entry => new Promise(res => entry.file(res, () => res(null)))))
      .then(files => handleFiles(files.filter(Boolean)))
  }

  // ── submit ──────────────────────────────────────────────────────────
  async function handleStart() {
    const finalCode = code.trim()
    if (!finalCode) { setErr('add some code first.'); return }
    if (!hasApiKey()) {
      setErr('no API key — add yours in settings first.')
      return
    }
    setErr(''); setLoading(true)
    dispatch({ type: 'RESET' })
    try {
      const isProject = uploadedFiles.length > 1
      const id = await startSession(user.uid, finalCode, lang, diff, isProject)
      navigate(`/session/${id}`)
    } catch (e) { setErr(e.message); setLoading(false) }
  }

  const totalChars = code.length
  const fileCount = uploadedFiles.length

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="mb-8">
          <div className="text-lime font-mono text-xs mb-1">// new session</div>
          <h1 className="text-white font-bold font-mono text-2xl">Enter the Arena</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-g-border">

          {/* ── left: code input ──────────────────────────── */}
          <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-g-border flex flex-col">

            {/* tab bar */}
            <div className="border-b border-g-border flex items-center">
              <button onClick={() => setTab('paste')}
                className={`px-4 py-2.5 font-mono text-xs border-r border-g-border transition-colors ${tab==='paste'?'text-white bg-g-800 border-b-2 border-b-lime':'text-white/35 hover:text-white'}`}>
                paste code
              </button>
              <button onClick={() => { setTab('upload'); if(!uploadedFiles.length) fileInputRef.current?.click() }}
                className={`px-4 py-2.5 font-mono text-xs border-r border-g-border transition-colors ${tab==='upload'?'text-white bg-g-800 border-b-2 border-b-lime':'text-white/35 hover:text-white'}`}>
                upload files
              </button>
              {fileCount > 0 && (
                <span className="ml-3 text-lime font-mono text-xs">
                  {fileCount} file{fileCount>1?'s':''} loaded
                </span>
              )}
              {/* hidden inputs */}
              <input ref={fileInputRef} type="file" multiple className="hidden"
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.cc,.c,.h,.hpp,.go,.rs,.sql,.json,.md,.txt,.yaml,.yml"
                onChange={e => handleFiles(e.target.files)} />
              <input ref={folderInputRef} type="file"
                webkitdirectory="true" directory="true" multiple className="hidden"
                onChange={e => handleFiles(e.target.files)} />
            </div>

            {/* paste tab */}
            {tab === 'paste' && (
              <>
                <div className="border-b border-g-border px-4 py-2 flex items-center gap-2 bg-g-900">
                  <span className="w-2 h-2 rounded-full bg-red-400/40"/>
                  <span className="w-2 h-2 rounded-full bg-yellow-400/40"/>
                  <span className="w-2 h-2 rounded-full bg-lime/40"/>
                  <span className="text-white/20 font-mono text-xs ml-1">snippet.{lang==='c++'?'cpp':lang==='javascript'?'js':lang==='typescript'?'ts':lang}</span>
                </div>
                <textarea
                  value={tab==='upload'?'':code}
                  onChange={e => { setCode(e.target.value); setUploadedFiles([]) }}
                  placeholder={PLACEHOLDER}
                  className="code-editor flex-1 w-full min-h-72 bg-g-900 text-white/80 placeholder-white/10 p-5 focus:outline-none"
                />
              </>
            )}

            {/* upload tab */}
            {tab === 'upload' && (
              <div
                className={`flex-1 flex flex-col items-center justify-center gap-4 p-8 transition-colors cursor-pointer ${isDragging?'bg-lime/5 border-2 border-dashed border-lime/40':'bg-g-900 border-2 border-dashed border-g-border hover:border-g-hi'}`}
                onDragOver={e=>{e.preventDefault();setIsDragging(true)}}
                onDragLeave={()=>setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {fileCount === 0 ? (
                  <>
                    <div className="text-4xl select-none">📁</div>
                    <div className="text-center">
                      <p className="text-white/50 font-mono text-sm">drop files or click to browse</p>
                      <p className="text-white/25 font-mono text-xs mt-1">supports .js .ts .py .java .cpp .go .rs and more</p>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button onClick={e=>{e.stopPropagation();fileInputRef.current?.click()}}
                        className="px-4 py-2 border border-g-border text-white/50 hover:text-white font-mono text-xs hover:border-g-hi transition-colors">
                        select files
                      </button>
                      <button onClick={e=>{e.stopPropagation();folderInputRef.current?.click()}}
                        className="px-4 py-2 border border-g-border text-white/50 hover:text-white font-mono text-xs hover:border-g-hi transition-colors">
                        select folder
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full max-h-48 overflow-y-auto space-y-1 code-scroll">
                    {uploadedFiles.map((f,i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 bg-g-800 border border-g-border">
                        <span className="text-white/60 font-mono text-xs">{f.name}</span>
                        <span className="text-white/25 font-mono text-xs">{(f.content.length/1024).toFixed(1)}kb</span>
                      </div>
                    ))}
                    <button
                      onClick={e=>{e.stopPropagation();setUploadedFiles([]);setCode('');}}
                      className="w-full py-2 text-white/30 font-mono text-xs hover:text-red-400 transition-colors border border-g-border mt-2">
                      clear files
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* footer bar */}
            <div className="border-t border-g-border px-4 py-2 flex items-center justify-between bg-g-900">
              <span className="text-white/20 font-mono text-xs">
                {fileCount>0 ? `${fileCount} files · ${(totalChars/1000).toFixed(1)}k chars` : `${totalChars} chars`}
              </span>
              {totalChars > (fileCount > 1 ? CODE_LIMITS.project : CODE_LIMITS.review) && (
                <span className="text-yellow-400/60 font-mono text-xs">
                  large — AI reviews the first {((fileCount > 1 ? CODE_LIMITS.project : CODE_LIMITS.review) / 1000).toFixed(0)}k chars
                </span>
              )}
            </div>
          </div>

          {/* ── right: config ─────────────────────────────── */}
          <div className="p-5 space-y-5 bg-g-900">

            <div>
              <div className="text-white/30 font-mono text-xs mb-2">// language</div>
              <div className="grid grid-cols-2 gap-px bg-g-border">
                {LANGS.map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`py-2 font-mono text-xs transition-colors ${lang===l?'bg-lime text-black font-bold':'bg-g-900 text-white/35 hover:text-white hover:bg-g-800'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-white/30 font-mono text-xs mb-2">// difficulty</div>
              <div className="space-y-px bg-g-border">
                {DIFFS.map(d => (
                  <button key={d.v} onClick={() => setDiff(d.v)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 font-mono text-xs transition-colors ${
                      diff === d.v
                        ? d.cls==='lime' ? 'bg-lime/10 text-lime border-l-2 border-lime'
                          : d.cls==='yellow' ? 'bg-yellow-400/10 text-yellow-400 border-l-2 border-yellow-400'
                          : 'bg-red-400/10 text-red-400 border-l-2 border-red-400'
                        : 'bg-g-900 text-white/35 hover:text-white hover:bg-g-800'
                    }`}>
                    <span className="font-bold">{d.label}</span>
                    <span className="opacity-50 text-xs">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {err && (
              <div className="border border-red-400/30 bg-red-400/5 px-3 py-2">
                <p className="text-red-400 font-mono text-xs">
                  {err}
                  {err.includes('settings') && (
                    <> <Link to="/settings" className="underline text-red-300">go →</Link></>
                  )}
                </p>
              </div>
            )}

            <button onClick={handleStart} disabled={!code.trim() || loading}
              className="w-full py-3 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              {loading ? 'starting…' : 'START SESSION →'}
            </button>

            <p className="text-white/15 font-mono text-xs text-center leading-relaxed">
              {fileCount > 1 ? `${fileCount} files will be analysed as a project` : 'code is saved to your history · delete anytime in settings'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
