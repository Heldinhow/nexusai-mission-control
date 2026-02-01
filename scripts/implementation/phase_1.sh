#!/bin/bash
# Phase 1: Foundation & Data Layer
# Duration: 1-2 days
# Priority: Critical

set -e

WORKSPACE="/root/.openclaw/workspace/projects/agent-orchestrator-monitor"
FRONTEND_DIR="$WORKSPACE/frontend"
SCRIPT_DIR="$WORKSPACE/scripts/implementation"
STATE_FILE="$WORKSPACE/.cron/implementation_state.json"

# Source common functions
source "$SCRIPT_DIR/scheduler.sh" init

log "========================================="
log "PHASE 1: Foundation & Data Layer"
log "========================================="

# Mark phase as in progress
update_phase_status 1 "in_progress"

cd "$FRONTEND_DIR"

# ============================================================================
# TASK 1.1: Update Type Definitions
# ============================================================================
log "Task 1.1: Updating type definitions..."

# Update task.ts with complete types
cat > src/types/task.ts << 'EOF'
// Task types
export type TaskStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled'

export type TaskSource = 'whatsapp' | 'dashboard' | 'api' | 'webhook'

export interface Task {
  id: string
  userMessage?: string
  message?: string
  user_message?: string
  source: TaskSource
  whatsappMessageId?: string
  whatsapp_message_id?: string
  status: TaskStatus
  progress: number
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  completedAt?: string | null
  completed_at?: string | null
  
  // Relations
  subtasks?: Subtask[]
  artifacts?: Artifact[]
  
  // Metadata
  metadata?: TaskMetadata
}

export interface Subtask {
  id: number | string
  agentId?: string
  agent_id?: string
  agentName?: string
  agent_name?: string
  stage: string
  status: TaskStatus
  taskDescription?: string
  task_description?: string
  description?: string
  
  // Timing
  startTime?: string
  start_time?: string
  endTime?: string
  end_time?: string
  durationSeconds?: number
  duration_seconds?: number
  
  // Optional
  artifacts?: Artifact[]
  metadata?: Record<string, unknown>
}

export interface Artifact {
  id: number
  taskId?: string
  task_id?: string
  path?: string
  filePath?: string
  file_path?: string
  type: string
  fileType?: string
  file_type?: string
  description?: string
  size?: number
  createdBy?: string
  created_by?: string
  createdAt: string
  created_at?: string
}

export interface TaskMetadata {
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
  estimatedDuration?: number
  actualDuration?: number
  parentTaskId?: string
  retryCount?: number
}

// Filter types
export interface TaskFilter {
  status?: TaskStatus[]
  source?: TaskSource[]
  searchText?: string
  dateFrom?: string
  dateTo?: string
  agentId?: string
  sortBy?: 'created' | 'updated' | 'progress' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export type ISO8601Timestamp = string

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
EOF

success "Task 1.1 complete: task.ts updated"

# ============================================================================
# TASK 1.2: Update Agent Types
# ============================================================================
log "Task 1.2: Updating agent type definitions..."

cat > src/types/agent.ts << 'EOF'
// Agent types - corresponde ao backend
export type AgentStatus = 
  | 'running' 
  | 'available' 
  | 'busy' 
  | 'idle'
  | 'error' 
  | 'killed' 
  | 'unknown'
  | 'completed'

export interface Agent {
  id: string
  name: string
  status: AgentStatus
  taskCount: number
  task_count?: number
  createdAt: string
  created_at?: string
  updatedAt: string
  updated_at?: string
  completedAt?: string | null
  completed_at?: string | null
  parentId?: string | null
  parent_id?: string | null
  
  // Optional fields
  isActive?: boolean
  is_active?: boolean
  hasNotification?: boolean
  has_notification?: boolean
  notification?: AgentNotification
  currentTaskId?: string
  current_task_id?: string
  parentAgentId?: string
  parent_agent_id?: string
  capabilities?: string[]
  lastActivityAt?: string
  last_activity_at?: string
  spawnReason?: string
  spawn_reason?: string
  instructions?: string
  metadata?: AgentMetadata
}

export interface AgentNotification {
  agentId: string
  agent_id?: string
  type: string
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: string
  task?: string
  artifacts?: string[]
  testResult?: string
  testSummary?: TestSummary
  fixes?: string[]
  prevention?: string
  nextAgent?: string
}

export interface TestSummary {
  total: number
  passed: number
  failed: number
  coverage: string
}

export interface AgentMetadata {
  model?: string
  version?: string
  tags?: string[]
}

export interface AgentStats {
  agentId: string
  totalTasks: number
  completedTasks: number
  failedTasks: number
  successRate: number
  averageTaskDuration: number
  currentTask?: Task
  queueDepth: number
}

export interface AgentHierarchy {
  parentAgentId: string
  childAgentId: string
  spawnTimestamp: string
  spawnReason: string
  depth: number
  isActive: boolean
}

export interface AgentGraph {
  nodes: AgentNode[]
  edges: AgentEdge[]
  rootAgentIds: string[]
}

export interface AgentNode {
  id: string
  data: Agent
  position?: { x: number; y: number }
  parentNode?: string
  extent?: 'parent' | 'child'
}

export interface AgentEdge {
  id: string
  source: string
  target: string
  animated?: boolean
  label?: string
}

// Filter types
export interface AgentFilter {
  status?: AgentStatus[]
  searchText?: string
  hasParent?: boolean
  hasActiveTask?: boolean
  suspiciousOnly?: boolean
}

export type ISO8601Timestamp = string

// Forward reference for Task
interface Task {
  id: string
  status: string
  progress: number
}
EOF

success "Task 1.2 complete: agent.ts updated"

# ============================================================================
# TASK 1.3: Create Terminal Types
# ============================================================================
log "Task 1.3: Creating terminal type definitions..."

cat > src/types/terminal.ts << 'EOF'
// Terminal types

export type TerminalLineType = 
  | 'command' 
  | 'success' 
  | 'error' 
  | 'info' 
  | 'system' 
  | 'agent'
  | 'warning'

export interface TerminalLine {
  id: string
  type: TerminalLineType
  text: string
  timestamp: string
  agentId?: string
  taskId?: string
}

export interface TerminalState {
  lines: TerminalLine[]
  isAutoScroll: boolean
  isPaused: boolean
  maxLines: number
}

export interface SystemStatus {
  totalAgents: number
  runningAgents: number
  totalTasks: number
  activeTasks: number
  completedTasks: number
  failedTasks: number
  uptime: number
  websocketStatus: 'connected' | 'disconnected' | 'reconnecting'
  apiLatency?: number
}
EOF

success "Task 1.3 complete: terminal.ts created"

# ============================================================================
# TASK 1.4: Create Zustand Stores
# ============================================================================
log "Task 1.4: Creating Zustand stores..."

# Task Store
cat > src/stores/taskStore.ts << 'EOF'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Task, TaskFilter } from '../types/task'

interface TaskState {
  // Data
  tasks: Task[]
  selectedTask: Task | null
  filter: TaskFilter
  
  // Loading states
  isLoading: boolean
  isLoadingDetail: boolean
  error: string | null
  
  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  removeTask: (taskId: string) => void
  selectTask: (task: Task | null) => void
  setFilter: (filter: Partial<TaskFilter>) => void
  clearFilter: () => void
  setLoading: (loading: boolean) => void
  setLoadingDetail: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Computed
  getFilteredTasks: () => Task[]
}

const initialFilter: TaskFilter = {
  status: undefined,
  source: undefined,
  searchText: '',
  sortBy: 'created',
  sortOrder: 'desc'
}

export const useTaskStore = create<TaskState>()(
  devtools(
    (set, get) => ({
      tasks: [],
      selectedTask: null,
      filter: initialFilter,
      isLoading: false,
      isLoadingDetail: false,
      error: null,
      
      setTasks: (tasks) => set({ tasks }),
      
      addTask: (task) => set((state) => ({
        tasks: [task, ...state.tasks]
      })),
      
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId ? { ...t, ...updates } : t
        )
      })),
      
      removeTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      })),
      
      selectTask: (task) => set({ selectedTask: task }),
      
      setFilter: (filter) => set((state) => ({
        filter: { ...state.filter, ...filter }
      })),
      
      clearFilter: () => set({ filter: initialFilter }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setLoadingDetail: (loading) => set({ isLoadingDetail: loading }),
      setError: (error) => set({ error }),
      
      getFilteredTasks: () => {
        const { tasks, filter } = get()
        let result = [...tasks]
        
        // Filter by status
        if (filter.status?.length) {
          result = result.filter(t => filter.status?.includes(t.status))
        }
        
        // Filter by source
        if (filter.source?.length) {
          result = result.filter(t => filter.source?.includes(t.source))
        }
        
        // Filter by search text
        if (filter.searchText) {
          const search = filter.searchText.toLowerCase()
          result = result.filter(t => 
            (t.userMessage || t.message || t.user_message || '')
              .toLowerCase()
              .includes(search)
          )
        }
        
        // Sort
        result.sort((a, b) => {
          const sortBy = filter.sortBy || 'created'
          const order = filter.sortOrder === 'asc' ? 1 : -1
          
          switch (sortBy) {
            case 'created':
              return (new Date(a.createdAt || a.created_at || 0).getTime() - 
                     new Date(b.createdAt || b.created_at || 0).getTime()) * order
            case 'updated':
              return (new Date(a.updatedAt || a.updated_at || 0).getTime() - 
                     new Date(b.updatedAt || b.updated_at || 0).getTime()) * order
            case 'progress':
              return ((a.progress || 0) - (b.progress || 0)) * order
            default:
              return 0
          }
        })
        
        return result
      }
    }),
    { name: 'task-store' }
  )
)
EOF

# Agent Store
cat > src/stores/agentStore.ts << 'EOF'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Agent, AgentFilter } from '../types/agent'

interface AgentState {
  // Data
  agents: Agent[]
  selectedAgent: Agent | null
  filter: AgentFilter
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Stats
  lastUpdate: string
  
  // Actions
  setAgents: (agents: Agent[]) => void
  updateAgent: (agentId: string, updates: Partial<Agent>) => void
  addAgent: (agent: Agent) => void
  removeAgent: (agentId: string) => void
  selectAgent: (agent: Agent | null) => void
  setFilter: (filter: Partial<AgentFilter>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLastUpdate: (time: string) => void
  
  // Computed
  getFilteredAgents: () => Agent[]
  getRunningAgents: () => Agent[]
  getStats: () => {
    total: number
    running: number
    completed: number
    error: number
    idle: number
    unknown: number
  }
}

export const useAgentStore = create<AgentState>()(
  devtools(
    (set, get) => ({
      agents: [],
      selectedAgent: null,
      filter: {},
      isLoading: false,
      error: null,
      lastUpdate: '',
      
      setAgents: (agents) => set({ agents }),
      
      updateAgent: (agentId, updates) => set((state) => ({
        agents: state.agents.map(a => 
          a.id === agentId ? { ...a, ...updates } : a
        )
      })),
      
      addAgent: (agent) => set((state) => ({
        agents: [...state.agents, agent]
      })),
      
      removeAgent: (agentId) => set((state) => ({
        agents: state.agents.filter(a => a.id !== agentId)
      })),
      
      selectAgent: (agent) => set({ selectedAgent: agent }),
      
      setFilter: (filter) => set((state) => ({
        filter: { ...state.filter, ...filter }
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setLastUpdate: (time) => set({ lastUpdate: time }),
      
      getFilteredAgents: () => {
        const { agents, filter } = get()
        let result = [...agents]
        
        if (filter.status?.length) {
          result = result.filter(a => filter.status?.includes(a.status))
        }
        
        if (filter.searchText) {
          const search = filter.searchText.toLowerCase()
          result = result.filter(a => 
            a.name.toLowerCase().includes(search)
          )
        }
        
        return result
      },
      
      getRunningAgents: () => {
        return get().agents.filter(a => a.status === 'running')
      },
      
      getStats: () => {
        const agents = get().agents
        return {
          total: agents.length,
          running: agents.filter(a => a.status === 'running').length,
          completed: agents.filter(a => a.status === 'completed').length,
          error: agents.filter(a => a.status === 'error').length,
          idle: agents.filter(a => a.status === 'idle').length,
          unknown: agents.filter(a => a.status === 'unknown').length
        }
      }
    }),
    { name: 'agent-store' }
  )
)
EOF

# Terminal Store
cat > src/stores/terminalStore.ts << 'EOF'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { TerminalLine } from '../types/terminal'

interface TerminalState {
  lines: TerminalLine[]
  isAutoScroll: boolean
  isPaused: boolean
  maxLines: number
  
  // Actions
  addLine: (line: Omit<TerminalLine, 'id'>) => void
  addLines: (lines: Omit<TerminalLine, 'id'>[]) => void
  clear: () => void
  toggleAutoScroll: () => void
  togglePause: () => void
  setMaxLines: (max: number) => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useTerminalStore = create<TerminalState>()(
  devtools(
    (set, get) => ({
      lines: [],
      isAutoScroll: true,
      isPaused: false,
      maxLines: 100,
      
      addLine: (line) => set((state) => {
        const newLine = { ...line, id: generateId() }
        const lines = [...state.lines, newLine]
        // Trim to max lines
        if (lines.length > state.maxLines) {
          lines.shift()
        }
        return { lines }
      }),
      
      addLines: (newLines) => set((state) => {
        const linesWithIds = newLines.map(l => ({ ...l, id: generateId() }))
        const lines = [...state.lines, ...linesWithIds]
        // Trim to max lines
        while (lines.length > state.maxLines) {
          lines.shift()
        }
        return { lines }
      }),
      
      clear: () => set({ lines: [] }),
      
      toggleAutoScroll: () => set((state) => ({
        isAutoScroll: !state.isAutoScroll
      })),
      
      togglePause: () => set((state) => ({
        isPaused: !state.isPaused
      })),
      
      setMaxLines: (max) => set({ maxLines: max })
    }),
    { name: 'terminal-store' }
  )
)
EOF

success "Task 1.4 complete: Zustand stores created"

# ============================================================================
# TASK 1.5: Update API Services
# ============================================================================
log "Task 1.5: Updating API services..."

# Update task-api.ts with enhanced methods
cat > src/services/task-api.ts << 'EOF'
import { apiClient } from './api-client'
import type { Task, TaskFilter } from '../types/task'
import type { ApiResponse, PaginationMeta } from '../types/api'

export const taskApi = {
  // Get all tasks with optional filtering
  async getTasks(filter?: TaskFilter): Promise<{ data: Task[]; meta: PaginationMeta }> {
    const params = new URLSearchParams()
    
    if (filter?.status?.length) {
      filter.status.forEach((status) => params.append('status', status))
    }
    if (filter?.agentId) {
      params.append('agentId', filter.agentId)
    }
    if (filter?.searchText) {
      params.append('search', filter.searchText)
    }
    if (filter?.sortBy) {
      params.append('sortBy', filter.sortBy)
      params.append('sortOrder', filter.sortOrder || 'desc')
    }

    const response = await apiClient.get<ApiResponse<Task[]>>(
      `/tasks?${params.toString()}`
    )
    
    const tasksData = Array.isArray(response.data?.data) 
      ? response.data.data 
      : Array.isArray(response.data) 
        ? response.data 
        : []
    
    const meta: PaginationMeta = {
      page: response.data?.meta?.page ?? 1,
      pageSize: response.data?.meta?.pageSize ?? tasksData.length,
      total: response.data?.meta?.total ?? tasksData.length,
      hasMore: response.data?.meta?.hasMore ?? false
    }
    
    return { data: tasksData, meta }
  },

  // Get single task by ID
  async getTask(taskId: string): Promise<Task> {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`)
    return response.data.data
  },

  // Get task execution logs
  async getTaskLogs(
    taskId: string,
    options?: { level?: string[]; page?: number; pageSize?: number }
  ): Promise<{ data: LogEntry[]; hasMore: boolean }> {
    const params = new URLSearchParams()
    
    if (options?.level?.length) {
      options.level.forEach((l) => params.append('level', l))
    }
    if (options?.page) {
      params.append('page', String(options.page))
    }
    if (options?.pageSize) {
      params.append('pageSize', String(options.pageSize))
    }

    const response = await apiClient.get<ApiResponse<LogEntry[]>>(
      `/tasks/${taskId}/logs?${params.toString()}`
    )
    
    const logsData = Array.isArray(response.data?.data)
      ? response.data.data
      : []
    
    return {
      data: logsData,
      hasMore: response.data?.meta?.hasMore || false
    }
  },
  
  // Refresh task (poll for updates)
  async refreshTask(taskId: string): Promise<Task> {
    return this.getTask(taskId)
  }
}

// Log entry type for task logs
export interface LogEntry {
  id: string
  timestamp: string
  agentId: string
  taskId: string
  level: 'debug' | 'info' | 'warning' | 'error'
  message: string
  context?: Record<string, unknown>
}
EOF

success "Task 1.5 complete: API services updated"

# ============================================================================
# TASK 1.6: Create WebSocket Service
# ============================================================================
log "Task 1.6: Creating WebSocket service..."

cat > src/services/websocket-service.ts << 'EOF'
import type { Agent, Task } from '../types'

type MessageHandler = (data: unknown) => void

interface WebSocketService {
  connect(): void
  disconnect(): void
  on(event: string, handler: MessageHandler): void
  off(event: string, handler: MessageHandler): void
  isConnected(): boolean
}

class WebSocketClient implements WebSocketService {
  private ws: WebSocket | null = null
  private handlers: Map<string, MessageHandler[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private url = 'ws://76.13.101.17:4105/ws'
  
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }
    
    try {
      this.ws = new WebSocket(this.url)
      
      this.ws.onopen = () => {
        console.log('[WebSocket] Connected')
        this.reconnectAttempts = 0
        this.emit('connected', {})
      }
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (err) {
          console.error('[WebSocket] Message parse error:', err)
        }
      }
      
      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected')
        this.emit('disconnected', {})
        this.attemptReconnect()
      }
      
      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        this.emit('error', error)
      }
    } catch (err) {
      console.error('[WebSocket] Connection failed:', err)
      this.attemptReconnect()
    }
  }
  
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    this.ws?.close()
    this.ws = null
  }
  
  on(event: string, handler: MessageHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, [])
    }
    this.handlers.get(event)!.push(handler)
  }
  
  off(event: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }
  
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
  
  private handleMessage(data: { type: string; [key: string]: unknown }): void {
    this.emit(data.type, data)
    
    // Also emit generic message event
    this.emit('message', data)
  }
  
  private emit(event: string, data: unknown): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (err) {
          console.error(`[WebSocket] Handler error for ${event}:`, err)
        }
      })
    }
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached')
      this.emit('max_reconnects', {})
      return
    }
    
    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }
}

export const webSocketService = new WebSocketClient()
export default webSocketService
EOF

success "Task 1.6 complete: WebSocket service created"

# ============================================================================
# TASK 1.7: Create/Update Custom Hooks
# ============================================================================
log "Task 1.7: Creating custom hooks..."

# Update useTasks hook
cat > src/hooks/useTasks.ts << 'EOF'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { taskApi } from '../services/task-api'
import { webSocketService } from '../services/websocket-service'
import { useTaskStore } from '../stores/taskStore'
import type { Task, TaskFilter } from '../types/task'

const TASKS_QUERY_KEY = 'tasks'
const TASK_DETAIL_QUERY_KEY = 'task'

export function useTasks(filter?: TaskFilter) {
  const setTasks = useTaskStore((state) => state.setTasks)
  const updateTask = useTaskStore((state) => state.updateTask)
  
  const query = useQuery({
    queryKey: [TASKS_QUERY_KEY, filter],
    queryFn: async () => {
      const result = await taskApi.getTasks(filter)
      setTasks(result.data)
      return result
    },
    staleTime: 5000,
    refetchInterval: 10000, // Fallback polling
  })
  
  // WebSocket real-time updates
  useEffect(() => {
    const handleTaskUpdate = (data: { taskId: string; task?: Task }) => {
      if (data.task) {
        updateTask(data.taskId, data.task)
      }
    }
    
    webSocketService.on('task.transition', handleTaskUpdate)
    return () => webSocketService.off('task.transition', handleTaskUpdate)
  }, [updateTask])
  
  return query
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: [TASK_DETAIL_QUERY_KEY, taskId],
    queryFn: () => taskApi.getTask(taskId),
    enabled: !!taskId,
    staleTime: 5000,
    refetchInterval: (data) => {
      // Poll more frequently if task is running
      if (data?.status === 'running') return 2000
      return 10000
    }
  })
}

export function useRefreshTasks() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] })
  }
}
EOF

# Update useAgents hook
cat > src/hooks/useAgents.ts << 'EOF'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { agentApi } from '../services/agent-api'
import { webSocketService } from '../services/websocket-service'
import { useAgentStore } from '../stores/agentStore'
import type { Agent, AgentFilter } from '../types/agent'

const AGENTS_QUERY_KEY = 'agents'
const AGENT_DETAIL_QUERY_KEY = 'agent'

export function useAgents(filter?: AgentFilter) {
  const setAgents = useAgentStore((state) => state.setAgents)
  const updateAgent = useAgentStore((state) => state.updateAgent)
  
  const query = useQuery({
    queryKey: [AGENTS_QUERY_KEY, filter],
    queryFn: async () => {
      const result = await agentApi.getAgents(filter)
      setAgents(result.data)
      return result
    },
    staleTime: 5000,
    refetchInterval: 5000,
  })
  
  // WebSocket real-time updates
  useEffect(() => {
    const handleAgentUpdate = (data: { agentId: string; agent?: Agent }) => {
      if (data.agent) {
        updateAgent(data.agentId, data.agent)
      }
    }
    
    webSocketService.on('agent.state_change', handleAgentUpdate)
    return () => webSocketService.off('agent.state_change', handleAgentUpdate)
  }, [updateAgent])
  
  return query
}

export function useAgent(agentId: string) {
  return useQuery({
    queryKey: [AGENT_DETAIL_QUERY_KEY, agentId],
    queryFn: () => agentApi.getAgent(agentId),
    enabled: !!agentId,
    staleTime: 5000,
  })
}

export function useRefreshAgents() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: [AGENTS_QUERY_KEY] })
  }
}
EOF

# Create useWebSocket hook
cat > src/hooks/useWebSocket.ts << 'EOF'
import { useEffect, useState, useCallback } from 'react'
import { webSocketService } from '../services/websocket-service'

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    const handleConnected = () => setIsConnected(true)
    const handleDisconnected = () => setIsConnected(false)
    const handleError = (err: unknown) => setError(err as Error)
    
    webSocketService.on('connected', handleConnected)
    webSocketService.on('disconnected', handleDisconnected)
    webSocketService.on('error', handleError)
    
    // Check initial state
    setIsConnected(webSocketService.isConnected())
    
    // Connect if not already
    if (!webSocketService.isConnected()) {
      webSocketService.connect()
    }
    
    return () => {
      webSocketService.off('connected', handleConnected)
      webSocketService.off('disconnected', handleDisconnected)
      webSocketService.off('error', handleError)
    }
  }, [])
  
  const send = useCallback((message: unknown) => {
    // Note: This would require extending the service to send messages
    console.log('WebSocket send:', message)
  }, [])
  
  const reconnect = useCallback(() => {
    webSocketService.disconnect()
    webSocketService.connect()
  }, [])
  
  return {
    isConnected,
    error,
    send,
    reconnect
  }
}
EOF

success "Task 1.7 complete: Custom hooks created"

# ============================================================================
# TASK 1.8: Update types/index.ts
# ============================================================================
log "Task 1.8: Updating type exports..."

cat > src/types/index.ts << 'EOF'
// Agent types
export * from './agent'

// Task types
export * from './task'

// Terminal types
export * from './terminal'

// API types
export interface ApiResponse<T> {
  data: T
  meta?: {
    page?: number
    pageSize?: number
    total?: number
    hasMore?: boolean
  }
  timestamp?: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

// Log entry
export interface LogEntry {
  id: string
  timestamp: string
  agentId: string
  taskId: string
  level: 'debug' | 'info' | 'warning' | 'error'
  message: string
  context?: Record<string, unknown>
}

// Filter types
export * from './filter'

// Mission types
export * from './mission'

// WebSocket types
export * from './websocket'

// Cost types
export * from './cost'

// Kill switch types
export * from './kill-switch'

// Metrics types
export * from './metrics'

// Graph types
export * from './graph'
EOF

success "Task 1.8 complete: Type exports updated"

# ============================================================================
# COMPLETION
# ============================================================================
log "========================================="
success "PHASE 1 COMPLETE: Foundation & Data Layer"
log "========================================="
log ""
log "Completed tasks:"
log "  ✓ Task 1.1: Updated type definitions (task.ts)"
log "  ✓ Task 1.2: Updated agent type definitions (agent.ts)"
log "  ✓ Task 1.3: Created terminal type definitions (terminal.ts)"
log "  ✓ Task 1.4: Created Zustand stores (task, agent, terminal)"
log "  ✓ Task 1.5: Updated API services (task-api.ts)"
log "  ✓ Task 1.6: Created WebSocket service"
log "  ✓ Task 1.7: Created custom hooks (useTasks, useAgents, useWebSocket)"
log "  ✓ Task 1.8: Updated type exports (index.ts)"
log ""

# Mark phase complete and trigger next
source "$SCRIPT_DIR/scheduler.sh"
complete_phase 1
