import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { ensureUser } from '../services/firestore'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// profile fields only; createdAt is set once by ensureUser on first sign-in
async function persistUser(user) {
  await ensureUser(user.uid, {
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
  })
}

// Firebase error codes -> messages people can act on (raw messages leak "Firebase: Error (auth/...)")
export function authErrorMessage(e) {
  switch (e?.code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists. Try logging in.'
    case 'auth/invalid-email':        return 'That email address looks invalid.'
    case 'auth/weak-password':        return 'Password must be at least 6 characters.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':       return 'Invalid email or password.'
    case 'auth/too-many-requests':    return 'Too many attempts. Wait a minute and try again.'
    case 'auth/network-request-failed': return 'Network error. Check your connection.'
    default:                          return 'Something went wrong. Try again.'
  }
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
    await persistUser(cred.user)
    return cred.user
  }

  async function logout() {
    await signOut(auth)
  }

  return { signup, login, googleSignIn, logout }
}
