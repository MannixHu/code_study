/**
 * @module features/lessons
 * @description Lesson feature - 课程管理、选择、展示
 */

export { default as LessonSelector } from './components/LessonSelector'
export { default as CategoryTabs } from './components/CategoryTabs'
export { default as LearningPage } from './components/LearningPage'

export { useLesson } from './hooks/useLesson'

export { lessonService } from './services/lesson-service'

export type { Lesson, Category, CategoryMeta, Progress, TestResult } from './types/lesson'
