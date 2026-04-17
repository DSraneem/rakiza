import React, { useEffect, useState } from 'react'

interface Level {
  name: string
  icon: string
  next: number | null
  current: number
}

interface Badge {
  id: string
  name: string
  icon: string
  desc: string
}

interface GamificationData {
  points_earned: number
  total_points: number
  tasks_done: number
  new_badges: Badge[]
  level: Level
}

interface Props {
  data: GamificationData
}

export default function PointsBar({ data }: Props) {
  const [show, setShow] = useState(false)
  const [showBadge, setShowBadge] = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 300)
    if (data.new_badges.length > 0) {
      setTimeout(() => setShowBadge(true), 800)
    }
  }, [])

  const pct = data.level.next
    ? Math.min((data.level.current / data.level.next) * 100, 100)
    : 100

  return (
    <div className={`transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

      {/* Badge popup */}
      {showBadge && data.new_badges.map(badge => (
        <div key={badge.id}
          className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4 text-center animate-bounce">
          <div className="text-4xl mb-1">{badge.icon}</div>
          <div className="font-bold text-amber-800">شارة جديدة!</div>
          <div className="text-amber-700 font-bold text-lg">{badge.name}</div>
          <div className="text-amber-600 text-sm">{badge.desc}</div>
        </div>
      ))}

      {/* Points card */}
      <div className="bg-gradient-to-l from-brand-50 to-purple-50 border border-brand-100 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{data.level.icon}</span>
            <div>
              <div className="font-bold text-gray-800">{data.level.name}</div>
              <div className="text-xs text-gray-400">{data.tasks_done} مهمة مكتملة</div>
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-brand-600">+{data.points_earned}</div>
            <div className="text-xs text-gray-400">نقطة</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{data.total_points} نقطة</span>
            {data.level.next && <span>الهدف: {data.level.next}</span>}
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {data.level.next && (
          <div className="text-xs text-center text-gray-400 mt-1">
            {data.level.next - data.total_points} نقطة للمستوى التالي
          </div>
        )}
      </div>
    </div>
  )
}
