import { vi, type Mocked } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for useTestRunner hook
 */

import { renderHook, act } from "@testing-library/react";
import { useTestRunner } from "./useTestRunner";

// Mock the store
vi.mock("../../../store", () => ({
  useProgressStore: vi.fn(),
  useEditorStore: vi.fn(),
}));

// Mock the services
vi.mock("../services/test-service", () => ({
  testService: {
    runTests: vi.fn(),
  },
}));

vi.mock("../../progress", () => ({
  progressService: {
    recordProgress: vi.fn(),
  },
}));

import { useProgressStore, useEditorStore } from "../../../store";
import { testService } from "../services/test-service";
import { progressService } from "../../progress";

const mockUseProgressStore = useProgressStore as unknown as ReturnType<
  typeof vi.fn
>;
const mockUseEditorStore = useEditorStore as unknown as ReturnType<
  typeof vi.fn
>;
const mockTestService = testService as Mocked<typeof testService>;
const mockProgressService = progressService as Mocked<typeof progressService>;

describe("useTestRunner", () => {
  const mockTestResults = [
    { description: "Test 1", passed: true },
    { description: "Test 2", passed: true },
  ];

  const mockProgressState = {
    testResults: [],
    isRunningTests: false,
    setTestResults: vi.fn(),
    setIsRunningTests: vi.fn(),
    addCompletedLesson: vi.fn(),
  };

  const mockEditorState = {
    userCode: "function test() {}",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProgressStore.mockReturnValue(mockProgressState);
    mockUseEditorStore.mockReturnValue(mockEditorState);
  });

  describe("Initial State", () => {
    it("should return empty test results initially", () => {
      const { result } = renderHook(() => useTestRunner("lesson-1"));

      expect(result.current.testResults).toEqual([]);
    });

    it("should not be running tests initially", () => {
      const { result } = renderHook(() => useTestRunner("lesson-1"));

      expect(result.current.isRunningTests).toBe(false);
    });

    it("should not be correct when no results", () => {
      const { result } = renderHook(() => useTestRunner("lesson-1"));

      expect(result.current.isCorrect).toBe(false);
    });

    it("should provide runTests function", () => {
      const { result } = renderHook(() => useTestRunner("lesson-1"));

      expect(typeof result.current.runTests).toBe("function");
    });

    it("should provide saveProgress function", () => {
      const { result } = renderHook(() => useTestRunner("lesson-1"));

      expect(typeof result.current.saveProgress).toBe("function");
    });
  });

  describe("isCorrect calculation", () => {
    it("should be false when no results", () => {
      mockUseProgressStore.mockReturnValue({
        ...mockProgressState,
        testResults: [],
      });

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      expect(result.current.isCorrect).toBe(false);
    });

    it("should be true when all tests pass", () => {
      mockUseProgressStore.mockReturnValue({
        ...mockProgressState,
        testResults: [
          { description: "Test 1", passed: true },
          { description: "Test 2", passed: true },
        ],
      });

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      expect(result.current.isCorrect).toBe(true);
    });

    it("should be false when some tests fail", () => {
      mockUseProgressStore.mockReturnValue({
        ...mockProgressState,
        testResults: [
          { description: "Test 1", passed: true },
          { description: "Test 2", passed: false },
        ],
      });

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      expect(result.current.isCorrect).toBe(false);
    });

    it("should be false when all tests fail", () => {
      mockUseProgressStore.mockReturnValue({
        ...mockProgressState,
        testResults: [
          { description: "Test 1", passed: false },
          { description: "Test 2", passed: false },
        ],
      });

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      expect(result.current.isCorrect).toBe(false);
    });
  });

  describe("runTests", () => {
    const testCases = [
      { type: "ast" as const, description: "Should have function" },
    ];

    it("should set isRunningTests to true when running", async () => {
      mockTestService.runTests.mockResolvedValue({
        success: true,
        data: mockTestResults,
      });

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      await act(async () => {
        await result.current.runTests("code", testCases);
      });

      expect(mockProgressState.setIsRunningTests).toHaveBeenCalledWith(true);
    });

    it("should set isRunningTests to false after tests complete", async () => {
      mockTestService.runTests.mockResolvedValue({
        success: true,
        data: mockTestResults,
      });

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      await act(async () => {
        await result.current.runTests("code", testCases);
      });

      expect(mockProgressState.setIsRunningTests).toHaveBeenLastCalledWith(
        false,
      );
    });

    it("should set test results on success", async () => {
      mockTestService.runTests.mockResolvedValue({
        success: true,
        data: mockTestResults,
      });

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      await act(async () => {
        await result.current.runTests("code", testCases);
      });

      expect(mockProgressState.setTestResults).toHaveBeenCalledWith(
        mockTestResults,
      );
    });

    it("should set error result on service failure", async () => {
      mockTestService.runTests.mockResolvedValue({
        success: false,
        error: { code: "TEST_ERROR", message: "Test failed" },
      });

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      await act(async () => {
        await result.current.runTests("code", testCases);
      });

      expect(mockProgressState.setTestResults).toHaveBeenCalledWith([
        {
          description: "Test execution failed",
          passed: false,
          message: "Test failed",
        },
      ]);
    });

    it("should handle unexpected errors", async () => {
      mockTestService.runTests.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      await act(async () => {
        await result.current.runTests("code", testCases);
      });

      expect(mockProgressState.setTestResults).toHaveBeenCalledWith([
        {
          description: "Unexpected error",
          passed: false,
          message: "Network error",
        },
      ]);
    });
  });

  describe("saveProgress", () => {
    beforeEach(() => {
      mockUseProgressStore.mockReturnValue({
        ...mockProgressState,
        testResults: mockTestResults,
      });
    });

    it("should call progressService.recordProgress", async () => {
      mockProgressService.recordProgress.mockResolvedValue({
        success: true,
        data: { completed: true },
      } as any);

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      await act(async () => {
        await result.current.saveProgress("lesson-1");
      });

      expect(mockProgressService.recordProgress).toHaveBeenCalledWith(
        "lesson-1",
        mockTestResults,
        mockEditorState.userCode,
      );
    });

    it("should return true when lesson completed", async () => {
      mockProgressService.recordProgress.mockResolvedValue({
        success: true,
        data: { completed: true },
      } as any);

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      let completed: boolean;
      await act(async () => {
        completed = await result.current.saveProgress("lesson-1");
      });

      expect(completed!).toBe(true);
    });

    it("should return false when lesson not completed", async () => {
      mockProgressService.recordProgress.mockResolvedValue({
        success: true,
        data: { completed: false },
      } as any);

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      let completed: boolean;
      await act(async () => {
        completed = await result.current.saveProgress("lesson-1");
      });

      expect(completed!).toBe(false);
    });

    it("should add completed lesson when completed", async () => {
      mockProgressService.recordProgress.mockResolvedValue({
        success: true,
        data: { completed: true },
      } as any);

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      await act(async () => {
        await result.current.saveProgress("lesson-1");
      });

      expect(mockProgressState.addCompletedLesson).toHaveBeenCalledWith(
        "lesson-1",
      );
    });

    it("should not add completed lesson when not completed", async () => {
      mockProgressService.recordProgress.mockResolvedValue({
        success: true,
        data: { completed: false },
      } as any);

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      await act(async () => {
        await result.current.saveProgress("lesson-1");
      });

      expect(mockProgressState.addCompletedLesson).not.toHaveBeenCalled();
    });

    it("should return false on service error", async () => {
      mockProgressService.recordProgress.mockResolvedValue({
        success: false,
        error: { code: "ERROR", message: "Failed" },
      });

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      let completed: boolean;
      await act(async () => {
        completed = await result.current.saveProgress("lesson-1");
      });

      expect(completed!).toBe(false);
    });

    it("should return false on exception", async () => {
      mockProgressService.recordProgress.mockRejectedValue(
        new Error("Network error"),
      );

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      let completed: boolean;
      await act(async () => {
        completed = await result.current.saveProgress("lesson-1");
      });

      expect(completed!).toBe(false);
    });

    it("should use provided lessonId over hook lessonId", async () => {
      mockProgressService.recordProgress.mockResolvedValue({
        success: true,
        data: { completed: true },
      } as any);

      const { result } = renderHook(() => useTestRunner("lesson-1"));

      await act(async () => {
        await result.current.saveProgress("lesson-2");
      });

      expect(mockProgressService.recordProgress).toHaveBeenCalledWith(
        "lesson-2",
        mockTestResults,
        mockEditorState.userCode,
      );
    });
  });
});
