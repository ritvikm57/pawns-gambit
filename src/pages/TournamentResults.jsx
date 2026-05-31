import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Trophy, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TournamentResults() {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [standings, setStandings] = useState([])
  const [rounds, setRounds] = useState([])
  const [activeRound, setActiveRound] = useState(null)
  const [pairings, setPairings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    const [{ data: t }, { data: regs }, { data: roundsData }] = await Promise.all([
      supabase.from('tournaments').select('*').eq('id', id).single(),
      supabase
        .from('tournament_registrations')
        .select('*, users(name), ratings(rating)')
        .eq('tournament_id', id)
        .eq('payment_status', 'paid')
        .order('score', { ascending: false }),
      supabase
        .from('tournament_rounds')
        .select('*, pairings(*, player1:player1_id(name), player2:player2_id(name))')
        .eq('tournament_id', id)
        .order('round_number', { ascending: true }),
    ])

    setTournament(t)
    setStandings(regs || [])
    setRounds(roundsData || [])
    if (roundsData?.length) setActiveRound(roundsData[roundsData.length - 1].id)
    setLoading(false)
  }

  useEffect(() => {
    if (!activeRound) return
    const round = rounds.find(r => r.id === activeRound)
    setPairings(round?.pairings || [])
  }, [activeRound, rounds])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Tournament not found.
      </div>
    )
  }

  const resultLabel = (result) => {
    if (result === 1) return { p1: '1', p2: '0' }
    if (result === 0) return { p1: '0', p2: '1' }
    if (result === 0.5) return { p1: '½', p2: '½' }
    return { p1: '?', p2: '?' }
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/tournaments" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft size={14} /> All Tournaments
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 bg-slate-500/20 text-slate-400 rounded-full">Completed</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{tournament.name}</h1>
          <p className="text-slate-400 mt-1">
            {new Date(tournament.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}{tournament.format} · {tournament.rounds} rounds
          </p>
        </div>

        {/* Final Standings */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" /> Final Standings
          </h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Player</th>
                    <th className="px-4 py-3 font-medium text-right">Score</th>
                    <th className="px-4 py-3 font-medium text-right">Rating Before</th>
                    <th className="px-4 py-3 font-medium text-right">Rating After</th>
                    <th className="px-4 py-3 font-medium text-right">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((player, index) => {
                    const before = player.rating_before
                    const after = player.rating_after
                    const delta = after && before ? after - before : null
                    return (
                      <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-slate-400 font-mono">
                          {index < 3
                            ? ['🥇','🥈','🥉'][index]
                            : `#${index + 1}`}
                        </td>
                        <td className="px-4 py-4 text-slate-900 font-medium">{player.users?.name ?? '—'}</td>
                        <td className="px-4 py-4 text-right text-slate-900 font-mono">{player.score ?? '—'}</td>
                        <td className="px-4 py-4 text-right text-slate-400 font-mono">{before ?? '—'}</td>
                        <td className="px-4 py-4 text-right text-slate-900 font-mono">{after ?? '—'}</td>
                        <td className="px-4 py-4 text-right font-mono">
                          {delta !== null ? (
                            <span className={delta >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {delta >= 0 ? '+' : ''}{delta}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Round-by-round pairings */}
        {rounds.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Round Results</h2>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {rounds.map(round => (
                <button
                  key={round.id}
                  onClick={() => setActiveRound(round.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeRound === round.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  Round {round.round_number}
                </button>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {pairings.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No pairings for this round.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 font-medium">White</th>
                        <th className="px-4 py-3 font-medium text-center">Result</th>
                        <th className="px-4 py-3 font-medium text-right">Black</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pairings.map((pairing) => {
                        const res = resultLabel(pairing.result)
                        return (
                          <tr key={pairing.id} className="border-b border-gray-100">
                            <td className="px-6 py-4 text-slate-900">{pairing.player1?.name ?? 'Bye'}</td>
                            <td className="px-4 py-4 text-center font-mono text-slate-500">
                              {res.p1} – {res.p2}
                            </td>
                            <td className="px-4 py-4 text-right text-slate-900">{pairing.player2?.name ?? 'Bye'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
