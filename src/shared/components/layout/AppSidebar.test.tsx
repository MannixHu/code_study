import { vi } from "vitest";
/**
 * Tests for AppSidebar component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppSidebar from "./AppSidebar";

// Mock the hooks
vi.mock("../../../features/lessons", () => ({
  useLesson: vi.fn(),
}));

vi.mock("../../../features/progress", () => ({
  useProgress: vi.fn(),
}));

vi.mock("../../../store", () => ({
  useUIStore: vi.fn(),
}));

// Import mocked modules
import { useLesson } from "../../../features/lessons";
import { useProgress } from "../../../features/progress";
import { useUIStore } from "../../../store";

const mockUseLesson = useLesson as unknown as jest.Mock;
const mockUseProgress = useProgress as unknown as jest.Mock;
const mockUseUIStore = useUIStore as unknown as jest.Mock;

describe("AppSidebar", () => {
  const mockCategory = {
    id: "jsx",
    name: "JSX 基础",
    icon: "📝",
    lessons: [
      {
        id: "1",
        title: "First Component",
        description: "Learn to create your first React component",
        question: "Create a simple React component",
        difficulty: "easy",
        estimatedTime: 10,
        tags: ["basics", "jsx"],
        hints: ["Use function declaration", "Return JSX"],
      },
      {
        id: "2",
        title: "Props and State",
        description: "Understanding React props and state",
        question: "Use props and state in a component",
        difficulty: "medium",
        estimatedTime: 15,
        tags: ["props", "state"],
        hints: ["Define props interface", "Use useState"],
      },
      {
        id: "3",
        title: "Advanced Hooks",
        description: "Master React hooks",
        question: "Implement custom hooks",
        difficulty: "hard",
        estimatedTime: 20,
        tags: ["hooks", "advanced"],
        hints: ["Use useEffect", "Create custom hook"],
      },
    ],
  };

  const mockSetCurrentLesson = vi.fn();
  const mockResetHint = vi.fn();
  const mockNextHint = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseLesson.mockReturnValue({
      currentCategory: mockCategory,
      currentLesson: mockCategory.lessons[0],
      currentLessonId: "1",
      setCurrentLesson: mockSetCurrentLesson,
    });

    mockUseProgress.mockReturnValue({
      completedLessonIds: new Set(["1"]),
    });

    mockUseUIStore.mockReturnValue({
      showHint: false,
      hintIndex: 0,
      resetHint: mockResetHint,
      nextHint: mockNextHint,
    });
  });

  describe("Rendering", () => {
    it("should render sidebar with lesson selector", () => {
      render(<AppSidebar />);

      expect(screen.getByText("选择题目")).toBeInTheDocument();
    });

    it("should render current lesson title", () => {
      render(<AppSidebar />);

      expect(screen.getByText("First Component")).toBeInTheDocument();
    });

    it("should render lesson description", () => {
      render(<AppSidebar />);

      expect(
        screen.getByText("Learn to create your first React component"),
      ).toBeInTheDocument();
    });

    it("should render lesson question", () => {
      render(<AppSidebar />);

      expect(
        screen.getByText("Create a simple React component"),
      ).toBeInTheDocument();
    });

    it("should render difficulty tag", () => {
      render(<AppSidebar />);

      expect(screen.getByText("简单")).toBeInTheDocument();
    });

    it("should render lesson tags", () => {
      render(<AppSidebar />);

      expect(screen.getByText("basics")).toBeInTheDocument();
      expect(screen.getByText("jsx")).toBeInTheDocument();
    });

    it("should render time estimate", () => {
      render(<AppSidebar />);

      expect(screen.getByText("10 分钟")).toBeInTheDocument();
    });

    it("should render navigation buttons only (action buttons moved to bottom bar)", () => {
      render(<AppSidebar />);

      // 操作按钮已移至底部栏，侧边栏只保留导航按钮
      expect(screen.getByText("上一题")).toBeInTheDocument();
      expect(screen.getByText(/下一题/i)).toBeInTheDocument();
    });

    it("should render navigation buttons", () => {
      render(<AppSidebar />);

      expect(screen.getByText("上一题")).toBeInTheDocument();
      expect(screen.getByText(/下一题/i)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should return null when no current category", () => {
      mockUseLesson.mockReturnValue({
        currentCategory: null,
        currentLesson: null,
        currentLessonId: null,
        setCurrentLesson: mockSetCurrentLesson,
      });

      const { container } = render(<AppSidebar />);

      expect(container.firstChild).toBeNull();
    });

    it("should return null when no current lesson", () => {
      mockUseLesson.mockReturnValue({
        currentCategory: mockCategory,
        currentLesson: null,
        currentLessonId: null,
        setCurrentLesson: mockSetCurrentLesson,
      });

      const { container } = render(<AppSidebar />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Navigation", () => {
    it("should disable previous button on first lesson", () => {
      render(<AppSidebar />);

      const prevButton = screen.getByText("上一题").closest("button");
      expect(prevButton).toBeDisabled();
    });

    it("should enable next button when not on last lesson", () => {
      render(<AppSidebar />);

      const nextButton = screen.getByText(/下一题/i).closest("button");
      expect(nextButton).not.toBeDisabled();
    });

    it("should disable next button on last lesson", () => {
      mockUseLesson.mockReturnValue({
        currentCategory: mockCategory,
        currentLesson: mockCategory.lessons[2],
        currentLessonId: "3",
        setCurrentLesson: mockSetCurrentLesson,
      });

      render(<AppSidebar />);

      const nextButton = screen.getByText(/下一题/i).closest("button");
      expect(nextButton).toBeDisabled();
    });

    it("should enable previous button when not on first lesson", () => {
      mockUseLesson.mockReturnValue({
        currentCategory: mockCategory,
        currentLesson: mockCategory.lessons[1],
        currentLessonId: "2",
        setCurrentLesson: mockSetCurrentLesson,
      });

      render(<AppSidebar />);

      const prevButton = screen.getByText("上一题").closest("button");
      expect(prevButton).not.toBeDisabled();
    });

    it("should call setCurrentLesson when next button is clicked", async () => {
      const user = userEvent.setup();
      render(<AppSidebar />);

      const nextButton = screen.getByText(/下一题/i).closest("button");
      if (nextButton) {
        await user.click(nextButton);
      }

      expect(mockSetCurrentLesson).toHaveBeenCalledWith("2");
      expect(mockResetHint).toHaveBeenCalled();
    });

    it("should call setCurrentLesson when previous button is clicked", async () => {
      const user = userEvent.setup();

      mockUseLesson.mockReturnValue({
        currentCategory: mockCategory,
        currentLesson: mockCategory.lessons[1],
        currentLessonId: "2",
        setCurrentLesson: mockSetCurrentLesson,
      });

      render(<AppSidebar />);

      const prevButton = screen.getByText("上一题").closest("button");
      if (prevButton) {
        await user.click(prevButton);
      }

      expect(mockSetCurrentLesson).toHaveBeenCalledWith("1");
      expect(mockResetHint).toHaveBeenCalled();
    });
  });

  describe("Hints", () => {
    it("should not show hint by default", () => {
      render(<AppSidebar />);

      expect(screen.queryByText(/提示 1/i)).not.toBeInTheDocument();
    });

    it("should show hint when showHint is true and hintIndex > 0", () => {
      mockUseUIStore.mockReturnValue({
        showHint: true,
        hintIndex: 1,
        resetHint: mockResetHint,
        nextHint: mockNextHint,
      });

      render(<AppSidebar />);

      expect(screen.getByText("Use function declaration")).toBeInTheDocument();
    });

    it("should display hint alert when hint is available", () => {
      // 提示按钮已移至底部操作栏
      // 此测试验证当 showHint 为 true 时显示提示内容
      mockUseUIStore.mockReturnValue({
        showHint: true,
        hintIndex: 2,
        resetHint: mockResetHint,
        nextHint: mockNextHint,
      });

      render(<AppSidebar />);

      expect(screen.getByText(/提示 2\/2/i)).toBeInTheDocument();
    });
  });

  describe("Difficulty Colors", () => {
    it("should show success color for easy difficulty", () => {
      render(<AppSidebar />);

      const tag = screen.getByText("简单");
      expect(tag.closest(".ant-tag")).toHaveClass("ant-tag-success");
    });

    it("should show warning color for medium difficulty", () => {
      mockUseLesson.mockReturnValue({
        currentCategory: mockCategory,
        currentLesson: mockCategory.lessons[1],
        currentLessonId: "2",
        setCurrentLesson: mockSetCurrentLesson,
      });

      render(<AppSidebar />);

      const tag = screen.getByText("中等");
      expect(tag.closest(".ant-tag")).toHaveClass("ant-tag-warning");
    });

    it("should show error color for hard difficulty", () => {
      mockUseLesson.mockReturnValue({
        currentCategory: mockCategory,
        currentLesson: mockCategory.lessons[2],
        currentLessonId: "3",
        setCurrentLesson: mockSetCurrentLesson,
      });

      render(<AppSidebar />);

      const tag = screen.getByText("困难");
      expect(tag.closest(".ant-tag")).toHaveClass("ant-tag-error");
    });
  });
});
