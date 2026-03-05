'use client'

type Props = {
  levelName: string
  objective: string
  xp: number
  maxXP: number
  completedZones: string[]
}

const ZONES = ['monitor', 'inspector', 'caseboard']
const ZONE_LABELS: Record<string, string> = {
  monitor: '📺 Video',
  inspector: '🕵️ Inspector',
  caseboard: '🔍 Fall-Board',
}

export function HUD({ levelName, objective, xp, maxXP, completedZones }: Props) {
  const progress = Math.min((xp / maxXP) * 100, 100)

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 pointer-events-none p-2 flex justify-between items-start gap-2">
        {/* Level info panel */}
        <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111]">
          <p className="font-bangers text-[#FF3B3F] text-sm tracking-wider leading-tight">{levelName}</p>
          <p className="font-comic text-[#111] text-xs mt-0.5">{objective}</p>
        </div>

        {/* XP panel */}
        <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] min-w-[150px]">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bangers text-[#FF3B3F] text-sm tracking-wide">⭐ XP</span>
            <span className="font-comic text-[#111] text-xs font-bold">{xp} / {maxXP}</span>
          </div>
          {/* Comic-style progress bar */}
          <div className="w-full h-3 bg-[#EEE] border-[2px] border-[#111] rounded-full overflow-hidden" role="presentation">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #FFE135, #FF9800)' }}
              role="progressbar"
              aria-valuenow={xp}
              aria-valuemin={0}
              aria-valuemax={maxXP}
              aria-label={`${xp} von ${maxXP} XP gesammelt`}
            />
          </div>
        </div>
      </div>

      {/* Mission progress — center top */}
      <div className="absolute top-2 inset-x-0 z-20 pointer-events-none flex justify-center">
        <div className="flex gap-2 mt-14">
          {ZONES.map((zone) => (
            <div
              key={zone}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border-[2px] border-[#111] font-comic text-xs font-bold shadow-[2px_2px_0_#111]"
              style={{
                background: completedZones.includes(zone) ? '#00C853' : 'white',
                color: completedZones.includes(zone) ? 'white' : '#888',
              }}
            >
              <div className={`w-2 h-2 rounded-full border-[1.5px] border-[#111] ${completedZones.includes(zone) ? 'bg-white' : 'bg-[#DDD]'}`} />
              {ZONE_LABELS[zone]}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom controls hint */}
      <div className="absolute bottom-0 inset-x-0 z-20 pointer-events-none flex justify-center pb-1.5">
        <div className="bg-[#111] text-[#FFE135] font-bangers tracking-wider px-4 py-1 rounded-full text-xs">
          WASD / ↑↓←→ &nbsp;·&nbsp; [E] Interagieren
        </div>
      </div>
    </>
  )
}
