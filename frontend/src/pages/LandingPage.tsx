import React from 'react'
import {
  BookOpen, Zap, Lock, Users, TrendingUp, DollarSign, Settings,
  ChevronLeft, Star, Brain
} from 'lucide-react'

const features = [
  {
    icon: <BookOpen size={24} color="#085041" />,
    title: 'تعليم مخصص لوظيفتك',
    desc: 'ركيزة يشرح لك كيف تستخدم AI في مهامك اليومية الفعلية — مو محاضرات نظرية',
    bg: '#E1F5EE', textColor: '#085041',
  },
  {
    icon: <Zap size={24} color="#3C3489" />,
    title: 'تنفيذ فوري معك',
    desc: 'بعد التعليم، ركيزة ينجز المهمة كاملة بناءً على بيانات شركتك',
    bg: '#EEEDFE', textColor: '#3C3489',
  },
  {
    icon: <Lock size={24} color="#712B13" />,
    title: 'خصوصية تامة',
    desc: 'مدعوم بنهى من علم — بياناتك تبقى داخل المملكة وتُحذف تلقائياً',
    bg: '#FAECE7', textColor: '#712B13',
  },
]

const roles = [
  { icon: <Users size={22} color="#085041" />,      label: 'موارد بشرية', bg: '#E1F5EE' },
  { icon: <TrendingUp size={22} color="#3C3489" />, label: 'مبيعات',      bg: '#EEEDFE' },
  { icon: <DollarSign size={22} color="#712B13" />, label: 'مالية',       bg: '#FAECE7' },
  { icon: <Settings size={22} color="#444441" />,   label: 'عمليات',      bg: '#F1EFE8' },
]

const steps = [
  { num: '١', text: 'اختاري وظيفتك' },
  { num: '٢', text: 'اكتبي مهمتك' },
  { num: '٣', text: 'تعلّمي مع ركيزة' },
  { num: '٤', text: 'نجّزي المهمة معاً' },
]

const stats = [
  { num: '75%', label: 'موظفين يستخدمون AI بدون تدريب' },
  { num: '62B', label: 'ريال خسائر فجوة المهارات سنوياً' },
  { num: '100%', label: 'عربي — مدعوم بنهى من علم' },
]

interface Props { onStart: () => void }

export default function LandingPage({ onStart }: Props) {
  return (
    <div dir="rtl" style={{ fontFamily: 'Tajawal, Arial, sans-serif', maxWidth: 600, margin: '0 auto', padding: '48px 20px 80px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#0F6E56', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={36} color="#fff" />
          </div>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 700, color: '#0F6E56', margin: '0 0 8px', lineHeight: 1.2 }}>ركيزة</h1>
        <p style={{ fontSize: 22, fontWeight: 500, color: '#3C3489', margin: '0 0 12px' }}>مدرّبك الذكي في العمل</p>
        <p style={{ fontSize: 16, color: '#5F5E5A', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 32px' }}>
          تعلّمي كيف تستخدمين الذكاء الاصطناعي في وظيفتك — ثم نُنجز المهمة معاً بناءً على بيانات شركتك الفعلية
        </p>
        <button onClick={onStart} style={{
          background: '#0F6E56', color: '#fff', fontSize: 18, fontWeight: 700,
          padding: '14px 40px', borderRadius: 14, border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8,
        }}
          onMouseEnter={e => (e.currentTarget.style.background = '#085041')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0F6E56')}
        >
          ابدئي الآن <ChevronLeft size={20} color="#fff" />
        </button>
      </div>

      {/* Roles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 40 }}>
        {roles.map(r => (
          <div key={r.label} style={{ background: r.bg, borderRadius: 14, padding: '16px 8px', textAlign: 'center', border: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{r.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{r.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
        {features.map(f => (
          <div key={f.title} style={{ background: f.bg, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {f.icon}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: f.textColor, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: f.textColor, lineHeight: 1.6, opacity: 0.85 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ background: 'var(--color-background-secondary, #F9F9F7)', borderRadius: 16, padding: '24px 20px', border: '0.5px solid var(--color-border-tertiary)', marginBottom: 40 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center', marginBottom: 20, marginTop: 0 }}>
          كيف يعمل ركيزة؟
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0F6E56', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0, fontFamily: 'inherit' }}>
                {s.num}
              </div>
              <span style={{ fontSize: 15, color: 'var(--color-text-primary)', fontWeight: 500 }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 40 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--color-background-secondary, #F9F9F7)', borderRadius: 12, padding: '16px 12px', textAlign: 'center', border: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <Star size={14} color="#0F6E56" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0F6E56', marginBottom: 4 }}>{s.num}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{s.label}</div>
          </div>
        ))}
      </div>


    </div>
  )
}