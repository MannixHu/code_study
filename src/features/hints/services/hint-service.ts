/**
 * AI Hint Service
 * Provides intelligent hints based on user code and test results
 */

import type {
  HintContext,
  HintResult,
  AIHint,
  HintLevel,
  HintServiceConfig,
} from "../types/hint";

// Default configuration
const DEFAULT_CONFIG: HintServiceConfig = {
  model: "gpt-3.5-turbo",
  maxTokens: 500,
  temperature: 0.7,
  fallbackToStatic: true,
};

/**
 * Generate system prompt for AI
 */
function generateSystemPrompt(level: HintLevel): string {
  const levelDescriptions: Record<HintLevel, string> = {
    1: `You are a helpful React tutor. Provide a GENTLE hint that points the student in the right direction without giving away the answer.
Focus on:
- What concept they should think about
- Common mistakes to avoid
- Questions to help them think through the problem`,

    2: `You are a helpful React tutor. Provide a MORE SPECIFIC hint that gives clearer direction.
Focus on:
- Which part of their code needs attention
- What syntax or pattern they should use
- A small example of the concept (not the full solution)`,

    3: `You are a helpful React tutor. Provide a DETAILED hint that is close to the solution but still requires the student to complete it.
Focus on:
- Show the structure of the solution
- Explain exactly what needs to change
- Provide a partial code example they can complete`,
  };

  return `${levelDescriptions[level]}

Rules:
- Respond in the same language as the lesson (Chinese if lesson is in Chinese)
- Keep response concise (under 200 words)
- Be encouraging and supportive
- Never give the complete solution directly`;
}

/**
 * Generate user prompt for AI
 */
function generateUserPrompt(context: HintContext): string {
  const failedTests = context.testResults
    .filter((t) => !t.passed)
    .map((t) => `- ${t.description}${t.message ? `: ${t.message}` : ""}`)
    .join("\n");

  return `Lesson: ${context.lessonTitle}

Question: ${context.question}

Description: ${context.description}

Student's Current Code:
\`\`\`jsx
${context.userCode}
\`\`\`

Failed Tests:
${failedTests || "All tests passed, but student wants a hint for optimization"}

Previous hints given: ${context.previousHints.length > 0 ? context.previousHints.join("; ") : "None"}

Please provide a level ${context.hintLevel} hint.`;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  config: HintServiceConfig,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

/**
 * Generate static hint based on level
 */
function generateStaticHint(context: HintContext): string {
  const { staticHints, hintLevel, testResults } = context;

  // Use existing static hints if available
  if (staticHints.length > 0) {
    const hintIndex = Math.min(hintLevel - 1, staticHints.length - 1);
    return staticHints[hintIndex];
  }

  // Generate fallback hints based on test results
  const failedTests = testResults.filter((t) => !t.passed);

  if (failedTests.length === 0) {
    return "代码看起来已经通过了所有测试！尝试优化或简化你的解决方案。";
  }

  const levelMessages: Record<HintLevel, string> = {
    1: `仔细阅读题目要求，检查你的代码是否满足了 "${failedTests[0].description}" 这个测试用例。`,
    2: `测试 "${failedTests[0].description}" 失败了。${failedTests[0].message ? `错误信息: ${failedTests[0].message}` : "检查相关的语法和逻辑。"}`,
    3: `让我们看看解决方案的结构。对于 "${failedTests[0].description}"，你需要确保代码中包含正确的 React 组件结构。`,
  };

  return levelMessages[hintLevel];
}

/**
 * AI Hint Service Class
 */
class HintService {
  private config: HintServiceConfig;
  private hintCache: Map<string, AIHint[]> = new Map();

  constructor(config: Partial<HintServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HintServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if AI is available
   */
  isAIAvailable(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Get hint for the current context
   */
  async getHint(context: HintContext): Promise<HintResult> {
    // Try AI first if available
    if (this.isAIAvailable()) {
      try {
        const systemPrompt = generateSystemPrompt(context.hintLevel);
        const userPrompt = generateUserPrompt(context);
        const aiResponse = await callOpenAI(
          systemPrompt,
          userPrompt,
          this.config,
        );

        const hint: AIHint = {
          level: context.hintLevel,
          content: aiResponse,
          timestamp: new Date().toISOString(),
        };

        // Cache the hint
        const cached = this.hintCache.get(context.lessonId) || [];
        cached.push(hint);
        this.hintCache.set(context.lessonId, cached);

        return {
          success: true,
          hint,
          source: "ai",
        };
      } catch (error) {
        console.error("AI hint generation failed:", error);

        // Fallback to static if configured
        if (this.config.fallbackToStatic) {
          return this.getStaticHint(context);
        }

        return {
          success: false,
          error: error instanceof Error ? error.message : "AI hint failed",
          source: "ai",
        };
      }
    }

    // Use static hints
    return this.getStaticHint(context);
  }

  /**
   * Get static hint
   */
  private getStaticHint(context: HintContext): HintResult {
    const content = generateStaticHint(context);

    const hint: AIHint = {
      level: context.hintLevel,
      content,
      timestamp: new Date().toISOString(),
    };

    return {
      success: true,
      hint,
      source: "static",
    };
  }

  /**
   * Get hint history for a lesson
   */
  getHintHistory(lessonId: string): AIHint[] {
    return this.hintCache.get(lessonId) || [];
  }

  /**
   * Clear hint history
   */
  clearHistory(lessonId?: string): void {
    if (lessonId) {
      this.hintCache.delete(lessonId);
    } else {
      this.hintCache.clear();
    }
  }
}

// Export singleton instance
export const hintService = new HintService();

// Export class for testing
export { HintService };
