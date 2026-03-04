import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const SaveProgressSchema = z.object({
  level: z.number().int().min(1).max(5),
  phase: z.string(),
  xp: z.number().int().min(0),
  max_xp: z.number().int().min(1).default(200),
  completed_zones: z.array(z.string()).default([]),
  difficulty: z.enum(['basis', 'standard', 'experten']).nullable().optional(),
  player_character: z.enum(['leader', 'social']).nullable().optional(),
  player_name: z.string().max(50).nullable().optional(),
  is_completed: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht angemeldet. Bitte melde dich an.' },
        { status: 401 }
      )
    }

    const body: unknown = await request.json()
    const parsed = SaveProgressSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      level,
      phase,
      xp,
      max_xp,
      completed_zones,
      difficulty,
      player_character,
      player_name,
      is_completed,
    } = parsed.data

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('game_progress')
      .upsert(
        {
          user_id: user.id,
          level,
          phase,
          xp,
          max_xp,
          completed_zones,
          difficulty: difficulty ?? null,
          player_character: player_character ?? null,
          player_name: player_name ?? null,
          is_completed,
          completed_at: is_completed ? now : null,
          updated_at: now,
        },
        { onConflict: 'user_id,level' }
      )
      .select()
      .single()

    if (error) {
      console.error('Save progress error:', error)
      return NextResponse.json(
        { error: 'Spielstand konnte nicht gespeichert werden.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Unexpected error in save progress:', err)
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 })
  }
}
