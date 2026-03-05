'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DialogBox } from '@/components/game/DialogBox'
import { TeachingDialog } from '@/components/game/TeachingDialog'
import { TreeBuilderPuzzle } from '@/components/game/TreeBuilderPuzzle'
import { ChatBot } from '@/components/game/ChatBot'
import {
  introDialogues3,
  teachingDialogues3,
  quizQuestions3,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  type QuizQuestion3,
} from '@/lib/game/level3Data'
import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { useGameProgress } from '@/hooks/useGameProgress'

type GamePhase = 'intro' | 'explore' | 'teaching' | 'puzzle' | 'quiz' | 'complete'
type PlayerCharacter = 'leader' | 'social'

// ─── Quiz ─────────────────────────────────────────────────────────────────────

function QuizModal3({ onComplete }: { onComplete: (xp: number) => void }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])

  const question: QuizQuestion3 = quizQuestions3[current]
  const isLast = current === quizQuestions3.length - 1

  const confirm = () => {
    if (selected === null) return
    const correct = selected === question.correct
    setConfirmed(true)
    if (correct) setScore(s => s + 25)
    setAnswers(a => [...a, correct])
  }

  const next = () => {
    if (isLast) {
      // score state already updated in confirm()
      onComplete(score)
      return
    }
    setSelected(null); setConfirmed(false); setCurrent(c => c + 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-lg overflow-hidden">
        <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4 relative overflow-hidden">
          <div className="absolute inset-0 comic-dots opacity-20" />
          <div className="relative flex justify-between items-center">
            <h2 className="font-bangers text-[#111] text-2xl tracking-wider">WISSENS-CHECK</h2>
            <div className="bg-[#111] text-[#FFE135] font-bangers px-3 py-1 rounded-full text-sm">{current + 1} / {quizQuestions3.length}</div>
          </div>
          <div className="mt-2 w-full h-3 bg-white border-[2px] border-[#111] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(current / quizQuestions3.length) * 100}%`, background: '#FF3B3F' }} />
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
                  className="text-left px-4 py-3 rounded-xl border-[2.5px] font-comic text-sm transition-all shadow-[2px_2px_0_#111] disabled:shadow-none"
                  style={{ background: bg, borderColor: border, color: textCol }}>
                  <span className="font-bangers mr-2">{['A', 'B', 'C', 'D'][i]})</span>
                  {option}{confirmed && i === question.correct && ' ✓'}{confirmed && i === selected && i !== question.correct && ' ✗'}
                </button>
              )
            })}
          </div>
          {confirmed && (
            <div className="mt-3 p-3 rounded-xl border-[2.5px] border-[#111] text-sm leading-relaxed font-comic shadow-[2px_2px_0_#111]"
              style={{ background: selected === question.correct ? '#E8F5E9' : '#FFF3E0' }}>
              <span className="font-bold text-[#111]">{selected === question.correct ? '✅ Richtig! ' : '💡 Erklärung: '}</span>
              {question.explanation}
            </div>
          )}
        </div>
        <div className="px-5 pb-5 flex justify-between items-center">
          <div className="flex gap-1.5">
            {answers.map((correct, i) => <div key={i} className="w-3 h-3 rounded-full border-[1.5px] border-[#111]" style={{ background: correct ? '#00C853' : '#FF3B3F' }} />)}
            {Array.from({ length: quizQuestions3.length - answers.length }).map((_, i) => <div key={i} className="w-3 h-3 rounded-full border-[1.5px] border-[#111] bg-[#EEE]" />)}
          </div>
          {!confirmed ? (
            <button onClick={confirm} disabled={selected === null} className="comic-btn px-5 py-2 rounded-xl font-bangers text-base tracking-wide disabled:opacity-40" style={{ background: '#FFE135', color: '#111' }}>Antworten!</button>
          ) : (
            <button onClick={next} className="comic-btn px-5 py-2 rounded-xl font-bangers text-base tracking-wide" style={{ background: '#0066FF', color: 'white' }}>
              {isLast ? `Fertig! (+${score} XP)` : 'Nächste →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Level 3 Complete ─────────────────────────────────────────────────────────

function Level3Complete({ puzzleXP, quizXP, onNext, onReplay }: {
  puzzleXP: number; quizXP: number; onNext: () => void; onReplay: () => void
}) {
  const total = puzzleXP + quizXP
  const stars = total >= 150 ? 3 : total >= 100 ? 2 : 1
  const concepts = [
    { term: 'Trainingsdaten', desc: 'Beispiele mit bekannten Antworten — das Modell lernt daraus', icon: '📚', color: '#0066FF' },
    { term: 'Testdaten', desc: 'Neue Beispiele zum Prüfen des Modells — unbekannt während Training', icon: '🧪', color: '#9C27B0' },
    { term: '80/20 Split', desc: '80% Training, 20% Test — typisches Verhältnis', icon: '✂️', color: '#FF9800' },
    { term: 'Lernalgorithmus', desc: 'Entwickelt Regeln selbst aus Daten — anders als klassische Algorithmen', icon: '🤖', color: '#00C853' },
    { term: 'Gini/Entropie', desc: 'Maße für Unreinheit — helfen beim Wählen des besten Merkmals', icon: '📊', color: '#FF3B3F' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <div className="relative overflow-hidden p-6 text-center border-b-[4px] border-[#111]" style={{ background: '#FFE135' }}>
          <div className="absolute inset-0 comic-dots opacity-20" />
          <div className="relative">
            <div className="text-6xl mb-1">🏆</div>
            <h2 className="font-bangers text-[#111] text-3xl tracking-wider">LEVEL 3 KLAR!</h2>
            <p className="font-comic text-[#555] text-sm mt-1">&quot;Baue deinen eigenen Baum&quot; — geschafft!</p>
            <div className="flex justify-center gap-3 mt-2 text-4xl">
              {[1, 2, 3].map(s => <span key={s} style={{ color: s <= stars ? '#FF9800' : '#DDD', filter: s <= stars ? 'drop-shadow(0 0 6px #FF9800)' : 'none' }}>★</span>)}
            </div>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-bangers text-[#111] text-lg tracking-wide mb-2">PUNKTE-AUSWERTUNG</h3>
          <div className="space-y-2">
            {[
              { label: '🌳 Baum gebaut', val: puzzleXP, color: '#0066FF' },
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
          <button onClick={onNext} className="flex-1 py-3 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all" style={{ background: '#0066FF', color: 'white' }}>Level 4 →</button>
        </div>
      </div>
    </div>
  )
}

// ─── Level 3 World ─────────────────────────────────────────────────────────────

function Level3World({ completedZones, playerCharacter, onInteract }: {
  completedZones: string[]
  playerCharacter: PlayerCharacter
  onInteract: (zone: 'datalab' | 'inspector' | 'builder') => void
}) {
  return (
    <div className="relative select-none" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}>
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/game/backgrounds/ai-lab.svg"
        alt=""
        className="absolute inset-0 pointer-events-none"
        style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, objectFit: 'fill' }}
        draggable={false}
      />

      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div className="bg-[#00C853] border-[3px] border-[#111] rounded-xl px-6 py-2 shadow-[4px_4px_0_#111]">
          <p className="font-bangers text-white text-xl tracking-widest">KI-LABOR — LEVEL 3</p>
        </div>
      </div>

      {/* Data Lab */}
      <div className="absolute cursor-pointer" style={{ left: 130, top: 200 }} onClick={() => !completedZones.includes('datalab') && onInteract('datalab')}>
        <div className={`relative flex flex-col items-center transition-all ${completedZones.includes('datalab') ? 'opacity-50' : 'hover:scale-105'}`}>
          <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] mb-1 text-center">
            <span className="font-bangers text-[#111] text-xs">DATENLABOR</span>
            <p className="font-comic text-[#555] text-[10px]">80/20 Split sortieren</p>
          </div>
          <div className="text-4xl">📊</div>
          {!completedZones.includes('datalab') && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFE135] border-[2px] border-[#111] rounded-lg px-2 py-0.5 text-[10px] font-bangers whitespace-nowrap shadow-[2px_2px_0_#111] animate-bounce">[E] Interagieren</div>}
          {completedZones.includes('datalab') && <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>}
        </div>
      </div>

      {/* Inspector */}
      <div className="absolute cursor-pointer" style={{ left: 570, top: 130 }} onClick={() => !completedZones.includes('inspector') && onInteract('inspector')}>
        <div className={`relative flex flex-col items-center transition-all ${completedZones.includes('inspector') ? 'opacity-50' : 'hover:scale-105'}`}>
          <div className="bg-[#FFE135] border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] mb-1 text-center">
            <span className="font-bangers text-[#111] text-xs">INSPECTOR NODE</span>
            <p className="font-comic text-[#555] text-[10px]">Theorie: Training vs. Test</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/game/characters/preview/brain.png" alt="Inspector" style={{ width: 60, height: 80, objectFit: 'contain' }} />
          {!completedZones.includes('inspector') && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFE135] border-[2px] border-[#111] rounded-lg px-2 py-0.5 text-[10px] font-bangers whitespace-nowrap shadow-[2px_2px_0_#111] animate-bounce">[E] Ansprechen</div>}
          {completedZones.includes('inspector') && <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>}
        </div>
      </div>

      {/* Builder */}
      <div className="absolute cursor-pointer" style={{ left: 570, top: 330 }} onClick={() => completedZones.includes('inspector') && completedZones.includes('datalab') && !completedZones.includes('builder') && onInteract('builder')}>
        <div className={`flex flex-col items-center transition-all ${completedZones.includes('builder') ? 'opacity-50' : (completedZones.includes('inspector') && completedZones.includes('datalab')) ? 'hover:scale-105' : 'opacity-30 cursor-not-allowed'}`}>
          <div className={`border-[3px] border-[#111] rounded-xl px-4 py-3 shadow-[4px_4px_0_#111] text-center ${(completedZones.includes('inspector') && completedZones.includes('datalab')) ? 'bg-[#00C853]' : 'bg-slate-700'}`}>
            <p className="font-bangers text-white text-sm tracking-wide">BAUM-BAUKASTEN</p>
            <p className="font-comic text-white/80 text-[10px] mt-0.5">Eigenen Baum erstellen</p>
          </div>
          {!(completedZones.includes('inspector') && completedZones.includes('datalab')) && (
            <p className="font-comic text-slate-400 text-[10px] mt-1">Erst Daten + Inspector!</p>
          )}
          {completedZones.includes('builder') && <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>}
        </div>
      </div>

      <div className="absolute bottom-12 left-6">
        <div className="flex items-center gap-2 bg-white border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={playerCharacter === 'leader' ? '/game/characters/preview/leader.png' : '/game/characters/preview/leader_w.png'} alt="Player" style={{ width: 32, height: 48, objectFit: 'contain' }} />
          <div><p className="font-bangers text-[#111] text-xs">DU</p><p className="font-comic text-[#666] text-[10px]">KI-Forscher</p></div>
        </div>
      </div>

      <div className="absolute bottom-4 inset-x-0 flex justify-center">
        <div className="flex gap-2">
          {[
            { id: 'datalab', label: '📊 Daten', done: completedZones.includes('datalab') },
            { id: 'inspector', label: '🧠 Inspector', done: completedZones.includes('inspector') },
            { id: 'builder', label: '🌳 Baum bauen', done: completedZones.includes('builder') },
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

// ─── HUD 3 ────────────────────────────────────────────────────────────────────

function HUD3({ xp, completedZones }: { xp: number; completedZones: string[] }) {
  return (
    <div className="absolute top-0 inset-x-0 z-20 p-2 flex justify-between items-start pointer-events-none">
      <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111]">
        <p className="font-bangers text-[#FF3B3F] text-sm tracking-wider">Level 3 — Baue deinen eigenen Baum</p>
        <p className="font-comic text-[#111] text-xs mt-0.5">
          {completedZones.length === 0 && 'Sortiere Daten & befrage Inspector Node'}
          {completedZones.length === 1 && 'Noch eine Station besuchen'}
          {completedZones.length === 2 && 'Starte den Baum-Baukasten!'}
          {completedZones.length >= 3 && 'Level abgeschlossen!'}
        </p>
      </div>
      <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] min-w-[140px]">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bangers text-[#FF3B3F] text-sm">⭐ XP</span>
          <span className="font-comic text-[#111] text-xs font-bold">{xp} / 200</span>
        </div>
        <div className="w-full h-3 bg-[#EEE] border-[2px] border-[#111] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((xp / 200) * 100, 100)}%`, background: 'linear-gradient(90deg, #00C853, #0066FF)' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Level3Page() {
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
  const [teachingTarget, setTeachingTarget] = useState<'datalab' | 'inspector'>('inspector')
  const [puzzleXP, setPuzzleXP] = useState(0)
  const [quizXP, setQuizXP] = useState(0)
  const [xp, setXp] = useState(0)

  // Load saved progress on mount
  useEffect(() => {
    if (progressLoaded.current) return
    progressLoaded.current = true
    const load = async () => {
      const saved = await loadProgress(3)
      if (saved && saved.phase && saved.phase !== 'complete') {
        if (saved.xp !== undefined) setXp(saved.xp)
        if (saved.completed_zones) setCompletedZones(saved.completed_zones)
        if (saved.phase !== 'intro') setPhase(saved.phase as GamePhase)
      }
    }
    load()
  }, [loadProgress])

  const handleInteract = useCallback((zone: 'datalab' | 'inspector' | 'builder') => {
    if (zone === 'datalab' && !completedZones.includes('datalab')) {
      setTeachingTarget('datalab')
      setPhase('puzzle')
    } else if (zone === 'inspector' && !completedZones.includes('inspector')) {
      setTeachingTarget('inspector')
      setPhase('teaching')
    } else if (
      zone === 'builder' &&
      !completedZones.includes('builder') &&
      completedZones.includes('datalab') &&
      completedZones.includes('inspector')
    ) {
      // Both prerequisites met — start the builder puzzle
      setTeachingTarget('inspector') // builder uses inspector context
      setPhase('puzzle')
    }
  }, [completedZones])

  const handleTeachingComplete = () => {
    const newZones = [...completedZones, 'inspector']
    const newXp = xp + 15
    setCompletedZones(newZones)
    setXp(newXp)
    setPhase('explore')
    saveProgress({ level: 3, phase: 'explore', xp: newXp, completed_zones: newZones, player_character: playerCharacter, player_name: playerName })
  }

  const handlePuzzleComplete = (score: number) => {
    if (!completedZones.includes('datalab')) {
      const newZones = [...completedZones, 'datalab']
      const newXp = xp + 10
      setCompletedZones(newZones)
      setXp(newXp)
      setPhase('explore')
      saveProgress({ level: 3, phase: 'explore', xp: newXp, completed_zones: newZones, player_character: playerCharacter, player_name: playerName })
    } else {
      const newZones = [...completedZones, 'builder']
      const newXp = xp + score
      setPuzzleXP(score)
      setXp(newXp)
      setCompletedZones(newZones)
      setPhase('quiz')
      saveProgress({ level: 3, phase: 'quiz', xp: newXp, completed_zones: newZones, player_character: playerCharacter, player_name: playerName })
      saveActivityScore({
        level: 3,
        activity_type: 'puzzle',
        score,
        max_score: 100,
        time_spent_seconds: Math.floor((Date.now() - startTime.current) / 1000),
      })
    }
  }

  const handleQuizComplete = (score: number) => {
    const finalXp = xp + score
    setQuizXP(score)
    setXp(finalXp)
    saveProgress({
      level: 3, phase: 'complete', xp: finalXp,
      completed_zones: completedZones, player_character: playerCharacter,
      player_name: playerName, is_completed: true,
    })
    saveActivityScore({
      level: 3,
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
    setXp(0); setPuzzleXP(0); setQuizXP(0)
    startTime.current = Date.now()
  }

  const handleNext = () => { window.location.href = '/game/level4' }

  const isPuzzleForDatalab = phase === 'puzzle' && !completedZones.includes('datalab')
  const isPuzzleForBuilder = phase === 'puzzle' && completedZones.includes('datalab') && completedZones.includes('inspector')

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
                <Level3World completedZones={completedZones} playerCharacter={playerCharacter} onInteract={handleInteract} />
                <div className="absolute inset-0 pointer-events-none"><HUD3 xp={xp} completedZones={completedZones} /></div>
              </div>
            )}
            {phase === 'intro' && (
              <div className="absolute inset-0">
                <DialogBox lines={introDialogues3} onComplete={() => setPhase('explore')} playerCharacter={playerCharacter} playerName={playerName} />
              </div>
            )}
            {phase === 'teaching' && (
              <div className="absolute inset-0">
                <TeachingDialog lines={teachingDialogues3} onComplete={handleTeachingComplete} playerCharacter={playerCharacter} playerName={playerName} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed top-3 left-3 z-30">
        <Link href="/game" className="bg-white border-[2px] border-[#111] rounded-lg px-3 py-1.5 font-bangers text-[#111] text-sm shadow-[2px_2px_0_#111] hover:bg-[#FFE135] transition-colors">← Hub</Link>
      </div>

      {(isPuzzleForDatalab || isPuzzleForBuilder) && (
        <TreeBuilderPuzzle onComplete={handlePuzzleComplete} />
      )}

      {phase === 'quiz' && <QuizModal3 onComplete={handleQuizComplete} />}

      {phase === 'complete' && (
        <Level3Complete puzzleXP={puzzleXP} quizXP={quizXP} onNext={handleNext} onReplay={handleReplay} />
      )}

      <ChatBot />
    </div>
  )
}
