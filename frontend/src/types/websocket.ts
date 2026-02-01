// WebSocket message types
import type { AgentStatus } from './agent'
import type { TaskStatus } from './task'
import type { KillReason } from './kill-switch'
import type { TokenConsumption } from './cost'

export type WebSocketMessage =
  | AgentStateChangeMessage
  | TaskTransitionMessage
  | AgentSpawnedMessage
  | AgentKilledMessage
  | CostUpdateMessage
  | PingPongMessage

export interface AgentStateChangeMessage {
  type: 'agent.state_change'
  timestamp: ISO8601Timestamp
  agentId: string
  previousStatus: AgentStatus
  currentStatus: AgentStatus
  taskId?: string
  metadata?: Record<string, unknown>
}

export interface TaskTransitionMessage {
  type: 'task.transition'
  timestamp: ISO8601Timestamp
  taskId: string
  agentId: string
  previousStatus: TaskStatus
  currentStatus: TaskStatus
  transitionDurationMs?: number
}

export interface AgentSpawnedMessage {
  type: 'agent.spawned'
  timestamp: ISO8601Timestamp
  agentId: string
  parentAgentId: string
  taskId: string
  initialStatus: AgentStatus
}

export interface AgentKilledMessage {
  type: 'agent.killed'
  timestamp: ISO8601Timestamp
  agentId: string
  killEventId: string
  reason: KillReason
  cascadeCount: number
}

export interface CostUpdateMessage {
  type: 'cost.update'
  timestamp: ISO8601Timestamp
  agentId: string
  consumption: TokenConsumption
  hierarchicalTotal?: TokenConsumption
}

export interface PingPongMessage {
  type: 'ping' | 'pong'
  timestamp: ISO8601Timestamp
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting'

export interface ConnectionState {
  status: ConnectionStatus
  lastConnectedAt?: ISO8601Timestamp
  lastDisconnectedAt?: ISO8601Timestamp
  reconnectAttempts: number
  latencyMs?: number
}

type ISO8601Timestamp = string
