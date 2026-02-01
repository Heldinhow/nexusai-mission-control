// API response types
export interface ApiResponse<T> {
  data: T
  meta?: {
    page?: number
    pageSize?: number
    total?: number
    hasMore?: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: ISO8601Timestamp
}

export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

type ISO8601Timestamp = string
