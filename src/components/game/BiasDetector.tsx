'use client'

import { useState } from 'react'
import { biasDataset, type BiasDataEntry } from '@/lib/game/level5Data'

type Props = {
  onComplete: () => void
}

function DataTable({ data }: { data: BiasDataEntry[] }) {
  const bezirkX = data.filter(d => d.bezirk === 'X')
  const bezirkY = data.filter(d => d.bezirk === 'Y')
  const xVerdaechtig = bezirkX.filter(d => d.label === 'verdächtig').length
  const yVerdaechtig = bezirkY.filter(d => d.label === 'verdächtig').length

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Bezirk X */}
        <div className="border-[2px] border-[#FF3B3F] rounded-xl overflow-hidden">
          <div className="bg-[#FF3B3F] px-3 py-1.5 flex justify-between items-center">
            <span className="font-bangers text-white text-sm tracking-wide">Bezirk X — {bezirkX.length} Einträge</span>
            <span className="font-comic text-white/80 text-xs">{Math.round(bezirkX.length / data.length * 100)}%</span>
          </div>
          <div className="p-2 max-h-40 overflow-y-auto space-y-1" style={{ background: '#FFF5F5' }}>
            {bezirkX.map(entry => (
              <div key={entry.id} className="flex items-center justify-between text-xs font-comic py-0.5 border-b border-[#FFE0E0]">
                <span>{entry.emoji} {entry.name}</span>
                <span className={`font-bold ${entry.label === 'verdächtig' ? 'text-[#FF3B3F]' : 'text-[#00C853]'}`}>
                  {entry.label === 'verdächtig' ? 'V' : 'U'}
                </span>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 bg-[#FFCDD2] text-xs font-comic">
            Verdächtig: <span className="font-bold text-[#FF3B3F]">{xVerdaechtig}/{bezirkX.length}</span> ({Math.round(xVerdaechtig / bezirkX.length * 100)}%)
          </div>
        </div>

        {/* Bezirk Y */}
        <div className="border-[2px] border-[#00C853] rounded-xl overflow-hidden">
          <div className="bg-[#00C853] px-3 py-1.5 flex justify-between items-center">
            <span className="font-bangers text-white text-sm tracking-wide">Bezirk Y — {bezirkY.length} Einträge</span>
            <span className="font-comic text-white/80 text-xs">{Math.round(bezirkY.length / data.length * 100)}%</span>
          </div>
          <div className="p-2 max-h-40 overflow-y-auto space-y-1" style={{ background: '#F5FFF8' }}>
            {bezirkY.map(entry => (
              <div key={entry.id} className="flex items-center justify-between text-xs font-comic py-0.5 border-b border-[#E0FFE8]">
                <span>{entry.emoji} {entry.name}</span>
                <span className={`font-bold ${entry.label === 'verdächtig' ? 'text-[#FF3B3F]' : 'text-[#00C853]'}`}>
                  {entry.label === 'verdächtig' ? 'V' : 'U'}
                </span>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 bg-[#C8E6C9] text-xs font-comic">
            Verdächtig: <span className="font-bold text-[#00C853]">{yVerdaechtig}/{bezirkY.length}</span> ({Math.round(yVerdaechtig / bezirkY.length * 100)}%)
          </div>
        </div>
      </div>

      {/* Bias visualization */}
      <div className="border-[2px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111]" style={{ background: '#FFF8E1' }}>
        <p className="font-bangers text-[#111] text-sm tracking-wide mb-2">DATENVERTEILUNG:</p>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs font-comic mb-0.5">
              <span>Bezirk X ({bezirkX.length} Datensätze)</span>
              <span className="text-[#FF3B3F] font-bold">90%</span>
            </div>
            <div className="w-full h-6 bg-[#EEE] border-[1.5px] border-[#111] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '90%', background: '#FF3B3F' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-comic mb-0.5">
              <span>Bezirk Y ({bezirkY.length} Datensätze)</span>
              <span className="text-[#00C853] font-bold">10%</span>
            </div>
            <div className="w-full h-6 bg-[#EEE] border-[1.5px] border-[#111] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '10%', background: '#00C853' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type Answer = 'ja' | 'nein' | null

const QUESTIONS = [
  {
    id: 'q1',
    text: 'Sind die Daten aus beiden Bezirken gleich häufig vertreten?',
    correct: 'nein' as Answer,
    explanation: 'Nein! Bezirk X: 18 Einträge (90%), Bezirk Y: nur 2 Einträge (10%). Die Daten sind massiv ungleich verteilt!',
  },
  {
    id: 'q2',
    text: 'Kann die KI mit diesen Daten faire Entscheidungen für Bezirk Y treffen?',
    correct: 'nein' as Answer,
    explanation: 'Nein! Aus nur 2 Datensätzen aus Bezirk Y kann die KI keine zuverlässigen Muster für diesen Bezirk lernen. Alle Vorhersagen für Y-Bewohner wären sehr unsicher.',
  },
  {
    id: 'q3',
    text: 'Liegt die hohe Verdächtigkeitsrate in X an echten Verbrechen oder an der Datenerhebung?',
    correct: 'nein' as Answer, // nein = nicht an echten Verbrechen
    explanation: 'An der Datenerhebung! Die Polizei patrouilliert mehr in Bezirk X, also werden dort mehr Daten gesammelt. Das spiegelt Polizeiarbeit wider, nicht die tatsächliche Kriminalitätsrate.',
  },
]

export function BiasDetector({ onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [phase, setPhase] = useState<'analysis' | 'questions' | 'result'>('analysis')
  const [revealed, setRevealed] = useState(false)

  const allAnswered = QUESTIONS.every(q => answers[q.id] !== undefined && answers[q.id] !== null)
  const correctCount = QUESTIONS.filter(q => answers[q.id] === q.correct).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-2xl max-h-[97vh] overflow-y-auto">

        <div className="bg-[#9C27B0] border-b-[4px] border-[#111] p-4">
          <h2 className="font-bangers text-white text-2xl tracking-wider">BIAS-DETEKTOR</h2>
          <p className="font-comic text-white/80 text-sm mt-1">
            Analysiere den Datensatz der Polizei-KI
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Story box */}
          <div className="bg-[#F3E5F5] border-[2px] border-[#9C27B0] rounded-xl p-3">
            <p className="font-bangers text-[#9C27B0] text-base tracking-wide mb-1">FALL-BESCHREIBUNG:</p>
            <p className="font-comic text-[#555] text-xs leading-relaxed">
              Die Stadtpolizei hat eine KI zur Verbrechensvorhersage eingesetzt. Die KI wurde mit Daten aus den letzten 3 Jahren trainiert —
              aber 90% der Daten kamen aus Bezirk X (einem ärmeren Stadtviertel), weil dort häufiger Streifen fuhren.
              Jetzt klassifiziert die KI fast alle Bewohner aus Bezirk X als "verdächtig".
            </p>
          </div>

          {/* Data table */}
          <DataTable data={biasDataset} />

          {phase === 'analysis' && (
            <button
              onClick={() => setPhase('questions')}
              className="w-full py-3 bg-[#9C27B0] text-white border-[3px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all"
            >
              Analyse starten →
            </button>
          )}

          {phase === 'questions' && (
            <div className="space-y-3">
              <p className="font-bangers text-[#111] text-base tracking-wide">FRAGEN ZUM DATENSATZ:</p>
              {QUESTIONS.map((q) => (
                <div key={q.id} className="border-[2px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111]">
                  <p className="font-comic text-[#111] text-sm font-bold mb-2">{q.text}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 'ja' }))}
                      className="flex-1 py-2 border-[2px] border-[#111] rounded-xl font-bangers text-sm shadow-[2px_2px_0_#111] transition-all"
                      style={{ background: answers[q.id] === 'ja' ? '#00C853' : 'white', color: answers[q.id] === 'ja' ? 'white' : '#111' }}
                    >
                      Ja
                    </button>
                    <button
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 'nein' }))}
                      className="flex-1 py-2 border-[2px] border-[#111] rounded-xl font-bangers text-sm shadow-[2px_2px_0_#111] transition-all"
                      style={{ background: answers[q.id] === 'nein' ? '#FF3B3F' : 'white', color: answers[q.id] === 'nein' ? 'white' : '#111' }}
                    >
                      Nein
                    </button>
                  </div>

                  {revealed && answers[q.id] !== null && (
                    <div className={`mt-2 p-2 rounded-lg text-xs font-comic ${answers[q.id] === q.correct ? 'bg-[#C8E6C9]' : 'bg-[#FFCDD2]'}`}>
                      <span className="font-bold">{answers[q.id] === q.correct ? '✅ Richtig! ' : '❌ Falsch! '}</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {!revealed ? (
                <button
                  onClick={() => { setRevealed(true); setPhase('result') }}
                  disabled={!allAnswered}
                  className="w-full py-3 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all disabled:opacity-40"
                  style={{ background: '#FFE135', color: '#111' }}
                >
                  Antworten prüfen!
                </button>
              ) : null}
            </div>
          )}

          {phase === 'result' && revealed && (
            <div>
              <div className={`p-4 border-[3px] border-[#111] rounded-xl shadow-[3px_3px_0_#111] text-center mb-4 ${correctCount >= 2 ? 'bg-[#C8E6C9]' : 'bg-[#FFF3E0]'}`}>
                <div className="text-3xl mb-1">{correctCount === 3 ? '🔍' : '📚'}</div>
                <p className="font-bangers text-[#111] text-xl">{correctCount}/3 richtig!</p>
                <p className="font-comic text-[#555] text-sm mt-1">
                  {correctCount === 3 ? 'Du hast den Bias perfekt erkannt!' : 'Gut! Du verstehst die Grundlagen von Datenbias.'}
                </p>
              </div>
              <button
                onClick={onComplete}
                className="w-full py-3 bg-[#9C27B0] text-white border-[3px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all"
              >
                Weiter zur Ethik-Debatte! →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
