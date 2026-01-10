/* eslint-disable @typescript-eslint/no-explicit-any */
import Dexie from "dexie";
import type { Progress } from "../../features/lessons/types/lesson";

/**
 * Progress 扩展字段 (v2 schema)
 * 新增 categoryId 字段以支持按分类查询
 */
export interface ProgressV2 extends Progress {
  categoryId?: string;
}

/**
 * 定义数据库类 (v2)
 * 支持版本迁移和更好的索引策略
 */
export class LessonDB extends Dexie {
  progress!: Dexie.Table<ProgressV2, string>;

  constructor() {
    super("ReactLearningDB");

    // Version 1: 初始版本
    this.version(1).stores({
      progress: "lessonId, completed, lastAttempt",
    });

    // Version 2: 添加 categoryId 索引以优化分类查询
    this.version(2)
      .stores({
        progress: "lessonId, categoryId, completed, lastAttempt",
      })
      .upgrade(async (tx) => {
        // 从 lessonId 中提取 categoryId 并填充
        await tx
          .table("progress")
          .toCollection()
          .modify((progress: any) => {
            // lessonId 格式: "category-id" (例如: "jsx-basics-1")
            const parts = progress.lessonId.split("-");
            // 取除了最后一个数字的所有部分作为 categoryId
            progress.categoryId = parts.slice(0, -1).join("-");
          });
      });
  }
}

/**
 * 创建数据库实例 (全局单例)
 */
export const db = new LessonDB();

/**
 * 错误处理辅助函数
 */
function handleDBError(error: unknown): Error {
  if (error instanceof Dexie.DexieError) {
    return new Error(`Database Error: ${error.message}`);
  }
  return error instanceof Error ? error : new Error("Unknown error");
}

// ==================== CRUD 操作封装 ====================

/**
 * 保存或更新学习进度
 * @throws Error 如果保存失败
 */
export async function saveProgress(progress: ProgressV2): Promise<void> {
  try {
    // 如果没有 categoryId，从 lessonId 中提取
    if (!progress.categoryId) {
      const parts = progress.lessonId.split("-");
      progress.categoryId = parts.slice(0, -1).join("-");
    }
    await db.progress.put(progress);
  } catch (error) {
    throw handleDBError(error);
  }
}

/**
 * 获取指定课程的进度
 * @returns 进度数据或 undefined
 */
export async function getProgress(
  lessonId: string,
): Promise<ProgressV2 | undefined> {
  try {
    return await db.progress.get(lessonId);
  } catch (error) {
    throw handleDBError(error);
  }
}

/**
 * 获取所有学习进度
 * @returns 所有进度数据的数组
 */
export async function getAllProgress(): Promise<ProgressV2[]> {
  try {
    return await db.progress.toArray();
  } catch (error) {
    throw handleDBError(error);
  }
}

/**
 * 获取指定分类下已完成的课程数量 (使用新的 categoryId 索引)
 * @param categoryId 分类ID
 * @returns 已完成课程数
 */
export async function getCompletedCount(categoryId: string): Promise<number> {
  try {
    return await db.progress
      .where("categoryId")
      .equals(categoryId)
      .and((p) => p.completed)
      .count();
  } catch (error) {
    throw handleDBError(error);
  }
}

/**
 * 获取指定分类下的所有进度 (使用新的 categoryId 索引)
 * @param categoryId 分类ID
 * @returns 该分类下的所有进度
 */
export async function getCategoryProgress(
  categoryId: string,
): Promise<ProgressV2[]> {
  try {
    return await db.progress.where("categoryId").equals(categoryId).toArray();
  } catch (error) {
    throw handleDBError(error);
  }
}

/**
 * 删除指定课程的进度
 * @param lessonId 课程ID
 */
export async function deleteProgress(lessonId: string): Promise<void> {
  try {
    await db.progress.delete(lessonId);
  } catch (error) {
    throw handleDBError(error);
  }
}

/**
 * 清空所有进度（用于重置）
 * @throws Error 如果清空失败
 */
export async function clearAllProgress(): Promise<void> {
  try {
    await db.progress.clear();
  } catch (error) {
    throw handleDBError(error);
  }
}

/**
 * 清空指定分类的进度
 * @param categoryId 分类ID
 */
export async function clearCategoryProgress(categoryId: string): Promise<void> {
  try {
    await db.progress.where("categoryId").equals(categoryId).delete();
  } catch (error) {
    throw handleDBError(error);
  }
}

/**
 * 获取总完成数和总题数
 * @returns 完成数和总数
 */
export async function getOverallProgress(): Promise<{
  completed: number;
  total: number;
}> {
  try {
    const allProgress = await db.progress.toArray();
    const completed = allProgress.filter((p) => p.completed).length;
    return { completed, total: allProgress.length };
  } catch (error) {
    throw handleDBError(error);
  }
}

/**
 * 获取分类统计信息
 * @param categoryId 分类ID
 * @returns 该分类的完成数和总数
 */
export async function getCategoryStats(
  categoryId: string,
): Promise<{ completed: number; total: number }> {
  try {
    const progress = await getCategoryProgress(categoryId);
    const completed = progress.filter((p) => p.completed).length;
    return { completed, total: progress.length };
  } catch (error) {
    throw handleDBError(error);
  }
}

/**
 * 批量保存进度
 * @param progressList 进度列表
 */
export async function saveProgressBatch(
  progressList: ProgressV2[],
): Promise<void> {
  try {
    // 确保所有项都有 categoryId
    const items = progressList.map((progress) => ({
      ...progress,
      categoryId:
        progress.categoryId ||
        progress.lessonId.split("-").slice(0, -1).join("-"),
    }));
    await db.progress.bulkPut(items);
  } catch (error) {
    throw handleDBError(error);
  }
}

/**
 * 检查 IndexedDB 是否可用
 * @returns true 如果 IndexedDB 可用
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return !!window.indexedDB;
  } catch {
    return false;
  }
}
