import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Trophy, Users, IndianRupee, ArrowLeft, Clock } from 'lucide-react'
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
  const [tournament, setTournament]         = useState(null)
  const [registeredCount, setRegisteredCount] = useState(0)
  const [rounds, setRounds]                 = useState([])
  const [standings, setStandings]           = useState([])
  const [loading, setLoading]               = useState(true)
  const [view, setView]                     = useState('standings') // 'standings' | 'rounds'

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ data: t, error: tErr }, { count, error: cErr }] = await Promise.all([
          supabase.from('tournaments').select('*').eq('id', id).single(),
          supabase
            .from('tournament_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('tournament_id', id),
        ])

        if (tErr) throw tErr
        if (cErr) throw cErr

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
          setRounds(roundsData || [])
          setStandings(regs || [])
        }
      } catch (err) {
        console.error('TournamentDetail fetch:', err.message)
      } finally {
        setLoading(false)
      }
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

  const showResults = tournament.status === 'ongoing' || tournament.status === 'completed'

  // Build round-result lookup:  userId → { [roundId]: 1 | 0 | 0.5 }
  // Note: Supabase may return NUMERIC columns as strings, so coerce with Number().
  const roundResults = {}
  standings.forEach(reg => { roundResults[reg.user_id] = {} })
  rounds.forEach(round => {
    round.pairings?.forEach(p => {
      if (p.result == null) return
      const r = Number(p.result)   // "1" → 1, "0.5" → 0.5, 1 → 1
      const wRes = r === 1 ? 1 : r === 0 ? 0 : 0.5
      const bRes = r === 1 ? 0 : r === 0 ? 1 : 0.5
      if (roundResults[p.player1_id] !== undefined)
        roundResults[p.player1_id][round.id] = wRes
      if (roundResults[p.player2_id] !== undefined)
        roundResults[p.player2_id][round.id] = bRes
    })
  })

  return (
    <div className="relative min-h-screen pt-20 pb-16 px-4" style={{ background: '#f8f9fb' }}>
      <div className="relative z-10 max-w-6xl mx-auto">

        <Link to="/tournaments" className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 mb-6">
          <ArrowLeft size={14} /> All Tournaments
        </Link>

        <div className="grid md:grid-cols-[340px_1fr] gap-8 items-start">

          {/* ══ LEFT — tournament details ════════════════════════════════ */}
          <div className="space-y-4">

            {/* Status + Title */}
            <div>
              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${STATUS_STYLES[tournament.status] || STATUS_STYLES.upcoming}`}>
                {STATUS_LABELS[tournament.status] || 'Upcoming'}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{tournament.name}</h1>
            </div>

            {/* Details card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3.5 shadow-sm">
              <Row icon={<Calendar size={15} />} label="Date & Time"  value={formattedDate} />
              <Row icon={<MapPin size={15} />}   label="Location"     value={tournament.is_online ? 'Online' : tournament.venue || 'TBD'} />
              <Row icon={<Trophy size={15} />}   label="Format"       value={`${tournament.format}${tournament.rounds ? ` — ${tournament.rounds} rounds` : ''}`} />
              <Row
                icon={<IndianRupee size={15} />}
                label="Entry Fee"
                value={tournament.entry_fee ? `₹${tournament.entry_fee.toLocaleString('en-IN')}` : 'Free'}
              />
              {tournament.prize_pool && (
                <Row icon={<Trophy size={15} />} label="Prize Pool" value={tournament.prize_pool} highlight />
              )}
              <Row
                icon={<Users size={15} />}
                label="Registered"
                value={
                  tournament.max_players != null
                    ? `${registeredCount} / ${tournament.max_players}${spotsLeft != null ? ` (${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left)` : ''}`
                    : `${registeredCount} players`
                }
              />
              {formattedDeadline && (
                <Row icon={<Clock size={15} />} label="Reg. Deadline" value={formattedDeadline} />
              )}
            </div>

            {/* CTA */}
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

          {/* ══ RIGHT — points / round-by-round ═════════════════════════ */}
          {showResults && standings.length > 0 ? (
            <div>
              {/* View toggle */}
              <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-4 shadow-sm w-fit">
                <button
                  onClick={() => setView('standings')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    view === 'standings'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-gray-50'
                  }`}
                >
                  Standings
                </button>
                <button
                  onClick={() => setView('rounds')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    view === 'rounds'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-gray-50'
                  }`}
                >
                  Round Results
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {view === 'standings' ? (

                  /* ── Standings ─────────────────────────────────────── */
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <th className="px-5 py-3 text-left w-16">Rank</th>
                          <th className="px-4 py-3 text-left">Player</th>
                          <th className="px-4 py-3 text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((reg, i) => (
                          <tr key={reg.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-sm text-slate-500">
                              {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                            </td>
                            <td className="px-4 py-3.5 font-medium text-slate-900">{reg.users?.name ?? '—'}</td>
                            <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">{reg.score ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                ) : rounds.length === 0 ? (

                  <div className="py-12 text-center text-slate-400 text-sm">
                    No rounds have been created yet.
                  </div>

                ) : (

                  /* ── Round-by-round ─────────────────────────────────── */
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <th className="px-4 py-3 text-left w-14">Rank</th>
                          <th className="px-4 py-3 text-left">Player</th>
                          <th className="px-4 py-3 text-center border-r border-gray-200 bg-slate-50">Points</th>
                          {rounds.map(r => (
                            <th key={r.id} className="px-3 py-3 text-center whitespace-nowrap font-bold">
                              Round {r.round_number}
                              {r.is_complete && (
                                <span className="block text-[9px] normal-case tracking-normal text-green-500 font-medium mt-0.5">complete</span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((reg, i) => (
                          <tr key={reg.id} className={`border-b border-gray-100 last:border-0 transition-colors ${
                            i % 2 === 0 ? 'hover:bg-blue-50/20' : 'bg-gray-50/40 hover:bg-blue-50/20'
                          }`}>
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">
                              {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">{reg.users?.name ?? '—'}</td>

                            {/* Total points (highlighted) */}
                            <td className="px-4 py-3 text-center border-r border-gray-200 bg-slate-50/60">
                              <span className="font-mono font-bold text-blue-600 tabular-nums">{reg.score ?? '—'}</span>
                            </td>

                            {/* Per-round result */}
                            {rounds.map(r => {
                              const res = roundResults[reg.user_id]?.[r.id]
                              const label =
                                res === 1   ? '1'
                                : res === 0   ? '0'
                                : res === 0.5 ? '½'
                                : '–'
                              const cls =
                                res === 1   ? 'text-green-600 font-bold'
                                : res === 0   ? 'text-red-400 font-medium'
                                : res === 0.5 ? 'text-slate-500'
                                : 'text-slate-300'
                              return (
                                <td key={r.id} className="px-3 py-3 text-center">
                                  <span className={`font-mono tabular-nums text-sm ${cls}`}>{label}</span>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                )}
              </div>
            </div>

          ) : !showResults ? (
            /* Placeholder for upcoming/open tournaments */
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <Trophy size={44} className="mx-auto mb-4 text-slate-200" />
              <p className="font-semibold text-slate-600">No results yet</p>
              <p className="text-sm text-slate-400 mt-1">Standings will appear once the tournament begins.</p>
            </div>

          ) : null}

        </div>
      </div>
    </div>
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
