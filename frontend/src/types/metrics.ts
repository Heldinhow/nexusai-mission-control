// System metrics types
import type { AgentStatus } from './agent'
import type { TaskStatus } from './task'
import type { KillReason } from './kill-switch'

export interface SystemMetrics {
  timestamp: ISO8601Timestamp
  agents: AgentMetrics
  tasks: TaskMetrics
  costs: CostMetrics
  kills: KillMetrics
  performance: PerformanceMetrics
}

export interface AgentMetrics {
  total: number
  byStatus: Record<AgentStatus, number>
  withActiveTasks: number
  rootAgents: number
  averageUptimeMinutes: number
}

export interface TaskMetrics {
  total: number
  byStatus: Record<TaskStatus, number>
  completedLastHour: number
  completedLast24Hours: number
  failedLast24Hours: number
  averageCompletionTimeMinutes: number
  stuckInPending: number
}

export interface CostMetrics {
  totalTokensLastHour: number
  totalCostUsdLastHour: number
  totalTokensLast24Hours: number
  totalCostUsdLast24Hours: number
  averageCostPerTask: number
  topSpenders: TopSpender[]
}

export interface TopSpender {
  agentId: string
  costUsd: number
  tokenCount: number
  taskCount: number
}

export interface KillMetrics {
  totalKillsLast24Hours: number
  byReason: Record<KillReason['type'], number>
  cascadeKills: number
  failedKills: number
}

export interface PerformanceMetrics {
  apiLatencyMs: number
  websocketConnected: boolean
  lastUpdateAt: ISO8601Timestamp
  dataFreshnessMs: number
}

type ISO8601Timestamp = string
