/**
 * Progress Repository
 * 负责学习进度数据的持久化和查询
 * 封装 Dexie.js IndexedDB 操作
 */

import type { ProgressRepository } from '../../editor/types/service'
import type { ProgressV2 } from '../../../shared/db/dexie-db'
import {
  saveProgress as dbSaveProgress,
  getProgress as dbGetProgress,
  getAllProgress as dbGetAllProgress,
  getCategoryProgress as dbGetCategoryProgress,
  deleteProgress as dbDeleteProgress,
  clearAllProgress as dbClearAllProgress,
  clearCategoryProgress as dbClearCategoryProgress,
  getCategoryStats as dbGetCategoryStats,
  saveProgressBatch as dbSaveProgressBatch,
  isIndexedDBAvailable,
} from '../../../shared/db/dexie-db'

/**
 * Progress Repository 实现
 * 提供一致的接口来访问进度数据
 */
class ProgressRepositoryImpl implements ProgressRepository {
  private memoryCache = new Map<string, ProgressV2>()
  private isDatabaseAvailable = isIndexedDBAvailable()

  /**
   * 保存进度
   */
  async saveProgress(progress: ProgressV2): Promise<void> {
    try {
      // 1. 保存到内存缓存
      this.memoryCache.set(progress.lessonId, progress)

      // 2. 如果数据库可用，持久化到 IndexedDB
      if (this.isDatabaseAvailable) {
        await dbSaveProgress(progress)
      } else {
        console.warn('IndexedDB not available, progress saved to memory only')
      }
    } catch (error) {
      console.error('Failed to save progress:', error)
      // 内存缓存已保存，不抛出错误
    }
  }

  /**
   * 获取单个进度记录
   */
  async getProgress(lessonId: string): Promise<ProgressV2 | null> {
    try {
      // 1. 优先从内存缓存取
      const cached = this.memoryCache.get(lessonId)
      if (cached) {
        return cached
      }

      // 2. 如果数据库可用，从数据库读取
      if (this.isDatabaseAvailable) {
        const progress = await dbGetProgress(lessonId)
        if (progress) {
          // 3. 更新内存缓存
          this.memoryCache.set(lessonId, progress)
          return progress
        }
      }

      return null
    } catch (error) {
      console.error('Failed to get progress:', error)
      return null
    }
  }

  /**
   * 获取所有进度记录
   */
  async getAllProgress(): Promise<ProgressV2[]> {
    try {
      if (this.isDatabaseAvailable) {
        const progressList = await dbGetAllProgress()
        // 更新内存缓存
        progressList.forEach((p) => {
          this.memoryCache.set(p.lessonId, p)
        })
        return progressList
      }

      // 降级到内存缓存
      return Array.from(this.memoryCache.values())
    } catch (error) {
      console.error('Failed to get all progress:', error)
      return Array.from(this.memoryCache.values())
    }
  }

  /**
   * 获取指定分类的所有进度
   */
  async getProgressByCategory(categoryId: string): Promise<ProgressV2[]> {
    try {
      if (this.isDatabaseAvailable) {
        return await dbGetCategoryProgress(categoryId)
      }

      // 降级到内存缓存
      return Array.from(this.memoryCache.values()).filter((p) =>
        this.isCategoryMatch(p.lessonId, categoryId)
      )
    } catch (error) {
      console.error(`Failed to get progress for category ${categoryId}:`, error)
      return []
    }
  }

  /**
   * 删除单个进度记录
   */
  async deleteProgress(lessonId: string): Promise<void> {
    try {
      // 1. 从内存缓存删除
      this.memoryCache.delete(lessonId)

      // 2. 从数据库删除
      if (this.isDatabaseAvailable) {
        await dbDeleteProgress(lessonId)
      }
    } catch (error) {
      console.error('Failed to delete progress:', error)
    }
  }

  /**
   * 清除所有进度记录
   */
  async clearAllProgress(): Promise<void> {
    try {
      // 1. 清空内存缓存
      this.memoryCache.clear()

      // 2. 清空数据库
      if (this.isDatabaseAvailable) {
        await dbClearAllProgress()
      }
    } catch (error) {
      console.error('Failed to clear all progress:', error)
    }
  }

  /**
   * 清除指定分类的进度记录
   */
  async clearCategoryProgress(categoryId: string): Promise<void> {
    try {
      // 1. 从内存缓存删除该分类的所有项
      Array.from(this.memoryCache.keys()).forEach((lessonId) => {
        if (this.isCategoryMatch(lessonId, categoryId)) {
          this.memoryCache.delete(lessonId)
        }
      })

      // 2. 从数据库删除
      if (this.isDatabaseAvailable) {
        await dbClearCategoryProgress(categoryId)
      }
    } catch (error) {
      console.error(`Failed to clear progress for category ${categoryId}:`, error)
    }
  }

  /**
   * 批量保存进度
   */
  async saveProgressBatch(progressList: ProgressV2[]): Promise<void> {
    try {
      // 1. 更新内存缓存
      progressList.forEach((p) => {
        this.memoryCache.set(p.lessonId, p)
      })

      // 2. 批量保存到数据库
      if (this.isDatabaseAvailable) {
        await dbSaveProgressBatch(progressList)
      }
    } catch (error) {
      console.error('Failed to save progress batch:', error)
    }
  }

  /**
   * 获取分类统计信息（完成数/总数）
   */
  async getCategoryStats(categoryId: string): Promise<{ completed: number; total: number }> {
    try {
      if (this.isDatabaseAvailable) {
        return await dbGetCategoryStats(categoryId)
      }

      // 降级到内存缓存
      const progressList = Array.from(this.memoryCache.values()).filter((p) =>
        this.isCategoryMatch(p.lessonId, categoryId)
      )
      const completed = progressList.filter((p) => p.completed).length

      return { completed, total: progressList.length }
    } catch (error) {
      console.error(`Failed to get category stats for ${categoryId}:`, error)
      return { completed: 0, total: 0 }
    }
  }

  /**
   * 预热缓存：将所有进度加载到内存
   */
  async warmupCache(): Promise<void> {
    try {
      if (this.isDatabaseAvailable) {
        const progressList = await dbGetAllProgress()
        progressList.forEach((p) => {
          this.memoryCache.set(p.lessonId, p)
        })
      }
    } catch (error) {
      console.error('Failed to warmup cache:', error)
    }
  }

  /**
   * 检查分类是否匹配
   * lessonId 格式: "category-id-number" (例如: "jsx-basics-1")
   */
  private isCategoryMatch(lessonId: string, categoryId: string): boolean {
    // 方法1: 直接检查 lessonId 是否以 categoryId- 开头
    return lessonId.startsWith(categoryId + '-')
  }

  /**
   * 获取缓存统计信息（用于调试）
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.memoryCache.size,
      entries: Array.from(this.memoryCache.keys()),
    }
  }

  /**
   * 获取数据库可用状态
   */
  isDatabaseReady(): boolean {
    return this.isDatabaseAvailable
  }
}

/**
 * Repository 单例实例
 */
export const progressRepository = new ProgressRepositoryImpl()

/**
 * 导出类型给其他模块使用
 */
export type { ProgressRepository }
