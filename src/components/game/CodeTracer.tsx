'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type CodeLine = {
  id: string
  indent: number
  text: string
  isCondition?: boolean
  branchYes?: string   // line id to jump to if condition is true
  branchNo?: string    // line id to jump to if condition is false
  result?: 'verdächtig' | 'unverdächtig'
  isEnd?: boolean
}

type TracerObject = {
  id: string
  name: string
  emoji: string
  hat: boolean
  coat: boolean
  beard: boolean
  glasses: boolean
}

type TraceStep = {
  lineId: string
  answer?: boolean
}

type TracerTask = {
  id: string
  object: TracerObject
  description: string
}

type Props = {
  onComplete: (xp: number) => void
}

// ─── Pseudo-Code Definition ───────────────────────────────────────────────────

const CODE_LINES: CodeLine[] = [
  { id: 'l0', indent: 0, text: 'FUNKTION klassifiziere(person):' },
  { id: 'l1', indent: 1, text: 'WENN person.hat == JA:' , isCondition: true, branchYes: 'l2', branchNo: 'l7' },
  { id: 'l2', indent: 2, text: 'WENN person.mantel == JA:', isCondition: true, branchYes: 'l3', branchNo: 'l5' },
  { id: 'l3', indent: 3, text: 'GEBE ZURÜCK "verdächtig"', result: 'verdächtig' },
  { id: 'l4', indent: 2, text: '' }, // spacer (else)
  { id: 'l5', indent: 3, text: 'GEBE ZURÜCK "verdächtig" (Bart?)', result: 'verdächtig' },
  { id: 'l6', indent: 1, text: '' }, // spacer
  { id: 'l7', indent: 1, text: 'GEBE ZURÜCK "unverdächtig"', result: 'unverdächtig' },
  { id: 'l8', indent: 0, text: 'ENDE' , isEnd: true },
]

// Simplified linear walkable lines (only the branching ones need interaction)
type InteractLine = {
  id: string
  lineText: string
  trueLabel: string
  falseLabel: string
  attribute: keyof TracerObject
}

const INTERACT_LINES: InteractLine[] = [
  {
    id: 'l1',
    lineText: 'WENN person.hat == JA:',
    trueLabel: 'JA (hat Hut)',
    falseLabel: 'NEIN (kein Hut)',
    attribute: 'hat',
  },
  {
    id: 'l2',
    lineText: 'WENN person.mantel == JA:',
    trueLabel: 'JA (hat Mantel)',
    falseLabel: 'NEIN (kein Mantel)',
    attribute: 'coat',
  },
]

const TASKS: TracerTask[] = [
  {
    id: 't1',
    object: { id: 'o1', name: 'Gustav G.', emoji: '🕵️', hat: true, coat: true, beard: false, glasses: false },
    description: 'Trägt Hut und Mantel',
  },
  {
    id: 't2',
    object: { id: 'o2', name: 'Maria M.', emoji: '👩', hat: false, coat: true, beard: false, glasses: true },
    description: 'Kein Hut, aber Mantel',
  },
  {
    id: 't3',
    object: { id: 'o3', name: 'Boris B.', emoji: '🧔', hat: true, coat: false, beard: true, glasses: false },
    description: 'Hat Hut, aber kein Mantel',
  },
]

// ─── Code Display ─────────────────────────────────────────────────────────────

function CodeDisplay({
  activeLineId,
  highlightPath,
  result,
}: {
  activeLineId: string | null
  highlightPath: string[]
  result: 'verdächtig' | 'unverdächtig' | null
}) {
  const displayLines: { id: string; indent: number; text: string; isResult?: boolean }[] = [
    { id: 'l0', indent: 0, text: 'FUNKTION klassifiziere(person):' },
    { id: 'l1', indent: 1, text: 'WENN person.hat == JA:' },
    { id: 'l2', indent: 2, text: '  WENN person.mantel == JA:' },
    { id: 'l3', indent: 3, text: '    GEBE ZURÜCK "verdächtig"', isResult: true },
    { id: 'l2b', indent: 2, text: '  SONST:' },
    { id: 'l5', indent: 3, text: '    GEBE ZURÜCK "verdächtig"', isResult: true },
    { id: 'l1b', indent: 1, text: 'SONST:' },
    { id: 'l7', indent: 1, text: '  GEBE ZURÜCK "unverdächtig"', isResult: true },
    { id: 'l8', indent: 0, text: 'ENDE' },
  ]

  return (
    <div className="bg-[#1E1E2E] border-[3px] border-[#111] rounded-xl overflow-hidden shadow-[3px_3px_0_#111]">
      {/* Code editor header */}
      <div className="bg-[#2D2D3F] px-3 py-2 flex items-center gap-2 border-b border-[#444]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF3B3F]" />
          <div className="w-3 h-3 rounded-full bg-[#FFE135]" />
          <div className="w-3 h-3 rounded-full bg-[#00C853]" />
        </div>
        <span className="font-mono text-[#888] text-xs ml-1">entscheidungsbaum.pseudo</span>
      </div>

      <div className="p-3 font-mono text-xs leading-6">
        {displayLines.map((line, idx) => {
          const isActive = activeLineId === line.id
          const isVisited = highlightPath.includes(line.id)

          let lineColor = '#CDD6F4'
          let bg = 'transparent'
          let prefix = ' '

          if (isActive) {
            bg = 'rgba(255,225,53,0.2)'
            lineColor = '#FFE135'
            prefix = '►'
          } else if (isVisited) {
            bg = 'rgba(0,200,83,0.1)'
            lineColor = '#A6E3A1'
          }

          if (line.text === '') return null

          return (
            <div
              key={`${line.id}-${idx}`}
              className="flex items-center gap-2 rounded px-1 transition-all"
              style={{ background: bg }}
            >
              <span className="text-[#45475A] w-5 text-right select-none">{idx + 1}</span>
              <span
                className="w-3 text-center font-bold transition-all"
                style={{ color: isActive ? '#FFE135' : 'transparent' }}
              >
                {prefix}
              </span>
              <span
                className="transition-all"
                style={{
                  color: line.isResult
                    ? (line.text.includes('verdächtig') ? '#F38BA8' : '#A6E3A1')
                    : line.id.startsWith('l0') || line.id === 'l8'
                    ? '#CBA6F7'
                    : line.text.startsWith('  WENN') || line.text.startsWith('WENN')
                    ? '#89DCEB'
                    : line.text.startsWith('  SONST') || line.text.startsWith('SONST')
                    ? '#89DCEB'
                    : lineColor,
                }}
              >
                {line.text}
              </span>
            </div>
          )
        })}
      </div>

      {result && (
        <div
          className="border-t border-[#444] px-3 py-2 font-mono text-xs"
          style={{ color: result === 'verdächtig' ? '#F38BA8' : '#A6E3A1' }}
        >
          Ergebnis: &quot;{result}&quot;
        </div>
      )}
    </div>
  )
}

// ─── Object Display ───────────────────────────────────────────────────────────

function ObjectCard({ obj }: { obj: TracerObject }) {
  return (
    <div className="bg-white border-[2.5px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111]">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{obj.emoji}</span>
        <div>
          <p className="font-[family-name:var(--font-bangers)] text-[#111] text-base tracking-wide">{obj.name}</p>
          <p className="font-[family-name:var(--font-comic)] text-[#666] text-xs">Objekt untersuchen</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { key: 'hat', label: 'Hut', val: obj.hat },
          { key: 'coat', label: 'Mantel', val: obj.coat },
          { key: 'beard', label: 'Bart', val: obj.beard },
          { key: 'glasses', label: 'Brille', val: obj.glasses },
        ].map(({ label, val }) => (
          <div
            key={label}
            className="flex items-center justify-between px-2 py-1 rounded-lg border border-[#DDD] font-[family-name:var(--font-comic)] text-xs"
            style={{ background: val ? '#E8F5E9' : '#FFEBEE' }}
          >
            <span className="text-[#666]">{label}:</span>
            <span className={`font-bold ${val ? 'text-[#00C853]' : 'text-[#FF3B3F]'}`}>
              {val ? 'JA' : 'NEIN'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CodeTracer({ onComplete }: Props) {
  const [taskIdx, setTaskIdx] = useState(0)
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([])
  const [currentInteractIdx, setCurrentInteractIdx] = useState(0)
  const [taskResult, setTaskResult] = useState<'verdächtig' | 'unverdächtig' | null>(null)
  const [playerChoice, setPlayerChoice] = useState<boolean | null>(null)
  const [totalXp, setTotalXp] = useState(0)
  const [taskResults, setTaskResults] = useState<{ correct: boolean; xp: number }[]>([])
  const [phase, setPhase] = useState<'tracing' | 'feedback' | 'summary'>('tracing')

  const currentTask = TASKS[taskIdx]
  const currentObject = currentTask.object
  const isLastTask = taskIdx === TASKS.length - 1

  // Determine active line from trace steps
  const getActiveLineId = (): string | null => {
    if (traceSteps.length === 0) return 'l1'
    if (taskResult) return null

    const interactLine = INTERACT_LINES[currentInteractIdx]
    return interactLine?.id ?? null
  }

  const getHighlightPath = (): string[] => {
    const path: string[] = ['l0']
    for (let i = 0; i < traceSteps.length; i++) {
      const step = traceSteps[i]
      path.push(step.lineId)
      if (step.answer === true) {
        // Following yes branch
        const nextInteract = INTERACT_LINES[i + 1]
        if (nextInteract) path.push(nextInteract.id)
      }
    }
    if (taskResult) {
      if (traceSteps.length >= 1 && traceSteps[0].answer === false) {
        path.push('l7')
      } else if (traceSteps.length >= 2 && traceSteps[1].answer === true) {
        path.push('l3')
      } else if (traceSteps.length >= 2 && traceSteps[1].answer === false) {
        path.push('l5')
      }
    }
    return path
  }

  // Expected answer for current interact line
  const getExpectedAnswer = (): boolean => {
    const interactLine = INTERACT_LINES[currentInteractIdx]
    return currentObject[interactLine.attribute] as boolean
  }

  // Compute final result from trace
  const computeResult = (steps: TraceStep[]): 'verdächtig' | 'unverdächtig' => {
    if (steps[0]?.answer === false) return 'unverdächtig'
    if (steps[1]?.answer === true) return 'verdächtig'
    if (steps[1]?.answer === false) return 'verdächtig' // Bart branch simplified
    return 'unverdächtig'
  }

  const handleChoice = (answer: boolean) => {
    const expected = getExpectedAnswer()
    const isCorrect = answer === expected
    const interactLine = INTERACT_LINES[currentInteractIdx]
    const newSteps = [...traceSteps, { lineId: interactLine.id, answer }]
    setTraceSteps(newSteps)
    setPlayerChoice(answer)

    if (!isCorrect) {
      // Wrong choice — show feedback then reset
      setTimeout(() => {
        setPlayerChoice(null)
        setTraceSteps([])
        setCurrentInteractIdx(0)
      }, 1200)
      return
    }

    // Correct — advance
    if (answer === false || currentInteractIdx === INTERACT_LINES.length - 1) {
      // Reached a leaf
      const result = computeResult(newSteps)
      setTaskResult(result)
      setPhase('feedback')

      const xpForTask = 20
      setTotalXp(prev => prev + xpForTask)
      setTaskResults(prev => [...prev, { correct: true, xp: xpForTask }])
    } else {
      // Move to next condition
      setTimeout(() => {
        setPlayerChoice(null)
        setCurrentInteractIdx(i => i + 1)
      }, 400)
    }
  }

  const handleNextTask = () => {
    if (isLastTask) {
      setPhase('summary')
    } else {
      setTaskIdx(i => i + 1)
      setTraceSteps([])
      setCurrentInteractIdx(0)
      setTaskResult(null)
      setPlayerChoice(null)
      setPhase('tracing')
    }
  }

  if (phase === 'summary') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-md overflow-hidden">
          <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4 text-center">
            <div className="text-5xl mb-2">💻</div>
            <h2 className="font-[family-name:var(--font-bangers)] text-[#111] text-2xl tracking-wider">
              CODE TRACER ABGESCHLOSSEN!
            </h2>
          </div>
          <div className="p-5">
            <p className="font-[family-name:var(--font-comic)] text-[#555] text-sm text-center mb-4">
              Du hast gelernt, wie ein Algorithmus Schritt für Schritt Entscheidungen trifft!
            </p>

            <div className="space-y-2 mb-4">
              {taskResults.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]"
                  style={{ background: r.correct ? '#E8F5E9' : '#FFEBEE' }}
                >
                  <span className="text-xl">{TASKS[i].object.emoji}</span>
                  <span className="font-[family-name:var(--font-comic)] text-[#111] text-sm flex-1">
                    {TASKS[i].object.name}
                  </span>
                  <span className="font-[family-name:var(--font-bangers)] text-sm text-[#00C853]">
                    +{r.xp} XP
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[#FFE135] border-[3px] border-[#111] rounded-xl px-4 py-3 text-center shadow-[3px_3px_0_#111] mb-3">
              <span className="font-[family-name:var(--font-bangers)] text-[#111] text-2xl">
                +{totalXp} XP erworben!
              </span>
            </div>

            <button
              onClick={() => onComplete(totalXp)}
              className="w-full py-3 bg-[#0066FF] text-white border-[3px] border-[#111] rounded-xl font-[family-name:var(--font-bangers)] text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              Weiter! →
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentInteractLine = INTERACT_LINES[currentInteractIdx]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div
        className="bg-[#FFF9E6] border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-3xl"
        style={{ maxHeight: '97vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="bg-[#1E1E2E] border-b-[4px] border-[#111] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFE135] border-[2px] border-[#111] rounded-xl flex items-center justify-center text-xl shadow-[2px_2px_0_#111]">
                💻
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-bangers)] text-white text-xl tracking-wider">
                  CODE TRACER
                </h2>
                <p className="font-[family-name:var(--font-comic)] text-[#888] text-xs">
                  Verfolge den Algorithmus Schritt für Schritt
                </p>
              </div>
            </div>
            <div className="bg-[#2D2D3F] border-[2px] border-[#444] rounded-full px-3 py-1 font-[family-name:var(--font-bangers)] text-[#CDD6F4] text-sm">
              Aufgabe {taskIdx + 1} / {TASKS.length}
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Code + Object */}
          <div className="space-y-3">
            {/* Code display */}
            <CodeDisplay
              activeLineId={phase === 'tracing' ? getActiveLineId() : null}
              highlightPath={getHighlightPath()}
              result={taskResult}
            />

            {/* Object info */}
            <ObjectCard obj={currentObject} />
          </div>

          {/* Right: Interactive panel */}
          <div className="space-y-3">
            {/* Task description */}
            <div className="bg-white border-[2.5px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111]">
              <p className="font-[family-name:var(--font-bangers)] text-[#111] text-base tracking-wide mb-1">
                AUFGABE: VERFOLGE DEN PFAD!
              </p>
              <p className="font-[family-name:var(--font-comic)] text-[#555] text-xs leading-relaxed">
                Klicke auf JA oder NEIN um den richtigen Pfad durch den Code zu verfolgen.
                Schaue dir die Merkmale des Objekts an!
              </p>
            </div>

            {/* Current step indicator */}
            <div className="flex gap-1.5">
              {INTERACT_LINES.map((line, i) => (
                <div
                  key={line.id}
                  className="flex-1 h-2 rounded-full border border-[#111] transition-all"
                  style={{
                    background: i < currentInteractIdx
                      ? '#00C853'
                      : i === currentInteractIdx
                      ? '#FFE135'
                      : '#DDD',
                  }}
                />
              ))}
              {taskResult && (
                <div className="flex-1 h-2 rounded-full border border-[#111] bg-[#0066FF]" />
              )}
            </div>

            {/* Active condition */}
            {phase === 'tracing' && currentInteractLine && (
              <div className="bg-[#1E1E2E] border-[2.5px] border-[#0066FF] rounded-xl p-3 shadow-[2px_2px_0_#0066FF]">
                <p className="font-[family-name:var(--font-bangers)] text-[#89DCEB] text-xs tracking-wide mb-1">
                  AKTUELLER SCHRITT:
                </p>
                <p className="font-mono text-[#FFE135] text-sm mb-3">
                  {currentInteractLine.lineText}
                </p>
                <p className="font-[family-name:var(--font-comic)] text-[#CDD6F4] text-xs mb-3">
                  Welchen Pfad nimmt der Algorithmus für{' '}
                  <span className="font-bold text-white">{currentObject.name}</span>?
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleChoice(true)}
                    disabled={playerChoice !== null}
                    className="flex-1 py-2.5 rounded-xl border-[2.5px] border-[#111] font-[family-name:var(--font-bangers)] text-sm tracking-wide shadow-[2px_2px_0_#111] transition-all active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: playerChoice === true
                        ? (playerChoice === getExpectedAnswer() ? '#00C853' : '#FF3B3F')
                        : '#00C853',
                      color: 'white',
                    }}
                  >
                    ✓ JA
                  </button>
                  <button
                    onClick={() => handleChoice(false)}
                    disabled={playerChoice !== null}
                    className="flex-1 py-2.5 rounded-xl border-[2.5px] border-[#111] font-[family-name:var(--font-bangers)] text-sm tracking-wide shadow-[2px_2px_0_#111] transition-all active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: playerChoice === false
                        ? (playerChoice === getExpectedAnswer() ? '#00C853' : '#FF3B3F')
                        : '#FF3B3F',
                      color: 'white',
                    }}
                  >
                    ✗ NEIN
                  </button>
                </div>

                {playerChoice !== null && playerChoice !== getExpectedAnswer() && (
                  <p className="font-[family-name:var(--font-comic)] text-[#FF3B3F] text-xs mt-2 text-center font-bold">
                    Falsch! Schaue nochmal auf die Merkmale...
                  </p>
                )}
              </div>
            )}

            {/* Result feedback */}
            {phase === 'feedback' && taskResult && (
              <div
                className="border-[3px] border-[#111] rounded-xl p-4 shadow-[3px_3px_0_#111]"
                style={{ background: taskResult === 'verdächtig' ? '#FFEBEE' : '#E8F5E9' }}
              >
                <div className="text-center mb-3">
                  <span className="text-4xl">{taskResult === 'verdächtig' ? '🔴' : '🟢'}</span>
                  <p className="font-[family-name:var(--font-bangers)] text-[#111] text-lg tracking-wide mt-1">
                    ERGEBNIS: {taskResult.toUpperCase()}!
                  </p>
                </div>
                <p className="font-[family-name:var(--font-comic)] text-[#555] text-xs leading-relaxed mb-1">
                  Der Algorithmus hat den Code Zeile für Zeile ausgeführt und alle Bedingungen geprüft.
                </p>
                <p className="font-[family-name:var(--font-bangers)] text-[#00C853] text-sm text-center">
                  +20 XP
                </p>
                <button
                  onClick={handleNextTask}
                  className="w-full mt-3 py-2.5 bg-[#0066FF] text-white border-[2.5px] border-[#111] rounded-xl font-[family-name:var(--font-bangers)] text-base tracking-wide shadow-[2px_2px_0_#111] active:shadow-none transition-all"
                >
                  {isLastTask ? 'Auswertung →' : 'Nächstes Objekt →'}
                </button>
              </div>
            )}

            {/* Previous results */}
            {taskResults.length > 0 && (
              <div className="bg-white border-[2px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111]">
                <p className="font-[family-name:var(--font-bangers)] text-[#111] text-xs tracking-wide mb-1.5 opacity-70">
                  BISHERIGE ERGEBNISSE:
                </p>
                {taskResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 font-[family-name:var(--font-comic)] text-xs text-[#00C853]">
                    <span>✅</span>
                    <span>{TASKS[i].object.emoji} {TASKS[i].object.name}</span>
                    <span className="ml-auto font-bold">+{r.xp} XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
