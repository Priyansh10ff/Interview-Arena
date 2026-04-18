import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { upsertUser } from '../services/firestore'

export function useAuth() {
  async function signup(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await upsertUser(cred.user.uid, {
      displayName,
      email,
      createdAt: new Date().toISOString(),
      totalSessions: 0,
      averageScore: 0,
    })
    return cred.user
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }

  async function logout() {
    await signOut(auth)
  }

  return { signup, login, logout }
}
