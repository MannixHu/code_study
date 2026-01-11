import { vi } from "vitest";
/**
 * Tests for useLesson hooks
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useLesson,
  useCategorySelector,
  useLessonSelector,
  resetInitialized,
} from "./useLesson";

// Mock the store
vi.mock("../../../store", () => ({
  useLessonStore: vi.fn(),
}));

import { useLessonStore } from "../../../store";

const mockUseLessonStore = useLessonStore as unknown as jest.Mock;

describe("useLesson", () => {
  const mockCategory = {
    id: "jsx",
    name: "JSX 基础",
    icon: "📝",
    lessons: [
      {
        id: "1",
        title: "First Component",
        description: "Learn basics",
        difficulty: "easy",
      },
    ],
  };

  const mockLesson = mockCategory.lessons[0];

  const mockStoreState = {
    currentCategory: mockCategory,
    currentLesson: mockLesson,
    currentCategoryId: "jsx",
    currentLessonId: "1",
    loading: false,
    error: null,
    setCurrentCategoryId: vi.fn().mockResolvedValue(undefined),
    setCurrentLessonId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetInitialized(); // 重置模块级初始化状态
    mockUseLessonStore.mockReturnValue(mockStoreState);
  });

  describe("useLesson hook", () => {
    it("should return current category", () => {
      const { result } = renderHook(() => useLesson());

      expect(result.current.currentCategory).toEqual(mockCategory);
    });

    it("should return current lesson", () => {
      const { result } = renderHook(() => useLesson());

      expect(result.current.currentLesson).toEqual(mockLesson);
    });

    it("should return loading state", () => {
      const { result } = renderHook(() => useLesson());

      expect(result.current.loading).toBe(false);
    });

    it("should return error state", () => {
      const { result } = renderHook(() => useLesson());

      expect(result.current.error).toBeNull();
    });

    it("should return category id", () => {
      const { result } = renderHook(() => useLesson());

      expect(result.current.currentCategoryId).toBe("jsx");
    });

    it("should return lesson id", () => {
      const { result } = renderHook(() => useLesson());

      expect(result.current.currentLessonId).toBe("1");
    });

    it("should provide setCurrentCategory function", () => {
      const { result } = renderHook(() => useLesson());

      expect(typeof result.current.setCurrentCategory).toBe("function");
    });

    it("should provide setCurrentLesson function", () => {
      const { result } = renderHook(() => useLesson());

      expect(typeof result.current.setCurrentLesson).toBe("function");
    });

    it("should call setCurrentCategoryId on mount when category is null", async () => {
      // 当 category 为 null 时应该触发加载
      mockUseLessonStore.mockReturnValue({
        ...mockStoreState,
        currentCategory: null,
        currentLesson: null,
      });

      renderHook(() => useLesson());

      await waitFor(() => {
        expect(mockStoreState.setCurrentCategoryId).toHaveBeenCalledWith("jsx");
      });
    });

    it("should not call setCurrentCategoryId when category already exists", async () => {
      // 当 category 已存在时不应该再次加载
      renderHook(() => useLesson());

      await waitFor(() => {
        expect(mockStoreState.setCurrentCategoryId).not.toHaveBeenCalled();
      });
    });

    it("should not initialize twice on re-render", async () => {
      // 当 category 为 null 时触发加载，但只加载一次
      mockUseLessonStore.mockReturnValue({
        ...mockStoreState,
        currentCategory: null,
        currentLesson: null,
      });

      const { rerender } = renderHook(() => useLesson());

      rerender();
      rerender();

      await waitFor(() => {
        // Should only be called once due to module-level isInitialized
        expect(mockStoreState.setCurrentCategoryId).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle loading state", () => {
      mockUseLessonStore.mockReturnValue({
        ...mockStoreState,
        loading: true,
      });

      const { result } = renderHook(() => useLesson());

      expect(result.current.loading).toBe(true);
    });

    it("should handle error state", () => {
      mockUseLessonStore.mockReturnValue({
        ...mockStoreState,
        error: "Failed to load",
      });

      const { result } = renderHook(() => useLesson());

      expect(result.current.error).toBe("Failed to load");
    });

    it("should handle null category", () => {
      mockUseLessonStore.mockReturnValue({
        ...mockStoreState,
        currentCategory: null,
        currentLesson: null,
      });

      const { result } = renderHook(() => useLesson());

      expect(result.current.currentCategory).toBeNull();
      expect(result.current.currentLesson).toBeNull();
    });
  });

  describe("useCategorySelector hook", () => {
    it("should return current category id", () => {
      const { result } = renderHook(() => useCategorySelector());

      expect(result.current.currentCategoryId).toBe("jsx");
    });

    it("should return setCurrentCategoryId function", () => {
      const { result } = renderHook(() => useCategorySelector());

      expect(typeof result.current.setCurrentCategoryId).toBe("function");
    });

    it("should call setCurrentCategoryId when invoked", async () => {
      const { result } = renderHook(() => useCategorySelector());

      await act(async () => {
        await result.current.setCurrentCategoryId("components");
      });

      expect(mockStoreState.setCurrentCategoryId).toHaveBeenCalledWith(
        "components",
      );
    });
  });

  describe("useLessonSelector hook", () => {
    it("should return current lesson", () => {
      const { result } = renderHook(() => useLessonSelector());

      expect(result.current.currentLesson).toEqual(mockLesson);
    });

    it("should return current lesson id", () => {
      const { result } = renderHook(() => useLessonSelector());

      expect(result.current.currentLessonId).toBe("1");
    });

    it("should return setCurrentLessonId function", () => {
      const { result } = renderHook(() => useLessonSelector());

      expect(typeof result.current.setCurrentLessonId).toBe("function");
    });

    it("should call setCurrentLessonId when invoked", () => {
      const { result } = renderHook(() => useLessonSelector());

      act(() => {
        result.current.setCurrentLessonId("2");
      });

      expect(mockStoreState.setCurrentLessonId).toHaveBeenCalledWith("2");
    });
  });
});
