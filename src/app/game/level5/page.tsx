'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DialogBox } from '@/components/game/DialogBox'
import { TeachingDialog } from '@/components/game/TeachingDialog'
import { BiasDetector } from '@/components/game/BiasDetector'
import { EthicsDebate } from '@/components/game/EthicsDebate'
import { ChatBot } from '@/components/game/ChatBot'
import {
  introDialogues5,
  teachingDialogues5,
  faceRecogData,
  faceRecogTrainingComposition,
  faceRecogBiasDialogue,
  finalSpeechDialogues,
  quizQuestions5,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  type QuizQuestion5,
} from '@/lib/game/level5Data'
import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { useGameProgress } from '@/hooks/useGameProgress'

type GamePhase = 'intro' | 'explore' | 'teaching' | 'bias' | 'bias2dialog' | 'bias2' | 'ethics' | 'speech' | 'quiz' | 'complete'
type PlayerCharacter = 'leader' | 'social'

// ─── FaceRecog Mini-Game ──────────────────────────────────────────────────────

function FaceRecogGame({ onComplete, playerName }: { onComplete: (xp: number) => void; playerName: string }) {
  const gruppeA = faceRecogData.filter(f => f.gruppe === 'A')
  const gruppeB = faceRecogData.filter(f => f.gruppe === 'B')
  const accA = Math.round((gruppeA.filter(f => f.erkannt).length / gruppeA.length) * 100)
  const accB = Math.round((gruppeB.filter(f => f.erkannt).length / gruppeB.length) * 100)
  const [answered, setAnswered] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const correctAnswer = 'bias'
  const xp = answered === correctAnswer ? 40 : 20

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]">
        <div className="text-center mb-4">
          <span className="font-bangers text-[#9C27B0] text-2xl tracking-wide">GESICHTSERKENNUNG — BIAS-ANALYSE</span>
          <p className="font-comic text-[#666] text-xs mt-1">Transfer: Erkenne Bias in einem neuen Kontext</p>
        </div>

        {/* Training data composition */}
        <div className="border-[2px] border-[#9C27B0] rounded-xl p-3 mb-4 bg-purple-50">
          <p className="font-bangers text-[#9C27B0] text-sm mb-2">TRAININGSDATEN ({faceRecogTrainingComposition.gesamt} Fotos)</p>
          <div className="flex gap-2 mb-1">
            <div className="flex-1 h-5 rounded overflow-hidden border border-[#111] flex">
              <div style={{ width: `${faceRecogTrainingComposition.gruppeA / faceRecogTrainingComposition.gesamt * 100}%` }} className="bg-[#0066FF] flex items-center justify-center">
                <span className="font-comic text-white text-[9px]">A: {faceRecogTrainingComposition.gruppeA}</span>
              </div>
              <div style={{ width: `${faceRecogTrainingComposition.gruppeB / faceRecogTrainingComposition.gesamt * 100}%` }} className="bg-[#FF3B3F] flex items-center justify-center">
                <span className="font-comic text-white text-[9px]">B: {faceRecogTrainingComposition.gruppeB}</span>
              </div>
            </div>
          </div>
          <p className="font-comic text-[#666] text-[10px]">Gruppe A (hell): 90% der Daten · Gruppe B (dunkel): nur 10%</p>
        </div>

        {/* Test results */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="border-[2px] border-[#0066FF] rounded-xl p-3 text-center bg-blue-50">
            <p className="font-bangers text-[#0066FF] text-sm">Gruppe A</p>
            <div className="flex flex-wrap gap-1 justify-center my-2">
              {gruppeA.map(f => (
                <span key={f.id} title={f.name} className="text-lg">{f.emoji}</span>
              ))}
            </div>
            <p className="font-comic text-xs text-[#666]">Erkennungsrate:</p>
            <p className="font-bangers text-[#0066FF] text-3xl">{accA}%</p>
            <div className="h-3 bg-white border border-[#0066FF] rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#0066FF] rounded-full" style={{ width: `${accA}%` }} />
            </div>
            <p className="font-comic text-[10px] mt-1 text-[#00C853]">{gruppeA.filter(f => f.erkannt).length}/{gruppeA.length} erkannt ✓</p>
          </div>
          <div className="border-[2px] border-[#FF3B3F] rounded-xl p-3 text-center bg-red-50">
            <p className="font-bangers text-[#FF3B3F] text-sm">Gruppe B</p>
            <div className="flex flex-wrap gap-1 justify-center my-2">
              {gruppeB.map(f => (
                <span key={f.id} title={f.name} className="text-lg">{f.emoji}</span>
              ))}
            </div>
            <p className="font-comic text-xs text-[#666]">Erkennungsrate:</p>
            <p className="font-bangers text-[#FF3B3F] text-3xl">{accB}%</p>
            <div className="h-3 bg-white border border-[#FF3B3F] rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#FF3B3F] rounded-full" style={{ width: `${accB}%` }} />
            </div>
            <p className="font-comic text-[10px] mt-1 text-[#FF3B3F]">{gruppeB.filter(f => f.erkannt).length}/{gruppeB.length} erkannt ✗</p>
          </div>
        </div>

        {/* Question */}
        {!showResult && (
          <>
            <p className="font-bangers text-[#111] text-base text-center mb-3">
              Warum erkennt die KI Gruppe B so viel schlechter?
            </p>
            <div className="space-y-2">
              {[
                { key: 'bias', label: 'Datenbias: Die KI hat fast keine Trainingsfotos von Gruppe B gesehen — deshalb kann sie Gruppe B-Gesichter nicht gut erkennen.' },
                { key: 'algo', label: 'Der Algorithmus ist für dunkle Gesichter nicht geeignet und müsste komplett neu programmiert werden.' },
                { key: 'gruppe', label: 'Gruppe B hat weniger auffällige Gesichtszüge — das ist biologisch bedingt.' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { setAnswered(opt.key); setShowResult(true) }}
                  className="w-full text-left border-[2px] border-[#111] rounded-xl px-4 py-2.5 font-comic text-sm bg-white hover:bg-[#FFE135] transition-colors shadow-[2px_2px_0_#111]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Result */}
        {showResult && (
          <div className={`border-[3px] rounded-xl p-4 mb-4 ${answered === correctAnswer ? 'border-[#00C853] bg-green-50' : 'border-[#FF3B3F] bg-red-50'}`}>
            <p className="font-bangers text-lg mb-1">
              {answered === correctAnswer ? '✓ Richtig!' : '✗ Nicht ganz…'}
            </p>
            <p className="font-comic text-sm text-[#333]">
              <strong>Datenbias ist die Ursache:</strong> 90% der Trainingsdaten zeigten Gesichter der Gruppe A. Die KI lernte hauptsächlich, Gruppe-A-Gesichter zu erkennen. Für Gruppe B fehlt einfach die Datengrundlage. Das führt zu <strong>Ungleichbehandlung</strong> — und das ist ein ernstes ethisches Problem, z.B. bei Zugangssystemen oder Polizei-Software.
            </p>
            <p className="font-comic text-sm mt-2 text-[#9C27B0]">
              Dieses Muster nennt man <strong>Representation Bias</strong> — eine Gruppe ist in den Daten unterrepräsentiert.
            </p>
            <button
              onClick={() => onComplete(xp)}
              className="mt-3 w-full py-2.5 bg-[#9C27B0] text-white border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111]"
            >
              Weiter (+{xp} XP) →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

function QuizModal5({ onComplete }: { onComplete: (xp: number) => void }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])

  const question: QuizQuestion5 = quizQuestions5[current]
  const isLast = current === quizQuestions5.length - 1

  const confirm = () => {
    if (selected === null) return
    const correct = selected === question.correct
    setConfirmed(true)
    if (correct) setScore(s => s + 25)
    setAnswers(a => [...a, correct])
  }

  const next = () => {
    if (isLast) { onComplete(score); return }
    setSelected(null); setConfirmed(false); setCurrent(c => c + 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-lg overflow-hidden">
        <div className="bg-[#9C27B0] border-b-[4px] border-[#111] p-4 relative overflow-hidden">
          <div className="absolute inset-0 comic-dots opacity-20" />
          <div className="relative flex justify-between items-center">
            <h2 className="font-bangers text-white text-2xl tracking-wider">WISSENS-CHECK</h2>
            <div className="bg-[#111] text-white font-bangers px-3 py-1 rounded-full text-sm">{current + 1} / {quizQuestions5.length}</div>
          </div>
          <div className="mt-2 w-full h-3 bg-white/30 border-[2px] border-[#111] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(current / quizQuestions5.length) * 100}%`, background: 'white' }} />
          </div>
        </div>
        <div className="p-5">
          <p className="font-comic text-[#111] font-bold text-base mb-4 leading-relaxed">{question.question}</p>
          <div className="flex flex-col gap-2">
            {question.options.map((option, i) => {
              let bg = 'white'; const border = '#111'; let textCol = '#111'
              if (confirmed) {
                if (i === question.correct) { bg = '#00C853'; textCol = 'white' }
                else if (i === selected) { bg = '#FF3B3F'; textCol = 'white' }
                else { bg = '#F5F5F5'; textCol = '#AAA' }
              } else if (i === selected) { bg = '#9C27B0'; textCol = 'white' }
              return (
                <button key={i} onClick={() => !confirmed && setSelected(i)} disabled={confirmed}
                  className="text-left px-4 py-3 rounded-xl border-[2.5px] font-comic text-sm shadow-[2px_2px_0_#111] disabled:shadow-none transition-all"
                  style={{ background: bg, borderColor: border, color: textCol }}>
                  <span className="font-bangers mr-2">{['A', 'B', 'C', 'D'][i]})</span>
                  {option}{confirmed && i === question.correct && ' ✓'}{confirmed && i === selected && i !== question.correct && ' ✗'}
                </button>
              )
            })}
          </div>
          {confirmed && (
            <div className="mt-3 p-3 rounded-xl border-[2.5px] border-[#111] font-comic text-sm leading-relaxed shadow-[2px_2px_0_#111]" style={{ background: selected === question.correct ? '#E8F5E9' : '#FFF3E0' }}>
              <span className="font-bold">{selected === question.correct ? '✅ Richtig! ' : '💡 Erklärung: '}</span>{question.explanation}
            </div>
          )}
        </div>
        <div className="px-5 pb-5 flex justify-between items-center">
          <div className="flex gap-1.5">
            {answers.map((correct, i) => <div key={i} className="w-3 h-3 rounded-full border-[1.5px] border-[#111]" style={{ background: correct ? '#00C853' : '#FF3B3F' }} />)}
            {Array.from({ length: quizQuestions5.length - answers.length }).map((_, i) => <div key={i} className="w-3 h-3 rounded-full border-[1.5px] border-[#111] bg-[#EEE]" />)}
          </div>
          {!confirmed ? (
            <button onClick={confirm} disabled={selected === null} className="comic-btn px-5 py-2 rounded-xl font-bangers text-base disabled:opacity-40" style={{ background: '#9C27B0', color: 'white' }}>Antworten!</button>
          ) : (
            <button onClick={next} className="comic-btn px-5 py-2 rounded-xl font-bangers text-base" style={{ background: '#FF3B3F', color: 'white' }}>
              {isLast ? `Fertig! (+${score} XP)` : 'Nächste →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Level 5 Complete ─────────────────────────────────────────────────────────

function Level5Complete({ puzzleXP, quizXP, onReplay }: {
  puzzleXP: number; quizXP: number; onReplay: () => void
}) {
  const total = puzzleXP + quizXP
  const stars = total >= 150 ? 3 : total >= 100 ? 2 : 1

  const concepts = [
    { term: 'Datenbias', desc: 'Voreingenommenheit durch nicht-repräsentative Trainingsdaten', icon: '⚖️', color: '#9C27B0' },
    { term: 'Fairness', desc: 'KI sollte alle Gruppen gleichwertig behandeln', icon: '🤝', color: '#0066FF' },
    { term: 'Transparenz', desc: 'KI-Entscheidungen sollten erklärbar und nachvollziehbar sein', icon: '🔍', color: '#00C853' },
    { term: 'Verantwortung', desc: 'Entwickler, Unternehmen und Nutzer tragen gemeinsam Verantwortung', icon: '🏛️', color: '#FF3B3F' },
    { term: 'Confirmation Bias', desc: 'Wenn Daten bereits existierende Vorurteile bestätigen', icon: '🔄', color: '#FF9800' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-lg max-h-[95vh] overflow-y-auto">
        {/* Special ending header */}
        <div className="relative overflow-hidden p-6 text-center border-b-[4px] border-[#111]" style={{ background: 'linear-gradient(135deg, #9C27B0, #FF3B3F)' }}>
          <div className="absolute inset-0 comic-dots opacity-10" />
          <div className="relative">
            <div className="text-6xl mb-1">🎖️</div>
            <h2 className="font-bangers text-white text-3xl tracking-wider">MISSION ABGESCHLOSSEN!</h2>
            <p className="font-comic text-white/80 text-sm mt-1">Alle 5 Level von Team MKS absolviert!</p>
            <div className="flex justify-center gap-3 mt-2 text-4xl">
              {[1, 2, 3].map(s => <span key={s} style={{ color: s <= stars ? '#FFE135' : 'rgba(255,255,255,0.3)', filter: s <= stars ? 'drop-shadow(0 0 8px #FFE135)' : 'none' }}>★</span>)}
            </div>
            <div className="mt-3 bg-white/20 border-[2px] border-white/40 rounded-xl px-4 py-2">
              <p className="font-bangers text-white text-lg tracking-wide">KI-DETEKTIV — ZERTIFIZIERT</p>
              <p className="font-comic text-white/70 text-xs">Level 1–5 · Team MKS · Klasse 9</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bangers text-[#111] text-lg tracking-wide mb-2">PUNKTE-AUSWERTUNG</h3>
          <div className="space-y-2">
            {[
              { label: '⚖️ Bias-Analyse', val: puzzleXP, color: '#9C27B0' },
              { label: '📝 Wissens-Check', val: quizXP, color: '#FF3B3F' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between items-center border-[2.5px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
                <span className="font-comic text-[#111] text-sm">{label}</span>
                <span className="font-bangers text-lg" style={{ color }}>+{val} XP</span>
              </div>
            ))}
            <div className="flex justify-between items-center border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111]" style={{ background: 'linear-gradient(90deg, #9C27B0, #FF3B3F)' }}>
              <span className="font-bangers text-white text-base">LEVEL 5 GESAMT</span>
              <span className="font-bangers text-white text-2xl">{total} XP</span>
            </div>
          </div>

          <h3 className="font-bangers text-[#111] text-lg tracking-wide mt-4 mb-2">LEVEL 5 BEGRIFFE:</h3>
          <div className="space-y-1.5">
            {concepts.map(c => (
              <div key={c.term} className="flex items-start gap-3 border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg border-[2px] border-[#111] flex-shrink-0 text-lg" style={{ background: c.color }}>{c.icon}</div>
                <div><span className="font-bangers text-sm tracking-wide" style={{ color: c.color }}>{c.term}: </span><span className="font-comic text-[#111] text-xs">{c.desc}</span></div>
              </div>
            ))}
          </div>

          {/* Inspector's final message */}
          <div className="mt-4 bg-[#FFE135] border-[3px] border-[#111] rounded-xl p-4 shadow-[3px_3px_0_#111]">
            <div className="flex items-center gap-3 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/characters/preview/brain.png" alt="Inspector" style={{ width: 40, height: 56, objectFit: 'contain' }} />
              <span className="font-bangers text-[#111] text-base tracking-wide">INSPECTOR NODE</span>
            </div>
            <p className="font-comic text-[#555] text-xs leading-relaxed">
              &quot;Ihr seid jetzt echte KI-Detektive. Erinnert euch: KI ist ein mächtiges Werkzeug — aber ein Werkzeug, das ihr gestaltet.
              Setzt es fair, transparent und zum Wohl aller ein!&quot;
            </p>
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onReplay} className="flex-1 py-3 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] active:shadow-none transition-all" style={{ background: 'white', color: '#111' }}>↩ Nochmal</button>
          <Link href="/game" className="flex-1 py-3 border-[3px] border-[#111] rounded-xl font-bangers text-base tracking-wide shadow-[3px_3px_0_#111] text-center" style={{ background: 'linear-gradient(90deg, #9C27B0, #FF3B3F)', color: 'white' }}>
            Zurück zum Hub
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Level 5 World ─────────────────────────────────────────────────────────────

function Level5World({ completedZones, playerCharacter, onInteract }: {
  completedZones: string[]
  playerCharacter: PlayerCharacter
  onInteract: (zone: 'inspector' | 'bias' | 'ethics') => void
}) {
  return (
    <div className="relative select-none" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}>
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/game/backgrounds/ethics-chamber.svg"
        alt=""
        className="absolute inset-0 pointer-events-none"
        style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, objectFit: 'fill' }}
        draggable={false}
      />

      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div className="border-[3px] border-[#111] rounded-xl px-6 py-2 shadow-[4px_4px_0_#111]" style={{ background: 'linear-gradient(90deg, #9C27B0, #FF3B3F)' }}>
          <p className="font-bangers text-white text-xl tracking-widest">ETHIK-KAMMER — LEVEL 5</p>
        </div>
      </div>

      {/* Inspector */}
      <div className="absolute cursor-pointer" style={{ left: 120, top: 160 }} onClick={() => !completedZones.includes('inspector') && onInteract('inspector')}>
        <div className={`relative flex flex-col items-center transition-all ${completedZones.includes('inspector') ? 'opacity-50' : 'hover:scale-105'}`}>
          <div className="bg-[#FFE135] border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] mb-1 text-center">
            <span className="font-bangers text-[#111] text-xs">INSPECTOR NODE</span>
            <p className="font-comic text-[#555] text-[10px]">KI-Ethik &amp; Bias</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/game/characters/preview/brain.png" alt="Inspector" style={{ width: 60, height: 80, objectFit: 'contain' }} />
          {!completedZones.includes('inspector') && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFE135] border-[2px] border-[#111] rounded-lg px-2 py-0.5 text-[10px] font-bangers whitespace-nowrap shadow-[2px_2px_0_#111] animate-bounce">[E] Ansprechen</div>}
          {completedZones.includes('inspector') && <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>}
        </div>
      </div>

      {/* Bias station */}
      <div className="absolute cursor-pointer" style={{ left: 530, top: 130 }} onClick={() => completedZones.includes('inspector') && !completedZones.includes('bias') && onInteract('bias')}>
        <div className={`flex flex-col items-center transition-all ${completedZones.includes('bias') ? 'opacity-50' : completedZones.includes('inspector') ? 'hover:scale-105' : 'opacity-30 cursor-not-allowed'}`}>
          <div className={`border-[3px] border-[#111] rounded-xl px-4 py-3 shadow-[4px_4px_0_#111] text-center ${completedZones.includes('inspector') ? 'bg-[#9C27B0]' : 'bg-slate-700'}`}>
            <p className="font-bangers text-white text-sm tracking-wide">DATEN-ANALYSE</p>
            <p className="font-comic text-white/80 text-[10px] mt-0.5">Bias im Datensatz erkennen</p>
          </div>
          {!completedZones.includes('inspector') && <p className="font-comic text-slate-400 text-[10px] mt-1">Erst Inspector!</p>}
          {!completedZones.includes('bias') && completedZones.includes('inspector') && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFE135] border-[2px] border-[#111] rounded-lg px-2 py-0.5 text-[10px] font-bangers whitespace-nowrap shadow-[2px_2px_0_#111] animate-bounce">[E] Analysieren</div>}
          {completedZones.includes('bias') && <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>}
        </div>
      </div>

      {/* Ethics station */}
      <div className="absolute cursor-pointer" style={{ left: 530, top: 320 }} onClick={() => completedZones.includes('bias') && !completedZones.includes('ethics') && onInteract('ethics')}>
        <div className={`flex flex-col items-center transition-all ${completedZones.includes('ethics') ? 'opacity-50' : completedZones.includes('bias') ? 'hover:scale-105' : 'opacity-30 cursor-not-allowed'}`}>
          <div className={`border-[3px] border-[#111] rounded-xl px-4 py-3 shadow-[4px_4px_0_#111] text-center ${completedZones.includes('bias') ? 'bg-[#FF3B3F]' : 'bg-slate-700'}`}>
            <p className="font-bangers text-white text-sm tracking-wide">ETHIK-DEBATTE</p>
            <p className="font-comic text-white/80 text-[10px] mt-0.5">4 Aussagen beurteilen</p>
          </div>
          {!completedZones.includes('bias') && <p className="font-comic text-slate-400 text-[10px] mt-1">Erst Daten-Analyse!</p>}
          {!completedZones.includes('ethics') && completedZones.includes('bias') && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFE135] border-[2px] border-[#111] rounded-lg px-2 py-0.5 text-[10px] font-bangers whitespace-nowrap shadow-[2px_2px_0_#111] animate-bounce">[E] Debattieren</div>}
          {completedZones.includes('ethics') && <div className="absolute -top-2 -right-2 bg-[#00C853] border-[2px] border-[#111] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>}
        </div>
      </div>

      <div className="absolute bottom-12 left-6">
        <div className="flex items-center gap-2 bg-white border-[2px] border-[#111] rounded-xl px-3 py-2 shadow-[2px_2px_0_#111]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={playerCharacter === 'leader' ? '/game/characters/preview/leader.png' : '/game/characters/preview/leader_w.png'} alt="Player" style={{ width: 32, height: 48, objectFit: 'contain' }} />
          <div><p className="font-bangers text-[#111] text-xs">DU</p><p className="font-comic text-[#666] text-[10px]">KI-Ethiker</p></div>
        </div>
      </div>

      <div className="absolute bottom-4 inset-x-0 flex justify-center">
        <div className="flex gap-2">
          {[
            { id: 'inspector', label: '🧠 Inspector', done: completedZones.includes('inspector') },
            { id: 'bias', label: '⚖️ Bias', done: completedZones.includes('bias') },
            { id: 'ethics', label: '💬 Ethik', done: completedZones.includes('ethics') },
          ].map(z => (
            <div key={z.id} className="px-2 py-1 rounded-lg border-[2px] border-[#111] font-comic text-xs font-bold shadow-[2px_2px_0_#111]"
              style={{ background: z.done ? '#00C853' : 'white', color: z.done ? 'white' : '#888' }}>
              {z.label} {z.done ? '✓' : '○'}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HUD5({ xp, completedZones }: { xp: number; completedZones: string[] }) {
  return (
    <div className="absolute top-0 inset-x-0 z-20 p-2 flex justify-between items-start pointer-events-none">
      <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111]">
        <p className="font-bangers text-[#9C27B0] text-sm tracking-wider">Level 5 — Das voreingenommene Orakel</p>
        <p className="font-comic text-[#111] text-xs mt-0.5">
          {completedZones.length === 0 && 'Inspector Node befragen'}
          {completedZones.length === 1 && 'Datensatz analysieren'}
          {completedZones.length === 2 && 'Ethik-Debatte führen'}
          {completedZones.length >= 3 && 'Level abgeschlossen!'}
        </p>
      </div>
      <div className="bg-white border-[3px] border-[#111] rounded-xl px-3 py-2 shadow-[3px_3px_0_#111] min-w-[140px]">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bangers text-[#9C27B0] text-sm">⭐ XP</span>
          <span className="font-comic text-[#111] text-xs font-bold">{xp} / 200</span>
        </div>
        <div className="w-full h-3 bg-[#EEE] border-[2px] border-[#111] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((xp / 200) * 100, 100)}%`, background: 'linear-gradient(90deg, #9C27B0, #FF3B3F)' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Level5Page() {
  const [scale, setScale] = useState(1)
  const { saveProgress, loadProgress, saveActivityScore } = useGameProgress()
  const progressLoaded = useRef(false)
  const startTime = useRef<number>(Date.now())

  useEffect(() => {
    const update = () => setScale(Math.min(window.innerWidth / WORLD_WIDTH, window.innerHeight / WORLD_HEIGHT))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const [playerCharacter, setPlayerCharacter] = useState<PlayerCharacter>('leader')
  const [playerName, setPlayerName] = useState('Detektiv')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const char = localStorage.getItem('mks_player_character') as PlayerCharacter | null
      const name = localStorage.getItem('mks_player_name')
      if (char) setPlayerCharacter(char)
      if (name) setPlayerName(name)
    }
  }, [])

  const [phase, setPhase] = useState<GamePhase>('intro')
  const [completedZones, setCompletedZones] = useState<string[]>([])
  const [puzzleXP, setPuzzleXP] = useState(0)
  const [quizXP, setQuizXP] = useState(0)
  const [xp, setXp] = useState(0)

  // Load saved progress on mount
  useEffect(() => {
    if (progressLoaded.current) return
    progressLoaded.current = true
    const load = async () => {
      const saved = await loadProgress(5)
      if (saved && saved.phase && saved.phase !== 'complete') {
        if (saved.xp !== undefined) setXp(saved.xp)
        if (saved.completed_zones) setCompletedZones(saved.completed_zones)
        if (saved.phase !== 'intro') setPhase(saved.phase as GamePhase)
      }
    }
    load()
  }, [loadProgress])

  const handleInteract = useCallback((zone: 'inspector' | 'bias' | 'ethics') => {
    if (zone === 'inspector' && !completedZones.includes('inspector')) {
      setPhase('teaching')
    } else if (zone === 'bias' && completedZones.includes('inspector') && !completedZones.includes('bias')) {
      setPhase('bias')
    } else if (zone === 'ethics' && completedZones.includes('bias') && !completedZones.includes('ethics')) {
      setPhase('ethics')
    }
  }, [completedZones])

  const handleTeachingComplete = () => {
    const newZones = [...completedZones, 'inspector']
    const newXp = xp + 15
    setCompletedZones(newZones)
    setXp(newXp)
    setPhase('explore')
    saveProgress({ level: 5, phase: 'explore', xp: newXp, completed_zones: newZones, player_character: playerCharacter, player_name: playerName })
  }

  const handleBiasComplete = () => {
    const newZones = [...completedZones, 'bias']
    const newXp = xp + 10
    setCompletedZones(newZones)
    setXp(newXp)
    // After bias analysis → second bias example (Gesichtserkennung)
    setPhase('bias2dialog')
    saveProgress({ level: 5, phase: 'bias2dialog', xp: newXp, completed_zones: newZones, player_character: playerCharacter, player_name: playerName })
    saveActivityScore({ level: 5, activity_type: 'teaching', score: 10, max_score: 10 })
  }

  const handleBias2Complete = (bias2XP: number) => {
    const newXp = xp + bias2XP
    setXp(newXp)
    setPhase('explore')
    saveProgress({ level: 5, phase: 'explore', xp: newXp, completed_zones: completedZones, player_character: playerCharacter, player_name: playerName })
    saveActivityScore({ level: 5, activity_type: 'terms_match', score: bias2XP, max_score: 40 })
  }

  const handleEthicsComplete = (score: number) => {
    const newZones = [...completedZones, 'ethics']
    const newXp = xp + score
    setPuzzleXP(score)
    setXp(newXp)
    setCompletedZones(newZones)
    setPhase('speech')
    saveProgress({ level: 5, phase: 'speech', xp: newXp, completed_zones: newZones, player_character: playerCharacter, player_name: playerName })
    saveActivityScore({
      level: 5,
      activity_type: 'puzzle',
      score,
      max_score: 100,
      time_spent_seconds: Math.floor((Date.now() - startTime.current) / 1000),
    })
  }

  const handleSpeechComplete = () => {
    setPhase('quiz')
  }

  const handleQuizComplete = (score: number) => {
    const finalXp = xp + score
    setQuizXP(score)
    setXp(finalXp)
    saveProgress({
      level: 5, phase: 'complete', xp: finalXp,
      completed_zones: completedZones, player_character: playerCharacter,
      player_name: playerName, is_completed: true,
    })
    saveActivityScore({
      level: 5,
      activity_type: 'quiz',
      score,
      max_score: 100,
      time_spent_seconds: Math.floor((Date.now() - startTime.current) / 1000),
    })
    setPhase('complete')
  }

  const handleReplay = () => {
    setPhase('intro'); setCompletedZones([]); setXp(0); setPuzzleXP(0); setQuizXP(0)
    startTime.current = Date.now()
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-start justify-center overflow-hidden">
      {/* Auth button overlay */}
      <div className="absolute top-4 right-4 z-50">
        <AuthButton compact />
      </div>
      <div style={{ width: WORLD_WIDTH * scale, height: WORLD_HEIGHT * scale, position: 'relative', flexShrink: 0 }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', width: WORLD_WIDTH, height: WORLD_HEIGHT }}>
          <div className="relative" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}>
            {phase !== 'complete' && (
              <div className="relative">
                <Level5World completedZones={completedZones} playerCharacter={playerCharacter} onInteract={handleInteract} />
                <div className="absolute inset-0 pointer-events-none"><HUD5 xp={xp} completedZones={completedZones} /></div>
              </div>
            )}
            {phase === 'intro' && (
              <div className="absolute inset-0">
                <DialogBox lines={introDialogues5} onComplete={() => {
                  setPhase('explore')
                  saveProgress({ level: 5, phase: 'explore', xp: 0, player_character: playerCharacter, player_name: playerName })
                }} playerCharacter={playerCharacter} playerName={playerName} />
              </div>
            )}
            {phase === 'teaching' && (
              <div className="absolute inset-0">
                <TeachingDialog lines={teachingDialogues5} onComplete={handleTeachingComplete} playerCharacter={playerCharacter} playerName={playerName} />
              </div>
            )}
            {phase === 'speech' && (
              <div className="absolute inset-0">
                <DialogBox lines={finalSpeechDialogues} onComplete={handleSpeechComplete} playerCharacter={playerCharacter} playerName={playerName} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed top-3 left-3 z-30">
        <Link href="/game" className="bg-white border-[2px] border-[#111] rounded-lg px-3 py-1.5 font-bangers text-[#111] text-sm shadow-[2px_2px_0_#111] hover:bg-[#FFE135] transition-colors">← Hub</Link>
      </div>

      {phase === 'bias' && <BiasDetector onComplete={handleBiasComplete} />}

      {phase === 'bias2dialog' && (
        <div className="absolute inset-0">
          <DialogBox
            lines={faceRecogBiasDialogue}
            onComplete={() => setPhase('bias2')}
            playerCharacter={playerCharacter}
            playerName={playerName}
          />
        </div>
      )}

      {phase === 'bias2' && <FaceRecogGame onComplete={handleBias2Complete} playerName={playerName} />}

      {phase === 'ethics' && <EthicsDebate onComplete={handleEthicsComplete} />}
      {phase === 'quiz' && <QuizModal5 onComplete={handleQuizComplete} />}
      {phase === 'complete' && <Level5Complete puzzleXP={puzzleXP} quizXP={quizXP} onReplay={handleReplay} />}

      <ChatBot />
    </div>
  )
}
