import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, ArrowRight, Send } from 'lucide-react'
import PageDecor from '../components/PageDecor'

const C = {
  ink:   '#0f1115',
  body:  '#454b57',
  faint: '#8a909c',
  blue:  '#1565c0',
  glow:  '#4a9eff',
  line:  'rgba(15,17,21,0.08)',
  bg:    '#ffffff',
  bgAlt: '#f6f7f9',
}

export default function Contact() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null) // null | 'loading' | 'success'

  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    await new Promise(r => setTimeout(r, 800))
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bgAlt }}>
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: `${C.blue}12` }}
          >
            <Send size={24} style={{ color: C.blue }} />
          </div>
          <h2 className="font-bold text-2xl mb-3" style={{ color: C.ink }}>Message sent!</h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: C.body }}>
            Thanks for reaching out. We'll get back to you as soon as possible.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: C.blue }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pt-24 pb-20" style={{ background: C.bgAlt, color: C.ink }}>
      <PageDecor />
      <div className="relative z-10 max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="mb-14 max-w-xl">
          <p
            className="text-[11px] font-semibold tracking-[0.26em] uppercase mb-4"
            style={{ color: C.glow }}
          >
            Get in touch
          </p>
          <h1
            className="font-bold mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Contact Us
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: C.body }}>
            Have a question, want to collaborate, or just want to say hello?
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">

          {/* Left: contact info */}
          <div className="space-y-8">
            <div>
              <p
                className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-5"
                style={{ color: C.faint }}
              >
                Reach us directly
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${C.blue}12` }}
                  >
                    <Mail size={16} style={{ color: C.blue }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: C.faint }}>Email</p>
                    <a
                      href="mailto:contact@pgchess.in"
                      className="font-medium text-sm transition-opacity hover:opacity-70"
                      style={{ color: C.ink }}
                    >
                      contact@pgchess.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${C.blue}12` }}
                  >
                    <MapPin size={16} style={{ color: C.blue }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: C.faint }}>Location</p>
                    <p className="font-medium text-sm" style={{ color: C.ink }}>Hyderabad, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: C.line }} />

            <div>
              <p
                className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-4"
                style={{ color: C.faint }}
              >
                Follow along
              </p>
              <div className="flex gap-3">
                {[
                  { label: 'Instagram', href: 'https://instagram.com' },
                  { label: 'YouTube',   href: 'https://youtube.com' },
                ].map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:text-blue-600"
                    style={{ color: C.body, borderColor: C.line, background: C.bg }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div
            className="rounded-2xl p-8"
            style={{ background: C.bg, border: `1px solid ${C.line}` }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { key: 'name',    label: 'Name',    type: 'text',  placeholder: 'Your name' },
                { key: 'email',   label: 'Email',   type: 'email', placeholder: 'your@email.com' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: C.faint }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => set(key)(e.target.value)}
                    placeholder={placeholder}
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors"
                    style={{ background: C.bgAlt, borderColor: C.line, color: C.ink }}
                    onFocus={e  => { e.target.style.borderColor = C.blue }}
                    onBlur={e   => { e.target.style.borderColor = C.line }}
                  />
                </div>
              ))}

              <div>
                <label
                  className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: C.faint }}
                >
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={e => set('message')(e.target.value)}
                  placeholder="What's on your mind?"
                  required
                  rows={5}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors resize-none"
                  style={{ background: C.bgAlt, borderColor: C.line, color: C.ink }}
                  onFocus={e => { e.target.style.borderColor = C.blue }}
                  onBlur={e  => { e.target.style.borderColor = C.line }}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2.5 py-3 font-semibold text-white rounded-xl text-sm transition-all hover:brightness-110 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1565c0, #4a9eff)' }}
              >
                {status === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Send message <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
