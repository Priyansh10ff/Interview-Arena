import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuthContext } from '../context/AuthContext'
import { getUserSessions } from '../services/firestore'
import { getGrade, getScoreColor } from '../utils/scoreCalculator'

export default function SessionHistory() {
  const { user } = useAuthContext()
  const [sessions,setSessions] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    if(user) getUserSessions(user.uid,50).then(s=>{setSessions(s);setLoading(false)})
  },[user])

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-lime text-xs font-mono mb-1">// history</div>
            <h1 className="text-white font-bold font-mono text-2xl">All Sessions</h1>
          </div>
          <Link to="/session/new" className="px-3 py-1.5 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim transition-colors">+ new</Link>
        </div>
        {loading
          ? <p className="text-white/25 font-mono text-xs text-center py-16 animate-pulse">loading...</p>
          : sessions.length===0
          ? <div className="border border-dashed border-g-border p-20 text-center">
              <p className="text-white/25 font-mono text-xs mb-3">no sessions yet.</p>
              <Link to="/session/new" className="text-lime font-mono text-xs hover:text-lime-dim transition-colors">start one →</Link>
            </div>
          : <div className="border border-g-border">
              {sessions.map((s,i)=>{
                const score=s.finalReport?.overallScore
                const grade=score!=null?getGrade(score):null
                const date=s.createdAt?.toDate?.()
                const ds=date?date.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'}):'—'
                const link=s.status==='completed'?`/report/${s.id}`:`/session/${s.id}`
                return (
                  <Link key={s.id} to={link}
                    className={`flex items-center justify-between px-5 py-4 hover:bg-g-800 transition-colors group ${i<sessions.length-1?'border-b border-g-border':''}`}>
                    <div className="flex items-center gap-4">
                      {grade
                        ? <span className={`font-mono font-bold text-lg w-6 text-center ${grade.color}`}>{grade.grade}</span>
                        : <span className="text-yellow-400/50 font-mono text-xs w-6">···</span>}
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white/40 font-mono text-xs">{s.language}</span>
                          <span className={`font-mono text-xs ${s.difficulty==='senior'?'text-red-400':s.difficulty==='mid'?'text-yellow-400':'text-lime'}`}>{s.difficulty}</span>
                        </div>
                        <span className="text-white/20 font-mono text-xs">{ds}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      {score!=null&&<span className={`font-mono text-sm font-bold ${getScoreColor(score)}`}>{score}/100</span>}
                      <span className={`font-mono text-xs transition-colors ${s.status==='completed'?'text-white/20 group-hover:text-lime':'text-lime'}`}>
                        {s.status==='completed'?'report →':'continue →'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
        }
      </div>
    </div>
  )
}
