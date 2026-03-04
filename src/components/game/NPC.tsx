'use client'

import Image from 'next/image'
import { useState } from 'react'

/** Speech bubble shown when player is near */
function SpeechBubble({ label }: { label: string }) {
  return (
    <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20">
      <div className="relative bg-white border-[3px] border-[#111] rounded-xl px-3 py-1.5
                     font-bangers text-sm tracking-wide text-[#111] whitespace-nowrap shadow-[2px_2px_0_#111]">
        [E] {label}
        <div className="absolute left-6 -bottom-[13px] w-0 h-0 border-l-[8px] border-r-[6px] border-t-[13px] border-l-transparent border-r-transparent border-t-[#111]" />
        <div className="absolute left-[26px] -bottom-[9px] w-0 h-0 border-l-[6px] border-r-[4px] border-t-[10px] border-l-transparent border-r-transparent border-t-white z-10" />
      </div>
    </div>
  )
}

/** SVG fallback for Inspector Node */
function InspectorSVG() {
  return (
    <svg viewBox="0 0 64 90" width="64" height="90" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="16" rx="26" ry="5" fill="#8B4513" stroke="#111" strokeWidth="2.5"/>
      <rect x="14" y="2" width="36" height="16" rx="7" fill="#6B3410" stroke="#111" strokeWidth="2.5"/>
      <rect x="14" y="14" width="36" height="4" rx="1" fill="#4A2408"/>
      <path d="M28 4 Q32 10 36 4" stroke="#4A2408" strokeWidth="2" fill="none"/>
      <ellipse cx="32" cy="32" rx="16" ry="16" fill="#E8C49A" stroke="#111" strokeWidth="2.5"/>
      <ellipse cx="16" cy="32" rx="4" ry="5" fill="#D4A870" stroke="#111" strokeWidth="2"/>
      <ellipse cx="48" cy="32" rx="4" ry="5" fill="#D4A870" stroke="#111" strokeWidth="2"/>
      <path d="M18 24 Q24 21 30 24" stroke="#3D1F00" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M34 24 Q40 21 46 24" stroke="#3D1F00" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <ellipse cx="25" cy="29" rx="4" ry="4.5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <ellipse cx="39" cy="29" rx="4" ry="4.5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="26" cy="30" r="2.5" fill="#1A0A00"/>
      <circle cx="40" cy="30" r="2.5" fill="#1A0A00"/>
      <path d="M21 38 Q26 42 32 39 Q38 42 43 38" stroke="#3D1F00" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <rect x="35" y="40" width="14" height="4" rx="2" fill="#8B4513" stroke="#111" strokeWidth="1.5"/>
      <ellipse cx="36" cy="42" rx="4" ry="5.5" fill="#5C2E08" stroke="#111" strokeWidth="1.5"/>
      <rect x="6" y="47" width="52" height="36" rx="6" fill="#4A3728" stroke="#111" strokeWidth="2.5"/>
      <rect x="6" y="47" width="18" height="36" rx="6" fill="#3A2718"/>
      <polygon points="32,47 18,60 32,54" fill="#2E1E10" stroke="#111" strokeWidth="1.5"/>
      <polygon points="32,47 46,60 32,54" fill="#2E1E10" stroke="#111" strokeWidth="1.5"/>
      <rect x="6" y="64" width="52" height="6" rx="1" fill="#2A1A08" stroke="#111" strokeWidth="2"/>
      <rect x="28" y="64" width="8" height="6" rx="1" fill="#D4A843" stroke="#111" strokeWidth="1.5"/>
      <rect x="15" y="53" width="34" height="9" rx="3" fill="#FFE135" stroke="#111" strokeWidth="1.5"/>
      <text x="32" y="60" textAnchor="middle" fontSize="5" fill="#111" fontWeight="bold" fontFamily="monospace">INSPECTOR NODE</text>
      <rect x="-2" y="48" width="12" height="24" rx="5" fill="#4A3728" stroke="#111" strokeWidth="2.5"/>
      <rect x="54" y="48" width="12" height="24" rx="5" fill="#4A3728" stroke="#111" strokeWidth="2.5"/>
      <ellipse cx="4" cy="73" rx="6" ry="5" fill="#D4A870" stroke="#111" strokeWidth="2"/>
      <ellipse cx="60" cy="73" rx="6" ry="5" fill="#D4A870" stroke="#111" strokeWidth="2"/>
      <rect x="14" y="82" width="14" height="8" rx="3" fill="#3A2718" stroke="#111" strokeWidth="2.5"/>
      <rect x="36" y="82" width="14" height="8" rx="3" fill="#3A2718" stroke="#111" strokeWidth="2.5"/>
    </svg>
  )
}

export function InspectorNodeNPC({ isNear, label }: { isNear: boolean; label: string }) {
  return (
    <div className="relative flex flex-col items-center">
      {isNear && <SpeechBubble label={label} />}

      <div>
        <style>{`
          @keyframes npcBounce {
            from { transform: translateY(0px); }
            to   { transform: translateY(-4px); }
          }
        `}</style>

        <div style={{ animation: isNear ? 'npcBounce 0.8s infinite alternate ease-in-out' : 'none' }}>
          <Image
            src="/game/characters/preview/brain.png"
            alt="Karl"
            width={96}
            height={144}
            style={{ objectFit: 'contain' }}
            unoptimized
          />
        </div>
      </div>
    </div>
  )
}

/** Dekorative Team-Mitglieder ohne Interaktion */
export function TeamMemberNPC({ src, alt, width = 70, height = 105 }: { src: string; alt: string; width?: number; height?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}

/** Maps zone id → generated PNG icon path */
const ZONE_ICONS: Record<string, string> = {
  monitor:   '/game/icons/icon-monitor.png',
  caseboard: '/game/icons/icon-caseboard.png',
}

function ZoneIcon({ zoneId, emoji }: { zoneId: string; emoji: string }) {
  const [err, setErr] = useState(false)
  const src = ZONE_ICONS[zoneId]
  if (!src || err) return <span style={{ fontSize: '3rem' }}>{emoji}</span>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={72}
      height={72}
      style={{ objectFit: 'contain' }}
      onError={() => setErr(true)}
    />
  )
}

export function InteractionPoint({
  id, icon, label, isNear, completed,
}: {
  id: string; icon: string; label: string; isNear: boolean; completed: boolean
}) {
  return (
    <div className="relative flex flex-col items-center gap-1">
      {isNear && !completed && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20">
          <div className="relative bg-[#FFE135] border-[3px] border-[#111] rounded-xl px-3 py-1.5 font-bangers text-sm text-[#111] whitespace-nowrap shadow-[2px_2px_0_#111]">
            [E] {label}
            <div className="absolute left-6 -bottom-[13px] w-0 h-0 border-l-[8px] border-r-[6px] border-t-[13px] border-l-transparent border-r-transparent border-t-[#111]" />
            <div className="absolute left-[26px] -bottom-[9px] w-0 h-0 border-l-[6px] border-r-[4px] border-t-[10px] border-l-transparent border-r-transparent border-t-[#FFE135] z-10" />
          </div>
        </div>
      )}
      <div
        className={`flex items-center justify-center transition-all duration-150 ${completed ? 'opacity-50 grayscale' : isNear ? 'scale-110' : ''}`}
        style={{ filter: isNear && !completed ? 'drop-shadow(0 0 10px #FFE135)' : 'none' }}
      >
        {completed ? <span style={{ fontSize: '3rem' }}>✅</span> : <ZoneIcon zoneId={id} emoji={icon} />}
      </div>
      <div className="font-bangers tracking-wide text-center px-2 py-0.5 rounded bg-[#111] text-[#FFE135]" style={{ fontSize: '0.65rem', maxWidth: 90 }}>
        {label}
      </div>
    </div>
  )
}
