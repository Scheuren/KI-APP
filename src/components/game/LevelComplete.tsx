'use client'

type Props = { xp: number; puzzleXP: number; quizXP: number; onNext: () => void; onReplay: () => void }

export function LevelComplete({ puzzleXP, quizXP, onNext, onReplay }: Props) {
  const total = puzzleXP + quizXP
  const stars = total >= 175 ? 3 : total >= 125 ? 2 : 1

  const concepts = [
    { term: 'Klassifikation', desc: 'Objekte anhand von Merkmalen Kategorien zuordnen', icon: '🏷️', color: '#FF3B3F' },
    { term: 'Wurzel', desc: 'Die erste Frage oben im Entscheidungsbaum', icon: '🌱', color: '#00C853' },
    { term: 'Knoten', desc: 'Eine Frage im Baum — Ja/Nein-Verzweigung', icon: '⭕', color: '#0066FF' },
    { term: 'Kante', desc: 'Der Pfeil zwischen zwei Knoten (Ja oder Nein)', icon: '➡️', color: '#9C27B0' },
    { term: 'Blatt', desc: 'Das Ergebnis am Ende — die Kategorie', icon: '🍃', color: '#FF9800' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-lg max-h-[95vh] overflow-y-auto">

        {/* Hero header */}
        <div className="relative overflow-hidden p-6 text-center border-b-[4px] border-[#111]" style={{ background: '#FFE135' }}>
          <div className="absolute inset-0 comic-dots opacity-20" />
          {/* Action burst behind trophy */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full opacity-30" style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, #FF3B3F 5deg, transparent 10deg, transparent 20deg, #0066FF 25deg, transparent 30deg, transparent 40deg, #00C853 45deg, transparent 50deg, transparent 60deg, #FF9800 65deg, transparent 70deg, transparent 80deg, #9C27B0 85deg, transparent 90deg)'
            }} />
          </div>

          <div className="relative">
            <div className="text-6xl mb-1" style={{ animation: 'bounce 1s infinite' }}>🏆</div>
            <h2 className="font-bangers text-[#111] text-3xl tracking-wider">LEVEL 1 KLAR!</h2>
            <p className="font-comic text-[#555] text-sm mt-1">&quot;Der Fall der verwirrten Daten&quot; — gelöst!</p>

            {/* Stars */}
            <div className="flex justify-center gap-3 mt-2 text-4xl">
              {[1,2,3].map(s => (
                <span key={s} style={{ color: s <= stars ? '#FF9800' : '#DDD', filter: s <= stars ? 'drop-shadow(0 0 6px #FF9800)' : 'none' }}>★</span>
              ))}
            </div>
          </div>
        </div>

        {/* XP breakdown */}
        <div className="p-5">
          <h3 className="font-bangers text-[#111] text-lg tracking-wide mb-2">PUNKTE-AUSWERTUNG</h3>
          <div className="space-y-2">
            {[
              { label: '🔍 Verdächtige klassifiziert', val: puzzleXP, color: '#0066FF' },
              { label: '📝 Wissens-Check', val: quizXP, color: '#9C27B0' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between items-center border-[2.5px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
                <span className="font-comic text-[#111] text-sm">{label}</span>
                <span className="font-bangers text-lg" style={{ color }}>+{val} XP</span>
              </div>
            ))}
            <div className="flex justify-between items-center border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] mt-1" style={{ background: '#FFE135' }}>
              <span className="font-bangers text-[#111] text-base">GESAMT</span>
              <span className="font-bangers text-[#FF3B3F] text-2xl">{total} XP</span>
            </div>
          </div>

          {/* Learned concepts */}
          <h3 className="font-bangers text-[#111] text-lg tracking-wide mt-4 mb-2">DAS HAST DU GELERNT:</h3>
          <div className="space-y-1.5">
            {concepts.map(c => (
              <div key={c.term} className="flex items-start gap-3 border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg border-[2px] border-[#111] flex-shrink-0 text-lg" style={{ background: c.color }}>
                  {c.icon}
                </div>
                <div>
                  <span className="font-bangers text-sm tracking-wide" style={{ color: c.color }}>{c.term}: </span>
                  <span className="font-comic text-[#111] text-xs">{c.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 flex gap-3">
          <button
            onClick={onReplay}
            className="flex-1 py-3 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            style={{ background: 'white', color: '#111' }}
          >
            ↩ Nochmal
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-3 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            style={{ background: '#0066FF', color: 'white' }}
          >
            Level 2 →
          </button>
        </div>
      </div>
    </div>
  )
}
