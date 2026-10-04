import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider }     from './context/AuthContext'
import { SessionProvider }  from './context/SessionContext'
import { ThemeProvider }    from './context/ThemeContext'
import { BookmarkProvider } from './context/BookmarkContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Landing   from './pages/Landing'
import Login     from './pages/Login'
import Signup    from './pages/Signup'
import Dashboard from './pages/Dashboard'
import NewSession from './pages/NewSession'
import Session   from './pages/Session'

const Report         = lazy(() => import('./pages/Report'))
const SessionHistory = lazy(() => import('./pages/SessionHistory'))
const Settings       = lazy(() => import('./pages/Settings'))
const TopicSession   = lazy(() => import('./pages/TopicSession'))
const Bookmarks      = lazy(() => import('./pages/Bookmarks'))
const Arena          = lazy(() => import('./pages/Arena'))
const ArenaBrief     = lazy(() => import('./pages/ArenaBrief'))
const ArenaSession   = lazy(() => import('./pages/ArenaSession'))
const ArenaReport    = lazy(() => import('./pages/ArenaReport'))
const Pricing        = lazy(() => import('./pages/Pricing'))

function Fallback() {
  return (
    <div className="min-h-screen bg-g-950 flex items-center justify-center">
      <span className="text-lime font-mono text-xs animate-pulse">loading…</span>
    </div>
  )
}

const Guard = ({ children }) => (
  <ProtectedRoute>
    <Suspense fallback={<Fallback />}>{children}</Suspense>
  </ProtectedRoute>
)

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <BookmarkProvider>
            <SessionProvider>
              <Routes>
                <Route path="/"                  element={<Landing />} />
                <Route path="/login"             element={<Login />} />
                <Route path="/signup"            element={<Signup />} />
                <Route path="/pricing"           element={<Suspense fallback={<Fallback />}><Pricing /></Suspense>} />
                <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/session/new"       element={<ProtectedRoute><NewSession /></ProtectedRoute>} />
                <Route path="/session/:sessionId" element={<ProtectedRoute><Session /></ProtectedRoute>} />
                <Route path="/report/:sessionId" element={<Guard><Report /></Guard>} />
                <Route path="/history"           element={<Guard><SessionHistory /></Guard>} />
                <Route path="/settings"          element={<Guard><Settings /></Guard>} />
                <Route path="/topic"             element={<Guard><TopicSession /></Guard>} />
                <Route path="/bookmarks"         element={<Guard><Bookmarks /></Guard>} />
                <Route path="/arena"             element={<Guard><Arena /></Guard>} />
                <Route path="/arena/session/:sessionId" element={<Guard><ArenaSession /></Guard>} />
                <Route path="/arena/report/:sessionId" element={<Guard><ArenaReport /></Guard>} />
                <Route path="/arena/:companyId/:roundId" element={<Guard><ArenaBrief /></Guard>} />
              </Routes>
            </SessionProvider>
          </BookmarkProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
