export interface Agent {
  id: string
  name: string
  status: 'running' | 'idle' | 'processing' | 'error' | 'unknown' | 'completed'
  taskCount?: number
  createdAt?: string
  updatedAt?: string
  completedAt?: string | null
  parentId?: string | null
  isActive?: boolean
  hasNotification?: boolean
  metadata?: Record<string, unknown>
}

export interface LogEntry {
  id: string
  timestamp: string
  type: 'INFO' | 'DEBUG' | 'AGENT' | 'WARN' | 'ERROR'
  message: string
  agentId?: string
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    page?: number
    pageSize?: number
    total?: number
    hasMore?: boolean
  }
}
