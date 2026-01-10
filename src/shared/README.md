# Shared Directory

该目录包含应用中共享的资源，包括通用组件、工具函数、类型定义和数据库配置。

## 目录结构

```
shared/
├── components/
│   ├── layout/          # 应用布局组件
│   │   ├── AppLayout.tsx
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   └── layout.css
│   └── index.ts         # 组件导出
│
├── db/
│   ├── dexie-db.ts      # IndexedDB配置和操作
│   └── index.ts         # 导出
│
├── types/
│   ├── store.ts         # 全局store类型定义
│   ├── service.ts       # 服务返回类型
│   └── index.ts         # 类型导出
│
├── utils/
│   ├── lesson-loader.ts # 课程数据加载工具
│   ├── validators.ts    # 通用验证函数
│   └── index.ts         # 工具导出
│
├── constants/
│   ├── app-config.ts    # 应用配置
│   └── index.ts         # 常量导出
│
├── styles/
│   └── variables.css    # CSS变量和全局样式
│
└── index.ts             # 共享资源总导出
```

## 使用规则

### 1. 何时使用 Shared

将以下内容放在 `shared/` 中：

✅ **应该放在shared中：**
- 多个特性都需要的通用组件（布局、模态框等）
- 多个特性都需要的工具函数
- 全局类型定义
- 应用级常量
- 数据库配置
- 跨特性的事件系统

❌ **不应该放在shared中：**
- 仅某一特性使用的组件
- 特定业务逻辑（属于特性）
- 特性专属的hooks或services

### 2. 导入方式

```typescript
// ✅ 正确：从shared导入
import { AppLayout } from '../../../shared/components/layout'
import { validateEmail } from '../../../shared/utils/validators'
import type { ApiResponse } from '../../../shared/types/service'

// ❌ 错误：直接导入模块内部
import { validateEmail } from '../../../shared/utils/validators.ts'
```

### 3. 添加新的共享资源

**步骤：**
1. 在对应的子目录中创建新文件
2. 在该目录的 `index.ts` 中导出
3. 在 `src/shared/index.ts` 中添加导出

**示例 - 添加新工具函数：**

```typescript
// src/shared/utils/string-helpers.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// src/shared/utils/index.ts
export * from './validators'
export * from './lesson-loader'
export * from './string-helpers'  // 新增

// src/shared/index.ts
export * from './utils'  // 自动包含新的string-helpers
```

## 各子目录说明

### components/

共享的UI组件，主要是应用级布局。

**AppLayout** - 主应用布局，包含：
- 顶部Header（分类标签、统计）
- 左侧Sidebar（课程选择、题目信息）
- 主内容区域（代码编辑器和测试结果）

使用方式：
```typescript
import { AppLayout } from '@/shared/components/layout'

function App() {
  return <AppLayout />
}
```

### db/

数据库配置和操作，基于Dexie.js。

**导出：**
- `db` - Dexie数据库实例
- `saveProgress()` - 保存学习进度
- `getProgress()` - 获取学习进度
- `getAllProgress()` - 获取所有进度
- 其他数据库操作函数

### types/

全局类型定义。

**store.ts** - Zustand store的类型接口
**service.ts** - 服务返回值类型（Result、ServiceError等）

### utils/

工具函数集合。

**validators.ts** - 通用验证函数
**lesson-loader.ts** - 课程数据加载和转换

### constants/

应用级别的常量。

**app-config.ts** - 应用配置项
- API端点
- 超时时间
- 功能开关等

### styles/

全局样式和CSS变量。

**variables.css** - CSS自定义属性（变量）

```css
:root {
  --color-primary: #6366f1;
  --color-success: #52c41a;
  --color-error: #ff4d4f;
  --spacing-unit: 8px;
}
```

## 更新Shared资源的注意事项

### 破坏性变更

修改导出接口时，需要注意所有依赖的地方：

```bash
# 查找所有导入特定工具的地方
grep -r "from.*shared" src/features --include="*.ts" --include="*.tsx"

# 或者查找特定的导入
grep -r "validateEmail" src/ --include="*.ts" --include="*.tsx"
```

### 版本控制

对shared的修改应该：
1. 被标记为breaking change（如果API改变）
2. 同时更新所有依赖的特性
3. 在一次commit中完成（保持原子性）

## 性能考虑

### 代码分割

大型共享组件可以考虑动态导入：

```typescript
// 不好：所有特性都会加载AppLayout
import { AppLayout } from '../shared/components/layout'

// 好：按需加载
const AppLayout = lazy(() => import('../shared/components/layout'))
```

### 类型导出

仅导出类型，不导出实现：

```typescript
// ✅ 好的做法
export type { Store } from './store'

// ❌ 避免
export { store, type Store } from './store'
```

## 共享资源清单

| 资源 | 位置 | 用途 |
|-----|------|------|
| AppLayout | components/layout | 主应用布局 |
| AppHeader | components/layout | 顶部导航 |
| AppSidebar | components/layout | 左侧边栏 |
| db | db/dexie-db | IndexedDB操作 |
| validators | utils/validators | 数据验证 |
| lessonLoader | utils/lesson-loader | 课程加载 |

## 迁移指南

如何将代码从特性迁移到shared：

1. **确认是否真的需要共享** - 是否至少有2个特性都需要？
2. **创建文件** - 在shared适当的子目录中创建
3. **添加导出** - 在该目录的index.ts中导出
4. **更新导入** - 在所有特性中更新导入路径
5. **测试** - 确保编译通过，功能正常
6. **删除原文件** - 从特性中删除旧文件
7. **Commit** - 提交"refactor: move X to shared"

## 故障排除

**问题：Shared组件有特性专属逻辑**
- 解决：将特性逻辑抽取到特性的hooks中
- 使用props或callbacks传递特性专属行为

**问题：Shared类型和特性类型冲突**
- 解决：在shared/types中定义通用基础类型
- 特性扩展这些基础类型

**问题：Shared资源过多难以维护**
- 解决：分离为更细的子模块
- 考虑创建新的shared子目录分类
