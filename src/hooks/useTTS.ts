'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// djb2-Hash — muss identisch mit scripts/generate_audio.py sein
// ─────────────────────────────────────────────────────────────────────────────

function djb2(text: string): string {
  let h = 5381
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h, 33) + text.charCodeAt(i)
    h = h & h  // 32-bit
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

function manifestKey(text: string, speaker: string): string {
  const ttsText = text.replace(/\{NAME\}/g, 'der Detektiv')
  return `${djb2(ttsText)}_${djb2(speaker)}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser-TTS Fallback (Web Speech API)
// ─────────────────────────────────────────────────────────────────────────────

type VoiceProfile = {
  pitch: number
  rate:  number
  volume: number
}

const VOICE_PROFILES: Record<string, VoiceProfile> = {
  'Inspector Node': { pitch: 0.82, rate: 0.88, volume: 1 },
  'Viktor':         { pitch: 1.05, rate: 0.80, volume: 0.9 },
  default:          { pitch: 1.0,  rate: 1.0,  volume: 1   },
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useTTS() {
  const [muted, setMuted] = useState(false)
  const [ready, setReady] = useState(false)

  const manifestRef        = useRef<Record<string, string> | null>(null)
  const manifestLoadedRef  = useRef(false)
  const audioRef           = useRef<HTMLAudioElement | null>(null)
  const voicesRef          = useRef<SpeechSynthesisVoice[]>([])

  // ── Manifest laden (einmalig) ──────────────────────────────────────────────
  useEffect(() => {
    if (manifestLoadedRef.current) return
    manifestLoadedRef.current = true

    fetch('/game/audio/manifest.json')
      .then(r => r.ok ? r.json() : null)
      .then((data: Record<string, string> | null) => {
        if (data) {
          manifestRef.current = data
          console.log(`[TTS] Qwen3-TTS Manifest: ${Object.keys(data).length} Audiodateien`)
        }
      })
      .catch(() => {
        console.log('[TTS] Kein Manifest — Browser-TTS Fallback aktiv')
      })
  }, [])

  // ── Browser-Stimmen laden ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
      if (voicesRef.current.length > 0) setReady(true)
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  const getGermanVoice = useCallback((): SpeechSynthesisVoice | null => {
    const v = voicesRef.current
    return (
      v.find(x => x.lang === 'de-DE' && x.localService) ??
      v.find(x => x.lang === 'de-DE') ??
      v.find(x => x.lang.startsWith('de')) ??
      null
    )
  }, [])

  // ── Stoppen ───────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  // ── Browser-TTS ───────────────────────────────────────────────────────────
  const speakBrowserTTS = useCallback((text: string, speaker: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const profile = VOICE_PROFILES[speaker] ?? VOICE_PROFILES.default
    const u = new SpeechSynthesisUtterance(text.replace(/\{NAME\}/g, 'du'))
    u.lang   = 'de-DE'
    u.pitch  = profile.pitch
    u.rate   = profile.rate
    u.volume = profile.volume
    const voice = getGermanVoice()
    if (voice) u.voice = voice
    window.speechSynthesis.speak(u)
  }, [getGermanVoice])

  // ── Sprechen (Pre-generated bevorzugt, Browser-TTS als Fallback) ──────────
  const speak = useCallback((text: string, speaker: string) => {
    if (muted) return
    stop()

    const manifest = manifestRef.current
    if (manifest) {
      const key = manifestKey(text, speaker)
      const path = manifest[key]
      if (path) {
        const audio = new Audio(path)
        audioRef.current = audio
        audio.play().catch(() => speakBrowserTTS(text, speaker))
        return
      }
    }

    speakBrowserTTS(text, speaker)
  }, [muted, stop, speakBrowserTTS])

  const toggleMute = useCallback(() => {
    setMuted(m => {
      if (!m) stop()
      return !m
    })
  }, [stop])

  return { speak, stop, toggleMute, muted, ready }
}
