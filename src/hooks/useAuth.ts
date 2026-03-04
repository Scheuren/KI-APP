'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'

interface UseAuthReturn {
  user: User | null
  profile: Profile | null
  loading: boolean
  isTeacher: boolean
  isStudent: boolean
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      setProfile(data as Profile | null)
    },
    [supabase]
  )

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user: initialUser } }) => {
      setUser(initialUser)
      if (initialUser) {
        fetchProfile(initialUser.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        fetchProfile(sessionUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/game'
  }, [supabase])

  return {
    user,
    profile,
    loading,
    isTeacher: profile?.role === 'teacher',
    isStudent: profile?.role === 'student',
    signOut,
  }
}
