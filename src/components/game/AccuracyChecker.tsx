'use client'

import { useState } from 'react'
import { treeProfiles, type TreeProfile } from '@/lib/game/level4Data'

type Props = {
  onComplete: () => void
}

function AccuracyBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-comic text-[#111] text-xs">{label}</span>
        <span className="font-bangers text-sm" style={{ color }}>{value}%</span>
      </div>
      <div className="w-full h-5 bg-[#EEE] border-[2px] border-[#111] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

function TreeCard({ tree, selected, onSelect }: {
  tree: TreeProfile
  selected: boolean
  onSelect: () => void
}) {
  const gap = tree.trainAccuracy - tree.testAccuracy

  return (
    <div
      onClick={onSelect}
      className={`border-[3px] border-[#111] rounded-2xl p-4 shadow-[4px_4px_0_#111] cursor-pointer transition-all ${selected ? 'scale-105' : 'hover:scale-102'}`}
      style={{ background: selected ? (tree.isOverfit ? '#FFCDD2' : '#C8E6C9') : 'white' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-full border-[3px] border-[#111] flex items-center justify-center font-bangers text-xl" style={{ background: tree.color, color: 'white' }}>
          {tree.id}
        </div>
        <div>
          <p className="font-bangers text-[#111] text-base tracking-wide">{tree.name}</p>
          <p className="font-comic text-[#666] text-xs">Tiefe: {tree.depth} Ebenen</p>
        </div>
      </div>

      <div className="space-y-3 mb-3">
        <AccuracyBar value={tree.trainAccuracy} color="#0066FF" label="Training-Genauigkeit" />
        <AccuracyBar value={tree.testAccuracy} color={tree.isOverfit ? '#FF3B3F' : '#00C853'} label="Test-Genauigkeit" />
      </div>

      <div className={`text-xs font-comic p-2 rounded-lg border-[2px] border-[#111] ${gap > 20 ? 'bg-[#FFCDD2]' : 'bg-[#C8E6C9]'}`}>
        <span className="font-bold">Differenz: {gap}%</span> —{' '}
        {gap > 20 ? 'Großer Unterschied! Verdächtig...' : 'Kleiner Unterschied. Gut!'}
      </div>

      <p className="font-comic text-[#555] text-xs mt-2 leading-relaxed">{tree.description}</p>

      {selected && (
        <div className="mt-2 text-center">
          <span className="font-bangers text-sm tracking-wide" style={{ color: tree.isOverfit ? '#FF3B3F' : '#00C853' }}>
            {tree.isOverfit ? '⚠️ Ausgewählt als overfitted' : '✓ Als besser ausgewählt'}
          </span>
        </div>
      )}
    </div>
  )
}

export function AccuracyChecker({ onComplete }: Props) {
  const [selectedOverfit, setSelectedOverfit] = useState<'A' | 'B' | null>(null)
  const [selectedBetter, setSelectedBetter] = useState<'A' | 'B' | null>(null)
  const [phase, setPhase] = useState<'select' | 'result'>('select')
  const [showHint, setShowHint] = useState(false)

  const overfitCorrect = selectedOverfit === 'A'
  const betterCorrect = selectedBetter === 'B'

  const check = () => {
    if (selectedOverfit && selectedBetter) {
      setPhase('result')
    }
  }

  const bothCorrect = overfitCorrect && betterCorrect

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-2xl max-h-[97vh] overflow-y-auto">

        <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4">
          <h2 className="font-bangers text-[#111] text-2xl tracking-wider">OVERFITTING ERKENNEN</h2>
          <p className="font-comic text-[#555] text-sm mt-1">
            Analysiere die zwei Bäume und beantworte beide Fragen
          </p>
        </div>

        <div className="p-4">
          {/* Tree cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {treeProfiles.map(tree => (
              <TreeCard
                key={tree.id}
                tree={tree}
                selected={selectedOverfit === tree.id || selectedBetter === tree.id}
                onSelect={() => {}} // read only in visual
              />
            ))}
          </div>

          {/* Sherlock analogy */}
          <div className="bg-[#FFF8E1] border-[2px] border-[#FFE135] border-[3px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111] mb-4">
            <p className="font-bangers text-[#111] text-base tracking-wide mb-1">SHERLOCK-ANALOGIE:</p>
            <p className="font-comic text-[#555] text-xs leading-relaxed">
              Sherlock kennt das Büro in Baker Street auswendig. Er weiss genau wo jede Akte liegt.
              Aber bring ihn nach Tokio — er scheitert! Genau wie Baum A: perfekt auf Trainingsdaten,
              aber nutzlos bei neuen Daten. <span className="font-bold">Das ist Overfitting!</span>
            </p>
          </div>

          {phase === 'select' ? (
            <>
              {/* Questions */}
              <div className="space-y-4 mb-4">
                <div className="border-[2px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111]">
                  <p className="font-bangers text-[#111] text-base tracking-wide mb-2">FRAGE 1: Welcher Baum ist overfitted?</p>
                  <div className="flex gap-2">
                    {(['A', 'B'] as const).map(id => (
                      <button
                        key={id}
                        onClick={() => setSelectedOverfit(id)}
                        className="flex-1 py-2.5 border-[2.5px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[2px_2px_0_#111] active:shadow-none transition-all"
                        style={{ background: selectedOverfit === id ? '#FF3B3F' : 'white', color: selectedOverfit === id ? 'white' : '#111' }}
                      >
                        Baum {id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-[2px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111]">
                  <p className="font-bangers text-[#111] text-base tracking-wide mb-2">FRAGE 2: Welcher Baum ist für echte Anwendungen besser?</p>
                  <div className="flex gap-2">
                    {(['A', 'B'] as const).map(id => (
                      <button
                        key={id}
                        onClick={() => setSelectedBetter(id)}
                        className="flex-1 py-2.5 border-[2.5px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[2px_2px_0_#111] active:shadow-none transition-all"
                        style={{ background: selectedBetter === id ? '#00C853' : 'white', color: selectedBetter === id ? 'white' : '#111' }}
                      >
                        Baum {id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-4 py-2.5 border-[2px] border-[#111] rounded-xl font-bangers text-sm shadow-[2px_2px_0_#111] active:shadow-none transition-all"
                  style={{ background: 'white', color: '#111' }}
                >
                  {showHint ? 'Tipp verstecken' : 'Tipp anzeigen'}
                </button>
                <button
                  onClick={check}
                  disabled={!selectedOverfit || !selectedBetter}
                  className="flex-1 py-2.5 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all disabled:opacity-40"
                  style={{ background: '#FFE135', color: '#111' }}
                >
                  Antworten überprüfen!
                </button>
              </div>

              {showHint && (
                <div className="mt-3 bg-[#E3F2FD] border-[2px] border-[#0066FF] rounded-xl p-3">
                  <p className="font-comic text-[#0066FF] text-xs leading-relaxed">
                    <span className="font-bold">Tipp:</span> Schau auf den Unterschied zwischen Training- und Test-Genauigkeit.
                    Ein großer Unterschied (z.B. 100% vs 58%) ist ein Zeichen für Overfitting.
                    Für echte Anwendungen ist die Test-Genauigkeit wichtiger!
                  </p>
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Frage 1 (Overfitting)', correct: overfitCorrect, msg: overfitCorrect ? 'Richtig! Baum A mit 100%/58% ist klar overfitted.' : 'Falsch. Baum A (100% Training, 58% Test) ist overfitted — der große Unterschied verrät es.' },
                  { label: 'Frage 2 (Besserer Baum)', correct: betterCorrect, msg: betterCorrect ? 'Richtig! Baum B (85%/82%) generalisiert gut.' : 'Falsch. Baum B ist besser — Training und Test liegen nahe beieinander.' },
                ].map(({ label, correct, msg }) => (
                  <div
                    key={label}
                    className={`border-[2.5px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111] ${correct ? 'bg-[#C8E6C9]' : 'bg-[#FFCDD2]'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{correct ? '✅' : '❌'}</span>
                      <span className="font-bangers text-[#111] text-sm tracking-wide">{label}</span>
                    </div>
                    <p className="font-comic text-[#555] text-xs leading-relaxed">{msg}</p>
                  </div>
                ))}
              </div>

              <div className={`p-3 border-[3px] border-[#111] rounded-xl shadow-[3px_3px_0_#111] text-center mb-4 ${bothCorrect ? 'bg-[#FFE135]' : 'bg-slate-50'}`}>
                <p className="font-bangers text-[#111] text-xl tracking-wide">
                  {bothCorrect ? 'PERFEKT! Du kannst Overfitting erkennen!' : 'Gut versucht! Das Konzept wird klarer...'}
                </p>
              </div>

              <button
                onClick={onComplete}
                className="w-full py-3 bg-[#0066FF] text-white border-[3px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all"
              >
                Weiter zum Overfitting-Test! →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
