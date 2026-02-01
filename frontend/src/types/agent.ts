// Agent types - corresponde ao backend
export type AgentStatus = 'running' | 'available' | 'busy' | 'error' | 'killed' | 'unknown'

export interface Agent {
  id: string
  name: string
  status: AgentStatus
  taskCount: number
  createdAt: ISO8601Timestamp
  updatedAt: ISO8601Timestamp
  parentId?: string
  isActive: boolean
  metadata?: AgentMetadata
  // Campos opcionais para detalhes
  currentTaskId?: string
  parentAgentId?: string
  capabilities?: string[]
  lastActivityAt?: ISO8601Timestamp
  spawnReason?: string
  instructions?: string
}

export interface AgentMetadata {
  model?: string
  version?: string
  tags?: string[]
  [key: string]: unknown
}

export interface AgentHierarchy {
  parentAgentId: string
  childAgentId: string
  spawnTimestamp: ISO8601Timestamp
  spawnReason: string
  depth: number
  isActive: boolean
}

export interface AgentGraph {
  nodes: AgentNode[]
  edges: AgentEdge[]
  rootAgentIds: string[]
}

export interface AgentNode {
  id: string
  data: Agent
  position?: { x: number; y: number }
  parentNode?: string
  extent?: 'parent' | 'child'
}

export interface AgentEdge {
  id: string
  source: string
  target: string
  animated?: boolean
  label?: string
}

export type ISO8601Timestamp = string
