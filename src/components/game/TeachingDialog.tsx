'use client'

import { useEffect, useState, useCallback } from 'react'
import type { DialogLine } from '@/lib/game/level1Data'

type Highlight = 'none' | 'all' | 'wurzel' | 'knoten_kante' | 'blatt'

// Which part of the tree to highlight per dialog line index
const HIGHLIGHTS: Highlight[] = [
  'all',           // 0: "Schau her! Das ist unser Entscheidungsbaum..."
  'wurzel',        // 1: "Die WURZEL ist ganz oben..."
  'knoten_kante',  // 2: "Die KNOTEN in der Mitte... Die KANTEN sind die Pfeile..."
  'blatt',         // 3: "Die BLÄTTER ganz unten..."
  'none',          // 4: Tim: "Das klingt wie ein riesiges Ablaufdiagramm!"
  'none',          // 5: "Genau! Jetzt kannst du selbst..."
]

function AnnotatedTreeSVG({ highlight }: { highlight: Highlight }) {
  const hl = (part: Highlight) => part === highlight || highlight === 'all'

  // Node positions in 480x310 viewBox
  const root = { x: 240, y: 55 }
  const n1   = { x: 110, y: 150 }
  const n2   = { x: 370, y: 150 }
  const lv   = { x: 55,  y: 250 }
  const lu1  = { x: 170, y: 250 }
  const lu2  = { x: 370, y: 250 }

  const activeEdge = highlight === 'knoten_kante' || highlight === 'all'
  const edgeColor = activeEdge ? '#0066FF' : '#CCCCCC'
  const edgeW = activeEdge ? 3 : 2

  return (
    <svg viewBox="0 0 480 310" className="w-full h-full" style={{ maxHeight: 280 }}>

      {/* ── Edges ── */}
      {/* root → n1 (Ja) */}
      <line x1={root.x} y1={root.y + 20} x2={n1.x} y2={n1.y - 18}
        stroke={edgeColor} strokeWidth={edgeW} />
      <text x={(root.x + n1.x) / 2 - 18} y={(root.y + 20 + n1.y - 18) / 2 - 4}
        fill="#00C853" fontSize="12" fontWeight="bold">Ja</text>

      {/* root → n2 (Nein) */}
      <line x1={root.x} y1={root.y + 20} x2={n2.x} y2={n2.y - 18}
        stroke={edgeColor} strokeWidth={edgeW} />
      <text x={(root.x + n2.x) / 2 + 6} y={(root.y + 20 + n2.y - 18) / 2 - 4}
        fill="#FF3B3F" fontSize="12" fontWeight="bold">Nein</text>

      {/* n1 → lv (Ja) */}
      <line x1={n1.x} y1={n1.y + 18} x2={lv.x} y2={lv.y - 16}
        stroke={edgeColor} strokeWidth={edgeW} />
      <text x={(n1.x + lv.x) / 2 - 16} y={(n1.y + 18 + lv.y - 16) / 2 - 4}
        fill="#00C853" fontSize="11" fontWeight="bold">Ja</text>

      {/* n1 → lu1 (Nein) */}
      <line x1={n1.x} y1={n1.y + 18} x2={lu1.x} y2={lu1.y - 16}
        stroke={edgeColor} strokeWidth={edgeW} />
      <text x={(n1.x + lu1.x) / 2 + 4} y={(n1.y + 18 + lu1.y - 16) / 2 - 4}
        fill="#FF3B3F" fontSize="11" fontWeight="bold">Nein</text>

      {/* ── KANTE label (annotation) ── */}
      {(highlight === 'knoten_kante' || highlight === 'all') && (
        <g>
          {/* Arrow pointing to the root→n1 edge midpoint */}
          <text x="8" y="105" fill="#0066FF" fontSize="11" fontWeight="bold">KANTE</text>
          <line x1="58" y1="101" x2="148" y2="101"
            stroke="#0066FF" strokeWidth="1.5" markerEnd="url(#arrowBlue)" strokeDasharray="4 2" />
        </g>
      )}

      <defs>
        <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#0066FF" />
        </marker>
        <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#FF3B3F" />
        </marker>
      </defs>

      {/* ── Root node (WURZEL) ── */}
      <rect x={root.x - 72} y={root.y - 22} width="144" height="44" rx="8"
        fill={hl('wurzel') ? '#FFE135' : '#F5F5F5'}
        stroke={hl('wurzel') ? '#FF3B3F' : '#999'}
        strokeWidth={hl('wurzel') ? 3 : 2}
      />
      <text x={root.x} y={root.y - 4} textAnchor="middle" fill="#111" fontSize="11" fontWeight="bold">
        Trägt sie einen Hut?
      </text>
      <text x={root.x} y={root.y + 10} textAnchor="middle" fill="#888" fontSize="9">
        (Merkmal prüfen)
      </text>
      {/* WURZEL label */}
      {(highlight === 'wurzel' || highlight === 'all') && (
        <g>
          <text x={root.x - 90} y={root.y - 30} fill="#FF3B3F" fontSize="13" fontWeight="bold">WURZEL</text>
          <line x1={root.x - 44} y1={root.y - 28} x2={root.x - 72} y2={root.y - 18}
            stroke="#FF3B3F" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowRed)" />
        </g>
      )}

      {/* ── n1 node (KNOTEN) ── */}
      <rect x={n1.x - 68} y={n1.y - 20} width="136" height="40" rx="8"
        fill={highlight === 'knoten_kante' || highlight === 'all' ? '#E3F2FD' : '#F5F5F5'}
        stroke={highlight === 'knoten_kante' || highlight === 'all' ? '#0066FF' : '#999'}
        strokeWidth={highlight === 'knoten_kante' || highlight === 'all' ? 3 : 2}
      />
      <text x={n1.x} y={n1.y - 4} textAnchor="middle" fill="#111" fontSize="11" fontWeight="bold">
        Trägt sie einen Mantel?
      </text>
      <text x={n1.x} y={n1.y + 10} textAnchor="middle" fill="#888" fontSize="9">
        (weiteres Merkmal)
      </text>
      {/* KNOTEN label */}
      {(highlight === 'knoten_kante' || highlight === 'all') && (
        <text x={n1.x - 72} y={n1.y - 26} fill="#0066FF" fontSize="13" fontWeight="bold">KNOTEN</text>
      )}

      {/* ── n2 leaf (BLATT — no label, unverdächtig) ── */}
      <rect x={n2.x - 56} y={n2.y - 18} width="112" height="36" rx="18"
        fill={hl('blatt') ? '#C8E6C9' : '#EEEEEE'}
        stroke={hl('blatt') ? '#00C853' : '#999'}
        strokeWidth={hl('blatt') ? 3 : 2}
      />
      <text x={n2.x} y={n2.y - 2} textAnchor="middle" fill={hl('blatt') ? '#1B5E20' : '#555'} fontSize="11" fontWeight="bold">
        ✅ unverdächtig
      </text>
      <text x={n2.x} y={n2.y + 12} textAnchor="middle" fill="#888" fontSize="9">
        (Ergebnis)
      </text>

      {/* ── lv leaf (BLATT — verdächtig) ── */}
      <rect x={lv.x - 52} y={lv.y - 18} width="104" height="36" rx="18"
        fill={hl('blatt') ? '#FFCDD2' : '#EEEEEE'}
        stroke={hl('blatt') ? '#FF3B3F' : '#999'}
        strokeWidth={hl('blatt') ? 3 : 2}
      />
      <text x={lv.x} y={lv.y - 2} textAnchor="middle" fill={hl('blatt') ? '#B71C1C' : '#555'} fontSize="11" fontWeight="bold">
        🔴 verdächtig
      </text>
      <text x={lv.x} y={lv.y + 12} textAnchor="middle" fill="#888" fontSize="9">
        (Ergebnis)
      </text>

      {/* ── lu1 leaf (BLATT — unverdächtig) ── */}
      <rect x={lu1.x - 52} y={lu1.y - 18} width="104" height="36" rx="18"
        fill={hl('blatt') ? '#C8E6C9' : '#EEEEEE'}
        stroke={hl('blatt') ? '#00C853' : '#999'}
        strokeWidth={hl('blatt') ? 3 : 2}
      />
      <text x={lu1.x} y={lu1.y - 2} textAnchor="middle" fill={hl('blatt') ? '#1B5E20' : '#555'} fontSize="11" fontWeight="bold">
        ✅ unverdächtig
      </text>
      <text x={lu1.x} y={lu1.y + 12} textAnchor="middle" fill="#888" fontSize="9">
        (Ergebnis)
      </text>

      {/* BLATT label (annotation arrow) */}
      {(highlight === 'blatt' || highlight === 'all') && (
        <g>
          <text x="295" y="283" fill="#00C853" fontSize="13" fontWeight="bold">BLATT</text>
          <line x1="294" y1="272" x2="240" y2="253"
            stroke="#00C853" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowGreen)" />
        </g>
      )}

      <defs>
        <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#00C853" />
        </marker>
      </defs>

      {/* Legend */}
      <g transform="translate(330, 185)">
        <rect x="0" y="0" width="140" height="100" rx="6" fill="white" stroke="#DDD" strokeWidth="1.5" />
        <text x="8" y="16" fill="#555" fontSize="9" fontWeight="bold">LEGENDE:</text>
        <rect x="8" y="22" width="16" height="14" rx="3" fill="#FFE135" stroke="#FF3B3F" strokeWidth="1.5" />
        <text x="30" y="33" fill="#333" fontSize="9">Wurzel (Start)</text>
        <rect x="8" y="42" width="16" height="14" rx="3" fill="#E3F2FD" stroke="#0066FF" strokeWidth="1.5" />
        <text x="30" y="53" fill="#333" fontSize="9">Knoten (Frage)</text>
        <rect x="8" y="62" width="16" height="14" rx="8" fill="#C8E6C9" stroke="#00C853" strokeWidth="1.5" />
        <text x="30" y="73" fill="#333" fontSize="9">Blatt (Ergebnis)</text>
        <line x1="8" y1="86" x2="24" y2="86" stroke="#999" strokeWidth="2" />
        <text x="30" y="90" fill="#333" fontSize="9">Kante (Pfad)</text>
      </g>
    </svg>
  )
}

type Props = {
  lines: DialogLine[]
  onComplete: () => void
  playerCharacter?: 'leader' | 'social'
  playerName?: string
}

const PLAYER_DATA = {
  leader: { src: '/game/characters/preview/leader.png' },
  social: { src: '/game/characters/preview/leader_w.png' },
}

export function TeachingDialog({ lines, onComplete, playerCharacter = 'leader', playerName }: Props) {
  const [lineIndex, setLineIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  const currentLine = lines[lineIndex]
  const highlight: Highlight = HIGHLIGHTS[lineIndex] ?? 'none'
  const displayName = playerName ?? 'Detektiv'
  const resolvedText = currentLine.text.replace(/\{NAME\}/g, displayName)

  useEffect(() => {
    setDisplayedText('')
    setIsTyping(true)

    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedText(resolvedText.slice(0, i))
      if (i >= resolvedText.length) { clearInterval(interval); setIsTyping(false) }
    }, 22)
    return () => clearInterval(interval)
  }, [lineIndex, resolvedText])

  const advance = useCallback(() => {
    if (isTyping) {
      setDisplayedText(resolvedText)
      setIsTyping(false)
      return
    }
    if (lineIndex < lines.length - 1) setLineIndex(i => i + 1)
    else onComplete()
  }, [isTyping, lineIndex, lines.length, resolvedText, onComplete])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'e') { e.preventDefault(); advance() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance])

  const isInspector = currentLine.portrait === 'node'
  const playerSrc = PLAYER_DATA[playerCharacter].src

  return (
    <div className="absolute inset-0 z-30 flex flex-col" style={{ background: 'rgba(0,0,0,0.75)' }}>
      {/* Tree panel — fills most of the space */}
      <div className="flex-1 flex items-center justify-center px-6 pt-4 pb-2">
        <div className="bg-white border-[3px] border-[#111] rounded-2xl shadow-[4px_4px_0_#111] p-4 w-full max-w-xl">
          <h3 className="font-bangers text-[#111] text-base tracking-wider text-center mb-1">
            🌳 ENTSCHEIDUNGSBAUM — BEISPIEL
          </h3>
          <p className="font-comic text-[#888] text-xs text-center mb-2">
            Klicke auf &quot;Weiter&quot; um mehr zu erfahren
          </p>
          <AnnotatedTreeSVG highlight={highlight} />
        </div>
      </div>

      {/* Dialog bar at bottom */}
      <div className="px-4 pb-4">
        <div
          className="bg-white border-[4px] border-[#111] rounded-2xl p-4 shadow-[5px_5px_0_#111] max-w-3xl mx-auto cursor-pointer relative"
          onClick={advance}
        >
          <div className="flex gap-4 items-end">
            {/* Portrait */}
            <div
              className="flex-shrink-0 w-14 h-20 rounded-xl border-[3px] border-[#111] overflow-hidden shadow-[3px_3px_0_#111]"
              style={{ background: isInspector ? '#FFE135' : '#0066FF' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isInspector ? '/game/characters/preview/brain.png' : playerSrc}
                alt={isInspector ? 'Inspektor' : displayName}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top center' }}
              />
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <div
                className="inline-block font-bangers text-sm tracking-widest px-3 py-0.5 rounded-full mb-1.5
                           border-[2px] border-[#111] shadow-[2px_2px_0_#111]"
                style={{ background: isInspector ? '#FFE135' : '#0066FF', color: isInspector ? '#111' : 'white' }}
              >
                {isInspector ? currentLine.speaker : displayName}
              </div>
              <p className="font-comic text-[#111] text-sm leading-relaxed min-h-[2.5rem]">
                {displayedText}
                {isTyping && <span className="animate-pulse text-[#FF3B3F] font-bold">▋</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1.5">
              {lines.map((_, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded-full border-[1.5px] border-[#111] transition-all"
                  style={{ width: i === lineIndex ? 20 : 10, background: i <= lineIndex ? '#FFE135' : '#DDD' }}
                />
              ))}
            </div>
            <div className="font-bangers text-xs text-[#888] tracking-wide">
              {lineIndex < lines.length - 1 ? 'Weiter [LEERTASTE] ▶' : 'Fertig ✓'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
