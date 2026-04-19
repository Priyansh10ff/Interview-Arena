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
  const q    = query(collection(db, 'sessions'), where('uid', '==', uid))
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.delete(d.ref))
  await batch.commit()
}
export async function upsertUser(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true })
}
