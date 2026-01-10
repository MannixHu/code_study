/**
 * Unit Tests for Progress Service
 */

import { progressService } from './progress-service'
import { progressRepository } from '../repository/progress-repository'
import type { TestResult } from '../../lessons/types/lesson'
import type { ProgressV2 } from '../../../shared/db/dexie-db'

// Mock the progress repository
jest.mock('../repository/progress-repository')

const mockProgressRepository = progressRepository as jest.Mocked<typeof progressRepository>

describe('ProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('recordProgress', () => {
    it('should record progress for a new lesson', async () => {
      const testResults: TestResult[] = [
        { description: 'Test 1', passed: true },
        { description: 'Test 2', passed: true },
      ]

      mockProgressRepository.getProgress.mockResolvedValue(null)
      mockProgressRepository.saveProgress.mockResolvedValue(undefined)

      const result = await progressService.recordProgress('lesson-1', testResults, 'const App = () => {}')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.lessonId).toBe('lesson-1')
        expect(result.data.completed).toBe(true)
        expect(result.data.passedTests).toBe(2)
        expect(result.data.totalTests).toBe(2)
        expect(result.data.attempts).toBe(1)
      }
      expect(mockProgressRepository.saveProgress).toHaveBeenCalled()
    })

    it('should increment attempts for existing lesson', async () => {
      const testResults: TestResult[] = [
        { description: 'Test 1', passed: true },
      ]

      const existingProgress: ProgressV2 = {
        lessonId: 'lesson-1',
        completed: false,
        attempts: 3,
        lastAttempt: '2025-01-01T00:00:00.000Z',
        userCode: 'old code',
        passedTests: 0,
        totalTests: 1,
      }

      mockProgressRepository.getProgress.mockResolvedValue(existingProgress)
      mockProgressRepository.saveProgress.mockResolvedValue(undefined)

      const result = await progressService.recordProgress('lesson-1', testResults, 'new code')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.attempts).toBe(4) // Incremented from 3
      }
    })

    it('should handle partially passed tests', async () => {
      const testResults: TestResult[] = [
        { description: 'Test 1', passed: true },
        { description: 'Test 2', passed: false, message: 'Expected X but got Y' },
      ]

      mockProgressRepository.getProgress.mockResolvedValue(null)
      mockProgressRepository.saveProgress.mockResolvedValue(undefined)

      const result = await progressService.recordProgress('lesson-1', testResults, 'const App = () => {}')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.completed).toBe(false)
        expect(result.data.passedTests).toBe(1)
        expect(result.data.totalTests).toBe(2)
      }
    })

    it('should handle errors', async () => {
      const testResults: TestResult[] = []
      mockProgressRepository.getProgress.mockRejectedValue(new Error('Database error'))

      const result = await progressService.recordProgress('lesson-1', testResults, 'code')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('RECORD_PROGRESS_ERROR')
      }
    })
  })

  describe('getProgress', () => {
    it('should get progress for a lesson', async () => {
      const mockProgress: ProgressV2 = {
        lessonId: 'lesson-1',
        completed: true,
        attempts: 2,
        lastAttempt: '2025-01-10T00:00:00.000Z',
        userCode: 'const App = () => {}',
        passedTests: 2,
        totalTests: 2,
      }

      mockProgressRepository.getProgress.mockResolvedValue(mockProgress)

      const result = await progressService.getProgress('lesson-1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockProgress)
      }
    })

    it('should return null when progress does not exist', async () => {
      mockProgressRepository.getProgress.mockResolvedValue(null)

      const result = await progressService.getProgress('lesson-1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBeNull()
      }
    })

    it('should handle errors', async () => {
      mockProgressRepository.getProgress.mockRejectedValue(new Error('Database error'))

      const result = await progressService.getProgress('lesson-1')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('GET_PROGRESS_ERROR')
      }
    })
  })

  describe('calculateStatistics', () => {
    it('should calculate statistics for all lessons', async () => {
      const mockProgress: ProgressV2[] = [
        {
          lessonId: 'lesson-1',
          completed: true,
          attempts: 1,
          lastAttempt: '2025-01-10T00:00:00.000Z',
          userCode: 'code',
          passedTests: 2,
          totalTests: 2,
        },
        {
          lessonId: 'lesson-2',
          completed: false,
          attempts: 2,
          lastAttempt: '2025-01-10T00:00:00.000Z',
          userCode: 'code',
          passedTests: 1,
          totalTests: 2,
        },
      ]

      mockProgressRepository.getAllProgress.mockResolvedValue(mockProgress)

      const result = await progressService.calculateStatistics()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.totalLessons).toBe(2)
        expect(result.data.completedLessons).toBe(1)
        expect(result.data.completionRate).toBe(50)
        expect(result.data.averageScore).toBe(75) // (2+1)/(2+2) * 100
        expect(result.data.attempts).toBe(3) // 1 + 2
      }
    })

    it('should calculate statistics for specific category', async () => {
      const mockProgress: ProgressV2[] = [
        {
          lessonId: 'jsx-basics-1',
          completed: true,
          attempts: 1,
          lastAttempt: '2025-01-10T00:00:00.000Z',
          userCode: 'code',
          passedTests: 1,
          totalTests: 1,
        },
      ]

      mockProgressRepository.getProgressByCategory.mockResolvedValue(mockProgress)

      const result = await progressService.calculateStatistics('jsx-basics')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.totalLessons).toBe(1)
        expect(result.data.completedLessons).toBe(1)
        expect(result.data.completionRate).toBe(100)
      }
      expect(mockProgressRepository.getProgressByCategory).toHaveBeenCalledWith('jsx-basics')
    })

    it('should handle empty progress', async () => {
      mockProgressRepository.getAllProgress.mockResolvedValue([])

      const result = await progressService.calculateStatistics()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.totalLessons).toBe(0)
        expect(result.data.completedLessons).toBe(0)
        expect(result.data.completionRate).toBe(0)
        expect(result.data.averageScore).toBe(0)
      }
    })
  })

  describe('isLessonCompleted', () => {
    it('should return true for completed lesson', async () => {
      const mockProgress: ProgressV2 = {
        lessonId: 'lesson-1',
        completed: true,
        attempts: 1,
        lastAttempt: '2025-01-10T00:00:00.000Z',
        userCode: 'code',
        passedTests: 2,
        totalTests: 2,
      }

      mockProgressRepository.getProgress.mockResolvedValue(mockProgress)

      const result = await progressService.isLessonCompleted('lesson-1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(true)
      }
    })

    it('should return false for incomplete lesson', async () => {
      const mockProgress: ProgressV2 = {
        lessonId: 'lesson-1',
        completed: false,
        attempts: 1,
        lastAttempt: '2025-01-10T00:00:00.000Z',
        userCode: 'code',
        passedTests: 1,
        totalTests: 2,
      }

      mockProgressRepository.getProgress.mockResolvedValue(mockProgress)

      const result = await progressService.isLessonCompleted('lesson-1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(false)
      }
    })

    it('should return false when progress does not exist', async () => {
      mockProgressRepository.getProgress.mockResolvedValue(null)

      const result = await progressService.isLessonCompleted('lesson-1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(false)
      }
    })
  })

  describe('getCompletedLessons', () => {
    it('should return list of completed lesson IDs', async () => {
      const mockProgress: ProgressV2[] = [
        { lessonId: 'lesson-1', completed: true, attempts: 1, lastAttempt: '', userCode: '', passedTests: 1, totalTests: 1 },
        { lessonId: 'lesson-2', completed: false, attempts: 1, lastAttempt: '', userCode: '', passedTests: 0, totalTests: 1 },
        { lessonId: 'lesson-3', completed: true, attempts: 1, lastAttempt: '', userCode: '', passedTests: 1, totalTests: 1 },
      ]

      mockProgressRepository.getAllProgress.mockResolvedValue(mockProgress)

      const result = await progressService.getCompletedLessons()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(['lesson-1', 'lesson-3'])
      }
    })

    it('should filter by category', async () => {
      const mockProgress: ProgressV2[] = [
        { lessonId: 'jsx-1', completed: true, attempts: 1, lastAttempt: '', userCode: '', passedTests: 1, totalTests: 1 },
      ]

      mockProgressRepository.getProgressByCategory.mockResolvedValue(mockProgress)

      const result = await progressService.getCompletedLessons('jsx-basics')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(['jsx-1'])
      }
      expect(mockProgressRepository.getProgressByCategory).toHaveBeenCalledWith('jsx-basics')
    })
  })

  describe('clearProgress', () => {
    it('should clear progress for a lesson', async () => {
      mockProgressRepository.deleteProgress.mockResolvedValue(undefined)

      const result = await progressService.clearProgress('lesson-1')

      expect(result.success).toBe(true)
      expect(mockProgressRepository.deleteProgress).toHaveBeenCalledWith('lesson-1')
    })

    it('should handle errors', async () => {
      mockProgressRepository.deleteProgress.mockRejectedValue(new Error('Delete failed'))

      const result = await progressService.clearProgress('lesson-1')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('CLEAR_PROGRESS_ERROR')
      }
    })
  })

  describe('clearAllProgress', () => {
    it('should clear all progress', async () => {
      mockProgressRepository.clearAllProgress.mockResolvedValue(undefined)

      const result = await progressService.clearAllProgress()

      expect(result.success).toBe(true)
      expect(mockProgressRepository.clearAllProgress).toHaveBeenCalled()
    })
  })

  describe('warmupCache', () => {
    it('should warmup cache successfully', async () => {
      mockProgressRepository.warmupCache.mockResolvedValue(undefined)

      const result = await progressService.warmupCache()

      expect(result.success).toBe(true)
      expect(mockProgressRepository.warmupCache).toHaveBeenCalled()
    })

    it('should handle errors', async () => {
      mockProgressRepository.warmupCache.mockRejectedValue(new Error('Warmup failed'))

      const result = await progressService.warmupCache()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('WARMUP_CACHE_ERROR')
      }
    })
  })
})
