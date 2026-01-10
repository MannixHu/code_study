/* eslint-disable react-hooks/exhaustive-deps */
/**
 * useLesson Hook
 * 管理课程加载和切换
 */

import { useEffect, useRef } from "react";
import { useLessonStore } from "../../../store";
import type { Category, Lesson } from "../types/lesson";

export interface UseLessonResult {
  currentCategory: Category | null;
  currentLesson: Lesson | null;
  currentCategoryId: string;
  currentLessonId: string;
  loading: boolean;
  error: string | null;
  setCurrentCategory: (categoryId: string) => Promise<void>;
  setCurrentLesson: (lessonId: string) => void;
}

/**
 * 使用课程数据的 Hook
 */
export function useLesson(): UseLessonResult {
  const initializedRef = useRef(false);
  const {
    currentCategory,
    currentLesson,
    currentCategoryId,
    currentLessonId,
    loading,
    error,
    setCurrentCategoryId,
    setCurrentLessonId,
  } = useLessonStore();

  // 在组件挂载时加载初始分类（仅一次）
  useEffect(() => {
    if (!initializedRef.current && !loading && currentCategoryId) {
      initializedRef.current = true;
      setCurrentCategoryId(currentCategoryId).catch((err) => {
        console.error("Failed to load initial category:", err);
      });
    }
  }, []);

  return {
    currentCategory,
    currentLesson,
    currentCategoryId,
    currentLessonId,
    loading,
    error,
    setCurrentCategory: setCurrentCategoryId,
    setCurrentLesson: setCurrentLessonId,
  };
}

/**
 * 使用分类选择器
 */
export function useCategorySelector() {
  const { currentCategoryId, setCurrentCategoryId } = useLessonStore();

  return {
    currentCategoryId,
    setCurrentCategoryId,
  };
}

/**
 * 使用课程选择器
 */
export function useLessonSelector() {
  const { currentLesson, currentLessonId, setCurrentLessonId } =
    useLessonStore();

  return {
    currentLesson,
    currentLessonId,
    setCurrentLessonId,
  };
}
