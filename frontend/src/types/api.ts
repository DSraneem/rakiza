import axios from 'axios'

const BASE = '/api'

export async function uploadFile(file: File): Promise<any> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await axios.post(`${BASE}/upload`, form)
  return data
}

export async function teachRequest(
  role: string,
  task: string,
  sessionId?: string | null,
): Promise<any> {
  const { data } = await axios.post(`${BASE}/teach`, {
    role, task,
    session_id: sessionId || null,
  })
  return data
}

export async function executeRequest(
  role: string,
  task: string,
  userAnswer: string,
  sessionId?: string | null,
  userId?: string | null,
): Promise<any> {
  const { data } = await axios.post(`${BASE}/execute`, {
    role, task,
    user_answer: userAnswer,
    session_id: sessionId || null,
    user_id: userId || null,
  })
  return data
}

export async function sendPromptToNuha(
  prompt: string,
  sessionId?: string | null,
): Promise<string> {
  const { data } = await axios.post(`${BASE}/nuha`, {
    prompt,
    session_id: sessionId || null,
  })
  return data.response
}

export async function deleteSession(sessionId: string): Promise<void> {
  await axios.delete(`${BASE}/session/${sessionId}`)
}