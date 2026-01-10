/**
 * Store 类型定义
 * 为 Zustand 状态管理定义的所有类型
 */

import type { Category, Lesson, Progress, TestResult, CategoryMeta } from './lesson'

// ==================== Lesson Store ====================

export interface LessonState {
  // 状态
  currentCategoryId: string
  currentCategory: Category | null
  categories: CategoryMeta[]
  currentLessonId: string
  currentLesson: Lesson | null
  loading: boolean
  error: string | null
}

export interface LessonActions {
  setCurrentCategoryId(categoryId: string): Promise<void>
  setCurrentCategory(category: Category): void
  setCategories(categories: CategoryMeta[]): void
  setCurrentLessonId(lessonId: string): void
  setCurrentLesson(lesson: Lesson): void
  setLoading(loading: boolean): void
  setError(error: string | null): void
  preloadCategory(categoryId: string): void
}

export type LessonStore = LessonState & LessonActions

// ==================== Editor Store ====================

export interface EditorState {
  userCode: string
  isSaved: boolean
  lastSavedCode: string
}

export interface EditorActions {
  setUserCode(code: string): void
  resetCode(lessonId: string): void
  loadSavedCode(lessonId: string): Promise<void>
  markAsSaved(): void
}

export type EditorStore = EditorState & EditorActions

// ==================== Progress Store ====================

export interface ProgressState {
  completedLessonIds: Set<string>
  testResults: TestResult[]
  isRunningTests: boolean
  currentProgress: Progress | null
}

export interface ProgressActions {
  setCompletedLessonIds(ids: Set<string>): void
  addCompletedLesson(lessonId: string): void
  setTestResults(results: TestResult[]): void
  setIsRunningTests(running: boolean): void
  setCurrentProgress(progress: Progress | null): void
  runTests(code: string, lessonId: string): Promise<void>
  saveProgress(lessonId: string, passed: boolean): Promise<void>
}

export type ProgressStore = ProgressState & ProgressActions

// ==================== UI Store ====================

export type EditorLayout = 'vertical' | 'horizontal'

export interface UIState {
  showHint: boolean
  hintIndex: number
  sidebarVisible: boolean
  editorLayout: EditorLayout
  theme: 'light' | 'dark'
}

export interface UIActions {
  setShowHint(show: boolean): void
  nextHint(maxHints: number): void
  resetHint(): void
  toggleSidebar(): void
  setEditorLayout(layout: EditorLayout): void
  toggleTheme(): void
}

export type UIStore = UIState & UIActions

// ==================== Root Store ====================

export interface RootStore {
  lesson: LessonStore
  editor: EditorStore
  progress: ProgressStore
  ui: UIStore
}

// ==================== Result Type (for Service layer) ====================

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

export interface ServiceError {
  code: string
  message: string
  details?: unknown
}
