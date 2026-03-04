'use client'

import { useState, useMemo } from 'react'

const PAIRS = [
  {
    id: 'wurzel',
    term: '🌱 Wurzel',
    definition: 'Der Startpunkt des Baums — die erste Frage ganz oben',
    color: '#FF3B3F',
  },
  {
    id: 'knoten',
    term: '⭕ Knoten',
    definition: 'Eine Verzweigungsstelle — stellt eine Ja/Nein-Frage zu einem Merkmal',
    color: '#0066FF',
  },
  {
    id: 'kante',
    term: '➡️ Kante',
    definition: 'Die Verbindung zwischen zwei Knoten — zeigt den Weg Ja oder Nein',
    color: '#00C853',
  },
  {
    id: 'blatt',
    term: '🍃 Blatt',
    definition: 'Der Endpunkt des Baums — hier steht das Klassifikationsergebnis',
    color: '#9C27B0',
  },
]

type Props = { onComplete: (xp: number) => void }

export function TermsMatchingGame({ onComplete }: Props) {
  const shuffledDefs = useMemo(() => [...PAIRS].sort(() => Math.random() - 0.5), [])
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<{ term: string; def: string } | null>(null)
  const [allDone, setAllDone] = useState(false)

  const handleTermClick = (id: string) => {
    if (matched.has(id)) return
    setSelectedTerm(prev => prev === id ? null : id)
    setWrongPair(null)
  }

  const handleDefClick = (defId: string) => {
    if (!selectedTerm || matched.has(defId)) return
    if (selectedTerm === defId) {
      const newMatched = new Set(matched)
      newMatched.add(selectedTerm)
      setMatched(newMatched)
      setSelectedTerm(null)
      if (newMatched.size === PAIRS.length) {
        setTimeout(() => setAllDone(true), 600)
      }
    } else {
      setWrongPair({ term: selectedTerm, def: defId })
      setTimeout(() => { setWrongPair(null); setSelectedTerm(null) }, 900)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.82)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#0066FF] border-b-[4px] border-[#111] p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-white border-[3px] border-[#111] rounded-xl flex items-center justify-center text-2xl shadow-[2px_2px_0_#111] flex-shrink-0">
            🧩
          </div>
          <div className="flex-1">
            <h2 className="font-bangers text-white text-xl tracking-wider">BEGRIFFE ZUORDNEN</h2>
            <p className="font-comic text-blue-200 text-xs">Klick einen Begriff — dann die passende Erklärung</p>
          </div>
          <div className="bg-white border-[2px] border-[#111] rounded-full px-3 py-1 font-bangers text-[#111] text-sm flex-shrink-0">
            {matched.size} / {PAIRS.length} ✓
          </div>
        </div>

        {allDone ? (
          /* Erfolgs-Screen */
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="font-bangers text-[#FF3B3F] text-3xl tracking-wide mb-2">SUPER GEMACHT!</h3>
            <p className="font-comic text-[#555] mb-2 text-sm">Du kennst jetzt alle 4 Begriffe des Entscheidungsbaums!</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6 mt-4">
              {PAIRS.map(p => (
                <div
                  key={p.id}
                  className="px-3 py-1.5 rounded-full font-bangers text-white text-sm border-[2px] border-[#111] shadow-[2px_2px_0_#111]"
                  style={{ background: p.color }}
                >
                  {p.term}
                </div>
              ))}
            </div>
            <button
              onClick={() => onComplete(20)}
              className="comic-btn px-8 py-3 rounded-xl font-bangers text-xl tracking-wide"
              style={{ background: '#FFE135', color: '#111' }}
            >
              Weiter zum Fall-Board →
            </button>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 gap-4">
            {/* Begriffe (links) */}
            <div>
              <p className="font-bangers text-[#111] text-xs tracking-widest mb-2 opacity-60">BEGRIFFE</p>
              <div className="flex flex-col gap-2">
                {PAIRS.map(p => {
                  const isMatched = matched.has(p.id)
                  const isSelected = selectedTerm === p.id
                  const isWrong = wrongPair?.term === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleTermClick(p.id)}
                      disabled={isMatched}
                      className="px-4 py-3 rounded-xl border-[2.5px] font-bangers text-base tracking-wide text-white text-left transition-all shadow-[2px_2px_0_#111] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:shadow-none"
                      style={{
                        background: isMatched ? '#00C853' : isWrong ? '#FF3B3F' : isSelected ? p.color : '#444',
                        borderColor: isSelected ? p.color : '#111',
                        outline: isSelected ? `3px solid ${p.color}` : 'none',
                        outlineOffset: 2,
                        opacity: isMatched ? 0.8 : 1,
                      }}
                    >
                      {p.term} {isMatched && '✓'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Erklärungen (rechts, gemischt) */}
            <div>
              <p className="font-bangers text-[#111] text-xs tracking-widest mb-2 opacity-60">ERKLÄRUNGEN</p>
              <div className="flex flex-col gap-2">
                {shuffledDefs.map(p => {
                  const isMatched = matched.has(p.id)
                  const isWrong = wrongPair?.def === p.id
                  const clickable = !isMatched && !!selectedTerm
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleDefClick(p.id)}
                      disabled={!clickable}
                      className="px-3 py-3 rounded-xl border-[2.5px] border-[#111] font-comic text-xs text-left transition-all leading-relaxed shadow-[2px_2px_0_#111] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:shadow-none"
                      style={{
                        background: isMatched ? '#E8F5E9' : isWrong ? '#FFEBEE' : clickable ? '#FFF9E6' : 'white',
                        borderColor: isMatched ? '#00C853' : isWrong ? '#FF3B3F' : '#111',
                        cursor: clickable ? 'pointer' : 'default',
                      }}
                    >
                      {isMatched && <span className="text-[#00C853] font-bold mr-1">✓</span>}
                      {p.definition}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {!allDone && (
          <div className="px-4 pb-4 font-comic text-xs text-[#888] text-center">
            {selectedTerm
              ? `"${PAIRS.find(p => p.id === selectedTerm)?.term}" gewählt — jetzt rechts die Erklärung auswählen`
              : 'Zuerst links einen Begriff anklicken'}
          </div>
        )}
      </div>
    </div>
  )
}
