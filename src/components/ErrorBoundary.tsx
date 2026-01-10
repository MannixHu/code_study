import { Component, type ReactNode, type ErrorInfo } from "react";
import ErrorFallback from "./ErrorFallback";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

interface ErrorLog {
  message: string;
  stack: string | undefined;
  componentStack: string | null | undefined;
  timestamp: number;
  url: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);

    // Store error in localStorage for later analysis
    if (typeof window !== "undefined") {
      const errorLog: ErrorLog = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
        url: window.location.href,
      };

      // Store to localStorage as fallback
      try {
        const logs = JSON.parse(localStorage.getItem("error-logs") || "[]");
        logs.push(errorLog);
        // Keep only the last 50 errors
        localStorage.setItem("error-logs", JSON.stringify(logs.slice(-50)));
      } catch (e) {
        console.error("Failed to log error", e);
      }
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback || (
          <ErrorFallback
            error={this.state.error}
            resetError={this.resetError}
          />
        )
      );
    }

    return this.props.children;
  }
}
