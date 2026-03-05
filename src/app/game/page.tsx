import Link from 'next/link'
import Image from 'next/image'
import { GameHubClient } from './GameHubClient'

export default function GameHubPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-[family-name:var(--font-comic)]">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: '420px' }}>
        {/* Hintergrundbild */}
        <Image
          src="/game/backgrounds/detective-office.png"
          alt="Detektiv-Büro"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
          priority
          unoptimized
        />
        {/* Dunkler Gradient-Overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 50%, rgba(2,6,23,0.95) 100%)'
        }} />

        {/* Auth button top right */}
        <div className="absolute top-4 right-4 z-20">
          <GameHubClient showAuthOnly />
        </div>

        {/* Hero-Inhalt */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-block bg-[#FFE135] border-[4px] border-[#111] rounded-2xl px-10 py-4
                          shadow-[8px_8px_0_rgba(0,0,0,0.6)] mb-5">
            <div className="text-5xl mb-1">🕵️</div>
            <h1 className="font-[family-name:var(--font-bangers)] text-5xl text-[#111] tracking-widest leading-none">
              TEAM MKS
            </h1>
            <p className="font-[family-name:var(--font-comic)] text-[#555] text-xs mt-1 tracking-wide">
              DETEKTIV-AGENTUR
            </p>
          </div>

          <div className="bg-[#111]/80 backdrop-blur-sm border border-[#FFE135]/40 text-[#FFE135]
                          font-[family-name:var(--font-bangers)] px-6 py-2 rounded-full text-sm
                          tracking-widest mb-6 shadow-lg">
            INFORMATIK · KLASSENSTUFE 9 · THEMA KI
          </div>

          <Link
            href="/game/level1"
            className="bg-[#FF3B3F] hover:bg-[#e02f33] text-white font-[family-name:var(--font-bangers)]
                       text-xl tracking-widest px-10 py-3 rounded-2xl border-[3px] border-[#111]
                       shadow-[5px_5px_0_#111] hover:shadow-[2px_2px_0_#111]
                       hover:translate-x-[3px] hover:translate-y-[3px] transition-all
                       focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFE135] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            MISSION STARTEN →
          </Link>
        </div>
      </div>

      {/* ── TEAM ─────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 px-4 py-8 border-y border-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-2xl tracking-widest
                         text-center mb-1">DEIN TEAM</h2>
          <p className="text-slate-300 text-xs text-center mb-5 font-[family-name:var(--font-comic)]">
            Wähle deinen Detektiv — gemeinsam löst ihr den Fall
          </p>

          {/* Team-Bild ohne Text */}
          <div className="group relative w-full rounded-2xl overflow-hidden border-[3px] border-[#333]
                          shadow-[0_4px_24px_rgba(0,0,0,0.5)]" style={{ aspectRatio: '1408/610' }}>
            <Image
              src="/game/characters/team-preview.png"
              alt="Team MKS"
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 group-hover:scale-[1.02]"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            {/* Namens-Labels über die 4 Panels */}
            <div className="absolute bottom-0 inset-x-0 grid grid-cols-4">
              {[
                { name: '✏️ DEIN NAME', role: 'Spielbar · wählbar', badge: null, color: '#0066FF' },
                { name: 'INSPEKTOR', role: 'Dein Mentor', badge: '🔍 Inspector Node', color: '#FFE135', textColor: '#111' },
                { name: 'W.I.L.L.I.', role: 'KI-Assistent', badge: '💬 Chatbot-Hilfe', color: '#00C853' },
                { name: '✏️ DEIN NAME', role: 'Spielbar · wählbar', badge: null, color: '#FF3B9A' },
              ].map((c) => (
                <div key={c.name}
                  className="flex flex-col items-center py-2 px-1"
                  style={{ background: `${c.color}DD` }}
                >
                  <span className="font-[family-name:var(--font-bangers)] text-base tracking-widest leading-none"
                    style={{ color: c.textColor ?? 'white' }}>
                    {c.name}
                  </span>
                  <span className="font-[family-name:var(--font-comic)] text-[10px] leading-tight"
                    style={{ color: c.textColor ? '#333' : 'rgba(255,255,255,0.85)' }}>
                    {c.role}
                  </span>
                  {c.badge && (
                    <span className="font-[family-name:var(--font-comic)] text-[9px] leading-tight mt-0.5 opacity-90"
                      style={{ color: c.textColor ? '#444' : 'rgba(255,255,255,0.75)' }}>
                      {c.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MISSIONEN (with dynamic unlock) ─────────────────────────── */}
      <GameHubClient />

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <div className="border-t border-slate-800 px-4 py-6 text-center">
        <p className="font-[family-name:var(--font-bangers)] text-slate-300 text-base tracking-wide">
          Maximilian Kolbe Schule
        </p>
        <p className="font-[family-name:var(--font-comic)] text-slate-500 text-xs mt-0.5">
          Erstellt von Martin Scheuren
        </p>
        <p className="font-[family-name:var(--font-comic)] text-slate-700 text-[10px] mt-3 leading-relaxed max-w-sm mx-auto">
          ⚠️ Dieses Lernspiel wurde mit Unterstützung von KI erstellt.<br />
          Inhalte wurden vom Lehrer geprüft und freigegeben.
        </p>
      </div>

    </div>
  )
}
