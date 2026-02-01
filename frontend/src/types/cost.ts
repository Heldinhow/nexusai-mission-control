// Cost types
export type ConsumptionPeriod = 'realtime' | '1min' | '5min' | '15min' | '1hour' | '1day'

export interface TokenConsumption {
  agentId: string
  timestamp: ISO8601Timestamp
  period: ConsumptionPeriod
  inputTokens: number
  outputTokens: number
  totalTokens: number
  costEstimateUsd: number
  model: string
  taskCount: number
}

export interface HierarchicalCost {
  agentId: string
  directCost: TokenConsumption
  childrenCost: TokenConsumption[]
  totalCost: TokenConsumption
  childCount: number
  depth: number
}

export interface CostThreshold {
  agentId: string
  dailyBudgetUsd: number
  currentSpendUsd: number
  percentUsed: number
  status: 'ok' | 'warning' | 'critical'
  projectedOverrun?: number
}

export interface CostFilter {
  minCostUsd?: number
  maxCostUsd?: number
  aboveThreshold?: boolean
  period?: ConsumptionPeriod
}

type ISO8601Timestamp = string
