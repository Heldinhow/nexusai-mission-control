import { useQuery, useQueryClient } from '@tanstack/react-query'
import { agentApi } from '../services/agent-api'
import type { Agent } from '../types/agent'
import type { AgentFilter } from '../types/filter'

const AGENTS_QUERY_KEY = 'agents'
const AGENT_DETAIL_QUERY_KEY = 'agent'

export function useAgents(filter?: AgentFilter) {
  return useQuery({
    queryKey: [AGENTS_QUERY_KEY, filter],
    queryFn: () => agentApi.getAgents(filter),
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000, // Poll every 5 seconds as fallback
  })
}

export function useAgent(agentId: string) {
  return useQuery({
    queryKey: [AGENT_DETAIL_QUERY_KEY, agentId],
    queryFn: () => agentApi.getAgent(agentId),
    enabled: !!agentId,
    staleTime: 5000,
  })
}

export function useAgentChildren(agentId: string, recursive = false) {
  return useQuery({
    queryKey: ['agent-children', agentId, recursive],
    queryFn: () => agentApi.getAgentChildren(agentId, recursive),
    enabled: !!agentId,
  })
}

export function useUpdateAgentInCache() {
  const queryClient = useQueryClient()

  return (updatedAgent: Agent) => {
    // Update the agent in the agents list cache
    queryClient.setQueryData([AGENTS_QUERY_KEY], (old: { data: Agent[]; meta: unknown } | undefined) => {
      if (!old) return old
      return {
        ...old,
        data: old.data.map((agent) =>
          agent.id === updatedAgent.id ? updatedAgent : agent
        ),
      }
    })

    // Update the agent detail cache if it exists
    queryClient.setQueryData([AGENT_DETAIL_QUERY_KEY, updatedAgent.id], updatedAgent)
  }
}
