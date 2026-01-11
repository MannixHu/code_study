import { vi } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for LearningPage component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LearningPage from "./LearningPage";

// Mock the hooks
vi.mock("../hooks/useLesson");
vi.mock("../../editor", () => ({
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
vi.mock("../../progress", () => ({
  TestResults: ({
    results,
    isCorrect,
    isLoading,
  }: {
    results: any[];
    isCorrect: boolean;
    isLoading: boolean;
  }) => (
    <div data-testid="test-results">
      {isLoading && <span>Loading...</span>}
      {!isLoading && (
        <span>{isCorrect ? "All tests passed" : "Some tests failed"}</span>
      )}
      <span>Results: {results.length}</span>
    </div>
  ),
}));

// Import mocked modules
import { useLesson } from "../hooks/useLesson";
import { useEditor, useTestRunner } from "../../editor";

const mockUseLesson = useLesson as unknown as ReturnType<typeof vi.fn>;
const mockUseEditor = useEditor as unknown as ReturnType<typeof vi.fn>;
const mockUseTestRunner = useTestRunner as unknown as ReturnType<typeof vi.fn>;

describe("LearningPage", () => {
  const mockLesson = {
    id: "1",
    title: "First Component",
    description: "Learn to create your first React component",
    question: "Create a simple React component",
    difficulty: "easy",
    estimatedTime: 10,
    tags: ["basics", "jsx"],
    starterCode: "function App() {}",
    solution: "function App() { return <div>Hello</div> }",
    testCases: [{ type: "ast", description: "Should have function" }],
    hints: [],
  };

  const defaultEditorState = {
    userCode: "function App() {}",
    isSaved: true,
    setUserCode: vi.fn(),
    resetCode: vi.fn(),
    saveCode: vi.fn(),
  };

  const defaultTestRunnerState = {
    testResults: [],
    isRunningTests: false,
    isCorrect: false,
    runTests: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLesson.mockReturnValue({
      currentLesson: mockLesson,
      loading: false,
    });
    mockUseEditor.mockReturnValue(defaultEditorState);
    mockUseTestRunner.mockReturnValue(defaultTestRunnerState);
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      mockUseLesson.mockReturnValue({
        currentLesson: null,
        loading: true,
      });

      render(<LearningPage />);

      expect(
        screen.getByText("", { selector: ".ant-spin" }),
      ).toBeInTheDocument();
    });

    it("should show loading spinner when no lesson", () => {
      mockUseLesson.mockReturnValue({
        currentLesson: null,
        loading: false,
      });

      render(<LearningPage />);

      expect(
        screen.getByText("", { selector: ".ant-spin" }),
      ).toBeInTheDocument();
    });
  });

  describe("Rendering", () => {
    it("should render editor panel", () => {
      render(<LearningPage />);

      expect(screen.getByTestId("code-editor")).toBeInTheDocument();
    });

    it("should render bottom panel with test results area", () => {
      render(<LearningPage />);

      // 底部面板显示测试结果占位符
      expect(screen.getByText("运行测试查看结果")).toBeInTheDocument();
    });

    it("should show saved indicator when code is saved", () => {
      render(<LearningPage />);

      // 保存状态显示在保存按钮中
      expect(screen.getByText(/已保存/)).toBeInTheDocument();
    });

    it("should show save button without saved text when code is not saved", () => {
      mockUseEditor.mockReturnValue({
        ...defaultEditorState,
        isSaved: false,
      });

      render(<LearningPage />);

      // 未保存时按钮只显示 "保存"
      const saveButton = screen.getByRole("button", { name: /保存/ });
      expect(saveButton).toBeInTheDocument();
      // 已保存文字不应该出现在保存按钮中（而不是"已保存"）
      expect(saveButton.textContent).not.toContain("已保存");
    });

    it("should render control buttons", () => {
      render(<LearningPage />);

      expect(
        screen.getByRole("button", { name: /运行测试/ }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /重置/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /答案/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /保存/ })).toBeInTheDocument();
    });
  });

  describe("Test Results", () => {
    it("should show placeholder when no test results", () => {
      render(<LearningPage />);

      expect(screen.getByText("运行测试查看结果")).toBeInTheDocument();
    });

    it("should show test results when available", () => {
      mockUseTestRunner.mockReturnValue({
        ...defaultTestRunnerState,
        testResults: [{ description: "Test 1", passed: true }],
      });

      render(<LearningPage />);

      expect(screen.getByTestId("test-results")).toBeInTheDocument();
      expect(screen.getByText("Results: 1")).toBeInTheDocument();
    });

    it("should show correct message when tests pass", () => {
      mockUseTestRunner.mockReturnValue({
        ...defaultTestRunnerState,
        testResults: [{ description: "Test 1", passed: true }],
        isCorrect: true,
      });

      render(<LearningPage />);

      expect(screen.getByText("All tests passed")).toBeInTheDocument();
    });

    it("should show failed message when tests fail", () => {
      mockUseTestRunner.mockReturnValue({
        ...defaultTestRunnerState,
        testResults: [{ description: "Test 1", passed: false }],
        isCorrect: false,
      });

      render(<LearningPage />);

      expect(screen.getByText("Some tests failed")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call runTests when run button is clicked", async () => {
      const user = userEvent.setup();
      const runTests = vi.fn();
      mockUseTestRunner.mockReturnValue({
        ...defaultTestRunnerState,
        runTests,
      });

      render(<LearningPage />);

      await user.click(screen.getByRole("button", { name: /运行测试/ }));

      expect(runTests).toHaveBeenCalledWith(
        defaultEditorState.userCode,
        mockLesson.testCases,
      );
    });

    it("should disable run button when tests are running", () => {
      mockUseTestRunner.mockReturnValue({
        ...defaultTestRunnerState,
        isRunningTests: true,
      });

      render(<LearningPage />);

      const runButton = screen.getByRole("button", { name: "运行中..." });
      expect(runButton).toBeDisabled();
    });

    it("should call setUserCode with solution when view answer is clicked", async () => {
      const user = userEvent.setup();
      const setUserCode = vi.fn();
      mockUseEditor.mockReturnValue({
        ...defaultEditorState,
        setUserCode,
      });

      render(<LearningPage />);

      await user.click(screen.getByRole("button", { name: /答案/ }));

      expect(setUserCode).toHaveBeenCalledWith(mockLesson.solution);
    });

    it("should call resetCode and setUserCode when reset is clicked", async () => {
      const user = userEvent.setup();
      const resetCode = vi.fn().mockResolvedValue(undefined);
      const setUserCode = vi.fn();
      mockUseEditor.mockReturnValue({
        ...defaultEditorState,
        resetCode,
        setUserCode,
      });

      render(<LearningPage />);

      await user.click(screen.getByRole("button", { name: /重置/ }));

      expect(resetCode).toHaveBeenCalledWith(mockLesson.id);
      expect(setUserCode).toHaveBeenCalledWith(mockLesson.starterCode);
    });

    it("should call saveCode when save button is clicked", async () => {
      const user = userEvent.setup();
      const saveCode = vi.fn();
      mockUseEditor.mockReturnValue({
        ...defaultEditorState,
        saveCode,
      });

      render(<LearningPage />);

      await user.click(screen.getByRole("button", { name: /保存/ }));

      expect(saveCode).toHaveBeenCalledWith(mockLesson.id);
    });

    it("should update code when editor value changes", async () => {
      const user = userEvent.setup();
      const setUserCode = vi.fn();
      mockUseEditor.mockReturnValue({
        ...defaultEditorState,
        setUserCode,
      });

      render(<LearningPage />);

      const editor = screen.getByTestId("code-editor");
      await user.clear(editor);
      await user.type(editor, "new code");

      expect(setUserCode).toHaveBeenCalled();
    });
  });
});
