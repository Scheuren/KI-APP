'use client'

import { useState, useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortCategory = {
  id: string
  label: string
  color: string
  bgColor: string
  borderColor: string
  description: string
}

type SortItem = {
  id: string
  label: string
  emoji: string
  correctCategory: string
  hint: string
}

type Props = {
  onComplete: (xp: number) => void
}

// ─── Game Data ────────────────────────────────────────────────────────────────

const CATEGORIES: SortCategory[] = [
  {
    id: 'training',
    label: 'TRAININGSDATEN',
    color: 'white',
    bgColor: '#0066FF',
    borderColor: '#0044CC',
    description: 'Daten zum Lernen — der Baum trainiert damit',
  },
  {
    id: 'test',
    label: 'TESTDATEN',
    color: 'white',
    bgColor: '#9C27B0',
    borderColor: '#6A0080',
    description: 'Daten zum Prüfen — wurde das Lernen erfolgreich?',
  },
]

const ITEMS: SortItem[] = [
  {
    id: 'item1',
    label: 'Gustav G. (Hut: Ja, Mantel: Ja)',
    emoji: '🕵️',
    correctCategory: 'training',
    hint: 'Gustav ist bekannt — wir lernen mit ihm!',
  },
  {
    id: 'item2',
    label: 'Maria M. (Brille: Ja)',
    emoji: '👩',
    correctCategory: 'test',
    hint: 'Maria testen wir — wir prüfen ob der Baum sie richtig erkennt.',
  },
  {
    id: 'item3',
    label: '80% der Datensätze',
    emoji: '📊',
    correctCategory: 'training',
    hint: 'Der Großteil — 80% — geht immer zum Training!',
  },
  {
    id: 'item4',
    label: '20% der Datensätze',
    emoji: '🧪',
    correctCategory: 'test',
    hint: 'Die kleinen 20% reservieren wir für den Test.',
  },
  {
    id: 'item5',
    label: 'Boris B. (Bart: Ja, Hut: Ja)',
    emoji: '🧔',
    correctCategory: 'training',
    hint: 'Boris hilft dem Algorithmus Muster zu lernen.',
  },
  {
    id: 'item6',
    label: 'Anna A. (keine Merkmale)',
    emoji: '👩',
    correctCategory: 'test',
    hint: 'Anna ist unbekannt — perfekt zum Testen!',
  },
  {
    id: 'item7',
    label: 'Bekannte Verdächtige',
    emoji: '📋',
    correctCategory: 'training',
    hint: 'Bekannte Fälle nutzen wir als Trainingsdaten!',
  },
  {
    id: 'item8',
    label: 'Neue unbekannte Fälle',
    emoji: '❓',
    correctCategory: 'test',
    hint: 'Neue, unbekannte Fälle eignen sich für den Test.',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function SortingGame({ onComplete }: Props) {
  const shuffledItems = useMemo(() => [...ITEMS].sort(() => Math.random() - 0.5), [])

  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong' | null>>({})
  const [phase, setPhase] = useState<'playing' | 'result'>('playing')
  const [showHint, setShowHint] = useState<string | null>(null)

  const handleItemClick = (itemId: string) => {
    if (assignments[itemId]) return
    setSelectedItem(prev => prev === itemId ? null : itemId)
    setShowHint(null)
  }

  const handleCategoryClick = (categoryId: string) => {
    if (!selectedItem) return

    const item = ITEMS.find(i => i.id === selectedItem)!
    const isCorrect = item.correctCategory === categoryId

    setAssignments(prev => ({ ...prev, [selectedItem]: categoryId }))
    setFeedback(prev => ({ ...prev, [selectedItem]: isCorrect ? 'correct' : 'wrong' }))

    if (!isCorrect) {
      setShowHint(item.hint)
    }

    setSelectedItem(null)
  }

  const handleRemove = (itemId: string) => {
    setAssignments(prev => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
    setFeedback(prev => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
    setShowHint(null)
  }

  const assignedCount = Object.keys(assignments).length
  const correctCount = Object.values(feedback).filter(f => f === 'correct').length
  const allAssigned = assignedCount === ITEMS.length

  const handleCheck = () => {
    setPhase('result')
  }

  const xp = Math.round((correctCount / ITEMS.length) * 60)

  if (phase === 'result') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-lg overflow-hidden">
          <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4 text-center">
            <div className="text-5xl mb-2">{correctCount === ITEMS.length ? '🏆' : correctCount >= ITEMS.length / 2 ? '🎯' : '📚'}</div>
            <h2 className="font-[family-name:var(--font-bangers)] text-[#111] text-2xl tracking-wider">
              SORTIERUNG ABGESCHLOSSEN!
            </h2>
          </div>
          <div className="p-5">
            <p className="font-[family-name:var(--font-comic)] text-[#111] text-base text-center mb-4">
              {correctCount} von {ITEMS.length} Elemente richtig sortiert!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {CATEGORIES.map(cat => {
                const catItems = ITEMS.filter(i => i.correctCategory === cat.id)
                return (
                  <div
                    key={cat.id}
                    className="border-[3px] border-[#111] rounded-xl p-3 shadow-[3px_3px_0_#111]"
                    style={{ background: cat.bgColor + '22' }}
                  >
                    <p
                      className="font-[family-name:var(--font-bangers)] text-sm tracking-wide mb-2"
                      style={{ color: cat.bgColor }}
                    >
                      {cat.label}
                    </p>
                    {catItems.map(item => {
                      const placed = assignments[item.id] === cat.id
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-1.5 font-[family-name:var(--font-comic)] text-xs mb-1"
                        >
                          <span>{placed ? '✅' : '❌'}</span>
                          <span>{item.emoji}</span>
                          <span className="truncate">{item.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            <div className="bg-[#FFE135] border-[3px] border-[#111] rounded-xl px-4 py-3 text-center shadow-[3px_3px_0_#111] mb-3">
              <span className="font-[family-name:var(--font-bangers)] text-[#111] text-xl">+{xp} XP erworben!</span>
            </div>

            <button
              onClick={() => onComplete(xp)}
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
        className="bg-[#FFF9E6] border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-3xl"
        style={{ maxHeight: '97vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="bg-[#FF3B3F] border-b-[4px] border-[#111] p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-bangers)] text-white text-2xl tracking-wider">
                SORTIER-SPIEL
              </h2>
              <p className="font-[family-name:var(--font-comic)] text-red-100 text-xs mt-0.5">
                Klick ein Element, dann die richtige Kategorie
              </p>
            </div>
            <div className="bg-white border-[2px] border-[#111] rounded-full px-3 py-1 font-[family-name:var(--font-bangers)] text-[#111] text-sm">
              {assignedCount} / {ITEMS.length}
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Hint box */}
          {showHint && (
            <div className="mb-3 p-3 bg-[#FFF3E0] border-[2px] border-[#FF9800] rounded-xl shadow-[2px_2px_0_#FF9800] font-[family-name:var(--font-comic)] text-sm text-[#E65100]">
              <span className="font-bold">Tipp: </span>{showHint}
            </div>
          )}

          {/* Instruction when item selected */}
          {selectedItem && (
            <div className="mb-3 p-3 bg-[#E3F2FD] border-[2px] border-[#0066FF] rounded-xl font-[family-name:var(--font-comic)] text-sm text-[#0066FF] font-bold text-center">
              Jetzt eine Kategorie unten anklicken!
            </div>
          )}

          {/* Category drop zones */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {CATEGORIES.map(cat => {
              const catItems = Object.entries(assignments)
                .filter(([, cId]) => cId === cat.id)
                .map(([itemId]) => ITEMS.find(i => i.id === itemId)!)
                .filter(Boolean)

              return (
                <div key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.id)}
                    disabled={!selectedItem}
                    className="w-full mb-2 py-2.5 px-4 rounded-xl border-[3px] border-[#111] font-[family-name:var(--font-bangers)] text-sm tracking-wide shadow-[3px_3px_0_#111] transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-60 disabled:cursor-default"
                    style={{ background: cat.bgColor, color: cat.color }}
                  >
                    {cat.label}
                  </button>
                  <p className="font-[family-name:var(--font-comic)] text-[#666] text-xs mb-2 text-center leading-snug">
                    {cat.description}
                  </p>

                  {/* Placed items */}
                  <div
                    className="min-h-16 rounded-xl border-[2px] border-dashed p-2 flex flex-col gap-1.5"
                    style={{ borderColor: cat.bgColor, background: cat.bgColor + '15' }}
                  >
                    {catItems.map(item => {
                      const isCorrect = feedback[item.id] === 'correct'
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg border-[2px] border-[#111] shadow-[1px_1px_0_#111] font-[family-name:var(--font-comic)] text-xs cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ background: isCorrect ? '#E8F5E9' : '#FFEBEE' }}
                          onClick={() => handleRemove(item.id)}
                          title="Klicken zum Entfernen"
                        >
                          <span>{item.emoji}</span>
                          <span className="flex-1 leading-snug">{item.label}</span>
                          <span className={isCorrect ? 'text-[#00C853]' : 'text-[#FF3B3F]'}>
                            {isCorrect ? '✓' : '✗'}
                          </span>
                        </div>
                      )
                    })}
                    {catItems.length === 0 && (
                      <p className="font-[family-name:var(--font-comic)] text-[#AAA] text-xs text-center py-2">
                        Noch leer — Element auswählen und hier klicken
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Unassigned items */}
          <div className="mb-4">
            <p className="font-[family-name:var(--font-bangers)] text-[#111] text-sm tracking-wide mb-2 opacity-70">
              ZU SORTIERENDE ELEMENTE:
            </p>
            <div className="flex flex-wrap gap-2">
              {shuffledItems.map(item => {
                const isAssigned = !!assignments[item.id]
                const isSelected = selectedItem === item.id

                if (isAssigned) return null

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border-[2.5px] border-[#111] font-[family-name:var(--font-comic)] text-xs shadow-[2px_2px_0_#111] transition-all active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                    style={{
                      background: isSelected ? '#FFE135' : 'white',
                      outline: isSelected ? '3px solid #FF3B3F' : 'none',
                      outlineOffset: 2,
                    }}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}

              {shuffledItems.every(i => !!assignments[i.id]) && (
                <p className="font-[family-name:var(--font-comic)] text-[#00C853] text-sm font-bold w-full text-center py-1">
                  Alle Elemente sortiert!
                </p>
              )}
            </div>
          </div>

          {/* Check button */}
          <button
            onClick={handleCheck}
            disabled={!allAssigned}
            className="w-full py-3 rounded-xl border-[3px] border-[#111] font-[family-name:var(--font-bangers)] text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#FFE135', color: '#111' }}
          >
            {allAssigned ? 'Auswertung!' : `Noch ${ITEMS.length - assignedCount} Elemente zu sortieren`}
          </button>
        </div>
      </div>
    </div>
  )
}
