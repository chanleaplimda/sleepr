export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface PaginatedData<T> {
  items: T[]
  pagination: PaginationMeta
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

export interface ApiErrorDetails {
  code: string
  details?: any
}

export interface ApiErrorResponse {
  success: false
  message: string
  error: ApiErrorDetails
}
