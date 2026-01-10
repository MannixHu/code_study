/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef } from "react";

/**
 * Skip Link Component
 * Provides a way for keyboard users to skip to main content
 * Hidden by default, visible on focus
 */
export function SkipLink({ targetId = "main-content" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      style={{
        position: "absolute",
        top: "-40px",
        left: "0",
        backgroundColor: "#6366f1",
        color: "white",
        padding: "8px 16px",
        zIndex: 10000,
        transition: "top 0.3s",
        textDecoration: "none",
        borderRadius: "0 0 8px 0",
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = "0";
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = "-40px";
      }}
    >
      跳转到主内容
    </a>
  );
}

/**
 * Screen Reader Only Component
 * Content only visible to screen readers
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Live Region Component
 * Announces dynamic content changes to screen readers
 */
export function LiveRegion({
  children,
  politeness = "polite",
  atomic = true,
}: {
  children: React.ReactNode;
  politeness?: "polite" | "assertive";
  atomic?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Focus Trap Hook
 * Traps focus within a container (useful for modals)
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Keyboard Shortcut Hook
 * Adds keyboard shortcuts for better accessibility
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = [
        e.ctrlKey ? "Ctrl" : "",
        e.altKey ? "Alt" : "",
        e.shiftKey ? "Shift" : "",
        e.key,
      ]
        .filter(Boolean)
        .join("+");

      const handler = shortcuts[key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Announce to Screen Reader
 * Programmatically announce messages to screen readers
 */
export function announceToScreenReader(message: string, priority = "polite") {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.style.cssText =
    "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
