export interface CoachAnswer {
  explanation: string
  steps: string[]
  example: string
  prompt: string
  output: string
}

export interface CoachResponse {
  answer: CoachAnswer
  raw: string
  sources: string[]
  role: string
  role_ar: string
}

export interface AppState {
  role: string
  task: string
  useContext: boolean
  uploadedFile: File | null
  response: CoachResponse | null
  loading: boolean
  error: string | null
  step: 'role' | 'task' | 'result'
}
