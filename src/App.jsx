import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState, useCallback, useMemo } from 'react'
import carouselPic1 from './assets/carousel-home-s3/pic1.jpeg'
import carouselPic2 from './assets/carousel-home-s3/pic2.jpeg'
import carouselPic3 from './assets/carousel-home-s3/pic3.jpeg'

const DARK_PHOTOS = [
  carouselPic1,
  carouselPic2,
  carouselPic3,
  '/sairam.jpeg',
  '/anirudh.jpeg',
]

const SQ   = 120
const COLS = 50
const ROWS = 30

function IntroAnimation({ onDone }) {
  const [zoom,      setZoom]      = useState(false)
  const [blackOut,  setBlackOut]  = useState(false)
  const [boardFade, setBoardFade] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setZoom(true),      30)
    const t2 = setTimeout(() => setBlackOut(true),  500)
    const t3 = setTimeout(() => setBoardFade(true), 2600)
    const t4 = setTimeout(onDone,                   3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onDone])

  const cells = useMemo(() => {
    let darkIdx = 0
    return Array.from({ length: ROWS * COLS }, (_, i) => {
      const row = Math.floor(i / COLS)
      const col = i % COLS
      const isDark = (row + col) % 2 === 1
      return { isDark, photo: isDark ? DARK_PHOTOS[darkIdx++ % DARK_PHOTOS.length] : null }
    })
  }, [])

  const boardTransition = [
    zoom      ? 'transform 3s cubic-bezier(0.4,0,0.2,1)' : '',
    boardFade ? 'opacity 0.4s ease-in'                   : '',
  ].filter(Boolean).join(', ')

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, overflow: 'hidden', pointerEvents: 'none' }}>

      {/* Centering wrapper */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
        {/* Zoom wrapper */}
        <div style={{
          width: COLS * SQ, height: ROWS * SQ,
          transformOrigin: 'center center',
          transform:  zoom      ? 'scale(5)' : 'scale(1)',
          opacity:    boardFade ? 0          : 1,
          transition: boardTransition || 'none',
          position: 'relative',
        }}>
          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${SQ}px)`,
            gridTemplateRows:    `repeat(${ROWS}, ${SQ}px)`,
          }}>
            {cells.map(({ isDark, photo }, i) => (
              <div key={i} style={{
                width: SQ, height: SQ,
                background: isDark
                  ? `url(${photo}) center/cover no-repeat`
                  : '#ffffff',
              }} />
            ))}
          </div>

        </div>
      </div>

      {/* Black overlay — lifts at 0.5s */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#000',
        opacity:    blackOut ? 0 : 1,
        transition: blackOut ? 'opacity 0.4s ease-out' : 'none',
      }} />
    </div>
  )
}

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
  useEffect(() => { autoUpdateTournamentStatuses() }, [])

  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem('pg-intro-seen')
  )
  const handleIntroDone = useCallback(() => {
    sessionStorage.setItem('pg-intro-seen', '1')
    setShowIntro(false)
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        {showIntro && <IntroAnimation onDone={handleIntroDone} />}
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
