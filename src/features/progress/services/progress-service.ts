/**
 * Progress Service
 * 学习进度管理和统计的业务逻辑层
 * 负责记录、查询和分析学习进度
 */

import type { TestResult, Progress } from '../../lessons/types/lesson'
import type { ProgressServiceAPI, StatisticsData, Result, ServiceError } from '../../editor/types/service'
import type { ProgressV2 } from '../../../shared/db/dexie-db'
import { progressRepository } from '../repository/progress-repository'

/**
 * Progress Service 实现
 */
class ProgressServiceImpl implements ProgressServiceAPI {
  /**
   * 记录课程进度
   */
  async recordProgress(
    lessonId: string,
    testResults: TestResult[],
    userCode: string
  ): Promise<Result<Progress, ServiceError>> {
    try {
      // 计算测试统计
      const passedTests = testResults.filter((r) => r.passed).length
      const totalTests = testResults.length
      const completed = passedTests === totalTests

      // 构建进度对象
      const progress: ProgressV2 = {
        lessonId,
        completed,
        attempts: 1,
        lastAttempt: new Date().toISOString(),
        userCode,
        passedTests,
        totalTests,
      }

      // 如果已有进度记录，获取并增加尝试次数
      const existingProgress = await progressRepository.getProgress(lessonId)
      if (existingProgress) {
        progress.attempts = (existingProgress.attempts || 0) + 1
      }

      // 保存进度
      await progressRepository.saveProgress(progress)

      return { success: true, data: progress }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RECORD_PROGRESS_ERROR',
          message: `Failed to record progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 获取单个课程的进度
   */
  async getProgress(lessonId: string): Promise<Result<Progress | null, ServiceError>> {
    try {
      const progress = await progressRepository.getProgress(lessonId)
      return { success: true, data: progress || null }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_PROGRESS_ERROR',
          message: `Failed to get progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 获取分类的统计信息
   */
  async calculateStatistics(categoryId?: string): Promise<Result<StatisticsData, ServiceError>> {
    try {
      let allProgress: ProgressV2[]

      if (categoryId) {
        // 获取指定分类的进度
        allProgress = await progressRepository.getProgressByCategory(categoryId)
      } else {
        // 获取所有进度
        allProgress = await progressRepository.getAllProgress()
      }

      const completedLessons = allProgress.filter((p) => p.completed).length
      const totalLessons = allProgress.length
      const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

      // 计算平均分
      const totalPassedTests = allProgress.reduce((sum, p) => sum + (p.passedTests || 0), 0)
      const totalTests = allProgress.reduce((sum, p) => sum + (p.totalTests || 0), 0)
      const averageScore = totalTests > 0 ? (totalPassedTests / totalTests) * 100 : 0

      // 累计尝试次数
      const totalAttempts = allProgress.reduce((sum, p) => sum + (p.attempts || 0), 0)

      const stats: StatisticsData = {
        totalLessons,
        completedLessons,
        completionRate: Math.round(completionRate * 100) / 100,
        attempts: totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        lastUpdated: new Date().toISOString(),
      }

      return { success: true, data: stats }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CALCULATE_STATISTICS_ERROR',
          message: `Failed to calculate statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 获取所有进度记录
   */
  async getAllProgress(): Promise<Result<Progress[], ServiceError>> {
    try {
      const progress = await progressRepository.getAllProgress()
      return { success: true, data: progress }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_ALL_PROGRESS_ERROR',
          message: `Failed to get all progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 清除单个课程的进度
   */
  async clearProgress(lessonId: string): Promise<Result<void, ServiceError>> {
    try {
      await progressRepository.deleteProgress(lessonId)
      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEAR_PROGRESS_ERROR',
          message: `Failed to clear progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 清除分类的所有进度
   */
  async clearCategoryProgress(categoryId: string): Promise<Result<void, ServiceError>> {
    try {
      await progressRepository.clearCategoryProgress(categoryId)
      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEAR_CATEGORY_PROGRESS_ERROR',
          message: `Failed to clear category progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 清除所有进度
   */
  async clearAllProgress(): Promise<Result<void, ServiceError>> {
    try {
      await progressRepository.clearAllProgress()
      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEAR_ALL_PROGRESS_ERROR',
          message: `Failed to clear all progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 获取完成情况（百分比）
   */
  async getCompletionPercentage(categoryId?: string): Promise<Result<number, ServiceError>> {
    try {
      const statsResult = await this.calculateStatistics(categoryId)

      if (!statsResult.success) {
        return statsResult as Result<never, ServiceError>
      }

      return { success: true, data: statsResult.data.completionRate }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_COMPLETION_ERROR',
          message: `Failed to get completion percentage: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 检查课程是否已完成
   */
  async isLessonCompleted(lessonId: string): Promise<Result<boolean, ServiceError>> {
    try {
      const progress = await progressRepository.getProgress(lessonId)
      const isCompleted = progress?.completed ?? false
      return { success: true, data: isCompleted }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CHECK_COMPLETION_ERROR',
          message: `Failed to check lesson completion: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 获取已完成的课程列表
   */
  async getCompletedLessons(categoryId?: string): Promise<Result<string[], ServiceError>> {
    try {
      let allProgress: ProgressV2[]

      if (categoryId) {
        allProgress = await progressRepository.getProgressByCategory(categoryId)
      } else {
        allProgress = await progressRepository.getAllProgress()
      }

      const completedLessonIds = allProgress
        .filter((p) => p.completed)
        .map((p) => p.lessonId)

      return { success: true, data: completedLessonIds }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_COMPLETED_LESSONS_ERROR',
          message: `Failed to get completed lessons: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 预热缓存：将所有进度加载到内存
   */
  async warmupCache(): Promise<Result<void, ServiceError>> {
    try {
      await progressRepository.warmupCache()
      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WARMUP_CACHE_ERROR',
          message: `Failed to warmup cache: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }
}

/**
 * Service 单例实例
 */
export const progressService = new ProgressServiceImpl()

/**
 * 导出接口供其他模块使用
 */
export type { ProgressServiceAPI }
