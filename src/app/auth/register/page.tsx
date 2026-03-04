'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Role = 'student' | 'teacher'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [classCode, setClassCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const validate = (): string | null => {
    if (!fullName.trim()) return 'Bitte gib deinen vollständigen Namen ein.'
    if (!email.trim()) return 'Bitte gib deine E-Mail-Adresse ein.'
    if (password.length < 6) return 'Das Passwort muss mindestens 6 Zeichen lang sein.'
    if (password !== passwordConfirm) return 'Die Passwörter stimmen nicht überein.'
    if (role === 'student' && !classCode.trim())
      return 'Bitte gib den Klassen-Code ein (erhältst du von deinem Lehrer).'
    return null
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role,
            class_code: role === 'student' ? classCode.trim().toUpperCase() : null,
          },
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an.')
        } else if (authError.message.includes('invalid')) {
          setError('Ungültige E-Mail-Adresse. Bitte überprüfe die Eingabe.')
        } else {
          setError('Registrierung fehlgeschlagen. Bitte versuche es erneut.')
        }
        return
      }

      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-slate-900 border-[3px] border-[#00C853] rounded-2xl p-8 shadow-[6px_6px_0_rgba(0,0,0,0.4)]">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="font-[family-name:var(--font-bangers)] text-[#00C853] text-3xl tracking-widest mb-3">
              FAST GESCHAFFT!
            </h2>
            <p className="font-[family-name:var(--font-comic)] text-slate-300 text-sm leading-relaxed mb-2">
              Wir haben eine Bestätigungs-E-Mail an{' '}
              <span className="text-[#FFE135] font-bold">{email}</span> gesendet.
            </p>
            <p className="font-[family-name:var(--font-comic)] text-slate-400 text-xs leading-relaxed mb-6">
              Bitte klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
              Danach kannst du dich anmelden.
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-[#FFE135] text-[#111] font-[family-name:var(--font-bangers)]
                         text-lg tracking-widest px-8 py-3 rounded-xl border-[3px] border-[#111]
                         shadow-[4px_4px_0_#111] hover:shadow-[2px_2px_0_#111]
                         hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              ZUM LOGIN →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-8xl opacity-5 rotate-12">🔍</div>
        <div className="absolute bottom-20 right-10 text-8xl opacity-5 -rotate-12">🕵️</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-block bg-[#FFE135] border-[4px] border-[#111] rounded-2xl px-6 py-3 shadow-[6px_6px_0_rgba(0,0,0,0.6)] mb-3">
            <h1 className="font-[family-name:var(--font-bangers)] text-3xl text-[#111] tracking-widest">
              🕵️ TEAM MKS
            </h1>
          </div>
          <p className="font-[family-name:var(--font-bangers)] text-slate-400 tracking-widest text-sm">
            NEUES KONTO ERSTELLEN
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border-[3px] border-slate-700 rounded-2xl shadow-[6px_6px_0_rgba(0,0,0,0.4)] p-6">

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-3 px-4 rounded-xl font-[family-name:var(--font-bangers)] text-base tracking-widest
                         border-[2px] transition-all ${
                           role === 'student'
                             ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-[3px_3px_0_#111]'
                             : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                         }`}
            >
              SCHULER
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`py-3 px-4 rounded-xl font-[family-name:var(--font-bangers)] text-base tracking-widest
                         border-[2px] transition-all ${
                           role === 'teacher'
                             ? 'bg-[#FFE135] border-[#FFE135] text-[#111] shadow-[3px_3px_0_#111]'
                             : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                         }`}
            >
              LEHRER
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="font-[family-name:var(--font-bangers)] text-slate-300 text-sm tracking-wide block mb-1">
                VOLLSTANDIGER NAME
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'teacher' ? 'Herr / Frau Mustermann' : 'Max Mustermann'}
                required
                className="w-full px-4 py-3 bg-slate-800 border-[2px] border-slate-600 rounded-xl
                           font-[family-name:var(--font-comic)] text-white text-sm
                           focus:outline-none focus:border-[#FFE135] transition-colors
                           placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="font-[family-name:var(--font-bangers)] text-slate-300 text-sm tracking-wide block mb-1">
                E-MAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                required
                className="w-full px-4 py-3 bg-slate-800 border-[2px] border-slate-600 rounded-xl
                           font-[family-name:var(--font-comic)] text-white text-sm
                           focus:outline-none focus:border-[#FFE135] transition-colors
                           placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="font-[family-name:var(--font-bangers)] text-slate-300 text-sm tracking-wide block mb-1">
                PASSWORT
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-slate-800 border-[2px] border-slate-600 rounded-xl
                           font-[family-name:var(--font-comic)] text-white text-sm
                           focus:outline-none focus:border-[#FFE135] transition-colors
                           placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="font-[family-name:var(--font-bangers)] text-slate-300 text-sm tracking-wide block mb-1">
                PASSWORT BESTATIGEN
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Passwort wiederholen"
                required
                className={`w-full px-4 py-3 bg-slate-800 border-[2px] rounded-xl
                           font-[family-name:var(--font-comic)] text-white text-sm
                           focus:outline-none transition-colors placeholder:text-slate-600 ${
                             passwordConfirm && password !== passwordConfirm
                               ? 'border-[#FF3B3F]'
                               : 'border-slate-600 focus:border-[#FFE135]'
                           }`}
              />
              {passwordConfirm && password !== passwordConfirm && (
                <p className="font-[family-name:var(--font-comic)] text-[#FF3B3F] text-xs mt-1">
                  Passwörter stimmen nicht überein
                </p>
              )}
            </div>

            {/* Class code — only for students */}
            {role === 'student' && (
              <div>
                <label className="font-[family-name:var(--font-bangers)] text-slate-300 text-sm tracking-wide block mb-1">
                  KLASSEN-CODE
                </label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="z.B. AB12CD"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-800 border-[2px] border-slate-600 rounded-xl
                             font-[family-name:var(--font-comic)] text-white text-sm uppercase tracking-widest
                             focus:outline-none focus:border-[#FFE135] transition-colors
                             placeholder:text-slate-600 placeholder:tracking-normal"
                />
                <p className="font-[family-name:var(--font-comic)] text-slate-500 text-xs mt-1">
                  Den Code bekommst du von deinem Lehrer
                </p>
              </div>
            )}

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
                         border-[3px] border-[#111] shadow-[4px_4px_0_#111] transition-all mt-2
                         ${loading
                           ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                           : role === 'teacher'
                             ? 'bg-[#FFE135] text-[#111] hover:shadow-[2px_2px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px]'
                             : 'bg-[#0066FF] text-white hover:shadow-[2px_2px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px]'
                         }`}
            >
              {loading ? 'REGISTRIERE...' : 'KONTO ERSTELLEN →'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="font-[family-name:var(--font-comic)] text-slate-500 text-xs">
              Bereits ein Konto?{' '}
              <Link href="/auth/login" className="text-[#FFE135] hover:underline">
                Jetzt anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
