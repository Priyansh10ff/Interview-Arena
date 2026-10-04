import { useCallback, useTransition } from 'react'
import { callAI } from '../services/openrouter'
import { useSessionContext } from '../context/SessionContext'

// Wraps callAI with the shared loading flag. Errors are re-thrown to the caller,
// which decides how to show them (no global error state leaking across pages).
export function useAI() {
  const { dispatch } = useSessionContext()
  // non-urgent: lets React keep the UI responsive while loading=false propagates
  const [isPending, startTransition] = useTransition()

  const runAI = useCallback(async (systemPrompt, userPrompt, maxTokens) => {
    dispatch({ type: 'SET_AI_LOADING', payload: true })
    try {
      return await callAI(systemPrompt, userPrompt, maxTokens)
    } finally {
      startTransition(() => dispatch({ type: 'SET_AI_LOADING', payload: false }))
    }
  }, [dispatch, startTransition])

  return { runAI, isPending }
}
