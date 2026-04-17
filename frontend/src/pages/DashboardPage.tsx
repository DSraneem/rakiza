import React, { useEffect, useState } from 'react'
import axios from 'axios'

const ROLE_LABELS: Record<string, string> = {
  HR: 'موارد بشرية', Sales: 'مبيعات',
  Finance: 'مالية', Operations: 'عمليات',
}
const ROLE_ICONS: Record<string, string> = {
  HR: '👥', Sales: '📈', Finance: '💰', Operations: '⚙️',
}
const ROLE_COLORS: Record<string, string> = {
  HR: 'bg-teal-500', Sales: 'bg-purple-500',
  Finance: 'bg-amber-500', Operations: 'bg-coral-500',
}

interface Props { onBack: () => void }

export default function DashboardPage({ onBack }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-lg animate-pulse">جاري تحميل البيانات...</div>
    </div>
  )

  const { summary, role_distribution, leaderboard, recent_activity } = data

  const maxRole = Math.max(...Object.values(role_distribution) as number[], 1)

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">

        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6">
          ← رجوع
        </button>

        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-gray-800 mb-1">لوحة تحكم المدير</div>
          <div className="text-gray-400">تقرير تقدم الفريق</div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'إجمالي الموظفين', value: summary.total_users, icon: '👥', color: 'text-brand-600' },
            { label: 'موظف نشط', value: summary.active_users, icon: '✅', color: 'text-green-600' },
            { label: 'مهام مكتملة', value: summary.total_tasks, icon: '📋', color: 'text-purple-600' },
            { label: 'متوسط مهام/موظف', value: summary.avg_tasks_user, icon: '📊', color: 'text-amber-600' },
          ].map(kpi => (
            <div key={kpi.label} className="section-card text-center">
              <div className="text-3xl mb-1">{kpi.icon}</div>
              <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-gray-400 text-sm mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Role distribution */}
        <div className="section-card mb-6">
          <div className="font-bold text-gray-700 mb-4">توزيع احتياجات التدريب</div>
          <div className="space-y-3">
            {Object.entries(role_distribution).map(([role, count]: [string, any]) => (
              <div key={role}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span>{ROLE_ICONS[role]}</span>
                    <span className="font-medium text-gray-700">{ROLE_LABELS[role]}</span>
                  </span>
                  <span className="text-gray-400 font-bold">{count} مهمة</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${ROLE_COLORS[role] || 'bg-brand-500'} rounded-full transition-all duration-700`}
                    style={{ width: `${(count / maxRole) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {data.top_needed_role && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-center">
              ⚠️ الاحتياج الأكبر للتدريب:
              <span className="font-bold text-amber-800 mr-1">
                {ROLE_LABELS[data.top_needed_role]}
              </span>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="section-card mb-6">
            <div className="font-bold text-gray-700 mb-4">🏆 لوحة المتصدرين</div>
            <div className="space-y-2">
              {leaderboard.map((u: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                    ${i === 0 ? 'bg-amber-400 text-white' :
                      i === 1 ? 'bg-gray-300 text-gray-700' :
                      i === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-700 text-sm">{u.user_id}</div>
                    <div className="text-xs text-gray-400">{u.level} · {u.tasks} مهمة</div>
                  </div>
                  <div className="font-bold text-brand-600">{u.points} نقطة</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent activity */}
        {recent_activity.length > 0 && (
          <div className="section-card">
            <div className="font-bold text-gray-700 mb-4">📅 النشاط الأخير</div>
            <div className="space-y-3">
              {recent_activity.map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                  <span className="text-xl">{ROLE_ICONS[a.role] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700 truncate">{a.task}</div>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                        {ROLE_LABELS[a.role]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(a.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.total_users === 0 && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-5xl mb-4">📊</div>
            <div>لا يوجد بيانات بعد</div>
            <div className="text-sm mt-1">ستظهر البيانات بعد أول استخدام</div>
          </div>
        )}

      </div>
    </div>
  )
}
