import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, TrendingUp, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import TournamentCard from '../components/TournamentCard'

const TABS = [
  { key: 'upcoming',  label: 'Upcoming',  statuses: ['upcoming', 'registration_open'] },
  { key: 'ongoing',   label: 'Ongoing',   statuses: ['ongoing'] },
  { key: 'past',      label: 'Past',      statuses: ['completed'] },
  { key: 'leaderboard', label: 'Leaderboard', statuses: [] },
]

export default function Tournaments() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [tournaments, setTournaments] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [lbFilter, setLbFilter] = useState('all')

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard()
      return
    }
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
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      query = query.gte('last_updated', sixMonthsAgo.toISOString())
    }

    const { data } = await query
    setLeaderboard(data || [])
    setLoading(false)
  }

  // Re-fetch leaderboard when filter changes
  useEffect(() => {
    if (activeTab === 'leaderboard') fetchLeaderboard()
  }, [lbFilter])

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="py-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Tournaments</h1>
          <p className="text-slate-400 mt-2 text-lg">Compete, earn Glicko-2 ratings, and climb the leaderboard.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-navy-800 border border-navy-700 rounded-xl p-1 mb-8 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 min-w-max ${
                activeTab === tab.key
                  ? 'bg-navy-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-navy-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'leaderboard' ? (
          <LeaderboardView
            players={leaderboard}
            loading={loading}
            filter={lbFilter}
            onFilterChange={setLbFilter}
          />
        ) : loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : tournaments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map(t => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <Trophy size={52} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl text-slate-300 font-medium">No {activeTab} tournaments</p>
            <p className="text-sm mt-2">
              {activeTab === 'upcoming'
                ? 'Check back soon for upcoming events!'
                : activeTab === 'ongoing'
                ? 'No tournaments are currently in progress.'
                : 'No past tournaments to display.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

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
                filter === f
                  ? 'bg-navy-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-navy-700'
              }`}
            >
              {f === 'all' ? 'All Players' : 'Active (6mo)'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-navy-800 border border-navy-700 rounded-2xl overflow-hidden">
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
                <tr className="text-left text-slate-500 border-b border-navy-700 bg-navy-900/50">
                  <th className="px-6 py-3 font-medium w-12">Rank</th>
                  <th className="px-4 py-3 font-medium">Player</th>
                  <th className="px-4 py-3 font-medium text-right">PG Rating</th>
                  <th className="px-4 py-3 font-medium text-right">Uncertainty</th>
                  <th className="px-4 py-3 font-medium text-right">Games</th>
                  <th className="px-4 py-3 font-medium text-right">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr
                    key={player.user_id}
                    className={`border-b border-navy-700/50 hover:bg-navy-700/30 transition-colors ${
                      index < 3 ? 'font-medium' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className={`text-sm ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-slate-300' :
                        index === 2 ? 'text-amber-600' :
                        'text-slate-500'
                      }`}>
                        {index < 3 ? ['🥇','🥈','🥉'][index] : `#${index + 1}`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-white">{player.users?.name ?? 'Unknown'}</div>
                      {player.users?.city && (
                        <div className="text-slate-500 text-xs">{player.users.city}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-mono text-lg ${
                        index === 0 ? 'text-yellow-400' : 'text-white'
                      }`}>
                        {player.rating}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-400 font-mono">
                      ±{player.rd}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-400">
                      {player.games_played}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-500 text-xs">
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
