/**
 * useHint Hook
 * Manages hint state and provides hint functionality
 */

import { useState, useCallback, useMemo } from "react";
import { hintService } from "../services/hint-service";
import type { AIHint, HintLevel, HintContext } from "../types/hint";
import type { Lesson, TestResult } from "../../lessons/types/lesson";

export interface UseHintOptions {
  lesson: Lesson;
  userCode: string;
  testResults: TestResult[];
}

export interface UseHintResult {
  // State
  currentHint: AIHint | null;
  hintHistory: AIHint[];
  isLoading: boolean;
  error: string | null;
  currentLevel: HintLevel;
  maxLevel: HintLevel;

  // Actions
  requestHint: () => Promise<void>;
  resetHints: () => void;
  canRequestHint: boolean;
  isAIEnabled: boolean;
}

/**
 * Hook for managing hints in a lesson
 */
export function useHint({
  lesson,
  userCode,
  testResults,
}: UseHintOptions): UseHintResult {
  const [currentHint, setCurrentHint] = useState<AIHint | null>(null);
  const [hintHistory, setHintHistory] = useState<AIHint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<HintLevel>(1);

  const maxLevel: HintLevel = 3;
  const isAIEnabled = hintService.isAIAvailable();

  // Check if user can request more hints
  const canRequestHint = useMemo(() => {
    return currentLevel <= maxLevel && !isLoading;
  }, [currentLevel, isLoading]);

  // Request a hint
  const requestHint = useCallback(async () => {
    if (!canRequestHint) return;

    setIsLoading(true);
    setError(null);

    try {
      const context: HintContext = {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        question: lesson.question,
        description: lesson.description,
        userCode,
        starterCode: lesson.starterCode,
        solution: lesson.solution,
        staticHints: lesson.hints,
        testResults,
        previousHints: hintHistory.map((h) => h.content),
        hintLevel: currentLevel,
      };

      const result = await hintService.getHint(context);

      if (result.success && result.hint) {
        setCurrentHint(result.hint);
        setHintHistory((prev) => [...prev, result.hint!]);

        // Increment level for next hint request
        if (currentLevel < maxLevel) {
          setCurrentLevel((prev) => (prev + 1) as HintLevel);
        }
      } else {
        setError(result.error || "无法获取提示");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取提示时发生错误");
    } finally {
      setIsLoading(false);
    }
  }, [
    canRequestHint,
    lesson,
    userCode,
    testResults,
    hintHistory,
    currentLevel,
  ]);

  // Reset hints
  const resetHints = useCallback(() => {
    setCurrentHint(null);
    setHintHistory([]);
    setCurrentLevel(1);
    setError(null);
    hintService.clearHistory(lesson.id);
  }, [lesson.id]);

  return {
    currentHint,
    hintHistory,
    isLoading,
    error,
    currentLevel,
    maxLevel,
    requestHint,
    resetHints,
    canRequestHint,
    isAIEnabled,
  };
}
