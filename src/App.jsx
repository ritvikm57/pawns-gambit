import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

// Reset scroll to top on every navigation except Home (Home restores its own position)
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname !== '/') window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}
import { AuthProvider } from './context/AuthContext'
import { autoUpdateTournamentStatuses } from './lib/autoUpdateTournaments'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Tournaments from './pages/Tournaments'
import TournamentRegister from './pages/TournamentRegister'
import TournamentDetail from './pages/TournamentDetail'
import TournamentResults from './pages/TournamentResults'
import Gallery from './pages/Gallery'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import ResetPassword from './pages/ResetPassword'
import Contact from './pages/Contact'

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <div className="text-8xl font-bold text-navy-700 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors">
          Go Home
        </a>
      </div>
    </div>
  )
}

export default function App() {
  // Silently promote any tournament whose start time has passed → ongoing
  useEffect(() => { autoUpdateTournamentStatuses() }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen" style={{ position: 'relative', background: '#069494' }}>
          {/* Global PCA chess background */}
          <img src="/PCA.png" alt="" style={{
            position: 'fixed', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: 0.1, pointerEvents: 'none', zIndex: 0,
          }} />
          <ScrollToTop />
          <Navbar />
          <div className="flex-1" style={{ position: 'relative', zIndex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route path="/tournaments/:id/register" element={<TournamentRegister />} />
              <Route path="/tournaments/:id/results" element={<TournamentResults />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
