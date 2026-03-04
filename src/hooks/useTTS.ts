'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Charakter-Stimmprofil
// ─────────────────────────────────────────────────────────────────────────────

type VoiceProfile = {
  pitch: number   // 0.5 – 2.0 (1 = normal)
  rate:  number   // 0.5 – 2.0 (1 = normal)
  volume: number  // 0 – 1
}

const VOICE_PROFILES: Record<string, VoiceProfile> = {
  'Inspector Node': { pitch: 0.82, rate: 0.88, volume: 1 },  // tief, langsam, würdevoll
  'Agent X':        { pitch: 1.15, rate: 1.05, volume: 1 },  // jung, lebhaft
  'Gustav G.':      { pitch: 0.95, rate: 0.75, volume: 0.9 }, // nervös, leise
  'Maria M.':       { pitch: 1.1,  rate: 0.95, volume: 1 },  // klar, präzise
  'Boris B.':       { pitch: 0.7,  rate: 0.8,  volume: 1 },  // tief, griesgrämig
  default:          { pitch: 1.0,  rate: 1.0,  volume: 1 },
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useTTS() {
  const [muted, setMuted]     = useState(false)
  const [ready, setReady]     = useState(false)
  const voicesRef             = useRef<SpeechSynthesisVoice[]>([])
  const utteranceRef          = useRef<SpeechSynthesisUtterance | null>(null)

  // Stimmen laden (Browser braucht manchmal einen Moment)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices()
      voicesRef.current = all
      if (all.length > 0) setReady(true)
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  /** Sucht die beste deutsche Stimme */
  const getGermanVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current

    // Bevorzuge: de-DE, dann de-AT, dann de-CH, dann de-*
    const preferred = [
      voices.find(v => v.lang === 'de-DE' && v.localService),
      voices.find(v => v.lang === 'de-DE'),
      voices.find(v => v.lang.startsWith('de-AT')),
      voices.find(v => v.lang.startsWith('de')),
    ]

    return preferred.find(Boolean) ?? null
  }, [])

  /** Text vorlesen */
  const speak = useCallback((text: string, speaker: string) => {
    if (muted || typeof window === 'undefined' || !window.speechSynthesis) return

    // Vorherige Wiedergabe stoppen
    window.speechSynthesis.cancel()

    const profile = VOICE_PROFILES[speaker] ?? VOICE_PROFILES.default
    const u = new SpeechSynthesisUtterance(text)

    u.lang   = 'de-DE'
    u.pitch  = profile.pitch
    u.rate   = profile.rate
    u.volume = profile.volume

    const voice = getGermanVoice()
    if (voice) u.voice = voice

    utteranceRef.current = u
    window.speechSynthesis.speak(u)
  }, [muted, getGermanVoice])

  /** Wiedergabe stoppen */
  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const toggleMute = useCallback(() => {
    setMuted(m => {
      if (!m) {
        // Stumm schalten: laufende Wiedergabe stoppen
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel()
        }
      }
      return !m
    })
  }, [])

  return { speak, stop, toggleMute, muted, ready }
}
