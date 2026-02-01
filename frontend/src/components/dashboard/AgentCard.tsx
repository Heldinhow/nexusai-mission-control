import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { Agent } from '../../types/agent'
import { Badge } from '../common/Badge'
import { formatRelativeTime } from '../../utils/formatters'
import { getAgentStatusColor, getAgentStatusLabel } from '../../utils/status-colors'

interface AgentCardProps {
  agent: Agent
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/agents/${agent.id}`)
  }

  const statusColor = getAgentStatusColor(agent.status)
  const statusLabel = getAgentStatusLabel(agent.status)

  return (
    <div
      onClick={handleClick}
      className="p-4 hover:bg-nexus-border/50 transition-colors cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className={`w-3 h-3 rounded-full ${statusColor} ring-2 ring-nexus-bg`} />

          {/* Agent Info */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-nexus-text-primary group-hover:text-nexus-accent transition-colors">
                {agent.name}
              </h4>
              <span className="text-nexus-text-muted text-sm font-mono">{agent.id}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant={getBadgeVariant(agent.status)} size="sm">
                {statusLabel}
              </Badge>
              {agent.currentTaskId && (
                <span className="text-sm text-nexus-text-secondary">
                  Task: {agent.currentTaskId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-6 text-sm text-nexus-text-secondary">
          {agent.taskCount > 0 && (
            <div className="hidden md:flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span>{agent.taskCount} tasks</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{formatRelativeTime(agent.updatedAt)}</span>
          </div>
          <svg
            className="w-5 h-5 text-nexus-text-muted group-hover:text-nexus-accent transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function getBadgeVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'available':
      return 'success'
    case 'busy':
      return 'info'
    case 'error':
      return 'danger'
    case 'killed':
      return 'default'
    default:
      return 'default'
  }
}
