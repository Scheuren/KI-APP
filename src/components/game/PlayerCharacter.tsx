'use client'

import Image from 'next/image'

type Direction = 'up' | 'down' | 'left' | 'right' | 'idle'

type Props = {
  direction: Direction
  isMoving: boolean
  playerCharacter: 'leader' | 'social'
}

const CHAR_SRC: Record<'leader' | 'social', string> = {
  leader: '/game/characters/preview/leader.png',
  social: '/game/characters/preview/leader_w.png',
}

export function PlayerCharacter({ direction, isMoving, playerCharacter }: Props) {
  const flipX = direction === 'left'
  const src = CHAR_SRC[playerCharacter]

  return (
    <div
      className="relative select-none"
      style={{ width: 80, height: 120 }}
    >
      <style>{`
        @keyframes playerBob {
          from { transform: ${flipX ? 'scaleX(-1) ' : ''}translateY(0px); }
          to   { transform: ${flipX ? 'scaleX(-1) ' : ''}translateY(-5px); }
        }
      `}</style>

      <div
        style={{
          width: '100%',
          height: '100%',
          transform: flipX ? 'scaleX(-1)' : 'none',
          transition: 'transform 0.1s',
          animation: isMoving ? 'playerBob 0.35s infinite alternate ease-in-out' : 'none',
        }}
      >
        <Image
          src={src}
          alt={playerCharacter === 'leader' ? 'Tim' : 'Gaby'}
          width={80}
          height={120}
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          unoptimized
        />
      </div>
    </div>
  )
}
