import React from 'react'
import type { Agent } from '../../types/agent'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { formatTimestamp, formatDuration } from '../../utils/formatters'
import { getAgentStatusColor, getAgentStatusLabel } from '../../utils/status-colors'

interface AgentInfoProps {
  agent: Agent
}

export const AgentInfo: React.FC<AgentInfoProps> = ({ agent }) => {
  const statusColor = getAgentStatusColor(agent.status)
  const statusLabel = getAgentStatusLabel(agent.status)
  
  const uptime = Math.floor(
    (new Date().getTime() - new Date(agent.createdAt).getTime()) / 1000 / 60
  )

  return (
    <Card title="Agent Information">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm text-nexus-text-secondary">Status</label>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColor}`} />
            <Badge variant={getBadgeVariant(agent.status)}>{statusLabel}</Badge>
          </div>
        </div>

        {/* Created At */}
        <div className="space-y-2">
          <label className="text-sm text-nexus-text-secondary">Created</label>
          <p className="text-nexus-text-primary">{formatTimestamp(agent.createdAt)}</p>
        </div>

        {/* Uptime */}
        <div className="space-y-2">
          <label className="text-sm text-nexus-text-secondary">Uptime</label>
          <p className="text-nexus-text-primary">{formatDuration(uptime)}</p>
        </div>

        {/* Last Activity */}
        <div className="space-y-2">
          <label className="text-sm text-nexus-text-secondary">Last Activity</label>
          <p className="text-nexus-text-primary">{formatTimestamp(agent.updatedAt)}</p>
        </div>

        {/* Capabilities ou Task Count */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-nexus-text-secondary">
            {agent.capabilities ? 'Capabilities' : 'Tasks Completed'}
          </label>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities && agent.capabilities.length > 0 ? (
              agent.capabilities.map((cap) => (
                <Badge key={cap} variant="default" size="sm">
                  {cap}
                </Badge>
              ))
            ) : (
              <span className="text-nexus-text-muted">
                {agent.taskCount || 0} tasks completed
              </span>
            )}
          </div>
        </div>

        {/* Parent Agent */}
        {(agent.parentAgentId || agent.parentId) && (
          <div className="space-y-2">
            <label className="text-sm text-nexus-text-secondary">Parent Agent</label>
            <p className="text-nexus-text-primary font-mono">{agent.parentAgentId || agent.parentId}</p>
          </div>
        )}

        {/* Spawn Reason */}
        {agent.spawnReason && (
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-nexus-text-secondary">Spawn Reason</label>
            <p className="text-nexus-text-primary">{agent.spawnReason}</p>
          </div>
        )}
      </div>
    </Card>
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
