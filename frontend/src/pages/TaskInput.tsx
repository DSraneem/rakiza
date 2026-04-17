import React, { useState, useRef } from 'react'
import { uploadFile } from '../types/api'

const ROLE_LABELS: Record<string, string> = {
  HR: 'موارد بشرية',
  Sales: 'مبيعات',
  Finance: 'مالية',
  Operations: 'عمليات',
}

const SUGGESTIONS: Record<string, string[]> = {
  HR: [
    'اكتب إيميل ترحيب لموظف جديد',
    'كيف أستخدم AI في فرز السير الذاتية؟',
    'أعدّ تقرير أداء شهري للفريق',
  ],
  Sales: [
    'اكتب عرض مبيعات احترافي',
    'كيف أتابع العملاء المحتملين بذكاء؟',
    'حضّر ردود على اعتراضات العملاء',
  ],
  Finance: [
    'لخّص تقرير مالي شهري',
    'أعدّ ملخصاً للميزانية التشغيلية',
    'كيف أحلل بيانات المصروفات؟',
  ],
  Operations: [
    'أنشئ قائمة مهام يومية للفريق',
    'وثّق إجراء تشغيلي جديد',
    'كيف أتابع مؤشرات الأداء؟',
  ],
}

interface Props {
  role: string
  task: string
  useContext: boolean
  uploadedFile: File | null
  onTaskChange: (t: string) => void
  onContextChange: (v: boolean) => void
  onFileChange: (f: File | null) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

export default function TaskInput({
  role, task, useContext, uploadedFile,
  onTaskChange, onContextChange, onFileChange,
  onSubmit, onBack, loading,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    onFileChange(f)
    setUploading(true)
    try {
      const res = await uploadFile(f)
      setUploadMsg(`✅ تم رفع الملف — ${res.chunks} قطعة نصية مفهرسة`)
      onContextChange(true)
    } catch {
      setUploadMsg('❌ فشل رفع الملف، تحقق من النوع')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-2xl">←</button>
          <div>
            <div className="text-sm text-gray-400">وظيفتك</div>
            <div className="font-bold text-xl text-brand-600">{ROLE_LABELS[role]}</div>
          </div>
        </div>

        {/* Task input */}
        <div className="section-card">
          <label className="block font-bold text-gray-700 mb-3 text-lg">
            ما المهمة التي تريدين مساعدة AI فيها؟
          </label>
          <textarea
            value={task}
            onChange={(e) => onTaskChange(e.target.value)}
            placeholder="مثال: اكتب إيميل ترحيب لموظفة جديدة في قسم التسويق..."
            className="w-full border border-gray-200 rounded-xl p-4 text-base resize-none focus:outline-none focus:border-brand-500 min-h-[120px] leading-relaxed"
            dir="rtl"
          />

          {/* Suggestions */}
          <div className="mt-3">
            <p className="text-sm text-gray-400 mb-2">أو اختاري مثالاً:</p>
            <div className="flex flex-wrap gap-2">
              {(SUGGESTIONS[role] || []).map((s) => (
                <button
                  key={s}
                  onClick={() => onTaskChange(s)}
                  className="text-sm bg-brand-50 text-brand-600 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Document upload */}
        <div className="section-card">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-700">وثائق الشركة (اختياري)</span>
            <span className="text-sm text-gray-400">PDF / DOCX / TXT</span>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            ارفعي سياسات أو تقارير الشركة ليجيب ركيزة منها مباشرة
          </p>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-ghost w-full text-center"
          >
            {uploading ? 'جاري الرفع...' : uploadedFile ? `📄 ${uploadedFile.name}` : '+ رفع وثيقة'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFile} />

          {uploadMsg && (
            <p className="mt-3 text-sm text-center font-medium text-brand-600">{uploadMsg}</p>
          )}

          {uploadedFile && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="useCtx"
                checked={useContext}
                onChange={(e) => onContextChange(e.target.checked)}
                className="accent-brand-500"
              />
              <label htmlFor="useCtx" className="text-sm text-gray-600 cursor-pointer">
                استخدم الوثيقة في الإجابة
              </label>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={!task.trim() || loading}
          className="btn-primary w-full text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⟳</span> نهى تفكر...
            </span>
          ) : (
            'ابدأ التدريب ✨'
          )}
        </button>
      </div>
    </div>
  )
}
