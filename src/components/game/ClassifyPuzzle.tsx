'use client'

import { useState, useEffect } from 'react'
import type {
  Suspect2,
  TreeNode2,
  Difficulty2,
} from '@/lib/game/level2Data'
import {
  suspects2,
  treeBasis2,
  treeStandard2,
  treeExperten2,
  suspectsBasis2,
  suspectsStandard2,
  suspectsExperten2,
  EXPERTEN_TIME_LIMIT,
} from '@/lib/game/level2Data'

type Props = {
  difficulty: Difficulty2
  onComplete: (xp: number) => void
}

type ClassifyStep = {
  nodeId: string
  answer: boolean | null // null = not yet at this node
}

type SuspectResult = {
  suspectId: string
  playerAnswer: 'verdächtig' | 'unverdächtig'
  correct: boolean
}

function getTree(difficulty: Difficulty2): TreeNode2[] {
  if (difficulty === 'basis') return treeBasis2
  if (difficulty === 'standard') return treeStandard2
  return treeExperten2
}

function getSuspectIds(difficulty: Difficulty2): string[] {
  if (difficulty === 'basis') return suspectsBasis2
  if (difficulty === 'standard') return suspectsStandard2
  return suspectsExperten2
}

function getSuspect(id: string): Suspect2 {
  return suspects2.find(s => s.id === id) ?? suspects2[0]
}

function classifyWithTree(tree: TreeNode2[], suspect: Suspect2): 'verdächtig' | 'unverdächtig' {
  let node = tree.find(n => n.id === 'root')!
  while (node.result === undefined) {
    const attr = node.attribute!
    const val = suspect[attr]
    const nextId = val ? node.yes! : node.no!
    node = tree.find(n => n.id === nextId)!
  }
  return node.result
}

// Walk the tree step by step for a suspect, return the path of node IDs
function getTreePath(tree: TreeNode2[], suspect: Suspect2): string[] {
  const path: string[] = []
  let node = tree.find(n => n.id === 'root')!
  path.push(node.id)
  while (node.result === undefined) {
    const attr = node.attribute!
    const val = suspect[attr]
    const nextId = val ? node.yes! : node.no!
    node = tree.find(n => n.id === nextId)!
    path.push(node.id)
  }
  return path
}

// ─── Tree SVG (simplified for 2-4 levels) ────────────────────────────────────

function TreeSVGBasis({ tree, activePath }: { tree: TreeNode2[]; activePath: string[] }) {
  const root = tree.find(n => n.id === 'root')!
  const n1 = tree.find(n => n.id === 'n1')!
  const leafU1 = tree.find(n => n.id === 'leaf_u1')!
  const leafV1 = tree.find(n => n.id === 'leaf_v1')!
  const leafV2 = tree.find(n => n.id === 'leaf_v2')!

  const isActive = (id: string) => activePath.includes(id)
  const nodeColor = (id: string, isLeaf: boolean, result?: 'verdächtig' | 'unverdächtig') => {
    if (!isActive(id)) return isLeaf ? '#EEEEEE' : '#F5F5F5'
    if (result === 'verdächtig') return '#FFCDD2'
    if (result === 'unverdächtig') return '#C8E6C9'
    return '#FFE135'
  }
  const nodeBorder = (id: string) => isActive(id) ? '#FF3B3F' : '#AAAAAA'

  return (
    <svg viewBox="0 0 500 280" className="w-full" style={{ maxHeight: 220 }}>
      {/* Edges */}
      <line x1={250} y1={65} x2={110} y2={140} stroke={isActive('n1') ? '#0066FF' : '#CCC'} strokeWidth={isActive('n1') ? 2.5 : 1.5} />
      <text x={160} y={95} fill="#00C853" fontSize={11} fontWeight="bold">Ja</text>
      <line x1={250} y1={65} x2={400} y2={140} stroke={isActive('leaf_u1') ? '#0066FF' : '#CCC'} strokeWidth={isActive('leaf_u1') ? 2.5 : 1.5} />
      <text x={330} y={95} fill="#FF3B3F" fontSize={11} fontWeight="bold">Nein</text>
      <line x1={110} y1={165} x2={55} y2={235} stroke={isActive('leaf_v1') ? '#0066FF' : '#CCC'} strokeWidth={isActive('leaf_v1') ? 2.5 : 1.5} />
      <text x={55} y={200} fill="#00C853" fontSize={10} fontWeight="bold">Ja</text>
      <line x1={110} y1={165} x2={170} y2={235} stroke={isActive('leaf_v2') ? '#0066FF' : '#CCC'} strokeWidth={isActive('leaf_v2') ? 2.5 : 1.5} />
      <text x={145} y={200} fill="#FF3B3F" fontSize={10} fontWeight="bold">Nein</text>

      {/* Root */}
      <rect x={170} y={25} width={160} height={40} rx={8} fill={nodeColor('root', false)} stroke={nodeBorder('root')} strokeWidth={2} />
      <text x={250} y={43} textAnchor="middle" fill="#111" fontSize={10} fontWeight="bold">{root.question}</text>
      <text x={250} y={57} textAnchor="middle" fill="#888" fontSize={8}>Hut?</text>

      {/* n1 */}
      <rect x={42} y={140} width={136} height={36} rx={8} fill={nodeColor('n1', false)} stroke={nodeBorder('n1')} strokeWidth={2} />
      <text x={110} y={155} textAnchor="middle" fill="#111" fontSize={9} fontWeight="bold">{n1.question}</text>
      <text x={110} y={168} textAnchor="middle" fill="#888" fontSize={8}>Mantel?</text>

      {/* leaf_u1 */}
      <rect x={340} y={140} width={110} height={36} rx={18} fill={nodeColor('leaf_u1', true, leafU1.result)} stroke={nodeBorder('leaf_u1')} strokeWidth={2} />
      <text x={395} y={162} textAnchor="middle" fill="#1B5E20" fontSize={10} fontWeight="bold">unverdächtig</text>

      {/* leaf_v1 */}
      <rect x={5} y={228} width={100} height={34} rx={17} fill={nodeColor('leaf_v1', true, leafV1.result)} stroke={nodeBorder('leaf_v1')} strokeWidth={2} />
      <text x={55} y={248} textAnchor="middle" fill="#B71C1C" fontSize={9} fontWeight="bold">verdächtig</text>

      {/* leaf_v2 */}
      <rect x={120} y={228} width={100} height={34} rx={17} fill={nodeColor('leaf_v2', true, leafV2.result)} stroke={nodeBorder('leaf_v2')} strokeWidth={2} />
      <text x={170} y={248} textAnchor="middle" fill="#B71C1C" fontSize={9} fontWeight="bold">verdächtig</text>
    </svg>
  )
}

function TreeSVGStandard({ tree, activePath }: { tree: TreeNode2[]; activePath: string[] }) {
  const isActive = (id: string) => activePath.includes(id)
  const leafFill = (result?: 'verdächtig' | 'unverdächtig', active?: boolean) => {
    if (!active) return '#EEEEEE'
    return result === 'verdächtig' ? '#FFCDD2' : '#C8E6C9'
  }
  const nodeFill = (id: string) => isActive(id) ? '#FFE135' : '#F5F5F5'
  const edgeStroke = (id: string) => isActive(id) ? '#0066FF' : '#CCC'

  return (
    <svg viewBox="0 0 560 310" className="w-full" style={{ maxHeight: 240 }}>
      {/* Level 1 edges */}
      <line x1={280} y1={55} x2={120} y2={130} stroke={edgeStroke('n1')} strokeWidth={2} />
      <text x={180} y={88} fill="#00C853" fontSize={10} fontWeight="bold">Ja</text>
      <line x1={280} y1={55} x2={450} y2={130} stroke={edgeStroke('leaf_u1')} strokeWidth={2} />
      <text x={370} y={88} fill="#FF3B3F" fontSize={10} fontWeight="bold">Nein</text>
      {/* Level 2 edges */}
      <line x1={120} y1={155} x2={50} y2={230} stroke={edgeStroke('leaf_v1')} strokeWidth={2} />
      <text x={60} y={192} fill="#00C853" fontSize={9} fontWeight="bold">Ja</text>
      <line x1={120} y1={155} x2={210} y2={230} stroke={edgeStroke('n2')} strokeWidth={2} />
      <text x={170} y={192} fill="#FF3B3F" fontSize={9} fontWeight="bold">Nein</text>
      {/* Level 3 edges */}
      <line x1={210} y1={255} x2={165} y2={290} stroke={edgeStroke('leaf_v2')} strokeWidth={2} />
      <text x={167} y={275} fill="#00C853" fontSize={9} fontWeight="bold">Ja</text>
      <line x1={210} y1={255} x2={265} y2={290} stroke={edgeStroke('leaf_v3')} strokeWidth={2} />
      <text x={243} y={275} fill="#FF3B3F" fontSize={9} fontWeight="bold">Nein</text>

      {/* Root */}
      <rect x={190} y={22} width={180} height={38} rx={8} fill={nodeFill('root')} stroke={isActive('root') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={280} y={38} textAnchor="middle" fill="#111" fontSize={10} fontWeight="bold">Trägt die Person einen Hut?</text>
      <text x={280} y={53} textAnchor="middle" fill="#888" fontSize={8}>Merkmal: Hut</text>

      {/* n1 */}
      <rect x={46} y={128} width={148} height={36} rx={8} fill={nodeFill('n1')} stroke={isActive('n1') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={120} y={143} textAnchor="middle" fill="#111" fontSize={9} fontWeight="bold">Trägt die Person einen Mantel?</text>
      <text x={120} y={157} textAnchor="middle" fill="#888" fontSize={8}>Merkmal: Mantel</text>

      {/* leaf_u1 */}
      <rect x={388} y={128} width={120} height={36} rx={18} fill={leafFill(tree.find(n => n.id === 'leaf_u1')?.result, isActive('leaf_u1'))} stroke={isActive('leaf_u1') ? '#00C853' : '#AAA'} strokeWidth={2} />
      <text x={448} y={150} textAnchor="middle" fill="#1B5E20" fontSize={10} fontWeight="bold">unverdächtig</text>

      {/* leaf_v1 */}
      <rect x={5} y={228} width={90} height={32} rx={16} fill={leafFill(tree.find(n => n.id === 'leaf_v1')?.result, isActive('leaf_v1'))} stroke={isActive('leaf_v1') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={50} y={248} textAnchor="middle" fill="#B71C1C" fontSize={9} fontWeight="bold">verdächtig</text>

      {/* n2 */}
      <rect x={148} y={228} width={130} height={34} rx={8} fill={nodeFill('n2')} stroke={isActive('n2') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={213} y={243} textAnchor="middle" fill="#111" fontSize={9} fontWeight="bold">Hat die Person einen Bart?</text>
      <text x={213} y={256} textAnchor="middle" fill="#888" fontSize={8}>Merkmal: Bart</text>

      {/* leaf_v2 */}
      <rect x={128} y={285} width={80} height={26} rx={13} fill={leafFill(tree.find(n => n.id === 'leaf_v2')?.result, isActive('leaf_v2'))} stroke={isActive('leaf_v2') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={168} y={302} textAnchor="middle" fill="#B71C1C" fontSize={8} fontWeight="bold">verdächtig</text>

      {/* leaf_v3 */}
      <rect x={230} y={285} width={80} height={26} rx={13} fill={leafFill(tree.find(n => n.id === 'leaf_v3')?.result, isActive('leaf_v3'))} stroke={isActive('leaf_v3') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={270} y={302} textAnchor="middle" fill="#B71C1C" fontSize={8} fontWeight="bold">verdächtig</text>
    </svg>
  )
}

function TreeSVGExperten({ tree, activePath }: { tree: TreeNode2[]; activePath: string[] }) {
  const isActive = (id: string) => activePath.includes(id)
  const leafFill = (result?: 'verdächtig' | 'unverdächtig', active?: boolean) => {
    if (!active) return '#EEEEEE'
    return result === 'verdächtig' ? '#FFCDD2' : '#C8E6C9'
  }
  const nodeFill = (id: string) => isActive(id) ? '#FFE135' : '#F5F5F5'
  const edgeColor = (id: string) => isActive(id) ? '#0066FF' : '#CCC'

  return (
    <svg viewBox="0 0 640 340" className="w-full" style={{ maxHeight: 260 }}>
      {/* Root edges */}
      <line x1={320} y1={50} x2={160} y2={120} stroke={edgeColor('n1')} strokeWidth={2} />
      <text x={215} y={83} fill="#00C853" fontSize={10} fontWeight="bold">Ja</text>
      <line x1={320} y1={50} x2={490} y2={120} stroke={edgeColor('n2')} strokeWidth={2} />
      <text x={406} y={83} fill="#FF3B3F" fontSize={10} fontWeight="bold">Nein</text>
      {/* n1 edges */}
      <line x1={160} y1={145} x2={70} y2={215} stroke={edgeColor('leaf_v1')} strokeWidth={2} />
      <text x={95} y={178} fill="#00C853" fontSize={9} fontWeight="bold">Ja</text>
      <line x1={160} y1={145} x2={240} y2={215} stroke={edgeColor('n3')} strokeWidth={2} />
      <text x={205} y={178} fill="#FF3B3F" fontSize={9} fontWeight="bold">Nein</text>
      {/* n2 edges */}
      <line x1={490} y1={145} x2={420} y2={215} stroke={edgeColor('leaf_u1')} strokeWidth={2} />
      <text x={436} y={178} fill="#00C853" fontSize={9} fontWeight="bold">Ja</text>
      <line x1={490} y1={145} x2={570} y2={215} stroke={edgeColor('leaf_u2')} strokeWidth={2} />
      <text x={533} y={178} fill="#FF3B3F" fontSize={9} fontWeight="bold">Nein</text>
      {/* n3 edges */}
      <line x1={240} y1={238} x2={190} y2={295} stroke={edgeColor('leaf_v2')} strokeWidth={2} />
      <text x={196} y={268} fill="#00C853" fontSize={9} fontWeight="bold">Ja</text>
      <line x1={240} y1={238} x2={310} y2={295} stroke={edgeColor('n4')} strokeWidth={2} />
      <text x={275} y={268} fill="#FF3B3F" fontSize={9} fontWeight="bold">Nein</text>
      {/* n4 edges */}
      <line x1={310} y1={318} x2={275} y2={335} stroke={edgeColor('leaf_v3')} strokeWidth={2} />
      <line x1={310} y1={318} x2={345} y2={335} stroke={edgeColor('leaf_u3')} strokeWidth={2} />

      {/* Root */}
      <rect x={220} y={18} width={200} height={38} rx={8} fill={nodeFill('root')} stroke={isActive('root') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={320} y={34} textAnchor="middle" fill="#111" fontSize={9} fontWeight="bold">Trägt die Person einen Hut?</text>
      <text x={320} y={48} textAnchor="middle" fill="#888" fontSize={8}>Merkmal: Hut</text>

      {/* n1 */}
      <rect x={80} y={118} width={160} height={34} rx={8} fill={nodeFill('n1')} stroke={isActive('n1') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={160} y={133} textAnchor="middle" fill="#111" fontSize={9} fontWeight="bold">Trägt sie einen Mantel?</text>
      <text x={160} y={146} textAnchor="middle" fill="#888" fontSize={8}>Merkmal: Mantel</text>

      {/* n2 */}
      <rect x={404} y={118} width={172} height={34} rx={8} fill={nodeFill('n2')} stroke={isActive('n2') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={490} y={133} textAnchor="middle" fill="#111" fontSize={9} fontWeight="bold">Trägt sie einen Mantel?</text>
      <text x={490} y={146} textAnchor="middle" fill="#888" fontSize={8}>Merkmal: Mantel</text>

      {/* leaf_v1 */}
      <rect x={20} y={212} width={90} height={28} rx={14} fill={leafFill(tree.find(n => n.id === 'leaf_v1')?.result, isActive('leaf_v1'))} stroke={isActive('leaf_v1') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={65} y={230} textAnchor="middle" fill="#B71C1C" fontSize={8} fontWeight="bold">verdächtig</text>

      {/* n3 */}
      <rect x={168} y={212} width={144} height={34} rx={8} fill={nodeFill('n3')} stroke={isActive('n3') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={240} y={227} textAnchor="middle" fill="#111" fontSize={9} fontWeight="bold">Hat sie einen Bart?</text>
      <text x={240} y={240} textAnchor="middle" fill="#888" fontSize={8}>Merkmal: Bart</text>

      {/* leaf_u1 */}
      <rect x={370} y={212} width={100} height={28} rx={14} fill={leafFill(tree.find(n => n.id === 'leaf_u1')?.result, isActive('leaf_u1'))} stroke={isActive('leaf_u1') ? '#00C853' : '#AAA'} strokeWidth={2} />
      <text x={420} y={230} textAnchor="middle" fill="#1B5E20" fontSize={8} fontWeight="bold">unverdächtig</text>

      {/* leaf_u2 */}
      <rect x={516} y={212} width={108} height={28} rx={14} fill={leafFill(tree.find(n => n.id === 'leaf_u2')?.result, isActive('leaf_u2'))} stroke={isActive('leaf_u2') ? '#00C853' : '#AAA'} strokeWidth={2} />
      <text x={570} y={230} textAnchor="middle" fill="#1B5E20" fontSize={8} fontWeight="bold">unverdächtig</text>

      {/* leaf_v2 */}
      <rect x={155} y={290} width={80} height={26} rx={13} fill={leafFill(tree.find(n => n.id === 'leaf_v2')?.result, isActive('leaf_v2'))} stroke={isActive('leaf_v2') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={195} y={307} textAnchor="middle" fill="#B71C1C" fontSize={8} fontWeight="bold">verdächtig</text>

      {/* n4 */}
      <rect x={268} y={290} width={84} height={34} rx={8} fill={nodeFill('n4')} stroke={isActive('n4') ? '#FF3B3F' : '#AAA'} strokeWidth={2} />
      <text x={310} y={305} textAnchor="middle" fill="#111" fontSize={8} fontWeight="bold">Aktenkoffer?</text>
      <text x={310} y={318} textAnchor="middle" fill="#888" fontSize={8}>Merkmal</text>

      {/* leaf_v3 / leaf_u3 */}
      <rect x={240} y={332} width={58} height={8} rx={4} fill={leafFill(tree.find(n => n.id === 'leaf_v3')?.result, isActive('leaf_v3'))} stroke={isActive('leaf_v3') ? '#FF3B3F' : '#AAA'} strokeWidth={1.5} />
      <rect x={310} y={332} width={58} height={8} rx={4} fill={leafFill(tree.find(n => n.id === 'leaf_u3')?.result, isActive('leaf_u3'))} stroke={isActive('leaf_u3') ? '#00C853' : '#AAA'} strokeWidth={1.5} />
    </svg>
  )
}

function TreeSVG({ difficulty, tree, activePath }: { difficulty: Difficulty2; tree: TreeNode2[]; activePath: string[] }) {
  if (difficulty === 'basis') return <TreeSVGBasis tree={tree} activePath={activePath} />
  if (difficulty === 'standard') return <TreeSVGStandard tree={tree} activePath={activePath} />
  return <TreeSVGExperten tree={tree} activePath={activePath} />
}

// ─── Verdächtigen-Karte ──────────────────────────────────────────────────────

function SuspectCard({ suspect, isActive }: { suspect: Suspect2; isActive: boolean }) {
  return (
    <div
      className={`border-[3px] border-[#111] rounded-xl p-3 shadow-[3px_3px_0_#111] transition-all ${isActive ? 'bg-[#FFE135]' : 'bg-white'}`}
    >
      <div className="text-3xl text-center mb-1">{suspect.emoji}</div>
      <p className="font-bangers text-[#111] text-sm tracking-wide text-center">{suspect.name}</p>
      <div className="mt-2 space-y-0.5">
        {[
          { label: 'Hut', val: suspect.hat },
          { label: 'Mantel', val: suspect.coat },
          { label: 'Bart', val: suspect.beard },
          { label: 'Koffer', val: suspect.briefcase },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-center justify-between text-xs font-comic">
            <span className="text-[#666]">{label}</span>
            <span className={`font-bold ${val ? 'text-[#00C853]' : 'text-[#FF3B3F]'}`}>{val ? 'Ja' : 'Nein'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ClassifyPuzzle({ difficulty, onComplete }: Props) {
  const tree = getTree(difficulty)
  const suspectIds = getSuspectIds(difficulty)
  const suspects = suspectIds.map(getSuspect)

  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState<SuspectResult[]>([])
  const [activePath, setActivePath] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(difficulty === 'experten' ? EXPERTEN_TIME_LIMIT : 0)
  const [phase, setPhase] = useState<'classify' | 'feedback' | 'summary'>('classify')
  const [lastResult, setLastResult] = useState<SuspectResult | null>(null)

  const currentSuspect = suspects[currentIdx]

  // Walk tree to get path for current suspect
  useEffect(() => {
    setActivePath(getTreePath(tree, currentSuspect))
    setShowResult(false)
  }, [currentIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // Timer for experten
  useEffect(() => {
    if (difficulty !== 'experten' || phase === 'summary') return
    if (timeLeft <= 0) {
      // Time up — auto-complete
      const remaining = suspects.slice(results.length)
      const autoResults: SuspectResult[] = remaining.map(s => ({
        suspectId: s.id,
        playerAnswer: classifyWithTree(tree, s),
        correct: false,
      }))
      setResults(prev => [...prev, ...autoResults])
      setPhase('summary')
      return
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, difficulty, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = (answer: 'verdächtig' | 'unverdächtig') => {
    const correct = answer === currentSuspect.category
    const result: SuspectResult = {
      suspectId: currentSuspect.id,
      playerAnswer: answer,
      correct,
    }
    setLastResult(result)
    setShowResult(true)
    setPhase('feedback')
  }

  const handleNext = () => {
    const newResults = [...results, lastResult!]
    setResults(newResults)
    setLastResult(null)
    setShowResult(false)
    setPhase('classify')

    if (currentIdx < suspects.length - 1) {
      setCurrentIdx(i => i + 1)
    } else {
      setPhase('summary')
    }
  }

  const calculateXP = () => {
    const correctCount = results.filter(r => r.correct).length + (lastResult?.correct ? 1 : 0)
    const total = suspects.length
    const pct = correctCount / total
    if (difficulty === 'basis') return Math.round(pct * 50)
    if (difficulty === 'standard') return Math.round(pct * 75)
    return Math.round(pct * 100)
  }

  if (phase === 'summary') {
    const allResults = lastResult ? [...results, lastResult] : results
    const correct = allResults.filter(r => r.correct).length
    const total = suspects.length
    const xp = calculateXP()

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
        <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-md overflow-hidden">
          <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4 text-center">
            <div className="text-4xl mb-1">{correct === total ? '🏆' : correct >= total / 2 ? '🎯' : '📚'}</div>
            <h2 className="font-bangers text-[#111] text-2xl tracking-wider">KLASSIFIKATION ABGESCHLOSSEN!</h2>
          </div>
          <div className="p-5">
            <p className="font-comic text-[#111] text-base text-center mb-4">
              {correct} von {total} Verdächtigen korrekt klassifiziert!
            </p>
            <div className="space-y-2 mb-4">
              {allResults.map((r, i) => {
                const s = getSuspect(r.suspectId)
                return (
                  <div key={r.suspectId} className="flex items-center gap-3 border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
                    <span className="text-xl">{s.emoji}</span>
                    <span className="font-comic text-[#111] text-sm flex-1">{s.name}</span>
                    <span className={`font-bangers text-sm ${r.correct ? 'text-[#00C853]' : 'text-[#FF3B3F]'}`}>
                      {r.correct ? '✓ Richtig' : '✗ Falsch'}
                    </span>
                    {!r.correct && (
                      <span className="font-comic text-[#888] text-xs">
                        ({s.category})
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="bg-[#FFE135] border-[3px] border-[#111] rounded-xl px-4 py-3 text-center shadow-[3px_3px_0_#111]">
              <span className="font-bangers text-[#111] text-xl">+{xp} XP erworben!</span>
            </div>
            <button
              onClick={() => onComplete(xp)}
              className="w-full mt-3 py-3 bg-[#0066FF] text-white border-[3px] border-[#111] rounded-xl font-bangers text-lg tracking-wide shadow-[3px_3px_0_#111] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              Weiter zum Quiz! →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-3xl max-h-[97vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-3 flex items-center justify-between">
          <h2 className="font-bangers text-[#111] text-xl tracking-wider">
            KLASSIFIKATION — {difficulty.toUpperCase()}
          </h2>
          <div className="flex items-center gap-3">
            {difficulty === 'experten' && (
              <div className={`font-bangers text-base px-3 py-1 rounded-full border-[2px] border-[#111] ${timeLeft < 30 ? 'bg-[#FF3B3F] text-white' : 'bg-white text-[#111]'}`}>
                ⏱ {timeLeft}s
              </div>
            )}
            <div className="bg-[#111] text-[#FFE135] font-bangers px-3 py-1 rounded-full text-sm">
              {currentIdx + 1} / {suspects.length}
            </div>
          </div>
        </div>

        <div className="p-4 flex gap-4 flex-col md:flex-row">
          {/* Left: Tree */}
          <div className="flex-1 min-w-0">
            <div className="bg-slate-50 border-[2px] border-[#111] rounded-xl p-3 shadow-[2px_2px_0_#111]">
              <p className="font-bangers text-[#111] text-sm tracking-wide mb-2 text-center">ENTSCHEIDUNGSBAUM</p>
              <TreeSVG difficulty={difficulty} tree={tree} activePath={activePath} />
              <p className="font-comic text-[#888] text-xs text-center mt-1">Gelbe Knoten = aktiver Pfad</p>
            </div>
          </div>

          {/* Right: Suspect + Controls */}
          <div className="w-full md:w-52 flex-shrink-0 space-y-3">
            <SuspectCard suspect={currentSuspect} isActive={true} />

            {!showResult ? (
              <div className="space-y-2">
                <p className="font-comic text-[#111] text-xs text-center font-bold">
                  Wohin führt der Baum diese Person?
                </p>
                <button
                  onClick={() => handleAnswer('verdächtig')}
                  className="w-full py-3 bg-[#FF3B3F] text-white border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
                >
                  VERDÄCHTIG
                </button>
                <button
                  onClick={() => handleAnswer('unverdächtig')}
                  className="w-full py-3 bg-[#00C853] text-white border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
                >
                  UNVERDÄCHTIG
                </button>
              </div>
            ) : (
              <div>
                <div
                  className={`border-[3px] border-[#111] rounded-xl p-3 shadow-[3px_3px_0_#111] text-center mb-3 ${lastResult?.correct ? 'bg-[#C8E6C9]' : 'bg-[#FFCDD2]'}`}
                >
                  <div className="text-2xl mb-1">{lastResult?.correct ? '✅' : '❌'}</div>
                  <p className="font-bangers text-[#111] text-sm tracking-wide">
                    {lastResult?.correct ? 'Richtig!' : 'Falsch!'}
                  </p>
                  <p className="font-comic text-[#555] text-xs mt-1">
                    Korrekte Antwort: <strong>{currentSuspect.category}</strong>
                  </p>
                  <p className="font-comic text-[#888] text-xs mt-1 leading-relaxed">
                    {currentSuspect.description}
                  </p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-2.5 bg-[#0066FF] text-white border-[3px] border-[#111] rounded-xl font-bangers text-base shadow-[3px_3px_0_#111] active:shadow-none transition-all"
                >
                  {currentIdx < suspects.length - 1 ? 'Nächster →' : 'Auswertung →'}
                </button>
              </div>
            )}

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 pt-1">
              {suspects.map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full border-[1.5px] border-[#111] transition-all"
                  style={{
                    background: i < results.length
                      ? (results[i].correct ? '#00C853' : '#FF3B3F')
                      : i === currentIdx ? '#FFE135' : '#DDD',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
