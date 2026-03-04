// Auto-generated + custom types for Team MKS

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Custom app-level type aliases (stricter than the DB types)
export type UserRole = 'student' | 'teacher'
export type Difficulty = 'basis' | 'standard' | 'experten'
export type PlayerCharacter = 'leader' | 'social'
export type ActivityType = 'quiz' | 'puzzle' | 'terms_match' | 'teaching'
export type GamePhase =
  | 'characterSelect'
  | 'intro'
  | 'explore'
  | 'video'
  | 'postVideo'
  | 'teaching'
  | 'termsMatch'
  | 'puzzle'
  | 'quiz'
  | 'complete'

// App-level interfaces (for use in component props etc.)
// Nullable timestamps match actual DB column defaults (no NOT NULL constraint).
export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  class_code: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Class {
  id: string
  teacher_id: string
  class_name: string
  access_code: string
  school_year: string | null
  created_at: string | null
}

export interface GameProgress {
  id: string
  user_id: string
  level: number
  phase: GamePhase
  xp: number
  max_xp: number
  completed_zones: string[] | null
  difficulty: Difficulty | null
  player_character: PlayerCharacter | null
  player_name: string | null
  is_completed: boolean | null
  completed_at: string | null
  started_at: string | null
  updated_at: string | null
}

export interface ActivityScore {
  id: string
  user_id: string
  level: number
  activity_type: ActivityType
  score: number
  max_score: number
  attempt_number: number | null
  time_spent_seconds: number | null
  difficulty: Difficulty | null
  answers_json: Record<string, unknown> | null
  created_at: string | null
}

export interface LearningAnalytic {
  id: string
  user_id: string
  level: number
  concept: string
  understood: boolean | null
  hint_requested: number | null
  errors_count: number | null
  created_at: string | null
}

export interface Achievement {
  id: string
  user_id: string
  achievement_key: string
  achievement_name: string
  description: string | null
  xp_bonus: number | null
  earned_at: string | null
}

export interface TeacherDashboardRow {
  student_id: string | null
  full_name: string | null
  email: string | null
  class_code: string | null
  levels_completed: number | null
  total_xp: number | null
  last_active: string | null
  avg_quiz_score_pct: number | null
  weakest_concept: string | null
}

// Supabase Database type (generated format — required for correct rpc/from typing)
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_key: string
          achievement_name: string
          description: string | null
          earned_at: string | null
          id: string
          user_id: string
          xp_bonus: number | null
        }
        Insert: {
          achievement_key: string
          achievement_name: string
          description?: string | null
          earned_at?: string | null
          id?: string
          user_id: string
          xp_bonus?: number | null
        }
        Update: {
          achievement_key?: string
          achievement_name?: string
          description?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string
          xp_bonus?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'achievements_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      activity_scores: {
        Row: {
          activity_type: string
          answers_json: Json | null
          attempt_number: number | null
          created_at: string | null
          difficulty: string | null
          id: string
          level: number
          max_score: number
          score: number
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          activity_type: string
          answers_json?: Json | null
          attempt_number?: number | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          level: number
          max_score?: number
          score?: number
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          activity_type?: string
          answers_json?: Json | null
          attempt_number?: number | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          level?: number
          max_score?: number
          score?: number
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'activity_scores_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      classes: {
        Row: {
          access_code: string
          class_name: string
          created_at: string | null
          id: string
          school_year: string | null
          teacher_id: string
        }
        Insert: {
          access_code?: string
          class_name: string
          created_at?: string | null
          id?: string
          school_year?: string | null
          teacher_id: string
        }
        Update: {
          access_code?: string
          class_name?: string
          created_at?: string | null
          id?: string
          school_year?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'classes_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      game_progress: {
        Row: {
          completed_at: string | null
          completed_zones: string[] | null
          difficulty: string | null
          id: string
          is_completed: boolean | null
          level: number
          max_xp: number
          phase: string
          player_character: string | null
          player_name: string | null
          started_at: string | null
          updated_at: string | null
          user_id: string
          xp: number
        }
        Insert: {
          completed_at?: string | null
          completed_zones?: string[] | null
          difficulty?: string | null
          id?: string
          is_completed?: boolean | null
          level: number
          max_xp?: number
          phase?: string
          player_character?: string | null
          player_name?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          completed_at?: string | null
          completed_zones?: string[] | null
          difficulty?: string | null
          id?: string
          is_completed?: boolean | null
          level?: number
          max_xp?: number
          phase?: string
          player_character?: string | null
          player_name?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: 'game_progress_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      learning_analytics: {
        Row: {
          concept: string
          created_at: string | null
          errors_count: number | null
          hint_requested: number | null
          id: string
          level: number
          understood: boolean | null
          user_id: string
        }
        Insert: {
          concept: string
          created_at?: string | null
          errors_count?: number | null
          hint_requested?: number | null
          id?: string
          level: number
          understood?: boolean | null
          user_id: string
        }
        Update: {
          concept?: string
          created_at?: string | null
          errors_count?: number | null
          hint_requested?: number | null
          id?: string
          level?: number
          understood?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'learning_analytics_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          class_code: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          class_code?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          class_code?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      teacher_dashboard_view: {
        Row: {
          avg_quiz_score_pct: number | null
          class_code: string | null
          email: string | null
          full_name: string | null
          last_active: string | null
          levels_completed: number | null
          student_id: string | null
          total_xp: number | null
          weakest_concept: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_recommended_difficulty: {
        Args: { p_level: number; p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
