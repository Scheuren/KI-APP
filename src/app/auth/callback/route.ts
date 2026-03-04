import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Allowlist of paths the callback may redirect to — prevents Open Redirect attacks
const ALLOWED_REDIRECT_PATHS = ['/game', '/dashboard', '/auth/login']

function getSafeRedirectPath(next: string | null): string {
  if (!next) return '/game'
  // Must start with / (relative path) and be in the allowlist
  if (next.startsWith('/') && ALLOWED_REDIRECT_PATHS.includes(next)) {
    return next
  }
  return '/game'
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeRedirectPath(searchParams.get('next'))

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to error page on failure
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
