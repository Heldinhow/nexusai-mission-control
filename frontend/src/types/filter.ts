// Filter types
import type { AgentStatus } from './agent'
import type { TaskStatus } from './task'
import type { ConsumptionPeriod } from './cost'

export interface AgentFilter {
  status?: AgentStatus[]
  hasParent?: boolean | null
  hasActiveTask?: boolean
  createdAfter?: ISO8601Timestamp
  createdBefore?: ISO8601Timestamp
  searchText?: string
  suspiciousOnly?: boolean
}

export interface TaskFilter {
  status?: TaskStatus[]
  agentId?: string
  createdAfter?: ISO8601Timestamp
  createdBefore?: ISO8601Timestamp
  completedAfter?: ISO8601Timestamp
  completedBefore?: ISO8601Timestamp
  stuckInPending?: boolean
  searchText?: string
}

export interface CombinedFilter {
  agents?: AgentFilter
  tasks?: TaskFilter
  costs?: CostFilter
  graph?: GraphFilter
  sortBy?: SortOption
  sortOrder?: 'asc' | 'desc'
  pagination?: PaginationParams
}

export interface CostFilter {
  minCostUsd?: number
  maxCostUsd?: number
  aboveThreshold?: boolean
  period?: ConsumptionPeriod
}

export interface GraphFilter {
  rootAgentId?: string
  maxDepth?: number
  showInactive?: boolean
  expandByDefault?: boolean
}

export interface PaginationParams {
  page: number
  pageSize: number
  cursor?: string
}

export type SortOption =
  | 'name'
  | 'createdAt'
  | 'lastActivityAt'
  | 'status'
  | 'costUsd'
  | 'tokenCount'
  | 'taskCount'

type ISO8601Timestamp = string
