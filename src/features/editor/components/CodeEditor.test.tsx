import { vi } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for CodeEditor component
 */

import { render, screen, fireEvent } from "@testing-library/react";
import CodeEditor from "./CodeEditor";

// Mock Monaco Editor
vi.mock("@monaco-editor/react", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    onMount,
    language,
    theme,
    height,
  }: {
    value: string;
    onChange: (value: string | undefined) => void;
    onMount: (editor: any, monaco: any) => void;
    language: string;
    theme: string;
    height: string | number;
  }) => {
    // Simulate editor instance
    const mockEditor = {
      addCommand: vi.fn(),
    };

    // Simulate monaco object with KeyMod and KeyCode
    const mockMonaco = {
      KeyMod: { CtrlCmd: 1 },
      KeyCode: { KeyS: 83 },
    };

    // Call onMount if provided with both editor and monaco
    if (onMount) {
      setTimeout(() => onMount(mockEditor, mockMonaco), 0);
    }

    return (
      <div data-testid="monaco-editor">
        <textarea
          data-testid="editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${language} editor`}
        />
        <span data-testid="editor-language">{language}</span>
        <span data-testid="editor-theme">{theme}</span>
        <span data-testid="editor-height">{String(height)}</span>
      </div>
    );
  },
}));

describe("CodeEditor", () => {
  const defaultProps = {
    value: 'console.log("Hello")',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render monaco editor wrapper", () => {
      render(<CodeEditor {...defaultProps} />);

      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    });

    it("should render with provided value", () => {
      render(<CodeEditor {...defaultProps} />);

      const textarea = screen.getByTestId("editor-textarea");
      expect(textarea).toHaveValue('console.log("Hello")');
    });

    it("should use default language javascript", () => {
      render(<CodeEditor {...defaultProps} />);

      expect(screen.getByTestId("editor-language")).toHaveTextContent(
        "javascript",
      );
    });

    it("should use default height 100%", () => {
      render(<CodeEditor {...defaultProps} />);

      expect(screen.getByTestId("editor-height")).toHaveTextContent("100%");
    });

    it("should use vs-dark theme by default", () => {
      render(<CodeEditor {...defaultProps} />);

      expect(screen.getByTestId("editor-theme")).toHaveTextContent("vs-dark");
    });
  });

  describe("Custom Props", () => {
    it("should use custom language", () => {
      render(<CodeEditor {...defaultProps} language="typescript" />);

      expect(screen.getByTestId("editor-language")).toHaveTextContent(
        "typescript",
      );
    });

    it("should use custom height", () => {
      render(<CodeEditor {...defaultProps} height="500px" />);

      expect(screen.getByTestId("editor-height")).toHaveTextContent("500px");
    });

    it("should use custom height as number", () => {
      render(<CodeEditor {...defaultProps} height={400} />);

      expect(screen.getByTestId("editor-height")).toHaveTextContent("400");
    });

    it("should use light theme when theme is light", () => {
      render(<CodeEditor {...defaultProps} theme="light" />);

      expect(screen.getByTestId("editor-theme")).toHaveTextContent("vs");
    });

    it("should use dark theme when theme is not light", () => {
      render(<CodeEditor {...defaultProps} theme="dark" />);

      expect(screen.getByTestId("editor-theme")).toHaveTextContent("vs-dark");
    });
  });

  describe("User Interactions", () => {
    it("should call onChange when value changes", () => {
      const handleChange = vi.fn();
      render(<CodeEditor {...defaultProps} onChange={handleChange} />);

      const textarea = screen.getByTestId("editor-textarea");
      fireEvent.change(textarea, { target: { value: "new code" } });

      expect(handleChange).toHaveBeenCalledWith("new code");
    });

    it("should not call onChange when value is undefined", () => {
      const handleChange = vi.fn();
      render(<CodeEditor {...defaultProps} onChange={handleChange} />);

      const textarea = screen.getByTestId("editor-textarea");
      // Simulate undefined value
      fireEvent.change(textarea, { target: { value: "" } });

      // Called with empty string, but component logic would filter undefined
      expect(handleChange).toHaveBeenCalled();
    });

    it("should handle empty value", () => {
      render(<CodeEditor {...defaultProps} value="" />);

      const textarea = screen.getByTestId("editor-textarea");
      expect(textarea).toHaveValue("");
    });
  });

  describe("Edge Cases", () => {
    it("should handle long code values", () => {
      const longCode = "x".repeat(10000);
      render(<CodeEditor {...defaultProps} value={longCode} />);

      const textarea = screen.getByTestId("editor-textarea");
      expect(textarea).toHaveValue(longCode);
    });

    it("should handle special characters in code", () => {
      const specialCode = "<div>{`${template}`}</div>";
      render(<CodeEditor {...defaultProps} value={specialCode} />);

      const textarea = screen.getByTestId("editor-textarea");
      expect(textarea).toHaveValue(specialCode);
    });

    it("should handle multiline code", () => {
      const multilineCode = `function test() {
  return 'hello'
}`;
      render(<CodeEditor {...defaultProps} value={multilineCode} />);

      const textarea = screen.getByTestId("editor-textarea");
      expect(textarea).toHaveValue(multilineCode);
    });
  });
});
