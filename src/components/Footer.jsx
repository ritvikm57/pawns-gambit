import { Link } from 'react-router-dom'
import Logo from './Logo'

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.3 2.8 12 2.8 12 2.8s-4.3 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.2.7 11.3v2c0 2.2.3 4.3.3 4.3s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.3 21.9 12 22 12 22s4.3 0 6.8-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.3v-2C23.3 9.2 23 7 23 7zM9.7 15.5V8.4l6.6 3.6-6.6 3.5z" />
    </svg>
  )
}

const BORDER = 'rgba(74,158,255,0.1)'
const MUTED  = 'rgba(200,216,237,0.45)'

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ background: '#070f24', borderTop: `1px solid ${BORDER}`, scrollSnapAlign: 'start', scrollSnapStop: 'always', fontFamily: "'Times New Roman', Times, serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <Logo size={30} />
              <span className="font-bold text-white text-sm tracking-wide">Pawn's Gambit</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
              Hyderabad's chess community — where the board starts the conversation.
            </p>
            <div className="flex items-center gap-3">
              {[
                { href: 'https://instagram.com', label: 'Instagram', icon: <InstagramIcon /> },
                { href: 'https://youtube.com',   label: 'YouTube',   icon: <YouTubeIcon />   },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                   aria-label={s.label}
                   className="transition-colors hover:text-white"
                   style={{ color: MUTED }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-widest uppercase mb-5">Navigate</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home',        path: '/' },
                { label: 'Tournaments', path: '/tournaments' },
                { label: 'Gallery',     path: '/gallery' },
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm transition-colors hover:text-white"
                        style={{ color: MUTED }}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-widest uppercase mb-5">Contact</h3>
            <ul className="space-y-2.5 text-sm" style={{ color: MUTED }}>
              <li>
                <a href="mailto:contact@pgchess.in" className="transition-colors hover:text-white">
                  contact@pgchess.in
                </a>
              </li>
              <li>Hyderabad, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 text-center" style={{ borderTop: `1px solid ${BORDER}` }}>
          <p className="text-xs" style={{ color: `${MUTED.slice(0, -4)}0.3)` }}>
            © 2026 Pawn's Gambit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
