'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type AuthTab = 'student' | 'teacher'

export default function LoginPage() {
  const [tab, setTab] = useState<AuthTab>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('E-Mail-Adresse oder Passwort ist falsch.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Bitte bestätige zuerst deine E-Mail-Adresse.')
        } else {
          setError('Anmeldung fehlgeschlagen. Bitte versuche es erneut.')
        }
        return
      }

      if (!data.session) {
        setError('Anmeldung fehlgeschlagen. Bitte versuche es erneut.')
        return
      }

      // Check role and redirect accordingly
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single()

      if (profile?.role === 'teacher') {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/game'
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-8xl opacity-5 rotate-12">🔍</div>
        <div className="absolute bottom-20 right-10 text-8xl opacity-5 -rotate-12">🕵️</div>
        <div className="absolute top-1/2 left-1/4 text-6xl opacity-5">🌳</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#FFE135] border-[4px] border-[#111] rounded-2xl px-8 py-4 shadow-[8px_8px_0_rgba(0,0,0,0.6)] mb-4">
            <div className="text-4xl mb-1">🕵️</div>
            <h1 className="font-[family-name:var(--font-bangers)] text-4xl text-[#111] tracking-widest leading-none">
              TEAM MKS
            </h1>
            <p className="font-[family-name:var(--font-comic)] text-[#555] text-xs mt-1">
              DETEKTIV-AGENTUR
            </p>
          </div>
          <p className="font-[family-name:var(--font-bangers)] text-slate-400 tracking-widest text-sm">
            MELDE DICH AN, UM WEITERZUMACHEN
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border-[3px] border-slate-700 rounded-2xl shadow-[6px_6px_0_rgba(0,0,0,0.4)] overflow-hidden">

          {/* Tabs */}
          <div className="grid grid-cols-2 border-b-[3px] border-slate-700">
            <button
              onClick={() => setTab('student')}
              className={`py-4 font-[family-name:var(--font-bangers)] text-lg tracking-widest transition-all ${
                tab === 'student'
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              SCHULER
            </button>
            <button
              onClick={() => setTab('teacher')}
              className={`py-4 font-[family-name:var(--font-bangers)] text-lg tracking-widest transition-all ${
                tab === 'teacher'
                  ? 'bg-[#FFE135] text-[#111]'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              LEHRER
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            {tab === 'student' ? (
              <p className="font-[family-name:var(--font-comic)] text-slate-400 text-xs mb-5 text-center">
                Melde dich mit deiner Schul-E-Mail an
              </p>
            ) : (
              <p className="font-[family-name:var(--font-comic)] text-slate-400 text-xs mb-5 text-center">
                Lehrer-Zugang — Klassen verwalten & Fortschritte einsehen
              </p>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="font-[family-name:var(--font-bangers)] text-slate-300 text-sm tracking-wide block mb-1">
                  E-MAIL
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  autoComplete="email"
                  aria-required="true"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border-[2px] border-slate-600 rounded-xl
                             font-[family-name:var(--font-comic)] text-white text-sm
                             focus:outline-none focus:border-[#FFE135] transition-colors
                             placeholder:text-slate-600"
                />
              </div>

              <div>
                <label htmlFor="password" className="font-[family-name:var(--font-bangers)] text-slate-300 text-sm tracking-wide block mb-1">
                  PASSWORT
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-required="true"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border-[2px] border-slate-600 rounded-xl
                             font-[family-name:var(--font-comic)] text-white text-sm
                             focus:outline-none focus:border-[#FFE135] transition-colors
                             placeholder:text-slate-600"
                />
              </div>

              {error && (
                <div className="bg-[#FF3B3F]/20 border-[2px] border-[#FF3B3F]/50 rounded-xl px-4 py-3">
                  <p className="font-[family-name:var(--font-comic)] text-[#FF3B3F] text-sm">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-[family-name:var(--font-bangers)] text-lg tracking-widest
                           border-[3px] border-[#111] shadow-[4px_4px_0_#111] transition-all
                           ${loading
                             ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                             : tab === 'teacher'
                               ? 'bg-[#FFE135] text-[#111] hover:shadow-[2px_2px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px]'
                               : 'bg-[#0066FF] text-white hover:shadow-[2px_2px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px]'
                           }`}
              >
                {loading ? 'LADEN...' : 'ANMELDEN →'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="font-[family-name:var(--font-comic)] text-slate-500 text-xs">
                Noch kein Konto?{' '}
                <Link
                  href="/auth/register"
                  className="text-[#FFE135] hover:underline"
                >
                  Jetzt registrieren
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Back to game */}
        <div className="text-center mt-4">
          <Link
            href="/game"
            className="font-[family-name:var(--font-comic)] text-slate-600 hover:text-slate-400 text-xs transition-colors"
          >
            ← Als Gast weiterspielen
          </Link>
        </div>
      </div>
    </div>
  )
}
