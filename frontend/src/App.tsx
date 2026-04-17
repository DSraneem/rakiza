import React, { useState } from 'react'
import LandingPage   from './pages/LandingPage'
import RoleSelect    from './pages/RoleSelect'
import TaskInput     from './pages/TaskInput'
import TeachPage     from './pages/TeachPage'
import ExecutePage   from './pages/ExecutePage'
import HistoryPage   from './pages/HistoryPage'
import DashboardPage from './pages/DashboardPage'
import { teachRequest, executeRequest } from './types/api'

type Step = 'landing' | 'role' | 'task' | 'teach' | 'execute' | 'history' | 'dashboard'

function getUserId(): string {
  let uid = localStorage.getItem('rakiza_uid')
  if (!uid) { uid = 'u_' + Math.random().toString(36).substring(2,10); localStorage.setItem('rakiza_uid', uid) }
  return uid
}

export default function App() {
  const [step, setStep]           = useState<Step>('landing')
  const [role, setRole]           = useState('')
  const [task, setTask]           = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [useContext, setUseContext] = useState(false)
  const [teachData, setTeachData] = useState<any>(null)
  const [executeData, setExecuteData] = useState<any>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [userId]                  = useState(getUserId)

  const STEP_PCT: Record<Step, string> = {
    role: '20%', task: '40%', teach: '65%', execute: '100%',
    history: '100%', dashboard: '100%',
  }

  const handleTeach = async () => {
    if (!task.trim()) return
    setLoading(true); setError(null)
    try {
      const res = await teachRequest(role, task, sessionId)
      setTeachData(res)
      setStep('teach')
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'حدث خطأ، حاولي مجدداً')
    } finally { setLoading(false) }
  }

  const handleExecute = async (answer: string) => {
    setLoading(true); setError(null)
    try {
      const res = await executeRequest(role, task, answer, sessionId, userId)
      setExecuteData(res)
      setStep('execute')
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'حدث خطأ')
    } finally { setLoading(false) }
  }

  const handleReset = () => {
    setStep('landing'); setRole(''); setTask('')
    setSessionId(null); setUploadedFile(null); setUseContext(false)
    setTeachData(null); setExecuteData(null); setError(null)
  }

  const mainFlow = ['role','task','teach','execute'].includes(step)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur border-b border-gray-100 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={handleReset} className="font-bold text-brand-600 text-lg">ركيزة</button>
          <div className="flex items-center gap-2">
            {/* Phase labels */}
            {step === 'teach' && (
              <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
                📚 مرحلة التعليم
              </span>
            )}
            {step === 'execute' && (
              <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium">
                ✅ مرحلة التنفيذ
              </span>
            )}
            <button onClick={() => setStep('history')}
              className="text-xs text-gray-500 hover:text-brand-600 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors">
              📋 سجلي
            </button>
            <button onClick={() => setStep('dashboard')}
              className="text-xs text-gray-500 hover:text-brand-600 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors">
              📊 المدير
            </button>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">نهى 2.0 · علم</span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      {mainFlow && (
        <div className="fixed top-[53px] w-full h-1 bg-gray-100 z-10">
          <div className="h-full bg-brand-500 transition-all duration-500"
            style={{ width: STEP_PCT[step] }} />
        </div>
      )}

      <div className="pt-16">
        {error && (
          <div className="max-w-2xl mx-auto px-4 pt-4">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">{error}</div>
          </div>
        )}

        {step === 'landing' && (
          <LandingPage onStart={() => setStep('role')} />
        )}

        {step === 'role' && (
          <RoleSelect selected={role} onSelect={setRole} onNext={() => setStep('task')} />
        )}

        {step === 'task' && (
          <TaskInput
            role={role} task={task} useContext={useContext}
            uploadedFile={uploadedFile} sessionId={sessionId}
            onTaskChange={setTask} onContextChange={setUseContext}
            onFileChange={setUploadedFile} onSessionId={setSessionId}
            onSubmit={handleTeach} onBack={() => setStep('role')}
            loading={loading}
          />
        )}

        {step === 'teach' && teachData && (
          <TeachPage
            role={role} task={task}
            content={teachData.content}
            onExecute={handleExecute}
            onBack={() => setStep('task')}
            loading={loading}
          />
        )}

        {step === 'execute' && executeData && (
          <ExecutePage
            role={role} task={task}
            content={executeData.content}
            sources={executeData.sources || []}
            gamification={executeData.gamification}
            onNewTask={handleReset}
            onHistory={() => setStep('history')}
          />
        )}

        {step === 'history' && (
          <HistoryPage userId={userId}
            onBack={() => setStep(executeData ? 'execute' : 'role')} />
        )}

        {step === 'dashboard' && (
          <DashboardPage onBack={() => setStep('role')} />
        )}
      </div>
    </div>
  )
}