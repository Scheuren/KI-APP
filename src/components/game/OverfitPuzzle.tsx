'use client'

import { useState } from 'react'
import { overfitScenarios, type OverfitScenario } from '@/lib/game/level4Data'

type Props = {
  onComplete: (xp: number) => void
}

function ScenarioCard({
  scenario,
  answer,
  onAnswer,
  revealed,
}: {
  scenario: OverfitScenario
  answer: boolean | null
  onAnswer: (val: boolean) => void
  revealed: boolean
}) {
  const gap = scenario.trainAcc - scenario.testAcc

  let resultBg = 'bg-white'
  if (revealed && answer !== null) {
    const correct = answer === scenario.isOverfit
    resultBg = correct ? 'bg-[#C8E6C9]' : 'bg-[#FFCDD2]'
  }

  return (
    <div className={`border-[3px] border-[#111] rounded-2xl p-4 shadow-[4px_4px_0_#111] transition-all ${resultBg}`}>
      <p className="font-bangers text-[#111] text-base tracking-wide mb-3">{scenario.title}</p>

      {/* Bars */}
      <div className="space-y-2 mb-3">
        <div>
          <div className="flex justify-between text-xs font-comic mb-0.5">
            <span>Training</span>
            <span className="font-bold">{scenario.trainAcc}%</span>
          </div>
          <div className="w-full h-4 bg-[#EEE] border-[1.5px] border-[#111] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${scenario.trainAcc}%`, background: '#0066FF' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-comic mb-0.5">
            <span>Test</span>
            <span className="font-bold" style={{ color: gap > 20 ? '#FF3B3F' : '#00C853' }}>{scenario.testAcc}%</span>
          </div>
          <div className="w-full h-4 bg-[#EEE] border-[1.5px] border-[#111] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${scenario.testAcc}%`, background: gap > 20 ? '#FF3B3F' : '#00C853' }} />
          </div>
        </div>
        <div className="text-xs font-comic text-center py-1 rounded-lg" style={{ background: gap > 20 ? '#FFCDD2' : '#C8E6C9' }}>
          Unterschied: <span className="font-bold">{gap}%</span>
        </div>
      </div>

      {/* Answer buttons */}
      {!revealed && (
        <div className="flex gap-2">
          <button
            onClick={() => onAnswer(true)}
            className="flex-1 py-2 border-[2.5px] border-[#111] rounded-xl font-bangers text-sm shadow-[2px_2px_0_#111] active:shadow-none transition-all"
            style={{ background: answer === true ? '#FF3B3F' : 'white', color: answer === true ? 'white' : '#111' }}
          >
            Overfitted
          </button>
          <button
            onClick={() => onAnswer(false)}
            className="flex-1 py-2 border-[2.5px] border-[#111] rounded-xl font-bangers text-sm shadow-[2px_2px_0_#111] active:shadow-none transition-all"
            style={{ background: answer === false ? '#00C853' : 'white', color: answer === false ? 'white' : '#111' }}
          >
            Gut generalisiert
          </button>
        </div>
      )}

      {/* Revealed */}
      {revealed && answer !== null && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span>{answer === scenario.isOverfit ? '✅' : '❌'}</span>
            <span className="font-bangers text-[#111] text-sm">
              {answer === scenario.isOverfit ? 'Richtig!' : `Falsch! Es ist ${scenario.isOverfit ? 'overfitted' : 'gut generalisiert'}`}
            </span>
          </div>
          <p className="font-comic text-[#555] text-xs leading-relaxed">{scenario.explanation}</p>
        </div>
      )}
    </div>
  )
}

export function OverfitPuzzle({ onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({})
  const [revealed, setRevealed] = useState(false)

  const allAnswered = overfitScenarios.every(s => answers[s.id] !== undefined && answers[s.id] !== null)

  const setAnswer = (id: string, val: boolean) => {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  const check = () => {
    setRevealed(true)
  }

  const correct = overfitScenarios.filter(s => answers[s.id] === s.isOverfit).length
  const xp = correct >= 4 ? 100 : correct >= 3 ? 75 : correct >= 2 ? 50 : 25

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-2xl max-h-[97vh] overflow-y-auto">

        <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4">
          <h2 className="font-bangers text-[#111] text-2xl tracking-wider">OVERFITTING QUIZ</h2>
          <p className="font-comic text-[#555] text-sm mt-1">
            4 Modelle — overfitted oder gut generalisiert?
          </p>
        </div>

        <div className="p-4">
          {/* Rule reminder */}
          <div className="bg-[#E3F2FD] border-[2px] border-[#0066FF] rounded-xl p-3 mb-4">
            <p className="font-comic text-[#0066FF] text-xs leading-relaxed">
              <span className="font-bold">Faustregel:</span> Ist der Unterschied zwischen Training und Test <span className="font-bold">größer als ~15%</span>?
              Dann ist das Modell wahrscheinlich overfitted!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {overfitScenarios.map(scenario => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                answer={answers[scenario.id] ?? null}
                onAnswer={(val) => setAnswer(scenario.id, val)}
                revealed={revealed}
              />
            ))}
          </div>

          {!revealed ? (
            <button
              onClick={check}
              disabled={!allAnswered}
              className="w-full py-3 border-[3px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all disabled:opacity-40"
              style={{ background: '#FFE135', color: '#111' }}
            >
              Alle 4 überprüfen! ({Object.values(answers).filter(v => v !== null && v !== undefined).length}/4 beantwortet)
            </button>
          ) : (
            <div>
              <div
                className={`p-4 border-[3px] border-[#111] rounded-xl shadow-[3px_3px_0_#111] text-center mb-4 ${correct >= 3 ? 'bg-[#C8E6C9]' : 'bg-[#FFF3E0]'}`}
              >
                <div className="text-3xl mb-1">{correct === 4 ? '🏆' : correct >= 3 ? '🎯' : '📚'}</div>
                <p className="font-bangers text-[#111] text-xl tracking-wide">
                  {correct} von 4 richtig!
                </p>
                <p className="font-comic text-[#555] text-sm mt-1">
                  {correct === 4 ? 'Perfekt! Du erkennst Overfitting sicher.' :
                    correct >= 3 ? 'Sehr gut! Fast alle erkannt.' :
                    'Übe das Erkennen von großen Training/Test-Unterschieden.'}
                </p>
                <p className="font-bangers text-[#0066FF] text-lg mt-1">+{xp} XP</p>
              </div>
              <button
                onClick={() => onComplete(xp)}
                className="w-full py-3 bg-[#0066FF] text-white border-[3px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all"
              >
                Weiter zum Quiz! →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
