import { createContext, useContext, useReducer, useCallback } from 'react'
import { db } from '../services/firebase'
import {
  collection, doc, setDoc, deleteDoc,
  getDocs, query, where, serverTimestamp
} from 'firebase/firestore'

const BookmarkContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET':    return { ...state, items: action.payload, loaded: true }
    case 'ADD':    return { ...state, items: [action.payload, ...state.items] }
    case 'REMOVE': return { ...state, items: state.items.filter(b => b.id !== action.payload) }
    default:       return state
  }
}

export function BookmarkProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { items: [], loaded: false })

  const load = useCallback(async (uid) => {
    if (!uid) return
    try {
      // no orderBy — avoids composite index requirement
      const q    = query(collection(db, 'bookmarks'), where('uid', '==', uid))
      const snap = await getDocs(q)
      const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          // sort by createdAt descending (handles both Timestamp and string)
          const ta = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
          const tb = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
          return tb - ta
        })
      dispatch({ type: 'SET', payload: items })
    } catch (e) {
      console.warn('Bookmarks load failed:', e)
      dispatch({ type: 'SET', payload: [] })
    }
  }, [])

  const add = useCallback(async (uid, bookmark) => {
    const ref  = doc(collection(db, 'bookmarks'))
    const item = {
      id: ref.id, uid,
      createdAt: new Date().toISOString(),
      ...bookmark,
    }
    await setDoc(ref, { uid, createdAt: serverTimestamp(), ...bookmark })
    dispatch({ type: 'ADD', payload: item })
    return item
  }, [])

  const remove = useCallback(async (id) => {
    await deleteDoc(doc(db, 'bookmarks', id))
    dispatch({ type: 'REMOVE', payload: id })
  }, [])

  const isBookmarked = useCallback((question) =>
    state.items.some(b => b.question === question),
    [state.items]
  )

  const getBookmarkId = useCallback((question) =>
    state.items.find(b => b.question === question)?.id || null,
    [state.items]
  )

  return (
    <BookmarkContext.Provider value={{ ...state, load, add, remove, isBookmarked, getBookmarkId }}>
      {children}
    </BookmarkContext.Provider>
  )
}

export const useBookmarks = () => useContext(BookmarkContext)
