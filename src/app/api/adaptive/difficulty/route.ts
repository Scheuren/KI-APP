import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Difficulty } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { difficulty: 'standard' as Difficulty },
        { status: 200 }
      )
    }

    const { searchParams } = new URL(request.url)
    const levelParam = searchParams.get('level')

    if (!levelParam) {
      return NextResponse.json({ error: 'level Parameter fehlt.' }, { status: 400 })
    }

    const level = parseInt(levelParam, 10)
    if (isNaN(level) || level < 1 || level > 5) {
      return NextResponse.json({ error: 'Ungültiges Level (1–5).' }, { status: 400 })
    }

    // Call the DB function
    const { data, error } = await supabase.rpc('get_recommended_difficulty', {
      p_user_id: user.id,
      p_level: level,
    })

    if (error) {
      console.error('Adaptive difficulty error:', error)
      // Fallback to standard
      return NextResponse.json({ difficulty: 'standard' as Difficulty })
    }

    const difficulty: Difficulty = (data as Difficulty) ?? 'standard'

    return NextResponse.json({ difficulty })
  } catch (err) {
    console.error('Unexpected error in adaptive difficulty:', err)
    return NextResponse.json({ difficulty: 'standard' as Difficulty })
  }
}
