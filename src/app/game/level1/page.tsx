'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { GameWorld } from '@/components/game/GameWorld'
import { DialogBox } from '@/components/game/DialogBox'
import { VideoModal } from '@/components/game/VideoModal'
import { DecisionTreePuzzle } from '@/components/game/DecisionTreePuzzle'
import { QuizModal } from '@/components/game/QuizModal'
import { LevelComplete } from '@/components/game/LevelComplete'
import { ChatBot } from '@/components/game/ChatBot'
import { HUD } from '@/components/game/HUD'
import { TermsMatchingGame } from '@/components/game/TermsMatchingGame'
import { FillInTheBlank } from '@/components/game/FillInTheBlank'
import { TeachingDialog } from '@/components/game/TeachingDialog'
import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { useGameProgress } from '@/hooks/useGameProgress'
import {
  introDialogues,
  monitorDialogues,
  teachingDialogues,
  type Difficulty,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from '@/lib/game/level1Data'

type GamePhase =
  | 'characterSelect' // Choose player character
  | 'intro'           // Opening dialogue
  | 'explore'         // Free movement in office
  | 'video'           // Watching the learning video
  | 'postVideo'       // Brief dialogue after video
  | 'teaching'        // Inspector Node explains tree concepts
  | 'termsMatch'      // Begriffe-Matching Minigame
  | 'puzzle'          // Classify suspects
  | 'quiz'            // Knowledge check
  | 'fillBlank'       // FillInTheBlank Minigame (Fachbegriffe vertiefen)
  | 'complete'        // Level complete

type PlayerCharacter = 'leader' | 'social'

type DifficultySelect = {
  chosen: boolean
  level: Difficulty
}

export default function Level1Page() {
  const [scale, setScale] = useState(1)
  const { saveProgress, loadProgress, saveActivityScore, getRecommendedDifficulty } = useGameProgress()
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

  const [phase, setPhase] = useState<GamePhase>('characterSelect')
  const [playerCharacter, setPlayerCharacter] = useState<PlayerCharacter>('leader')
  const [playerName, setPlayerName] = useState<string>('')
  const [completedZones, setCompletedZones] = useState<string[]>([])
  const [difficultyState, setDifficultyState] = useState<DifficultySelect>({
    chosen: false,
    level: 'standard',
  })
  const [puzzleXP, setPuzzleXP] = useState(0)
  const [quizXP, setQuizXP] = useState(0)
  const [xp, setXp] = useState(0)

  // Load saved progress on mount
  useEffect(() => {
    if (progressLoaded.current) return
    progressLoaded.current = true

    const load = async () => {
      const saved = await loadProgress(1)
      if (saved && saved.phase && saved.phase !== 'complete') {
        // Restore saved state
        if (saved.player_character) setPlayerCharacter(saved.player_character)
        if (saved.player_name) setPlayerName(saved.player_name)
        if (saved.completed_zones) setCompletedZones(saved.completed_zones)
        if (saved.xp !== undefined) setXp(saved.xp)
        if (saved.difficulty) {
          setDifficultyState({
            chosen: true,
            level: saved.difficulty,
          })
        }
        // Only restore phase if not characterSelect (let player re-pick if fresh)
        if (saved.phase !== 'characterSelect') {
          setPhase(saved.phase as GamePhase)
        }
      } else if (!saved) {
        // New player — suggest adaptive difficulty for level 1
        // (no previous level, so always 'standard' for level 1)
        const recommended = await getRecommendedDifficulty(1)
        setDifficultyState((prev) => ({ ...prev, level: recommended }))
      }
    }

    load()
  }, [loadProgress, getRecommendedDifficulty])

  const objective = {
    characterSelect: '',
    intro: 'Hör dir die Einführung an...',
    explore: 'Erkunde das Büro — besuche alle 3 Stationen',
    video: 'Schau das Lernvideo',
    postVideo: 'Gut gemacht! Weiter zum Inspector...',
    teaching: 'Lerne die Begriffe des Entscheidungsbaums',
    termsMatch: 'Ordne die Begriffe zu!',
    puzzle: 'Klassifiziere die Verdächtigen!',
    quiz: 'Beantworte die Fragen',
    fillBlank: 'Fülle die Lücken aus!',
    complete: 'Level abgeschlossen!',
  }[phase]

  // Save progress whenever important state changes
  const persistProgress = useCallback(
    (newPhase: GamePhase, newXp: number, newZones: string[], char?: PlayerCharacter, name?: string, diff?: Difficulty) => {
      saveProgress({
        level: 1,
        phase: newPhase,
        xp: newXp,
        max_xp: 200,
        completed_zones: newZones,
        difficulty: diff ?? (difficultyState.chosen ? difficultyState.level : null),
        player_character: char ?? playerCharacter,
        player_name: name ?? playerName,
        is_completed: newPhase === 'complete',
      })
    },
    [saveProgress, difficultyState, playerCharacter, playerName]
  )

  const handleZoneInteract = useCallback(
    (zoneId: 'monitor' | 'inspector' | 'caseboard') => {
      if (zoneId === 'monitor' && !completedZones.includes('monitor')) {
        setPhase('video')
        persistProgress('video', xp, completedZones)
      } else if (zoneId === 'inspector' && completedZones.includes('monitor') && !completedZones.includes('inspector')) {
        setPhase('teaching')
        persistProgress('teaching', xp, completedZones)
      } else if (zoneId === 'caseboard' && completedZones.includes('inspector') && !completedZones.includes('caseboard')) {
        if (!difficultyState.chosen) {
          return
        }
        setPhase('puzzle')
        persistProgress('puzzle', xp, completedZones)
      }
    },
    [completedZones, difficultyState.chosen, xp, persistProgress]
  )

  const handleCharacterSelect = (char: PlayerCharacter, name: string) => {
    setPlayerCharacter(char)
    setPlayerName(name)
    // Persist to shared localStorage keys so later levels can read character/name
    if (typeof window !== 'undefined') {
      localStorage.setItem('mks_player_character', char)
      localStorage.setItem('mks_player_name', name)
    }
    setPhase('intro')
    persistProgress('intro', xp, completedZones, char, name)
  }

  const handleIntroComplete = () => {
    setPhase('explore')
    persistProgress('explore', xp, completedZones)
  }

  const handleVideoComplete = () => {
    const newZones = [...completedZones, 'monitor']
    const newXp = xp + 10
    setCompletedZones(newZones)
    setXp(newXp)
    setPhase('postVideo')
    persistProgress('postVideo', newXp, newZones)

    // Save activity score for video
    saveActivityScore({
      level: 1,
      activity_type: 'teaching',
      score: 10,
      max_score: 10,
      time_spent_seconds: Math.floor((Date.now() - startTime.current) / 1000),
    })
  }

  const handlePostVideoComplete = () => {
    setPhase('explore')
    persistProgress('explore', xp, completedZones)
  }

  const handleTeachingComplete = () => {
    setPhase('termsMatch')
    persistProgress('termsMatch', xp, completedZones)
  }

  const handleTermsMatchComplete = (matchXP: number) => {
    const newZones = [...completedZones, 'inspector']
    const newXp = xp + 15 + matchXP
    setCompletedZones(newZones)
    setXp(newXp)
    setPhase('explore')
    persistProgress('explore', newXp, newZones)

    saveActivityScore({
      level: 1,
      activity_type: 'terms_match',
      score: matchXP,
      max_score: 50,
      difficulty: difficultyState.level,
    })
  }

  const handlePuzzleComplete = (score: number) => {
    setPuzzleXP(score)
    const newZones = [...completedZones, 'caseboard']
    const newXp = xp + score
    setXp(newXp)
    setCompletedZones(newZones)
    setPhase('quiz')
    persistProgress('quiz', newXp, newZones)

    saveActivityScore({
      level: 1,
      activity_type: 'puzzle',
      score,
      max_score: 100,
      difficulty: difficultyState.level,
      time_spent_seconds: Math.floor((Date.now() - startTime.current) / 1000),
    })
  }

  const handleQuizComplete = (score: number) => {
    setQuizXP(score)
    const newXp = xp + score
    setXp(newXp)
    // After quiz → FillInTheBlank Vertiefung
    setPhase('fillBlank')
    persistProgress('fillBlank', newXp, completedZones)

    saveActivityScore({
      level: 1,
      activity_type: 'quiz',
      score,
      max_score: 100,
      difficulty: difficultyState.level,
      time_spent_seconds: Math.floor((Date.now() - startTime.current) / 1000),
      analytics: [
        { concept: 'wurzel', understood: score >= 80 },
        { concept: 'knoten', understood: score >= 60 },
        { concept: 'kante', understood: score >= 50 },
        { concept: 'blatt', understood: score >= 70 },
      ],
    })
  }

  const handleFillBlankComplete = (fillXP: number) => {
    const finalXp = xp + fillXP
    setXp(finalXp)
    setPhase('complete')
    persistProgress('complete', finalXp, completedZones)
    saveActivityScore({ level: 1, activity_type: 'terms_match', score: fillXP, max_score: 90 })
  }

  const handleReplay = () => {
    // Reset local state only — keep DB record (don't delete progress)
    setPhase('characterSelect')
    setCompletedZones([])
    setXp(0)
    setPuzzleXP(0)
    setQuizXP(0)
    setPlayerName('')
    setDifficultyState({ chosen: false, level: 'standard' })
    startTime.current = Date.now()
  }

  // Case board interaction: show difficulty picker first
  const needsDifficultyPick =
    phase === 'explore' &&
    completedZones.includes('inspector') &&
    !completedZones.includes('caseboard') &&
    !difficultyState.chosen

  const movementEnabled = phase === 'explore'

  // Character select — full screen, outside the game world scaling
  if (phase === 'characterSelect') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-start justify-center overflow-hidden">
        {/* Auth button top right */}
        <div className="absolute top-4 right-4 z-50">
          <AuthButton compact />
        </div>
        <CharacterSelectScreen onSelect={handleCharacterSelect} />
        <ChatBot />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-start justify-center overflow-hidden">
      {/* Auth button overlay */}
      <div className="absolute top-4 right-4 z-50">
        <AuthButton compact />
      </div>

      {/* Back to hub link */}
      <div className="fixed top-3 left-3 z-30">
        <Link href="/game" className="bg-white border-[2px] border-[#111] rounded-lg px-3 py-1.5 font-bangers text-[#111] text-sm shadow-[2px_2px_0_#111] hover:bg-[#FFE135] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE135]">
          ← Hub
        </Link>
      </div>

      {/* Vollbild-Wrapper — skaliert die 900×500 Spielwelt auf den ganzen Bildschirm */}
      <div style={{ width: WORLD_WIDTH * scale, height: WORLD_HEIGHT * scale, position: 'relative', flexShrink: 0 }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', width: WORLD_WIDTH, height: WORLD_HEIGHT }}>

          {/* Game container */}
          <div className="relative" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}>

            {/* HUD overlay */}
            {phase !== 'complete' && (
              <div className="relative">
                <GameWorld
                  onInteract={handleZoneInteract}
                  completedZones={completedZones}
                  movementEnabled={movementEnabled}
                  playerCharacter={playerCharacter}
                />
                <div className="absolute inset-0 pointer-events-none">
                  <HUD
                    levelName="Level 1 — Der Fall der verwirrten Daten"
                    objective={objective ?? ''}
                    xp={xp}
                    maxXP={200}
                    completedZones={completedZones}
                  />
                </div>
              </div>
            )}

            {/* Intro dialogue */}
            {phase === 'intro' && (
              <div className="absolute inset-0">
                <DialogBox lines={introDialogues} onComplete={handleIntroComplete} playerCharacter={playerCharacter} playerName={playerName} />
              </div>
            )}

            {/* Post-video dialogue */}
            {phase === 'postVideo' && (
              <div className="absolute inset-0">
                <DialogBox lines={monitorDialogues} onComplete={handlePostVideoComplete} playerCharacter={playerCharacter} playerName={playerName} />
              </div>
            )}

            {/* Teaching dialogue — with annotated tree visual */}
            {phase === 'teaching' && (
              <div className="absolute inset-0">
                <TeachingDialog lines={teachingDialogues} onComplete={handleTeachingComplete} playerCharacter={playerCharacter} playerName={playerName} />
              </div>
            )}

            {/* Difficulty picker */}
            {needsDifficultyPick && (
              <div className="absolute inset-0 flex items-end justify-center pb-24 z-30">
                <DifficultyPicker
                  defaultLevel={difficultyState.level}
                  onSelect={(level) => {
                    setDifficultyState({ chosen: true, level })
                    setPhase('puzzle')
                    persistProgress('puzzle', xp, completedZones, undefined, undefined, level)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen modals */}
      {phase === 'video' && <VideoModal onComplete={handleVideoComplete} />}

      {phase === 'termsMatch' && <TermsMatchingGame onComplete={handleTermsMatchComplete} />}

      {phase === 'puzzle' && (
        <DecisionTreePuzzle
          difficulty={difficultyState.level}
          onComplete={handlePuzzleComplete}
        />
      )}

      {phase === 'quiz' && <QuizModal onComplete={handleQuizComplete} />}

      {phase === 'fillBlank' && <FillInTheBlank onComplete={handleFillBlankComplete} />}

      {phase === 'complete' && (
        <LevelComplete
          xp={xp}
          puzzleXP={puzzleXP}
          quizXP={quizXP}
          onNext={() => { window.location.href = '/game/level2' }}
          onReplay={handleReplay}
        />
      )}

      {/* Chatbot — always visible */}
      <ChatBot />
    </div>
  )
}

// ── Character Select Screen ────────────────────────────────────────────────────

const CHARACTERS = [
  {
    id: 'leader' as PlayerCharacter,
    src: '/game/characters/preview/leader.png',
    name: 'DER ANFÜHRER',
    role: 'Analytisch · entschlossen',
    desc: 'Denkt immer einen Schritt voraus. Perfekt für alle, die Fakten lieben.',
    color: '#0066FF',
    star: '⚡',
  },
  {
    id: 'social' as PlayerCharacter,
    src: '/game/characters/preview/leader_w.png',
    name: 'DIE SOZIALE',
    role: 'Einfühlsam · kommunikativ',
    desc: 'Ein Gespür für Details und Menschen. Ideal für Teamplayer.',
    color: '#FF3B9A',
    star: '💫',
  },
]

function CharacterSelectScreen({ onSelect }: { onSelect: (char: PlayerCharacter, name: string) => void }) {
  const [names, setNames] = useState<Record<PlayerCharacter, string>>({ leader: '', social: '' })
  const [hovered, setHovered] = useState<PlayerCharacter | null>(null)

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-block bg-[#FFE135] border-[4px] border-[#111] rounded-2xl px-8 py-3 shadow-[6px_6px_0_#111] mb-3">
          <h1 className="font-bangers text-[#111] text-4xl tracking-widest">WER BIST DU?</h1>
        </div>
        <p className="font-comic text-slate-300 text-sm">Wähle deinen Detektiv und gib deinen Namen ein</p>
      </div>

      {/* Character cards */}
      <div className="flex gap-6 flex-wrap justify-center">
        {CHARACTERS.map((char) => (
          <div
            key={char.id}
            className="relative flex flex-col items-center bg-white border-[4px] border-[#111] rounded-2xl
                       shadow-[6px_6px_0_#111] transition-all w-56 overflow-hidden"
            style={{ transform: hovered === char.id ? 'translateY(-8px)' : undefined }}
            onMouseEnter={() => setHovered(char.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Color header strip */}
            <div
              className="w-full pt-4 pb-2 flex flex-col items-center"
              style={{ background: char.color }}
            >
              <div className="font-bangers text-white text-xs tracking-widest mb-1 opacity-80">{char.star} {char.name}</div>
              {/* Character image */}
              <div className="w-28 h-40 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={char.src}
                  alt={char.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top center' }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="w-full p-4 text-center">
              <div className="font-bangers text-[#111] text-sm tracking-wide mb-1 opacity-60">{char.role}</div>
              <p className="font-comic text-[#555] text-xs leading-relaxed mb-3">{char.desc}</p>

              {/* Name input */}
              <input
                type="text"
                placeholder="Dein Name..."
                value={names[char.id]}
                onChange={(e) => setNames(prev => ({ ...prev, [char.id]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter' && names[char.id].trim()) onSelect(char.id, names[char.id].trim()) }}
                className="w-full px-3 py-1.5 mb-2 border-[2px] border-[#111] rounded-lg font-comic
                           text-sm text-[#111] focus:outline-none placeholder:text-[#aaa]"
                maxLength={20}
              />

              <div
                onClick={() => { if (names[char.id].trim()) onSelect(char.id, names[char.id].trim()) }}
                className={`font-bangers text-white text-sm tracking-wide px-4 py-2 rounded-xl
                           border-[2.5px] border-[#111] shadow-[2px_2px_0_#111] transition-all select-none
                           ${names[char.id].trim() ? 'cursor-pointer hover:opacity-90 active:shadow-none active:translate-x-[2px] active:translate-y-[2px]' : 'opacity-40 cursor-not-allowed'}`}
                style={{ background: names[char.id].trim() ? char.color : '#888' }}
              >
                Spielen →
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="font-comic text-slate-500 text-xs mt-6">Team MKS — Detektiv-Agentur</p>
    </div>
  )
}

// ── Difficulty Picker ──────────────────────────────────────────────────────────

function DifficultyPicker({ onSelect, defaultLevel }: { onSelect: (d: Difficulty) => void; defaultLevel: Difficulty }) {
  return (
    <div className="bg-slate-900/95 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl backdrop-blur-sm max-w-sm w-full mx-4">
      <h3 className="text-amber-400 font-bold text-center mb-1">Wähle dein Niveau</h3>
      <p className="text-slate-400 text-xs text-center mb-4">
        Empfehlung: <span className="text-amber-400 capitalize">{defaultLevel}</span> — Du kannst wechseln
      </p>
      <div className="flex flex-col gap-2">
        {(
          [
            {
              level: 'basis' as Difficulty,
              label: '⭐ Basis',
              desc: '2 Merkmale, Baum komplett vorgegeben',
              color: 'border-green-600 hover:bg-green-900/30',
            },
            {
              level: 'standard' as Difficulty,
              label: '⭐⭐ Standard',
              desc: '3 Merkmale, eine Lücke ausfüllen',
              color: 'border-amber-600 hover:bg-amber-900/30',
            },
            {
              level: 'experten' as Difficulty,
              label: '⭐⭐⭐ Experten',
              desc: '4 Merkmale + Fehler im Baum finden',
              color: 'border-purple-600 hover:bg-purple-900/30',
            },
          ] as const
        ).map(({ level, label, desc, color }) => (
          <button
            key={level}
            onClick={() => onSelect(level)}
            className={`text-left px-4 py-3 border-2 rounded-xl text-white transition-all ${color} ${
              level === defaultLevel ? 'ring-2 ring-amber-400/50' : ''
            }`}
          >
            <div className="font-bold text-sm">{label} {level === defaultLevel ? '← Empfohlen' : ''}</div>
            <div className="text-slate-400 text-xs">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
