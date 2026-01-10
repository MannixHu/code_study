/**
 * Lesson Service
 * 课程加载和管理的业务逻辑层
 * 封装 Repository 和业务规则
 */

import type { Category, Lesson, CategoryMeta } from '../types/lesson'
import type { LessonServiceAPI, Result, ServiceError } from '../types/service'
import { lessonRepository } from '../repository'

/**
 * Lesson Service 实现
 */
class LessonServiceImpl implements LessonServiceAPI {
  /**
   * 加载分类及其所有课程
   */
  async loadCategory(categoryId: string): Promise<Result<Category, ServiceError>> {
    try {
      const category = await lessonRepository.loadCategory(categoryId)

      if (!category) {
        return {
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: `Category '${categoryId}' not found`,
          },
        }
      }

      return { success: true, data: category }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LOAD_CATEGORY_ERROR',
          message: `Failed to load category: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 获取分类元数据（用于导航）
   * 需要从 Repository 加载完整分类以获取统计信息
   */
  async getCategoryStats(categoryId: string): Promise<Result<CategoryMeta, ServiceError>> {
    try {
      const category = await lessonRepository.loadCategory(categoryId)

      if (!category) {
        return {
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: `Category '${categoryId}' not found`,
          },
        }
      }

      const meta: CategoryMeta = {
        id: category.categoryId,
        name: category.name,
        icon: category.icon,
        total: category.lessons.length,
        completed: 0, // 需要从 Progress Repository 获取
      }

      return { success: true, data: meta }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_CATEGORY_STATS_ERROR',
          message: `Failed to get category stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 获取所有分类的元数据
   * 这是一个静态配置，不需要从网络加载
   */
  async getAllCategoryMetadata(): Promise<Result<CategoryMeta[], ServiceError>> {
    try {
      const categoryIds = [
        'jsx-basics',
        'components',
        'props',
        'state',
        'events',
        'conditional',
        'lists',
        'forms',
        'effects',
        'refs',
        'optimization',
        'custom-hooks',
        'context',
        'typescript-basics',
        'typescript-advanced',
      ]

      const metaList: CategoryMeta[] = []

      for (const categoryId of categoryIds) {
        const result = await this.getCategoryStats(categoryId)
        if (result.success) {
          metaList.push(result.data)
        }
      }

      return { success: true, data: metaList }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_ALL_METADATA_ERROR',
          message: `Failed to get all category metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 预加载下一个分类
   * 不阻塞主线程，静默处理错误
   */
  async preloadNextCategory(currentCategoryId: string): Promise<void> {
    try {
      await lessonRepository.preloadNextCategory(currentCategoryId)
    } catch (error) {
      // 预加载失败不应该影响用户体验
      console.warn('Failed to preload next category:', error)
    }
  }

  /**
   * 预加载相邻分类（前后）
   */
  async preloadAdjacentCategories(currentCategoryId: string): Promise<void> {
    try {
      await lessonRepository.preloadAdjacentCategories(currentCategoryId)
    } catch (error) {
      console.warn('Failed to preload adjacent categories:', error)
    }
  }

  /**
   * 获取单个课程
   */
  async getLesson(
    categoryId: string,
    lessonId: string
  ): Promise<Result<Lesson, ServiceError>> {
    try {
      const lesson = await lessonRepository.loadLesson(categoryId, lessonId)

      if (!lesson) {
        return {
          success: false,
          error: {
            code: 'LESSON_NOT_FOUND',
            message: `Lesson '${lessonId}' not found in category '${categoryId}'`,
          },
        }
      }

      return { success: true, data: lesson }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LOAD_LESSON_ERROR',
          message: `Failed to load lesson: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 清除课程缓存（用于刷新）
   */
  async clearCache(categoryId?: string): Promise<void> {
    lessonRepository.clearCache(categoryId)
  }
}

/**
 * Service 单例实例
 */
export const lessonService = new LessonServiceImpl()

/**
 * 导出接口供其他模块使用
 */
export type { LessonServiceAPI }
