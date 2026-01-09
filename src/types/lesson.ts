// 课程难度
export type Difficulty = 'easy' | 'medium' | 'hard'

// 测试用例类型
export interface TestCase {
  type: 'ast' | 'pattern' | 'runtime'
  description: string
  // AST 模式
  checker?: string  // JavaScript 表达式字符串
  // Pattern 模式
  pattern?: string
  minCount?: number
  // Runtime 模式
  validator?: (result: any) => boolean
}

// 课程接口
export interface Lesson {
  id: string
  title: string
  difficulty: Difficulty
  tags: string[]
  estimatedTime: number  // 分钟
  question: string
  description: string
  starterCode: string
  solution: string
  hints: string[]
  testCases: TestCase[]
  scope?: string[]  // 需要注入的 API
}

// 分类接口
export interface Category {
  categoryId: string
  name: string
  description: string
  icon: string
  order: number
  lessons: Lesson[]
}

// 学习进度接口
export interface Progress {
  lessonId: string
  completed: boolean
  attempts: number
  lastAttempt: string  // ISO timestamp
  userCode: string
  passedTests: number
  totalTests: number
}

// 测试结果接口
export interface TestResult {
  description: string
  passed: boolean
  message?: string
}

// 分类元数据（用于导航显示）
export interface CategoryMeta {
  id: string
  name: string
  icon: string
  total: number
  completed: number
}
