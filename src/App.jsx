import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState, useCallback, useRef } from 'react'
import carouselPic1 from './assets/carousel-home-s3/pic1.jpeg'
import carouselPic2 from './assets/carousel-home-s3/pic2.jpeg'
import carouselPic3 from './assets/carousel-home-s3/pic3.jpeg'

const INTRO_PHOTOS = [carouselPic1, carouselPic2, carouselPic3, '/sairam.jpeg', '/anirudh.jpeg']

function IntroAnimation({ onDone }) {
  const canvasRef = useRef(null)
  const [showLogo, setShowLogo] = useState(false)
  const [fadeOut,  setFadeOut]  = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const setSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    setSize()
    window.addEventListener('resize', setSize)

    const TILE = 45  // tile size — small enough to show lots of photos at once

    // Preload all photos
    const imgs = INTRO_PHOTOS.map(src => {
      const img = new Image()
      img.src = src
      return img
    })

    // Deterministically assign a photo to each tile position
    function tileImg(r, c) {
      return imgs[Math.abs(r * 7 + c * 13 + r * c * 3) % imgs.length]
    }

    let startMs = null, raf

    function frame(now) {
      if (!startMs) startMs = now
      const elapsed = now - startMs

      const t    = Math.min(elapsed / 4000, 1)
      const ease = 1 - Math.pow(1 - t, 3)  // cubic ease-out
      const zoom = 1 + ease * 5             // 1× → 6× over 4 s

      const W = canvas.width, H = canvas.height
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)

      ctx.save()
      ctx.translate(W / 2, H / 2)
      ctx.scale(zoom, zoom)

      const halfCols = Math.ceil(W / (2 * zoom * TILE)) + 1
      const halfRows = Math.ceil(H / (2 * zoom * TILE)) + 1

      // Pass 1 — chessboard base
      for (let r = -halfRows; r <= halfRows; r++) {
        for (let c = -halfCols; c <= halfCols; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#069494'
          ctx.fillRect(c * TILE, r * TILE, TILE, TILE)
        }
      }

      // Pass 2 — photos on their own grid, offset & rotated so they don't align with tiles
      const PGRID = 160   // world-space spacing between photo centers
      const PSIZE = 80    // world-space photo size

      const phHalfC = Math.ceil(W / (2 * zoom * PGRID)) + 1
      const phHalfR = Math.ceil(H / (2 * zoom * PGRID)) + 1

      for (let pr = -phHalfR; pr <= phHalfR; pr++) {
        for (let pc = -phHalfC; pc <= phHalfC; pc++) {
          const img = tileImg(pr, pc)
          if (!img.complete || !img.naturalWidth) continue

          // Nudge each photo off the perfect grid so they cross tile boundaries
          const offX  = ((pr * 47 + pc * 23) % 60) - 30
          const offY  = ((pr * 31 + pc * 67) % 60) - 30
          const cx    = pc * PGRID + offX
          const cy    = pr * PGRID + offY

          // Small per-photo rotation (±8°)
          const angle = (((pr * 13 + pc * 17) % 17) - 8) * Math.PI / 180

          const s  = Math.min(img.naturalWidth, img.naturalHeight)
          const sx = (img.naturalWidth  - s) / 2
          const sy = (img.naturalHeight - s) / 2

          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(angle)
          ctx.drawImage(img, sx, sy, s, s, -PSIZE / 2, -PSIZE / 2, PSIZE, PSIZE)
          ctx.strokeStyle = 'rgba(255,255,255,0.85)'
          ctx.lineWidth   = 3 / zoom
          ctx.strokeRect(-PSIZE / 2, -PSIZE / 2, PSIZE, PSIZE)
          ctx.restore()
        }
      }

      ctx.restore()

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)

    const t0 = setTimeout(() => setShowLogo(true), 100)
    const t1 = setTimeout(() => setFadeOut(true),  4000)
    const t2 = setTimeout(onDone,                  4600)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t0); clearTimeout(t1); clearTimeout(t2)
      window.removeEventListener('resize', setSize)
    }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none',
      opacity: fadeOut ? 0 : 1, transition: 'opacity 0.6s ease',
    }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/logo.png" alt="" style={{
          width: 380, height: 380, objectFit: 'contain',
          opacity:   showLogo ? 1 : 0,
          transform: showLogo ? 'scale(1)' : 'scale(0.5)',
          transition: 'opacity 0.9s ease 0.2s, transform 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.2s',
          filter: 'drop-shadow(0 10px 40px rgba(0,0,0,0.85))',
        }} />
      </div>
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
          {/* Global PCA chess background — behind all content */}
          <img src="/PCA.png" alt="" style={{
            position: 'fixed', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: 0.1, pointerEvents: 'none', zIndex: -1,
          }} />
          <ScrollToTop />
          <Navbar />
          {/* No z-index here: keeps page content in the ROOT stacking context so
              the hero photo (z-index 11) can paint OVER the fixed pawn canvas
              (z-index 10), while the pawn still floats above section backgrounds. */}
          <div className="flex-1" style={{ position: 'relative' }}>
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
