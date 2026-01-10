/**
 * Service 层类型定义
 * 业务逻辑层的返回类型和数据结构
 */

import type { Category, Lesson, Progress, TestResult, CategoryMeta } from './lesson'
import type { Result, ServiceError } from './store'

// ==================== Lesson Service ====================

export interface LessonServiceAPI {
  loadCategory(categoryId: string): Promise<Result<Category, ServiceError>>
  getCategoryStats(categoryId: string): Promise<Result<CategoryMeta, ServiceError>>
  getAllCategoryMetadata(): Promise<Result<CategoryMeta[], ServiceError>>
  preloadNextCategory(currentCategoryId: string): Promise<void>
  getLesson(categoryId: string, lessonId: string): Promise<Result<Lesson, ServiceError>>
}

// ==================== Test Service ====================

export interface TestMetrics {
  passed: number
  failed: number
  total: number
  passRate: number
}

export interface CodeAnalysisResult {
  hasErrors: boolean
  errors: string[]
  warnings: string[]
  metrics?: Record<string, unknown>
}

export interface TestServiceAPI {
  runTests(
    code: string,
    testCases: import('./lesson').TestCase[]
  ): Promise<Result<TestResult[], ServiceError>>

  validateCode(code: string): Promise<Result<CodeAnalysisResult, ServiceError>>

  analyzeCodeQuality(code: string): Promise<Result<Record<string, unknown>, ServiceError>>
}

// ==================== Progress Service ====================

export interface StatisticsData {
  totalLessons: number
  completedLessons: number
  completionRate: number
  attempts: number
  averageScore: number
  lastUpdated: string
}

export interface ProgressServiceAPI {
  recordProgress(
    lessonId: string,
    testResults: TestResult[],
    userCode: string
  ): Promise<Result<Progress, ServiceError>>

  getProgress(lessonId: string): Promise<Result<Progress | null, ServiceError>>

  calculateStatistics(categoryId?: string): Promise<Result<StatisticsData, ServiceError>>

  getAllProgress(): Promise<Result<Progress[], ServiceError>>

  clearProgress(lessonId: string): Promise<Result<void, ServiceError>>
}

// ==================== Code Analyzer Service ====================

export interface ASTContext {
  hasFunctionDeclaration: boolean
  functionNames: string[]
  hasReturnStatement: boolean
  isJSXElement: boolean
  jsxElementName?: string
  hasJSX: boolean
  jsxElements: string[]
  usesUseState: boolean
  usesUseEffect: boolean
  [key: string]: unknown
}

export interface CodeAnalyzerAPI {
  parseCode(code: string): Promise<Result<ASTContext, ServiceError>>

  evaluateChecker(code: string, checker: string): Promise<Result<boolean, ServiceError>>

  parseAsync(code: string): Promise<Result<ASTContext, ServiceError>>
}

// ==================== Repository Interfaces ====================

export interface LessonRepository {
  loadCategory(categoryId: string): Promise<Category | null>
  loadLesson(categoryId: string, lessonId: string): Promise<Lesson | null>
  getCachedCategory(categoryId: string): Category | null
  clearCache(categoryId?: string): void
  setCache(categoryId: string, category: Category): void
}

export interface ProgressRepository {
  saveProgress(progress: Progress): Promise<void>
  getProgress(lessonId: string): Promise<Progress | null>
  getAllProgress(): Promise<Progress[]>
  getProgressByCategory(categoryId: string): Promise<Progress[]>
  deleteProgress(lessonId: string): Promise<void>
  clearAllProgress(): Promise<void>
}

// ==================== Worker Messages ====================

export interface ASTWorkerRequest {
  type: 'parse' | 'evaluate'
  id: string
  code?: string
  checker?: string
}

export interface ASTWorkerResponse {
  type: 'success' | 'error'
  id: string
  result?: ASTContext
  passed?: boolean
  error?: string
}
