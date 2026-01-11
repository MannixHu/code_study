# - Phase 1 架构重组完成文档

**项目版本:** Phase 1 Architecture Refactor
**完成日期:** 2025-01-10
**分支:** refactor/phase1-architecture

## 📋 概述

项目已完成从**type-based目录结构**到**feature-based目录结构**的重组。这次重构建立了清晰的模块边界、统一的导出规范，并为未来的扩展奠定了坚实的基础。

## 🏗️ 架构设计

### 旧架构 (Type-Based)

```
src/
├── components/      # 所有组件混在一起
├── hooks/          # 所有hooks混在一起
├── services/       # 所有服务混在一起
├── types/          # 所有类型混在一起
├── utils/
├── db/
└── store/
```

**问题：**

- 功能相关的代码分散在不同目录
- 难以找到特定功能的所有代码
- 模块间的依赖关系不清晰
- 难以复用整个功能模块

### 新架构 (Feature-Based)

```
src/
├── features/           # 特性模块（垂直切分）
│   ├── lessons/       # 课程管理特性
│   ├── editor/        # 代码编辑特性
│   ├── progress/      # 学习进度特性
│   └── testing/       # 测试特性（预留）
│
├── shared/            # 共享资源
│   ├── components/    # 通用UI组件
│   ├── db/           # 数据库配置
│   ├── types/        # 全局类型
│   ├── utils/        # 工具函数
│   ├── constants/    # 常量配置
│   └── styles/       # 全局样式
│
├── store/            # 全局状态管理
│   └── slices/       # Zustand store slices
│
├── App.tsx
├── main.tsx
└── index.css
```

**优势：**

- ✅ 功能内聚 - 相关代码集中在一起
- ✅ 清晰的模块边界 - 特性之间独立
- ✅ 易于维护 - 修改特性只影响特性内代码
- ✅ 易于复用 - 特性可以整体移动或复用
- ✅ 易于扩展 - 添加新特性遵循统一模式

## 📂 目录结构详解

### 特性模块 (features/)

每个特性是自包含的垂直切片，包含：

```
features/{featureName}/
├── components/    # UI组件
├── hooks/        # 自定义React hooks
├── services/     # 业务逻辑和API调用
├── repository/   # 数据持久化（可选）
├── types/        # TypeScript类型定义
├── utils/        # 辅助函数（可选）
├── workers/      # Web Workers（可选）
├── constants/    # 特性常量（可选）
└── index.ts      # 公开API导出
```

**特性内的依赖流向：**

```
types ←────────┐
      ↓        │
repository ← services ← hooks ← components
               ↓
          (export via index.ts)
```

### 三层架构

每个特性内遵循三层架构：

1. **Presentation Layer (组件)**
   - React组件
   - 只关注UI展现
   - 通过props和callbacks与业务层通信

2. **Business Logic Layer (Hooks & Services)**
   - 业务逻辑和状态管理
   - 数据转换和验证
   - 与repository和其他服务通信

3. **Data Layer (Repository)**
   - 数据持久化
   - IndexedDB操作
   - 本地缓存

### 全局状态管理 (store/)

使用Zustand的slice模式组织状态：

```
store/
├── slices/
│   ├── lesson.ts      # LessonStore - 课程状态
│   ├── editor.ts      # EditorStore - 编辑器状态
│   ├── progress.ts    # ProgressStore - 进度状态
│   ├── ui.ts          # UIStore - UI状态
│   └── index.ts       # 统一导出
└── index.ts           # 重新导出slices
```

**Store职责：**

- 管理全局状态
- 跨特性的状态共享
- UI状态（主题、布局等）

## 🔌 模块通信

### 特性间通信

**推荐方式（✅）：**

1. **通过Global State**

   ```typescript
   // features/editor/hooks/useEditor.ts
   import { useProgressStore } from "../../../store";

   const { addCompletedLesson } = useProgressStore();
   ```

2. **通过Public API**

   ```typescript
   // features/progress/components/TestResults.tsx
   import { progressService } from "../../progress";
   ```

3. **Props/Callbacks**
   ```typescript
   <CodeEditor onTestPass={() => addCompletedLesson()} />
   ```

**禁止方式（❌）：**

- 直接导入其他特性的内部模块
- 特性间的循环依赖
- 跨特性的状态耦合

### 共享资源使用

所有特性都可以使用shared目录的资源：

```typescript
// ✅ 正确
import { AppLayout } from "../../../shared/components/layout";
import type { Store } from "../../../shared/types/store";

// ❌ 错误
import { AppLayout } from "../../../shared/components/layout/AppLayout";
```

## 🔄 依赖关系图

```
    ┌─────────────────────────────────┐
    │        Global State (store/)    │
    │  (lesson, editor, progress, ui) │
    └─────────────────────────────────┘
              ▲                    ▲
              │                    │
    ┌─────────┴──────┬──────────┬──┘
    │                │          │
┌───┴────┐  ┌───────┴──┐  ┌────┴────┐
│ Lessons│  │  Editor  │  │ Progress│
└────────┘  └──────────┘  └─────────┘
    │              │           │
    └──────┬───────┴─────┬─────┘
           │             │
      ┌────┴─────────────┴──────┐
      │   Shared Resources      │
      │  (components, db, types)│
      └─────────────────────────┘
```

## 📦 导出规范

### Public API (index.ts)

每个特性通过 `index.ts` 暴露公开API：

```typescript
// src/features/lessons/index.ts
export { default as LessonSelector } from "./components/LessonSelector";
export { useLesson } from "./hooks/useLesson";
export { lessonService } from "./services/lesson-service";
export type { Lesson, Category } from "./types/lesson";
```

**导出原则：**

- ✅ 导出公开的组件、hooks、服务
- ✅ 导出必要的类型
- ❌ 不导出内部实现细节
- ❌ 不导出未来可能改变的接口

## 🧪 测试策略

### 分层测试

```
┌─────────────────────────────────┐
│      Component Tests (UI)       │  Jest + React Testing Library
├─────────────────────────────────┤
│      Hook Tests (Logic)         │  Jest + @testing-library/react
├─────────────────────────────────┤
│      Service Tests (Business)   │  Jest
├─────────────────────────────────┤
│      Repository Tests (Data)    │  Jest + Mock IndexedDB
└─────────────────────────────────┘
```

### 测试文件位置

```
features/{feature}/
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx
├── hooks/
│   ├── useHook.ts
│   └── useHook.test.ts
├── services/
│   ├── service.ts
│   └── service.test.ts
└── repository/
    ├── repository.ts
    └── repository.test.ts
```

## 🚀 性能优化

### 代码分割

使用动态导入实现特性级代码分割：

```typescript
// 在路由级别进行分割
const Lessons = lazy(() => import("./features/lessons"));
const Editor = lazy(() => import("./features/editor"));
```

### Tree-shaking

- ✅ 使用ESM导出
- ✅ 导出具体符号而不是通配符
- ✅ 标记side effects

## 📋 完成的任务

### Task 1: 创建目录结构 ✅

- 创建 `features/` 目录及各特性子目录
- 创建 `shared/` 目录及各子目录
- 创建 `store/slices/` 目录

### Task 2: 迁移Lesson代码 ✅

- 迁移lesson相关组件、hooks、services
- 创建 `features/lessons/index.ts`
- 更新所有import路径

### Task 3: 迁移Editor代码 ✅

- 迁移editor相关代码
- 创建 `features/editor/index.ts`
- 建立service层

### Task 4: 迁移Progress代码 ✅

- 迁移progress相关代码
- 创建repository和service层
- 创建 `features/progress/index.ts`

### Task 5: 迁移Shared代码 ✅

- 移动layout组件到shared
- 移动数据库配置到shared
- 创建统一的类型定义

### Task 6: 重组Store ✅

- 创建store slices
- 迁移所有store到slices模式
- 更新所有import

### Task 7: 删除旧目录 ✅

- 删除 `src/components/`, `src/hooks/`, `src/services/` 等
- 清理旧的store文件
- 删除重复的lessonData.ts

### Task 8: 修复import路径 ✅

- 修复所有内部导入
- 解决TypeScript类型错误
- 创建缺失的CSS文件

### Task 9: 创建文档 ✅

- 创建 `src/features/README.md`
- 创建 `src/shared/README.md`
- 创建 `ARCHITECTURE.md`

## ✅ 验证结果

### 编译检查

```bash
npm run build
✓ TypeScript compilation successful
✓ Vite build successful
✓ dist/index.js (1,582 KB gzipped)
```

### 结构验证

```
✓ features/{lessons,editor,progress}/index.ts exist
✓ shared/{components,db,types}/index.ts exist
✓ store/slices/{lesson,editor,progress,ui}.ts exist
✓ All imports use correct paths
```

### 功能验证

- ✓ 编译通过，无TypeScript错误
- ✓ 构建成功，可以生成生产包
- ✓ 所有特性代码正确组织
- ✓ 导出API符合规范

## 🔄 Next Steps (Phase 2)

### 计划中的改进

1. **样式系统升级**
   - 实现CSS-in-JS（Styled Components或Emotion）
   - 设计令牌系统
   - 深色模式支持

2. **状态管理优化**
   - 添加middleware for logging
   - 状态持久化
   - 时间旅行调试

3. **测试覆盖**
   - 添加单元测试
   - 添加集成测试
   - E2E测试

4. **性能优化**
   - 代码分割
   - 虚拟滚动
   - 缓存策略

5. **文档完善**
   - API文档
   - 贡献指南
   - 故障排除指南

## 📚 参考资源

### 项目文档

- [Features README](./src/features/README.md) - 特性模块指南
- [Shared README](./src/shared/README.md) - 共享资源指南

### 相关文件

- `tsconfig.app.json` - TypeScript配置
- `vite.config.ts` - Vite配置
- `package.json` - 依赖配置

### 外部资源

- [React Documentation](https://react.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 👥 贡献指南

遵循本架构进行开发：

1. **添加新特性** - 创建 `features/{name}/` 目录
2. **修改现有特性** - 在特性目录内修改
3. **添加共享资源** - 放在 `shared/` 目录
4. **遵循导出规范** - 通过 `index.ts` 暴露API
5. **保持模块独立** - 避免循环依赖

## 📞 支持

如有架构相关的问题，请：

1. 查看相关的README文件
2. 检查代码中的注释
3. 参考类似的实现

---

**Architecture Version:** 1.0.0  
**Last Updated:** 2025-01-10  
**Maintainer:** Claude Code
