import { useState } from 'react'
import Navbar from '../layout/Navbar'

export default function McqChallenge({ domain, data, onResult }) {
  const qs = data?.questions || []
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [answers, setAnswers] = useState([])      // { correct: bool }[]

  const q = qs[current]
  const isLast = current === qs.length - 1

  function submit() {
    if (selected === null) return
    const correct = selected === q.answerIndex
    const next = [...answers, { correct, selected, answerIndex: q.answerIndex }]
    setAnswers(next)
    setSubmitted(true)
    if (isLast) {
      setTimeout(() => {
        const score = Math.round((next.filter(a => a.correct).length / qs.length) * 100)
        const wrong = next.filter(a => !a.correct).length
        onResult(score, `${next.filter(a=>a.correct).length}/${qs.length} correct · ${wrong} wrong`)
      }, 1200)
    }
  }

  function next() {
    setCurrent(c => c + 1)
    setSelected(null)
    setSubmitted(false)
  }

  if (!q) return null
  const OPTIONS = ['A', 'B', 'C', 'D']

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-lime text-xs font-mono mb-1">// {domain?.label} · MCQ</div>
            <div className="text-white/30 font-mono text-xs">question {current+1} of {qs.length}</div>
          </div>
          <div className="flex gap-1">
            {qs.map((_,i) => (
              <div key={i} className={`w-5 h-1.5 transition-colors ${
                i < answers.length
                  ? answers[i].correct ? 'bg-lime' : 'bg-red-400'
                  : i === current ? 'bg-white/40' : 'bg-g-border'
              }`}/>
            ))}
          </div>
        </div>

        <div className="border border-g-border bg-g-900 p-6 mb-4 animate-slide-up">
          <p className="text-white font-mono text-sm leading-relaxed">{q.q}</p>
        </div>

        <div className="space-y-2 mb-5">
          {q.options.map((opt, i) => {
            let cls = 'border-g-border text-white/60 hover:border-g-hi hover:text-white'
            if (submitted) {
              if (i === q.answerIndex) cls = 'border-lime bg-lime/10 text-lime'
              else if (i === selected) cls = 'border-red-400 bg-red-400/10 text-red-400'
              else cls = 'border-g-border text-white/25'
            } else if (selected === i) {
              cls = 'border-lime text-lime bg-lime/10'
            }
            return (
              <button key={i} onClick={() => !submitted && setSelected(i)}
                className={`w-full flex items-center gap-4 px-4 py-3 border font-mono text-sm text-left transition-colors ${cls} ${!submitted?'cursor-pointer':'cursor-default'}`}>
                <span className="w-5 h-5 border border-current flex items-center justify-center text-xs shrink-0">{OPTIONS[i]}</span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>

        {submitted && (
          <div className={`border px-4 py-3 font-mono text-xs mb-4 animate-slide-up ${answers[answers.length-1]?.correct?'border-lime/30 text-lime bg-lime/5':'border-red-400/30 text-red-400/80 bg-red-400/5'}`}>
            {answers[answers.length-1]?.correct ? '✓ correct · ' : '✗ wrong · '}
            {q.explanation}
          </div>
        )}

        {!submitted && (
          <button onClick={submit} disabled={selected===null}
            className="w-full py-2.5 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim disabled:opacity-30 transition-colors">
            SUBMIT
          </button>
        )}
        {submitted && !isLast && (
          <button onClick={next}
            className="w-full py-2.5 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim transition-colors animate-slide-up">
            NEXT →
          </button>
        )}
        {submitted && isLast && (
          <div className="text-center text-white/30 font-mono text-xs animate-pulse">calculating score...</div>
        )}
      </div>
    </div>
  )
}
