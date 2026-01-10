/**
 * Progress Store
 * 使用 Zustand 管理学习进度和测试结果
 */

import { create } from 'zustand'
import type { ProgressStore } from '../types/store'
import type { TestResult } from '../types/lesson'
import { progressService } from '../services'

export const useProgressStore = create<ProgressStore>((set, get) => ({
  // 初始状态
  completedLessonIds: new Set<string>(),
  testResults: [],
  isRunningTests: false,
  currentProgress: null,

  // 设置已完成的课程 IDs
  setCompletedLessonIds: (ids: Set<string>) => {
    set({ completedLessonIds: ids })
  },

  // 添加已完成的课程
  addCompletedLesson: (lessonId: string) => {
    set((state) => {
      const newIds = new Set(state.completedLessonIds)
      newIds.add(lessonId)
      return { completedLessonIds: newIds }
    })
  },

  // 设置测试结果
  setTestResults: (results: TestResult[]) => {
    set({ testResults: results })
  },

  // 设置是否正在运行测试
  setIsRunningTests: (running: boolean) => {
    set({ isRunningTests: running })
  },

  // 设置当前进度
  setCurrentProgress: (progress) => {
    set({ currentProgress: progress })
  },

  // 运行测试
  runTests: async (_code: string, lessonId: string) => {
    set({ isRunningTests: true })
    try {
      // 这个方法会在实际使用时由 useTestRunner hook 调用
      // 这里只是设置状态，实际测试逻辑在 hook 中处理
      console.log('Running tests for lesson:', lessonId)
    } finally {
      set({ isRunningTests: false })
    }
  },

  // 保存进度
  saveProgress: async (lessonId: string, passed: boolean) => {
    try {
      const testResults = get().testResults
      const userCode = '' // 这个应该从 editorStore 获取

      const result = await progressService.recordProgress(lessonId, testResults, userCode)

      if (result.success) {
        set((state) => {
          const newIds = new Set(state.completedLessonIds)
          if (passed) {
            newIds.add(lessonId)
          }
          return {
            completedLessonIds: newIds,
            currentProgress: result.data,
          }
        })
      }
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  },
}))
