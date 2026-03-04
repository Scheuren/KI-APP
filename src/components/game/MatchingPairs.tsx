'use client'

import { useState, useEffect, useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Pair = {
  id: string
  term: string
  definition: string
  color: string
  emoji: string
}

type CardFace = 'term' | 'definition'

type Card = {
  pairId: string
  face: CardFace
  uniqueKey: string
}

type Props = {
  onComplete: (xp: number) => void
}

// ─── Game Data ────────────────────────────────────────────────────────────────

const PAIRS: Pair[] = [
  {
    id: 'wurzel',
    term: 'Wurzel',
    definition: 'Oberster Knoten — die erste Frage im Baum',
    color: '#FF3B3F',
    emoji: '🌱',
  },
  {
    id: 'knoten',
    term: 'Knoten',
    definition: 'Verzweigungspunkt mit einer Ja/Nein-Frage',
    color: '#0066FF',
    emoji: '⭕',
  },
  {
    id: 'blatt',
    term: 'Blatt',
    definition: 'Endpunkt mit dem Klassifikationsergebnis',
    color: '#00C853',
    emoji: '🍃',
  },
  {
    id: 'kante',
    term: 'Kante',
    definition: 'Verbindung zwischen zwei Knoten (Ja/Nein-Pfad)',
    color: '#9C27B0',
    emoji: '➡️',
  },
  {
    id: 'klassifikation',
    term: 'Klassifikation',
    definition: 'Einteilung von Objekten anhand ihrer Merkmale',
    color: '#FF9800',
    emoji: '🗂️',
  },
  {
    id: 'merkmal',
    term: 'Merkmal',
    definition: 'Eigenschaft eines Objekts (z.B. Hut: Ja/Nein)',
    color: '#E91E63',
    emoji: '🔍',
  },
]

const BONUS_TIME = 60  // seconds for bonus
const BASE_XP = 60
const BONUS_XP = 30
const PENALTY_PER_MISTAKE = 3

// ─── Shuffle helper ───────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// ─── Card Component ───────────────────────────────────────────────────────────

function PairCard({
  card,
  pair,
  isSelected,
  isMatched,
  isWrong,
  onClick,
}: {
  card: Card
  pair: Pair
  isSelected: boolean
  isMatched: boolean
  isWrong: boolean
  onClick: () => void
}) {
  const isTerm = card.face === 'term'

  let bg = 'white'
  let borderColor = '#111'
  let shadow = '2px_2px_0_#111'
  let textColor = '#111'

  if (isMatched) {
    bg = '#E8F5E9'
    borderColor = '#00C853'
    shadow = 'none'
  } else if (isWrong) {
    bg = '#FFEBEE'
    borderColor = '#FF3B3F'
  } else if (isSelected) {
    bg = pair.color
    borderColor = pair.color
    textColor = 'white'
    shadow = '3px_3px_0_#111'
  }

  return (
    <button
      onClick={onClick}
      disabled={isMatched}
      className="w-full text-left px-3 py-2.5 rounded-xl border-[2.5px] font-[family-name:var(--font-comic)] text-xs leading-snug transition-all active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-default"
      style={{
        background: bg,
        borderColor,
        boxShadow: shadow !== 'none' ? `${shadow.replace(/_/g, ' ')}` : 'none',
        color: textColor,
        minHeight: 52,
      }}
    >
      {isMatched && <span className="text-[#00C853] mr-1 font-bold">✓</span>}
      {isWrong && <span className="text-[#FF3B3F] mr-1 font-bold">✗</span>}
      {isTerm ? (
        <span className="font-[family-name:var(--font-bangers)] text-sm tracking-wide">
          {pair.emoji} {pair.term}
        </span>
      ) : (
        <span>{pair.definition}</span>
      )}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MatchingPairs({ onComplete }: Props) {
  const termCards: Card[] = useMemo(() =>
    shuffle(PAIRS.map(p => ({ pairId: p.id, face: 'term' as CardFace, uniqueKey: `term-${p.id}` }))),
  [])
  const defCards: Card[] = useMemo(() =>
    shuffle(PAIRS.map(p => ({ pairId: p.id, face: 'definition' as CardFace, uniqueKey: `def-${p.id}` }))),
  [])

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<{ term: string; def: string } | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [timeLeft, setTimeLeft] = useState(BONUS_TIME)
  const [timerStarted, setTimerStarted] = useState(false)
  const [phase, setPhase] = useState<'playing' | 'done'>('playing')

  // Timer
  useEffect(() => {
    if (!timerStarted || phase === 'done') return
    if (timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [timerStarted, timeLeft, phase])

  const handleTermClick = (pairId: string) => {
    if (matched.has(pairId) || wrongPair) return
    if (!timerStarted) setTimerStarted(true)
    setSelectedTerm(prev => prev === pairId ? null : pairId)
  }

  const handleDefClick = (pairId: string) => {
    if (!selectedTerm || matched.has(pairId) || wrongPair) return

    if (selectedTerm === pairId) {
      // Correct match
      const next = new Set(matched)
      next.add(pairId)
      setMatched(next)
      setSelectedTerm(null)

      if (next.size === PAIRS.length) {
        setTimeout(() => setPhase('done'), 500)
      }
    } else {
      // Wrong match
      setMistakes(m => m + 1)
      setWrongPair({ term: selectedTerm, def: pairId })
      setTimeout(() => {
        setWrongPair(null)
        setSelectedTerm(null)
      }, 900)
    }
  }

  const bonusEarned = timeLeft > 0 && phase === 'done'
  const xpEarned = Math.max(10, BASE_XP - mistakes * PENALTY_PER_MISTAKE + (bonusEarned ? BONUS_XP : 0))

  const timerPercent = (timeLeft / BONUS_TIME) * 100
  const timerColor = timeLeft > 30 ? '#00C853' : timeLeft > 10 ? '#FF9800' : '#FF3B3F'

  if (phase === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-md overflow-hidden">
          <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4 text-center">
            <div className="text-5xl mb-2">{bonusEarned ? '🌟' : '🎉'}</div>
            <h2 className="font-[family-name:var(--font-bangers)] text-[#111] text-2xl tracking-wider">
              ALLE PAARE GEFUNDEN!
            </h2>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {PAIRS.map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-[2px] border-[#111] shadow-[2px_2px_0_#111] font-[family-name:var(--font-bangers)] text-white text-sm"
                  style={{ background: p.color }}
                >
                  {p.emoji} {p.term}
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between font-[family-name:var(--font-comic)] text-sm border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
                <span>Paare gefunden:</span>
                <span className="font-bold text-[#00C853]">{PAIRS.length} / {PAIRS.length} ✓</span>
              </div>
              <div className="flex justify-between font-[family-name:var(--font-comic)] text-sm border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
                <span>Fehler:</span>
                <span className={`font-bold ${mistakes === 0 ? 'text-[#00C853]' : 'text-[#FF3B3F]'}`}>
                  {mistakes} {mistakes === 0 ? '(Perfekt!)' : `(-${mistakes * PENALTY_PER_MISTAKE} XP)`}
                </span>
              </div>
              {bonusEarned && (
                <div className="flex justify-between font-[family-name:var(--font-comic)] text-sm border-[2px] border-[#00C853] rounded-xl px-3 py-2 bg-[#E8F5E9]">
                  <span>Zeitbonus:</span>
                  <span className="font-bold text-[#00C853]">+{BONUS_XP} XP (in {BONUS_TIME - timeLeft}s)</span>
                </div>
              )}
            </div>

            <div className="bg-[#FFE135] border-[3px] border-[#111] rounded-xl px-4 py-3 text-center shadow-[3px_3px_0_#111] mb-3">
              <span className="font-[family-name:var(--font-bangers)] text-[#111] text-2xl">+{xpEarned} XP</span>
            </div>

            <button
              onClick={() => onComplete(xpEarned)}
              className="w-full py-3 bg-[#0066FF] text-white border-[3px] border-[#111] rounded-xl font-[family-name:var(--font-bangers)] text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              Weiter! →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div
        className="bg-[#FFF9E6] border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-2xl"
        style={{ maxHeight: '97vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="bg-[#9C27B0] border-b-[4px] border-[#111] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-[2px] border-[#111] rounded-xl flex items-center justify-center text-xl shadow-[2px_2px_0_#111]">
                🃏
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-bangers)] text-white text-xl tracking-wider">
                  MATCHING PAIRS
                </h2>
                <p className="font-[family-name:var(--font-comic)] text-purple-200 text-xs">
                  Begriff anklicken, dann passende Erklärung
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mistakes > 0 && (
                <div className="bg-[#FF3B3F] border-[2px] border-[#111] rounded-full px-2.5 py-1 font-[family-name:var(--font-bangers)] text-white text-sm">
                  {mistakes} ✗
                </div>
              )}
              <div className="bg-white border-[2px] border-[#111] rounded-full px-3 py-1 font-[family-name:var(--font-bangers)] text-[#111] text-sm">
                {matched.size} / {PAIRS.length} ✓
              </div>
            </div>
          </div>

          {/* Timer bar */}
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-bangers)] text-white text-xs">
              ⏱ BONUS
            </span>
            <div className="flex-1 h-3 bg-white/30 border-[1.5px] border-white/40 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${timerPercent}%`, background: timerColor }}
              />
            </div>
            <span
              className="font-[family-name:var(--font-bangers)] text-xs min-w-8 text-right"
              style={{ color: timerColor }}
            >
              {timeLeft}s
            </span>
          </div>
        </div>

        <div className="p-4">
          {/* Instruction */}
          {selectedTerm && (
            <div className="mb-3 p-2.5 bg-[#E3F2FD] border-[2px] border-[#0066FF] rounded-xl font-[family-name:var(--font-comic)] text-xs text-[#0066FF] text-center font-bold">
              Begriff ausgewahlt — jetzt rechts die passende Erklarung klicken!
            </div>
          )}
          {!selectedTerm && !wrongPair && matched.size === 0 && (
            <div className="mb-3 p-2.5 bg-[#FFF9E6] border-[2px] border-[#111] rounded-xl font-[family-name:var(--font-comic)] text-xs text-[#555] text-center">
              Zuerst links einen Begriff anklicken, dann rechts die passende Erklarung
            </div>
          )}
          {wrongPair && (
            <div className="mb-3 p-2.5 bg-[#FFEBEE] border-[2px] border-[#FF3B3F] rounded-xl font-[family-name:var(--font-comic)] text-xs text-[#FF3B3F] text-center font-bold">
              Kein passendes Paar — versuche es nochmal!
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Terms column */}
            <div>
              <p className="font-[family-name:var(--font-bangers)] text-[#111] text-xs tracking-widest mb-2 opacity-60">
                BEGRIFFE
              </p>
              <div className="flex flex-col gap-2">
                {termCards.map(card => {
                  const pair = PAIRS.find(p => p.id === card.pairId)!
                  const isSelected = selectedTerm === card.pairId
                  const isMatched = matched.has(card.pairId)
                  const isWrong = wrongPair?.term === card.pairId

                  return (
                    <PairCard
                      key={card.uniqueKey}
                      card={card}
                      pair={pair}
                      isSelected={isSelected}
                      isMatched={isMatched}
                      isWrong={isWrong}
                      onClick={() => handleTermClick(card.pairId)}
                    />
                  )
                })}
              </div>
            </div>

            {/* Definitions column */}
            <div>
              <p className="font-[family-name:var(--font-bangers)] text-[#111] text-xs tracking-widest mb-2 opacity-60">
                ERKLARUNGEN
              </p>
              <div className="flex flex-col gap-2">
                {defCards.map(card => {
                  const pair = PAIRS.find(p => p.id === card.pairId)!
                  const isMatched = matched.has(card.pairId)
                  const isWrong = wrongPair?.def === card.pairId
                  const clickable = !!selectedTerm && !isMatched && !wrongPair

                  return (
                    <button
                      key={card.uniqueKey}
                      onClick={() => handleDefClick(card.pairId)}
                      disabled={!clickable}
                      className="w-full text-left px-3 py-2.5 rounded-xl border-[2.5px] font-[family-name:var(--font-comic)] text-xs leading-snug transition-all active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-default"
                      style={{
                        background: isMatched
                          ? '#E8F5E9'
                          : isWrong
                          ? '#FFEBEE'
                          : clickable
                          ? '#FFF9E6'
                          : 'white',
                        borderColor: isMatched
                          ? '#00C853'
                          : isWrong
                          ? '#FF3B3F'
                          : '#111',
                        boxShadow: isMatched || isWrong ? 'none' : clickable ? '2px 2px 0 #111' : 'none',
                        minHeight: 52,
                      }}
                    >
                      {isMatched && <span className="text-[#00C853] font-bold mr-1">✓</span>}
                      {pair.definition}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
