export interface Agent {
  id: string
  name: string
  status: 'running' | 'idle' | 'processing' | 'error' | 'unknown' | 'completed'
  task_count?: number
  created_at?: string
  updated_at?: string
  completed_at?: string | null
  parent_id?: string | null
  is_active?: boolean
  has_notification?: boolean
  metadata?: Record<string, unknown>
}

export interface Subtask {
  id: number
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  agent_id?: string
  agent_name?: string
  stage?: string
  start_time?: string
  end_time?: string
  duration_seconds?: number
  task_description?: string
  file_path?: string
  artifacts?: Artifact[]
  metadata?: Record<string, unknown>
}

export interface Artifact {
  id: number
  task_id: string
  file_path: string
  type: string
  file_type?: string
  description?: string
  created_at: string
  created_by?: string
}

export interface Task {
  id: string
  mission_id: string
  source: string
  type: string
  user_message?: string
  message: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  agent_id?: string
  agent_name?: string
  parent_id?: string | null
  created_at: string
  updated_at: string
  completed_at?: string | null
  subtasks?: Subtask[]
  artifacts?: Artifact[]
  metadata?: Record<string, unknown>
}

export interface LogEntry {
  id: string
  timestamp: string
  type: 'INFO' | 'DEBUG' | 'AGENT' | 'WARN' | 'ERROR'
  message: string
  agent_id?: string
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    page?: number
    page_size?: number
    total?: number
    has_more?: boolean
  }
}
