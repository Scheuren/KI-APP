'use client'

import { useState } from 'react'
import {
  trainingSuspects,
  testSuspects,
  ATTRIBUTE_LABELS,
  ATTRIBUTES,
  type LabeledSuspect,
  type Attribute,
} from '@/lib/game/level3Data'

type Props = {
  onComplete: (xp: number) => void
}

// ─── Tree structure ───────────────────────────────────────────────────────────

type TreeNodeBuilt = {
  id: string
  attribute?: Attribute
  result?: 'verdächtig' | 'unverdächtig'
  yesChild?: TreeNodeBuilt
  noChild?: TreeNodeBuilt
}

function classifyWithBuiltTree(node: TreeNodeBuilt, suspect: LabeledSuspect): 'verdächtig' | 'unverdächtig' | null {
  if (node.result !== undefined) return node.result
  if (!node.attribute) return null
  const val = suspect[node.attribute]
  const next = val ? node.yesChild : node.noChild
  if (!next) return null
  return classifyWithBuiltTree(next, suspect)
}

function calcAccuracy(root: TreeNodeBuilt, data: LabeledSuspect[]): number {
  let correct = 0
  for (const s of data) {
    const pred = classifyWithBuiltTree(root, s)
    if (pred === s.label) correct++
  }
  return Math.round((correct / data.length) * 100)
}

// ─── Data Sort Minigame ───────────────────────────────────────────────────────

type DataSortProps = {
  onComplete: () => void
}

function DataSortGame({ onComplete }: DataSortProps) {
  const allData = [...trainingSuspects, ...testSuspects]
  const [training, setTraining] = useState<string[]>([])
  const [test, setTest] = useState<string[]>([])
  const [unassigned, setUnassigned] = useState<string[]>(allData.map(s => s.id))
  const [phase, setPhase] = useState<'sorting' | 'result'>('sorting')

  const assign = (id: string, target: 'training' | 'test') => {
    setUnassigned(u => u.filter(x => x !== id))
    setTraining(t => t.filter(x => x !== id))
    setTest(t => t.filter(x => x !== id))
    if (target === 'training') setTraining(t => [...t, id])
    else setTest(t => [...t, id])
  }

  const remove = (id: string) => {
    setTraining(t => t.filter(x => x !== id))
    setTest(t => t.filter(x => x !== id))
    setUnassigned(u => [...u, id])
  }

  const check = () => {
    setPhase('result')
  }

  // Correct is 8 training + 2 test
  const trainingCorrect = training.filter(id => trainingSuspects.some(s => s.id === id)).length
  const testCorrect = test.filter(id => testSuspects.some(s => s.id === id)).length
  const isCorrect = training.length === 8 && test.length === 2 && trainingCorrect === 8 && testCorrect === 2

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-2xl max-h-[97vh] overflow-y-auto">
        <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4">
          <h2 className="font-bangers text-[#111] text-2xl tracking-wider">MINIGAME: DATENSÄTZE SORTIEREN</h2>
          <p className="font-comic text-[#555] text-sm mt-1">
            80/20 Split: Ziehe 8 in Training und 2 in Test
          </p>
        </div>

        <div className="p-4">
          {/* Unassigned pool */}
          {unassigned.length > 0 && (
            <div className="mb-4">
              <p className="font-bangers text-[#111] text-base tracking-wide mb-2">ALLE DATENSÄTZE ({unassigned.length} verbleibend):</p>
              <div className="flex flex-wrap gap-2">
                {unassigned.map(id => {
                  const s = allData.find(x => x.id === id)!
                  return (
                    <div key={id} className="border-[2px] border-[#111] rounded-xl p-2 bg-slate-50 shadow-[2px_2px_0_#111] w-28">
                      <div className="text-2xl text-center">{s.emoji}</div>
                      <p className="font-comic text-[#111] text-xs text-center mt-0.5">{s.name}</p>
                      <div className="flex gap-1 mt-1.5">
                        <button
                          onClick={() => assign(id, 'training')}
                          className="flex-1 py-1 bg-[#0066FF] text-white font-bangers text-[10px] tracking-wide rounded border-[1.5px] border-[#111] shadow-[1px_1px_0_#111]"
                        >
                          Train
                        </button>
                        <button
                          onClick={() => assign(id, 'test')}
                          className="flex-1 py-1 bg-[#9C27B0] text-white font-bangers text-[10px] tracking-wide rounded border-[1.5px] border-[#111] shadow-[1px_1px_0_#111]"
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Training */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#0066FF] text-white font-bangers text-sm px-3 py-1 rounded-full border-[2px] border-[#111]">
                  TRAINING ({training.length}/8)
                </div>
                <span className={`text-xs font-comic ${training.length === 8 ? 'text-[#00C853]' : 'text-[#888]'}`}>
                  {training.length === 8 ? '✓ Perfekt!' : `${8 - training.length} fehlen`}
                </span>
              </div>
              <div className="min-h-16 border-[2px] border-dashed border-[#0066FF] rounded-xl p-2 flex flex-wrap gap-2" style={{ background: '#E3F2FD' }}>
                {training.map(id => {
                  const s = allData.find(x => x.id === id)!
                  return (
                    <div key={id} className="flex items-center gap-1.5 bg-white border-[1.5px] border-[#111] rounded-lg px-2 py-1 cursor-pointer hover:bg-red-50" onClick={() => remove(id)}>
                      <span className="text-sm">{s.emoji}</span>
                      <span className="font-comic text-[#111] text-xs">{s.name.split(' ')[0]}</span>
                      <span className="text-[#FF3B3F] text-xs">✕</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Test */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#9C27B0] text-white font-bangers text-sm px-3 py-1 rounded-full border-[2px] border-[#111]">
                  TEST ({test.length}/2)
                </div>
                <span className={`text-xs font-comic ${test.length === 2 ? 'text-[#00C853]' : 'text-[#888]'}`}>
                  {test.length === 2 ? '✓ Perfekt!' : `${2 - test.length} fehlen`}
                </span>
              </div>
              <div className="min-h-16 border-[2px] border-dashed border-[#9C27B0] rounded-xl p-2 flex flex-wrap gap-2" style={{ background: '#F3E5F5' }}>
                {test.map(id => {
                  const s = allData.find(x => x.id === id)!
                  return (
                    <div key={id} className="flex items-center gap-1.5 bg-white border-[1.5px] border-[#111] rounded-lg px-2 py-1 cursor-pointer hover:bg-red-50" onClick={() => remove(id)}>
                      <span className="text-sm">{s.emoji}</span>
                      <span className="font-comic text-[#111] text-xs">{s.name.split(' ')[0]}</span>
                      <span className="text-[#FF3B3F] text-xs">✕</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="mt-3 bg-slate-50 border-[2px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111]">
            <p className="font-comic text-[#111] text-xs leading-relaxed">
              <span className="font-bold text-[#0066FF]">80/20 Split:</span> Typisch in der KI! 80% der Daten werden zum Trainieren verwendet, 20% zum Testen.
              Bei 10 Datensätzen = <span className="font-bold">8 Training + 2 Test</span>.
            </p>
          </div>

          {phase === 'sorting' ? (
            <button
              onClick={check}
              disabled={unassigned.length > 0 || training.length !== 8 || test.length !== 2}
              className="w-full mt-4 py-3 border-[3px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#FFE135', color: '#111' }}
            >
              Auswertung!
            </button>
          ) : (
            <div>
              <div
                className={`mt-4 p-4 border-[3px] border-[#111] rounded-xl shadow-[3px_3px_0_#111] text-center ${isCorrect ? 'bg-[#C8E6C9]' : 'bg-[#FFF3E0]'}`}
              >
                {isCorrect ? (
                  <>
                    <div className="text-3xl mb-1">🎯</div>
                    <p className="font-bangers text-[#111] text-lg">Perfekt! 80/20 Split korrekt!</p>
                    <p className="font-comic text-[#555] text-xs mt-1">8 Trainingsdaten und 2 Testdaten — genau richtig!</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-1">💡</div>
                    <p className="font-bangers text-[#111] text-lg">Fast! Schau nochmal genau hin</p>
                    <p className="font-comic text-[#555] text-xs mt-1">Du brauchst genau 8 in Training und 2 in Test (die letzten beiden: Ivan und Julia)</p>
                  </>
                )}
              </div>
              <button
                onClick={onComplete}
                className="w-full mt-3 py-3 bg-[#0066FF] text-white border-[3px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all"
              >
                Weiter zum Baum-Baukasten! →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tree Builder ─────────────────────────────────────────────────────────────

type BuilderState = {
  root: 'hat' | 'coat' | 'beard' | 'briefcase' | null
  level2Yes: 'hat' | 'coat' | 'beard' | 'briefcase' | null
  level2No: 'hat' | 'coat' | 'beard' | 'briefcase' | null
}

function buildTree(state: BuilderState): TreeNodeBuilt | null {
  if (!state.root) return null

  const buildLeaf = (data: LabeledSuspect[]): TreeNodeBuilt => {
    const vCount = data.filter(s => s.label === 'verdächtig').length
    return { id: 'leaf', result: vCount >= data.length / 2 ? 'verdächtig' : 'unverdächtig' }
  }

  const rootAttr = state.root
  const yesSuspects = trainingSuspects.filter(s => s[rootAttr])
  const noSuspects = trainingSuspects.filter(s => !s[rootAttr])

  let yesChild: TreeNodeBuilt
  let noChild: TreeNodeBuilt

  if (state.level2Yes) {
    const attr = state.level2Yes
    const yyS = yesSuspects.filter(s => s[attr])
    const ynS = yesSuspects.filter(s => !s[attr])
    yesChild = {
      id: 'n_yes',
      attribute: attr,
      yesChild: buildLeaf(yyS.length ? yyS : yesSuspects),
      noChild: buildLeaf(ynS.length ? ynS : yesSuspects),
    }
  } else {
    yesChild = buildLeaf(yesSuspects)
  }

  if (state.level2No) {
    const attr = state.level2No
    const nyS = noSuspects.filter(s => s[attr])
    const nnS = noSuspects.filter(s => !s[attr])
    noChild = {
      id: 'n_no',
      attribute: attr,
      yesChild: buildLeaf(nyS.length ? nyS : noSuspects),
      noChild: buildLeaf(nnS.length ? nnS : noSuspects),
    }
  } else {
    noChild = buildLeaf(noSuspects)
  }

  return {
    id: 'root',
    attribute: rootAttr,
    yesChild,
    noChild,
  }
}

function AttributeSelector({
  value,
  onChange,
  label,
  exclude,
}: {
  value: Attribute | null
  onChange: (a: Attribute | null) => void
  label: string
  exclude?: (Attribute | null)[]
}) {
  return (
    <div>
      <p className="font-comic text-[#666] text-xs mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {ATTRIBUTES.filter(a => !(exclude ?? []).includes(a)).map(attr => (
          <button
            key={attr}
            onClick={() => onChange(value === attr ? null : attr)}
            className="px-3 py-1.5 text-xs font-bangers tracking-wide rounded-lg border-[2px] border-[#111] shadow-[2px_2px_0_#111] transition-all active:shadow-none"
            style={{
              background: value === attr ? '#FFE135' : 'white',
              color: '#111',
            }}
          >
            {ATTRIBUTE_LABELS[attr]}
          </button>
        ))}
        <button
          onClick={() => onChange(null)}
          className="px-3 py-1.5 text-xs font-bangers tracking-wide rounded-lg border-[2px] border-[#111] shadow-[2px_2px_0_#111] transition-all"
          style={{ background: value === null ? '#EEE' : 'white', color: '#888' }}
        >
          (Blatt)
        </button>
      </div>
    </div>
  )
}

type TreeBuilderGameProps = {
  onComplete: (xp: number) => void
}

function TreeBuilderGame({ onComplete }: TreeBuilderGameProps) {
  const [state, setState] = useState<BuilderState>({
    root: null,
    level2Yes: null,
    level2No: null,
  })
  const [tested, setTested] = useState(false)
  const [trainAcc, setTrainAcc] = useState<number | null>(null)
  const [testAcc, setTestAcc] = useState<number | null>(null)

  const tree = buildTree(state)

  const testTree = () => {
    if (!tree) return
    const ta = calcAccuracy(tree, trainingSuspects)
    const te = calcAccuracy(tree, testSuspects)
    setTrainAcc(ta)
    setTestAcc(te)
    setTested(true)
  }

  const xp = (() => {
    if (trainAcc === null) return 0
    const avg = trainAcc
    if (avg >= 80) return 75
    if (avg >= 60) return 50
    return 25
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-2xl max-h-[97vh] overflow-y-auto">
        <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4">
          <h2 className="font-bangers text-[#111] text-2xl tracking-wider">BAUM-BAUKASTEN</h2>
          <p className="font-comic text-[#555] text-sm mt-1">
            Wähle Merkmale für jeden Knoten — dann teste deinen Baum!
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Selector controls */}
          <div className="bg-slate-50 border-[2px] border-[#111] rounded-xl p-4 shadow-[2px_2px_0_#111] space-y-4">
            <AttributeSelector
              value={state.root}
              onChange={v => setState(s => ({ ...s, root: v as Attribute | null }))}
              label="WURZEL (erste Frage):"
            />
            {state.root && (
              <>
                <AttributeSelector
                  value={state.level2Yes}
                  onChange={v => setState(s => ({ ...s, level2Yes: v as Attribute | null }))}
                  label={`NACH JA bei ${ATTRIBUTE_LABELS[state.root]} — zweite Frage:`}
                  exclude={[state.root]}
                />
                <AttributeSelector
                  value={state.level2No}
                  onChange={v => setState(s => ({ ...s, level2No: v as Attribute | null }))}
                  label={`NACH NEIN bei ${ATTRIBUTE_LABELS[state.root]} — zweite Frage:`}
                  exclude={[state.root]}
                />
              </>
            )}
          </div>

          {/* Live tree preview SVG */}
          <div className="bg-white border-[2px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111]">
            <p className="font-bangers text-[#111] text-sm tracking-wide mb-2 text-center">DEIN BAUM (Vorschau)</p>
            <svg viewBox="0 0 500 260" className="w-full" style={{ maxHeight: 200 }}>
              {/* Root */}
              <rect x={180} y={20} width={140} height={38} rx={8} fill={state.root ? '#FFE135' : '#EEE'} stroke="#111" strokeWidth={2} />
              <text x={250} y={36} textAnchor="middle" fill="#111" fontSize={11} fontWeight="bold">
                {state.root ? ATTRIBUTE_LABELS[state.root] : '?? Wähle Wurzel'}
              </text>
              <text x={250} y={50} textAnchor="middle" fill="#888" fontSize={9}>Wurzel</text>

              {state.root && (
                <>
                  {/* Edges from root */}
                  <line x1={250} y1={58} x2={120} y2={118} stroke="#0066FF" strokeWidth={2} />
                  <text x={165} y={88} fill="#00C853" fontSize={11} fontWeight="bold">Ja</text>
                  <line x1={250} y1={58} x2={390} y2={118} stroke="#0066FF" strokeWidth={2} />
                  <text x={325} y={88} fill="#FF3B3F" fontSize={11} fontWeight="bold">Nein</text>

                  {/* Yes branch */}
                  <rect x={52} y={118} width={136} height={36} rx={8} fill={state.level2Yes ? '#E3F2FD' : '#F5F5F5'} stroke="#0066FF" strokeWidth={2} />
                  <text x={120} y={133} textAnchor="middle" fill="#111" fontSize={10} fontWeight="bold">
                    {state.level2Yes ? ATTRIBUTE_LABELS[state.level2Yes] : '(Blatt — automatisch)'}
                  </text>
                  <text x={120} y={147} textAnchor="middle" fill="#888" fontSize={8}>Ja-Ast</text>

                  {/* No branch */}
                  <rect x={322} y={118} width={136} height={36} rx={8} fill={state.level2No ? '#E3F2FD' : '#F5F5F5'} stroke="#0066FF" strokeWidth={2} />
                  <text x={390} y={133} textAnchor="middle" fill="#111" fontSize={10} fontWeight="bold">
                    {state.level2No ? ATTRIBUTE_LABELS[state.level2No] : '(Blatt — automatisch)'}
                  </text>
                  <text x={390} y={147} textAnchor="middle" fill="#888" fontSize={8}>Nein-Ast</text>

                  {/* Level 3 leaves — simplified */}
                  <line x1={120} y1={154} x2={80} y2={210} stroke="#CCC" strokeWidth={1.5} />
                  <line x1={120} y1={154} x2={160} y2={210} stroke="#CCC" strokeWidth={1.5} />
                  <rect x={38} y={210} width={84} height={28} rx={14} fill="#EEEEEE" stroke="#AAA" strokeWidth={1.5} />
                  <text x={80} y={228} textAnchor="middle" fill="#555" fontSize={8}>Ergebnis</text>
                  <rect x={118} y={210} width={84} height={28} rx={14} fill="#EEEEEE" stroke="#AAA" strokeWidth={1.5} />
                  <text x={160} y={228} textAnchor="middle" fill="#555" fontSize={8}>Ergebnis</text>

                  <line x1={390} y1={154} x2={350} y2={210} stroke="#CCC" strokeWidth={1.5} />
                  <line x1={390} y1={154} x2={430} y2={210} stroke="#CCC" strokeWidth={1.5} />
                  <rect x={308} y={210} width={84} height={28} rx={14} fill="#EEEEEE" stroke="#AAA" strokeWidth={1.5} />
                  <text x={350} y={228} textAnchor="middle" fill="#555" fontSize={8}>Ergebnis</text>
                  <rect x={388} y={210} width={84} height={28} rx={14} fill="#EEEEEE" stroke="#AAA" strokeWidth={1.5} />
                  <text x={430} y={228} textAnchor="middle" fill="#555" fontSize={8}>Ergebnis</text>
                </>
              )}
            </svg>
          </div>

          {/* Training data preview */}
          <div className="bg-slate-50 border-[2px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111]">
            <p className="font-bangers text-[#111] text-sm tracking-wide mb-2">TRAININGSDATEN (8 Beispiele):</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-comic">
                <thead>
                  <tr className="text-[#888]">
                    <th className="text-left py-1 pr-2">Name</th>
                    <th className="text-center px-1">Hut</th>
                    <th className="text-center px-1">Mantel</th>
                    <th className="text-center px-1">Bart</th>
                    <th className="text-center px-1">Koffer</th>
                    <th className="text-center px-1">Label</th>
                    {tree && <th className="text-center px-1">Dein Baum</th>}
                  </tr>
                </thead>
                <tbody>
                  {trainingSuspects.map(s => {
                    const pred = tree ? classifyWithBuiltTree(tree, s) : null
                    const correct = pred === s.label
                    return (
                      <tr key={s.id} className="border-t border-[#EEE]">
                        <td className="py-1 pr-2">{s.emoji} {s.name}</td>
                        <td className="text-center px-1">{s.hat ? '✓' : '✗'}</td>
                        <td className="text-center px-1">{s.coat ? '✓' : '✗'}</td>
                        <td className="text-center px-1">{s.beard ? '✓' : '✗'}</td>
                        <td className="text-center px-1">{s.briefcase ? '✓' : '✗'}</td>
                        <td className="text-center px-1">
                          <span className={`font-bold ${s.label === 'verdächtig' ? 'text-[#FF3B3F]' : 'text-[#00C853]'}`}>
                            {s.label === 'verdächtig' ? 'V' : 'U'}
                          </span>
                        </td>
                        {tree && (
                          <td className="text-center px-1">
                            <span className={pred === null ? 'text-[#888]' : correct ? 'text-[#00C853]' : 'text-[#FF3B3F]'}>
                              {pred === null ? '?' : correct ? '✓' : `✗ (${pred === 'verdächtig' ? 'V' : 'U'})`}
                            </span>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accuracy display */}
          {tested && trainAcc !== null && testAcc !== null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="border-[3px] border-[#111] rounded-xl p-3 shadow-[3px_3px_0_#111] text-center" style={{ background: '#E3F2FD' }}>
                <p className="font-comic text-[#0066FF] text-xs mb-1">Training-Genauigkeit</p>
                <p className="font-bangers text-[#111] text-3xl">{trainAcc}%</p>
                <div className="mt-1 h-3 bg-white border border-[#0066FF] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${trainAcc}%`, background: '#0066FF' }} />
                </div>
              </div>
              <div className="border-[3px] border-[#111] rounded-xl p-3 shadow-[3px_3px_0_#111] text-center" style={{ background: '#F3E5F5' }}>
                <p className="font-comic text-[#9C27B0] text-xs mb-1">Test-Genauigkeit</p>
                <p className="font-bangers text-[#111] text-3xl">{testAcc}%</p>
                <div className="mt-1 h-3 bg-white border border-[#9C27B0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${testAcc}%`, background: '#9C27B0' }} />
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={testTree}
              disabled={!state.root}
              className="flex-1 py-3 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all disabled:opacity-40"
              style={{ background: '#FFE135', color: '#111' }}
            >
              Baum testen!
            </button>
            {tested && (
              <button
                onClick={() => onComplete(xp)}
                className="flex-1 py-3 bg-[#0066FF] text-white border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all"
              >
                Weiter (+{xp} XP) →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

type Phase3 = 'sort' | 'build'

export function TreeBuilderPuzzle({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase3>('sort')

  if (phase === 'sort') {
    return <DataSortGame onComplete={() => setPhase('build')} />
  }

  return <TreeBuilderGame onComplete={onComplete} />
}
