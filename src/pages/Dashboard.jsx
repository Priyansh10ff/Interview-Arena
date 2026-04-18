import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuthContext } from '../context/AuthContext'
import { getUserSessions } from '../services/firestore'
import { getGrade, getScoreColor } from '../utils/scoreCalculator'
import { hasApiKey } from '../services/openrouter'

function SessionCard({ s }) {
  const score = s.finalReport?.overallScore
  const grade = score!=null ? getGrade(score) : null
  const date = s.createdAt?.toDate?.()
  const ds = date ? date.toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—'
  const link = s.status==='completed' ? `/report/${s.id}` : `/session/${s.id}`
  return (
    <Link to={link} className="block border border-g-border hover:border-g-hi bg-g-900 hover:bg-g-800 p-4 transition-all group animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-white/30 font-mono text-xs border border-g-border px-1.5">{s.language||'code'}</span>
          <span className={`font-mono text-xs px-1.5 ${s.difficulty==='senior'?'text-red-400 border border-red-400/30':s.difficulty==='mid'?'text-yellow-400 border border-yellow-400/30':'text-lime border border-lime/30'}`}>
            {s.difficulty}
          </span>
        </div>
        {grade
          ? <span className={`font-mono font-bold text-xl ${grade.color}`}>{grade.grade}</span>
          : <span className="text-yellow-400/60 text-xs font-mono animate-pulse">running</span>}
      </div>
      <pre className="text-white/25 text-xs font-mono line-clamp-2 mb-3 leading-relaxed overflow-hidden">
        {s.codeSnippet?.slice(0,90)||''}
      </pre>
      <div className="flex items-center justify-between text-xs font-mono text-white/25">
        <span>{ds}</span>
        {score!=null && <span className={getScoreColor(score)}>{score}/100</span>}
        <span className="text-white/20 group-hover:text-lime transition-colors">
          {s.status==='completed' ? 'report →' : 'continue →'}
        </span>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuthContext()
  const [sessions,setSessions] = useState([])
  const [loading,setLoading] = useState(true)
  const keyOk = hasApiKey()

  useEffect(()=>{
    if(user) getUserSessions(user.uid).then(s=>{setSessions(s);setLoading(false)})
  },[user])

  const stats = useMemo(()=>{
    const done = sessions.filter(s=>s.status==='completed')
    const avg = done.length ? Math.round(done.reduce((a,s)=>a+(s.finalReport?.overallScore||0),0)/done.length) : 0
    return {total:sessions.length, done:done.length, avg}
  },[sessions])

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* no key banner */}
        {!keyOk && (
          <div className="border border-yellow-400/30 bg-yellow-400/5 px-4 py-3 mb-6 flex items-center justify-between animate-slide-up">
            <span className="text-yellow-400 font-mono text-xs">⚠ No API key configured — sessions won't run</span>
            <Link to="/settings" className="text-yellow-400 font-mono text-xs underline">add key →</Link>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-lime text-xs font-mono mb-1">// dashboard</div>
            <h1 className="text-white font-bold font-mono text-2xl">
              hey, {user?.displayName?.split(' ')[0]||'dev'}<span className="cursor"/>
            </h1>
          </div>
          <Link to="/session/new" className="px-4 py-2 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim transition-colors">
            + NEW SESSION
          </Link>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-0 border border-g-border mb-8">
          {[
            ['sessions',stats.total],
            ['completed',stats.done],
            ['avg score', stats.done>0 ? `${stats.avg}/100`:'—'],
          ].map(([l,v],i)=>(
            <div key={i} className={`p-5 ${i<2?'border-r border-g-border':''}`}>
              <div className="text-white/25 font-mono text-xs mb-1">{l}</div>
              <div className="text-white font-bold font-mono text-2xl">{v}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-white/30 font-mono text-xs">// recent sessions</span>
          <Link to="/history" className="text-lime text-xs font-mono hover:text-lime-dim transition-colors">view all →</Link>
        </div>

        {loading
          ? <div className="text-white/25 font-mono text-xs text-center py-12 animate-pulse">loading...</div>
          : sessions.length===0
          ? <div className="border border-dashed border-g-border p-12 text-center">
              <p className="text-white/25 font-mono text-xs mb-4">no sessions yet.</p>
              <Link to="/session/new" className="px-4 py-2 bg-lime text-black font-mono text-xs font-bold hover:bg-lime-dim transition-colors">
                start first session
              </Link>
            </div>
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-g-border">
              {sessions.slice(0,6).map((s,i)=>(
                <div key={s.id} className={`${i%2===0&&i<sessions.slice(0,6).length-1?'md:border-r border-g-border':''} ${i<sessions.slice(0,6).length-2?'border-b border-g-border':''}`}>
                  <SessionCard s={s}/>
                </div>
              ))}
            </div>
        }

        {/* quick practice link */}
        <div className="border border-g-border mt-8 p-5 flex items-center justify-between">
          <div>
            <div className="text-white font-mono font-bold text-sm">Practice by topic</div>
            <div className="text-white/30 font-mono text-xs mt-0.5">DSA, React, System Design, SQL and more</div>
          </div>
          <Link to="/topic" className="px-4 py-2 border border-g-border text-white/50 hover:text-white font-mono text-xs hover:border-g-hi transition-colors">
            PRACTICE →
          </Link>
        </div>
      </div>
    </div>
  )
}
