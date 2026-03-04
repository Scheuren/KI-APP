import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface AgentInfo {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  tasks: string[]
  reportFile: string
}

const AGENTS: AgentInfo[] = [
  {
    id: 'content',
    name: 'CONTENT REVIEWER',
    role: 'Informatiklehrer',
    emoji: '📚',
    color: '#FFE135',
    tasks: [
      'Level 1–5 Inhalte auf Korrektheit prüfen',
      '45-Minuten-Pacing sicherstellen',
      'Quiz-Fragen lehrplankonform machen',
      'Dialoge altersgerecht optimieren',
    ],
    reportFile: 'content_report.md',
  },
  {
    id: 'gamelogic',
    name: 'GAME LOGIC DEVELOPER',
    role: 'Senior Web-Developer',
    emoji: '⚙️',
    color: '#0066FF',
    tasks: [
      'Spielablauf & Phase-Übergänge prüfen',
      'Edge Cases & Bugs fixen',
      'UX-Flow optimieren',
      'Level-Unlock-Logik testen',
    ],
    reportFile: 'gamelogic_report.md',
  },
  {
    id: 'minigames',
    name: 'MINI-GAME DESIGNER',
    role: 'Game Designer',
    emoji: '🎮',
    color: '#FF3B3F',
    tasks: [
      'SortingGame (Drag-Drop) erstellen',
      'FillInTheBlank Lückentext erstellen',
      'MatchingPairs Memory-Spiel erstellen',
      'CodeTracer Pseudocode-Spiel erstellen',
    ],
    reportFile: 'minigames_report.md',
  },
  {
    id: 'security',
    name: 'SECURITY AUDITOR',
    role: 'IT-Security & DSGVO Experte',
    emoji: '🔒',
    color: '#00C853',
    tasks: [
      'API-Routes auf Sicherheit prüfen',
      'Auth & Authorization auditieren',
      'DSGVO-Konformität prüfen',
      'Security Headers optimieren',
    ],
    reportFile: 'security_report.md',
  },
]

function getReportContent(filename: string): { exists: boolean; content: string; lines: number } {
  const path = join(process.cwd(), 'AGENT_REPORTS', filename)
  if (!existsSync(path)) return { exists: false, content: '', lines: 0 }
  const content = readFileSync(path, 'utf-8')
  return { exists: true, content, lines: content.split('\n').length }
}

export default function StatusPage() {
  const agentsWithStatus = AGENTS.map((agent) => ({
    ...agent,
    report: getReportContent(agent.reportFile),
  }))

  const completedCount = agentsWithStatus.filter((a) => a.report.exists).length
  const totalProgress = Math.round((completedCount / AGENTS.length) * 100)

  return (
    <main
      className="min-h-screen p-6"
      style={{ background: '#0a0a1a', fontFamily: 'var(--font-comic, sans-serif)' }}
    >
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div
          className="border-[4px] border-[#111] rounded-2xl p-6 mb-6"
          style={{
            background: '#FFE135',
            boxShadow: '6px 6px 0 #111',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-bangers, Impact)',
              fontSize: '2.5rem',
              letterSpacing: '0.1em',
              color: '#111',
            }}
          >
            🕵️ TEAM MKS — AGENT STATUS DASHBOARD
          </h1>
          <p style={{ color: '#333', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Multi-Agent-System | Lern-RPG Entwicklung | Automatische Qualitätsprüfung
          </p>
        </div>

        {/* Overall Progress */}
        <div
          className="border-[3px] border-[#111] rounded-xl p-4 mb-6"
          style={{ background: '#1a1a2e', boxShadow: '4px 4px 0 #111' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              style={{
                fontFamily: 'var(--font-bangers, Impact)',
                color: '#FFE135',
                fontSize: '1.2rem',
                letterSpacing: '0.1em',
              }}
            >
              GESAMT-FORTSCHRITT
            </span>
            <span
              style={{
                fontFamily: 'var(--font-bangers, Impact)',
                color: '#FFE135',
                fontSize: '1.5rem',
              }}
            >
              {completedCount}/{AGENTS.length} Agents abgeschlossen
            </span>
          </div>
          <div
            className="h-6 rounded-full border-[2px] border-[#333] overflow-hidden"
            style={{ background: '#111' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalProgress}%`,
                background: totalProgress === 100 ? '#00C853' : '#FFE135',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span style={{ color: '#666', fontSize: '0.75rem' }}>0%</span>
            <span style={{ color: '#FFE135', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {totalProgress}%
            </span>
            <span style={{ color: '#666', fontSize: '0.75rem' }}>100%</span>
          </div>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {agentsWithStatus.map((agent) => (
            <div
              key={agent.id}
              className="border-[3px] border-[#111] rounded-xl p-5"
              style={{
                background: '#1a1a2e',
                boxShadow: '4px 4px 0 #111',
              }}
            >
              {/* Agent Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl border-[2px] border-[#111] flex items-center justify-center text-2xl"
                  style={{ background: agent.color, boxShadow: '2px 2px 0 #111' }}
                >
                  {agent.emoji}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-bangers, Impact)',
                      color: agent.color,
                      fontSize: '1rem',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {agent.name}
                  </div>
                  <div style={{ color: '#888', fontSize: '0.75rem' }}>{agent.role}</div>
                </div>
                <div className="ml-auto">
                  {agent.report.exists ? (
                    <span
                      className="px-3 py-1 rounded-full text-xs border-[2px] border-[#00C853]"
                      style={{
                        background: '#00C853/20',
                        color: '#00C853',
                        fontFamily: 'var(--font-bangers, Impact)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      ✓ FERTIG
                    </span>
                  ) : (
                    <span
                      className="px-3 py-1 rounded-full text-xs border-[2px] border-[#FFE135] animate-pulse"
                      style={{
                        color: '#FFE135',
                        fontFamily: 'var(--font-bangers, Impact)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      ⟳ LÄUFT
                    </span>
                  )}
                </div>
              </div>

              {/* Tasks */}
              <ul className="space-y-1 mb-4">
                {agent.tasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#aaa' }}>
                    <span style={{ color: agent.color, marginTop: '2px' }}>▸</span>
                    {task}
                  </li>
                ))}
              </ul>

              {/* Report preview */}
              {agent.report.exists && (
                <div
                  className="rounded-lg p-3 border border-[#333]"
                  style={{ background: '#0d0d1a' }}
                >
                  <div
                    className="text-xs mb-1"
                    style={{
                      color: '#00C853',
                      fontFamily: 'var(--font-bangers, Impact)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    REPORT — {agent.report.lines} Zeilen
                  </div>
                  <pre
                    className="text-xs overflow-hidden"
                    style={{ color: '#666', maxHeight: '80px', whiteSpace: 'pre-wrap' }}
                  >
                    {agent.report.content.slice(0, 300)}
                    {agent.report.content.length > 300 && '...'}
                  </pre>
                </div>
              )}

              {!agent.report.exists && (
                <div
                  className="rounded-lg p-3 border border-dashed border-[#333] text-center"
                  style={{ background: '#0d0d1a' }}
                >
                  <span style={{ color: '#555', fontSize: '0.75rem' }}>
                    Warte auf Agent-Report...
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info */}
        <div
          className="border-[2px] border-[#333] rounded-xl p-4 text-center"
          style={{ background: '#111' }}
        >
          <p style={{ color: '#555', fontSize: '0.8rem' }}>
            Seite neu laden um aktuellen Status zu sehen &nbsp;·&nbsp;
            Reports werden in <code style={{ color: '#FFE135' }}>AGENT_REPORTS/</code> gespeichert
            &nbsp;·&nbsp;
            <a href="/game" style={{ color: '#0066FF' }}>
              Zum Spiel →
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
