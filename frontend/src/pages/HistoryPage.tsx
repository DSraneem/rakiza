import React from 'react'
interface Props { userId: string; onBack: () => void }
export default function HistoryPage({ onBack }: Props) {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-gray-400 mb-6 block">← رجوع</button>
        <div className="text-center text-gray-400 py-20">
          <div className="text-5xl mb-4">📋</div>
          <div className="text-lg font-medium">سجل المهام</div>
          <div className="text-sm mt-2">سيظهر هنا سجل مهامك</div>
        </div>
      </div>
    </div>
  )
}
