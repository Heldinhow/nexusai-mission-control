// Log types
export type LogLevel = 'debug' | 'info' | 'warning' | 'error'

export interface LogEntry {
  id: string
  timestamp: ISO8601Timestamp
  agentId: string
  taskId?: string
  level: LogLevel
  message: string
  context?: LogContext
  llmInteraction?: LLMInteractionDetails
}

export interface LogContext {
  function?: string
  file?: string
  line?: number
  correlationId?: string
  [key: string]: unknown
}

export interface LLMInteractionDetails {
  promptTokens: number
  responseTokens: number
  totalTokens: number
  model: string
  latencyMs: number
  costEstimate?: number
}

type ISO8601Timestamp = string
