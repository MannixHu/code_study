# Phase 1: 项目架构重组 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将MeFlow3从type-based目录结构重组为feature-based结构，建立清晰的模块边界和统一的导出规范。

**Architecture:** 将现有的 `/src/components`, `/src/services`, `/src/hooks` 等按功能垂直切分为 `/src/features/{lessons,editor,progress,testing}` 和 `/src/shared`。每个feature自包含，通过 `index.ts` 暴露公开API。Store使用slices模式组织。

**Tech Stack:** React 19, TypeScript 5.9, Zustand 5.0, Vite 7

---

## Task 1: 创建新的目录结构

**Files:**
- Create: `src/features/lessons/` (directory structure)
- Create: `src/features/editor/` (directory structure)
- Create: `src/features/progress/` (directory structure)
- Create: `src/features/testing/` (directory structure)
- Create: `src/shared/` (directory structure)
- Create: `src/store/slices/` (directory structure)

**Step 1: 创建features目录结构**

```bash
mkdir -p src/features/{lessons,editor,progress,testing}/{components,hooks,services,types}
mkdir -p src/shared/{components,hooks,types,constants,utils,styles,db}
mkdir -p src/store/slices
```

**Step 2: 验证目录创建成功**

```bash
tree src/features -L 3
tree src/shared -L 2
```

Expected: 所有目录结构正确创建

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: create new feature-based directory structure"
```

---

## Task 2: 迁移Lesson相关代码到features/lessons

**Files:**
- Move: `src/components/LessonSelector.tsx` → `src/features/lessons/components/`
- Move: `src/components/CategoryTabs.tsx` → `src/features/lessons/components/`
- Move: `src/components/pages/LearningPage.tsx` → `src/features/lessons/components/LearningPage.tsx`
- Move: `src/hooks/useLesson.ts` → `src/features/lessons/hooks/`
- Move: `src/services/lesson-service.ts` → `src/features/lessons/services/`
- Move: `src/types/lesson.ts` → `src/features/lessons/types/`
- Copy: `src/lessonData.ts` → `src/features/lessons/constants/lessonData.ts`

**Step 1: 迁移lesson组件**

```bash
# 移动LessonSelector和CategoryTabs
mv src/components/LessonSelector.tsx src/features/lessons/components/
mv src/components/CategoryTabs.tsx src/features/lessons/components/
mv src/components/pages/LearningPage.tsx src/features/lessons/components/
```

**Step 2: 迁移lesson hooks和services**

```bash
mv src/hooks/useLesson.ts src/features/lessons/hooks/
mv src/services/lesson-service.ts src/features/lessons/services/
mv src/types/lesson.ts src/features/lessons/types/
cp src/lessonData.ts src/features/lessons/constants/lessonData.ts
```

**Step 3: 创建features/lessons/index.ts导出文件**

```typescript
// src/features/lessons/index.ts
/**
 * @module features/lessons
 * @description Lesson feature - 课程管理、选择、展示
 */

export { LessonSelector } from './components/LessonSelector'
export { CategoryTabs } from './components/CategoryTabs'
export { LearningPage } from './components/LearningPage'

export { useLesson } from './hooks/useLesson'

export { lessonService } from './services/lesson-service'

export type { Lesson, LessonCategory } from './types/lesson'

export { lessonData } from './constants/lessonData'
```

**Step 4: 更新导入路径 (src/App.tsx)**

```typescript
// 旧方式
import { useLesson } from './hooks'
import { lessonService } from './services'
import AppLayout from './components/layout/AppLayout'

// 新方式
import { useLesson, lessonService } from './features/lessons'
import AppLayout from './components/layout/AppLayout'
```

**Step 5: 验证编译通过**

```bash
npm run build
```

Expected: 构建成功，无TypeScript错误

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: migrate lesson feature to features/lessons"
```

---

## Task 3: 迁移Editor相关代码到features/editor

**Files:**
- Move: `src/components/editor/CodeEditor.tsx` → `src/features/editor/components/`
- Move: `src/hooks/useEditor.ts` → `src/features/editor/hooks/`
- Move: `src/hooks/useTestRunner.ts` → `src/features/editor/hooks/`
- Move: `src/services/code-analyzer.ts` → `src/features/editor/services/`
- Move: `src/services/test-service.ts` → `src/features/editor/services/`
- Move: `src/types/service.ts` → `src/features/editor/types/service.ts`
- Move: `src/utils/ast-tester.ts` → `src/features/editor/utils/`
- Move: `src/workers/ast-worker.ts` → `src/features/editor/workers/`

**Step 1: 迁移editor组件和相关文件**

```bash
mv src/components/editor/CodeEditor.tsx src/features/editor/components/
mv src/hooks/useEditor.ts src/features/editor/hooks/
mv src/hooks/useTestRunner.ts src/features/editor/hooks/
mv src/services/code-analyzer.ts src/features/editor/services/
mv src/services/test-service.ts src/features/editor/services/
mv src/types/service.ts src/features/editor/types/
mv src/utils/ast-tester.ts src/features/editor/utils/
mv src/workers/ast-worker.ts src/features/editor/workers/
```

**Step 2: 创建src/features/editor/index.ts导出**

```typescript
// src/features/editor/index.ts
/**
 * @module features/editor
 * @description Editor feature - 代码编辑、分析、测试运行
 */

export { CodeEditor } from './components/CodeEditor'

export { useEditor } from './hooks/useEditor'
export { useTestRunner } from './hooks/useTestRunner'

export { codeAnalyzer } from './services/code-analyzer'
export { testService } from './services/test-service'

export type { CodeAnalysisResult, TestResult } from './types/service'

export { astTester } from './utils/ast-tester'
```

**Step 3: 更新导入路径**

需要找到并更新所有引用这些模块的地方。主要是App.tsx和其他组件中的import语句。

```bash
grep -r "from.*services/code-analyzer" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*hooks/useEditor" src/ --include="*.ts" --include="*.tsx"
```

然后将这些import改为：
```typescript
import { codeAnalyzer, testService } from './features/editor'
import { useEditor, useTestRunner } from './features/editor'
```

**Step 4: 验证编译通过**

```bash
npm run build
```

Expected: 构建成功

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: migrate editor feature to features/editor"
```

---

## Task 4: 迁移Progress相关代码到features/progress

**Files:**
- Move: `src/components/feedback/TestResults.tsx` → `src/features/progress/components/`
- Move: `src/hooks/useProgress.ts` → `src/features/progress/hooks/`
- Move: `src/services/progress-service.ts` → `src/features/progress/services/`
- Move: `src/repository/progress-repository.ts` → `src/features/progress/repository/`
- Move: `src/store/progressStore.ts` → `src/store/slices/progress.ts` (重命名并调整)

**Step 1: 迁移progress相关文件**

```bash
mv src/components/feedback/TestResults.tsx src/features/progress/components/
mv src/hooks/useProgress.ts src/features/progress/hooks/
mv src/services/progress-service.ts src/features/progress/services/
mv src/repository/progress-repository.ts src/features/progress/repository/
```

**Step 2: 迁移progress store**

```bash
# 暂时复制到slices，稍后处理
cp src/store/progressStore.ts src/store/slices/progress.ts
```

**Step 3: 创建src/features/progress/index.ts**

```typescript
// src/features/progress/index.ts
/**
 * @module features/progress
 * @description Progress feature - 学习进度跟踪、课程完成状态
 */

export { TestResults } from './components/TestResults'

export { useProgress } from './hooks/useProgress'

export { progressService } from './services/progress-service'

export type { ProgressState } from './types/progress'
```

**Step 4: 创建features/progress/types/progress.ts**

```typescript
// src/features/progress/types/progress.ts
/**
 * @module features/progress/types
 * @description Progress feature types
 */

export interface ProgressState {
  completedLessonIds: Set<string>
  currentProgress: number
}

export interface ProgressRecord {
  lessonId: string
  categoryId: string
  completedAt: number
  score?: number
}
```

**Step 5: 验证编译通过**

```bash
npm run build
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: migrate progress feature to features/progress"
```

---

## Task 5: 迁移共享代码到shared目录

**Files:**
- Move: `src/components/layout/` → `src/shared/components/layout/`
- Move: `src/db/dexie-db.ts` → `src/shared/db/`
- Create: `src/shared/constants/` (存放应用级常量)
- Create: `src/shared/utils/lesson-loader.ts` (从src/utils迁移)

**Step 1: 迁移layout组件到shared**

```bash
mkdir -p src/shared/components
mv src/components/layout src/shared/components/

# 删除现在为空的components/layout和components/feedback/pages等目录
rmdir src/components/editor src/components/feedback src/components/pages 2>/dev/null
```

**Step 2: 迁移数据库配置**

```bash
mv src/db/dexie-db.ts src/shared/db/
rmdir src/db
```

**Step 3: 创建shared/types/index.ts收集通用类型**

```typescript
// src/shared/types/index.ts
/**
 * @module shared/types
 * @description 全局类型定义
 */

export type { Store } from './store'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ServiceResult<T> {
  success: true
  data: T
}
| {
  success: false
  error: string
}
```

**Step 4: 创建shared/index.ts**

```typescript
// src/shared/index.ts
/**
 * @module shared
 * @description 共享资源、通用组件、工具函数
 */

export * from './components'
export * from './db'
export * from './types'
export * from './utils'
```

**Step 5: 验证编译通过**

```bash
npm run build
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: migrate shared resources to shared directory"
```

---

## Task 6: 重组Store使用slices模式

**Files:**
- Modify: `src/store/slices/lesson.ts` (从lessonStore.ts转换)
- Modify: `src/store/slices/progress.ts` (从progressStore.ts转换)
- Modify: `src/store/slices/editor.ts` (从editorStore.ts转换)
- Create: `src/store/slices/ui.ts` (从uiStore.ts转换)
- Create: `src/store/slices/index.ts` (统一导出所有slices)
- Modify: `src/store/index.ts` (简化为导出所有store)

**Step 1: 迁移现有store到slices**

```bash
# 复制现有store到slices目录（保留原文件以便参考）
cp src/store/lessonStore.ts src/store/slices/lesson.ts
cp src/store/editorStore.ts src/store/slices/editor.ts
cp src/store/progressStore.ts src/store/slices/progress.ts
cp src/store/uiStore.ts src/store/slices/ui.ts
```

**Step 2: 更新src/store/slices/lesson.ts**

```typescript
// src/store/slices/lesson.ts
/**
 * @module store/slices/lesson
 * @description Lesson store slice - 课程选择和分类状态
 */

import { create } from 'zustand'

export interface LessonState {
  currentCategoryId: string
  setCurrentCategoryId: (id: string) => void
}

export const useLessonStore = create<LessonState>((set) => ({
  currentCategoryId: 'basics',
  setCurrentCategoryId: (id: string) => set({ currentCategoryId: id }),
}))
```

**Step 3: 创建src/store/slices/index.ts**

```typescript
// src/store/slices/index.ts
/**
 * @module store/slices
 * @description 所有store slices的统一导出
 */

export { useLessonStore, type LessonState } from './lesson'
export { useEditorStore, type EditorState } from './editor'
export { useProgressStore, type ProgressState } from './progress'
export { useUiStore, type UiState } from './ui'
```

**Step 4: 简化src/store/index.ts**

```typescript
// src/store/index.ts
/**
 * @module store
 * @description Zustand stores - 应用全局状态管理
 */

export * from './slices'
```

**Step 5: 更新所有import语句**

查找并替换所有store的导入：
```bash
# 查找所有store导入
grep -r "from.*store" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```

将旧import改为新的：
```typescript
// 旧
import { useLessonStore } from './store/lessonStore'

// 新
import { useLessonStore } from './store'
```

**Step 6: 验证编译通过**

```bash
npm run build
```

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: reorganize stores using slices pattern"
```

---

## Task 7: 删除旧目录结构并清理

**Files:**
- Delete: `src/components/` (现在为空或只有旧文件)
- Delete: `src/hooks/` (已迁移)
- Delete: `src/services/` (已迁移)
- Delete: `src/types/` (已迁移)
- Delete: `src/utils/` (已迁移)
- Delete: `src/repository/` (已迁移)
- Delete: `src/workers/` (已迁移)
- Delete: `src/store/` 旧文件 (保留slices)

**Step 1: 删除旧目录**

```bash
# 只删除已经迁移的目录（确保都是空的）
rm -rf src/components
rm -rf src/hooks
rm -rf src/services
rm -rf src/types
rm -rf src/utils
rm -rf src/repository
rm -rf src/workers
rm -rf src/store/editorStore.ts src/store/lessonStore.ts src/store/progressStore.ts src/store/uiStore.ts
```

**Step 2: 确保lessonData.ts已被复制**

```bash
# 验证lessonData已在新位置
ls src/features/lessons/constants/lessonData.ts
# 如果旧的还存在，删除它
rm src/lessonData.ts 2>/dev/null || true
```

**Step 3: 更新App.tsx的导入**

读取App.tsx并更新所有import为新的路径：

```typescript
// src/App.tsx
/**
 * App.tsx - 主应用组件
 * 重构后的版本：仅处理布局组合，业务逻辑委托给 hooks 和 stores
 */

import { useEffect } from 'react'
import { ConfigProvider, theme, Spin } from 'antd'
import { useLesson, lessonService } from './features/lessons'
import { useLessonStore, useProgressStore } from './store'
import { progressService } from './features/progress'
import { AppLayout } from './shared/components/layout/AppLayout'
import './App.css'

function App() {
  const { currentCategory, loading, error } = useLesson()
  const { setCompletedLessonIds } = useProgressStore()
  const { currentCategoryId } = useLessonStore()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await progressService.warmupCache()
        const completedResult = await progressService.getCompletedLessons(currentCategoryId)
        if (completedResult.success) {
          setCompletedLessonIds(new Set(completedResult.data))
        }
        await lessonService.preloadAdjacentCategories(currentCategoryId)
      } catch (err) {
        console.error('Failed to initialize app:', err)
      }
    }

    initializeApp()
  }, [currentCategoryId, setCompletedLessonIds])

  if (loading || !currentCategory) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading application</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
        },
      }}
    >
      <AppLayout />
    </ConfigProvider>
  )
}

export default App
```

**Step 4: 验证编译通过**

```bash
npm run build
```

Expected: 构建成功，无errors，可能有warnings（稍后处理）

**Step 5: 验证开发服务器启动**

```bash
npm run dev
```

Expected: 开发服务器成功启动，应用在浏览器中正常运行

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove old directory structure, migration complete"
```

---

## Task 8: 更新所有内部导入路径

**Files:**
- Scan: `src/features/**/*.ts` and `src/features/**/*.tsx`
- Scan: `src/shared/**/*.ts` and `src/shared/**/*.tsx`

**Step 1: 查找所有内部导入**

```bash
# 查找所有包含相对导入的文件
grep -r "from.*\.\/" src/features src/shared --include="*.ts" --include="*.tsx" | head -20
```

**Step 2: 修复特定的导入路径**

对于features目录内的相对导入，确保：
- 同一feature内部的导入使用相对路径（./）
- 其他feature的导入通过公开API（最上级index.ts）
- shared资源的导入使用 `'@/shared'` 或相对路径

```typescript
// 例：src/features/editor/components/CodeEditor.tsx
// ✅ 正确：同feature内的相对导入
import { useEditor } from '../hooks'

// ✅ 正确：其他feature通过公开API
import { lessonService } from '../../lessons'

// ✅ 正确：shared资源
import { AppLayout } from '../../../shared/components/layout'
```

**Step 3: 检查是否有循环依赖**

```bash
# 使用TypeScript编译检查
npm run build
```

如果有循环依赖错误，需要手动修复（通常通过提取公共类型到shared/types）

**Step 4: 验证编译通过**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: fix internal import paths across features"
```

---

## Task 9: 创建README和文件头注释模板

**Files:**
- Create: `src/features/README.md` - Features目录说明
- Create: `src/shared/README.md` - Shared目录说明
- Create: `src/FILE_HEADER_TEMPLATE.md` - 文件头注释模板

**Step 1: 创建features/README.md**

```markdown
# Features Directory

This directory contains feature-based modules. Each feature is self-contained with its own components, hooks, services, and types.

## Structure

- **components/** - UI components for this feature
- **hooks/** - Custom React hooks for this feature
- **services/** - Business logic and API calls
- **types/** - TypeScript interfaces and types
- **utils/** - Utility functions
- **index.ts** - Public API export

## Rules

1. Import from public API (index.ts) when using features
2. Don't import internal modules from other features directly
3. Share code through ./shared directory
4. Keep feature self-contained and focused

## Features

### lessons
Lesson selection, category management, lesson display

### editor
Code editing, AST analysis, test running

### progress
Progress tracking, completion status, statistics

### testing
Test result display, test execution
```

**Step 2: 创建shared/README.md**

```markdown
# Shared Directory

Contains shared resources used across features.

## Structure

- **components/** - Reusable UI components (Layout, Header, etc.)
- **hooks/** - Global hooks (useTheme, useWindowSize, etc.)
- **types/** - Global type definitions
- **constants/** - Application constants
- **utils/** - Utility functions
- **styles/** - Global styles and theme
- **db/** - Database configuration

## Usage

Import from shared when you need cross-feature resources:

```typescript
import { AppLayout } from '@/shared/components'
import { useTheme } from '@/shared/hooks'
```
```

**Step 3: Commit**

```bash
git add -A
git commit -m "docs: add README and structure documentation"
```

---

## Task 10: 验证整个项目的构建和运行

**Files:**
- Test: Build process
- Test: Development server
- Test: No console errors

**Step 1: 完整构建**

```bash
npm run build
```

Expected: 构建成功，bundle大小合理

**Step 2: 启动开发服务器**

```bash
npm run dev
```

Expected: 服务器启动成功，日志中无error

**Step 3: 手动测试应用**

1. 打开 http://localhost:5173
2. 检查应用是否正常加载
3. 测试课程选择功能
4. 测试编辑器功能
5. 检查浏览器console是否有错误

**Step 4: Commit最终状态**

```bash
git add -A
git commit -m "refactor: phase 1 complete - architecture reorganization finished"
```

---

## Summary

Phase 1完成后，你将获得：

✅ **清晰的feature-based架构** - 便于理解和维护
✅ **明确的模块边界** - 减少意外的循环依赖
✅ **统一的导出规范** - 通过index.ts暴露公开API
✅ **可扩展的结构** - 新feature直接添加到features目录
✅ **完整的文档** - README和文件头注释

下一阶段（Phase 2）将专注于：
- 代码标准化（命名规范、类型定义）
- 错误处理统一
- 添加单元测试

---

## Execution Options

Plan complete and saved to `docs/plans/2025-01-10-refactor-phase1-architecture.md`.

**选择你的执行方式：**

1. **Subagent-Driven（本会话）** - 我为每个task创建subagent，task间进行code review，快速迭代
2. **Parallel Session（单独会话）** - 在这个worktree中开启新session使用executing-plans，批量执行带检查点

**哪个方式？**
