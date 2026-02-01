// Validation utilities
import type { Agent, AgentStatus } from '../types/agent'
import type { Task, TaskStatus } from '../types/task'

export function isValidAgent(agent: unknown): agent is Agent {
  if (!agent || typeof agent !== 'object') return false
  
  const a = agent as Agent
  return (
    typeof a.id === 'string' &&
    typeof a.name === 'string' &&
    isValidAgentStatus(a.status) &&
    Array.isArray(a.capabilities) &&
    typeof a.createdAt === 'string' &&
    typeof a.lastActivityAt === 'string'
  )
}

export function isValidAgentStatus(status: unknown): status is AgentStatus {
  return ['available', 'busy', 'error', 'killed'].includes(status as string)
}

export function isValidTask(task: unknown): task is Task {
  if (!task || typeof task !== 'object') return false
  
  const t = task as Task
  return (
    typeof t.id === 'string' &&
    typeof t.description === 'string' &&
    isValidTaskStatus(t.status) &&
    typeof t.agentId === 'string' &&
    typeof t.createdAt === 'string'
  )
}

export function isValidTaskStatus(status: unknown): status is TaskStatus {
  return ['criada', 'iniciada', 'pendente', 'concluida', 'falha'].includes(status as string)
}

export function isValidISO8601Timestamp(timestamp: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
  if (!iso8601Regex.test(timestamp)) return false
  
  const date = new Date(timestamp)
  return !isNaN(date.getTime())
}

export function validateTaskStateTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): boolean {
  const validTransitions: Record<TaskStatus, TaskStatus[]> = {
    criada: ['iniciada', 'falha'],
    iniciada: ['pendente', 'concluida', 'falha'],
    pendente: ['concluida', 'falha'],
    concluida: [],
    falha: []
  }
  
  return validTransitions[currentStatus]?.includes(newStatus) || false
}

export function formatValidationErrors(errors: string[]): string {
  return errors.join(', ')
}
