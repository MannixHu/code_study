/**
 * Hints Feature Module
 * AI-powered hint system for learning assistance
 */

// Types
export type {
  HintLevel,
  HintContext,
  AIHint,
  HintHistory,
  HintServiceConfig,
  HintResult,
} from "./types/hint";

// Service
export { hintService, HintService } from "./services/hint-service";

// Hook
export { useHint } from "./hooks/useHint";
export type { UseHintOptions, UseHintResult } from "./hooks/useHint";

// Components
export { HintButton } from "./components/HintButton";
export { HintPanel, HintInline } from "./components/HintPanel";
