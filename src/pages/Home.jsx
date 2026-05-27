import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Users, Trophy, Star, Award } from 'lucide-react'
import { supabase } from '../lib/supabase'
import TournamentCard from '../components/TournamentCard'

const STATS = [
  { value: '500+', label: 'Active Members', icon: Users },
  { value: '40+', label: 'Tournaments Hosted', icon: Trophy },
  { value: 'Glicko-2', label: 'Rating System', icon: Star },
  { value: 'Hyderabad', label: 'Based In', icon: Award },
]

export default function Home() {
  const [upcomingTournaments, setUpcomingTournaments] = useState([])
  const [loadingTournaments, setLoadingTournaments] = useState(true)

  useEffect(() => {
    async function fetchUpcoming() {
      const { data } = await supabase
        .from('tournaments')
        .select('*, tournament_registrations(count)')
        .in('status', ['upcoming', 'registration_open'])
        .order('date', { ascending: true })
        .limit(3)
      setUpcomingTournaments(
        (data || []).map(t => ({
          ...t,
          registered_count: t.tournament_registrations?.[0]?.count ?? 0,
        }))
      )
      setLoadingTournaments(false)
    }
    fetchUpcoming()
  }, [])

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Chess pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-conic-gradient(#ffffff 0% 25%, transparent 0% 50%)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-900/95 to-navy-900" />

        <div className="relative text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-navy-800/60 border border-navy-600 rounded-full px-4 py-1.5 text-sm text-slate-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Hyderabad's Largest Online Chess Club
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Compete.<br />
            <span className="text-blue-400">Improve.</span><br />
            Get Rated.
          </h1>
          <p className="text-slate-300 text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Join Pawn's Gambit — the chess club where Hyderabad's best compete, grow, and earn a real Glicko-2 rating.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tournaments"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-lg transition-colors flex items-center justify-center gap-2"
            >
              Join a Tournament <ChevronRight size={20} />
            </Link>
            <Link
              to="/signup"
              className="px-8 py-4 border border-navy-500 hover:border-navy-400 text-slate-300 hover:text-white font-semibold rounded-xl text-lg transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-navy-800 border-y border-navy-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="mx-auto mb-3 text-blue-400" size={28} />
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</div>
                <div className="text-slate-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                About Pawn's Gambit
              </h2>
              <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
                <p>
                  Pawn's Gambit is Hyderabad's largest and most active online chess club, bringing together players of all levels for competitive, rated, and fun chess.
                </p>
                <p>
                  Founded with a mission to grow the chess community in Hyderabad, we host regular Swiss-format tournaments with our proprietary Glicko-2 based rating system — the same algorithm trusted by FIDE and chess.com.
                </p>
                <p>
                  Our official coaching partner, <strong className="text-white">Panda Chess Academy</strong>, provides world-class training for players looking to level up. Whether you're a beginner or a seasoned club player, Pawn's Gambit is your chess home.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  to="/tournaments"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
                >
                  Browse Tournaments <ChevronRight size={18} />
                </Link>
              </div>
            </div>

            {/* Chess board decoration */}
            <div className="flex justify-center">
              <div className="relative w-72 h-72 md:w-80 md:h-80">
                <div
                  className="w-full h-full rounded-2xl shadow-2xl"
                  style={{
                    backgroundImage: `repeating-conic-gradient(#1e3a55 0% 25%, #14293d 0% 50%)`,
                    backgroundSize: '20%  20%',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="120" height="140" viewBox="0 0 48 56" fill="none">
                    <circle cx="24" cy="10" r="8" fill="white" />
                    <path d="M12 50 L15 35 Q18 28 24 28 Q30 28 33 35 L36 50 Z" fill="white" />
                    <rect x="10" y="49" width="28" height="5" rx="2.5" fill="white" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Tournaments */}
      <section className="py-16 px-4 bg-navy-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Upcoming Tournaments</h2>
              <p className="text-slate-400 mt-2">Register now and earn your Pawn's Gambit rating</p>
            </div>
            <Link
              to="/tournaments"
              className="hidden sm:flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>

          {loadingTournaments ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-navy-800 border border-navy-700 rounded-xl p-6 animate-pulse">
                  <div className="h-5 bg-navy-700 rounded mb-4 w-3/4" />
                  <div className="space-y-3">
                    <div className="h-3 bg-navy-700 rounded w-2/3" />
                    <div className="h-3 bg-navy-700 rounded w-1/2" />
                    <div className="h-3 bg-navy-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingTournaments.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingTournaments.map(t => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Trophy size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No upcoming tournaments right now.</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/tournaments" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium">
              View all tournaments <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
