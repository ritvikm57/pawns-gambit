import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, MapPin, Trophy, AlertCircle, CheckCircle, IndianRupee } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { initiatePayment } from '../lib/razorpay'

export default function TournamentRegister() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/tournaments/${id}/register` } } })
      return
    }
    fetchTournament()
  }, [id, user])

  async function fetchTournament() {
    try {
      const [{ data: t, error: tErr }, { data: reg, error: rErr }] = await Promise.all([
        supabase.from('tournaments').select('*').eq('id', id).single(),
        supabase.from('tournament_registrations')
          .select('id, payment_status')
          .eq('tournament_id', id)
          .eq('user_id', user.id)
          .maybeSingle(),
      ])
      if (tErr) throw tErr
      if (rErr) throw rErr
      setTournament(t)
      if (reg?.payment_status === 'paid') setAlreadyRegistered(true)
    } catch (err) {
      setError(err.message || 'Failed to load tournament.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    setError('')
    setPaying(true)

    try {
      // Create a pending registration first
      const { data: reg, error: regError } = await supabase
        .from('tournament_registrations')
        .upsert({
          tournament_id: id,
          user_id: user.id,
          payment_status: 'pending',
        }, { onConflict: 'tournament_id,user_id' })
        .select()
        .single()

      if (regError) throw regError
      if (!reg) throw new Error('Registration failed — no data returned.')

      // If entry is free, skip payment
      if (!tournament.entry_fee || tournament.entry_fee === 0) {
        await supabase
          .from('tournament_registrations')
          .update({ payment_status: 'paid' })
          .eq('id', reg.id)
        setSuccess(true)
        setPaying(false)
        return
      }

      // Create Razorpay order via Supabase Edge Function
      const { data: order, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: tournament.entry_fee * 100, tournamentId: id, registrationId: reg.id },
      })
      if (orderError) throw new Error(order?.error || orderError.message)

      await initiatePayment({
        options: {
          amount: tournament.entry_fee * 100,
          orderId: order.id,
          name: "Pawn's Gambit",
          description: `Registration: ${tournament.name}`,
          prefill: {
            name: profile?.name,
            email: user.email,
            contact: profile?.phone,
          },
        },
        onSuccess: async (paymentId, orderId, signature) => {
          // Verify + confirm via Edge Function
          const { error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: { paymentId, orderId, signature, registrationId: reg.id },
          })
          if (verifyError) {
            setError('Payment verification failed. Contact support.')
          } else {
            setSuccess(true)
          }
          setPaying(false)
        },
        onFailure: async (err) => {
          // Delete the pending row so the spot isn't held and the count isn't inflated
          await supabase.from('tournament_registrations').delete().eq('id', reg.id)
          setError(err.message || 'Payment cancelled. You have not been charged.')
          setPaying(false)
        },
      })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setPaying(false)
    }
  }

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
        Tournament not found.{' '}
        <Link to="/tournaments" className="text-blue-400 ml-1">Go back</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">You're registered!</h2>
          <p className="text-slate-500 mb-2">
            You've successfully registered for <strong className="text-slate-900">{tournament.name}</strong>.
          </p>
          <p className="text-slate-500 text-sm mb-8">A confirmation email has been sent to {user.email}.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/tournaments" className="px-5 py-2.5 border border-gray-300 text-slate-600 hover:text-slate-900 rounded-lg text-sm transition-colors">
              All Tournaments
            </Link>
            <Link to="/profile" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors">
              My Profile
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (alreadyRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Already registered</h2>
          <p className="text-slate-500 mb-6">You're already registered for <strong className="text-slate-900">{tournament.name}</strong>.</p>
          <Link to="/profile" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors">
            View My Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link to="/tournaments" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-6">
          ← All Tournaments
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Register</h1>
        <p className="text-white/70 mb-8">Confirm your spot in this tournament</p>

        {/* Tournament Summary */}
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">{tournament.name}</h2>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>
                {new Date(tournament.date).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{tournament.is_online ? 'Online' : tournament.venue || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={14} />
              <span>{tournament.format} — {tournament.rounds} rounds</span>
            </div>
          </div>

          <hr className="border-navy-600 my-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <IndianRupee size={14} />
              <span>Entry Fee</span>
            </div>
            <span className="text-white font-semibold text-xl">
              {tournament.entry_fee ? `₹${tournament.entry_fee.toLocaleString('en-IN')}` : 'Free'}
            </span>
          </div>
          {tournament.prize_pool && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-slate-400 text-sm">Prize Pool</span>
              <span className="text-green-400 text-sm font-medium">{tournament.prize_pool}</span>
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-medium mb-3">Registering as</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy-600 flex items-center justify-center text-sm font-bold text-white">
              {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'}
            </div>
            <div>
              <p className="text-white font-medium">{profile?.name}</p>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4 text-red-300 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleRegister}
          disabled={paying}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-lg transition-colors"
        >
          {paying
            ? 'Processing...'
            : tournament.entry_fee
            ? `Pay ₹${tournament.entry_fee.toLocaleString('en-IN')} & Register`
            : 'Register (Free)'}
        </button>

        <p className="text-center text-white-500 text-xs mt-3">
          {tournament.entry_fee
            ? 'Payment processed securely via Razorpay. UPI, cards, and net banking accepted.'
            : 'This tournament has no entry fee.'}
        </p>
      </div>
    </div>
  )
}
