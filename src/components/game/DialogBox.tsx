'use client'

import { useEffect, useState, useCallback } from 'react'
import type { DialogLine } from '@/lib/game/level1Data'
import { useTTS } from '@/hooks/useTTS'

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

export function DialogBox({ lines, onComplete, playerCharacter = 'leader', playerName }: Props) {
  const [lineIndex, setLineIndex]     = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping]       = useState(true)

  const { speak, stop, toggleMute, muted } = useTTS()

  const currentLine = lines[lineIndex]
  const displayName = playerName ?? 'Detektiv'
  const resolvedText = currentLine.text.replace(/\{NAME\}/g, displayName)

  // Neuer Satz: Typewriter starten + vorlesen
  useEffect(() => {
    setDisplayedText('')
    setIsTyping(true)

    // TTS: kompletten Satz sofort sprechen, Typewriter läuft parallel
    speak(resolvedText, currentLine.speaker)

    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedText(resolvedText.slice(0, i))
      if (i >= resolvedText.length) { clearInterval(interval); setIsTyping(false) }
    }, 22)

    return () => clearInterval(interval)
  }, [lineIndex, resolvedText, currentLine.speaker, speak])

  // Beim Schließen TTS stoppen
  useEffect(() => {
    return () => stop()
  }, [stop])

  const advance = useCallback(() => {
    if (isTyping) {
      // Text sofort fertig zeigen (TTS läuft weiter)
      setDisplayedText(resolvedText)
      setIsTyping(false)
      return
    }
    if (lineIndex < lines.length - 1) setLineIndex(i => i + 1)
    else { stop(); onComplete() }
  }, [isTyping, lineIndex, lines.length, resolvedText, onComplete, stop])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); stop(); onComplete(); return }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'e') { e.preventDefault(); advance() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance])

  const isInspector = currentLine.portrait === 'node'
  const playerSrc = PLAYER_DATA[playerCharacter].src

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 p-4">
      <button
        type="button"
        className="relative bg-white border-[4px] border-[#111] rounded-2xl p-4 shadow-[5px_5px_0_#111] max-w-3xl mx-auto w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE135] focus-visible:ring-offset-2"
        onClick={advance}
        aria-label={lineIndex < lines.length - 1 ? 'Weiter' : 'Dialog abschließen'}
        style={{ cursor: 'pointer' }}
      >
        {/* Comic halftone accent top-left */}
        <div className="absolute top-0 left-0 w-16 h-16 rounded-tl-2xl overflow-hidden opacity-20 pointer-events-none">
          <div className="w-full h-full comic-dots" />
        </div>

        {/* Mute-Button + Skip-Button */}
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); stop(); onComplete() }}
            className="h-8 px-2 flex items-center justify-center rounded-lg border-[2px] border-[#111] bg-white hover:bg-[#FFE135] shadow-[1px_1px_0_#111] transition-all text-[10px] font-bangers tracking-wide text-[#888] hover:text-[#111]"
            title="Dialog überspringen"
          >
            ⏭ Skip
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleMute() }}
            className="w-8 h-8 flex items-center justify-center rounded-lg border-[2px] border-[#111] bg-white hover:bg-[#FFF5CC] shadow-[1px_1px_0_#111] transition-all text-sm"
            title={muted ? 'Ton einschalten' : 'Ton ausschalten'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>

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
            {/* Speaker name — comic style */}
            <div
              className="inline-block font-bangers text-sm tracking-widest px-3 py-0.5 rounded-full mb-1.5
                         border-[2px] border-[#111] shadow-[2px_2px_0_#111]"
              style={{ background: isInspector ? '#FFE135' : '#0066FF', color: isInspector ? '#111' : 'white' }}
            >
              {isInspector ? currentLine.speaker : displayName}
            </div>

            {/* Dialog text */}
            <p className="font-comic text-[#111] text-sm leading-relaxed min-h-[2.5rem]">
              {displayedText}
              {isTyping && <span className="animate-pulse text-[#FF3B3F] font-bold">▋</span>}
            </p>
          </div>
        </div>

        {/* Continue hint */}
        <div className="flex items-center justify-between mt-3">
          {/* Progress dots */}
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
      </button>
    </div>
  )
}
