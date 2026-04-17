import React from 'react'

interface TeachContent {
  why: string
  steps: string[]
  example: string
  prompt_tip: string
  question: string
}

interface Props {
  role: string
  task: string
  content: TeachContent
  onExecute: (answer: string) => void
  onBack: () => void
  loading: boolean
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

export default function TeachPage({ role, task, content, onExecute, onBack, loading }: Props) {
  const [answer, setAnswer] = React.useState('')

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-sm font-medium px-4 py-2 rounded-full mb-3">
            📚 المرحلة الأولى — التعليم
          </div>
          <h2 className="text-xl font-bold text-gray-800">"{task}"</h2>
        </div>

        {/* 1. Why AI */}
        <Section icon="💡" title="ليش AI يساعدك هنا؟" color="text-blue-600">
          <p className="text-gray-700 leading-relaxed">{content.why}</p>
        </Section>

        {/* 2. Steps */}
        <Section icon="📋" title="كيف تستخدمه خطوة بخطوة" color="text-brand-600">
          <div className="space-y-2">
            {content.steps.map((step, i) => (
              <div key={i} className="step-item">
                <span className="step-num">{i + 1}</span>
                <span className="text-gray-700 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 3. Example */}
        <Section icon="🎯" title="مثال من واقع وظيفتك" color="text-purple-600">
          <p className="text-gray-700 leading-relaxed">{content.example}</p>
        </Section>

        {/* 4. Prompt tip */}
        <Section icon="⚡" title="سر البرومبت الناجح" color="text-amber-600">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content.prompt_tip}</p>
        </Section>

        {/* 5. Execute — question from AI */}
        <div className="section-card border-2 border-brand-200 bg-brand-50">
          <div className="section-title text-brand-600">
            <span className="text-2xl">✨</span>
            أنا جاهز أنجزها معك
          </div>
          <div className="bg-white rounded-xl p-4 mb-4 border border-brand-100">
            <p className="text-gray-700 font-medium leading-relaxed">{content.question}</p>
          </div>

          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="اكتبي إجابتك هنا..."
            className="w-full border border-brand-200 rounded-xl p-4 text-base resize-none focus:outline-none focus:border-brand-500 min-h-[100px] leading-relaxed bg-white"
            dir="rtl"
          />

          <button
            onClick={() => onExecute(answer)}
            disabled={!answer.trim() || loading}
            className="btn-primary w-full mt-3 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⟳</span> نهى تنجز المهمة...
              </span>
            ) : 'نجّز المهمة معي 🚀'}
          </button>
        </div>

        <button onClick={onBack} className="w-full text-center text-gray-400 hover:text-gray-600 text-sm mt-4">
          ← تغيير المهمة
        </button>
      </div>
    </div>
  )
}
