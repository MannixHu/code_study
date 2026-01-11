/**
 * useEditor Hook
 * 管理代码编辑器的状态和自动保存
 */

import { useEffect, useCallback, useRef } from "react";
import { useEditorStore } from "../../../store";
import { progressRepository } from "../../progress";

export interface UseEditorResult {
  userCode: string;
  isSaved: boolean;
  setUserCode: (code: string) => void;
  resetCode: (lessonId: string) => Promise<void>;
  loadSavedCode: (lessonId: string) => Promise<void>;
  saveCode: (lessonId: string) => Promise<void>;
}

/**
 * 使用编辑器的 Hook
 */
export function useEditor(
  lessonId: string,
  starterCode?: string,
): UseEditorResult {
  const {
    userCode,
    isSaved,
    setUserCode,
    resetCode,
    loadSavedCode,
    markAsSaved,
  } = useEditorStore();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 自动保存（防抖）
  useEffect(() => {
    if (!isSaved && userCode && lessonId) {
      // 清除之前的超时
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // 设置新的超时
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // 自动保存用户代码到 IndexedDB
          const progress = {
            lessonId,
            completed: false,
            attempts: 1,
            lastAttempt: new Date().toISOString(),
            userCode,
            passedTests: 0,
            totalTests: 0,
          };

          await progressRepository.saveProgress(progress);
          markAsSaved();
        } catch (error) {
          console.error("Failed to auto-save code:", error);
        }
      }, 1000); // 1 秒后自动保存
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [userCode, isSaved, lessonId, markAsSaved]);

  // 在课程加载时加载已保存的代码
  useEffect(() => {
    const loadCode = async () => {
      if (!lessonId) return;

      try {
        await loadSavedCode(lessonId);
      } catch (error) {
        console.warn("Failed to load saved code:", error);
      }

      // 获取最新的 userCode 状态
      const currentCode = useEditorStore.getState().userCode;
      // 如果没有已保存的代码，使用启动代码
      if (!currentCode && starterCode) {
        setUserCode(starterCode);
      }
    };

    loadCode();
  }, [lessonId, starterCode, loadSavedCode, setUserCode]);

  // 手动保存代码
  const saveCode = useCallback(
    async (customLessonId?: string) => {
      const targetLessonId = customLessonId || lessonId;

      try {
        const progress = {
          lessonId: targetLessonId,
          completed: false,
          attempts: 1,
          lastAttempt: new Date().toISOString(),
          userCode,
          passedTests: 0,
          totalTests: 0,
        };

        await progressRepository.saveProgress(progress);
        markAsSaved();
      } catch (error) {
        console.error("Failed to save code:", error);
        throw error;
      }
    },
    [lessonId, userCode, markAsSaved],
  );

  // 重置代码
  const handleResetCode = useCallback(
    async (customLessonId?: string) => {
      const targetLessonId = customLessonId || lessonId;

      try {
        await resetCode(targetLessonId);
      } catch (error) {
        console.error("Failed to reset code:", error);
        // 如果重置失败，使用启动代码
        if (starterCode) {
          setUserCode(starterCode);
        }
      }
    },
    [lessonId, starterCode, resetCode, setUserCode],
  );

  return {
    userCode,
    isSaved,
    setUserCode,
    resetCode: handleResetCode,
    loadSavedCode,
    saveCode,
  };
}

/**
 * 使用编辑器快捷键的 Hook
 */
export function useEditorShortcuts(onSave?: () => void, onSubmit?: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S 或 Cmd+S 保存
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        onSave?.();
      }

      // Ctrl+Enter 或 Cmd+Enter 提交
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        onSubmit?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSave, onSubmit]);
}
