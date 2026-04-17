import React from 'react'

const roles = [
  { id: 'HR',         label: 'موارد بشرية',  icon: '👥', desc: 'توظيف، تقييم، سياسات عمل' },
  { id: 'Sales',      label: 'مبيعات',        icon: '📈', desc: 'عروض، تفاوض، متابعة عملاء' },
  { id: 'Finance',    label: 'مالية',         icon: '💰', desc: 'تقارير، تحليل بيانات، ميزانيات' },
  { id: 'Operations', label: 'عمليات',        icon: '⚙️', desc: 'إجراءات، متابعة، تحسين كفاءة' },
]

interface Props {
  selected: string
  onSelect: (r: string) => void
  onNext: () => void
}

export default function RoleSelect({ selected, onSelect, onNext }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
          مدعوم بنموذج نهى من علم 🇸🇦
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-3">ركيزة</h1>
        <p className="text-xl text-gray-500 max-w-md mx-auto leading-relaxed">
          مدرّبك الذكي لتعلم الذكاء الاصطناعي من داخل عملك
        </p>
      </div>

      {/* Role Grid */}
      <div className="w-full max-w-2xl">
        <p className="text-center text-gray-600 font-medium mb-6 text-lg">اختاري وظيفتك</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={`p-6 rounded-2xl border-2 text-right transition-all duration-200 hover:shadow-md ${
                selected === r.id
                  ? 'border-brand-500 bg-brand-50 shadow-md'
                  : 'border-gray-100 bg-white hover:border-brand-200'
              }`}
            >
              <div className="text-4xl mb-3">{r.icon}</div>
              <div className="font-bold text-gray-900 text-lg mb-1">{r.label}</div>
              <div className="text-gray-400 text-sm">{r.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!selected}
          className="btn-primary w-full text-lg"
        >
          التالي ←
        </button>
      </div>
    </div>
  )
}
