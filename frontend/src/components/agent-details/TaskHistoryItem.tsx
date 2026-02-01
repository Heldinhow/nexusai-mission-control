import React from 'react'
import type { Task } from '../../types/task'
import { Badge } from '../common/Badge'
import { formatTimestamp, formatDuration } from '../../utils/formatters'
import { getTaskStatusColor, getTaskStatusLabel } from '../../utils/status-colors'

interface TaskHistoryItemProps {
  task: Task
}

export const TaskHistoryItem: React.FC<TaskHistoryItemProps> = ({ task }) => {
  const statusColor = getTaskStatusColor(task.status)
  const statusLabel = getTaskStatusLabel(task.status)
  
  // Calculate duration
  const duration = task.startedAt && task.completedAt
    ? Math.floor((new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000 / 60)
    : 0

  return (
    <div className="p-4 bg-nexus-bg rounded-lg border border-nexus-border hover:border-nexus-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Task Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className="text-nexus-text-muted font-mono text-sm">{task.id}</span>
            <Badge variant={getBadgeVariant(task.status)} size="sm">
              {statusLabel}
            </Badge>
          </div>
          
          {/* Description */}
          <p className="text-nexus-text-primary text-sm truncate">{task.description}</p>
          
          {/* Timeline */}
          <div className="flex items-center gap-4 mt-2 text-xs text-nexus-text-secondary">
            <span>Created: {formatTimestamp(task.createdAt)}</span>
            {task.completedAt && (
              <span>Completed: {formatTimestamp(task.completedAt)}</span>
            )}
            {duration > 0 && (
              <span>Duration: {formatDuration(duration)}</span>
            )}
          </div>
        </div>

        {/* Error indicator */}
        {task.error && (
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-nexus-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

function getBadgeVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'concluida':
      return 'success'
    case 'iniciada':
    case 'pendente':
      return 'info'
    case 'falha':
      return 'danger'
    case 'criada':
      return 'default'
    default:
      return 'default'
  }
}
