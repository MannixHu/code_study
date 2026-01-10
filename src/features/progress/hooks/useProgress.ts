/**
 * useProgress Hook
 * 管理学习进度查询和统计
 */

import { useEffect, useState, useCallback } from 'react'
import { useProgressStore } from '../../../store'
import { progressService } from '../services/progress-service'
import type { StatisticsData } from '../../editor/types/service'

export interface UseProgressResult {
  completedLessonIds: Set<string>
  statistics: StatisticsData | null
  isLessonCompleted: (lessonId: string) => boolean
  loadStatistics: (categoryId?: string) => Promise<void>
  addCompletedLesson: (lessonId: string) => void
}

/**
 * 使用学习进度的 Hook
 */
export function useProgress(categoryId?: string): UseProgressResult {
  const { completedLessonIds, addCompletedLesson, setCompletedLessonIds } = useProgressStore()
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)

  // 判断课程是否已完成
  const isLessonCompleted = useCallback(
    (lessonId: string): boolean => {
      return completedLessonIds.has(lessonId)
    },
    [completedLessonIds]
  )

  // 加载统计数据
  const loadStatistics = useCallback(
    async (customCategoryId?: string) => {
      try {
        const result = await progressService.calculateStatistics(customCategoryId || categoryId)

        if (result.success) {
          setStatistics(result.data)
        } else {
          console.error('Failed to load statistics:', result.error)
        }
      } catch (error) {
        console.error('Error loading statistics:', error)
      }
    },
    [categoryId]
  )

  // 加载已完成的课程列表
  const loadCompletedLessons = useCallback(async () => {
    try {
      const result = await progressService.getCompletedLessons(categoryId)

      if (result.success) {
        setCompletedLessonIds(new Set(result.data))
      }
    } catch (error) {
      console.error('Error loading completed lessons:', error)
    }
  }, [categoryId, setCompletedLessonIds])

  // 在组件挂载时加载数据
  useEffect(() => {
    loadCompletedLessons()
    loadStatistics()
  }, [categoryId, loadCompletedLessons, loadStatistics])

  return {
    completedLessonIds,
    statistics,
    isLessonCompleted,
    loadStatistics,
    addCompletedLesson,
  }
}

/**
 * 使用完成度百分比的 Hook
 */
export function useCompletionRate(categoryId?: string) {
  const [rate, setRate] = useState(0)

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const result = await progressService.getCompletionPercentage(categoryId)

        if (result.success) {
          setRate(result.data)
        }
      } catch (error) {
        console.error('Error fetching completion rate:', error)
      }
    }

    fetchRate()
  }, [categoryId])

  return rate
}
