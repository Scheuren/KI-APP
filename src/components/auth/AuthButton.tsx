'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface AuthButtonProps {
  /** Whether to show compact mode (icon-only on mobile) */
  compact?: boolean
}

export function AuthButton({ compact = false }: AuthButtonProps) {
  const { user, profile, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="w-24 h-8 bg-slate-800 rounded-lg animate-pulse" />
    )
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className={`font-[family-name:var(--font-bangers)] tracking-widest
                   bg-[#FFE135] text-[#111] border-[2px] border-[#111]
                   shadow-[3px_3px_0_#111] hover:shadow-[1px_1px_0_#111]
                   hover:translate-x-[2px] hover:translate-y-[2px]
                   transition-all rounded-xl ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
      >
        ANMELDEN
      </Link>
    )
  }

  const displayName = profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? '?'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex items-center gap-2">
      {/* Avatar + name */}
      <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border border-slate-600"
          style={{ background: profile?.role === 'teacher' ? '#FFE135' : '#0066FF', color: profile?.role === 'teacher' ? '#111' : '#fff' }}
        >
          {initial}
        </div>
        {!compact && (
          <span className="font-[family-name:var(--font-comic)] text-slate-300 text-xs max-w-[80px] truncate">
            {displayName}
          </span>
        )}
      </div>

      {/* Teacher dashboard link */}
      {profile?.role === 'teacher' && (
        <Link
          href="/dashboard"
          className="font-[family-name:var(--font-bangers)] text-xs tracking-widest
                     bg-[#FFE135] text-[#111] border-[2px] border-[#111]
                     shadow-[2px_2px_0_#111] hover:shadow-[1px_1px_0_#111]
                     hover:translate-x-[1px] hover:translate-y-[1px]
                     transition-all rounded-xl px-3 py-1.5"
        >
          DASHBOARD
        </Link>
      )}

      {/* Sign out */}
      <button
        onClick={signOut}
        className="font-[family-name:var(--font-bangers)] text-xs tracking-widest
                   bg-slate-800 text-slate-400 border border-slate-700
                   hover:border-[#FF3B3F] hover:text-[#FF3B3F]
                   transition-all rounded-xl px-3 py-1.5"
      >
        {compact ? '✕' : 'ABMELDEN'}
      </button>
    </div>
  )
}
