import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { upsertUser } from '../services/firestore'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

async function persistUser(user) {
  await upsertUser(user.uid, {
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    createdAt: new Date().toISOString(),
    totalSessions: 0,
    averageScore: 0,
  })
}

export function useAuth() {
  async function signup(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await persistUser({ ...cred.user, displayName })
    return cred.user
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }

  async function googleSignIn() {
    const cred = await signInWithPopup(auth, googleProvider)
    // upsert with merge:true so existing data is never overwritten
    await persistUser(cred.user)
    return cred.user
  }

  async function logout() {
    await signOut(auth)
  }

  return { signup, login, googleSignIn, logout }
}
