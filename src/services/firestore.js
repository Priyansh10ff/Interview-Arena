import {
  collection, doc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy,
  limit, serverTimestamp, writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

export async function createSession(uid, data) {
  const ref = doc(collection(db, 'sessions'))
  await setDoc(ref, { uid, createdAt: serverTimestamp(), status: 'in_progress', ...data })
  return ref.id
}
export async function updateSession(id, data) {
  await updateDoc(doc(db, 'sessions', id), data)
}
export async function getSession(id) {
  const snap = await getDoc(doc(db, 'sessions', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
export async function getUserSessions(uid, lim = 20) {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(lim)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch { return [] }
}
// No orderBy here — avoids needing a separate composite index.
// We filter by uid only, then extract dates client-side.
export async function getSessionDates(uid) {
  try {
    const q    = query(collection(db, 'sessions'), where('uid', '==', uid), limit(200))
    const snap = await getDocs(q)
    return snap.docs.map(d => {
      const ts = d.data().createdAt
      if (!ts) return null
      const date = ts.toDate ? ts.toDate() : new Date(ts)
      return isNaN(date) ? null : date.toISOString().slice(0, 10)
    }).filter(Boolean)
  } catch { return [] }
}
export async function deleteUserSessions(uid) {
  const batch = writeBatch(db)
  for (const name of ['sessions', 'arenaSessions']) {
    const snap = await getDocs(query(collection(db, name), where('uid', '==', uid)))
    snap.docs.forEach(d => batch.delete(d.ref))
  }
  await batch.commit()
}
export async function upsertUser(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true })
}

// ── Arena (company interview) sessions ──────────────────────────────
// Separate collection so the original code-review flow is untouched.
export async function createArenaSession(uid, data) {
  const ref = doc(collection(db, 'arenaSessions'))
  await setDoc(ref, {
    uid, createdAt: serverTimestamp(), status: 'live',
    transcript: [], code: '', ...data,
  })
  return ref.id
}
export async function updateArenaSession(id, data) {
  await updateDoc(doc(db, 'arenaSessions', id), data)
}
export async function getArenaSession(id) {
  const snap = await getDoc(doc(db, 'arenaSessions', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
// uid filter only (no composite index needed); newest first client-side
export async function getUserArenaSessions(uid, lim = 200) {
  try {
    const q = query(collection(db, 'arenaSessions'), where('uid', '==', uid), limit(lim))
    const snap = await getDocs(q)
    const ms = d => d.createdAt?.toMillis?.() ?? 0
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => ms(b) - ms(a))
  } catch { return [] }
}

// ── Plans / monetisation ────────────────────────────────────────────
export async function getUserPlan(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? snap.data().plan || 'free' : 'free'
  } catch { return 'free' }
}
// "Upgrade" interest until payments are live: tells you who would pay.
export async function recordUpgradeInterest(uid, email, plan = 'pro') {
  await setDoc(doc(db, 'upgradeInterest', uid), { uid, email: email || null, plan, at: serverTimestamp() }, { merge: true })
}
