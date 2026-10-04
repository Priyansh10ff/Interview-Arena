import { useCallback } from 'react'
import { useSessionContext } from '../context/SessionContext'
import { createSession, updateSession, getSession } from '../services/firestore'

export function useSession() {
  const { state, dispatch } = useSessionContext()

  const startSession = useCallback(async (uid, code, language, difficulty, isProject=false) => {
    dispatch({ type: 'SET_CODE', payload: { code, language, isProject } })
    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty })
    const id = await createSession(uid, { codeSnippet: code, language, difficulty, isProject })
    dispatch({ type: 'SET_SESSION_ID', payload: id })
    return id
  }, [dispatch])

  const saveCodeReview = useCallback(async (review, sessionId) => {
    dispatch({ type: 'SET_CODE_REVIEW', payload: review })
    const sid = sessionId || state.sessionId
    if (sid) await updateSession(sid, { codeReview: review })
  }, [state.sessionId, dispatch])

  // save questions to Firestore so we can restore mid-session
  const saveQuestions = useCallback(async (questions, sessionId) => {
    dispatch({ type: 'SET_QUESTIONS', payload: questions })
    const sid = sessionId || state.sessionId
    if (sid) await updateSession(sid, { questions })
  }, [state.sessionId, dispatch])

  // receives allRounds explicitly to avoid stale closure
  const saveRound = useCallback(async (roundData, allRounds, sessionId) => {
    const round = { ...roundData, roundNumber: allRounds.length }
    dispatch({ type: 'ADD_ROUND', payload: round })
    const sid = sessionId || state.sessionId
    if (sid) await updateSession(sid, { rounds: [...allRounds, round] })
    return round
  }, [state.sessionId, dispatch])

  const saveFinalReport = useCallback(async (finalReport, sessionId) => {
    dispatch({ type: 'SET_FINAL_REPORT', payload: finalReport })
    const sid = sessionId || state.sessionId
    if (sid) await updateSession(sid, { finalReport, status: 'completed' })
  }, [state.sessionId, dispatch])

  // atomic load — single dispatch, no stale reads
  const loadSession = useCallback(async (sessionId) => {
    const session = await getSession(sessionId)
    if (!session) return null
    dispatch({ type: 'LOAD_SESSION', payload: session })
    return session
  }, [dispatch])

  return { startSession, saveCodeReview, saveQuestions, saveRound, saveFinalReport, loadSession }
}
