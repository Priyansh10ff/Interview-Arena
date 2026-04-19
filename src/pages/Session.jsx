import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/ui/Loader'
import TypingIndicator from '../components/ui/TypingIndicator'
import VoiceInput from '../components/ui/VoiceInput'
import CodeReviewCard from '../components/review/CodeReviewCard'
import QuestionCard from '../components/interview/QuestionCard'
import RoundCounter from '../components/interview/RoundCounter'
import BookmarkIcon from '../components/ui/BookmarkIcon'
import { useSessionContext } from '../context/SessionContext'
import { useAI } from '../hooks/useAI'
import { useSession } from '../hooks/useSession'
import {
  buildCodeReviewPrompt,
  buildQuestionsPrompt,
  buildEvaluationPrompt,
  buildFinalReportPrompt,
} from '../utils/promptBuilder'
import { calcInterviewScore, calcOverallScore, getScoreColor } from '../utils/scoreCalculator'

// Page-level loading states (separate from AI loading)
const PHASE_LOADING = {
  init:    'Loading session…',
  review:  'Analysing your code…',
  questions: 'Preparing your interview…',
  eval:    'Evaluating your answer…',
  report:  'Generating your report…',
}

export default function Session() {
  const { sessionId }   = useParams()
  const navigate        = useNavigate()
  const { state, dispatch } = useSessionContext()
  const { runAI }       = useAI()
  const { saveCodeReview, saveQuestions, saveRound, saveFinalReport, loadSession } = useSession()

  const [answer,       setAnswer]       = useState('')
  const [lastResult,   setLastResult]   = useState(null)
  const [showResult,   setShowResult]   = useState(false)
  const [loadingPhase, setLoadingPhase] = useState(null) // null = idle
  const [genReport,    setGenReport]    = useState(false)

  // roundsRef always holds latest rounds to avoid stale closure
  const roundsRef  = useRef([])
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])
  useEffect(() => { roundsRef.current = state.rounds }, [state.rounds])

  // ── init ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      if (state.sessionId === sessionId && state.phase !== 'idle') return

      setLoadingPhase('init')
      const session = await loadSession(sessionId)
      if (!mountedRef.current) return
      setLoadingPhase(null)

      if (!session) { navigate('/dashboard', { replace: true }); return }
      if (session.status === 'completed') {
        navigate(`/report/${sessionId}`, { replace: true }); return
      }
      if (!session.codeReview && session.codeSnippet) {
        doCodeReview(session.codeSnippet, session.language, session.difficulty, sessionId)
      }
    }

    if (state.phase === 'idle' && state.codeSnippet && state.sessionId === sessionId) {
      doCodeReview(state.codeSnippet, state.language, state.difficulty, sessionId)
    } else {
      init()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  // ── doCodeReview ──────────────────────────────────────────────────
  const doCodeReview = useCallback(async (code, lang, diff, sid) => {
    const c = code || state.codeSnippet
    const l = lang || state.language
    const d = diff || state.difficulty
    const s = sid  || state.sessionId
    dispatch({ type: 'SET_PHASE', payload: 'reviewing' })
    setLoadingPhase('review')
    try {
      const p = buildCodeReviewPrompt(c, l, d)
      const review = await runAI(p.system, p.user, p.maxTokens)
      if (!mountedRef.current) return
      await saveCodeReview(review, s)
    } catch (err) {
      if (!mountedRef.current) return
      if (err.message !== 'NO_KEY' && err.message !== 'INVALID_KEY') {
        dispatch({ type: 'SET_ERROR', payload: err.message || 'Code review failed.' })
      }
    } finally {
      if (mountedRef.current) setLoadingPhase(null)
    }
  }, [state, dispatch, runAI, saveCodeReview])

  // ── start interview ───────────────────────────────────────────────
  const handleStartInterview = useCallback(async () => {
    const review = state.codeReview
    if (!review) return
    const summary = `Health:${review.healthScore}/100. Issues:${
      review.issues?.slice(0, 3).map(i => i.description?.slice(0, 50)).join('; ') || 'none'
    }. Topics:${review.topicsToStudy?.join(',') || 'none'}`

    setLoadingPhase('questions')
    try {
      const p = buildQuestionsPrompt(state.codeSnippet, summary, state.difficulty)
      const result = await runAI(p.system, p.user, p.maxTokens)
      if (!mountedRef.current) return
      if (!result?.questions?.length) throw new Error('No questions returned — try again.')
      await saveQuestions(result.questions, state.sessionId)
    } catch (err) {
      if (!mountedRef.current) return
      if (err.message !== 'NO_KEY' && err.message !== 'INVALID_KEY') {
        dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to generate questions.' })
      }
    } finally {
      if (mountedRef.current) setLoadingPhase(null)
    }
  }, [state, dispatch, runAI, saveQuestions])

  // ── submit answer ─────────────────────────────────────────────────
  const handleSubmitAnswer = useCallback(async () => {
    if (!answer.trim() || loadingPhase) return
    const roundIndex = state.currentRound
    const currentQ   = state.questions[roundIndex]
    if (!currentQ) return

    const savedAnswer = answer
    setAnswer('')
    setLoadingPhase('eval')

    try {
      const p = buildEvaluationPrompt(currentQ.question, currentQ.concept, savedAnswer, state.difficulty)
      const ev = await runAI(p.system, p.user, p.maxTokens)
      if (!mountedRef.current) return

      // validate response shape
      const score = Math.min(10, Math.max(1, Number(ev?.score) || 5))
      const roundData = {
        question:    currentQ.question,
        concept:     currentQ.concept,
        userAnswer:  savedAnswer,
        aiFeedback:  ev?.feedback  || 'No feedback returned.',
        idealAnswer: ev?.idealAnswer || '',
        score,
      }

      // use ref for latest rounds list (avoids stale closure)
      const allRounds = [...roundsRef.current, roundData]
      await saveRound(roundData, roundsRef.current, state.sessionId)
      if (!mountedRef.current) return

      setLastResult(roundData)
      setShowResult(true)

      // if this was the last round, arm the report button
      if (roundIndex + 1 >= state.questions.length) {
        setGenReport(true)
      }
    } catch (err) {
      if (!mountedRef.current) return
      setAnswer(savedAnswer) // restore on error
      if (err.message !== 'NO_KEY' && err.message !== 'INVALID_KEY') {
        dispatch({ type: 'SET_ERROR', payload: err.message || 'Evaluation failed — try again.' })
      }
    } finally {
      if (mountedRef.current) setLoadingPhase(null)
    }
  }, [answer, loadingPhase, state, dispatch, runAI, saveRound])

  // ── generate final report ─────────────────────────────────────────
  const handleGenerateReport = useCallback(async () => {
    setGenReport(false)
    setShowResult(false)
    setLoadingPhase('report')
    const allRounds = roundsRef.current
    try {
      const p = buildFinalReportPrompt(state.codeSnippet, state.codeReview, allRounds, state.difficulty)
      const report = await runAI(p.system, p.user, p.maxTokens)
      if (!mountedRef.current) return
      const interviewScore = calcInterviewScore(allRounds)
      const overallScore   = calcOverallScore(interviewScore, state.codeReview?.healthScore || 0)
      await saveFinalReport(
        { ...report, interviewScore, codeScore: state.codeReview?.healthScore || 0, overallScore },
        state.sessionId
      )
      if (!mountedRef.current) return
      navigate(`/report/${state.sessionId}`)
    } catch (err) {
      if (!mountedRef.current) return
      if (err.message !== 'NO_KEY' && err.message !== 'INVALID_KEY') {
        dispatch({ type: 'SET_ERROR', payload: err.message || 'Report generation failed.' })
      }
    } finally {
      if (mountedRef.current) setLoadingPhase(null)
    }
  }, [state, dispatch, runAI, saveFinalReport, navigate])

  function handleNext() { setShowResult(false); setLastResult(null) }

  // ── error screen ──────────────────────────────────────────────────
  if (state.error) {
    const isKeyError = state.error === 'NO_KEY' || state.error === 'INVALID_KEY'
    const msg = state.error === 'NO_KEY'
      ? 'No API key configured — go to Settings to add your key.'
      : state.error === 'INVALID_KEY'
      ? 'API key rejected. Check your key has credits.'
      : state.error
    return (
      <div className="min-h-screen bg-g-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 text-center">
          <div className="text-4xl">{isKeyError ? '🔑' : '⚠️'}</div>
          <p className="text-red-400 font-mono text-xs max-w-sm leading-relaxed border border-red-400/20 px-4 py-3">
            {msg}
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
            className="px-5 py-2 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim transition-colors"
          >
            {isKeyError ? 'GO TO SETTINGS' : 'DISMISS'}
          </button>
        </div>
      </div>
    )
  }

  // ── loading screens ───────────────────────────────────────────────
  if (loadingPhase) {
    return (
      <div className="min-h-screen bg-g-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader message={PHASE_LOADING[loadingPhase] || 'Loading…'} />
        </div>
      </div>
    )
  }

  // ── phase 1: review ───────────────────────────────────────────────
  if (state.phase === 'reviewing' && state.codeReview) {
    return (
      <div className="min-h-screen bg-g-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="mb-6">
            <div className="text-lime font-mono text-xs mb-1">// phase 01</div>
            <h1 className="text-white font-bold font-mono text-2xl">Code Review</h1>
          </div>
          <CodeReviewCard
            review={state.codeReview}
            onStartInterview={handleStartInterview}
            isLoading={!!loadingPhase}
          />
        </div>
      </div>
    )
  }

  // ── phase 2: interviewing ─────────────────────────────────────────
  if (state.phase === 'interviewing') {
    const total    = state.questions.length || 5
    const curIdx   = Math.min(state.currentRound, total - 1)
    const dispRound = Math.min(state.rounds.length + 1, total)
    const currentQ  = state.questions[curIdx]

    return (
      <div className="min-h-screen bg-g-950">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">

          {/* header */}
          <div>
            <div className="text-lime font-mono text-xs mb-1">// phase 02</div>
            <h1 className="text-white font-bold font-mono text-xl">Interview</h1>
          </div>

          {/* round counter */}
          <RoundCounter
            current={dispRound}
            total={total}
            rounds={state.rounds}
          />

          {/* question + answer */}
          {!showResult && currentQ && (
            <div className="animate-slide-up space-y-3">
              <QuestionCard question={currentQ} roundNumber={dispRound} />
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer… or use the mic."
                className="code-editor w-full h-44 bg-g-800 border border-g-border text-white placeholder-white/15 p-4 resize-none focus:outline-none focus:border-lime/40 transition-colors"
                disabled={!!loadingPhase}
              />
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <VoiceInput
                    onTranscript={t => setAnswer(p => p ? p.trimEnd() + ' ' + t : t)}
                    disabled={!!loadingPhase}
                  />
                  <span className="text-white/20 font-mono text-xs">{answer.length} chars</span>
                </div>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || !!loadingPhase}
                  className="px-6 py-2.5 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingPhase === 'eval' ? 'evaluating…' : 'SUBMIT →'}
                </button>
              </div>
              {loadingPhase === 'eval' && (
                <div className="flex justify-center pt-1">
                  <TypingIndicator label="evaluating your answer…" />
                </div>
              )}
            </div>
          )}

          {/* round result */}
          {showResult && lastResult && (
            <div className="animate-slide-up border border-g-border bg-g-900">

              {/* score row */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-g-border">
                <div>
                  <div className="text-white/30 font-mono text-xs mb-0.5">
                    round {state.rounds.length} score
                  </div>
                  <span className={`font-mono font-bold text-4xl ${getScoreColor(lastResult.score * 10)}`}>
                    {lastResult.score}
                    <span className="text-lg text-white/20">/10</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="border border-g-border text-white/35 font-mono text-xs px-3 py-1">
                    {lastResult.concept}
                  </span>
                  <BookmarkIcon
                    question={lastResult.question}
                    concept={lastResult.concept}
                    source="session"
                  />
                </div>
              </div>

              {/* feedback */}
              <div className="px-5 py-4 border-b border-g-border space-y-4">
                <div>
                  <div className="text-yellow-400/70 font-mono text-xs mb-2">ai feedback</div>
                  <p className="text-white/65 font-mono text-xs leading-relaxed">{lastResult.aiFeedback}</p>
                </div>
                {lastResult.idealAnswer && (
                  <details>
                    <summary className="text-lime/70 font-mono text-xs cursor-pointer hover:text-lime transition-colors">
                      ideal answer ▾
                    </summary>
                    <p className="mt-2 text-white/45 font-mono text-xs leading-relaxed italic pl-3 border-l border-lime/20">
                      {lastResult.idealAnswer}
                    </p>
                  </details>
                )}
              </div>

              {/* actions */}
              <div className="px-5 py-4">
                {genReport ? (
                  <button
                    onClick={handleGenerateReport}
                    disabled={!!loadingPhase}
                    className="w-full py-3 bg-lime text-black font-bold font-mono text-sm hover:bg-lime-dim disabled:opacity-50 transition-colors"
                  >
                    {loadingPhase === 'report' ? 'generating…' : '📊 GET FULL REPORT →'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim transition-colors"
                  >
                    NEXT ROUND →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── fallback / idle ───────────────────────────────────────────────
  if (state.phase === 'report' && state.sessionId) {
    navigate(`/report/${state.sessionId}`, { replace: true })
    return null
  }
  return (
    <div className="min-h-screen bg-g-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader message="Loading…" />
      </div>
    </div>
  )
}
