/**
 * @module shared/types/store
 * @description Store type definitions
 */

import type { Category, CategoryMeta, Lesson } from '../../features/lessons/types/lesson'
import type { TestResult } from '../../features/lessons/types/lesson'

export interface LessonStore {
  currentCategoryId: string
  currentCategory: Category | null
  categories: CategoryMeta[]
  currentLessonId: string
  currentLesson: Lesson | null
  loading: boolean
  error: string | null
  setCurrentCategoryId: (categoryId: string) => Promise<void>
  setCurrentCategory: (category: Category) => void
  setCategories: (categories: CategoryMeta[]) => void
  setCurrentLessonId: (lessonId: string) => void
  setCurrentLesson: (lesson: Lesson) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  preloadCategory: (categoryId: string) => Promise<void>
}

export interface ProgressStore {
  completedLessonIds: Set<string>
  testResults: TestResult[]
  isRunningTests: boolean
  currentProgress: any
  setCompletedLessonIds: (ids: Set<string>) => void
  setTestResults: (results: TestResult[]) => void
  setIsRunningTests: (is: boolean) => void
  setCurrentProgress: (progress: any) => void
}

export interface EditorStore {
  userCode: string
  isAnalyzing: boolean
  analysisResults: any
  setUserCode: (code: string) => void
  setIsAnalyzing: (is: boolean) => void
  setAnalysisResults: (results: any) => void
}

export interface UiStore {
  sidebarVisible: boolean
  setSidebarVisible: (visible: boolean) => void
  showHint?: boolean
  hintIndex?: number
  setShowHint?: (show: boolean) => void
  setHintIndex?: (index: number) => void
  theme?: string
  editorLayout?: any
  setEditorLayout?: (layout: any) => void
  setTheme?: (theme: string) => void
}
