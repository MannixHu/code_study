/**
 * AST Worker
 * Web Worker 用于在后台线程处理 AST 解析
 * 防止长时间的 AST 解析阻塞主线程
 */

import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import type { ASTWorkerRequest, ASTWorkerResponse, ASTContext } from '../types/service'

/**
 * 处理来自主线程的消息
 */
self.onmessage = (event: MessageEvent<ASTWorkerRequest>) => {
  const { type, id, code, checker } = event.data

  try {
    let response: ASTWorkerResponse

    if (type === 'parse' && code) {
      const context = parseCodeToAST(code)
      response = {
        type: 'success',
        id,
        result: context,
      }
    } else if (type === 'evaluate' && code && checker) {
      const context = parseCodeToAST(code)
      const passed = evaluateChecker(checker, context)
      response = {
        type: 'success',
        id,
        passed,
      }
    } else {
      response = {
        type: 'error',
        id,
        error: 'Invalid request type or missing parameters',
      }
    }

    self.postMessage(response)
  } catch (error) {
    const response: ASTWorkerResponse = {
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    self.postMessage(response)
  }
}

/**
 * 解析代码并生成 AST 上下文
 */
function parseCodeToAST(code: string): ASTContext {
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
  }

  try {
    // 解析代码生成 AST
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    // 遍历 AST 节点
    traverse(ast, {
      FunctionDeclaration: (path) => {
        context.hasFunctionDeclaration = true
        if (path.node.id?.name) {
          context.functionNames.push(path.node.id.name)
        }
      },

      FunctionExpression: (path) => {
        context.hasFunctionDeclaration = true
        if (path.node.id?.name) {
          context.functionNames.push(path.node.id.name)
        }
      },

      ArrowFunctionExpression: (_path) => {
        context.hasFunctionDeclaration = true
      },

      ReturnStatement: (path) => {
        context.hasReturnStatement = true

        // 检查返回值是否为 JSX 元素
        if (path.node.argument?.type === 'JSXElement') {
          context.isJSXElement = true
          const openingElement = (path.node.argument as any).openingElement
          if (openingElement?.name?.name) {
            context.jsxElementName = openingElement.name.name
          }
        } else if (path.node.argument?.type === 'JSXFragment') {
          context.isJSXElement = true
        }
      },

      JSXElement: (path) => {
        context.hasJSX = true
        const openingElement = (path.node as any).openingElement
        if (openingElement?.name?.name) {
          const elementName = openingElement.name.name
          if (!context.jsxElements.includes(elementName)) {
            context.jsxElements.push(elementName)
          }
        }
      },

      JSXFragment: (_path) => {
        context.hasJSX = true
      },

      CallExpression: (path) => {
        const calleeName =
          path.node.callee.type === 'Identifier' ? (path.node.callee as any).name : null

        if (calleeName === 'useState') {
          context.usesUseState = true
        } else if (calleeName === 'useEffect') {
          context.usesUseEffect = true
        }
      },
    })
  } catch (error) {
    // 如果解析失败，记录错误
    context['parseError'] = error instanceof Error ? error.message : 'Unknown parse error'
  }

  return context
}

/**
 * 评估 checker 表达式
 */
function evaluateChecker(checkerExpression: string, context: ASTContext): boolean {
  try {
    const paramNames = Object.keys(context)
    const paramValues = Object.values(context)

    const func = new Function(...paramNames, `return ${checkerExpression}`)
    const result = func(...paramValues)

    return Boolean(result)
  } catch (error) {
    console.error('Checker evaluation error:', error)
    return false
  }
}

// 导出类型供主线程使用
export type { ASTWorkerRequest, ASTWorkerResponse, ASTContext }
