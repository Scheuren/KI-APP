'use client'

import { useState } from 'react'

const YOUTUBE_VIDEO_ID = '-YW5s_an4z8'

type Props = { onComplete: () => void }

export function VideoModal({ onComplete }: Props) {
  const [watched, setWatched] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#0066FF] border-b-[4px] border-[#111] p-4 flex items-center gap-3 relative overflow-hidden">
          <div className="absolute inset-0 comic-dots opacity-10" />
          <div className="relative w-12 h-12 bg-white border-[3px] border-[#111] rounded-xl flex items-center justify-center text-3xl shadow-[2px_2px_0_#111] flex-shrink-0">📺</div>
          <div className="relative">
            <h2 className="font-bangers text-white text-xl tracking-wider">LERNVIDEO: ENTSCHEIDUNGSBÄUME</h2>
            <p className="font-comic text-blue-200 text-xs">Schau das Video, dann kannst du die Aufgabe lösen</p>
          </div>
        </div>

        {/* Video */}
        <div className="p-4">
          <div className="relative w-full aspect-video bg-[#111] rounded-xl overflow-hidden border-[3px] border-[#111] shadow-[3px_3px_0_#111]">
            <iframe
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
              title="Entscheidungsbaum erklärt"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="font-comic text-[#AAA] text-xs mt-2 text-center">
            💡 Lehrer: Video-ID in <code className="bg-[#F5F5F5] px-1 rounded border border-[#DDD]">VideoModal.tsx</code> anpassen
          </p>
        </div>

        {/* Key terms to watch for */}
        <div className="mx-4 mb-4 border-[3px] border-[#111] rounded-xl overflow-hidden shadow-[3px_3px_0_#111]">
          <div className="bg-[#FFE135] border-b-[2px] border-[#111] px-3 py-1.5">
            <p className="font-bangers text-[#111] text-sm tracking-wide">ACHTE IM VIDEO AUF:</p>
          </div>
          <div className="grid grid-cols-2 gap-0">
            {[
              ['🌱', 'Wurzel', 'Die erste Frage oben', '#FF3B3F'],
              ['⭕', 'Knoten', 'Weitere Fragen', '#0066FF'],
              ['➡️', 'Kante', 'Ja / Nein Pfade', '#00C853'],
              ['🍃', 'Blatt', 'Das Ergebnis unten', '#9C27B0'],
            ].map(([icon, term, desc, color], i) => (
              <div key={term} className={`flex items-center gap-2 px-3 py-2 font-comic text-xs border-[#111] ${i % 2 === 0 ? 'border-r-[1px]' : ''} ${i < 2 ? 'border-b-[1px]' : ''}`}>
                <span className="text-lg">{icon}</span>
                <div>
                  <span className="font-bangers text-sm" style={{ color: color as string }}>{term}: </span>
                  <span className="text-[#555]">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="p-4 pt-0 flex gap-3 items-center">
          <label className="flex items-center gap-2 cursor-pointer font-comic text-sm text-[#111] flex-1">
            <input
              type="checkbox"
              checked={watched}
              onChange={e => setWatched(e.target.checked)}
              className="w-5 h-5 rounded border-[2px] border-[#111] accent-[#FFE135]"
            />
            Ich habe das Video angeschaut ✓
          </label>
          <button
            onClick={onComplete}
            disabled={!watched}
            className="comic-btn px-5 py-2.5 rounded-xl font-bangers text-base tracking-wide disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
            style={{ background: watched ? '#FFE135' : '#EEE', color: '#111' }}
          >
            Weiter zur Aufgabe →
          </button>
        </div>
      </div>
    </div>
  )
}
