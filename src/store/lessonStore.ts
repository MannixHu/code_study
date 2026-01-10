/**
 * Lesson Store
 * 使用 Zustand 管理课程相关的全局状态
 */

import { create } from 'zustand'
import type { LessonStore } from '../types/store'
import type { Category, CategoryMeta, Lesson } from '../types/lesson'
import { lessonService } from '../services'

export const useLessonStore = create<LessonStore>((set, get) => ({
  // 初始状态
  currentCategoryId: 'jsx-basics',
  currentCategory: null,
  categories: [],
  currentLessonId: '',
  currentLesson: null,
  loading: false,
  error: null,

  // 设置当前分类 ID 并加载分类数据
  setCurrentCategoryId: async (categoryId: string) => {
    set({ loading: true, error: null })
    try {
      const result = await lessonService.loadCategory(categoryId)
      if (result.success) {
        set({
          currentCategoryId: categoryId,
          currentCategory: result.data,
          loading: false,
        })
        // 预加载下一个分类
        lessonService.preloadNextCategory(categoryId).catch(() => {})
      } else {
        set({
          error: result.error.message,
          loading: false,
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },

  // 直接设置分类对象
  setCurrentCategory: (category: Category) => {
    set({
      currentCategory: category,
      currentCategoryId: category.categoryId,
    })
  },

  // 设置分类元数据列表
  setCategories: (categories: CategoryMeta[]) => {
    set({ categories })
  },

  // 设置当前课程 ID
  setCurrentLessonId: (lessonId: string) => {
    const category = get().currentCategory
    if (category) {
      const lesson = category.lessons.find((l) => l.id === lessonId)
      if (lesson) {
        set({
          currentLessonId: lessonId,
          currentLesson: lesson,
        })
      }
    }
  },

  // 直接设置课程对象
  setCurrentLesson: (lesson: Lesson) => {
    set({
      currentLesson: lesson,
      currentLessonId: lesson.id,
    })
  },

  // 设置加载状态
  setLoading: (loading: boolean) => {
    set({ loading })
  },

  // 设置错误信息
  setError: (error: string | null) => {
    set({ error })
  },

  // 预加载分类
  preloadCategory: async (categoryId: string) => {
    await lessonService.preloadNextCategory(categoryId).catch(() => {})
  },
}))
