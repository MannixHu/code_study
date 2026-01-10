/**
 * AI Hint System Types
 */

// 提示级别
export type HintLevel = 1 | 2 | 3;

// 提示请求上下文
export interface HintContext {
  lessonId: string;
  lessonTitle: string;
  question: string;
  description: string;
  userCode: string;
  starterCode: string;
  solution: string;
  staticHints: string[];
  testResults: Array<{
    description: string;
    passed: boolean;
    message?: string;
  }>;
  previousHints: string[];
  hintLevel: HintLevel;
}

// AI 生成的提示
export interface AIHint {
  level: HintLevel;
  content: string;
  codeSnippet?: string;
  relatedConcept?: string;
  timestamp: string;
}

// 提示历史记录
export interface HintHistory {
  lessonId: string;
  hints: AIHint[];
  totalRequests: number;
  lastRequestTime: string;
}

// 提示服务配置
export interface HintServiceConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  fallbackToStatic?: boolean;
}

// 提示服务结果
export interface HintResult {
  success: boolean;
  hint?: AIHint;
  error?: string;
  source: "ai" | "static" | "fallback";
}
