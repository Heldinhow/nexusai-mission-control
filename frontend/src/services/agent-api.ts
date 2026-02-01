import { apiClient } from './api-client'
import type { Agent, AgentGraph } from '../types/agent'
import type { ApiResponse, PaginationMeta } from '../types/api'
import type { AgentFilter } from '../types/filter'

export const agentApi = {
  // Get all agents with optional filtering
  async getAgents(filter?: AgentFilter): Promise<{ data: Agent[]; meta: PaginationMeta }> {
    const params = new URLSearchParams()
    
    if (filter?.status?.length) {
      filter.status.forEach((status) => params.append('status', status))
    }
    if (filter?.hasParent !== undefined && filter.hasParent !== null) {
      params.append('hasParent', String(filter.hasParent))
    }
    if (filter?.hasActiveTask !== undefined) {
      params.append('hasActiveTask', String(filter.hasActiveTask))
    }
    if (filter?.searchText) {
      params.append('search', filter.searchText)
    }
    if (filter?.suspiciousOnly) {
      params.append('suspicious', 'true')
    }

    const response = await apiClient.get<ApiResponse<Agent[]>>(
      `/agents?${params.toString()}`
    )
    
    const meta: PaginationMeta = {
      page: response.data?.meta?.page ?? 1,
      pageSize: response.data?.meta?.pageSize ?? 25,
      total: response.data?.meta?.total ?? 0,
      hasMore: response.data?.meta?.hasMore ?? false,
    }
    
    // O axios response.data é ApiResponse<Agent[]>, então precisamos de response.data.data
    const agentsData = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
        ? response.data.data
        : []
    
    return {
      data: agentsData,
      meta,
    }
  },

  // Get single agent by ID
  async getAgent(agentId: string): Promise<Agent> {
    const response = await apiClient.get<ApiResponse<Agent>>(`/agents/${agentId}`)
    return response.data.data
  },

  // Get agent's children
  async getAgentChildren(agentId: string, recursive = false): Promise<Agent[]> {
    const response = await apiClient.get<ApiResponse<Agent[]>>(
      `/agents/${agentId}/children?recursive=${recursive}`
    )
    return Array.isArray(response.data) ? response.data : response.data.data
  },

  // Get agent hierarchy graph
  async getAgentHierarchy(
    rootAgentId?: string,
    maxDepth = 5,
    includeInactive = false
  ): Promise<AgentGraph> {
    const params = new URLSearchParams()
    if (rootAgentId) params.append('rootAgentId', rootAgentId)
    params.append('maxDepth', String(maxDepth))
    params.append('includeInactive', String(includeInactive))

    const response = await apiClient.get<AgentGraph>(`/hierarchy?${params.toString()}`)
    return response.data
  },

  // Kill an agent
  async killAgent(
    agentId: string,
    data: {
      reason: { type: string; description: string }
      confirmation: { method: 'type_to_confirm'; typedValue: string }
      cascade: boolean
      forceImmediate: boolean
    }
  ): Promise<{
    killEventId: string
    status: 'success' | 'partial' | 'failed'
    terminatedAgents: string[]
    cascadeCount: number
  }> {
    return await apiClient.post(`/agents/${agentId}/kill`, data)
  },
}
