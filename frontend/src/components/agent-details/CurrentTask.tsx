import React from 'react'
import type { Task } from '../../types/task'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { formatTimestamp, formatDuration } from '../../utils/formatters'
import { getTaskStatusColor, getTaskStatusLabel } from '../../utils/status-colors'

interface CurrentTaskProps {
  task: Task
}

export const CurrentTask: React.FC<CurrentTaskProps> = ({ task }) => {
  const statusColor = getTaskStatusColor(task.status)
  const statusLabel = getTaskStatusLabel(task.status)
  
  // Calculate duration if started
  const duration = task.startedAt
    ? Math.floor((new Date().getTime() - new Date(task.startedAt).getTime()) / 1000 / 60)
    : 0

  return (
    <Card 
      title="Current Task" 
      subtitle={`Task ID: ${task.id}`}
      className="border-l-4 border-l-nexus-accent"
    >
      <div className="space-y-4">
        {/* Task Description */}
        <div>
          <label className="text-sm text-nexus-text-secondary">Description</label>
          <p className="text-nexus-text-primary mt-1">{task.description}</p>
        </div>

        {/* Status and Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-nexus-text-secondary">Status</label>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusColor}`} />
              <Badge variant={getBadgeVariant(task.status)}>{statusLabel}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-nexus-text-secondary">Created</label>
            <p className="text-nexus-text-primary">{formatTimestamp(task.createdAt)}</p>
          </div>

          {task.startedAt && (
            <div className="space-y-2">
              <label className="text-sm text-nexus-text-secondary">Started</label>
              <p className="text-nexus-text-primary">{formatTimestamp(task.startedAt)}</p>
            </div>
          )}

          {duration > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-nexus-text-secondary">Duration</label>
              <p className="text-nexus-text-primary">{formatDuration(duration)}</p>
            </div>
          )}
        </div>

        {/* Error Info */}
        {task.error && (
          <div className="bg-nexus-danger/10 border border-nexus-danger/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-nexus-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-nexus-danger">Error: {task.error.code}</span>
            </div>
            <p className="text-nexus-text-secondary">{task.error.message}</p>
          </div>
        )}

        {/* Output */}
        {task.output && (
          <div>
            <label className="text-sm text-nexus-text-secondary">Output</label>
            <div className="mt-1 bg-nexus-bg rounded-lg p-4 font-mono text-sm text-nexus-text-primary">
              {task.output.result}
            </div>
          </div>
        )}
      </div>
    </Card>
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
