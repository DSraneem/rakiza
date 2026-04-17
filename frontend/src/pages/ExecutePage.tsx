import React, { useState, useRef, useEffect } from 'react'
import PointsBar from '../components/PointsBar'
import { sendPromptToNuha } from '../types/api'

interface ExecuteContent {
  summary: string
  output: string
  prompt: string
}

interface GamificationData {
  points_earned: number
  total_points: number
  tasks_done: number
  new_badges: any[]
  level: any
}

interface Props {
  role: string
  task: string
  content: ExecuteContent
  sources: string[]
  gamification?: GamificationData
  sessionId?: string | null
  onNewTask: () => void
  onHistory: () => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="absolute top-3 left-3 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-lg transition-colors"
    >
      {copied ? '✅ تم النسخ' : 'نسخ'}
    </button>
  )
}

// ── Nuha Chat ─────────────────────────────────────────────────
function NuhaChatBox({ initialPrompt, sessionId }: { initialPrompt: string; sessionId?: string | null }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'nuha'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const reply = await sendPromptToNuha(text, sessionId)
      setMessages(prev => [...prev, { role: 'nuha', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'nuha', text: '❌ حدث خطأ في الاتصال' }])
    } finally {
      setLoading(false)
    }
  }

  if (!started) {
    return (
      <div className="mt-4 text-center">
        <button
          onClick={() => { setStarted(true); send(initialPrompt) }}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md"
        >
          <span className="text-xl">🤖</span>
          جرّبي البرومبت مع نهى مباشرة
        </button>
        <p className="text-xs text-gray-400 mt-2">أو اسأليها أي سؤال عن المهمة</p>
      </div>
    )
  }

  return (
    <div className="mt-4 border border-purple-100 rounded-2xl overflow-hidden">
      <div className="bg-purple-600 px-4 py-3 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <span className="text-white font-bold">نهى</span>
        {sessionId && <span className="text-purple-200 text-xs mr-1">📄 مرتبطة بوثيقتك</span>}
        <span className="mr-auto text-purple-200 text-xs">مدعوم بعلم 🇸🇦</span>
      </div>

      <div className="bg-gray-50 p-4 space-y-3 max-h-80 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-white border border-gray-200 text-gray-700'
                : 'bg-purple-600 text-white'
            }`}>
              {m.role === 'nuha' && <div className="text-purple-200 text-xs mb-1">نهى</div>}
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-purple-600 text-white rounded-2xl px-4 py-3 text-sm">
              <span className="animate-pulse">نهى تكتب...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-gray-100 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && send(input)}
          placeholder="اسأل نهى أي سؤال..."
          disabled={loading}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 disabled:opacity-50"
          dir="rtl"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-40"
        >
          إرسال
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function ExecutePage({ role, task, content, sources, gamification, sessionId, onNewTask, onHistory }: Props) {
  const [showPrompt, setShowPrompt] = useState(false)

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 text-sm font-medium px-4 py-2 rounded-full mb-3">
            ✅ المرحلة الثانية — التنفيذ
          </div>
          <h2 className="text-xl font-bold text-gray-800">"{task}"</h2>
        </div>

        {/* Points */}
        {gamification && <PointsBar data={gamification} />}

        {/* Summary */}
        <div className="section-card bg-brand-50 border-brand-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎯</span>
            <span className="font-bold text-brand-600">ما فهمته عنك</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{content.summary}</p>
        </div>

        {/* Output */}
        <div className="section-card border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📄</span>
              <span className="font-bold text-green-700 text-lg">المخرج الجاهز</span>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              جاهز للنسخ
            </span>
          </div>
          <div className="relative bg-gray-50 rounded-xl p-5 border border-gray-100">
            <CopyButton text={content.output} />
            <p className="text-gray-800 leading-loose whitespace-pre-wrap text-sm pt-4">{content.output}</p>
          </div>
        </div>

        {/* Prompt + Nuha Chat */}
        <div className="section-card">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="w-full flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <span className="font-bold text-amber-600">برومبت للتعديل لاحقاً</span>
            </div>
            <span className="text-gray-400 text-sm">{showPrompt ? '▲ إخفاء' : '▼ عرض'}</span>
          </button>

          {showPrompt && (
            <div className="mt-4 relative">
              <div className="copy-block">
                <CopyButton text={content.prompt} />
                {content.prompt}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                انسخيه وعدّليه في أي أداة AI لاحقاً
              </p>
            </div>
          )}

          {/* Nuha Chat — always visible */}
          <NuhaChatBox initialPrompt={content.prompt} sessionId={sessionId} />
        </div>

        {/* Sources */}
        {sources.length > 0 && (
          <div className="section-card border-brand-100">
            <div className="section-title text-brand-500">
              <span>📁</span> مصادر من وثائق الشركة
            </div>
            <div className="space-y-2">
              {sources.map((s, i) => (
                <div key={i} className="bg-brand-50 rounded-lg p-3 text-sm text-gray-600 leading-relaxed">
                  {s.substring(0, 200)}...
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onNewTask} className="btn-primary flex-1">مهمة جديدة ✨</button>
          <button onClick={onHistory} className="btn-ghost px-5">📋 سجلي</button>
        </div>

      </div>
    </div>
  )
}