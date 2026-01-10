/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for AppHeader component
 * Note: This component is heavily integrated with antd components
 * and requires simplified testing approach
 */

import { render, screen } from "@testing-library/react";

// Mock the antd components
jest.mock("antd", () => ({
  Layout: {
    Header: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className: string;
    }) => (
      <header className={className} data-testid="app-header">
        {children}
      </header>
    ),
  },
  Badge: ({ count }: { count: string }) => (
    <span data-testid="badge">{count}</span>
  ),
  Tabs: ({
    items,
    activeKey,
    className,
  }: {
    items: any[];
    activeKey: string;
    className: string;
  }) => (
    <div data-testid="tabs" className={className}>
      {items.map((item: any) => (
        <div
          key={item.key}
          data-testid={`tab-${item.key}`}
          className={item.key === activeKey ? "active" : ""}
        >
          {item.label}
        </div>
      ))}
    </div>
  ),
}));

// Mock the store
jest.mock("../../../store", () => ({
  useLessonStore: () => ({
    currentCategoryId: "jsx",
    categories: [
      { id: "jsx", name: "JSX 基础", icon: "📝" },
      { id: "components", name: "组件开发", icon: "🧩" },
      { id: "hooks", name: "React Hooks", icon: "🎣" },
    ],
    setCurrentCategoryId: jest.fn(),
  }),
}));

// Mock the progress service
jest.mock("../../../features/progress", () => ({
  progressService: {
    calculateStatistics: jest.fn().mockResolvedValue({
      success: true,
      data: {
        completedLessons: 3,
        totalLessons: 5,
        completionRate: 60,
        attempts: 10,
        averageScore: 80,
        lastUpdated: new Date().toISOString(),
      },
    }),
  },
}));

import AppHeader from "./AppHeader";

describe("AppHeader", () => {
  describe("Rendering", () => {
    it("should render header element", () => {
      render(<AppHeader />);

      expect(screen.getByTestId("app-header")).toBeInTheDocument();
    });

    it("should render header with logo text", () => {
      render(<AppHeader />);

      expect(screen.getByText("React 学习")).toBeInTheDocument();
    });

    it("should render tabs container", () => {
      render(<AppHeader />);

      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    it("should render all category tabs", () => {
      render(<AppHeader />);

      expect(screen.getByTestId("tab-jsx")).toBeInTheDocument();
      expect(screen.getByTestId("tab-components")).toBeInTheDocument();
      expect(screen.getByTestId("tab-hooks")).toBeInTheDocument();
    });

    it("should render category names", () => {
      render(<AppHeader />);

      expect(screen.getByText("JSX 基础")).toBeInTheDocument();
      expect(screen.getByText("组件开发")).toBeInTheDocument();
      expect(screen.getByText("React Hooks")).toBeInTheDocument();
    });

    it("should render category icons", () => {
      render(<AppHeader />);

      expect(screen.getByText("📝")).toBeInTheDocument();
      expect(screen.getByText("🧩")).toBeInTheDocument();
      expect(screen.getByText("🎣")).toBeInTheDocument();
    });

    it("should mark active category", () => {
      render(<AppHeader />);

      const activeTab = screen.getByTestId("tab-jsx");
      expect(activeTab).toHaveClass("active");
    });

    it("should not mark inactive categories", () => {
      render(<AppHeader />);

      const inactiveTab = screen.getByTestId("tab-components");
      expect(inactiveTab).not.toHaveClass("active");
    });
  });

  describe("Badge Display", () => {
    it("should render badges for categories", () => {
      render(<AppHeader />);

      const badges = screen.getAllByTestId("badge");
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
