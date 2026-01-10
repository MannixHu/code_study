/**
 * useTestRunner Hook
 * 管理测试执行和结果
 */

import { useCallback } from 'react'
import { useProgressStore, useEditorStore } from '../../../store'
import { testService } from '../services/test-service'
import { progressService } from '../../progress'
import type { TestCase, TestResult } from '../../lessons/types/lesson'

export interface UseTestRunnerResult {
  testResults: TestResult[]
  isRunningTests: boolean
  isCorrect: boolean
  runTests: (code: string, testCases: TestCase[]) => Promise<void>
  saveProgress: (lessonId: string) => Promise<boolean>
}

/**
 * 使用测试运行器的 Hook
 */
export function useTestRunner(lessonId: string): UseTestRunnerResult {
  const { testResults, isRunningTests, setTestResults, setIsRunningTests, addCompletedLesson } =
    useProgressStore()
  const { userCode } = useEditorStore()

  // 判断是否全部通过
  const isCorrect = testResults.length > 0 && testResults.every((r) => r.passed)

  // 运行测试
  const runTests = useCallback(
    async (code: string, testCases: TestCase[]) => {
      setIsRunningTests(true)

      try {
        const result = await testService.runTests(code, testCases)

        if (result.success) {
          setTestResults(result.data)
        } else {
          setTestResults([
            {
              description: 'Test execution failed',
              passed: false,
              message: result.error.message,
            },
          ])
        }
      } catch (error) {
        console.error('Error running tests:', error)
        setTestResults([
          {
            description: 'Unexpected error',
            passed: false,
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        ])
      } finally {
        setIsRunningTests(false)
      }
    },
    [setTestResults, setIsRunningTests]
  )

  // 保存进度
  const saveProgress = useCallback(
    async (customLessonId?: string): Promise<boolean> => {
      const targetLessonId = customLessonId || lessonId

      try {
        const result = await progressService.recordProgress(targetLessonId, testResults, userCode)

        if (result.success) {
          if (result.data.completed) {
            addCompletedLesson(targetLessonId)
          }
          return result.data.completed
        }

        return false
      } catch (error) {
        console.error('Error saving progress:', error)
        return false
      }
    },
    [lessonId, testResults, userCode, addCompletedLesson]
  )

  return {
    testResults,
    isRunningTests,
    isCorrect,
    runTests,
    saveProgress,
  }
}
