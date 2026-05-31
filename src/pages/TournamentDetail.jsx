import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Trophy, Users, IndianRupee, ArrowLeft, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'

const STATUS_STYLES = {
  upcoming:          'bg-blue-50 text-blue-700 border border-blue-200',
  registration_open: 'bg-green-50 text-green-700 border border-green-200',
  ongoing:           'bg-indigo-50 text-indigo-700 border border-indigo-200',
  completed:         'bg-slate-100 text-slate-600 border border-slate-200',
}

const STATUS_LABELS = {
  upcoming:          'Upcoming',
  registration_open: 'Registration Open',
  ongoing:           'Live',
  completed:         'Completed',
}

export default function TournamentDetail() {
  const { id } = useParams()
  const [tournament, setTournament]     = useState(null)
  const [registeredCount, setRegisteredCount] = useState(0)
  const [rounds, setRounds]             = useState([])
  const [standings, setStandings]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [openRound, setOpenRound]       = useState(null)

  useEffect(() => {
    async function fetchData() {
      const [{ data: t }, { count }] = await Promise.all([
        supabase.from('tournaments').select('*').eq('id', id).single(),
        supabase
          .from('tournament_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('tournament_id', id),
      ])

      setTournament(t)
      setRegisteredCount(count ?? 0)

      if (t && (t.status === 'ongoing' || t.status === 'completed')) {
        const [{ data: roundsData }, { data: regs }] = await Promise.all([
          supabase
            .from('tournament_rounds')
            .select('*, pairings(*, player1:player1_id(name), player2:player2_id(name))')
            .eq('tournament_id', id)
            .order('round_number', { ascending: true }),
          supabase
            .from('tournament_registrations')
            .select('*, users(name)')
            .eq('tournament_id', id)
            .eq('payment_status', 'paid')
            .order('score', { ascending: false }),
        ])
        const filled = (roundsData || []).map(r => ({ ...r, pairings: r.pairings || [] }))
        setRounds(filled)
        setStandings(regs || [])
        if (filled.length) setOpenRound(filled[filled.length - 1].id)
      }

      setLoading(false)
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Tournament not found.{' '}
        <Link to="/tournaments" className="text-blue-500 ml-1 hover:underline">Go back</Link>
      </div>
    )
  }

  const formattedDate = tournament.date
    ? new Date(tournament.date).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long',
        year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—'

  const formattedDeadline = tournament.registration_deadline
    ? new Date(tournament.registration_deadline).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null

  const spotsLeft = tournament.max_players != null
    ? tournament.max_players - registeredCount
    : null

  const showPairings = tournament.status === 'ongoing' || tournament.status === 'completed'

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/tournaments" className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 mb-8">
          <ArrowLeft size={14} /> All Tournaments
        </Link>

        {/* Status + Title */}
        <div className="mb-8">
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${STATUS_STYLES[tournament.status] || STATUS_STYLES.upcoming}`}>
            {STATUS_LABELS[tournament.status] || 'Upcoming'}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{tournament.name}</h1>
        </div>

        {/* Details card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 space-y-4">
          <Row icon={<Calendar size={16} />} label="Date & Time" value={formattedDate} />
          <Row icon={<MapPin size={16} />} label="Location" value={tournament.is_online ? 'Online' : tournament.venue || 'TBD'} />
          <Row icon={<Trophy size={16} />} label="Format" value={`${tournament.format}${tournament.rounds ? ` — ${tournament.rounds} rounds` : ''}`} />
          <Row
            icon={<IndianRupee size={16} />}
            label="Entry Fee"
            value={tournament.entry_fee ? `₹${tournament.entry_fee.toLocaleString('en-IN')}` : 'Free'}
          />
          {tournament.prize_pool && (
            <Row icon={<Trophy size={16} />} label="Prize Pool" value={tournament.prize_pool} highlight />
          )}
          <Row
            icon={<Users size={16} />}
            label="Registered"
            value={
              tournament.max_players != null
                ? `${registeredCount} / ${tournament.max_players}${spotsLeft != null ? ` (${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left)` : ''}`
                : `${registeredCount} players`
            }
          />
          {formattedDeadline && (
            <Row icon={<Clock size={16} />} label="Reg. Deadline" value={formattedDeadline} />
          )}
        </div>

        {/* CTA */}
        <div className="mb-10">
          {tournament.status === 'registration_open' && (
            <Link
              to={`/tournaments/${id}/register`}
              className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Register Now
            </Link>
          )}
          {tournament.status === 'upcoming' && (
            <div className="w-full text-center py-3 bg-gray-100 text-slate-500 font-semibold rounded-xl text-sm">
              Registration not yet open
            </div>
          )}
          {tournament.status === 'ongoing' && (
            <div className="w-full text-center py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold rounded-xl text-sm">
              Tournament in progress
            </div>
          )}
          {tournament.status === 'completed' && (
            <Link
              to={`/tournaments/${id}/results`}
              className="block w-full text-center py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              View Full Results
            </Link>
          )}
        </div>

        {/* ── Standings ───────────────────────────────────────────── */}
        {(tournament.status === 'completed' || tournament.status === 'ongoing') && standings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Trophy size={18} className="text-slate-400" />
              {tournament.status === 'completed' ? 'Final Standings' : 'Current Standings'}
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Player</th>
                    <th className="px-4 py-3 font-medium text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((reg, i) => (
                    <tr key={reg.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                        {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{reg.users?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">{reg.score ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Round-by-round pairings ─────────────────────────────── */}
        {showPairings && rounds.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {tournament.status === 'ongoing' ? 'Rounds' : 'Round Results'}
            </h2>
            <div className="space-y-3">
              {rounds.map(round => {
                const isOpen = openRound === round.id
                return (
                  <div key={round.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                      onClick={() => setOpenRound(isOpen ? null : round.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900 text-sm">Round {round.round_number}</span>
                        {round.is_complete && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                            Complete
                          </span>
                        )}
                        {!round.is_complete && tournament.status === 'ongoing' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                            In Progress
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100">
                        {round.pairings.length === 0 ? (
                          <p className="px-5 py-4 text-sm text-slate-400">No pairings yet.</p>
                        ) : (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-slate-400 border-b border-gray-100 bg-gray-50">
                                <th className="px-5 py-2.5 font-medium">White</th>
                                <th className="px-3 py-2.5 font-medium text-center w-20">Result</th>
                                <th className="px-5 py-2.5 font-medium text-right">Black</th>
                              </tr>
                            </thead>
                            <tbody>
                              {round.pairings.map(p => {
                                const { p1Label, p2Label, p1Style, p2Style } = resultLabels(p.result)
                                return (
                                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                                    <td className="px-5 py-3">
                                      <div className="flex items-center gap-2">
                                        <ResultPill label={p1Label} style={p1Style} />
                                        <span className="text-slate-900 font-medium">{p.player1?.name ?? 'TBD'}</span>
                                      </div>
                                    </td>
                                    <td className="px-3 py-3 text-center font-mono text-slate-400 text-xs">
                                      {p.result != null ? `${p.result === 1 ? '1' : p.result === 0 ? '0' : '½'} – ${p.result === 1 ? '0' : p.result === 0 ? '1' : '½'}` : '—'}
                                    </td>
                                    <td className="px-5 py-3">
                                      <div className="flex items-center justify-end gap-2">
                                        <span className="text-slate-900 font-medium">{p.player2?.name ?? 'TBD'}</span>
                                        <ResultPill label={p2Label} style={p2Style} />
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function resultLabels(result) {
  if (result == null) return { p1Label: null, p2Label: null, p1Style: null, p2Style: null }
  if (result === 1)   return { p1Label: 'W', p2Label: 'L', p1Style: 'win',  p2Style: 'loss' }
  if (result === 0)   return { p1Label: 'L', p2Label: 'W', p1Style: 'loss', p2Style: 'win'  }
  return                     { p1Label: 'D', p2Label: 'D', p1Style: 'draw', p2Style: 'draw' }
}

const PILL_STYLES = {
  win:  'bg-green-50 text-green-700 border border-green-200',
  loss: 'bg-red-50 text-red-600 border border-red-200',
  draw: 'bg-slate-100 text-slate-500 border border-slate-200',
}

function ResultPill({ label, style }) {
  if (!label) return null
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${PILL_STYLES[style]}`}>
      {label}
    </span>
  )
}

function Row({ icon, label, value, highlight = false }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 flex items-start justify-between gap-4 min-w-0">
        <span className="text-slate-500 text-sm flex-shrink-0">{label}</span>
        <span className={`text-sm font-medium text-right ${highlight ? 'text-green-600' : 'text-slate-900'}`}>{value}</span>
      </div>
    </div>
  )
}
