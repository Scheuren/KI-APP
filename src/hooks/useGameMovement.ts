'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  PLAYER_SPEED,
  INTERACTION_RADIUS,
  interactionZones,
  type InteractionZone,
} from '@/lib/game/level1Data'

const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 56
const WALL_PADDING = 20

// Touch joystick dead zone (pixels)
const TOUCH_DEAD_ZONE = 10

type Position = { x: number; y: number }
type Direction = 'up' | 'down' | 'left' | 'right' | 'idle'

export type GameMovementState = {
  position: Position
  direction: Direction
  isMoving: boolean
  nearbyZone: InteractionZone | null
}

export function useGameMovement(enabled: boolean = true) {
  const [state, setState] = useState<GameMovementState>({
    position: { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT - 120 },
    direction: 'down',
    isMoving: false,
    nearbyZone: null,
  })

  const keysRef = useRef<Set<string>>(new Set())
  const animFrameRef = useRef<number>(0)
  const posRef = useRef<Position>({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT - 120 })
  const dirRef = useRef<Direction>('down')
  // Touch joystick state: stores initial touch position and current offset
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const touchDeltaRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 })

  const findNearbyZone = useCallback((pos: Position): InteractionZone | null => {
    for (const zone of interactionZones) {
      const dx = pos.x - zone.x
      const dy = pos.y - zone.y
      if (Math.sqrt(dx * dx + dy * dy) <= INTERACTION_RADIUS) {
        return zone
      }
    }
    return null
  }, [])

  useEffect(() => {
    if (!enabled) return

    // ── Keyboard handlers ───────────────────────────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent arrow keys from scrolling the page during gameplay
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }
      keysRef.current.add(e.key.toLowerCase())
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }

    // ── Touch handlers (virtual joystick) ───────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      touchDeltaRef.current = { dx: 0, dy: 0 }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return
      e.preventDefault()
      const touch = e.touches[0]
      const rawDx = touch.clientX - touchStartRef.current.x
      const rawDy = touch.clientY - touchStartRef.current.y
      // Apply dead zone
      touchDeltaRef.current = {
        dx: Math.abs(rawDx) > TOUCH_DEAD_ZONE ? rawDx : 0,
        dy: Math.abs(rawDy) > TOUCH_DEAD_ZONE ? rawDy : 0,
      }
    }

    const onTouchEnd = () => {
      touchStartRef.current = null
      touchDeltaRef.current = { dx: 0, dy: 0 }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)

    const loop = () => {
      const keys = keysRef.current
      let dx = 0
      let dy = 0

      // Keyboard input
      if (keys.has('arrowleft') || keys.has('a')) dx -= PLAYER_SPEED
      if (keys.has('arrowright') || keys.has('d')) dx += PLAYER_SPEED
      if (keys.has('arrowup') || keys.has('w')) dy -= PLAYER_SPEED
      if (keys.has('arrowdown') || keys.has('s')) dy += PLAYER_SPEED

      // Touch input (normalize to player speed)
      const { dx: tdx, dy: tdy } = touchDeltaRef.current
      if (tdx !== 0 || tdy !== 0) {
        const touchMagnitude = Math.sqrt(tdx * tdx + tdy * tdy)
        const normFactor = PLAYER_SPEED / Math.max(touchMagnitude, PLAYER_SPEED)
        dx += tdx * normFactor
        dy += tdy * normFactor
      }

      if (dx !== 0 || dy !== 0) {
        const newX = Math.max(
          WALL_PADDING + PLAYER_WIDTH / 2,
          Math.min(WORLD_WIDTH - WALL_PADDING - PLAYER_WIDTH / 2, posRef.current.x + dx)
        )
        const newY = Math.max(
          WALL_PADDING + PLAYER_HEIGHT / 2,
          Math.min(WORLD_HEIGHT - WALL_PADDING - PLAYER_HEIGHT / 2, posRef.current.y + dy)
        )
        posRef.current = { x: newX, y: newY }

        let dir: Direction = dirRef.current
        if (Math.abs(dx) >= Math.abs(dy)) {
          dir = dx < 0 ? 'left' : 'right'
        } else {
          dir = dy < 0 ? 'up' : 'down'
        }
        dirRef.current = dir

        const nearby = findNearbyZone(posRef.current)
        setState({ position: { ...posRef.current }, direction: dir, isMoving: true, nearbyZone: nearby })
      } else {
        const nearby = findNearbyZone(posRef.current)
        setState((prev) => ({
          ...prev,
          isMoving: false,
          nearbyZone: nearby,
        }))
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [enabled, findNearbyZone])

  return state
}
