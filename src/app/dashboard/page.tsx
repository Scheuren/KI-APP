'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TeacherDashboardRow, GameProgress, ActivityScore, Class } from '@/lib/supabase/types'

interface StudentDetail {
  row: TeacherDashboardRow
  progress: GameProgress[]
  scores: ActivityScore[]
}

const LEVEL_NAMES: Record<number, string> = {
  1: 'Der Fall der verwirrten Daten',
  2: 'Das Urteil des Baumes',
  3: 'Baue deinen eigenen Baum',
  4: 'Der fehlerhafte Baum',
  5: 'Der voreingenommene Orakel',
}

function getScoreColor(pct: number | null): string {
  const v = pct ?? 0
  if (v >= 80) return 'text-[#00C853]'
  if (v >= 50) return 'text-[#FFE135]'
  return 'text-[#FF3B3F]'
}

function getScoreBg(pct: number | null): string {
  const v = pct ?? 0
  if (v >= 80) return 'bg-[#00C853]/20 border-[#00C853]/40'
  if (v >= 50) return 'bg-[#FFE135]/20 border-[#FFE135]/40'
  return 'bg-[#FF3B3F]/20 border-[#FF3B3F]/40'
}

function LevelStars({ completed, total = 5 }: { completed: number; total?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`text-sm ${i < completed ? 'text-[#FFE135]' : 'text-slate-700'}`}>
          ★
        </span>
      ))}
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  icon: string
}) {
  return (
    <div className="bg-slate-900 border-[2px] border-slate-700 rounded-2xl p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-[family-name:var(--font-bangers)] text-3xl text-[#FFE135] tracking-wide">
        {value}
      </div>
      <div className="font-[family-name:var(--font-bangers)] text-slate-300 text-sm tracking-widest mt-0.5">
        {label}
      </div>
      {sub && (
        <div className="font-[family-name:var(--font-comic)] text-slate-500 text-xs mt-1">{sub}</div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<TeacherDashboardRow[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [teacherName, setTeacherName] = useState<string>('')
  const [levelFilter, setLevelFilter] = useState<number | null>(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login'
        return
      }

      // Get teacher profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      if (profile && profile.role !== 'teacher') {
        window.location.href = '/game'
        return
      }
      if (!profile) {
        setError('Profil konnte nicht geladen werden. Bitte erneut anmelden.')
        setLoading(false)
        return
      }

      setTeacherName(profile.full_name ?? 'Lehrer')

      // Load classes
      const { data: classData } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)

      setClasses(classData ?? [])

      // Load student data from view
      const { data: studentData, error: studentError } = await supabase
        .from('teacher_dashboard_view')
        .select('*')

      if (studentError) throw studentError
      setStudents(studentData ?? [])
    } catch (err) {
      setError('Fehler beim Laden der Dashboard-Daten.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const loadStudentDetail = async (row: TeacherDashboardRow) => {
    const [progressRes, scoresRes] = await Promise.all([
      supabase.from('game_progress').select('*').eq('user_id', row.student_id ?? '').order('level'),
      supabase.from('activity_scores').select('*').eq('user_id', row.student_id ?? '').order('level'),
    ])
    setSelectedStudent({
      row,
      progress: (progressRes.data ?? []) as GameProgress[],
      scores: (scoresRes.data ?? []) as ActivityScore[],
    })
  }

  const copyClassCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      setCopiedCode(null)
    }
  }

  const createClass = async () => {
    const className = prompt('Name der Klasse (z.B. "9a — Informatik"):')
    if (!className) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('classes').insert({
      teacher_id: user.id,
      class_name: className,
    })
    loadDashboard()
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Klasse', 'Abgeschl. Level', 'Gesamt XP', 'Quiz-Note (%)', 'Letzter Login']
    const rows = students.map((s) => [
      s.full_name ?? '',
      s.email ?? '',
      s.class_code ?? '',
      s.levels_completed ?? 0,
      s.total_xp ?? 0,
      s.avg_quiz_score_pct ?? 0,
      s.last_active ? new Date(s.last_active).toLocaleDateString('de-DE') : '',
    ])
    const csv = [headers, ...rows].map((r) => r.map(String).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'team-mks-klasse.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Compute stats
  const avgLevels =
    students.length > 0
      ? (students.reduce((s, r) => s + (r.levels_completed ?? 0), 0) / students.length).toFixed(1)
      : 0
  const bestStudent =
    students.length > 0
      ? students.reduce((a, b) => ((a.total_xp ?? 0) > (b.total_xp ?? 0) ? a : b))
      : null
  const weakestConcepts = students
    .map((s) => s.weakest_concept)
    .filter((c): c is string => !!c)
    .reduce<Record<string, number>>((acc, c) => ({ ...acc, [c]: (acc[c] ?? 0) + 1 }), {})
  const topWeakConcept = Object.entries(weakestConcepts).sort((a, b) => b[1] - a[1])[0]

  // Level completion stats (% of class per level)
  const levelStats = Array.from({ length: 5 }, (_, i) => {
    const level = i + 1
    const done = students.filter((s) => (s.levels_completed ?? 0) >= level).length
    const pct = students.length > 0 ? Math.round((done / students.length) * 100) : 0
    return { level, done, pct }
  })

  const filteredStudents = levelFilter
    ? students.filter((s) => (s.levels_completed ?? 0) >= levelFilter)
    : students

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">🔍</div>
          <p className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-2xl tracking-widest">
            LADE DATEN...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-slate-900 border-[2px] border-[#FF3B3F] rounded-2xl p-8 text-center max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-[family-name:var(--font-bangers)] text-[#FF3B3F] text-xl tracking-wide mb-4">
            FEHLER
          </p>
          <p className="font-[family-name:var(--font-comic)] text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="bg-[#FFE135] text-[#111] font-[family-name:var(--font-bangers)] tracking-widest
                       px-6 py-2 rounded-xl border-[2px] border-[#111] shadow-[3px_3px_0_#111]"
          >
            ERNEUT VERSUCHEN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b-[3px] border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-3xl tracking-widest">
              TEAM MKS — LEHRER-DASHBOARD
            </h1>
            <p className="font-[family-name:var(--font-comic)] text-slate-400 text-xs">
              Willkommen, {teacherName}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={exportCSV}
              disabled={students.length === 0}
              className="font-[family-name:var(--font-bangers)] text-sm tracking-widest px-4 py-2 rounded-xl
                         bg-slate-800 border-[2px] border-slate-600 text-slate-300
                         hover:border-[#FFE135] hover:text-[#FFE135] transition-all disabled:opacity-40"
            >
              CSV EXPORT
            </button>
            <button
              onClick={createClass}
              className="font-[family-name:var(--font-bangers)] text-sm tracking-widest px-4 py-2 rounded-xl
                         bg-[#FFE135] border-[2px] border-[#111] text-[#111]
                         shadow-[3px_3px_0_#111] hover:shadow-[1px_1px_0_#111]
                         hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              + NEUE KLASSE
            </button>
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                window.location.href = '/auth/login'
              }}
              className="font-[family-name:var(--font-bangers)] text-sm tracking-widest px-4 py-2 rounded-xl
                         bg-slate-800 border-[2px] border-slate-700 text-slate-400
                         hover:border-[#FF3B3F] hover:text-[#FF3B3F] transition-all"
            >
              ABMELDEN
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="👥" label="SCHULER" value={students.length} sub="Gesamt eingeschrieben" />
          <StatCard
            icon="🏆"
            label="Ø LEVEL"
            value={avgLevels}
            sub="Durchschnitt abgeschlossene Level"
          />
          <StatCard
            icon="⭐"
            label="BESTER"
            value={bestStudent?.full_name?.split(' ')[0] ?? '—'}
            sub={bestStudent ? `${bestStudent.total_xp} XP` : undefined}
          />
          <StatCard
            icon="🧠"
            label="SCHWACHES KONZEPT"
            value={topWeakConcept ? topWeakConcept[0] : '—'}
            sub={topWeakConcept ? `${topWeakConcept[1]} Schüler` : 'Keine Daten'}
          />
        </div>

        {/* Classes / access codes */}
        {classes.length > 0 && (
          <div>
            <h2 className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-xl tracking-widest mb-3">
              KLASSEN-CODES
            </h2>
            <div className="flex flex-wrap gap-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-slate-900 border-[2px] border-slate-700 rounded-xl px-5 py-3 flex items-center gap-4"
                >
                  <div>
                    <p className="font-[family-name:var(--font-bangers)] text-white tracking-wide">
                      {cls.class_name}
                    </p>
                    <p className="font-[family-name:var(--font-comic)] text-slate-400 text-xs">
                      {cls.school_year}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-2xl tracking-[0.3em] bg-slate-800 px-3 py-1 rounded-lg border border-slate-600">
                      {cls.access_code}
                    </span>
                    <button
                      onClick={() => copyClassCode(cls.access_code)}
                      className="font-[family-name:var(--font-bangers)] text-xs tracking-wider px-3 py-1.5 rounded-lg
                                 bg-slate-800 border border-slate-600 hover:border-[#FFE135] transition-all"
                    >
                      {copiedCode === cls.access_code ? '✓ KOPIERT' : 'KOPIEREN'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level progress bars */}
        <div>
          <h2 className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-xl tracking-widest mb-3">
            KLASSEN-FORTSCHRITT
          </h2>
          <div className="bg-slate-900 border-[2px] border-slate-700 rounded-2xl p-5 space-y-3">
            {levelStats.map(({ level, done, pct }) => (
              <div key={level}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLevelFilter(levelFilter === level ? null : level)}
                      className={`font-[family-name:var(--font-bangers)] text-sm tracking-wide transition-colors
                                 ${levelFilter === level ? 'text-[#FFE135]' : 'text-slate-300 hover:text-[#FFE135]'}`}
                    >
                      Level {level} — {LEVEL_NAMES[level]}
                    </button>
                  </div>
                  <span className="font-[family-name:var(--font-comic)] text-slate-400 text-xs">
                    {done}/{students.length} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 80 ? '#00C853' : pct >= 50 ? '#FFE135' : '#FF3B3F',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {levelFilter && (
            <p className="font-[family-name:var(--font-comic)] text-slate-500 text-xs mt-2">
              Filter aktiv: Level {levelFilter} abgeschlossen —{' '}
              <button onClick={() => setLevelFilter(null)} className="text-[#FFE135] hover:underline">
                Filter entfernen
              </button>
            </p>
          )}
        </div>

        {/* Student list */}
        <div>
          <h2 className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-xl tracking-widest mb-3">
            SCHULER ({filteredStudents.length})
          </h2>

          {filteredStudents.length === 0 ? (
            <div className="bg-slate-900 border-[2px] border-slate-700 rounded-2xl p-8 text-center">
              <p className="font-[family-name:var(--font-bangers)] text-slate-500 text-xl tracking-widest">
                NOCH KEINE SCHULER
              </p>
              <p className="font-[family-name:var(--font-comic)] text-slate-600 text-sm mt-2">
                Teile den Klassen-Code mit deinen Schülern, damit sie sich einschreiben können.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredStudents.map((student) => (
                <button
                  key={student.student_id}
                  onClick={() => loadStudentDetail(student)}
                  className="w-full text-left bg-slate-900 border-[2px] border-slate-700 rounded-2xl p-4
                             hover:border-[#FFE135]/60 transition-all group"
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border-[2px] border-slate-600
                                    flex items-center justify-center text-lg flex-shrink-0">
                      {student.full_name?.[0]?.toUpperCase() ?? '?'}
                    </div>

                    {/* Name / email */}
                    <div className="flex-1 min-w-0">
                      <p className="font-[family-name:var(--font-bangers)] text-white text-base tracking-wide">
                        {student.full_name ?? 'Unbekannt'}
                      </p>
                      <p className="font-[family-name:var(--font-comic)] text-slate-500 text-xs truncate">
                        {student.email} · Klasse: {student.class_code ?? '—'}
                      </p>
                    </div>

                    {/* Stars */}
                    <LevelStars completed={student.levels_completed ?? 0} />

                    {/* XP */}
                    <div className="text-center">
                      <p className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-lg">
                        {student.total_xp}
                      </p>
                      <p className="font-[family-name:var(--font-comic)] text-slate-500 text-xs">XP</p>
                    </div>

                    {/* Quiz score */}
                    <div
                      className={`px-3 py-1 rounded-xl border text-center ${getScoreBg(student.avg_quiz_score_pct)}`}
                    >
                      <p className={`font-[family-name:var(--font-bangers)] text-base ${getScoreColor(student.avg_quiz_score_pct)}`}>
                        {student.avg_quiz_score_pct}%
                      </p>
                      <p className="font-[family-name:var(--font-comic)] text-slate-500 text-xs">Quiz</p>
                    </div>

                    {/* Last active */}
                    <div className="text-right">
                      <p className="font-[family-name:var(--font-comic)] text-slate-500 text-xs">
                        {student.last_active ? new Date(student.last_active).toLocaleDateString('de-DE') : '—'}
                      </p>
                      <p className="font-[family-name:var(--font-comic)] text-slate-600 text-xs">
                        letzter Login
                      </p>
                    </div>

                    <span className="font-[family-name:var(--font-bangers)] text-slate-600 text-lg
                                     group-hover:text-[#FFE135] transition-colors">
                      →
                    </span>
                  </div>

                  {/* Weakest concept */}
                  {student.weakest_concept && (
                    <div className="mt-2 ml-14">
                      <span className="font-[family-name:var(--font-comic)] text-[#FF3B3F] text-xs">
                        ⚠ Schwaches Konzept: {student.weakest_concept}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Student detail modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudent(null)
          }}
        >
          <div className="bg-slate-900 border-[3px] border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Modal header */}
            <div className="border-b-[2px] border-slate-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-2xl tracking-widest">
                  {selectedStudent.row.full_name ?? 'Schüler'}
                </h3>
                <p className="font-[family-name:var(--font-comic)] text-slate-500 text-xs">
                  {selectedStudent.row.email} · {selectedStudent.row.total_xp} XP gesamt
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Overall stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <p className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-2xl">
                    {selectedStudent.row.levels_completed}
                  </p>
                  <p className="font-[family-name:var(--font-comic)] text-slate-400 text-xs">Level abgeschl.</p>
                </div>
                <div className={`rounded-xl p-3 text-center border ${getScoreBg(selectedStudent.row.avg_quiz_score_pct)}`}>
                  <p className={`font-[family-name:var(--font-bangers)] text-2xl ${getScoreColor(selectedStudent.row.avg_quiz_score_pct)}`}>
                    {selectedStudent.row.avg_quiz_score_pct}%
                  </p>
                  <p className="font-[family-name:var(--font-comic)] text-slate-400 text-xs">Ø Quiz-Note</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <p className="font-[family-name:var(--font-bangers)] text-slate-300 text-sm">
                    {selectedStudent.row.last_active ? new Date(selectedStudent.row.last_active).toLocaleDateString('de-DE') : '—'}
                  </p>
                  <p className="font-[family-name:var(--font-comic)] text-slate-400 text-xs">Letzter Login</p>
                </div>
              </div>

              {/* Level-by-level */}
              <div>
                <h4 className="font-[family-name:var(--font-bangers)] text-slate-300 tracking-widest text-sm mb-3">
                  LEVEL-DETAILS
                </h4>
                {Array.from({ length: 5 }, (_, i) => i + 1).map((level) => {
                  const progress = selectedStudent.progress.find((p) => p.level === level)
                  const levelScores = selectedStudent.scores.filter((s) => s.level === level)
                  const quizScore = levelScores.find((s) => s.activity_type === 'quiz')
                  const puzzleScore = levelScores.find((s) => s.activity_type === 'puzzle')

                  return (
                    <div
                      key={level}
                      className={`mb-3 rounded-xl p-4 border-[2px] ${
                        progress?.is_completed
                          ? 'bg-slate-800 border-slate-600'
                          : progress
                          ? 'bg-slate-800/50 border-slate-700'
                          : 'bg-slate-900 border-slate-800 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-[family-name:var(--font-bangers)] text-sm tracking-wide text-slate-300">
                          Level {level} — {LEVEL_NAMES[level]}
                        </span>
                        <span
                          className={`font-[family-name:var(--font-bangers)] text-xs px-2 py-0.5 rounded-full border ${
                            progress?.is_completed
                              ? 'bg-[#00C853]/20 border-[#00C853]/40 text-[#00C853]'
                              : progress
                              ? 'bg-[#FFE135]/20 border-[#FFE135]/40 text-[#FFE135]'
                              : 'bg-slate-800 border-slate-700 text-slate-600'
                          }`}
                        >
                          {progress?.is_completed
                            ? 'ABGESCHLOSSEN'
                            : progress
                            ? `IN BEARBEITUNG — ${progress.phase}`
                            : 'NICHT GESTARTET'}
                        </span>
                      </div>

                      {progress && (
                        <div className="flex gap-4 flex-wrap">
                          <div>
                            <span className="font-[family-name:var(--font-comic)] text-slate-500 text-xs">XP: </span>
                            <span className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-sm">
                              {progress.xp}/{progress.max_xp}
                            </span>
                          </div>
                          {progress.difficulty && (
                            <div>
                              <span className="font-[family-name:var(--font-comic)] text-slate-500 text-xs">Schwierigkeit: </span>
                              <span className="font-[family-name:var(--font-bangers)] text-slate-300 text-sm capitalize">
                                {progress.difficulty}
                              </span>
                            </div>
                          )}
                          {quizScore && (
                            <div>
                              <span className="font-[family-name:var(--font-comic)] text-slate-500 text-xs">Quiz: </span>
                              <span className={`font-[family-name:var(--font-bangers)] text-sm ${getScoreColor(Math.round(quizScore.score / quizScore.max_score * 100))}`}>
                                {quizScore.score}/{quizScore.max_score}
                              </span>
                            </div>
                          )}
                          {puzzleScore && (
                            <div>
                              <span className="font-[family-name:var(--font-comic)] text-slate-500 text-xs">Rätsel: </span>
                              <span className="font-[family-name:var(--font-bangers)] text-slate-300 text-sm">
                                {puzzleScore.score}/{puzzleScore.max_score}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Recommendation */}
              {(selectedStudent.row.avg_quiz_score_pct ?? 0) < 50 &&
                (selectedStudent.row.levels_completed ?? 0) > 0 && (
                  <div className="bg-[#FF3B3F]/10 border-[2px] border-[#FF3B3F]/30 rounded-xl p-4">
                    <p className="font-[family-name:var(--font-bangers)] text-[#FF3B3F] text-sm tracking-wide mb-1">
                      EMPFEHLUNG
                    </p>
                    <p className="font-[family-name:var(--font-comic)] text-slate-300 text-sm">
                      Dieser Schüler hat eine Durchschnittsnote unter 50%. Es wird empfohlen,
                      Level {selectedStudent.row.levels_completed} zu wiederholen und auf Basis-Schwierigkeit
                      umzustellen.
                      {selectedStudent.row.weakest_concept && (
                        <> Besonderer Fokus auf Konzept: <strong>{selectedStudent.row.weakest_concept}</strong>.</>
                      )}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
