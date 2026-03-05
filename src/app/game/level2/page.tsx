'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DialogBox } from '@/components/game/DialogBox'
import { TeachingDialog } from '@/components/game/TeachingDialog'
import { ClassifyPuzzle } from '@/components/game/ClassifyPuzzle'
import { ChatBot } from '@/components/game/ChatBot'
import { LevelComplete } from '@/components/game/LevelComplete'
import {
  introDialogues2,
  teachingDialogues2,
  quizQuestions2,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  type Difficulty2,
} from '@/lib/game/level2Data'
import type { DialogLine } from '@/lib/game/level1Data'
import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { useGameProgress } from '@/hooks/useGameProgress'

type GamePhase =
  | 'intro'
  | 'explore'
  | 'teaching'
  | 'classify'
  | 'quiz'
  | 'complete'

type PlayerCharacter = 'leader' | 'social'

// ─── Simple inline Quiz (4 questions, no external data) ──────────────────────

type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

function QuizModal2({ onComplete }: { onComplete: (xp: number) => void }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])

  const question: QuizQuestion = quizQuestions2[current]
  const isLast = current === quizQuestions2.length - 1

  const confirm = () => {
    if (selected === null) return
    const correct = selected === question.correct
    setConfirmed(true)
    if (correct) setScore(s => s + 25)
    setAnswers(a => [...a, correct])
  }

  const next = () => {
    if (isLast) {
      // score state already includes points from this question (set in confirm())
      onComplete(score)
      return
    }
    setSelected(null)
    setConfirmed(false)
    setCurrent(c => c + 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-lg overflow-hidden">
        <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4 relative overflow-hidden">
          <div className="absolute inset-0 comic-dots opacity-20" />
          <div className="relative flex justify-between items-center">
            <h2 className="font-bangers text-[#111] text-2xl tracking-wider">WISSENS-CHECK</h2>
            <div className="bg-[#111] text-[#FFE135] font-bangers px-3 py-1 rounded-full text-sm tracking-wide">
              {current + 1} / {quizQuestions2.length}
            </div>
          </div>
          <div className="mt-2 w-full h-3 bg-white border-[2px] border-[#111] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(current / quizQuestions2.length) * 100}%`, background: '#FF3B3F' }}
            />
          </div>
        </div>

        <div className="p-5">
          <p className="font-comic text-[#111] font-bold text-base mb-4 leading-relaxed">
            {question.question}
          </p>
          <div className="flex flex-col gap-2">
            {question.options.map((option, i) => {
              let bg = 'white'; let border = '#111'; let textCol = '#111'
              if (confirmed) {
                if (i === question.correct) { bg = '#00C853'; textCol = 'white' }
                else if (i === selected) { bg = '#FF3B3F'; textCol = 'white' }
                else { bg = '#F5F5F5'; textCol = '#AAA' }
              } else if (i === selected) { bg = '#0066FF'; textCol = 'white' }
              return (
                <button
                  key={i}
                  onClick={() => !confirmed && setSelected(i)}
                  disabled={confirmed}
                  className="text-left px-4 py-3 rounded-xl border-[2.5px] font-comic text-sm transition-all shadow-[2px_2px_0_#111] disabled:shadow-none"
                  style={{ background: bg, borderColor: border, color: textCol }}
                >
                  <span className="font-bangers mr-2">{['A', 'B', 'C', 'D'][i]})</span>
                  {option}
                  {confirmed && i === question.correct && ' ✓'}
                  {confirmed && i === selected && i !== question.correct && ' ✗'}
                </button>
              )
            })}
          </div>
          {confirmed && (
            <div
              className="mt-3 p-3 rounded-xl border-[2.5px] border-[#111] text-sm leading-relaxed font-comic shadow-[2px_2px_0_#111]"
              style={{ background: selected === question.correct ? '#E8F5E9' : '#FFF3E0' }}
            >
              <span className="font-bold text-[#111]">
                {selected === question.correct ? '✅ Richtig! ' : '💡 Erklärung: '}
              </span>
              {question.explanation}
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex justify-between items-center">
          <div className="flex gap-1.5">
            {answers.map((correct, i) => (
              <div key={i} className="w-3 h-3 rounded-full border-[1.5px] border-[#111]" style={{ background: correct ? '#00C853' : '#FF3B3F' }} />
            ))}
            {Array.from({ length: quizQuestions2.length - answers.length }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full border-[1.5px] border-[#111] bg-[#EEE]" />
            ))}
          </div>
          {!confirmed ? (
            <button
              onClick={confirm}
              disabled={selected === null}
              className="comic-btn px-5 py-2 rounded-xl font-bangers text-base tracking-wide disabled:opacity-40"
              style={{ background: '#FFE135', color: '#111' }}
            >
              Antworten!
            </button>
          ) : (
            <button
              onClick={next}
              className="comic-btn px-5 py-2 rounded-xl font-bangers text-base tracking-wide"
              style={{ background: '#0066FF', color: 'white' }}
            >
              {isLast ? `Fertig! (+${score} XP)` : 'Nächste →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Level 2 Complete Screen ──────────────────────────────────────────────────

function Level2Complete({ xp, puzzleXP, quizXP, onNext, onReplay }: {
  xp: number; puzzleXP: number; quizXP: number; onNext: () => void; onReplay: () => void
}) {
  const total = puzzleXP + quizXP
  const stars = total >= 150 ? 3 : total >= 100 ? 2 : 1

  const concepts = [
    { term: 'Klassifikation', desc: 'Zuordnung von Objekten zu Klassen anhand von Merkmalen', icon: '🏷️', color: '#FF3B3F' },
    { term: 'Merkmal', desc: 'Eine messbare Eigenschaft eines Objekts (z.B. Hut: ja/nein)', icon: '🔍', color: '#0066FF' },
    { term: 'Klasse', desc: 'Eine Kategorie, der ein Objekt zugeordnet wird (z.B. verdächtig)', icon: '📂', color: '#00C853' },
    { term: 'Regression', desc: 'Vorhersage von Zahlenwerten — Gegensatz zur Klassifikation', icon: '📊', color: '#9C27B0' },
    { term: 'Fehlende Werte', desc: 'Wenn ein Merkmal unbekannt ist — ein echtes KI-Problem!', icon: '❓', color: '#FF9800' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <div className="relative overflow-hidden p-6 text-center border-b-[4px] border-[#111]" style={{ background: '#FFE135' }}>
          <div className="absolute inset-0 comic-dots opacity-20" />
          <div className="relative">
            <div className="text-6xl mb-1">🏆</div>
            <h2 className="font-bangers text-[#111] text-3xl tracking-wider">LEVEL 2 KLAR!</h2>
            <p className="font-comic text-[#555] text-sm mt-1">&quot;Das Urteil des Baumes&quot; — gelöst!</p>
            <div className="flex justify-center gap-3 mt-2 text-4xl">
              {[1, 2, 3].map(s => (
                <span key={s} style={{ color: s <= stars ? '#FF9800' : '#DDD', filter: s <= stars ? 'drop-shadow(0 0 6px #FF9800)' : 'none' }}>★</span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bangers text-[#111] text-lg tracking-wide mb-2">PUNKTE-AUSWERTUNG</h3>
          <div className="space-y-2">
            {[
              { label: '🔍 Klassifikation', val: puzzleXP, color: '#0066FF' },
              { label: '📝 Wissens-Check', val: quizXP, color: '#9C27B0' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between items-center border-[2.5px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
                <span className="font-comic text-[#111] text-sm">{label}</span>
                <span className="font-bangers text-lg" style={{ color }}>+{val} XP</span>
              </div>
            ))}
            <div className="flex justify-between items-center border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] mt-1" style={{ background: '#FFE135' }}>
              <span className="font-bangers text-[#111] text-base">GESAMT</span>
              <span className="font-bangers text-[#FF3B3F] text-2xl">{total} XP</span>
            </div>
          </div>

          <h3 className="font-bangers text-[#111] text-lg tracking-wide mt-4 mb-2">DAS HAST DU GELERNT:</h3>
          <div className="space-y-1.5">
            {concepts.map(c => (
              <div key={c.term} className="flex items-start gap-3 border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg border-[2px] border-[#111] flex-shrink-0 text-lg" style={{ background: c.color }}>
                  {c.icon}
                </div>
                <div>
                  <span className="font-bangers text-sm tracking-wide" style={{ color: c.color }}>{c.term}: </span>
                  <span className="font-comic text-[#111] text-xs">{c.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button
            onClick={onReplay}
            className="flex-1 py-3 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all"
            style={{ background: 'white', color: '#111' }}
          >
            ↩ Nochmal
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-3 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all"
            style={{ background: '#0066FF', color: 'white' }}
          >
            Level 3 →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Explore world for Level 2 ───────────────────────────────────────────────

function Level2World({
  completedZones,
  playerCharacter,
  onInteract,
}: {
  completedZones: string[]
  playerCharacter: PlayerCharacter
  onInteract: (zone: 'viktor' | 'inspector' | 'caseboard') => void
}) {
  return (
    <div
      className="relative select-none comic-panel"
      style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}
    >
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/game/backgrounds/interrogation-room.svg"
        alt=""
        className="absolute inset-0 pointer-events-none"
        style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, objectFit: 'fill' }}
        draggable={false}
      />

      {/* Title banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div className="bg-[#FFE135] border-[3px] border-[#111] rounded-xl px-6 py-2 shadow-[4px_4px_0_#111]">
          <p className="font-bangers text-[#111] text-xl tracking-widest">VERHÖRRAUM — LEVEL 2</p>
        </div>
      </div>

      {/* Viktor NPC */}
      <div className="absolute cursor-pointer" style={{ left: 160, top: 180 }} onClick={() => !completedZones.includes('viktor') && onInteract('viktor')}>
        <div className={`relative flex flex-col items-center transition-all ${completedZones.includes('viktor') ? 'opacity-50' : 'hover:scale-105'}`}>
          <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] mb-1 text-center">
            <span className="font-bangers text-[#111] text-xs tracking-wide">VIKTOR V.</span>
            <p className="font-comic text-[#555] text-[10px]">&quot;Ich bin unschuldig!&quot;</p>
          </div>
          <div className="text-5xl">🕵️</div>
          {!completedZones.includes('viktor') && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFE135] border-[2px] border-[#111] rounded-lg px-2 py-0.5 text-[10px] font-bangers whitespace-nowrap shadow-[2px_2px_0_#111] animate-bounce">
              [E] Befragen
            </div>
          )}
          {completedZones.includes('viktor') && (
            <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>
          )}
        </div>
      </div>

      {/* Inspector Node */}
      <div className="absolute cursor-pointer" style={{ left: 570, top: 120 }} onClick={() => !completedZones.includes('inspector') && onInteract('inspector')}>
        <div className={`relative flex flex-col items-center transition-all ${completedZones.includes('inspector') ? 'opacity-50' : 'hover:scale-105'}`}>
          <div className="bg-[#FFE135] border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] mb-1 text-center">
            <span className="font-bangers text-[#111] text-xs tracking-wide">INSPECTOR NODE</span>
            <p className="font-comic text-[#555] text-[10px]">Theorie: Klassifikation</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/game/characters/preview/brain.png" alt="Inspector" style={{ width: 60, height: 80, objectFit: 'contain' }} />
          {!completedZones.includes('inspector') && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFE135] border-[2px] border-[#111] rounded-lg px-2 py-0.5 text-[10px] font-bangers whitespace-nowrap shadow-[2px_2px_0_#111] animate-bounce">
              [E] Ansprechen
            </div>
          )}
          {completedZones.includes('inspector') && (
            <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>
          )}
        </div>
      </div>

      {/* Case board / Start classify */}
      <div className="absolute cursor-pointer" style={{ left: 570, top: 310 }} onClick={() => completedZones.includes('inspector') && !completedZones.includes('caseboard') && onInteract('caseboard')}>
        <div
          className={`flex flex-col items-center transition-all ${completedZones.includes('caseboard') ? 'opacity-50' : completedZones.includes('inspector') ? 'hover:scale-105' : 'opacity-30 cursor-not-allowed'}`}
        >
          <div className={`border-[3px] border-[#111] rounded-xl px-4 py-3 shadow-[4px_4px_0_#111] text-center ${completedZones.includes('inspector') ? 'bg-[#FF3B3F]' : 'bg-slate-700'}`}>
            <p className="font-bangers text-white text-sm tracking-wide">KLASSIFIKATION STARTEN</p>
            <p className="font-comic text-white/80 text-[10px] mt-0.5">Wähle Schwierigkeit</p>
          </div>
          {!completedZones.includes('inspector') && (
            <p className="font-comic text-slate-400 text-[10px] mt-1">Erst Inspector Node befragen!</p>
          )}
          {!completedZones.includes('caseboard') && completedZones.includes('inspector') && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFE135] border-[2px] border-[#111] rounded-lg px-2 py-0.5 text-[10px] font-bangers whitespace-nowrap shadow-[2px_2px_0_#111] animate-bounce">
              [E] Starten
            </div>
          )}
          {completedZones.includes('caseboard') && (
            <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>
          )}
        </div>
      </div>

      {/* Player character indicator */}
      <div className="absolute bottom-12 left-6">
        <div className="flex items-center gap-2 bg-white border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={playerCharacter === 'leader' ? '/game/characters/preview/leader.png' : '/game/characters/preview/leader_w.png'}
            alt="Player"
            style={{ width: 32, height: 48, objectFit: 'contain' }}
          />
          <div>
            <p className="font-bangers text-[#111] text-xs tracking-wide">DU</p>
            <p className="font-comic text-[#666] text-[10px]">Detektiv im Einsatz</p>
          </div>
        </div>
      </div>

      {/* Mission status */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center">
        <div className="flex gap-2">
          {[
            { id: 'viktor', label: '🕵️ Viktor', done: completedZones.includes('viktor') },
            { id: 'inspector', label: '🧠 Inspector', done: completedZones.includes('inspector') },
            { id: 'caseboard', label: '🔍 Klassifikation', done: completedZones.includes('caseboard') },
          ].map(z => (
            <div
              key={z.id}
              className="px-2 py-1 rounded-lg border-[2px] border-[#111] font-comic text-xs font-bold shadow-[2px_2px_0_#111]"
              style={{ background: z.done ? '#00C853' : 'white', color: z.done ? 'white' : '#888' }}
            >
              {z.label} {z.done ? '✓' : '○'}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Difficulty Picker ────────────────────────────────────────────────────────

function DifficultyPicker2({ onSelect }: { onSelect: (d: Difficulty2) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-sm p-6">
        <h3 className="font-bangers text-[#111] text-2xl tracking-wide text-center mb-1">SCHWIERIGKEIT WÄHLEN</h3>
        <p className="font-comic text-[#666] text-sm text-center mb-4">Wie viele Verdächtige und Merkmale?</p>
        <div className="flex flex-col gap-3">
          {([
            { level: 'basis' as Difficulty2, label: '⭐ Basis', desc: '3 Verdächtige · 2 Merkmale · 50 XP max', color: '#00C853' },
            { level: 'standard' as Difficulty2, label: '⭐⭐ Standard', desc: '5 Verdächtige · 3 Merkmale · 75 XP max', color: '#FF9800' },
            { level: 'experten' as Difficulty2, label: '⭐⭐⭐ Experten', desc: '7 Verdächtige · 4 Merkmale · 100 XP · Zeitlimit!', color: '#FF3B3F' },
          ] as const).map(({ level, label, desc, color }) => (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className="text-left px-4 py-4 border-[3px] border-[#111] rounded-xl transition-all shadow-[3px_3px_0_#111] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] hover:opacity-90"
              style={{ background: color, color: 'white' }}
            >
              <div className="font-bangers text-lg tracking-wide">{label}</div>
              <div className="font-comic text-white/80 text-xs mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Viktor Dialogue (brief) ──────────────────────────────────────────────────

const viktorDialogue: DialogLine[] = [
  {
    speaker: 'Viktor V.',
    text: 'Ich bitte dich, {NAME}! Ich war den ganzen Abend zu Hause! Ich habe einen Hut — ja, das stimmt. Aber das macht mich nicht zum Täter!',
    portrait: 'player',
  },
  {
    speaker: 'Inspector Node',
    text: 'Gute Aussage. Aber wir lassen den Entscheidungsbaum entscheiden — nicht Sympathie. Klassifiziere alle Verdächtigen nach den Merkmalen!',
    portrait: 'node',
  },
]

// ─── HUD for Level 2 ─────────────────────────────────────────────────────────

function HUD2({ xp, completedZones }: { xp: number; completedZones: string[] }) {
  return (
    <div className="absolute top-0 inset-x-0 z-20 p-2 flex justify-between items-start pointer-events-none">
      <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111]">
        <p className="font-bangers text-[#FF3B3F] text-sm tracking-wider">Level 2 — Das Urteil des Baumes</p>
        <p className="font-comic text-[#111] text-xs mt-0.5">
          {completedZones.length === 0 && 'Besuche Viktor und Inspector Node'}
          {completedZones.length === 1 && 'Besuche Inspector Node'}
          {completedZones.length === 2 && 'Starte die Klassifikation!'}
          {completedZones.length >= 3 && 'Level abgeschlossen!'}
        </p>
      </div>
      <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] min-w-[140px]">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bangers text-[#FF3B3F] text-sm">⭐ XP</span>
          <span className="font-comic text-[#111] text-xs font-bold">{xp} / 200</span>
        </div>
        <div className="w-full h-3 bg-[#EEE] border-[2px] border-[#111] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((xp / 200) * 100, 100)}%`, background: 'linear-gradient(90deg, #FFE135, #FF9800)' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Level2Page() {
  const [scale, setScale] = useState(1)
  const { saveProgress, loadProgress, saveActivityScore } = useGameProgress()
  const progressLoaded = useRef(false)
  const startTime = useRef<number>(Date.now())

  useEffect(() => {
    const update = () => {
      setScale(Math.min(window.innerWidth / WORLD_WIDTH, window.innerHeight / WORLD_HEIGHT))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Load from localStorage (set by level1 character select)
  const [playerCharacter, setPlayerCharacter] = useState<PlayerCharacter>('leader')
  const [playerName, setPlayerName] = useState<string>('Detektiv')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const char = localStorage.getItem('mks_player_character') as PlayerCharacter | null
      const name = localStorage.getItem('mks_player_name')
      if (char) setPlayerCharacter(char)
      if (name) setPlayerName(name)
    }
  }, [])

  const [phase, setPhase] = useState<GamePhase>('intro')
  const [completedZones, setCompletedZones] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty2 | null>(null)
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false)
  const [puzzleXP, setPuzzleXP] = useState(0)
  const [quizXP, setQuizXP] = useState(0)
  const [xp, setXp] = useState(0)

  // Load saved progress on mount
  useEffect(() => {
    if (progressLoaded.current) return
    progressLoaded.current = true
    const load = async () => {
      const saved = await loadProgress(2)
      if (saved && saved.phase && saved.phase !== 'complete') {
        if (saved.xp !== undefined) setXp(saved.xp)
        if (saved.completed_zones) setCompletedZones(saved.completed_zones)
        if (saved.phase !== 'intro') setPhase(saved.phase as GamePhase)
      }
    }
    load()
  }, [loadProgress])

  const handleIntroComplete = () => {
    setPhase('explore')
    saveProgress({ level: 2, phase: 'explore', xp: 0, player_character: playerCharacter, player_name: playerName })
  }

  // Single interaction handler (removed duplicate handleZoneInteract)
  const [teachingTarget, setTeachingTarget] = useState<'viktor' | 'inspector'>('viktor')

  const handleExploreInteract = useCallback((zone: 'viktor' | 'inspector' | 'caseboard') => {
    if (zone === 'viktor' && !completedZones.includes('viktor')) {
      setTeachingTarget('viktor')
      setPhase('teaching')
    } else if (zone === 'inspector' && !completedZones.includes('inspector')) {
      setTeachingTarget('inspector')
      setPhase('teaching')
    } else if (zone === 'caseboard' && completedZones.includes('inspector') && !completedZones.includes('caseboard')) {
      setShowDifficultyPicker(true)
    }
  }, [completedZones])

  const handleTeachingComplete = () => {
    const zone = teachingTarget
    const newZones = [...completedZones, zone]
    const newXp = xp + 15
    setCompletedZones(newZones)
    setXp(newXp)
    setPhase('explore')
    saveProgress({ level: 2, phase: 'explore', xp: newXp, completed_zones: newZones, player_character: playerCharacter, player_name: playerName })
  }

  const handleDifficultySelect = (d: Difficulty2) => {
    setDifficulty(d)
    setShowDifficultyPicker(false)
    setPhase('classify')
    saveProgress({ level: 2, phase: 'classify', xp, completed_zones: completedZones, player_character: playerCharacter, player_name: playerName })
  }

  const handleClassifyComplete = (score: number) => {
    const newZones = [...completedZones, 'caseboard']
    const newXp = xp + score
    setPuzzleXP(score)
    setXp(newXp)
    setCompletedZones(newZones)
    setPhase('quiz')
    saveProgress({ level: 2, phase: 'quiz', xp: newXp, completed_zones: newZones, player_character: playerCharacter, player_name: playerName })
    saveActivityScore({
      level: 2,
      activity_type: 'puzzle',
      score,
      max_score: 100,
      time_spent_seconds: Math.floor((Date.now() - startTime.current) / 1000),
    })
  }

  const handleQuizComplete = (score: number) => {
    const finalXp = xp + score
    setQuizXP(score)
    setXp(finalXp)
    saveProgress({
      level: 2, phase: 'complete', xp: finalXp,
      completed_zones: completedZones, player_character: playerCharacter,
      player_name: playerName, is_completed: true,
    })
    saveActivityScore({
      level: 2,
      activity_type: 'quiz',
      score,
      max_score: 100,
      time_spent_seconds: Math.floor((Date.now() - startTime.current) / 1000),
    })
    setPhase('complete')
  }

  const handleReplay = () => {
    setPhase('intro')
    setCompletedZones([])
    setXp(0)
    setPuzzleXP(0)
    setQuizXP(0)
    setDifficulty(null)
    setShowDifficultyPicker(false)
    startTime.current = Date.now()
  }

  const handleNext = () => {
    window.location.href = '/game/level3'
  }

  const teachingLines = teachingTarget === 'viktor' ? viktorDialogue : teachingDialogues2

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Auth button overlay */}
      <div className="absolute top-4 right-4 z-50">
        <AuthButton compact />
      </div>
      <div style={{ width: WORLD_WIDTH * scale, height: WORLD_HEIGHT * scale, position: 'relative', flexShrink: 0 }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', width: WORLD_WIDTH, height: WORLD_HEIGHT }}>
          <div className="relative" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}>

            {phase !== 'complete' && (
              <div className="relative">
                <Level2World
                  completedZones={completedZones}
                  playerCharacter={playerCharacter}
                  onInteract={handleExploreInteract}
                />
                <div className="absolute inset-0 pointer-events-none">
                  <HUD2 xp={xp} completedZones={completedZones} />
                </div>
              </div>
            )}

            {phase === 'intro' && (
              <div className="absolute inset-0">
                <DialogBox
                  lines={introDialogues2}
                  onComplete={handleIntroComplete}
                  playerCharacter={playerCharacter}
                  playerName={playerName}
                />
              </div>
            )}

            {phase === 'teaching' && (
              <div className="absolute inset-0">
                {teachingTarget === 'inspector' ? (
                  <TeachingDialog
                    lines={teachingLines}
                    onComplete={handleTeachingComplete}
                    playerCharacter={playerCharacter}
                    playerName={playerName}
                  />
                ) : (
                  <DialogBox
                    lines={teachingLines}
                    onComplete={handleTeachingComplete}
                    playerCharacter={playerCharacter}
                    playerName={playerName}
                  />
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Back to hub link */}
      <div className="fixed top-3 left-3 z-30">
        <Link href="/game" className="bg-white border-[2px] border-[#111] rounded-lg px-3 py-1.5 font-bangers text-[#111] text-sm shadow-[2px_2px_0_#111] hover:bg-[#FFE135] transition-colors">
          ← Hub
        </Link>
      </div>

      {showDifficultyPicker && (
        <DifficultyPicker2 onSelect={handleDifficultySelect} />
      )}

      {phase === 'classify' && difficulty && (
        <ClassifyPuzzle difficulty={difficulty} onComplete={handleClassifyComplete} />
      )}

      {phase === 'quiz' && (
        <QuizModal2 onComplete={handleQuizComplete} />
      )}

      {phase === 'complete' && (
        <Level2Complete
          xp={xp}
          puzzleXP={puzzleXP}
          quizXP={quizXP}
          onNext={handleNext}
          onReplay={handleReplay}
        />
      )}

      <ChatBot />
    </div>
  )
}
