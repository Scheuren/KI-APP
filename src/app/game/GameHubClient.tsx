'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AuthButton } from '@/components/auth/AuthButton'
import { useGameProgress } from '@/hooks/useGameProgress'

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

  useEffect(() => {
    loadAllProgress().then((allProgress) => {
      const completed = new Set<number>()
      allProgress.forEach((p) => {
        if (p.is_completed && p.level) {
          completed.add(p.level)
        }
      })
      setCompletedLevels(completed)
      setLoading(false)
    })
  }, [loadAllProgress])

  if (showAuthOnly) {
    return <AuthButton compact />
  }

  // Alle Levels sind vorerst freigeschaltet (Backend kommt separat)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isUnlocked = (_levelNum: number): boolean => {
    return true
  }

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
                         hover:translate-x-[3px] hover:translate-y-[3px] transition-all mb-3 group"
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
                        OFFEN
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
                            OFFEN
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
    </div>
  )
}
