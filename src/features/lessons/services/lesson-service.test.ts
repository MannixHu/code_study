import { vi } from "vitest";
/**
 * Unit Tests for Lesson Service
 */

import { lessonService } from "./lesson-service";
import { lessonRepository } from "../repository/lesson-repository";
import type { Category, Lesson } from "../types/lesson";

// Mock the lesson repository
vi.mock("../repository/lesson-repository");

const mockLessonRepository = lessonRepository as jest.Mocked<
  typeof lessonRepository
>;

describe("LessonService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadCategory", () => {
    it("should successfully load a category", async () => {
      const mockCategory: Category = {
        categoryId: "jsx-basics",
        name: "JSX Basics",
        description: "Learn JSX basics",
        icon: "📝",
        order: 1,
        lessons: [],
      };

      mockLessonRepository.loadCategory.mockResolvedValue(mockCategory);

      const result = await lessonService.loadCategory("jsx-basics");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockCategory);
      }
      expect(mockLessonRepository.loadCategory).toHaveBeenCalledWith(
        "jsx-basics",
      );
    });

    it("should return error when category not found", async () => {
      mockLessonRepository.loadCategory.mockResolvedValue(null);

      const result = await lessonService.loadCategory("non-existent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("CATEGORY_NOT_FOUND");
        expect(result.error.message).toContain("not found");
      }
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database connection failed");
      mockLessonRepository.loadCategory.mockRejectedValue(error);

      const result = await lessonService.loadCategory("jsx-basics");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("LOAD_CATEGORY_ERROR");
        expect(result.error.message).toContain("Failed to load category");
      }
    });
  });

  describe("getCategoryStats", () => {
    it("should return category metadata with lesson count", async () => {
      const mockCategory: Category = {
        categoryId: "jsx-basics",
        name: "JSX Basics",
        description: "Learn JSX basics",
        icon: "📝",
        order: 1,
        lessons: [
          { id: "lesson-1" } as Lesson,
          { id: "lesson-2" } as Lesson,
          { id: "lesson-3" } as Lesson,
        ],
      };

      mockLessonRepository.loadCategory.mockResolvedValue(mockCategory);

      const result = await lessonService.getCategoryStats("jsx-basics");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("jsx-basics");
        expect(result.data.name).toBe("JSX Basics");
        expect(result.data.icon).toBe("📝");
        expect(result.data.total).toBe(3);
        expect(result.data.completed).toBe(0);
      }
    });

    it("should return error when category not found", async () => {
      mockLessonRepository.loadCategory.mockResolvedValue(null);

      const result = await lessonService.getCategoryStats("non-existent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("CATEGORY_NOT_FOUND");
      }
    });
  });

  describe("getLesson", () => {
    it("should successfully load a lesson", async () => {
      const mockLesson: Lesson = {
        id: "lesson-1",
        title: "Test Lesson",
        difficulty: "easy",
        tags: [],
        estimatedTime: 15,
        question: "Create a simple component",
        description: "Test description",
        starterCode: "const App = () => {}",
        solution: "const App = () => <div>Solution</div>",
        testCases: [],
        hints: [],
      };

      mockLessonRepository.loadLesson.mockResolvedValue(mockLesson);

      const result = await lessonService.getLesson("jsx-basics", "lesson-1");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockLesson);
      }
      expect(mockLessonRepository.loadLesson).toHaveBeenCalledWith(
        "jsx-basics",
        "lesson-1",
      );
    });

    it("should return error when lesson not found", async () => {
      mockLessonRepository.loadLesson.mockResolvedValue(null);

      const result = await lessonService.getLesson(
        "jsx-basics",
        "non-existent",
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("LESSON_NOT_FOUND");
        expect(result.error.message).toContain("not found");
      }
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database error");
      mockLessonRepository.loadLesson.mockRejectedValue(error);

      const result = await lessonService.getLesson("jsx-basics", "lesson-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("LOAD_LESSON_ERROR");
      }
    });
  });

  describe("preloadNextCategory", () => {
    it("should call repository preload method", async () => {
      mockLessonRepository.preloadNextCategory.mockResolvedValue(undefined);

      await lessonService.preloadNextCategory("jsx-basics");

      expect(mockLessonRepository.preloadNextCategory).toHaveBeenCalledWith(
        "jsx-basics",
      );
    });

    it("should silently handle preload errors", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation();
      mockLessonRepository.preloadNextCategory.mockRejectedValue(
        new Error("Preload failed"),
      );

      await lessonService.preloadNextCategory("jsx-basics");

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to preload next category:",
        expect.any(Error),
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe("preloadAdjacentCategories", () => {
    it("should call repository preload method", async () => {
      mockLessonRepository.preloadAdjacentCategories.mockResolvedValue(
        undefined,
      );

      await lessonService.preloadAdjacentCategories("jsx-basics");

      expect(
        mockLessonRepository.preloadAdjacentCategories,
      ).toHaveBeenCalledWith("jsx-basics");
    });

    it("should silently handle preload errors", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation();
      mockLessonRepository.preloadAdjacentCategories.mockRejectedValue(
        new Error("Preload failed"),
      );

      await lessonService.preloadAdjacentCategories("jsx-basics");

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to preload adjacent categories:",
        expect.any(Error),
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe("clearCache", () => {
    it("should call repository clearCache without categoryId", async () => {
      await lessonService.clearCache();

      expect(mockLessonRepository.clearCache).toHaveBeenCalledWith(undefined);
    });

    it("should call repository clearCache with categoryId", async () => {
      await lessonService.clearCache("jsx-basics");

      expect(mockLessonRepository.clearCache).toHaveBeenCalledWith(
        "jsx-basics",
      );
    });
  });
});
