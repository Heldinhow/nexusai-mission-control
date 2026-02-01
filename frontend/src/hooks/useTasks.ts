import { useQuery } from '@tanstack/react-query'
import { taskApi } from '../services/task-api'
import type { Task } from '../types/task'
import type { TaskFilter } from '../types/filter'

const TASKS_QUERY_KEY = 'tasks'
const TASK_DETAIL_QUERY_KEY = 'task'

export function useTasks(filter?: TaskFilter) {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, filter],
    queryFn: () => taskApi.getTasks(filter),
    staleTime: 5000,
  })
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: [TASK_DETAIL_QUERY_KEY, taskId],
    queryFn: () => taskApi.getTask(taskId),
    enabled: !!taskId,
    staleTime: 5000,
  })
}

export function useAgentTasks(agentId: string) {
  return useTasks({ agentId })
}

export function useTaskHistory(agentId: string) {
  return useQuery({
    queryKey: ['task-history', agentId],
    queryFn: async () => {
      const result = await taskApi.getTasks({ agentId })
      // Sort by created date descending
      return result.data.sort((a: Task, b: Task) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    },
    enabled: !!agentId,
  })
}
