/**
 * @module shared/types
 * @description Global type definitions
 */

// Note: Most types are in their respective feature directories
// This file holds only cross-feature types

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export type ServiceResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }
