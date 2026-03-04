'use client'

import { useState, useRef, useEffect } from 'react'
import { findAnswer } from '@/lib/game/chatbotData'

type Message = { id: number; role: 'user' | 'bot'; text: string; followUp?: string }

const SUGGESTIONS = ['Was ist Klassifikation?', 'Was ist ein Knoten?', 'Was ist ein Blatt?', 'Wie benutze ich den Baum?']

let msgId = 0

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: ++msgId, role: 'bot', text: '👋 Hallo, Tim! Ich bin Willi — dein Team-Hacker und KI-Experte. Frag mich alles über Entscheidungsbäume!' },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, open])

  const send = (text: string) => {
    if (!text.trim()) return
    const { answer, followUp } = findAnswer(text)
    setMessages(m => [...m,
      { id: ++msgId, role: 'user', text },
      { id: ++msgId, role: 'bot', text: answer, followUp },
    ])
    setInput('')
  }

  return (
    <>
      {/* Floating button — Willi als Avatar */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-40 w-16 h-16 rounded-full border-[3px] border-[#111]
                   overflow-hidden shadow-[3px_3px_0_#111] transition-all active:translate-x-[2px]
                   active:translate-y-[2px] active:shadow-[1px_1px_0_#111]"
        style={{ background: '#FFE135' }}
        title="Willi — Hilfe-Chatbot"
      >
        {open ? (
          <span className="font-bangers text-2xl text-[#111] flex items-center justify-center w-full h-full">✕</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/game/characters/preview/hacker.png" alt="Willi" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-40 w-80 bg-white border-[4px] border-[#111]
                     rounded-2xl shadow-[5px_5px_0_#111] flex flex-col overflow-hidden"
          style={{ height: 420 }}
        >
          {/* Header */}
          <div className="bg-[#FFE135] border-b-[3px] border-[#111] p-3 flex items-center gap-2">
            <div className="w-10 h-14 rounded-lg overflow-hidden border-[2px] border-[#111] flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/characters/preview/hacker.png" alt="Willi" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} />
            </div>
            <div>
              <p className="font-bangers text-[#111] text-base tracking-wide">WILLI — TEAM-HACKER</p>
              <p className="font-comic text-[#555] text-xs">Frag mich alles!</p>
            </div>
            <div className="ml-auto w-8 h-8 comic-dots rounded-full opacity-30" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ background: '#FFF9E6' }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] px-3 py-2 text-xs leading-relaxed border-[2px] border-[#111] rounded-xl"
                  style={{
                    background: msg.role === 'user' ? '#0066FF' : 'white',
                    color: msg.role === 'user' ? 'white' : '#111',
                    boxShadow: '2px 2px 0 #111',
                    fontFamily: 'var(--font-comic)',
                  }}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#FF3B3F">$1</strong>')
                        .replace(/\n/g, '<br/>'),
                    }}
                  />
                  {msg.followUp && <p className="text-[#888] mt-1 text-xs italic">{msg.followUp}</p>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div className="px-2 py-1.5 border-t-[2px] border-[#EEE] flex gap-1 overflow-x-auto" style={{ background: '#FFF9E6' }}>
            {SUGGESTIONS.slice(0, 3).map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="flex-shrink-0 px-2 py-1 text-[10px] border-[2px] border-[#111] rounded-lg font-comic
                           bg-white hover:bg-[#FFE135] transition-colors shadow-[1px_1px_0_#111] whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-2.5 border-t-[3px] border-[#111] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Deine Frage..."
              className="flex-1 text-xs px-3 py-2 rounded-lg border-[2px] border-[#111] font-comic
                         focus:outline-none focus:border-[#FF3B3F] bg-white placeholder-[#AAA]"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="px-3 py-2 rounded-lg border-[2px] border-[#111] font-bangers text-sm
                         shadow-[2px_2px_0_#111] transition-all active:shadow-none active:translate-x-[1px] active:translate-y-[1px]
                         disabled:opacity-40"
              style={{ background: '#FFE135', color: '#111' }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
