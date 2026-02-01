import React from 'react'
import type { Agent } from '../../types/agent'
import { AgentCard } from './AgentCard'

interface AgentListProps {
  agents: Agent[] | undefined | null
}

export const AgentList: React.FC<AgentListProps> = ({ agents }) => {
  // Garante que agents seja sempre um array
  const agentsList = Array.isArray(agents) ? agents : []
  
  if (agentsList.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-nexus-border flex items-center justify-center">
          <svg
            className="w-8 h-8 text-nexus-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-nexus-text-primary mb-2">No agents found</h3>
        <p className="text-nexus-text-secondary">
          There are currently no agents running in the orchestrator.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-nexus-border">
      {agentsList.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}
