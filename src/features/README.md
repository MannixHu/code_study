# Features Directory

该目录包含基于特性的模块。每个特性都是自包含的，拥有自己的组件、hooks、服务和类型定义。

## 目录结构

```
features/
├── lessons/          # 课程管理特性
│   ├── components/   # UI组件 (LessonSelector, CategoryTabs, LearningPage)
│   ├── hooks/        # 自定义React hooks (useLesson)
│   ├── services/     # 业务逻辑和数据加载 (lesson-service)
│   ├── types/        # 类型定义 (Lesson, Category等)
│   ├── repository/   # 数据持久化层 (lesson-repository)
│   ├── constants/    # 常量数据 (lessonData)
│   └── index.ts      # 公开API导出
│
├── editor/           # 代码编辑特性
│   ├── components/   # CodeEditor组件
│   ├── hooks/        # 自定义hooks (useEditor, useTestRunner)
│   ├── services/     # 服务层 (test-service, code-analyzer)
│   ├── types/        # 类型定义 (service.ts)
│   ├── utils/        # 工具函数 (ast-tester)
│   ├── workers/      # Web Workers (ast-worker)
│   └── index.ts      # 公开API导出
│
├── progress/         # 学习进度特性
│   ├── components/   # TestResults组件
│   ├── hooks/        # 自定义hooks (useProgress)
│   ├── services/     # 服务层 (progress-service)
│   ├── repository/   # 数据持久化 (progress-repository)
│   ├── types/        # 类型定义
│   └── index.ts      # 公开API导出
│
└── testing/          # 测试特性（预留）
```

## 使用规则

### 1. 导入规范

**✅ 正确做法：**

```typescript
// 导入其他特性时，通过public API (index.ts)
import { useLesson, lessonService } from '../../lessons'
import { useEditor, CodeEditor } from '../../editor'

// 同一特性内部的导入，使用相对路径
import { useProgress } from '../hooks/useProgress'

// 共享资源的导入
import { AppLayout } from '../../../shared/components/layout'
```

**❌ 错误做法：**

```typescript
// 不要直接导入其他特性的内部模块
import { useLesson } from '../../lessons/hooks/useLesson'
import LessonSelector from '../../lessons/components/LessonSelector'

// 避免跨特性的直接导入，除非通过public API
```

### 2. 特性设计原则

- **自包含** - 特性拥有所有需要的代码
- **专注** - 每个特性只关注一个业务域
- **公开API** - 通过 `index.ts` 暴露公开接口
- **类型安全** - 完整的TypeScript类型定义
- **无循环依赖** - 不同特性之间应该形成DAG（有向无环图）

### 3. 特性内的层级

```
特性/
├── types/          # 数据模型、接口
├── components/     # UI组件（呈现层）
├── hooks/          # 业务逻辑和状态（业务层）
├── services/       # 外部API调用和数据转换（服务层）
├── repository/     # 数据持久化（数据层）
├── utils/          # 辅助函数
└── index.ts        # 公开API
```

## 各特性说明

### lessons （课程特性）

负责课程管理、分类浏览和课程展示。

**导出：**
- `LessonSelector` - 课程选择器组件
- `CategoryTabs` - 分类标签组件
- `LearningPage` - 学习页面组件
- `useLesson` - 课程状态hook
- `lessonService` - 课程服务
- 类型：`Lesson`, `Category`, `CategoryMeta`

### editor （编辑特性）

负责代码编辑、语法分析和测试执行。

**导出：**
- `CodeEditor` - 代码编辑器组件
- `useEditor` - 编辑器状态hook
- `useTestRunner` - 测试运行hook
- `testService` - 测试执行服务
- `codeAnalyzerService` - 代码分析服务
- 类型：`CodeAnalysisResult`, `TestResult`

### progress （进度特性）

负责学习进度跟踪、课程完成状态和统计信息。

**导出：**
- `TestResults` - 测试结果展示组件
- `useProgress` - 进度状态hook
- `progressService` - 进度服务
- `progressRepository` - 进度数据持久化
- 类型：`ProgressState`, `ProgressRecord`

## 跨特性通信

当多个特性需要通信时，通过以下方式：

1. **全局状态（Zustand Store）** - 用于必要的全局状态
2. **共享类型** - 在 `shared/types` 中定义
3. **回调函数** - 组件间的props传递
4. **服务事件** - 通过服务方法调用返回值

**避免：** 特性间的直接导入和依赖。

## 添加新特性

新增特性时，遵循以下步骤：

1. 创建 `src/features/your-feature/` 目录
2. 建立基本结构：`components/`, `hooks/`, `services/`, `types/`
3. 在 `index.ts` 中定义公开API
4. 在 `src/store/slices/` 中添加对应的store（如需要）
5. 更新主 `src/features/index.ts` 导出（如有）

```bash
mkdir -p src/features/your-feature/{components,hooks,services,types}
touch src/features/your-feature/index.ts
```

## 故障排除

**问题：编译错误 "Cannot find module"**
- 检查导入路径是否正确
- 确保目标模块已在 `index.ts` 中导出
- 验证相对路径的深度是否正确

**问题：循环依赖**
- 检查特性间是否有相互导入
- 将共享代码移到 `shared/` 目录
- 使用接口/类型而不是直接导入实现

**问题：类型不匹配**
- 确保导入的是类型而不是值
- 使用 `type` 关键字导入类型：`import type { Lesson } from '...'`
- 检查store类型定义是否完整
