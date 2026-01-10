/**
 * Lesson Repository
 * 负责课程数据的加载、缓存和管理
 * 实现了多层缓存策略：内存缓存 + 版本控制
 */

import type { Category, Lesson } from '../types/lesson'
import type { LessonRepository } from '../../editor/types/service'

/**
 * 缓存项的元数据
 */
interface CacheEntry {
  data: Category
  timestamp: number
  version: string
}

/**
 * Lesson Repository 实现
 */
class LessonRepositoryImpl implements LessonRepository {
  private readonly LESSON_BASE_URL = '/lessons/'
  private readonly CACHE_DURATION = 1000 * 60 * 60 // 1 hour
  private readonly memoryCache = new Map<string, CacheEntry>()
  private cacheVersion = '1.0.0'

  /**
   * 加载分类数据
   * 优先级: 内存缓存 > 网络 > 错误处理
   */
  async loadCategory(categoryId: string): Promise<Category | null> {
    try {
      // 1. 检查内存缓存
      const cached = this.getCachedCategory(categoryId)
      if (cached) {
        return cached
      }

      // 2. 从网络加载
      const category = await this.fetchCategory(categoryId)
      if (category) {
        // 3. 更新内存缓存
        this.setCache(categoryId, category)
      }

      return category
    } catch (error) {
      console.error(`Failed to load category ${categoryId}:`, error)
      return null
    }
  }

  /**
   * 加载特定课程
   */
  async loadLesson(categoryId: string, lessonId: string): Promise<Lesson | null> {
    try {
      const category = await this.loadCategory(categoryId)
      if (!category) {
        return null
      }

      const lesson = category.lessons.find((l) => l.id === lessonId)
      return lesson || null
    } catch (error) {
      console.error(`Failed to load lesson ${lessonId}:`, error)
      return null
    }
  }

  /**
   * 从内存缓存中获取分类
   */
  getCachedCategory(categoryId: string): Category | null {
    const entry = this.memoryCache.get(categoryId)

    if (!entry) {
      return null
    }

    // 检查缓存是否过期
    const isExpired = Date.now() - entry.timestamp > this.CACHE_DURATION
    if (isExpired) {
      this.memoryCache.delete(categoryId)
      return null
    }

    // 检查缓存版本是否匹配
    if (entry.version !== this.cacheVersion) {
      this.memoryCache.delete(categoryId)
      return null
    }

    return entry.data
  }

  /**
   * 设置内存缓存
   */
  setCache(categoryId: string, category: Category): void {
    this.memoryCache.set(categoryId, {
      data: category,
      timestamp: Date.now(),
      version: this.cacheVersion,
    })
  }

  /**
   * 清除缓存
   * @param categoryId 如果提供，只清除该分类的缓存；否则清除所有缓存
   */
  clearCache(categoryId?: string): void {
    if (categoryId) {
      this.memoryCache.delete(categoryId)
    } else {
      this.memoryCache.clear()
    }
  }

  /**
   * 从网络获取分类数据
   */
  private async fetchCategory(categoryId: string): Promise<Category | null> {
    try {
      const response = await fetch(`${this.LESSON_BASE_URL}${categoryId}.json`)

      if (!response.ok) {
        console.error(`Failed to fetch category ${categoryId}: HTTP ${response.status}`)
        return null
      }

      const data = await response.json()

      // 验证数据结构
      if (!this.isValidCategory(data)) {
        console.error(`Invalid category data for ${categoryId}`)
        return null
      }

      return data
    } catch (error) {
      console.error(`Network error loading category ${categoryId}:`, error)
      return null
    }
  }

  /**
   * 验证分类数据结构
   */
  private isValidCategory(data: unknown): data is Category {
    if (typeof data !== 'object' || data === null) {
      return false
    }

    const cat = data as Record<string, unknown>

    return (
      typeof cat.categoryId === 'string' &&
      typeof cat.name === 'string' &&
      typeof cat.description === 'string' &&
      typeof cat.icon === 'string' &&
      typeof cat.order === 'number' &&
      Array.isArray(cat.lessons)
    )
  }

  /**
   * 预加载下一个分类
   * 不阻塞主线程，在后台加载
   */
  async preloadNextCategory(categoryId: string): Promise<void> {
    const allCategories = [
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

    const currentIndex = allCategories.indexOf(categoryId)
    if (currentIndex >= 0 && currentIndex < allCategories.length - 1) {
      const nextCategory = allCategories[currentIndex + 1]
      // 后台预加载，不等待
      this.loadCategory(nextCategory).catch(() => {
        // 预加载失败是可以接受的，不需要抛出错误
      })
    }
  }

  /**
   * 预加载前后相邻的分类
   */
  async preloadAdjacentCategories(categoryId: string): Promise<void> {
    const allCategories = [
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

    const currentIndex = allCategories.indexOf(categoryId)

    // 预加载前一个分类
    if (currentIndex > 0) {
      const prevCategory = allCategories[currentIndex - 1]
      this.loadCategory(prevCategory).catch(() => {})
    }

    // 预加载后一个分类
    if (currentIndex < allCategories.length - 1) {
      const nextCategory = allCategories[currentIndex + 1]
      this.loadCategory(nextCategory).catch(() => {})
    }
  }

  /**
   * 获取缓存统计信息 (用于调试)
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.memoryCache.size,
      entries: Array.from(this.memoryCache.keys()),
    }
  }

  /**
   * 设置缓存版本（用于缓存失效）
   */
  setCacheVersion(version: string): void {
    this.cacheVersion = version
    // 当版本改变时，清除所有旧缓存
    this.clearCache()
  }
}

/**
 * Repository 单例实例
 */
export const lessonRepository = new LessonRepositoryImpl()

/**
 * 导出类型给其他模块使用
 */
export type { LessonRepository }
