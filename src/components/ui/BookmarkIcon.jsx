import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useBookmarks } from '../../context/BookmarkContext'

export default function BookmarkIcon({ question, concept, source = 'session' }) {
  const { user }    = useAuthContext()
  const { isBookmarked, getBookmarkId, add, remove } = useBookmarks()
  const [busy, setBusy] = useState(false)

  const bookmarked = isBookmarked(question)

  async function toggle(e) {
    e.stopPropagation()
    if (!user || busy) return
    setBusy(true)
    try {
      if (bookmarked) {
        const id = getBookmarkId(question)
        if (id) await remove(id)
      } else {
        await add(user.uid, { question, concept: concept || '', source })
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark this question'}
      className={`font-mono text-base transition-colors disabled:opacity-40 ${
        bookmarked
          ? 'text-lime hover:text-yellow-400'
          : 'text-white/20 hover:text-white/60'
      }`}
    >
      {busy ? '…' : bookmarked ? '★' : '☆'}
    </button>
  )
}
