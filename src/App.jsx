import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SessionProvider } from './context/SessionContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { hasApiKey } from './services/openrouter'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import NewSession from './pages/NewSession'
import Session from './pages/Session'

const Report = lazy(() => import('./pages/Report'))
const SessionHistory = lazy(() => import('./pages/SessionHistory'))
const Settings = lazy(() => import('./pages/Settings'))
const TopicSession = lazy(() => import('./pages/TopicSession'))

function Fallback() {
  return (
    <div className="min-h-screen bg-g-950 flex items-center justify-center">
      <span className="text-lime font-mono text-xs animate-pulse">loading...</span>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/session/new" element={<ProtectedRoute><NewSession /></ProtectedRoute>} />
            <Route path="/session/:sessionId" element={<ProtectedRoute><Session /></ProtectedRoute>} />
            <Route path="/report/:sessionId" element={<ProtectedRoute><Suspense fallback={<Fallback/>}><Report /></Suspense></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><Suspense fallback={<Fallback/>}><SessionHistory /></Suspense></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Suspense fallback={<Fallback/>}><Settings /></Suspense></ProtectedRoute>} />
            <Route path="/topic" element={<ProtectedRoute><Suspense fallback={<Fallback/>}><TopicSession /></Suspense></ProtectedRoute>} />
          </Routes>
        </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
