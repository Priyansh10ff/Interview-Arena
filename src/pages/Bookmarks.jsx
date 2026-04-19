import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuthContext } from '../context/AuthContext'
import { useBookmarks } from '../context/BookmarkContext'

export default function Bookmarks() {
  const { user } = useAuthContext()
  const { items, loaded, load, remove } = useBookmarks()

  useEffect(() => { if (user && !loaded) load(user.uid) }, [user])

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="text-lime font-mono text-xs mb-1">// bookmarks</div>
          <h1 className="text-white font-bold font-mono text-2xl">Saved Questions</h1>
        </div>

        {!loaded ? (
          <div className="text-white/25 font-mono text-xs text-center py-16 animate-pulse">loading…</div>
        ) : items.length === 0 ? (
          <div className="border border-dashed border-g-border p-16 text-center">
            <p className="text-white/25 font-mono text-xs mb-3">no bookmarks yet.</p>
            <p className="text-white/15 font-mono text-xs">click ☆ on any question during a session to save it here.</p>
          </div>
        ) : (
          <div className="border border-g-border">
            {items.map((b, i) => (
              <div
                key={b.id}
                className={`px-5 py-4 flex items-start justify-between gap-4 hover:bg-g-800 transition-colors ${
                  i < items.length - 1 ? 'border-b border-g-border' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-mono text-xs leading-relaxed mb-1">{b.question}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-white/25 font-mono text-xs">{b.concept}</span>
                    <span className="text-white/15 font-mono text-xs">{b.source}</span>
                  </div>
                </div>
                <button
                  onClick={() => remove(b.id)}
                  className="text-white/20 hover:text-red-400 font-mono text-xs transition-colors shrink-0 pt-0.5"
                  title="Remove bookmark"
                >
                  ★
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-white/15 font-mono text-xs text-center">
          {items.length > 0 && `${items.length} saved question${items.length !== 1 ? 's' : ''}`}
        </div>
      </div>
    </div>
  )
}
