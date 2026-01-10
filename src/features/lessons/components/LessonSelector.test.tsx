import { vi } from "vitest";
/**
 * Tests for LessonSelector component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LessonSelector from "./LessonSelector";
import type { Lesson } from "../types/lesson";

describe("LessonSelector", () => {
  const mockLessons: Lesson[] = [
    {
      id: "1",
      title: "First Component",
      description: "Learn to create your first React component",
      question: "Create a simple React component",
      difficulty: "easy",
      estimatedTime: 10,
      tags: ["basics", "jsx"],
      starterCode: "",
      solution: "",
      testCases: [],
      hints: [],
    },
    {
      id: "2",
      title: "Props and State",
      description: "Understanding React props and state",
      question: "Use props and state in a component",
      difficulty: "medium",
      estimatedTime: 15,
      tags: ["props", "state"],
      starterCode: "",
      solution: "",
      testCases: [],
      hints: [],
    },
    {
      id: "3",
      title: "Advanced Hooks",
      description: "Master React hooks",
      question: "Implement custom hooks",
      difficulty: "hard",
      estimatedTime: 20,
      tags: ["hooks", "advanced"],
      starterCode: "",
      solution: "",
      testCases: [],
      hints: [],
    },
  ];

  const defaultProps = {
    lessons: mockLessons,
    currentLessonId: "1",
    completedLessonIds: new Set<string>(),
    onLessonChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render lesson selector with all lessons", () => {
      render(<LessonSelector {...defaultProps} />);

      const select = screen.getByRole("combobox", { name: /选择题目/i });
      expect(select).toBeInTheDocument();

      // Check all lessons are in the dropdown
      expect(
        screen.getByRole("option", { name: /First Component/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /Props and State/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /Advanced Hooks/i }),
      ).toBeInTheDocument();
    });

    it("should display current lesson as selected", () => {
      render(<LessonSelector {...defaultProps} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("1");
    });

    it("should show completion checkmark for completed lessons", () => {
      const completedLessonIds = new Set(["1", "2"]);

      render(
        <LessonSelector
          {...defaultProps}
          completedLessonIds={completedLessonIds}
        />,
      );

      const option1 = screen.getByRole("option", { name: /First Component/i });
      const option2 = screen.getByRole("option", { name: /Props and State/i });
      const option3 = screen.getByRole("option", { name: /Advanced Hooks/i });

      expect(option1.textContent).toContain("✓");
      expect(option2.textContent).toContain("✓");
      expect(option3.textContent).not.toContain("✓");
    });

    it("should display lesson difficulty in options", () => {
      render(<LessonSelector {...defaultProps} />);

      // Component uses Chinese difficulty names
      expect(screen.getByRole("option", { name: /简单/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /中等/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /困难/i })).toBeInTheDocument();
    });

    it("should display estimated time in options", () => {
      render(<LessonSelector {...defaultProps} />);

      expect(
        screen.getByRole("option", { name: /10min/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /15min/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /20min/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Current Lesson Info Display", () => {
    it("should display current lesson difficulty badge", () => {
      render(<LessonSelector {...defaultProps} />);

      // Current lesson is 'easy' which displays as '简单'
      const badge = screen.getByText("简单");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("difficulty-badge");
    });

    it("should display current lesson time estimate", () => {
      render(<LessonSelector {...defaultProps} />);

      expect(screen.getByText(/10 分钟/i)).toBeInTheDocument();
    });

    it("should display current lesson tags", () => {
      render(<LessonSelector {...defaultProps} />);

      expect(screen.getByText("basics")).toBeInTheDocument();
      expect(screen.getByText("jsx")).toBeInTheDocument();
    });

    it("should update info display when different lesson is selected", () => {
      const { rerender } = render(<LessonSelector {...defaultProps} />);

      expect(screen.getByText("简单")).toBeInTheDocument();

      rerender(<LessonSelector {...defaultProps} currentLessonId="2" />);

      expect(screen.getByText("中等")).toBeInTheDocument();
      expect(screen.getByText("props")).toBeInTheDocument();
      expect(screen.getByText("state")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onLessonChange when lesson is selected", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <LessonSelector {...defaultProps} onLessonChange={handleChange} />,
      );

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "2");

      expect(handleChange).toHaveBeenCalledWith("2");
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should allow selecting different lessons", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <LessonSelector {...defaultProps} onLessonChange={handleChange} />,
      );

      const select = screen.getByRole("combobox");

      await user.selectOptions(select, "2");
      expect(handleChange).toHaveBeenCalledWith("2");

      await user.selectOptions(select, "3");
      expect(handleChange).toHaveBeenCalledWith("3");
    });
  });

  describe("Difficulty Badge Colors", () => {
    it("should apply green color for easy difficulty", () => {
      render(<LessonSelector {...defaultProps} currentLessonId="1" />);

      const badge = screen.getByText("简单");
      expect(badge).toHaveStyle({ backgroundColor: "#22c55e" });
    });

    it("should apply orange color for medium difficulty", () => {
      render(<LessonSelector {...defaultProps} currentLessonId="2" />);

      const badge = screen.getByText("中等");
      expect(badge).toHaveStyle({ backgroundColor: "#f59e0b" });
    });

    it("should apply red color for hard difficulty", () => {
      render(<LessonSelector {...defaultProps} currentLessonId="3" />);

      const badge = screen.getByText("困难");
      expect(badge).toHaveStyle({ backgroundColor: "#ef4444" });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty lessons array", () => {
      render(<LessonSelector {...defaultProps} lessons={[]} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();

      const options = screen.queryAllByRole("option");
      expect(options).toHaveLength(0);
    });

    it("should handle lesson without estimated time", () => {
      const lessonWithoutTime = {
        ...mockLessons[0],
        estimatedTime: 0,
      } as Lesson;

      render(
        <LessonSelector
          {...defaultProps}
          lessons={[lessonWithoutTime]}
          currentLessonId={lessonWithoutTime.id}
        />,
      );

      // Should not show time badge when estimatedTime is 0/falsy
      expect(screen.queryByText(/分钟/i)).not.toBeInTheDocument();
    });

    it("should handle lesson without tags", () => {
      const lessonWithoutTags: Lesson = {
        ...mockLessons[0],
        tags: [],
      };

      render(
        <LessonSelector
          {...defaultProps}
          lessons={[lessonWithoutTags]}
          currentLessonId={lessonWithoutTags.id}
        />,
      );

      // Should render without crashing
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("简单")).toBeInTheDocument();
    });

    it("should handle currentLessonId not in lessons array", () => {
      render(<LessonSelector {...defaultProps} currentLessonId="999" />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      // Browser falls back to first option when value doesn't match any option
      expect(select.value).toBe("1");

      // Should not crash
      expect(select).toBeInTheDocument();
    });
  });
});
