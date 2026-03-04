import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht angemeldet.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const levelParam = searchParams.get('level')

    if (!levelParam) {
      // Load all progress for this user
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('level')
        .limit(10)

      if (error) {
        return NextResponse.json({ error: 'Spielstand konnte nicht geladen werden.' }, { status: 500 })
      }

      return NextResponse.json({ data })
    }

    const level = parseInt(levelParam, 10)
    if (isNaN(level) || level < 1 || level > 5) {
      return NextResponse.json({ error: 'Ungültiges Level (1–5).' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('level', level)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine (new player)
      return NextResponse.json({ error: 'Spielstand konnte nicht geladen werden.' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? null })
  } catch (err) {
    console.error('Unexpected error in load progress:', err)
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 })
  }
}
