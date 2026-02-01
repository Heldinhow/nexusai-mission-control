// Kill switch types
export interface KillEvent {
  id: string
  targetAgentId: string
  operator: OperatorInfo
  timestamp: ISO8601Timestamp
  reason: KillReason
  cascade: CascadeInfo
  result: KillResult
  auditHash: string
}

export interface OperatorInfo {
  userId: string
  sessionId: string
  ipAddress: string
  authMethod: string
}

export type KillReason =
  | { type: 'infinite_loop'; description: string; detectedAt: ISO8601Timestamp }
  | { type: 'excessive_cost'; threshold: number; currentSpend: number }
  | { type: 'manual'; explanation: string }
  | { type: 'system'; reason: string }

export interface CascadeInfo {
  childAgentIds: string[]
  cascadeDepth: number
  strategy: 'graceful_then_force'
  gracefulTimeoutMs: number
  forceTimeoutMs: number
}

export interface KillResult {
  status: 'success' | 'partial' | 'failed'
  terminatedAgents: string[]
  failedAgents: FailedKill[]
  elapsedMs: number
  completedAt: ISO8601Timestamp
}

export interface FailedKill {
  agentId: string
  reason: string
  errorCode?: string
  retryAttempts: number
}

export interface KillSwitchRequest {
  targetAgentId: string
  reason: KillReason
  confirmation: {
    method: 'type_to_confirm'
    typedValue: string
  }
  cascade: boolean
  forceImmediate: boolean
}

type ISO8601Timestamp = string
