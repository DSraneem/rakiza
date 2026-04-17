import React, { useState } from 'react'
import type { CoachResponse } from '../types'
import { sendPromptToNuha } from '../types/api'

interface Props {
  response: CoachResponse
  task: string
  onReset: () => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="absolute top-3 left-3 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-lg transition-colors"
    >
      {copied ? '✅ تم النسخ' : 'نسخ'}
    </button>
  )
}

function Section({ icon, title, color, children }: {
  icon: string; title: string; color: string; children: React.ReactNode
}) {
  return (
    <div className="section-card">
      <div className={`section-title ${color}`}>
        <span className="text-2xl">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  )
}

// ── Nuha Chat Box ─────────────────────────────────────────────
function NuhaChatBox({ initialPrompt }: { initialPrompt: string }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'nuha'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg = { role: 'user' as const, text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const reply = await sendPromptToNuha(text)
      setMessages(prev => [...prev, { role: 'nuha', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'nuha', text: '❌ حدث خطأ في الاتصال بنهى' }])
    } finally {
      setLoading(false)
    }
  }

  const startWithPrompt = async () => {
    setStarted(true)
    await sendMessage(initialPrompt)
  }

  if (!started) {
    return (
      <div className="mt-4 text-center">
        <button
          onClick={startWithPrompt}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-md"
        >
          <span className="text-xl">🤖</span>
          جرّبيه مع نهى مباشرة
        </button>
        <p className="text-xs text-gray-400 mt-2">سيُرسَل البرومبت لنهى وترد عليك هنا</p>
      </div>
    )
  }

  return (
    <div className="mt-4 border border-purple-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 px-4 py-3 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <span className="text-white font-bold">نهى — مساعدتك الذكية</span>
        <span className="mr-auto text-purple-200 text-xs">مدعوم بعلم</span>
      </div>

      {/* Messages */}
      <div className="bg-gray-50 p-4 space-y-3 max-h-96 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-white border border-gray-200 text-gray-700'
                : 'bg-purple-600 text-white'
            }`}>
              {m.role === 'nuha' && (
                <div className="text-purple-200 text-xs mb-1 font-medium">نهى</div>
              )}
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
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && sendMessage(input)}
          placeholder="اسأل نهى أي سؤال..."
          disabled={loading}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 disabled:opacity-50"
          dir="rtl"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-40"
        >
          إرسال
        </button>
      </div>
    </div>
  )
}

// ── Main Result Page ──────────────────────────────────────────
export default function ResultPage({ response, task, onReset }: Props) {
  const { answer, sources, role_ar } = response

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
            {role_ar} · مدعوم بنهى من علم
          </div>
          <h2 className="text-2xl font-bold text-gray-800">"{task}"</h2>
        </div>

        {/* 1. شرح مبسط */}
        <Section icon="💡" title="شرح مبسط" color="text-blue-600">
          <p className="text-gray-700 leading-relaxed text-base">{answer.explanation}</p>
        </Section>

        {/* 2. خطوات التنفيذ */}
        <Section icon="📋" title="خطوات التنفيذ" color="text-brand-600">
          <div className="space-y-2">
            {answer.steps.map((step, i) => (
              <div key={i} className="step-item">
                <span className="step-num">{i + 1}</span>
                <span className="text-gray-700 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 3. مثال عملي */}
        <Section icon="🎯" title="مثال عملي" color="text-purple-600">
          <p className="text-gray-700 leading-relaxed text-base">{answer.example}</p>
        </Section>

        {/* 4. برومبت جاهز + زر نهى */}
        <Section icon="⚡" title="برومبت جاهز للنسخ" color="text-amber-600">
          <div className="copy-block relative">
            <CopyButton text={answer.prompt} />
            {answer.prompt}
          </div>
          {/* ── زر جرّبيه مع نهى ── */}
          <NuhaChatBox initialPrompt={answer.prompt} />
        </Section>

        {/* 5. مخرج جاهز */}
        <Section icon="✅" title="المخرج الجاهز للاستخدام" color="text-green-600">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative">
            <CopyButton text={answer.output} />
            <p className="text-gray-800 leading-loose whitespace-pre-wrap text-sm">{answer.output}</p>
          </div>
        </Section>

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
          <button onClick={onReset} className="btn-primary flex-1">
            مهمة جديدة ✨
          </button>
        </div>

      </div>
    </div>
  )
}