import { vi } from "vitest";
/**
 * Tests for AppLayout component
 */

import { render, screen } from "@testing-library/react";
import AppLayout from "./AppLayout";

// Mock child components
vi.mock("./AppHeader", () => ({
  __esModule: true,
  default: () => <div data-testid="app-header">AppHeader</div>,
}));

vi.mock("./AppSidebar", () => ({
  __esModule: true,
  default: () => <div data-testid="app-sidebar">AppSidebar</div>,
}));

vi.mock("../../../features/lessons", () => ({
  LearningPage: () => <div data-testid="learning-page">LearningPage</div>,
}));

describe("AppLayout", () => {
  describe("Rendering", () => {
    it("should render layout container", () => {
      render(<AppLayout />);

      const layout = document.querySelector(".app-layout");
      expect(layout).toBeInTheDocument();
    });

    it("should render AppHeader component", () => {
      render(<AppLayout />);

      expect(screen.getByTestId("app-header")).toBeInTheDocument();
    });

    it("should render AppSidebar component", () => {
      render(<AppLayout />);

      expect(screen.getByTestId("app-sidebar")).toBeInTheDocument();
    });

    it("should render LearningPage component", () => {
      render(<AppLayout />);

      expect(screen.getByTestId("learning-page")).toBeInTheDocument();
    });

    it("should render app-body container", () => {
      render(<AppLayout />);

      const appBody = document.querySelector(".app-body");
      expect(appBody).toBeInTheDocument();
    });

    it("should render app-content container", () => {
      render(<AppLayout />);

      const appContent = document.querySelector(".app-content");
      expect(appContent).toBeInTheDocument();
    });
  });

  describe("Layout Structure", () => {
    it("should have header at top level", () => {
      render(<AppLayout />);

      const layout = document.querySelector(".app-layout");
      const header = screen.getByTestId("app-header");

      // Header should be a direct child of layout
      expect(layout?.contains(header)).toBe(true);
    });

    it("should have sidebar inside app-body", () => {
      render(<AppLayout />);

      const appBody = document.querySelector(".app-body");
      const sidebar = screen.getByTestId("app-sidebar");

      expect(appBody?.contains(sidebar)).toBe(true);
    });

    it("should have learning page inside app-content", () => {
      render(<AppLayout />);

      const appContent = document.querySelector(".app-content");
      const learningPage = screen.getByTestId("learning-page");

      expect(appContent?.contains(learningPage)).toBe(true);
    });
  });
});
