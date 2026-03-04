'use client'

import { useCallback } from 'react'
import type { GameProgress, ActivityType, Difficulty } from '@/lib/supabase/types'

const LS_PREFIX = 'team-mks-progress'

// LocalStorage fallback helpers
function lsKey(level: number) {
  return `${LS_PREFIX}-level-${level}`
}

function lsSave(level: number, data: Partial<GameProgress>) {
  try {
    const existing = lsLoad(level)
    localStorage.setItem(lsKey(level), JSON.stringify({ ...existing, ...data }))
  } catch {
    // Silently ignore storage errors
  }
}

function lsLoad(level: number): Partial<GameProgress> | null {
  try {
    const raw = localStorage.getItem(lsKey(level))
    if (!raw) return null
    return JSON.parse(raw) as Partial<GameProgress>
  } catch {
    return null
  }
}

interface SaveProgressOptions {
  level: number
  phase: string
  xp: number
  max_xp?: number
  completed_zones?: string[]
  difficulty?: Difficulty | null
  player_character?: 'leader' | 'social' | null
  player_name?: string | null
  is_completed?: boolean
}

interface SaveScoreOptions {
  level: number
  activity_type: ActivityType
  score: number
  max_score: number
  attempt_number?: number
  time_spent_seconds?: number
  difficulty?: Difficulty | null
  answers_json?: Record<string, unknown> | null
  analytics?: Array<{
    concept: string
    understood: boolean
    hint_requested?: number
    errors_count?: number
  }>
}

export function useGameProgress() {
  /**
   * Save game progress for a level.
   * If user is not authenticated, falls back to localStorage.
   */
  const saveProgress = useCallback(async (options: SaveProgressOptions): Promise<void> => {
    const payload: SaveProgressOptions = {
      max_xp: 200,
      completed_zones: [],
      is_completed: false,
      ...options,
    }

    // Always save to localStorage as immediate fallback
    lsSave(options.level, payload as Partial<GameProgress>)

    try {
      const res = await fetch('/api/progress/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status === 401) {
        // Not authenticated — localStorage already saved
        return
      }

      if (!res.ok) {
        console.warn('Progress save failed:', await res.text())
      }
    } catch {
      // Network error — localStorage already saved
    }
  }, [])

  /**
   * Load game progress for a level.
   * Falls back to localStorage if not authenticated or network error.
   */
  const loadProgress = useCallback(
    async (level: number): Promise<Partial<GameProgress> | null> => {
      try {
        const res = await fetch(`/api/progress/load?level=${level}`)

        if (res.status === 401) {
          // Not authenticated — use localStorage
          return lsLoad(level)
        }

        if (!res.ok) {
          return lsLoad(level)
        }

        const json = (await res.json()) as { data: GameProgress | null }
        if (json.data) {
          // Also update localStorage with server data
          lsSave(level, json.data)
          return json.data
        }

        // No server data — fall back to localStorage
        return lsLoad(level)
      } catch {
        return lsLoad(level)
      }
    },
    []
  )

  /**
   * Load all progress for all levels (for level lock/unlock logic).
   */
  const loadAllProgress = useCallback(async (): Promise<Partial<GameProgress>[]> => {
    try {
      const res = await fetch('/api/progress/load')

      if (res.status === 401) {
        // Build from localStorage
        return Array.from({ length: 5 }, (_, i) => lsLoad(i + 1) ?? {}).filter(Boolean)
      }

      if (!res.ok) {
        return Array.from({ length: 5 }, (_, i) => lsLoad(i + 1) ?? {}).filter(Boolean)
      }

      const json = (await res.json()) as { data: GameProgress[] }
      return json.data ?? []
    } catch {
      return Array.from({ length: 5 }, (_, i) => lsLoad(i + 1) ?? {}).filter(Boolean)
    }
  }, [])

  /**
   * Save an activity score (quiz, puzzle, etc.)
   */
  const saveActivityScore = useCallback(async (options: SaveScoreOptions): Promise<void> => {
    const { analytics, ...scoreData } = options

    try {
      const res = await fetch('/api/progress/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score_data: scoreData, analytics }),
      })

      if (!res.ok && res.status !== 401) {
        console.warn('Score save failed:', await res.text())
      }
    } catch {
      // Non-critical — silently ignore
    }
  }, [])

  /**
   * Get recommended difficulty for a level based on previous performance.
   * Fallback: 'standard'
   */
  const getRecommendedDifficulty = useCallback(
    async (level: number): Promise<Difficulty> => {
      try {
        const res = await fetch(`/api/adaptive/difficulty?level=${level}`)
        if (!res.ok) return 'standard'
        const json = (await res.json()) as { difficulty: Difficulty }
        return json.difficulty ?? 'standard'
      } catch {
        return 'standard'
      }
    },
    []
  )

  return {
    saveProgress,
    loadProgress,
    loadAllProgress,
    saveActivityScore,
    getRecommendedDifficulty,
  }
}
