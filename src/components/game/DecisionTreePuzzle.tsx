'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  suspects,
  treeBasic,
  treeStandard,
  treeExperten,
  expertenError,
  type TreeNode,
  type Suspect,
  type Difficulty,
} from '@/lib/game/level1Data'

type Props = {
  difficulty: Difficulty
  onComplete: (score: number) => void
}

type ClassifyStep = {
  nodeId: string
  answer: 'yes' | 'no'
}

type SuspectResult = {
  suspectId: string
  path: ClassifyStep[]
  finalResult: 'verdächtig' | 'unverdächtig'
  correct: boolean
}

function getTree(difficulty: Difficulty): TreeNode[] {
  if (difficulty === 'basis') return treeBasic
  if (difficulty === 'experten') return treeExperten
  return treeStandard
}

function getNodeById(tree: TreeNode[], id: string): TreeNode | undefined {
  return tree.find((n) => n.id === id)
}

function getCorrectResult(suspect: Suspect, tree: TreeNode[]): 'verdächtig' | 'unverdächtig' {
  let current = getNodeById(tree, 'root')
  while (current && !current.result) {
    if (!current.attribute) break
    const val = suspect[current.attribute as keyof Suspect] as boolean
    const nextId = val ? current.yes : current.no
    if (!nextId) break
    current = getNodeById(tree, nextId)
  }
  return current?.result ?? 'unverdächtig'
}

// SVG Tree Visualization
function TreeViz({
  tree,
  currentNodeId,
  path,
  gapAnswer,
  onGapAnswer,
}: {
  tree: TreeNode[]
  currentNodeId: string | null
  path: ClassifyStep[]
  gapAnswer: string | null
  onGapAnswer: (attr: string) => void
}) {
  const hasGap = tree.some((n) => n.isGap)
  const gapNode = tree.find((n) => n.isGap)

  // Expanded layout for readability — 580×420 viewBox
  const nodePositions: Record<string, { x: number; y: number }> = {
    root:        { x: 290, y: 55  },
    n1:          { x: 140, y: 160 },
    n2:          { x: 440, y: 160 },
    n3:          { x: 70,  y: 280 },
    leaf_v1:     { x: 220, y: 280 },
    leaf_u1:     { x: 440, y: 280 },
    leaf_v2:     { x: 30,  y: 390 },
    leaf_u2:     { x: 115, y: 390 },
    leaf_v_wrong:{ x: 410, y: 280 },
  }

  const visitedIds = new Set(['root', ...path.map((s) => {
    const node = getNodeById(tree, s.nodeId)
    return s.answer === 'yes' ? node?.yes : node?.no
  }).filter(Boolean)])

  return (
    <div className="bg-white rounded-2xl p-3 border-[3px] border-[#111] shadow-[3px_3px_0_#111]">
      <h3 className="font-bangers text-[#FF3B3F] text-lg tracking-wide mb-2 text-center">🌳 ENTSCHEIDUNGSBAUM</h3>
      <svg viewBox="0 0 580 430" className="w-full" style={{ minHeight: 240 }}>
        {/* Draw edges */}
        {tree.map((node) => {
          const pos = nodePositions[node.id]
          if (!pos || !node.question) return null
          return (
            <g key={`edges-${node.id}`}>
              {node.yes && nodePositions[node.yes] && (
                <>
                  <line
                    x1={pos.x} y1={pos.y + 20}
                    x2={nodePositions[node.yes].x} y2={nodePositions[node.yes].y - 20}
                    stroke={visitedIds.has(node.yes) ? '#00C853' : '#CCC'}
                    strokeWidth="3"
                  />
                  <text
                    x={(pos.x + nodePositions[node.yes].x) / 2 - 14}
                    y={(pos.y + 20 + nodePositions[node.yes].y - 20) / 2}
                    fill="#00C853" fontSize="13" fontWeight="bold"
                  >Ja</text>
                </>
              )}
              {node.no && nodePositions[node.no] && (
                <>
                  <line
                    x1={pos.x} y1={pos.y + 20}
                    x2={nodePositions[node.no].x} y2={nodePositions[node.no].y - 20}
                    stroke={visitedIds.has(node.no) ? '#FF3B3F' : '#CCC'}
                    strokeWidth="3"
                  />
                  <text
                    x={(pos.x + nodePositions[node.no].x) / 2 + 6}
                    y={(pos.y + 20 + nodePositions[node.no].y - 20) / 2}
                    fill="#FF3B3F" fontSize="13" fontWeight="bold"
                  >Nein</text>
                </>
              )}
            </g>
          )
        })}

        {/* Draw nodes */}
        {tree.map((node) => {
          const pos = nodePositions[node.id]
          if (!pos) return null
          const isActive = node.id === currentNodeId
          const isVisited = visitedIds.has(node.id)
          const isGapNode = node.isGap

          if (node.result) {
            // Leaf node — bigger pill shape
            const isVerd = node.result === 'verdächtig'
            return (
              <g key={node.id}>
                <rect x={pos.x - 52} y={pos.y - 18} width="104" height="36" rx="18"
                  fill={isVerd ? '#FF3B3F' : '#00C853'}
                  stroke="#111"
                  strokeWidth="2.5"
                />
                <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  {node.result === 'verdächtig' ? '🔴 verdächtig' : '🟢 frei'}
                </text>
              </g>
            )
          }

          if (isGapNode) {
            // Gap node to fill in — bigger
            return (
              <g key={node.id}>
                <rect x={pos.x - 56} y={pos.y - 20} width="112" height="40" rx="8"
                  fill="#FFF9E6"
                  stroke="#0066FF"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                />
                <text x={pos.x} y={pos.y + 6} textAnchor="middle" fill="#0066FF" fontSize="12" fontWeight="bold">
                  {gapAnswer ? `Merkmal: ${gapAnswer}` : '??? (ausfüllen)'}
                </text>
              </g>
            )
          }

          // Regular question node — bigger
          const label = node.question?.replace('Trägt die Person ', '').replace('Hat die Person ', '') ?? ''
          return (
            <g key={node.id}>
              <rect x={pos.x - 64} y={pos.y - 20} width="128" height="40" rx="8"
                fill={isActive ? '#FFE135' : isVisited ? '#E8F5E9' : 'white'}
                stroke={isActive ? '#FF3B3F' : isVisited ? '#00C853' : '#111'}
                strokeWidth={isActive ? 3 : 2}
              />
              <text x={pos.x} y={pos.y + 5} textAnchor="middle"
                fill="#111"
                fontSize="12"
                fontWeight={isActive ? 'bold' : 'normal'}
              >
                {label.length > 18 ? label.slice(0, 18) + '…' : label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Gap fill for standard difficulty */}
      {hasGap && !gapAnswer && (
        <div className="mt-2 p-2 bg-[#E3F2FD] border-[2px] border-[#0066FF] rounded-xl">
          <p className="font-bangers text-[#0066FF] text-xs tracking-wide mb-1">🔍 Welches Merkmal fehlt im Knoten (???)?</p>
          <div className="flex gap-2 flex-wrap">
            {['Bart', 'Brille', 'Mantel'].map((attr) => (
              <button
                key={attr}
                onClick={() => onGapAnswer(attr)}
                className="px-3 py-1 bg-white hover:bg-[#0066FF] hover:text-white text-[#0066FF]
                           font-comic text-xs rounded-lg border-[2px] border-[#0066FF] transition-all shadow-[1px_1px_0_#111]"
              >
                {attr}
              </button>
            ))}
          </div>
        </div>
      )}
      {hasGap && gapAnswer && (
        <p className="text-center font-comic text-[#00C853] text-xs mt-1 font-bold">
          ✓ Lücke ausgefüllt: Merkmal &quot;{gapAnswer}&quot;
        </p>
      )}
    </div>
  )
}

// Single suspect classifier
function SuspectClassifier({
  suspect,
  tree,
  onResult,
}: {
  suspect: Suspect
  tree: TreeNode[]
  onResult: (result: SuspectResult) => void
}) {
  const [currentNodeId, setCurrentNodeId] = useState('root')
  const [path, setPath] = useState<ClassifyStep[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const [gapAnswer, setGapAnswer] = useState<string | null>(null)

  const currentNode = getNodeById(tree, currentNodeId)

  const handleAnswer = (answer: 'yes' | 'no') => {
    if (!currentNode || currentNode.result) return

    const newPath = [...path, { nodeId: currentNodeId, answer }]
    setPath(newPath)

    const nextId = answer === 'yes' ? currentNode.yes : currentNode.no
    if (!nextId) return

    const nextNode = getNodeById(tree, nextId)
    if (!nextNode) return

    setCurrentNodeId(nextId)

    if (nextNode.result) {
      const expectedResult = getCorrectResult(suspect, tree)
      const isCorrect = nextNode.result === expectedResult
      setFeedback(
        isCorrect
          ? `✅ Richtig! ${suspect.name} ist ${nextNode.result}.`
          : `❌ Nicht ganz — aber gut versucht! ${suspect.name} ist eigentlich ${expectedResult}.`
      )
      setTimeout(() => {
        onResult({
          suspectId: suspect.id,
          path: newPath,
          finalResult: nextNode.result!,
          correct: isCorrect,
        })
      }, 1800)
    }
  }

  const [imgErr, setImgErr] = useState(false)

  return (
    <div className="bg-white rounded-2xl border-[3px] border-[#111] p-4 shadow-[3px_3px_0_#111]">
      {/* Suspect card */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-[#FFF9E6] rounded-xl border-[2px] border-[#111]">
        <div className="w-16 h-20 flex-shrink-0 relative">
          {imgErr ? (
            <div className="w-16 h-20 flex items-center justify-center text-4xl bg-[#F5F5F5] rounded-lg border-[2px] border-[#DDD]">
              {suspect.emoji}
            </div>
          ) : (
            <Image
              src={`/game/characters/suspect-${suspect.id}.png`}
              alt={suspect.name}
              fill
              style={{ objectFit: 'contain' }}
              onError={() => setImgErr(true)}
              unoptimized
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bangers text-[#111] text-lg tracking-wide">{suspect.name}</h3>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {suspect.hat && <span className="bg-[#FFE135] text-[#111] font-comic text-xs px-2 py-0.5 rounded-full border-[1.5px] border-[#111]">🎩 Hut</span>}
            {suspect.coat && <span className="bg-[#0066FF] text-white font-comic text-xs px-2 py-0.5 rounded-full border-[1.5px] border-[#111]">🧥 Mantel</span>}
            {suspect.beard && <span className="bg-[#FF9800] text-white font-comic text-xs px-2 py-0.5 rounded-full border-[1.5px] border-[#111]">🧔 Bart</span>}
            {suspect.glasses && <span className="bg-[#9C27B0] text-white font-comic text-xs px-2 py-0.5 rounded-full border-[1.5px] border-[#111]">👓 Brille</span>}
          </div>
        </div>
      </div>

      {/* Question */}
      {!feedback && currentNode && !currentNode.result && (
        <div className="text-center">
          {currentNode.isGap ? (
            <div className="text-[#0066FF] font-comic text-sm mb-3">
              <p className="font-bold">Lückenfrage:</p>
              <p>Welches Merkmal soll hier geprüft werden?</p>
            </div>
          ) : (
            <p className="font-comic text-[#111] text-sm mb-3 font-bold">
              {currentNode.question}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleAnswer('yes')}
              className="px-6 py-2.5 bg-[#00C853] text-white font-bangers text-base tracking-wide
                         rounded-xl border-[2.5px] border-[#111] shadow-[2px_2px_0_#111]
                         active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              ✓ JA
            </button>
            <button
              onClick={() => handleAnswer('no')}
              className="px-6 py-2.5 bg-[#FF3B3F] text-white font-bangers text-base tracking-wide
                         rounded-xl border-[2.5px] border-[#111] shadow-[2px_2px_0_#111]
                         active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              ✗ NEIN
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className={`text-center p-3 rounded-xl font-comic font-bold text-sm border-[2px] border-[#111] shadow-[2px_2px_0_#111] ${
            feedback.startsWith('✅')
              ? 'bg-[#E8F5E9] text-[#00C853]'
              : 'bg-[#FFF3E0] text-[#FF3B3F]'
          }`}
        >
          {feedback}
        </div>
      )}
    </div>
  )
}

// Main component
export function DecisionTreePuzzle({ difficulty, onComplete }: Props) {
  const tree = getTree(difficulty)
  const [currentSuspectIdx, setCurrentSuspectIdx] = useState(0)
  const [results, setResults] = useState<SuspectResult[]>([])
  const [gapAnswer, setGapAnswer] = useState<string | null>(null)
  const [showExpertenHint, setShowExpertenHint] = useState(false)
  const [expertenErrorFound, setExpertenErrorFound] = useState(false)

  const currentSuspect = suspects[currentSuspectIdx]

  const handleSuspectResult = (result: SuspectResult) => {
    const newResults = [...results, result]
    setResults(newResults)
    if (currentSuspectIdx < suspects.length - 1) {
      setCurrentSuspectIdx((i) => i + 1)
    } else {
      // All suspects classified
      const score = newResults.filter((r) => r.correct).length
      const xp = difficulty === 'experten'
        ? score * 20 + (expertenErrorFound ? 40 : 0)
        : score * 25
      onComplete(Math.min(xp, 100))
    }
  }

  const difficultyLabel = {
    basis: '⭐ Basis',
    standard: '⭐⭐ Standard',
    experten: '⭐⭐⭐ Experten',
  }[difficulty]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="bg-[#FFF9E6] border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-5xl" style={{ maxHeight: '97vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="sticky top-0 bg-[#FF3B3F] border-b-[4px] border-[#111] p-4 flex items-center justify-between z-10">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 comic-dots opacity-20" />
            <div className="relative">
              <h2 className="font-bangers text-white text-xl tracking-wider">🔍 VERHÖRRAUM</h2>
              <p className="font-comic text-red-100 text-xs">
                {difficultyLabel} · Verdächtiger {currentSuspectIdx + 1} / {suspects.length}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {suspects.map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-[2px] border-[#111] transition-all ${
                  i < results.length
                    ? results[i].correct ? 'bg-[#00C853]' : 'bg-[#FF9800]'
                    : i === currentSuspectIdx
                    ? 'bg-[#FFE135] animate-pulse'
                    : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tree visualization */}
          <TreeViz
            tree={tree}
            currentNodeId={null}
            path={[]}
            gapAnswer={gapAnswer}
            onGapAnswer={setGapAnswer}
          />

          {/* Suspect classifier */}
          <div className="flex flex-col gap-3">
            <SuspectClassifier
              key={currentSuspect.id}
              suspect={currentSuspect}
              tree={tree}
              onResult={handleSuspectResult}
            />

            {/* Experten: error finding */}
            {difficulty === 'experten' && (
              <div className="bg-white rounded-xl border-[2.5px] border-[#9C27B0] p-3 shadow-[2px_2px_0_#9C27B0]">
                <p className="font-bangers text-[#9C27B0] text-sm tracking-wide mb-1">
                  🔬 EXPERTEN-AUFGABE: FEHLER IM BAUM FINDEN!
                </p>
                {!expertenErrorFound && (
                  <>
                    <button
                      onClick={() => setShowExpertenHint(!showExpertenHint)}
                      className="font-comic text-xs text-[#9C27B0] underline mb-1"
                    >
                      {showExpertenHint ? 'Tipp verbergen' : 'Tipp anzeigen'}
                    </button>
                    {showExpertenHint && (
                      <p className="font-comic text-[#555] text-xs">{expertenError.hint}</p>
                    )}
                    <div className="flex gap-2 mt-2 items-center">
                      <span className="font-comic text-xs text-[#555]">Welcher Knoten ist falsch?</span>
                      <button
                        onClick={() => setExpertenErrorFound(true)}
                        className="px-2 py-0.5 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-comic text-xs rounded-lg border-[1.5px] border-[#111]"
                      >
                        Brille-Zweig ist falsch!
                      </button>
                    </div>
                  </>
                )}
                {expertenErrorFound && (
                  <p className="font-comic text-[#00C853] text-xs font-bold">✅ Korrekt! +40 Bonus-XP</p>
                )}
              </div>
            )}

            {/* Previous results */}
            {results.length > 0 && (
              <div className="bg-white rounded-xl border-[2px] border-[#111] p-3 shadow-[2px_2px_0_#111]">
                <p className="font-bangers text-[#111] text-sm tracking-wide mb-1">BISHERIGE ERGEBNISSE:</p>
                {results.map((r, i) => (
                  <div key={i} className={`flex items-center gap-2 font-comic text-xs ${r.correct ? 'text-[#00C853]' : 'text-[#FF3B3F]'}`}>
                    <span>{r.correct ? '✅' : '❌'}</span>
                    <span>{suspects.find((s) => s.id === r.suspectId)?.name}: {r.finalResult}</span>
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
