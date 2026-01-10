import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import type { TestCase } from '../../lessons/types/lesson'

// AST 检查结果
interface ASTCheckResult {
  passed: boolean
  message?: string
}

/**
 * 使用 AST 解析代码并执行测试
 */
export function testWithAST(code: string, checker: string): ASTCheckResult {
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    })

    // 提取常用的 AST 检查变量
    const context = buildASTContext(ast)

    // 执行 checker 表达式
    const passed = evaluateChecker(checker, context)

    return { passed }
  } catch (error: any) {
    return {
      passed: false,
      message: `代码解析失败: ${error.message}`
    }
  }
}

/**
 * 使用正则模式匹配代码
 */
export function testWithPattern(code: string, pattern: string, minCount?: number): ASTCheckResult {
  try {
    const regex = new RegExp(pattern)

    if (minCount !== undefined) {
      const matches = code.match(new RegExp(pattern, 'g'))
      const count = matches ? matches.length : 0
      return {
        passed: count >= minCount,
        message: count < minCount ? `期望至少 ${minCount} 个匹配，实际 ${count} 个` : undefined
      }
    }

    return {
      passed: regex.test(code)
    }
  } catch (error: any) {
    return {
      passed: false,
      message: `正则表达式错误: ${error.message}`
    }
  }
}

/**
 * 构建 AST 上下文变量
 * 提取常用的代码结构信息供 checker 使用
 */
function buildASTContext(ast: any): Record<string, any> {
  const context: Record<string, any> = {
    // 基础标志
    hasFunctionDeclaration: false,
    hasArrowFunction: false,
    hasReturnStatement: false,
    hasJSX: false,
    isJSXElement: false,

    // 数组收集
    functionNames: [],
    jsxElements: [],
    jsxElementNames: [],
    variableNames: [],
    importedModules: [],

    // Hook 相关
    usesUseState: false,
    usesUseEffect: false,
    usesUseRef: false,
    usesUseCallback: false,
    usesUseMemo: false,
    usesUseContext: false,
    usesCreateContext: false,

    // Props 相关
    hasPropsParameter: false,
    hasPropsDestructuring: false,
    propsNames: [],

    // 其他
    hasConditionalRendering: false,
    hasMapCall: false,
    hasEventHandler: false,
    jsxElementName: null,
  }

  traverse(ast, {
    // 函数声明
    FunctionDeclaration(path) {
      context.hasFunctionDeclaration = true
      if (path.node.id?.name) {
        context.functionNames.push(path.node.id.name)
      }

      // 检查参数
      if (path.node.params.length > 0) {
        const firstParam = path.node.params[0]
        if (firstParam.type === 'Identifier') {
          if (firstParam.name === 'props') {
            context.hasPropsParameter = true
          }
        } else if (firstParam.type === 'ObjectPattern') {
          context.hasPropsDestructuring = true
          firstParam.properties.forEach((prop: any) => {
            if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
              context.propsNames.push(prop.key.name)
            }
          })
        }
      }
    },

    // 箭头函数
    ArrowFunctionExpression(_path) {
      context.hasArrowFunction = true
    },

    // Return 语句
    ReturnStatement(path) {
      context.hasReturnStatement = true
      if (path.node.argument) {
        if (path.node.argument.type === 'JSXElement') {
          context.isJSXElement = true
          const openingElement = (path.node.argument as any).openingElement
          if (openingElement?.name?.type === 'JSXIdentifier') {
            context.jsxElementName = openingElement.name.name
          }
        } else if (path.node.argument.type === 'JSXFragment') {
          context.isJSXElement = true
          context.jsxElementName = 'Fragment'
        }
      }
    },

    // JSX 元素
    JSXElement(path) {
      context.hasJSX = true
      const openingElement = path.node.openingElement
      if (openingElement.name.type === 'JSXIdentifier') {
        const name = openingElement.name.name
        context.jsxElements.push(path.node)
        context.jsxElementNames.push(name)
      }
    },

    // JSX Fragment
    JSXFragment(_path) {
      context.hasJSX = true
      context.jsxElementNames.push('Fragment')
    },

    // 变量声明
    VariableDeclarator(path) {
      if (path.node.id.type === 'Identifier') {
        context.variableNames.push(path.node.id.name)
      }
    },

    // 函数调用（检测 Hook 使用）
    CallExpression(path) {
      if (path.node.callee.type === 'Identifier') {
        const calleeName = path.node.callee.name

        switch (calleeName) {
          case 'useState':
            context.usesUseState = true
            break
          case 'useEffect':
            context.usesUseEffect = true
            break
          case 'useRef':
            context.usesUseRef = true
            break
          case 'useCallback':
            context.usesUseCallback = true
            break
          case 'useMemo':
            context.usesUseMemo = true
            break
          case 'useContext':
            context.usesUseContext = true
            break
          case 'createContext':
            context.usesCreateContext = true
            break
        }
      }

      // 检测 map 调用
      if (path.node.callee.type === 'MemberExpression') {
        if (path.node.callee.property.type === 'Identifier' &&
            path.node.callee.property.name === 'map') {
          context.hasMapCall = true
        }
      }
    },

    // 条件表达式
    ConditionalExpression(_path) {
      context.hasConditionalRendering = true
    },

    // 逻辑表达式（&& 运算符）
    LogicalExpression(path) {
      if (path.node.operator === '&&') {
        context.hasConditionalRendering = true
      }
    },

    // JSX 属性（检测事件处理器）
    JSXAttribute(path) {
      if (path.node.name.type === 'JSXIdentifier') {
        const attrName = path.node.name.name
        if (attrName.startsWith('on')) {
          context.hasEventHandler = true
        }
      }
    },

    // Import 声明
    ImportDeclaration(path) {
      context.importedModules.push(path.node.source.value)
    }
  })

  return context
}

/**
 * 执行 checker 表达式
 * checker 是一个 JavaScript 表达式字符串，使用 context 中的变量
 */
function evaluateChecker(checker: string, context: Record<string, any>): boolean {
  try {
    // 创建一个函数，将 context 中的所有属性作为参数
    const contextKeys = Object.keys(context)
    const contextValues = Object.values(context)

    // 构造函数并执行
    const func = new Function(...contextKeys, `return ${checker}`)
    const result = func(...contextValues)

    return Boolean(result)
  } catch (error) {
    console.error('Checker evaluation error:', error)
    return false
  }
}

/**
 * 执行单个测试用例
 */
export function runTestCase(code: string, testCase: TestCase): ASTCheckResult {
  switch (testCase.type) {
    case 'ast':
      if (!testCase.checker) {
        return { passed: false, message: 'AST checker 未定义' }
      }
      return testWithAST(code, testCase.checker)

    case 'pattern':
      if (!testCase.pattern) {
        return { passed: false, message: 'Pattern 未定义' }
      }
      return testWithPattern(code, testCase.pattern, testCase.minCount)

    case 'runtime':
      // Runtime 测试暂时不支持（需要实际执行代码）
      return { passed: true, message: 'Runtime 测试暂不支持' }

    default:
      return { passed: false, message: '未知的测试类型' }
  }
}

/**
 * 执行所有测试用例
 */
export function runAllTests(code: string, testCases: TestCase[]): Array<ASTCheckResult & { description: string }> {
  return testCases.map(testCase => {
    const result = runTestCase(code, testCase)
    return {
      ...result,
      description: testCase.description
    }
  })
}
