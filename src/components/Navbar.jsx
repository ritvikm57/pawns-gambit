import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, User, LogOut, Settings } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Tournaments', path: '/tournaments' },
    { label: 'Gallery', path: '/gallery' },
  ]

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  async function handleSignOut() {
    await signOut()
    setDropdownOpen(false)
    navigate('/')
  }

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 backdrop-blur-sm border-b border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Logo size={36} />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-white bg-navy-700'
                    : 'text-slate-300 hover:text-white hover:bg-navy-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white hover:bg-navy-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-xs font-bold">
                    {initials}
                  </div>
                  <span className="font-medium">{profile?.name?.split(' ')[0] ?? 'Account'}</span>
                  <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-navy-800 border border-navy-600 rounded-lg shadow-xl py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-navy-700 transition-colors"
                    >
                      <User size={14} /> My Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-navy-700 transition-colors"
                      >
                        <Settings size={14} /> Admin Panel
                      </Link>
                    )}
                    <hr className="border-navy-600 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-navy-700 transition-colors"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-900 border-t border-navy-700 px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'text-white bg-navy-700'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-navy-700 my-2" />
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300 hover:text-white">My Profile</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300 hover:text-white">Admin Panel</Link>}
              <button onClick={() => { handleSignOut(); setMenuOpen(false) }} className="block w-full text-left px-3 py-2 text-sm text-red-400">Log Out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-3 py-2 text-sm border border-navy-600 text-slate-300 rounded-lg">Log In</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">Sign Up</Link>
            </div>
          )}
        </div>
      )}

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </nav>
  )
}
