import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, TrendingUp, Users, Calendar, MapPin, IndianRupee, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import PageDecor from '../components/PageDecor'

const TABS = [
  { key: 'upcoming',    label: 'Upcoming',    statuses: ['upcoming', 'registration_open'] },
  { key: 'ongoing',     label: 'Ongoing',     statuses: ['ongoing'] },
  { key: 'past',        label: 'Past',        statuses: ['completed'] },
  { key: 'leaderboard', label: 'Leaderboard', statuses: [] },
]

const STATUS_META = {
  upcoming:          { label: 'Upcoming',          cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  registration_open: { label: 'Registration Open', cls: 'bg-green-50 text-green-700 border-green-200' },
  ongoing:           { label: 'Live',              cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed:         { label: 'Completed',         cls: 'bg-slate-100 text-slate-400 border-slate-200' },
}

export default function Tournaments() {
  const [activeTab, setActiveTab]   = useState('upcoming')
  const [tournaments, setTournaments] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading]       = useState(true)
  const [lbFilter, setLbFilter]     = useState('all')

  useEffect(() => {
    if (activeTab === 'leaderboard') { fetchLeaderboard(); return }
    const tab = TABS.find(t => t.key === activeTab)
    fetchTournaments(tab.statuses)
  }, [activeTab])

  async function fetchTournaments(statuses) {
    setLoading(true)
    const { data } = await supabase
      .from('tournaments')
      .select('*, tournament_registrations(count)')
      .in('status', statuses)
      .order('date', { ascending: activeTab !== 'past' })
    setTournaments(
      (data || []).map(t => ({
        ...t,
        registered_count: t.tournament_registrations?.[0]?.count ?? 0,
      }))
    )
    setLoading(false)
  }

  async function fetchLeaderboard() {
    setLoading(true)
    let query = supabase
      .from('ratings')
      .select('*, users(name, city)')
      .order('rating', { ascending: false })
      .limit(100)
    if (lbFilter === 'active') {
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - 6)
      query = query.gte('last_updated', cutoff.toISOString())
    }
    const { data } = await query
    setLeaderboard(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'leaderboard') fetchLeaderboard()
  }, [lbFilter])

  return (
    <div className="relative min-h-screen pt-20 pb-16 px-4" style={{ background: '#f8f9fb' }}>
      <PageDecor />
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="py-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Tournaments</h1>
          <p className="text-slate-500 mt-2 text-lg">Compete, earn PG ratings, and climb the leaderboard.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 overflow-x-auto shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 min-w-max ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'leaderboard' ? (
          <LeaderboardView players={leaderboard} loading={loading} filter={lbFilter} onFilterChange={setLbFilter} />
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : tournaments.length > 0 ? (
          <div className="space-y-3">
            {tournaments.map(t => <TournamentRow key={t.id} tournament={t} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <Trophy size={52} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl text-slate-700 font-medium">No {activeTab} tournaments</p>
            <p className="text-sm mt-2">
              {activeTab === 'upcoming' ? 'Check back soon for upcoming events!'
                : activeTab === 'ongoing' ? 'No tournaments are currently in progress.'
                : 'No past tournaments to display.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tournament row (list item) ───────────────────────────────────────────────
function TournamentRow({ tournament }) {
  const {
    id, name, date, format, rounds, venue, is_online,
    entry_fee, prize_pool, registered_count = 0, max_players, status,
  } = tournament

  const meta = STATUS_META[status] || STATUS_META.upcoming

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—'

  const isOpen      = status === 'registration_open'
  const isCompleted = status === 'completed'

  const spots = max_players != null ? max_players - registered_count : null

  return (
    <div className="bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-all hover:shadow-sm overflow-hidden">
      <div className="flex items-stretch gap-0">

        {/* Left accent bar */}
        <div className={`w-1 flex-shrink-0 ${
          isOpen ? 'bg-green-400' : status === 'ongoing' ? 'bg-amber-400' : isCompleted ? 'bg-slate-200' : 'bg-blue-300'
        }`} />

        {/* Main content */}
        <div className="flex-1 px-5 py-4 min-w-0">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${meta.cls}`}>
                  {meta.label}
                </span>
                <h3 className="font-semibold text-slate-900 text-base leading-snug">{name}</h3>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1.5">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {is_online ? 'Online' : venue || 'TBD'}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy size={11} />
                  {format}{rounds ? ` · ${rounds} rounds` : ''}
                </span>
                <span className="flex items-center gap-1">
                  <IndianRupee size={11} />
                  {entry_fee ? `₹${entry_fee.toLocaleString('en-IN')} entry` : 'Free'}
                  {prize_pool ? ` · ${prize_pool} pool` : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {registered_count}{max_players != null ? `/${max_players}` : ''} players
                  {spots != null && spots <= 10 && spots > 0 && (
                    <span className="text-amber-600 font-medium">· {spots} spots left</span>
                  )}
                </span>
              </div>
            </div>

            {/* Action button */}
            <div className="flex-shrink-0">
              {isOpen ? (
                <Link
                  to={`/tournaments/${id}/register`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Register <ChevronRight size={14} />
                </Link>
              ) : isCompleted ? (
                <Link
                  to={`/tournaments/${id}/results`}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-gray-400 text-slate-600 hover:text-slate-900 text-sm font-medium rounded-lg transition-colors"
                >
                  Results <ChevronRight size={14} />
                </Link>
              ) : (
                <Link
                  to={`/tournaments/${id}`}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-gray-400 text-slate-600 hover:text-slate-900 text-sm font-medium rounded-lg transition-colors"
                >
                  Details <ChevronRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
function LeaderboardView({ players, loading, filter, onFilterChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-400">
          <TrendingUp size={18} />
          <span className="text-sm">{players.length} players ranked</span>
        </div>
        <div className="flex gap-2">
          {['all', 'active'].map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'All Players' : 'Active (6mo)'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading leaderboard...</div>
        ) : players.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No players yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3 w-16">Rank</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3 text-right">PG Rating</th>
                  <th className="px-4 py-3 text-right">±RD</th>
                  <th className="px-4 py-3 text-right">Games</th>
                  <th className="px-4 py-3 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player.user_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">
                      <span className={index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-600' : 'text-slate-400'}>
                        {index < 3 ? ['🥇','🥈','🥉'][index] : `#${index + 1}`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{player.users?.name ?? '—'}</div>
                      {player.users?.city && <div className="text-slate-400 text-xs">{player.users.city}</div>}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-lg font-semibold text-slate-900">{player.rating}</td>
                    <td className="px-4 py-4 text-right font-mono text-xs text-slate-400">±{player.rd}</td>
                    <td className="px-4 py-4 text-right text-slate-400">{player.games_played}</td>
                    <td className="px-4 py-4 text-right text-slate-400 text-xs">
                      {player.last_updated
                        ? new Date(player.last_updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
