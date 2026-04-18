import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { auth } from '../services/firebase'
import { deleteUserSessions } from '../services/firestore'
import { getApiKey, saveKeyToStorage, clearStoredKey, hasApiKey } from '../services/openrouter'
import Navbar from '../components/layout/Navbar'
import { useAuthContext } from '../context/AuthContext'

function Section({ title, comment, children }) {
  return (
    <div className="border border-g-border mb-0">
      <div className="border-b border-g-border px-5 py-3 flex items-center gap-3">
        <span className="text-lime text-xs font-mono">{comment}</span>
        <span className="text-white font-mono font-bold text-sm">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const keyInfo = getApiKey()

  const [name, setName] = useState(user?.displayName || '')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState('')

  const [newKey, setNewKey] = useState('')
  const [keyMsg, setKeyMsg] = useState('')

  const [resetMsg, setResetMsg] = useState('')
  const [deletingData, setDeletingData] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function saveName() {
    if (!name.trim()) return
    setNameSaving(true)
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() })
      setNameMsg('saved.')
      setTimeout(() => setNameMsg(''), 2000)
    } catch { setNameMsg('error.') }
    finally { setNameSaving(false) }
  }

  async function sendReset() {
    try {
      await sendPasswordResetEmail(auth, user.email)
      setResetMsg('reset email sent. check inbox.')
    } catch { setResetMsg('failed to send.') }
    setTimeout(() => setResetMsg(''), 4000)
  }

  function saveNewKey() {
    const k = newKey.trim()
    if (!k.startsWith('sk-')) { setKeyMsg('key must start with sk- or sk-or-'); return }
    saveKeyToStorage(k)
    setNewKey('')
    setKeyMsg('key saved.')
    setTimeout(() => setKeyMsg(''), 2000)
  }

  function removeKey() {
    clearStoredKey()
    setKeyMsg('key removed.')
    setTimeout(() => setKeyMsg(''), 2000)
  }

  async function deleteData() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeletingData(true)
    try {
      await deleteUserSessions(user.uid)
      setConfirmDelete(false)
      setDeletingData(false)
      navigate('/dashboard')
    } catch { setDeletingData(false) }
  }

  const maskKey = (k) => k ? `${k.slice(0,8)}...${k.slice(-4)}` : ''

  return (
    <div className="min-h-screen bg-g-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="text-lime text-xs font-mono mb-1">// settings</div>
          <h1 className="text-white font-bold font-mono text-2xl">Account</h1>
        </div>

        <div className="space-y-0 border border-g-border">

          {/* Profile */}
          <Section comment="// 01" title="Profile">
            <div className="space-y-4">
              <div>
                <label className="text-white/30 text-xs font-mono block mb-1">display name</label>
                <div className="flex gap-2">
                  <input value={name} onChange={e=>setName(e.target.value)}
                    className="flex-1 bg-g-800 border border-g-border text-white font-mono text-sm px-3 py-2 focus:outline-none focus:border-lime/50"
                    placeholder="Your name" />
                  <button onClick={saveName} disabled={nameSaving}
                    className="px-4 py-2 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim disabled:opacity-50 transition-colors whitespace-nowrap">
                    {nameSaving ? '...' : 'save'}
                  </button>
                </div>
                {nameMsg && <p className="text-lime text-xs font-mono mt-1">{nameMsg}</p>}
              </div>
              <div>
                <label className="text-white/30 text-xs font-mono block mb-1">email</label>
                <div className="bg-g-800 border border-g-border px-3 py-2 text-white/40 font-mono text-sm">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="text-white/30 text-xs font-mono block mb-1">password</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-g-800 border border-g-border px-3 py-2 text-white/40 font-mono text-sm tracking-widest">
                    ••••••••••••
                  </div>
                  <button onClick={sendReset}
                    className="px-4 py-2 border border-g-border text-white/40 hover:text-white font-mono text-xs hover:border-g-hi transition-colors whitespace-nowrap">
                    reset →
                  </button>
                </div>
                {resetMsg && <p className="text-lime text-xs font-mono mt-1">{resetMsg}</p>}
              </div>
            </div>
          </Section>

          {/* API Key */}
          <Section comment="// 02" title="API Key">
            <div className="space-y-4">
              {/* current key status */}
              <div className="bg-g-800 border border-g-border p-4">
                {keyInfo ? (
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-white/30 text-xs font-mono mb-1">active key</div>
                      <div className="text-lime font-mono text-sm">{maskKey(keyInfo.key)}</div>
                      <div className="text-white/25 text-xs font-mono mt-0.5">
                        type:{keyInfo.type} · source:{keyInfo.source}
                      </div>
                    </div>
                    {keyInfo.source==='localStorage' && (
                      <button onClick={removeKey}
                        className="px-3 py-1.5 border border-red-400/30 text-red-400 font-mono text-xs hover:bg-red-400/10 transition-colors">
                        remove
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400/70 text-xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    no API key configured — sessions won't run
                  </div>
                )}
              </div>

              {/* add/change key */}
              <div>
                <label className="text-white/30 text-xs font-mono block mb-1">
                  {keyInfo ? 'change key' : 'add key'} — openrouter (sk-or-...) or openai (sk-...)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={newKey}
                    onChange={e=>{setNewKey(e.target.value);setKeyMsg('')}}
                    placeholder="sk-or-... or sk-..."
                    className="flex-1 bg-g-800 border border-g-border text-white font-mono text-sm px-3 py-2 focus:outline-none focus:border-lime/50 placeholder-white/15"
                  />
                  <button onClick={saveNewKey} disabled={!newKey.trim()}
                    className="px-4 py-2 bg-lime text-black font-bold font-mono text-xs hover:bg-lime-dim disabled:opacity-40 transition-colors whitespace-nowrap">
                    save
                  </button>
                </div>
                {keyMsg && <p className="text-lime text-xs font-mono mt-1">{keyMsg}</p>}
              </div>

              <div className="text-white/20 text-xs font-mono border-t border-g-border pt-3">
                key is stored in browser localStorage only. never sent to our servers.
                get openrouter key at openrouter.ai/keys · get openai key at platform.openai.com/api-keys
              </div>
            </div>
          </Section>

          {/* Danger zone */}
          <Section comment="// 03" title="Data">
            <div className="space-y-3">
              <p className="text-white/30 text-xs font-mono">permanently delete all your session data from the database.</p>
              {confirmDelete && (
                <p className="text-red-400 text-xs font-mono border border-red-400/20 px-3 py-2">
                  ⚠ this will delete all sessions and reports. click again to confirm.
                </p>
              )}
              <button
                onClick={deleteData}
                disabled={deletingData}
                className={`px-4 py-2 font-mono text-xs font-bold border transition-colors ${
                  confirmDelete
                    ? 'bg-red-500 border-red-500 text-white hover:bg-red-600'
                    : 'border-red-400/30 text-red-400/70 hover:text-red-400 hover:border-red-400/60'
                } disabled:opacity-50`}
              >
                {deletingData ? 'deleting...' : confirmDelete ? 'YES, DELETE ALL MY DATA' : 'delete all session data'}
              </button>
              {!confirmDelete && (
                <p className="text-white/20 text-xs font-mono">
                  to delete your firebase account entirely: firebase console → authentication → users → delete
                </p>
              )}
            </div>
          </Section>

        </div>
      </div>
    </div>
  )
}
