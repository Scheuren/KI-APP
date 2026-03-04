'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DialogBox } from '@/components/game/DialogBox'
import { TeachingDialog } from '@/components/game/TeachingDialog'
import { AccuracyChecker } from '@/components/game/AccuracyChecker'
import { OverfitPuzzle } from '@/components/game/OverfitPuzzle'
import { ChatBot } from '@/components/game/ChatBot'
import {
  introDialogues4,
  teachingDialogues4,
  quizQuestions4,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  type QuizQuestion4,
} from '@/lib/game/level4Data'
import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { useGameProgress } from '@/hooks/useGameProgress'

type GamePhase = 'intro' | 'explore' | 'teaching' | 'accuracy' | 'overfit' | 'quiz' | 'complete'
type PlayerCharacter = 'leader' | 'social'

// ─── Quiz ─────────────────────────────────────────────────────────────────────

function QuizModal4({ onComplete }: { onComplete: (xp: number) => void }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])

  const question: QuizQuestion4 = quizQuestions4[current]
  const isLast = current === quizQuestions4.length - 1

  const confirm = () => {
    if (selected === null) return
    const correct = selected === question.correct
    setConfirmed(true)
    if (correct) setScore(s => s + 25)
    setAnswers(a => [...a, correct])
  }

  const next = () => {
    if (isLast) { onComplete(score); return }
    setSelected(null); setConfirmed(false); setCurrent(c => c + 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-lg overflow-hidden">
        <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4 relative overflow-hidden">
          <div className="absolute inset-0 comic-dots opacity-20" />
          <div className="relative flex justify-between items-center">
            <h2 className="font-bangers text-[#111] text-2xl tracking-wider">WISSENS-CHECK</h2>
            <div className="bg-[#111] text-[#FFE135] font-bangers px-3 py-1 rounded-full text-sm">{current + 1} / {quizQuestions4.length}</div>
          </div>
          <div className="mt-2 w-full h-3 bg-white border-[2px] border-[#111] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(current / quizQuestions4.length) * 100}%`, background: '#FF3B3F' }} />
          </div>
        </div>
        <div className="p-5">
          <p className="font-comic text-[#111] font-bold text-base mb-4 leading-relaxed">{question.question}</p>
          <div className="flex flex-col gap-2">
            {question.options.map((option, i) => {
              let bg = 'white'; const border = '#111'; let textCol = '#111'
              if (confirmed) {
                if (i === question.correct) { bg = '#00C853'; textCol = 'white' }
                else if (i === selected) { bg = '#FF3B3F'; textCol = 'white' }
                else { bg = '#F5F5F5'; textCol = '#AAA' }
              } else if (i === selected) { bg = '#0066FF'; textCol = 'white' }
              return (
                <button key={i} onClick={() => !confirmed && setSelected(i)} disabled={confirmed}
                  className="text-left px-4 py-3 rounded-xl border-[2.5px] font-comic text-sm shadow-[2px_2px_0_#111] disabled:shadow-none transition-all"
                  style={{ background: bg, borderColor: border, color: textCol }}>
                  <span className="font-bangers mr-2">{['A', 'B', 'C', 'D'][i]})</span>
                  {option}{confirmed && i === question.correct && ' ✓'}{confirmed && i === selected && i !== question.correct && ' ✗'}
                </button>
              )
            })}
          </div>
          {confirmed && (
            <div className="mt-3 p-3 rounded-xl border-[2.5px] border-[#111] font-comic text-sm leading-relaxed shadow-[2px_2px_0_#111]" style={{ background: selected === question.correct ? '#E8F5E9' : '#FFF3E0' }}>
              <span className="font-bold">{selected === question.correct ? '✅ Richtig! ' : '💡 Erklärung: '}</span>{question.explanation}
            </div>
          )}
        </div>
        <div className="px-5 pb-5 flex justify-between items-center">
          <div className="flex gap-1.5">
            {answers.map((correct, i) => <div key={i} className="w-3 h-3 rounded-full border-[1.5px] border-[#111]" style={{ background: correct ? '#00C853' : '#FF3B3F' }} />)}
            {Array.from({ length: quizQuestions4.length - answers.length }).map((_, i) => <div key={i} className="w-3 h-3 rounded-full border-[1.5px] border-[#111] bg-[#EEE]" />)}
          </div>
          {!confirmed ? (
            <button onClick={confirm} disabled={selected === null} className="comic-btn px-5 py-2 rounded-xl font-bangers text-base disabled:opacity-40" style={{ background: '#FFE135', color: '#111' }}>Antworten!</button>
          ) : (
            <button onClick={next} className="comic-btn px-5 py-2 rounded-xl font-bangers text-base" style={{ background: '#0066FF', color: 'white' }}>
              {isLast ? `Fertig! (+${score} XP)` : 'Nächste →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Level 4 Complete ─────────────────────────────────────────────────────────

function Level4Complete({ puzzleXP, quizXP, onNext, onReplay }: {
  puzzleXP: number; quizXP: number; onNext: () => void; onReplay: () => void
}) {
  const total = puzzleXP + quizXP
  const stars = total >= 150 ? 3 : total >= 100 ? 2 : 1
  const concepts = [
    { term: 'Genauigkeit', desc: 'Anteil korrekter Vorhersagen — Training- und Test-Genauigkeit', icon: '🎯', color: '#0066FF' },
    { term: 'Overfitting', desc: 'Modell lernt Trainingsdaten auswendig, versagt bei neuen Daten', icon: '📉', color: '#FF3B3F' },
    { term: 'Generalisierung', desc: 'Modell funktioniert auch bei Daten, die es nicht kannte', icon: '🌍', color: '#00C853' },
    { term: 'Pruning', desc: 'Baum-Beschneidung: Tiefe begrenzen um Overfitting zu vermeiden', icon: '✂️', color: '#9C27B0' },
    { term: 'Fehlerrate', desc: '100% minus Genauigkeit — Anteil falscher Vorhersagen', icon: '⚠️', color: '#FF9800' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <div className="relative overflow-hidden p-6 text-center border-b-[4px] border-[#111]" style={{ background: '#FFE135' }}>
          <div className="absolute inset-0 comic-dots opacity-20" />
          <div className="relative">
            <div className="text-6xl mb-1">🏆</div>
            <h2 className="font-bangers text-[#111] text-3xl tracking-wider">LEVEL 4 KLAR!</h2>
            <p className="font-comic text-[#555] text-sm mt-1">&quot;Der fehlerhafte Baum&quot; — durchschaut!</p>
            <div className="flex justify-center gap-3 mt-2 text-4xl">
              {[1, 2, 3].map(s => <span key={s} style={{ color: s <= stars ? '#FF9800' : '#DDD', filter: s <= stars ? 'drop-shadow(0 0 6px #FF9800)' : 'none' }}>★</span>)}
            </div>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-bangers text-[#111] text-lg tracking-wide mb-2">PUNKTE-AUSWERTUNG</h3>
          <div className="space-y-2">
            {[
              { label: '📊 Overfitting erkannt', val: puzzleXP, color: '#FF3B3F' },
              { label: '📝 Wissens-Check', val: quizXP, color: '#9C27B0' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between items-center border-[2.5px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
                <span className="font-comic text-[#111] text-sm">{label}</span>
                <span className="font-bangers text-lg" style={{ color }}>+{val} XP</span>
              </div>
            ))}
            <div className="flex justify-between items-center border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111]" style={{ background: '#FFE135' }}>
              <span className="font-bangers text-[#111] text-base">GESAMT</span>
              <span className="font-bangers text-[#FF3B3F] text-2xl">{total} XP</span>
            </div>
          </div>
          <h3 className="font-bangers text-[#111] text-lg tracking-wide mt-4 mb-2">DAS HAST DU GELERNT:</h3>
          <div className="space-y-1.5">
            {concepts.map(c => (
              <div key={c.term} className="flex items-start gap-3 border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg border-[2px] border-[#111] flex-shrink-0 text-lg" style={{ background: c.color }}>{c.icon}</div>
                <div><span className="font-bangers text-sm tracking-wide" style={{ color: c.color }}>{c.term}: </span><span className="font-comic text-[#111] text-xs">{c.desc}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onReplay} className="flex-1 py-3 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all" style={{ background: 'white', color: '#111' }}>↩ Nochmal</button>
          <button onClick={onNext} className="flex-1 py-3 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all" style={{ background: '#9C27B0', color: 'white' }}>Level 5 →</button>
        </div>
      </div>
    </div>
  )
}

// ─── Level 4 World ─────────────────────────────────────────────────────────────

function Level4World({ completedZones, playerCharacter, onInteract }: {
  completedZones: string[]
  playerCharacter: PlayerCharacter
  onInteract: (zone: 'inspector' | 'accuracy' | 'overfit') => void
}) {
  return (
    <div className="relative select-none" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, background: 'linear-gradient(135deg, #1a0a1e 0%, #2d1b33 100%)' }}>
      <svg className="absolute inset-0 opacity-5" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}>
        <defs><pattern id="grid4" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="#9C27B0" strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid4)" />
      </svg>
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div className="bg-[#9C27B0] border-[3px] border-[#111] rounded-xl px-6 py-2 shadow-[4px_4px_0_#111]">
          <p className="font-bangers text-white text-xl tracking-widest">ANALYSE-LABOR — LEVEL 4</p>
        </div>
      </div>

      {/* Inspector */}
      <div className="absolute cursor-pointer" style={{ left: 130, top: 160 }} onClick={() => !completedZones.includes('inspector') && onInteract('inspector')}>
        <div className={`relative flex flex-col items-center transition-all ${completedZones.includes('inspector') ? 'opacity-50' : 'hover:scale-105'}`}>
          <div className="bg-[#FFE135] border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] mb-1 text-center">
            <span className="font-bangers text-[#111] text-xs">INSPECTOR NODE</span>
            <p className="font-comic text-[#555] text-[10px]">Overfitting erklärt</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/game/characters/preview/brain.png" alt="Inspector" style={{ width: 60, height: 80, objectFit: 'contain' }} />
          {!completedZones.includes('inspector') && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFE135] border-[2px] border-[#111] rounded-lg px-2 py-0.5 text-[10px] font-bangers whitespace-nowrap shadow-[2px_2px_0_#111] animate-bounce">[E] Ansprechen</div>}
          {completedZones.includes('inspector') && <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>}
        </div>
      </div>

      {/* Accuracy station */}
      <div className="absolute cursor-pointer" style={{ left: 550, top: 140 }} onClick={() => completedZones.includes('inspector') && !completedZones.includes('accuracy') && onInteract('accuracy')}>
        <div className={`flex flex-col items-center transition-all ${completedZones.includes('accuracy') ? 'opacity-50' : completedZones.includes('inspector') ? 'hover:scale-105' : 'opacity-30 cursor-not-allowed'}`}>
          <div className={`border-[3px] border-[#111] rounded-xl px-4 py-3 shadow-[4px_4px_0_#111] text-center ${completedZones.includes('inspector') ? 'bg-[#0066FF]' : 'bg-slate-700'}`}>
            <p className="font-bangers text-white text-sm tracking-wide">BAUM VERGLEICH</p>
            <p className="font-comic text-white/80 text-[10px] mt-0.5">Baum A vs Baum B</p>
          </div>
          {!completedZones.includes('inspector') && <p className="font-comic text-slate-400 text-[10px] mt-1">Erst Inspector!</p>}
          {!completedZones.includes('accuracy') && completedZones.includes('inspector') && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFE135] border-[2px] border-[#111] rounded-lg px-2 py-0.5 text-[10px] font-bangers whitespace-nowrap shadow-[2px_2px_0_#111] animate-bounce">[E] Analysieren</div>}
          {completedZones.includes('accuracy') && <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>}
        </div>
      </div>

      {/* Overfit puzzle */}
      <div className="absolute cursor-pointer" style={{ left: 550, top: 310 }} onClick={() => completedZones.includes('accuracy') && !completedZones.includes('overfit') && onInteract('overfit')}>
        <div className={`flex flex-col items-center transition-all ${completedZones.includes('overfit') ? 'opacity-50' : completedZones.includes('accuracy') ? 'hover:scale-105' : 'opacity-30 cursor-not-allowed'}`}>
          <div className={`border-[3px] border-[#111] rounded-xl px-4 py-3 shadow-[4px_4px_0_#111] text-center ${completedZones.includes('accuracy') ? 'bg-[#FF3B3F]' : 'bg-slate-700'}`}>
            <p className="font-bangers text-white text-sm tracking-wide">OVERFITTING TEST</p>
            <p className="font-comic text-white/80 text-[10px] mt-0.5">4 Modelle beurteilen</p>
          </div>
          {!completedZones.includes('accuracy') && <p className="font-comic text-slate-400 text-[10px] mt-1">Erst Vergleich!</p>}
          {!completedZones.includes('overfit') && completedZones.includes('accuracy') && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFE135] border-[2px] border-[#111] rounded-lg px-2 py-0.5 text-[10px] font-bangers whitespace-nowrap shadow-[2px_2px_0_#111] animate-bounce">[E] Testen</div>}
          {completedZones.includes('overfit') && <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>}
        </div>
      </div>

      <div className="absolute bottom-12 left-6">
        <div className="flex items-center gap-2 bg-white border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={playerCharacter === 'leader' ? '/game/characters/preview/leader.png' : '/game/characters/preview/leader_w.png'} alt="Player" style={{ width: 32, height: 48, objectFit: 'contain' }} />
          <div><p className="font-bangers text-[#111] text-xs">DU</p><p className="font-comic text-[#666] text-[10px]">KI-Qualitätsprüfer</p></div>
        </div>
      </div>

      <div className="absolute bottom-4 inset-x-0 flex justify-center">
        <div className="flex gap-2">
          {[
            { id: 'inspector', label: '🧠 Inspector', done: completedZones.includes('inspector') },
            { id: 'accuracy', label: '📊 Vergleich', done: completedZones.includes('accuracy') },
            { id: 'overfit', label: '⚠️ Overfitting', done: completedZones.includes('overfit') },
          ].map(z => (
            <div key={z.id} className="px-2 py-1 rounded-lg border-[2px] border-[#111] font-comic text-xs font-bold shadow-[2px_2px_0_#111]"
              style={{ background: z.done ? '#00C853' : 'white', color: z.done ? 'white' : '#888' }}>
              {z.label} {z.done ? '✓' : '○'}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HUD4({ xp, completedZones }: { xp: number; completedZones: string[] }) {
  return (
    <div className="absolute top-0 inset-x-0 z-20 p-2 flex justify-between items-start pointer-events-none">
      <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111]">
        <p className="font-bangers text-[#FF3B3F] text-sm tracking-wider">Level 4 — Der fehlerhafte Baum</p>
        <p className="font-comic text-[#111] text-xs mt-0.5">
          {completedZones.length === 0 && 'Inspector Node befragen'}
          {completedZones.length === 1 && 'Baum A und B vergleichen'}
          {completedZones.length === 2 && 'Overfitting-Test starten'}
          {completedZones.length >= 3 && 'Level abgeschlossen!'}
        </p>
      </div>
      <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] min-w-[140px]">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bangers text-[#FF3B3F] text-sm">⭐ XP</span>
          <span className="font-comic text-[#111] text-xs font-bold">{xp} / 200</span>
        </div>
        <div className="w-full h-3 bg-[#EEE] border-[2px] border-[#111] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((xp / 200) * 100, 100)}%`, background: 'linear-gradient(90deg, #9C27B0, #FF3B3F)' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Level4Page() {
  const [scale, setScale] = useState(1)
  const { saveProgress, loadProgress, saveActivityScore } = useGameProgress()
  const progressLoaded = useRef(false)
  const startTime = useRef<number>(Date.now())

  useEffect(() => {
    const update = () => setScale(Math.min(window.innerWidth / WORLD_WIDTH, window.innerHeight / WORLD_HEIGHT))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const [playerCharacter, setPlayerCharacter] = useState<PlayerCharacter>('leader')
  const [playerName, setPlayerName] = useState('Detektiv')
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
  const [puzzleXP, setPuzzleXP] = useState(0)
  const [quizXP, setQuizXP] = useState(0)
  const [xp, setXp] = useState(0)

  // Load saved progress on mount
  useEffect(() => {
    if (progressLoaded.current) return
    progressLoaded.current = true
    const load = async () => {
      const saved = await loadProgress(4)
      if (saved && saved.phase && saved.phase !== 'complete') {
        if (saved.xp !== undefined) setXp(saved.xp)
        if (saved.completed_zones) setCompletedZones(saved.completed_zones)
        if (saved.phase !== 'intro') setPhase(saved.phase as GamePhase)
      }
    }
    load()
  }, [loadProgress])

  const handleInteract = useCallback((zone: 'inspector' | 'accuracy' | 'overfit') => {
    if (zone === 'inspector' && !completedZones.includes('inspector')) {
      setPhase('teaching')
    } else if (zone === 'accuracy' && completedZones.includes('inspector') && !completedZones.includes('accuracy')) {
      setPhase('accuracy')
    } else if (zone === 'overfit' && completedZones.includes('accuracy') && !completedZones.includes('overfit')) {
      setPhase('overfit')
    }
  }, [completedZones])

  const handleTeachingComplete = () => {
    const newZones = [...completedZones, 'inspector']
    const newXp = xp + 15
    setCompletedZones(newZones)
    setXp(newXp)
    setPhase('explore')
    saveProgress({ level: 4, phase: 'explore', xp: newXp, completed_zones: newZones, player_character: playerCharacter, player_name: playerName })
  }

  const handleAccuracyComplete = () => {
    const newZones = [...completedZones, 'accuracy']
    const newXp = xp + 10
    setCompletedZones(newZones)
    setXp(newXp)
    setPhase('explore')
    saveProgress({ level: 4, phase: 'explore', xp: newXp, completed_zones: newZones, player_character: playerCharacter, player_name: playerName })
    saveActivityScore({ level: 4, activity_type: 'teaching', score: 10, max_score: 10 })
  }

  const handleOverfitComplete = (score: number) => {
    const newZones = [...completedZones, 'overfit']
    const newXp = xp + score
    setPuzzleXP(score)
    setXp(newXp)
    setCompletedZones(newZones)
    setPhase('quiz')
    saveProgress({ level: 4, phase: 'quiz', xp: newXp, completed_zones: newZones, player_character: playerCharacter, player_name: playerName })
    saveActivityScore({
      level: 4,
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
      level: 4, phase: 'complete', xp: finalXp,
      completed_zones: completedZones, player_character: playerCharacter,
      player_name: playerName, is_completed: true,
    })
    saveActivityScore({
      level: 4,
      activity_type: 'quiz',
      score,
      max_score: 100,
      time_spent_seconds: Math.floor((Date.now() - startTime.current) / 1000),
    })
    setPhase('complete')
  }

  const handleReplay = () => {
    setPhase('intro'); setCompletedZones([]); setXp(0); setPuzzleXP(0); setQuizXP(0)
    startTime.current = Date.now()
  }

  const handleNext = () => { window.location.href = '/game/level5' }

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
                <Level4World completedZones={completedZones} playerCharacter={playerCharacter} onInteract={handleInteract} />
                <div className="absolute inset-0 pointer-events-none"><HUD4 xp={xp} completedZones={completedZones} /></div>
              </div>
            )}
            {phase === 'intro' && (
              <div className="absolute inset-0">
                <DialogBox lines={introDialogues4} onComplete={() => {
                  setPhase('explore')
                  saveProgress({ level: 4, phase: 'explore', xp: 0, player_character: playerCharacter, player_name: playerName })
                }} playerCharacter={playerCharacter} playerName={playerName} />
              </div>
            )}
            {phase === 'teaching' && (
              <div className="absolute inset-0">
                <TeachingDialog lines={teachingDialogues4} onComplete={handleTeachingComplete} playerCharacter={playerCharacter} playerName={playerName} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed top-3 left-3 z-30">
        <Link href="/game" className="bg-white border-[2px] border-[#111] rounded-lg px-3 py-1.5 font-bangers text-[#111] text-sm shadow-[2px_2px_0_#111] hover:bg-[#FFE135] transition-colors">← Hub</Link>
      </div>

      {phase === 'accuracy' && <AccuracyChecker onComplete={handleAccuracyComplete} />}
      {phase === 'overfit' && <OverfitPuzzle onComplete={handleOverfitComplete} />}
      {phase === 'quiz' && <QuizModal4 onComplete={handleQuizComplete} />}
      {phase === 'complete' && <Level4Complete puzzleXP={puzzleXP} quizXP={quizXP} onNext={handleNext} onReplay={handleReplay} />}

      <ChatBot />
    </div>
  )
}
