'use client'

import { useState } from 'react'
import { ethicsStatements, type EthicsStatement } from '@/lib/game/level5Data'

type Props = {
  onComplete: (xp: number) => void
}

type Verdict = 'richtig' | 'falsch' | 'kommt_drauf_an' | null

const VERDICT_CONFIG = {
  richtig: { label: 'Richtig', bg: '#00C853', textColor: 'white', icon: '✓' },
  falsch: { label: 'Falsch', bg: '#FF3B3F', textColor: 'white', icon: '✗' },
  kommt_drauf_an: { label: 'Kommt drauf an', bg: '#FF9800', textColor: 'white', icon: '?' },
}

function StatementCard({
  statement,
  playerVerdict,
  onVerdict,
  revealed,
}: {
  statement: EthicsStatement
  playerVerdict: Verdict
  onVerdict: (v: Verdict) => void
  revealed: boolean
}) {
  const isCorrect = revealed && playerVerdict === statement.correctVerdict

  return (
    <div
      className={`border-[3px] border-[#111] rounded-2xl p-4 shadow-[4px_4px_0_#111] transition-all ${
        revealed
          ? isCorrect ? 'bg-[#C8E6C9]' : 'bg-[#FFCDD2]'
          : 'bg-white'
      }`}
    >
      <p className="font-comic text-[#111] text-sm font-bold leading-relaxed mb-3">
        &quot;{statement.text}&quot;
      </p>

      {!revealed && (
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(VERDICT_CONFIG) as Verdict[]).filter(Boolean).map((verdict) => {
            const config = VERDICT_CONFIG[verdict as keyof typeof VERDICT_CONFIG]
            const selected = playerVerdict === verdict
            return (
              <button
                key={verdict as string}
                onClick={() => onVerdict(verdict)}
                className="flex-1 min-w-[80px] py-2 border-[2.5px] border-[#111] rounded-xl font-bangers text-xs tracking-wide shadow-[2px_2px_0_#111] active:shadow-none transition-all"
                style={{
                  background: selected ? config.bg : 'white',
                  color: selected ? config.textColor : '#111',
                  opacity: selected ? 1 : 0.85,
                }}
              >
                {config.icon} {config.label}
              </button>
            )
          })}
        </div>
      )}

      {revealed && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
            <div>
              <span className="font-bangers text-[#111] text-sm tracking-wide">
                {isCorrect ? 'Richtig! ' : 'Falsch. '}
              </span>
              <span className="font-comic text-[#555] text-xs">
                Korrekt: <strong>{VERDICT_CONFIG[statement.correctVerdict].label}</strong>
              </span>
            </div>
          </div>
          <p className="font-comic text-[#555] text-xs leading-relaxed">{statement.explanation}</p>
        </div>
      )}
    </div>
  )
}

export function EthicsDebate({ onComplete }: Props) {
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({})
  const [phase, setPhase] = useState<'debate' | 'result'>('debate')
  const [showWilli, setShowWilli] = useState(false)

  const allAnswered = ethicsStatements.every(s => verdicts[s.id] !== undefined && verdicts[s.id] !== null)

  const setVerdict = (id: string, verdict: Verdict) => {
    setVerdicts(prev => ({ ...prev, [id]: verdict }))
  }

  const check = () => {
    setPhase('result')
  }

  const correct = ethicsStatements.filter(s => verdicts[s.id] === s.correctVerdict).length
  const xp = correct >= 4 ? 100 : correct >= 3 ? 75 : correct >= 2 ? 50 : 25

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-2xl max-h-[97vh] overflow-y-auto">

        <div className="bg-[#9C27B0] border-b-[4px] border-[#111] p-4">
          <h2 className="font-bangers text-white text-2xl tracking-wider">ETHIK-DEBATTE</h2>
          <p className="font-comic text-white/80 text-sm mt-1">
            Ordne jede Aussage zu: Richtig / Falsch / Kommt drauf an
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* W.I.L.L.I. Tipp */}
          <div>
            <button
              onClick={() => setShowWilli(!showWilli)}
              className="w-full text-left flex items-center gap-3 bg-[#FFF9E6] border-[2px] border-[#FFE135] rounded-xl px-3 py-2 hover:bg-[#FFF5CC] transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/characters/preview/hacker.png" alt="Willi" style={{ width: 36, height: 48, objectFit: 'contain' }} />
              <div>
                <p className="font-bangers text-[#111] text-sm tracking-wide">W.I.L.L.I.: TIPPS ZU KI-ETHIK</p>
                <p className="font-comic text-[#666] text-xs">{showWilli ? 'Verstecken ↑' : 'Anzeigen ↓'}</p>
              </div>
            </button>
            {showWilli && (
              <div className="mt-2 bg-[#FFF9E6] border-[2px] border-[#FFE135] rounded-xl p-3 space-y-2">
                {[
                  { tip: '1. Frage immer: Wer hat die Daten gesammelt und warum?', icon: '🔍' },
                  { tip: '2. Prüfe: Sind alle Gruppen gleich gut vertreten?', icon: '📊' },
                  { tip: '3. Teste das Modell auf verschiedenen Gruppen getrennt', icon: '🧪' },
                  { tip: '4. KI-Entscheidungen sollten erklärbar sein (Explainability)', icon: '💡' },
                  { tip: '5. Betroffene sollten eine menschliche Überprüfung beantragen können', icon: '👥' },
                ].map(({ tip, icon }) => (
                  <div key={tip} className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">{icon}</span>
                    <p className="font-comic text-[#555] text-xs leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Statements */}
          {ethicsStatements.map(statement => (
            <StatementCard
              key={statement.id}
              statement={statement}
              playerVerdict={verdicts[statement.id] ?? null}
              onVerdict={(v) => setVerdict(statement.id, v)}
              revealed={phase === 'result'}
            />
          ))}

          {phase === 'debate' ? (
            <button
              onClick={check}
              disabled={!allAnswered}
              className="w-full py-3 border-[3px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all disabled:opacity-40"
              style={{ background: '#FFE135', color: '#111' }}
            >
              Debatte auswerten! ({Object.values(verdicts).filter(v => v !== null).length}/4 beantwortet)
            </button>
          ) : (
            <div>
              <div
                className={`p-4 border-[3px] border-[#111] rounded-xl shadow-[3px_3px_0_#111] text-center mb-4 ${correct >= 3 ? 'bg-[#C8E6C9]' : 'bg-[#FFF3E0]'}`}
              >
                <div className="text-3xl mb-1">{correct === 4 ? '🌟' : correct >= 3 ? '🎯' : '📚'}</div>
                <p className="font-bangers text-[#111] text-xl tracking-wide">
                  {correct} von 4 richtig!
                </p>
                <p className="font-comic text-[#555] text-sm mt-1">
                  {correct === 4 ? 'Perfekt! Du denkst wie ein KI-Ethiker.' :
                    correct >= 3 ? 'Sehr gut! Du verstehst die ethischen Grundlagen.' :
                    'KI-Ethik ist komplex — es gibt selten einfache Antworten.'}
                </p>
                <p className="font-bangers text-[#9C27B0] text-lg mt-1">+{xp} XP</p>
              </div>
              <button
                onClick={() => onComplete(xp)}
                className="w-full py-3 bg-[#9C27B0] text-white border-[3px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all"
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
