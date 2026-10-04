import {
  collection, doc, setDoc, getDoc, getDocs,
  updateDoc, query, where,
  limit, serverTimestamp, writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { localDateKey, toDate, toMillis } from '../utils/dates'

const newestFirst = (a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)

export async function createSession(uid, data) {
  const ref = doc(collection(db, 'sessions'))
  await setDoc(ref, { uid, createdAt: serverTimestamp(), status: 'in_progress', ...data })
  return ref.id
}
export async function updateSession(id, data) {
  await updateDoc(doc(db, 'sessions', id), data)
}
export async function getSession(id) {
  try {
    const snap = await getDoc(doc(db, 'sessions', id))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch { return null }
}
// uid filter only + client-side sort: no composite index needed, and one query
// can feed both the session list and the activity calendar.
export async function getUserSessions(uid, lim = 200) {
  try {
    const q = query(collection(db, 'sessions'), where('uid', '==', uid), limit(lim))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort(newestFirst)
  } catch (e) {
    console.warn('getUserSessions failed:', e)
    return []
  }
}
// Firestore batches are capped at 500 writes, so commit in chunks.
export async function deleteUserSessions(uid) {
  const refs = []
  for (const name of ['sessions', 'arenaSessions']) {
    const snap = await getDocs(query(collection(db, name), where('uid', '==', uid)))
    snap.docs.forEach(d => refs.push(d.ref))
  }
  for (let i = 0; i < refs.length; i += 450) {
    const batch = writeBatch(db)
    refs.slice(i, i + 450).forEach(r => batch.delete(r))
    await batch.commit()
  }
}
export async function upsertUser(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true })
}
// Create the profile once; on later logins only refresh profile fields.
// (Previously every Google login reset createdAt/totalSessions/averageScore.)
export async function ensureUser(uid, profile) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await setDoc(ref, profile, { merge: true })
  } else {
    // no `plan` field: only the server/admin may set it (see Firestore rules)
    await setDoc(ref, { ...profile, createdAt: serverTimestamp() })
  }
}
export const sessionDateKey = (s) => localDateKey(toDate(s.createdAt) || NaN)

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
// returns null when missing OR not readable (e.g. someone else's session)
export async function getArenaSession(id) {
  try {
    const snap = await getDoc(doc(db, 'arenaSessions', id))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch { return null }
}
// uid filter only (no composite index needed); newest first client-side
export async function getUserArenaSessions(uid, lim = 200) {
  try {
    const q = query(collection(db, 'arenaSessions'), where('uid', '==', uid), limit(lim))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort(newestFirst)
  } catch (e) {
    console.warn('getUserArenaSessions failed:', e)
    return []
  }
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
