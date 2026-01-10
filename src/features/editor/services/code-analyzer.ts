/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Code Analyzer Service
 * 代码分析和 AST 解析的业务逻辑层
 * 使用 Web Worker 处理 AST 解析以避免阻塞主线程
 */

import type {
  ASTContext,
  CodeAnalyzerAPI,
  Result,
  ServiceError,
} from "../types/service";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

/**
 * Code Analyzer Service 实现
 * 现在使用同步处理（Web Worker 将在后续优化中添加）
 */
class CodeAnalyzerServiceImpl implements CodeAnalyzerAPI {
  /**
   * 解析代码并生成 AST 上下文
   */
  async parseCode(code: string): Promise<Result<ASTContext, ServiceError>> {
    try {
      const context = this.buildASTContext(code);
      return { success: true, data: context };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "PARSE_CODE_ERROR",
          message: `Failed to parse code: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: error,
        },
      };
    }
  }

  /**
   * 评估 checker 表达式
   */
  async evaluateChecker(
    code: string,
    checker: string,
  ): Promise<Result<boolean, ServiceError>> {
    try {
      const context = this.buildASTContext(code);
      const passed = this.evaluateCheckerExpression(checker, context);
      return { success: true, data: passed };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "EVALUATE_CHECKER_ERROR",
          message: `Failed to evaluate checker: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: error,
        },
      };
    }
  }

  /**
   * 异步解析代码（为 Web Worker 预留接口）
   */
  async parseAsync(code: string): Promise<Result<ASTContext, ServiceError>> {
    // 目前与 parseCode 相同，将来可以使用 Web Worker
    return this.parseCode(code);
  }

  /**
   * 构建 AST 上下文
   * 从 AST 中提取常用的检查变量
   */
  private buildASTContext(code: string): ASTContext {
    const context: ASTContext = {
      hasFunctionDeclaration: false,
      functionNames: [],
      hasReturnStatement: false,
      isJSXElement: false,
      jsxElementName: undefined,
      hasJSX: false,
      jsxElements: [],
      usesUseState: false,
      usesUseEffect: false,
    };

    try {
      // 解析代码生成 AST
      const ast = parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
      });

      // 遍历 AST 节点
      traverse(ast, {
        FunctionDeclaration: (path) => {
          context.hasFunctionDeclaration = true;
          if (path.node.id?.name) {
            context.functionNames.push(path.node.id.name);
          }
        },

        FunctionExpression: (path) => {
          context.hasFunctionDeclaration = true;
          if (path.node.id?.name) {
            context.functionNames.push(path.node.id.name);
          }
        },

        ArrowFunctionExpression: () => {
          context.hasFunctionDeclaration = true;
        },

        ReturnStatement: (path) => {
          context.hasReturnStatement = true;

          // 检查返回值是否为 JSX 元素
          if (path.node.argument?.type === "JSXElement") {
            context.isJSXElement = true;
            const openingElement = (path.node.argument as any).openingElement;
            if (openingElement?.name?.name) {
              context.jsxElementName = openingElement.name.name;
            }
          } else if (path.node.argument?.type === "JSXFragment") {
            context.isJSXElement = true;
          }
        },

        JSXElement: (path) => {
          context.hasJSX = true;
          const openingElement = (path.node as any).openingElement;
          if (openingElement?.name?.name) {
            const elementName = openingElement.name.name;
            if (!context.jsxElements.includes(elementName)) {
              context.jsxElements.push(elementName);
            }
          }
        },

        JSXFragment: () => {
          context.hasJSX = true;
        },

        CallExpression: (path) => {
          const calleeName =
            path.node.callee.type === "Identifier"
              ? (path.node.callee as any).name
              : null;

          if (calleeName === "useState") {
            context.usesUseState = true;
          } else if (calleeName === "useEffect") {
            context.usesUseEffect = true;
          } else if (calleeName === "useRef") {
            if (!context.jsxElements) context.jsxElements = [];
            if (!(context.jsxElements as any).includes("useRef")) {
              (context.jsxElements as any).push("useRef");
            }
          } else if (calleeName === "useContext") {
            if (!context.jsxElements) context.jsxElements = [];
            if (!(context.jsxElements as any).includes("useContext")) {
              (context.jsxElements as any).push("useContext");
            }
          }
        },

        VariableDeclarator: (path) => {
          // 检查变量声明模式，用于验证 const/let 的使用
          if (!context["usesConst"]) {
            context["usesConst"] =
              (path.node as any).id?.type === "ObjectPattern";
          }
        },
      });
    } catch (error) {
      // 如果 AST 解析失败，记录错误但继续
      context["parseError"] =
        error instanceof Error ? error.message : "Unknown parse error";
    }

    return context;
  }

  /**
   * 评估 checker 表达式
   * 使用 Function 构造函数动态执行表达式
   */
  private evaluateCheckerExpression(
    checkerExpression: string,
    context: ASTContext,
  ): boolean {
    try {
      // 构建函数参数列表
      const paramNames = Object.keys(context);
      const paramValues = Object.values(context);

      // 动态创建并执行函数
      // 注意：这里使用的是信任的上下文（AST 解析结果），所以相对安全
      const func = new Function(...paramNames, `return ${checkerExpression}`);
      const result = func(...paramValues);

      return Boolean(result);
    } catch (error) {
      console.error("Checker evaluation error:", error);
      return false;
    }
  }

  /**
   * 获取常见的 checker 表达式示例
   * 用于帮助用户编写测试用例
   */
  static getCheckerExamples(): Record<string, string> {
    return {
      "Has function declaration": "hasFunctionDeclaration",
      "Has return statement": "hasReturnStatement",
      "Returns JSX element": "isJSXElement",
      "Has JSX in code": "hasJSX",
      "Uses useState hook": "usesUseState",
      "Uses useEffect hook": "usesUseEffect",
      "Returns specific element (div)": 'jsxElementName === "div"',
      "Contains multiple JSX elements": "jsxElements.length > 1",
      "Has at least one function": "functionNames.length > 0",
    };
  }

  /**
   * 验证 checker 表达式的语法
   */
  static validateCheckerExpression(expression: string): {
    valid: boolean;
    error?: string;
  } {
    try {
      // 尝试编译表达式，看是否有语法错误
      new Function("return " + expression);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Invalid expression",
      };
    }
  }
}

/**
 * Service 单例实例
 */
export const codeAnalyzerService = new CodeAnalyzerServiceImpl();

/**
 * 导出接口供其他模块使用
 */
export type { CodeAnalyzerAPI };
