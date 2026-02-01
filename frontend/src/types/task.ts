// Task types
export type TaskStatus = 'criada' | 'iniciada' | 'pendente' | 'concluida' | 'falha'

export interface Task {
  id: string
  description: string
  status: TaskStatus
  agentId: string
  createdAt: ISO8601Timestamp
  startedAt?: ISO8601Timestamp
  pendingAt?: ISO8601Timestamp
  completedAt?: ISO8601Timestamp
  output?: TaskOutput
  error?: TaskError
  metadata?: TaskMetadata
}

export interface TaskOutput {
  result: string
  data?: Record<string, unknown>
  format?: string
}

export interface TaskError {
  code: string
  message: string
  stackTrace?: string
  recoverable: boolean
}

export interface TaskMetadata {
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
  estimatedDuration?: number
  [key: string]: unknown
}

export type ISO8601Timestamp = string
