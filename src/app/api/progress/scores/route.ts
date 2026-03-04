import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Json } from '@/lib/supabase/types'

const ActivityScoreSchema = z.object({
  level: z.number().int().min(1).max(5),
  activity_type: z.enum(['quiz', 'puzzle', 'terms_match', 'teaching']),
  score: z.number().int().min(0),
  max_score: z.number().int().min(1),
  attempt_number: z.number().int().min(1).default(1),
  time_spent_seconds: z.number().int().min(0).default(0),
  difficulty: z.enum(['basis', 'standard', 'experten']).nullable().optional(),
  answers_json: z.record(z.string(), z.unknown()).nullable().optional(),
})

// Also save learning analytics derived from quiz answers
const LearningAnalyticSchema = z.object({
  concept: z.string(),
  understood: z.boolean(),
  hint_requested: z.number().int().min(0).default(0),
  errors_count: z.number().int().min(0).default(0),
})

const RequestSchema = z.object({
  score_data: ActivityScoreSchema,
  analytics: z.array(LearningAnalyticSchema).optional(),
})

export async function POST(request: NextRequest) {
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

    const body: unknown = await request.json()

    // Support both formats: { score_data, analytics } or flat score object
    let scoreData: z.infer<typeof ActivityScoreSchema>
    let analyticsData: z.infer<typeof LearningAnalyticSchema>[] = []

    const wrapped = RequestSchema.safeParse(body)
    if (wrapped.success) {
      scoreData = wrapped.data.score_data
      analyticsData = wrapped.data.analytics ?? []
    } else {
      const flat = ActivityScoreSchema.safeParse(body)
      if (!flat.success) {
        return NextResponse.json(
          { error: 'Ungültige Daten.', details: flat.error.flatten() },
          { status: 400 }
        )
      }
      scoreData = flat.data
    }

    // Save activity score
    const { data: scoreResult, error: scoreError } = await supabase
      .from('activity_scores')
      .insert({
        user_id: user.id,
        level: scoreData.level,
        activity_type: scoreData.activity_type,
        score: scoreData.score,
        max_score: scoreData.max_score,
        attempt_number: scoreData.attempt_number,
        time_spent_seconds: scoreData.time_spent_seconds,
        difficulty: scoreData.difficulty ?? null,
        answers_json: (scoreData.answers_json ?? null) as Json | null,
      })
      .select()
      .single()

    if (scoreError) {
      console.error('Save score error:', scoreError)
      return NextResponse.json(
        { error: 'Score konnte nicht gespeichert werden.' },
        { status: 500 }
      )
    }

    // Save learning analytics if provided
    if (analyticsData.length > 0) {
      const analyticsRows = analyticsData.map((a) => ({
        user_id: user.id,
        level: scoreData.level,
        concept: a.concept,
        understood: a.understood,
        hint_requested: a.hint_requested,
        errors_count: a.errors_count,
      }))

      const { error: analyticsError } = await supabase
        .from('learning_analytics')
        .insert(analyticsRows)

      if (analyticsError) {
        console.error('Save analytics error:', analyticsError)
        // Non-critical — don't fail the request
      }
    }

    return NextResponse.json({ success: true, data: scoreResult })
  } catch (err) {
    console.error('Unexpected error in save scores:', err)
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 })
  }
}
