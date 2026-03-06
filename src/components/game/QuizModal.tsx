'use client'

import { useState } from 'react'
import { quizQuestions } from '@/lib/game/level1Data'

type Props = { onComplete: (xp: number) => void }

function shuffleQOptions<T extends { options: string[]; correct: number }>(q: T): T {
  const pairs = q.options.map((opt, i) => ({ opt, isCorrect: i === q.correct }))
  pairs.sort(() => Math.random() - 0.5)
  return { ...q, options: pairs.map(p => p.opt), correct: pairs.findIndex(p => p.isCorrect) }
}

export function QuizModal({ onComplete }: Props) {
  const [shuffled] = useState(() => [...quizQuestions].sort(() => Math.random() - 0.5).map(shuffleQOptions))
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])

  const question = shuffled[current]
  const isLast = current === shuffled.length - 1

  const confirm = () => {
    if (selected === null) return
    const correct = selected === question.correct
    setConfirmed(true)
    if (correct) setScore(s => s + 25)
    setAnswers(a => [...a, correct])
  }

  const next = () => {
    if (isLast) { onComplete(score + (answers[answers.length - 1] ? 0 : 0)); return }
    setSelected(null); setConfirmed(false); setCurrent(c => c + 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white border-[4px] border-[#111] rounded-2xl shadow-[8px_8px_0_#111] w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-[#FFE135] border-b-[4px] border-[#111] p-4 relative overflow-hidden">
          <div className="absolute inset-0 comic-dots opacity-20" />
          <div className="relative flex justify-between items-center">
            <h2 className="font-bangers text-[#111] text-2xl tracking-wider">📝 WISSENS-CHECK</h2>
            <div className="bg-[#111] text-[#FFE135] font-bangers px-3 py-1 rounded-full text-sm tracking-wide">
              {current + 1} / {shuffled.length}
            </div>
          </div>
          {/* Progress */}
          <div className="mt-2 w-full h-3 bg-white border-[2px] border-[#111] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(current / quizQuestions.length) * 100}%`, background: '#FF3B3F' }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-5">
          <p className="font-comic text-[#111] font-bold text-base mb-4 leading-relaxed">
            {question.question}
          </p>

          <div className="flex flex-col gap-2">
            {question.options.map((option, i) => {
              let bg = 'white'; let border = '#111'; let textCol = '#111'
              if (confirmed) {
                if (i === question.correct) { bg = '#00C853'; textCol = 'white' }
                else if (i === selected) { bg = '#FF3B3F'; textCol = 'white' }
                else { bg = '#F5F5F5'; textCol = '#AAA' }
              } else if (i === selected) { bg = '#0066FF'; textCol = 'white' }

              return (
                <button
                  key={i}
                  onClick={() => !confirmed && setSelected(i)}
                  disabled={confirmed}
                  className="text-left px-4 py-3 rounded-xl border-[2.5px] font-comic text-sm transition-all shadow-[2px_2px_0_#111] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:shadow-none"
                  style={{ background: bg, borderColor: border, color: textCol }}
                >
                  <span className="font-bangers mr-2" style={{ color: textCol === '#AAA' ? '#CCC' : textCol }}>
                    {['A', 'B', 'C', 'D'][i]})
                  </span>
                  {option}
                  {confirmed && i === question.correct && ' ✓'}
                  {confirmed && i === selected && i !== question.correct && ' ✗'}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {confirmed && (
            <div
              className="mt-3 p-3 rounded-xl border-[2.5px] border-[#111] text-sm leading-relaxed font-comic shadow-[2px_2px_0_#111]"
              style={{ background: selected === question.correct ? '#E8F5E9' : '#FFF3E0' }}
            >
              <span className="font-bold text-[#111]">
                {selected === question.correct ? '✅ Richtig! ' : '💡 Erklärung: '}
              </span>
              {question.explanation}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex justify-between items-center">
          <div className="flex gap-1.5">
            {answers.map((correct, i) => (
              <div key={i} className="w-3 h-3 rounded-full border-[1.5px] border-[#111]" style={{ background: correct ? '#00C853' : '#FF3B3F' }} />
            ))}
            {Array.from({ length: quizQuestions.length - answers.length }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full border-[1.5px] border-[#111] bg-[#EEE]" />
            ))}
          </div>

          {!confirmed ? (
            <button
              onClick={confirm}
              disabled={selected === null}
              className="comic-btn px-5 py-2 rounded-xl font-bangers text-base tracking-wide disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
              style={{ background: '#FFE135', color: '#111' }}
            >
              Antworten!
            </button>
          ) : (
            <button
              onClick={next}
              className="comic-btn px-5 py-2 rounded-xl font-bangers text-base tracking-wide"
              style={{ background: '#0066FF', color: 'white' }}
            >
              {isLast ? `Fertig! (+${score + 25} XP)` : 'Nächste →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
