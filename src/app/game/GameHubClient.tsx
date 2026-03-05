'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AuthButton } from '@/components/auth/AuthButton'
import { useGameProgress } from '@/hooks/useGameProgress'


// ─── Erweiterung B: Inspector Nodes Geständnis ────────────────────────────────
const nodeConfessionDialogue = [
  { speaker: 'Inspector Node', text: '{NAME}, bevor wir das letzte Level angehen, muss ich dir etwas erzählen. Etwas, das ich lange nicht erzählt habe.' },
  { speaker: '{NAME}', text: 'Was ist passiert?' },
  { speaker: 'Inspector Node', text: 'Vor vielen Jahren habe ich selbst ein Klassifikationssystem gebaut. Für Einstellungsentscheidungen in einem Betrieb. Es war technisch einwandfrei — Genauigkeit 94% auf den Testdaten.' },
  { speaker: '{NAME}', text: 'Das klingt gut.' },
  { speaker: 'Inspector Node', text: 'Das dachte ich auch. Aber erinnerst du dich an Overfitting aus Level 4? Das Modell hatte die Trainingsdaten auswendig gelernt. Und die Trainingsdaten kamen alle aus einer einzigen Abteilung.' },
  { speaker: '{NAME}', text: 'Und in der Realität...?' },
  { speaker: 'Inspector Node', text: 'In der Realität lehnte das System systematisch Bewerber aus anderen Städten ab. Es war nicht bösartig. Es hat einfach das Muster gelernt, das in den Daten war.' },
  { speaker: '{NAME}', text: 'Und du hast das nicht vorher gesehen?' },
  { speaker: 'Inspector Node', text: 'Ich habe die Zahlen gesehen und gedacht: 94% Genauigkeit — das ist ein Erfolg. Ich habe nicht gefragt: Für wen ist es genau? Für wen nicht? Das war mein Fehler. Und Menschen haben dafür bezahlt.' },
  { speaker: 'Inspector Node', text: 'Geh jetzt rein in Level 5. Und vergiss nicht: Hinter jeder Zahl steht ein Mensch.' },
]

const LEVELS = [
  {
    num: 1,
    title: 'Der Fall der verwirrten Daten',
    desc: 'Lerne den Entscheidungsbaum kennen — klassifiziere Verdächtige und löse den Fall! Wurzel · Knoten · Kante · Blatt',
    duration: '~45 min',
    xp: 200,
    icon: '/game/icons/icon-caseboard-clean.png',
    href: '/game/level1',
  },
  {
    num: 2,
    title: 'Das Urteil des Baumes',
    desc: 'Verdächtige anhand eines vorgegebenen Entscheidungsbaums klassifizieren',
    duration: '~40 min',
    xp: 200,
    icon: null,
    href: '/game/level2',
  },
  {
    num: 3,
    title: 'Baue deinen eigenen Baum',
    desc: 'Lernalgorithmus · Trainingsdaten · Datensplits',
    duration: '~50 min',
    xp: 200,
    icon: null,
    href: '/game/level3',
  },
  {
    num: 4,
    title: 'Der fehlerhafte Baum',
    desc: 'Genauigkeit · Fehlerrate · Overfitting erkennen',
    duration: '~45 min',
    xp: 200,
    icon: null,
    href: '/game/level4',
  },
  {
    num: 5,
    title: 'Der voreingenommene Orakel',
    desc: 'Datenbias · Chancen & Risiken · KI-Ethik',
    duration: '~50 min',
    xp: 200,
    icon: null,
    href: '/game/level5',
  },
]

interface GameHubClientProps {
  /** When true, only renders the auth button (for use in hero section) */
  showAuthOnly?: boolean
}

export function GameHubClient({ showAuthOnly = false }: GameHubClientProps) {
  const { loadAllProgress } = useGameProgress()
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showConfession, setShowConfession] = useState(false)
  const [confessionLine, setConfessionLine] = useState(0)
  const playerName = typeof window !== 'undefined' ? (localStorage.getItem('mks_player_name') ?? 'Detektiv') : 'Detektiv'

  useEffect(() => {
    loadAllProgress().then((allProgress) => {
      const completed = new Set<number>()
      let l4xp = 0
      allProgress.forEach((p) => {
        if (p.is_completed && p.level) {
          completed.add(p.level)
        }
        if (p.level === 4 && p.xp) l4xp = p.xp
      })
      setCompletedLevels(completed)
      setLoading(false)
      // Erweiterung B: Geständnis wenn L4 ≥150 XP und L5 noch nicht gestartet
      if (completed.has(4) && l4xp >= 150 && !completed.has(5)) {
        const seen = typeof window !== 'undefined' && localStorage.getItem('mks_node_confession_seen')
        if (!seen) setShowConfession(true)
      }
    })
  }, [loadAllProgress])

  if (showAuthOnly) {
    return <AuthButton compact />
  }

  // TEST MODE: All levels unlocked
  const isUnlocked = (_levelNum: number): boolean => true

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <h2 className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-2xl tracking-widest
                     text-center mb-5">MISSIONEN</h2>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-900 rounded-2xl border-[2px] border-slate-700 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Level 1 — always unlocked */}
          {LEVELS.slice(0, 1).map((level) => (
            <Link
              key={level.num}
              href={level.href}
              className="flex items-stretch bg-white border-[3px] border-[#111] rounded-2xl
                         overflow-hidden shadow-[5px_5px_0_#111] hover:shadow-[2px_2px_0_#111]
                         hover:translate-x-[3px] hover:translate-y-[3px] transition-all mb-3 group
                         focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE135] focus-visible:ring-offset-2"
            >
              {/* Thumbnail */}
              <div className="relative flex-shrink-0" style={{ width: 110 }}>
                {level.icon ? (
                  <Image
                    src={level.icon}
                    alt={level.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-[#0066FF] flex items-center justify-center">
                    <span className="font-[family-name:var(--font-bangers)] text-white text-3xl">
                      {level.num}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-[family-name:var(--font-bangers)] text-[#FF3B3F] text-xl tracking-wide">
                      Level {level.num}
                    </span>
                    {completedLevels.has(level.num) ? (
                      <span className="bg-[#FFE135] text-[#111] font-[family-name:var(--font-bangers)]
                                       text-xs px-2 py-0.5 rounded-full border-[2px] border-[#111]">
                        ABGESCHLOSSEN
                      </span>
                    ) : (
                      <span className="bg-[#00C853] text-white font-[family-name:var(--font-bangers)]
                                       text-xs px-2 py-0.5 rounded-full border-[2px] border-[#111]">
                        ▶ OFFEN
                      </span>
                    )}
                  </div>
                  <p className="font-[family-name:var(--font-bangers)] text-[#111] text-lg tracking-wide leading-tight">
                    {level.title}
                  </p>
                  <p className="font-[family-name:var(--font-comic)] text-[#666] text-xs mt-1 leading-relaxed">
                    {level.desc}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-[family-name:var(--font-comic)] text-[#888] text-xs">{level.duration}</span>
                  <span className="font-[family-name:var(--font-comic)] text-[#888] text-xs">·</span>
                  <span className="font-[family-name:var(--font-comic)] text-[#888] text-xs">bis zu {level.xp} XP</span>
                </div>
              </div>

              <div className="flex items-center pr-4">
                <span className="font-[family-name:var(--font-bangers)] text-[#FF3B3F] text-2xl
                                 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}

          {/* Levels 2–5 */}
          {LEVELS.slice(1).map((level) => {
            const unlocked = isUnlocked(level.num)
            const completed = completedLevels.has(level.num)
            const levelColors: Record<number, string> = {
              2: '#0066FF',
              3: '#00C853',
              4: '#FF9800',
              5: '#9C27B0',
            }
            const levelColor = levelColors[level.num] ?? '#0066FF'

            if (unlocked) {
              return (
                <Link
                  key={level.num}
                  href={level.href}
                  className="flex items-stretch bg-white border-[3px] border-[#111] rounded-2xl
                             overflow-hidden shadow-[5px_5px_0_#111] hover:shadow-[2px_2px_0_#111]
                             hover:translate-x-[3px] hover:translate-y-[3px] transition-all mb-3 group"
                >
                  <div className="relative flex-shrink-0" style={{ width: 110 }}>
                    <div className="w-full h-full flex items-center justify-center" style={{ background: levelColor }}>
                      <span className="font-[family-name:var(--font-bangers)] text-white text-3xl">
                        {level.num}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-[family-name:var(--font-bangers)] text-[#FF3B3F] text-xl tracking-wide">
                          Level {level.num}
                        </span>
                        {completed ? (
                          <span className="bg-[#FFE135] text-[#111] font-[family-name:var(--font-bangers)]
                                           text-xs px-2 py-0.5 rounded-full border-[2px] border-[#111]">
                            ABGESCHLOSSEN
                          </span>
                        ) : (
                          <span className="bg-[#00C853] text-white font-[family-name:var(--font-bangers)]
                                           text-xs px-2 py-0.5 rounded-full border-[2px] border-[#111]">
                            ▶ OFFEN
                          </span>
                        )}
                      </div>
                      <p className="font-[family-name:var(--font-bangers)] text-[#111] text-lg tracking-wide leading-tight">
                        {level.title}
                      </p>
                      <p className="font-[family-name:var(--font-comic)] text-[#666] text-xs mt-1 leading-relaxed">
                        {level.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-[family-name:var(--font-comic)] text-[#888] text-xs">{level.duration}</span>
                      <span className="font-[family-name:var(--font-comic)] text-[#888] text-xs">·</span>
                      <span className="font-[family-name:var(--font-comic)] text-[#888] text-xs">bis zu {level.xp} XP</span>
                    </div>
                  </div>
                  <div className="flex items-center pr-4">
                    <span className="font-[family-name:var(--font-bangers)] text-[#FF3B3F] text-2xl
                                     group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              )
            }

            return (
              <div
                key={level.num}
                className="flex items-center gap-4 bg-slate-900 border-[2px] border-slate-700
                           rounded-2xl px-5 py-4 mb-2 opacity-50"
              >
                <div className="w-12 h-12 bg-slate-800 border-[2px] border-slate-600 rounded-xl
                                flex items-center justify-center text-2xl flex-shrink-0">
                  🔒
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[family-name:var(--font-bangers)] text-slate-400 text-base tracking-wide">
                    Level {level.num} — {level.title}
                  </p>
                  <p className="font-[family-name:var(--font-comic)] text-slate-600 text-xs mt-0.5">{level.desc}</p>
                </div>
                <span className="font-[family-name:var(--font-bangers)] text-slate-600 text-xs px-2 py-0.5
                                 rounded-full border border-slate-700 flex-shrink-0">
                  GESPERRT
                </span>
              </div>
            )
          })}
        </>
      )}
      {/* Erweiterung B: Inspector Nodes Geständnis */}
      {showConfession && (
        <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] max-w-md w-full overflow-hidden">
            <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/characters/preview/brain.png" alt="Inspector" style={{ width: 40, height: 56, objectFit: 'contain' }} />
              <div>
                <p className="font-[family-name:var(--font-bangers)] text-[#111] text-lg tracking-wide">INSPECTOR NODE</p>
                <p className="font-[family-name:var(--font-comic)] text-[#555] text-xs">Etwas Wichtiges, bevor du weitermachst...</p>
              </div>
            </div>
            <div className="p-5">
              <p className="font-[family-name:var(--font-bangers)] text-[#888] text-xs mb-1 tracking-wide">
                {nodeConfessionDialogue[confessionLine].speaker === '{NAME}' ? playerName : nodeConfessionDialogue[confessionLine].speaker}
              </p>
              <p className="font-[family-name:var(--font-comic)] text-[#111] text-sm leading-relaxed min-h-[4rem]">
                {nodeConfessionDialogue[confessionLine].text.replace(/\{NAME\}/g, playerName)}
              </p>
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-1">
                  {nodeConfessionDialogue.map((_, i) => (
                    <div key={i} className="h-2 rounded-full border border-[#111] transition-all"
                      style={{ width: i === confessionLine ? 16 : 8, background: i <= confessionLine ? '#FFE135' : '#DDD' }} />
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (confessionLine < nodeConfessionDialogue.length - 1) {
                      setConfessionLine(l => l + 1)
                    } else {
                      if (typeof window !== 'undefined') localStorage.setItem('mks_node_confession_seen', '1')
                      setShowConfession(false)
                    }
                  }}
                  className="font-[family-name:var(--font-bangers)] bg-[#FFE135] border-[2px] border-[#111] rounded-xl px-4 py-1.5 text-[#111] text-sm tracking-wide shadow-[2px_2px_0_#111] hover:bg-[#FF3B3F] hover:text-white transition-colors"
                >
                  {confessionLine < nodeConfessionDialogue.length - 1 ? 'Weiter ▶' : 'Verstanden ✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
