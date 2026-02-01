import type { AgentStatus } from '../types/agent'
import type { TaskStatus } from '../types/task'
import type { LogLevel } from '../types/log'

export function getAgentStatusColor(status: AgentStatus): string {
  const colors: Record<string, string> = {
    running: 'bg-nexus-success',
    available: 'bg-nexus-success',
    busy: 'bg-nexus-accent',
    error: 'bg-nexus-danger',
    killed: 'bg-nexus-text-muted',
    unknown: 'bg-nexus-text-muted',
  }
  return colors[status] || 'bg-nexus-text-muted'
}

export function getAgentStatusLabel(status: AgentStatus): string {
  const labels: Record<string, string> = {
    running: 'Running',
    available: 'Available',
    busy: 'Busy',
    error: 'Error',
    killed: 'Killed',
    unknown: 'Unknown',
  }
  return labels[status] || status
}

export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    criada: 'bg-nexus-text-muted',
    iniciada: 'bg-nexus-accent',
    pendente: 'bg-nexus-warning',
    concluida: 'bg-nexus-success',
    falha: 'bg-nexus-danger',
  }
  return colors[status] || 'bg-nexus-text-muted'
}

export function getTaskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    criada: 'Created',
    iniciada: 'Started',
    pendente: 'Pending',
    concluida: 'Completed',
    falha: 'Failed',
  }
  return labels[status] || status
}

export function getLogLevelColor(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    debug: 'text-nexus-text-muted',
    info: 'text-nexus-accent',
    warning: 'text-nexus-warning',
    error: 'text-nexus-danger',
  }
  return colors[level] || 'text-nexus-text-muted'
}

export function getConnectionStatusColor(status: string): string {
  const colors: Record<string, string> = {
    connected: 'bg-nexus-success',
    connecting: 'bg-nexus-warning',
    disconnected: 'bg-nexus-danger',
    reconnecting: 'bg-nexus-warning animate-pulse',
  }
  return colors[status] || 'bg-nexus-text-muted'
}
