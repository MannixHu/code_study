import { vi, type MockedFunction } from "vitest";
/**
 * Integration tests for complete learning workflows
 * Tests end-to-end user scenarios across multiple components and features
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LearningPage from "../../features/lessons/components/LearningPage";
import type {
  Category,
  Lesson,
  TestCase,
  TestResult,
} from "../../features/lessons/types/lesson";

// Mock all dependencies
vi.mock("../../features/lessons/hooks/useLesson");
vi.mock("../../features/editor", () => ({
  useEditor: vi.fn(),
  useTestRunner: vi.fn(),
  CodeEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      data-testid="code-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));
vi.mock("../../features/progress", () => ({
  TestResults: ({
    results,
    isCorrect,
    isLoading,
  }: {
    results: TestResult[];
    isCorrect: boolean;
    isLoading: boolean;
  }) => (
    <div data-testid="test-results">
      {isLoading && <span data-testid="loading-tests">Loading...</span>}
      {!isLoading && isCorrect && (
        <span data-testid="all-passed">All tests passed!</span>
      )}
      {!isLoading && !isCorrect && (
        <span data-testid="some-failed">Some tests failed</span>
      )}
      {results.map((r, i) => (
        <div key={i} data-testid={`result-${i}`}>
          {r.description}: {r.passed ? "PASS" : "FAIL"}
        </div>
      ))}
    </div>
  ),
}));

import { useLesson } from "../../features/lessons/hooks/useLesson";
import { useEditor, useTestRunner } from "../../features/editor";

const mockUseLesson = useLesson as MockedFunction<typeof useLesson>;
const mockUseEditor = useEditor as MockedFunction<typeof useEditor>;
const mockUseTestRunner = useTestRunner as MockedFunction<typeof useTestRunner>;

describe("Learning Workflow Integration Tests", () => {
  const mockCategory: Category = {
    categoryId: "jsx",
    name: "JSX 基础",
    description: "Learn JSX basics",
    icon: "📝",
    order: 1,
    lessons: [],
  };

  const mockLesson: Lesson = {
    id: "lesson-1",
    title: "First Component",
    description: "Create your first React component",
    question: "Create a component that returns Hello",
    difficulty: "easy",
    estimatedTime: 10,
    tags: ["basics", "jsx"],
    starterCode: "// Write your code here",
    solution: "const Hello = () => <div>Hello</div>",
    testCases: [
      {
        type: "pattern",
        description: "Should render Hello",
        pattern: "Hello",
      },
    ] as TestCase[],
    hints: ["Use JSX syntax"],
  };

  const mockRunTests = vi.fn();
  const mockSaveCode = vi.fn();
  const mockResetCode = vi.fn();
  const mockSetUserCode = vi.fn();
  const mockSaveProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRunTests.mockResolvedValue(undefined);
    mockSaveCode.mockResolvedValue(undefined);
    mockResetCode.mockResolvedValue(undefined);

    mockUseLesson.mockReturnValue({
      currentCategory: mockCategory,
      currentLesson: mockLesson,
      currentCategoryId: "jsx",
      currentLessonId: "lesson-1",
      loading: false,
      error: null,
      setCurrentCategory: vi.fn(),
      setCurrentLesson: vi.fn(),
    });

    mockUseEditor.mockReturnValue({
      userCode: mockLesson.starterCode,
      isSaved: true,
      setUserCode: mockSetUserCode,
      resetCode: mockResetCode,
      loadSavedCode: vi.fn(),
      saveCode: mockSaveCode,
    });

    mockUseTestRunner.mockReturnValue({
      testResults: [],
      isCorrect: false,
      isRunningTests: false,
      runTests: mockRunTests,
      saveProgress: mockSaveProgress,
    });
  });

  describe("Complete TDD Workflow", () => {
    it("should complete full workflow with code reset and solution viewing", async () => {
      const user = userEvent.setup();

      mockUseTestRunner.mockReturnValue({
        testResults: [
          {
            description: "Test failed",
            passed: false,
            message: "Try again",
          },
        ],
        isCorrect: false,
        isRunningTests: false,
        runTests: mockRunTests,
        saveProgress: mockSaveProgress,
      });

      const { rerender } = render(<LearningPage />);

      // 1. Write some code
      const editor = screen.getByTestId("code-editor");
      await user.clear(editor);
      await user.type(editor, "const Test = () => null");

      expect(mockSetUserCode).toHaveBeenCalled();

      // 2. Run tests and see results
      const runButton = screen.getByRole("button", { name: /运行测试/ });
      await user.click(runButton);

      rerender(<LearningPage />);
      expect(screen.getByTestId("some-failed")).toBeInTheDocument();

      // 3. Reset code
      const resetButton = screen.getByRole("button", { name: /重置/ });
      await user.click(resetButton);

      expect(mockResetCode).toHaveBeenCalledWith(mockLesson.id);
      expect(mockSetUserCode).toHaveBeenCalledWith(mockLesson.starterCode);

      // 4. View solution
      const solutionButton = screen.getByRole("button", { name: /答案/ });
      await user.click(solutionButton);

      expect(mockSetUserCode).toHaveBeenCalledWith(mockLesson.solution);

      // 5. Save code
      const saveButton = screen.getByRole("button", { name: /保存/ });
      await user.click(saveButton);

      expect(mockSaveCode).toHaveBeenCalledWith(mockLesson.id);
    });

    it("should display test feedback after running tests", async () => {
      const user = userEvent.setup();

      // Start with no results
      mockUseTestRunner.mockReturnValue({
        testResults: [],
        isCorrect: false,
        isRunningTests: false,
        runTests: mockRunTests,
        saveProgress: mockSaveProgress,
      });

      const { rerender } = render(<LearningPage />);

      // Run tests
      const runButton = screen.getByRole("button", { name: /运行测试/ });
      await user.click(runButton);

      // Update mock to return results
      mockUseTestRunner.mockReturnValue({
        testResults: [
          { description: "Test 1", passed: false, message: "Failed" },
        ],
        isCorrect: false,
        isRunningTests: false,
        runTests: mockRunTests,
        saveProgress: mockSaveProgress,
      });

      rerender(<LearningPage />);

      // Verify results displayed
      expect(screen.getByTestId("test-results")).toBeInTheDocument();
      expect(screen.getByTestId("result-0")).toHaveTextContent("Test 1: FAIL");
    });
  });

  describe("Test Execution Workflow", () => {
    it("should show button state during test execution", async () => {
      const user = userEvent.setup();

      mockUseTestRunner.mockReturnValue({
        testResults: [],
        isCorrect: false,
        isRunningTests: false,
        runTests: mockRunTests,
        saveProgress: mockSaveProgress,
      });

      render(<LearningPage />);

      const runButton = screen.getByRole("button", { name: /运行测试/ });

      // Before click - button should be enabled
      expect(runButton).not.toBeDisabled();

      // Click run tests
      await user.click(runButton);

      await waitFor(() => {
        expect(mockRunTests).toHaveBeenCalled();
      });
    });

    it("should display test results after execution", async () => {
      const testResults: TestResult[] = [
        { description: "Test 1", passed: true },
        { description: "Test 2", passed: false, message: "Failed" },
        { description: "Test 3", passed: true },
      ];

      mockUseTestRunner.mockReturnValue({
        testResults,
        isCorrect: false,
        isRunningTests: false,
        runTests: mockRunTests,
        saveProgress: mockSaveProgress,
      });

      render(<LearningPage />);

      // Results should be displayed
      expect(screen.getByTestId("test-results")).toBeInTheDocument();
      expect(screen.getByTestId("result-0")).toHaveTextContent("Test 1: PASS");
      expect(screen.getByTestId("result-1")).toHaveTextContent("Test 2: FAIL");
      expect(screen.getByTestId("result-2")).toHaveTextContent("Test 3: PASS");
    });

    it("should display all passed state", async () => {
      mockUseTestRunner.mockReturnValue({
        testResults: [{ description: "Test 1", passed: true }],
        isCorrect: true,
        isRunningTests: false,
        runTests: mockRunTests,
        saveProgress: mockSaveProgress,
      });

      render(<LearningPage />);

      expect(screen.getByTestId("all-passed")).toBeInTheDocument();
    });
  });

  describe("Edge Cases and State Management", () => {
    it("should show loading state when lesson is loading", () => {
      mockUseLesson.mockReturnValue({
        currentCategory: null,
        currentLesson: null,
        currentCategoryId: "",
        currentLessonId: "",
        loading: true,
        error: null,
        setCurrentCategory: vi.fn(),
        setCurrentLesson: vi.fn(),
      });

      const { container } = render(<LearningPage />);

      expect(container.querySelector(".loading-state")).toBeInTheDocument();
    });

    it("should show loading state when lesson is null", () => {
      mockUseLesson.mockReturnValue({
        currentCategory: mockCategory,
        currentLesson: null,
        currentCategoryId: "jsx",
        currentLessonId: "",
        loading: false,
        error: null,
        setCurrentCategory: vi.fn(),
        setCurrentLesson: vi.fn(),
      });

      const { container } = render(<LearningPage />);

      expect(container.querySelector(".loading-state")).toBeInTheDocument();
    });

    it("should display placeholder when no test results yet", () => {
      mockUseTestRunner.mockReturnValue({
        testResults: [],
        isCorrect: false,
        isRunningTests: false,
        runTests: mockRunTests,
        saveProgress: mockSaveProgress,
      });

      render(<LearningPage />);

      expect(screen.getByText("运行测试查看结果")).toBeInTheDocument();
    });

    it("should update code editor when user types", async () => {
      const user = userEvent.setup();

      render(<LearningPage />);

      const editor = screen.getByTestId("code-editor");
      await user.clear(editor);
      await user.type(editor, "new code");

      expect(mockSetUserCode).toHaveBeenCalled();
    });

    it("should handle multiple button interactions", async () => {
      const user = userEvent.setup();

      render(<LearningPage />);

      const runButton = screen.getByRole("button", { name: /运行测试/ });
      const resetButton = screen.getByRole("button", { name: /重置/ });
      const saveButton = screen.getByRole("button", { name: /保存/ });

      // Click multiple buttons
      await user.click(runButton);
      await user.click(resetButton);
      await user.click(saveButton);

      // Should handle gracefully - component should still exist
      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
    });
  });
});
