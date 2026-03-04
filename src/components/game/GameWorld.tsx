'use client'

import { useEffect, useCallback } from 'react'
import { useGameMovement } from '@/hooks/useGameMovement'
import { PlayerCharacter } from './PlayerCharacter'
import { InspectorNodeNPC, InteractionPoint, TeamMemberNPC } from './NPC'
import { WORLD_WIDTH, WORLD_HEIGHT, interactionZones } from '@/lib/game/level1Data'

type Props = {
  onInteract: (zoneId: 'monitor' | 'inspector' | 'caseboard') => void
  completedZones: string[]
  movementEnabled: boolean
  playerCharacter: 'leader' | 'social'
}

export function GameWorld({ onInteract, completedZones, movementEnabled, playerCharacter }: Props) {
  const { position, direction, isMoving, nearbyZone } = useGameMovement(movementEnabled)

  const handleInteract = useCallback(() => {
    if (nearbyZone && !completedZones.includes(nearbyZone.id)) {
      onInteract(nearbyZone.id as 'monitor' | 'inspector' | 'caseboard')
    }
  }, [nearbyZone, completedZones, onInteract])

  useEffect(() => {
    if (!movementEnabled) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'e' || e.key === 'E') handleInteract() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [movementEnabled, handleInteract])

  return (
    <div
      className="relative overflow-hidden select-none comic-panel"
      style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, maxWidth: '100%' }}
    >
      {/* ── SVG Background ────────────────────────────────────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/game/backgrounds/detective-office.png"
        alt=""
        className="absolute inset-0 pointer-events-none"
        style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, objectFit: 'fill' }}
        draggable={false}
        onError={(e) => { (e.target as HTMLImageElement).src = '/game/backgrounds/detective-office.svg' }}
      />

      {/* ── Locked door ──────────────────────────────────────────── */}
      <div className="absolute" style={{ left: 14, bottom: 85, width: 55, height: 90 }}>
        <div className="w-full h-full bg-[#8B5E3A] border-[3px] border-[#111] rounded-t-2xl shadow-[3px_3px_0_#111] flex flex-col items-center justify-center gap-1">
          <span className="text-2xl">🔒</span>
          <div className="bg-[#111] px-1 py-0.5 rounded">
            <span className="font-bangers text-[#FFE135] text-xs">LEVEL 2</span>
          </div>
          {/* Door knob */}
          <div className="absolute right-2 top-1/2 w-3 h-3 rounded-full bg-[#D4A843] border-[2px] border-[#111]" />
        </div>
      </div>

      {/* ── Interaction zone objects ──────────────────────────────── */}
      {interactionZones.map((zone) => {
        const isNear = nearbyZone?.id === zone.id
        const done = completedZones.includes(zone.id)
        return (
          <div
            key={zone.id}
            className="absolute cursor-pointer"
            style={{ left: zone.x - 35, top: zone.y - 50, width: 70, zIndex: 5 }}
            onClick={() => !done && onInteract(zone.id as 'monitor' | 'inspector' | 'caseboard')}
          >
            {zone.id === 'inspector' ? (
              <InspectorNodeNPC isNear={isNear} label={zone.label} />
            ) : (
              <InteractionPoint id={zone.id} icon={zone.icon} label={zone.label} isNear={isNear} completed={done} />
            )}
          </div>
        )
      })}

      {/* ── Dekorative Team-Mitglieder (Gaby nur wenn nicht als Spieler gewählt) ── */}
      {playerCharacter !== 'social' && (
        <div className="absolute pointer-events-none" style={{ left: 790, top: 300, zIndex: 3 }}>
          <TeamMemberNPC src="/game/characters/preview/leader_w.png" alt="Gaby" width={85} height={128} />
        </div>
      )}

      {/* ── Player ───────────────────────────────────────────────── */}
      <div
        className="absolute"
        style={{ left: position.x - 40, top: position.y - 60, zIndex: 10 }}
      >
        <PlayerCharacter direction={direction} isMoving={isMoving} playerCharacter={playerCharacter} />
      </div>

      {/* Mobile controls */}
      <div className="absolute bottom-3 right-3 grid grid-cols-3 gap-1 z-20 md:hidden">
        {([['↑','ArrowUp',2,1],['←','ArrowLeft',1,2],['↓','ArrowDown',2,2],['→','ArrowRight',3,2]] as const).map(([label, key, col, row]) => (
          <button
            key={label}
            className="w-9 h-9 bg-white border-[2px] border-[#111] rounded font-bangers text-[#111] text-sm shadow-[2px_2px_0_#111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#111]"
            style={{ gridColumn: col, gridRow: row }}
            onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))}
            onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))}
            onPointerLeave={() => window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mobile interact button */}
      {nearbyZone && !completedZones.includes(nearbyZone.id) && (
        <div className="absolute bottom-14 inset-x-0 flex justify-center z-20 md:hidden">
          <button
            onClick={handleInteract}
            className="comic-btn px-6 py-2 bg-[#FFE135] text-[#111] font-bangers text-base tracking-wide rounded-xl"
          >
            [E] {nearbyZone.label}
          </button>
        </div>
      )}
    </div>
  )
}
