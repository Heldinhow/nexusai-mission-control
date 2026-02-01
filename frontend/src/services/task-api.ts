import { apiClient } from './api-client'
import type { Task } from '../types/task'
import type { ApiResponse } from '../types/api'
import type { TaskFilter } from '../types/filter'

export const taskApi = {
  // Get all tasks with optional filtering
  async getTasks(filter?: TaskFilter): Promise<{ data: Task[] }> {
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
    if (filter?.stuckInPending) {
      params.append('stuckInPending', 'true')
    }

    const response = await apiClient.get<ApiResponse<Task[]>>(
      `/tasks?${params.toString()}`
    )
    
    const tasksData = Array.isArray(response.data) 
      ? response.data 
      : response.data.data
    
    return {
      data: tasksData,
    }
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
    
    const logsData = Array.isArray(response.data)
      ? response.data
      : response.data.data
    
    const hasMore = Array.isArray(response.data)
      ? false
      : response.data.meta?.hasMore || false
    
    return {
      data: logsData,
      hasMore,
    }
  },
}

// Log entry type for task logs
interface LogEntry {
  id: string
  timestamp: string
  agentId: string
  taskId: string
  level: 'debug' | 'info' | 'warning' | 'error'
  message: string
  context?: Record<string, unknown>
}
