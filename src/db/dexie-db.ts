import Dexie, { Table } from 'dexie'
import { Progress } from '../types/lesson'

// 定义数据库类
export class LessonDB extends Dexie {
  progress!: Table<Progress, string>

  constructor() {
    super('ReactLearningDB')

    // 定义数据库 schema
    this.version(1).stores({
      progress: 'lessonId, completed, lastAttempt'
    })
  }
}

// 创建数据库实例
export const db = new LessonDB()

// CRUD 操作封装

/**
 * 保存或更新学习进度
 */
export async function saveProgress(progress: Progress): Promise<void> {
  await db.progress.put(progress)
}

/**
 * 获取指定课程的进度
 */
export async function getProgress(lessonId: string): Promise<Progress | undefined> {
  return await db.progress.get(lessonId)
}

/**
 * 获取所有学习进度
 */
export async function getAllProgress(): Promise<Progress[]> {
  return await db.progress.toArray()
}

/**
 * 获取指定分类下已完成的课程数量
 */
export async function getCompletedCount(categoryId: string): Promise<number> {
  const count = await db.progress
    .filter(p => p.lessonId.startsWith(categoryId) && p.completed)
    .count()
  return count
}

/**
 * 获取指定分类下的所有进度
 */
export async function getCategoryProgress(categoryId: string): Promise<Progress[]> {
  return await db.progress
    .filter(p => p.lessonId.startsWith(categoryId))
    .toArray()
}

/**
 * 删除指定课程的进度
 */
export async function deleteProgress(lessonId: string): Promise<void> {
  await db.progress.delete(lessonId)
}

/**
 * 清空所有进度（用于重置）
 */
export async function clearAllProgress(): Promise<void> {
  await db.progress.clear()
}

/**
 * 获取总完成数和总题数
 */
export async function getOverallProgress(): Promise<{ completed: number; total: number }> {
  const allProgress = await db.progress.toArray()
  const completed = allProgress.filter(p => p.completed).length
  return { completed, total: allProgress.length }
}
