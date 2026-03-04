'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type BlankOption = {
  id: string
  text: string
}

type Sentence = {
  id: string
  parts: string[]          // Text parts split around blank (2 parts = 1 blank)
  options: BlankOption[]
  correctId: string
  explanation: string
  xp: number
}

type Props = {
  onComplete: (xp: number) => void
}

// ─── Game Data ────────────────────────────────────────────────────────────────

const SENTENCES: Sentence[] = [
  {
    id: 's1',
    parts: ['Der ', ' ist der Startpunkt des Entscheidungsbaums.'],
    options: [
      { id: 'wurzel', text: 'Wurzel' },
      { id: 'knoten', text: 'Knoten' },
      { id: 'blatt', text: 'Blatt' },
    ],
    correctId: 'wurzel',
    explanation: 'Die Wurzel ist ganz oben — die erste Frage, von der der Baum ausgeht.',
    xp: 15,
  },
  {
    id: 's2',
    parts: ['Die ', ' eines Entscheidungsbaums zeigen das Klassifikationsergebnis.'],
    options: [
      { id: 'kanten', text: 'Kanten' },
      { id: 'blaetter', text: 'Blätter' },
      { id: 'knoten', text: 'Knoten' },
    ],
    correctId: 'blaetter',
    explanation: 'Blätter sind die Endpunkte des Baums — hier steht das Ergebnis wie "verdächtig" oder "unverdächtig".',
    xp: 15,
  },
  {
    id: 's3',
    parts: ['Ein ', ' stellt eine Ja/Nein-Frage zu einem Merkmal und verzweigt den Baum.'],
    options: [
      { id: 'knoten', text: 'Knoten' },
      { id: 'blatt', text: 'Blatt' },
      { id: 'kante', text: 'Kante' },
    ],
    correctId: 'knoten',
    explanation: 'Knoten sind Verzweigungspunkte: Sie stellen eine Frage und leiten je nach Antwort weiter.',
    xp: 15,
  },
  {
    id: 's4',
    parts: ['Die ', ' verbinden zwei Knoten und zeigen den Ja- oder Nein-Pfad.'],
    options: [
      { id: 'blaetter', text: 'Blätter' },
      { id: 'kanten', text: 'Kanten' },
      { id: 'wurzeln', text: 'Wurzeln' },
    ],
    correctId: 'kanten',
    explanation: 'Kanten sind die Verbindungen — Pfeile zwischen Knoten, die "Ja" oder "Nein" anzeigen.',
    xp: 15,
  },
  {
    id: 's5',
    parts: ['Beim ', ' werden Objekte anhand ihrer Merkmale in Kategorien eingeteilt.'],
    options: [
      { id: 'sortieren', text: 'Sortieren' },
      { id: 'klassifizieren', text: 'Klassifizieren' },
      { id: 'trainieren', text: 'Trainieren' },
    ],
    correctId: 'klassifizieren',
    explanation: 'Klassifikation = Objekte anhand von Merkmalen Kategorien zuordnen — genau das macht ein Entscheidungsbaum!',
    xp: 15,
  },
  {
    id: 's6',
    parts: ['Der ', ' wird genutzt, um den Algorithmus auf bekannten Daten zu trainieren.'],
    options: [
      { id: 'testdatensatz', text: 'Testdatensatz' },
      { id: 'trainingsdatensatz', text: 'Trainingsdatensatz' },
      { id: 'validierungssatz', text: 'Validierungssatz' },
    ],
    correctId: 'trainingsdatensatz',
    explanation: 'Der Trainingsdatensatz enthält bekannte Beispiele — damit lernt der Algorithmus Muster.',
    xp: 20,
  },
]

// ─── Sentence Renderer ────────────────────────────────────────────────────────

function SentenceDisplay({
  sentence,
  selectedId,
  answered,
}: {
  sentence: Sentence
  selectedId: string | null
  answered: boolean
}) {
  const isCorrect = selectedId === sentence.correctId

  return (
    <p className="font-[family-name:var(--font-comic)] text-[#111] text-base leading-relaxed text-center">
      {sentence.parts[0]}
      <span
        className="inline-block min-w-24 mx-1 px-3 py-0.5 rounded-lg border-[2.5px] border-[#111] font-bold text-center transition-all"
        style={{
          background: !answered
            ? selectedId
              ? '#0066FF'
              : '#FFE135'
            : isCorrect
            ? '#00C853'
            : '#FF3B3F',
          color: !answered ? (selectedId ? 'white' : '#111') : 'white',
          borderStyle: !selectedId && !answered ? 'dashed' : 'solid',
        }}
      >
        {selectedId
          ? (sentence.options.find(o => o.id === selectedId)?.text ?? '___')
          : '___'}
      </span>
      {sentence.parts[1]}
    </p>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FillInTheBlank({ onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [totalXp, setTotalXp] = useState(0)
  const [results, setResults] = useState<boolean[]>([])

  const sentence = SENTENCES[currentIdx]
  const isLast = currentIdx === SENTENCES.length - 1
  const isCorrect = selectedId === sentence.correctId

  const handleSelect = (optionId: string) => {
    if (answered) return
    setSelectedId(optionId)
    setAnswered(true)

    if (optionId === sentence.correctId) {
      setTotalXp(xp => xp + sentence.xp)
    }
    setResults(r => [...r, optionId === sentence.correctId])
  }

  const handleNext = () => {
    if (isLast) {
      onComplete(totalXp + (isCorrect ? 0 : 0))
    } else {
      setCurrentIdx(i => i + 1)
      setSelectedId(null)
      setAnswered(false)
    }
  }

  const progress = (currentIdx / SENTENCES.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#0066FF] border-b-[4px] border-[#111] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-[2px] border-[#111] rounded-xl flex items-center justify-center text-xl shadow-[2px_2px_0_#111]">
                ✏️
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-bangers)] text-white text-xl tracking-wider">
                  LUCKENTEXT
                </h2>
                <p className="font-[family-name:var(--font-comic)] text-blue-200 text-xs">
                  Wähle das richtige Wort!
                </p>
              </div>
            </div>
            <div className="bg-white border-[2px] border-[#111] rounded-full px-3 py-1 font-[family-name:var(--font-bangers)] text-[#111] text-sm">
              {currentIdx + 1} / {SENTENCES.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-white/30 border-[2px] border-white/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: '#FFE135' }}
            />
          </div>
        </div>

        <div className="p-6">
          {/* Sentence with blank */}
          <div className="bg-[#FFF9E6] border-[3px] border-[#111] rounded-2xl p-5 shadow-[3px_3px_0_#111] mb-5 min-h-[80px] flex items-center justify-center">
            <SentenceDisplay
              sentence={sentence}
              selectedId={selectedId}
              answered={answered}
            />
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-3 justify-center mb-5">
            {sentence.options.map(option => {
              let bg = 'white'
              let borderColor = '#111'
              let textColor = '#111'

              if (answered) {
                if (option.id === sentence.correctId) {
                  bg = '#00C853'
                  textColor = 'white'
                } else if (option.id === selectedId && option.id !== sentence.correctId) {
                  bg = '#FF3B3F'
                  textColor = 'white'
                } else {
                  bg = '#F5F5F5'
                  textColor = '#AAA'
                  borderColor = '#DDD'
                }
              } else if (option.id === selectedId) {
                bg = '#0066FF'
                textColor = 'white'
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  disabled={answered}
                  className="px-5 py-2.5 rounded-xl border-[2.5px] font-[family-name:var(--font-bangers)] text-base tracking-wide shadow-[2px_2px_0_#111] transition-all active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:shadow-none disabled:cursor-default"
                  style={{ background: bg, borderColor, color: textColor }}
                >
                  {option.text}
                  {answered && option.id === sentence.correctId && ' ✓'}
                  {answered && option.id === selectedId && option.id !== sentence.correctId && ' ✗'}
                </button>
              )
            })}
          </div>

          {/* Feedback / Explanation */}
          {answered && (
            <div
              className="p-4 rounded-xl border-[2.5px] border-[#111] shadow-[2px_2px_0_#111] mb-4 font-[family-name:var(--font-comic)] text-sm leading-relaxed"
              style={{ background: isCorrect ? '#E8F5E9' : '#FFF3E0' }}
            >
              <span className="font-bold text-[#111]">
                {isCorrect ? '✅ Richtig! ' : '💡 Erklärung: '}
              </span>
              {sentence.explanation}
              {isCorrect && (
                <span className="ml-2 font-[family-name:var(--font-bangers)] text-[#00C853]">
                  +{sentence.xp} XP
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {results.map((correct, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full border-[1.5px] border-[#111]"
                  style={{ background: correct ? '#00C853' : '#FF3B3F' }}
                />
              ))}
              {Array.from({ length: SENTENCES.length - results.length }).map((_, i) => (
                <div
                  key={`pending-${i}`}
                  className="w-3 h-3 rounded-full border-[1.5px] border-[#DDD] bg-[#EEE]"
                />
              ))}
            </div>

            {answered && (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl border-[2.5px] border-[#111] font-[family-name:var(--font-bangers)] text-base tracking-wide shadow-[2px_2px_0_#111] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
                style={{ background: '#0066FF', color: 'white' }}
              >
                {isLast ? `Fertig! (+${totalXp + (isCorrect ? sentence.xp : 0)} XP)` : 'Nächster Satz →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
