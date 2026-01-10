/**
 * Test Service
 * 代码测试和验证的业务逻辑层
 * 负责运行测试用例、验证代码结构
 */

import type { TestCase, TestResult } from '../types/lesson'
import type { TestServiceAPI, CodeAnalysisResult, Result, ServiceError } from '../types/service'
import { codeAnalyzerService } from './code-analyzer'

/**
 * Test Service 实现
 */
class TestServiceImpl implements TestServiceAPI {
  /**
   * 运行所有测试用例
   */
  async runTests(
    code: string,
    testCases: TestCase[]
  ): Promise<Result<TestResult[], ServiceError>> {
    try {
      const results: TestResult[] = []

      for (const testCase of testCases) {
        const result = await this.runSingleTest(code, testCase)
        results.push(result)
      }

      return { success: true, data: results }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RUN_TESTS_ERROR',
          message: `Failed to run tests: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 运行单个测试用例
   */
  private async runSingleTest(code: string, testCase: TestCase): Promise<TestResult> {
    try {
      switch (testCase.type) {
        case 'ast':
          return await this.testWithAST(code, testCase)
        case 'pattern':
          return this.testWithPattern(code, testCase)
        case 'runtime':
          return this.testWithRuntime(code, testCase)
        default:
          return {
            passed: false,
            description: testCase.description,
            message: 'Unknown test type',
          }
      }
    } catch (error) {
      return {
        passed: false,
        description: testCase.description,
        message: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * AST 类型测试：使用代码分析器检查代码结构
   */
  private async testWithAST(code: string, testCase: TestCase): Promise<TestResult> {
    if (!testCase.checker) {
      return {
        passed: false,
        description: testCase.description,
        message: 'No checker expression provided',
      }
    }

    const result = await codeAnalyzerService.evaluateChecker(code, testCase.checker)

    if (!result.success) {
      return {
        passed: false,
        description: testCase.description,
        message: result.error.message,
      }
    }

    return {
      passed: result.data,
      description: testCase.description,
    }
  }

  /**
   * Pattern 类型测试：使用正则表达式或字符串匹配
   */
  private testWithPattern(code: string, testCase: TestCase): TestResult {
    if (!testCase.pattern) {
      return {
        passed: false,
        description: testCase.description,
        message: 'No pattern provided',
      }
    }

    try {
      // 尝试作为正则表达式
      const regex = new RegExp(testCase.pattern)
      const matches = code.match(regex)
      const count = matches ? matches.length : 0

      const minCount = testCase.minCount || 1
      const passed = count >= minCount

      return {
        passed,
        description: testCase.description,
        message: passed
          ? `Pattern found ${count} time(s)`
          : `Pattern found ${count} time(s), expected at least ${minCount}`,
      }
    } catch (error) {
      // 如果正则表达式失败，使用字符串包含检查
      const includes = code.includes(testCase.pattern)
      return {
        passed: includes,
        description: testCase.description,
        message: includes ? 'Pattern found' : `Pattern not found: ${testCase.pattern}`,
      }
    }
  }

  /**
   * Runtime 类型测试：执行自定义验证函数
   * 注意：由于安全性考虑，这种方法有限制
   */
  private testWithRuntime(code: string, testCase: TestCase): TestResult {
    if (!testCase.validator) {
      return {
        passed: false,
        description: testCase.description,
        message: 'No validator function provided',
      }
    }

    try {
      // 这是一个简化的实现
      // 在实际应用中，应该在 Web Worker 中执行，以隔离用户代码
      const result = testCase.validator(code)

      return {
        passed: Boolean(result),
        description: testCase.description,
      }
    } catch (error) {
      return {
        passed: false,
        description: testCase.description,
        message: `Validator error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * 验证代码的基本结构
   */
  async validateCode(code: string): Promise<Result<CodeAnalysisResult, ServiceError>> {
    try {
      const errors: string[] = []
      const warnings: string[] = []

      // 检查代码是否为空
      if (!code.trim()) {
        errors.push('Code is empty')
      }

      // 检查括号配对
      const bracketError = this.checkBrackets(code)
      if (bracketError) {
        errors.push(bracketError)
      }

      // 检查语法错误（使用 AST 解析器）
      const syntaxResult = await codeAnalyzerService.parseCode(code)
      if (!syntaxResult.success) {
        errors.push(`Syntax error: ${syntaxResult.error.message}`)
      }

      // 检查常见的代码风格问题
      if (code.includes('var ')) {
        warnings.push('Using "var" is discouraged, consider using "let" or "const"')
      }

      return {
        success: true,
        data: {
          hasErrors: errors.length > 0,
          errors,
          warnings,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VALIDATE_CODE_ERROR',
          message: `Failed to validate code: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 分析代码质量
   */
  async analyzeCodeQuality(code: string): Promise<Result<Record<string, unknown>, ServiceError>> {
    try {
      const metrics: Record<string, unknown> = {}

      // 代码长度
      metrics.lines = code.split('\n').length
      metrics.characters = code.length

      // 缩进检查
      const indentCheck = this.analyzeIndentation(code)
      metrics.hasConsistentIndent = indentCheck.consistent
      metrics.indentStyle = indentCheck.style

      // 命名规范检查
      const namingCheck = this.analyzeNaming(code)
      metrics.namingCompliance = namingCheck.compliance
      metrics.namingIssues = namingCheck.issues

      // 复杂度估计
      metrics.complexity = this.estimateComplexity(code)

      return { success: true, data: metrics }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ANALYZE_QUALITY_ERROR',
          message: `Failed to analyze code quality: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
        },
      }
    }
  }

  /**
   * 检查括号配对
   */
  private checkBrackets(code: string): string | null {
    const stack: string[] = []
    const pairs: Record<string, string> = {
      '{': '}',
      '[': ']',
      '(': ')',
    }

    for (const char of code) {
      if (pairs[char as keyof typeof pairs]) {
        stack.push(char)
      } else if (Object.values(pairs).includes(char)) {
        const last = stack.pop()
        if (!last || pairs[last] !== char) {
          return `Mismatched brackets around "${char}"`
        }
      }
    }

    if (stack.length > 0) {
      return `Unclosed bracket: "${stack[stack.length - 1]}"`
    }

    return null
  }

  /**
   * 分析代码缩进
   */
  private analyzeIndentation(code: string): { consistent: boolean; style: string } {
    const lines = code.split('\n')
    const indents = new Set<string>()

    for (const line of lines) {
      const match = line.match(/^(\s*)/)
      if (match && match[1]) {
        indents.add(match[1])
      }
    }

    // 检查是否使用了制表符或空格
    const hasTab = Array.from(indents).some((i) => i.includes('\t'))
    const hasSpace = Array.from(indents).some((i) => i.includes(' '))

    const style = hasTab ? 'tabs' : 'spaces'
    const consistent = !(hasTab && hasSpace)

    return { consistent, style }
  }

  /**
   * 分析命名规范
   */
  private analyzeNaming(code: string): { compliance: number; issues: string[] } {
    const issues: string[] = []

    // 检查变量名是否使用驼峰命名
    const varMatches = code.match(/\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || []

    let compliantCount = 0
    const checkSet = new Set<string>()

    for (const match of varMatches) {
      const name = match.split(/\s+/)[2]
      if (checkSet.has(name)) continue
      checkSet.add(name)

      // 检查是否为驼峰命名（首字母小写）
      const isCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(name) || /^_[a-zA-Z0-9]*$/.test(name)
      if (isCamelCase) {
        compliantCount++
      } else {
        issues.push(`Variable "${name}" should use camelCase`)
      }
    }

    const total = checkSet.size
    const compliance = total > 0 ? (compliantCount / total) * 100 : 100

    return { compliance: Math.round(compliance), issues }
  }

  /**
   * 估计代码复杂度（简单的圈复杂度估计）
   */
  private estimateComplexity(code: string): number {
    let complexity = 1

    // 计算条件分支
    const ifCount = (code.match(/\bif\s*\(/g) || []).length
    const elseCount = (code.match(/\belse\s*\{/g) || []).length
    const caseCount = (code.match(/\bcase\s+/g) || []).length
    const forCount = (code.match(/\b(for|while)\s*\(/g) || []).length
    const ternaryCount = (code.match(/\s\?\s/g) || []).length

    complexity += ifCount + elseCount + caseCount + forCount + ternaryCount * 0.5

    return Math.round(complexity)
  }
}

/**
 * Service 单例实例
 */
export const testService = new TestServiceImpl()

/**
 * 导出接口供其他模块使用
 */
export type { TestServiceAPI }
