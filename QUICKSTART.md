# Phase 1 - 快速开始指南

## 📚 文档导航

| 文档                                                         | 描述     | 时间   |
| ------------------------------------------------------------ | -------- | ------ |
| **本文件**                                                   | 快速开始 | 5分钟  |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                         | 架构详解 | 15分钟 |
| [src/features/README.md](./src/features/README.md)           | 特性开发 | 10分钟 |
| [src/shared/README.md](./src/shared/README.md)               | 共享资源 | 10分钟 |
| [PHASE1_COMPLETION_REPORT.md](./PHASE1_COMPLETION_REPORT.md) | 完成报告 | 20分钟 |

---

## 🚀 5分钟快速开始

### 1. 环境准备

```bash
# 切换到新的refactor分支
git checkout refactor/phase1-architecture

# 安装依赖（如有变化）
npm install

# 验证构建
npm run build
# ✓ 应该看到 "built in 3.5s"
```

### 2. 运行开发服务器

```bash
npm run dev
# 访问 http://localhost:5173
```

### 3. 了解项目结构

```bash
# 查看新的目录结构
tree src -L 2
```

**应该看到：**

```
src/
├── features/           # 特性模块
│   ├── lessons/       # 课程特性
│   ├── editor/        # 编辑器特性
│   └── progress/      # 进度特性
├── shared/            # 共享资源
│   ├── components/    # 通用组件
│   ├── db/           # 数据库
│   ├── types/        # 全局类型
│   └── utils/        # 工具函数
└── store/            # 全局状态
    └── slices/       # Store切片
```

---

## 🎯 10分钟理解架构

### 架构转变

```
从 Type-Based 转变为 Feature-Based

Before:                    After:
src/components/     →      src/features/lessons/components/
src/hooks/          →      src/features/lessons/hooks/
src/services/       →      src/features/lessons/services/
src/types/          →      src/features/lessons/types/
```

### 三个核心特性

#### 1️⃣ lessons （课程管理）

```typescript
// 使用课程特性
import { useLesson, lessonService } from "./features/lessons";

// hooks
const { currentLesson, currentCategory } = useLesson();

// 组件
import { LessonSelector, CategoryTabs, LearningPage } from "./features/lessons";
```

#### 2️⃣ editor （代码编辑）

```typescript
// 使用编辑器特性
import { useEditor, useTestRunner, CodeEditor } from "./features/editor";

// hooks
const { userCode, setUserCode } = useEditor();
const { runTests } = useTestRunner();

// 服务
import { testService, codeAnalyzerService } from "./features/editor";
```

#### 3️⃣ progress （学习进度）

```typescript
// 使用进度特性
import { useProgress, progressService, TestResults } from "./features/progress";

// hooks
const { completedLessonIds } = useProgress();

// 组件
import { TestResults } from "./features/progress";
```

### 全局状态（Store）

```typescript
// 使用全局状态
import {
  useLessonStore,
  useEditorStore,
  useProgressStore,
  useUIStore,
} from "./store";

// 访问和修改状态
const { currentCategoryId, setCurrentCategoryId } = useLessonStore();
```

---

## 💻 20分钟学会编码规范

### ✅ 正确的导入方式

```typescript
// 1. 导入其他特性 - 通过public API
import { useLesson, lessonService } from "./features/lessons";
import { CodeEditor, useEditor } from "./features/editor";
import { useProgress } from "./features/progress";

// 2. 同一特性内部 - 使用相对路径
import { useLesson } from "../hooks/useLesson";
import { lessonService } from "../services/lesson-service";

// 3. 共享资源
import { AppLayout } from "./shared/components/layout";
import type { Store } from "./shared/types/store";

// 4. 全局状态
import { useLessonStore } from "./store";
```

### ❌ 错误的导入方式

```typescript
// 不要直接导入其他特性的内部模块
import { useLesson } from './features/lessons/hooks/useLesson'  ❌
import LessonSelector from './features/lessons/components/LessonSelector'  ❌

// 不要跨特性导入
import { lessonService } from './services/lesson-service'  ❌

// 不要导入内部实现细节
import { lessonRepository } from './features/lessons/repository'  ❌
```

### 特性内的最佳实践

```typescript
// src/features/{name}/components/MyComponent.tsx
import { useMyHook } from "../hooks/useMyHook"; // ✅ 相对导入
import type { MyType } from "../types/my-type"; // ✅ 类型导入
import { myService } from "../services/my-service"; // ✅ 同特性
import { useLesson } from "../../lessons"; // ✅ 其他特性用public API
import { AppLayout } from "../../../shared/components"; // ✅ 共享资源
```

---

## 🔧 常见任务

### 任务 1: 添加新的课程

```typescript
// src/features/lessons/components/LessonSelector.tsx
// 代码已存在，只需修改数据

// 修改：src/features/lessons/constants/lessonData.ts
// 添加你的新课程数据
```

### 任务 2: 修改编辑器功能

```typescript
// src/features/editor/components/CodeEditor.tsx
// 修改组件

// src/features/editor/services/test-service.ts
// 修改测试逻辑
```

### 任务 3: 添加新的进度跟踪

```typescript
// src/features/progress/services/progress-service.ts
// 修改进度服务

// src/features/progress/components/TestResults.tsx
// 修改展示组件
```

### 任务 4: 添加全局状态

```typescript
// 在 src/store/slices/your-slice.ts 中创建新store
// 在 src/store/slices/index.ts 中导出
// 在整个应用中使用
```

### 任务 5: 添加新特性

```bash
# 创建目录结构
mkdir -p src/features/your-feature/{components,hooks,services,types}

# 创建index.ts
touch src/features/your-feature/index.ts

# 在index.ts中定义public API
# export { YourComponent } from './components/YourComponent'
# export { useYourHook } from './hooks/useYourHook'
# export { yourService } from './services/your-service'
```

---

## 🐛 故障排除

### 问题：编译错误 "Cannot find module"

**原因：** 导入路径不正确  
**解决：**

```typescript
// 检查：
1. 导入路径是否正确？
2. 目标模块是否在index.ts中导出？
3. 相对路径的深度是否正确？

// 使用正确的导入：
import { useLesson } from './features/lessons'  // ✅
```

### 问题：TypeScript错误 "Property not found"

**原因：** 类型定义不完整  
**解决：**

```typescript
// 检查 src/shared/types/store.ts 中的类型定义
// 确保所有使用的属性都已定义
// 使用 type 关键字导入类型
import type { Store } from "./shared/types";
```

### 问题：构建失败 "Unknown file extension"

**原因：** CSS或其他文件缺失  
**解决：**

```bash
# 检查所有引入的CSS文件是否存在
# 例如：feedback.css, layout.css
# 如果缺失，创建空文件或移动文件到正确位置
```

### 问题：模块加载缓慢

**原因：** bundle大小过大（Phase 2改进）  
**目前：** 正常，后续使用代码分割优化

---

## 📊 项目统计

```
代码行数:        ~7,600 lines
特性数:          3 个
特性文件:        26 个
共享资源:        12 个
配置文件:        ~15 个
文档:            4 份

编译时间:        3.5 秒
构建大小:        1.6 MB (458 KB gzipped)
TypeScript错误:  0
```

---

## 🎓 学习路径

### 第一天：了解架构

1. ✅ 读本文件（5分钟）
2. ✅ 浏览 ARCHITECTURE.md（15分钟）
3. ✅ 运行 `npm run build`（1分钟）
4. ✅ 查看src目录结构（5分钟）

### 第二天：学习特性开发

1. ✅ 读 src/features/README.md（10分钟）
2. ✅ 研究一个特性的代码（30分钟）
3. ✅ 跟随编码规范做练习（30分钟）

### 第三天：开始贡献

1. ✅ 选择一个简单的任务
2. ✅ 遵循架构规范实现
3. ✅ 提交 Pull Request

---

## 🚀 下一步

### 立即可做

- [ ] 浏览代码，理解架构
- [ ] 运行开发服务器
- [ ] 修改一个简单的文件验证理解
- [ ] 运行构建确认成功

### 短期计划（Phase 2）

- [ ] 启用 TypeScript 严格模式
- [ ] 添加单元测试
- [ ] 代码分割优化
- [ ] 样式系统升级

### 长期愿景

- [ ] 完整的测试覆盖
- [ ] 性能监控系统
- [ ] 自动化部署流程
- [ ] 详细的API文档

---

## 📞 获取帮助

### 文档资源

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 深入了解架构
- [src/features/README.md](./src/features/README.md) - 特性开发指南
- [src/shared/README.md](./src/shared/README.md) - 共享资源指南

### 代码参考

- `src/features/lessons/` - 完整的特性示例
- `src/features/editor/` - 复杂特性示例
- `src/features/progress/` - 数据持久化示例

### 常见问题

**Q: 如何添加新特性？**  
A: 参考 src/features/README.md 中的"添加新特性"部分

**Q: 导入路径应该怎么写？**  
A: 参考本文件中的"✅ 正确的导入方式"部分

**Q: 构建失败怎么办？**  
A: 参考"🐛 故障排除"部分，或查看构建输出

---

## ✨ 总结

已成功完成 Phase 1 架构重组！

✅ **现在的优势：**

- 清晰的代码组织
- 易于添加新功能
- 易于维护现有代码
- 易于扩展应用
- 完整的文档

🚀 **准备好开始了吗？**

1. 运行 `npm run dev`
2. 打开浏览器访问 http://localhost:5173
3. 开始探索和贡献！

---

**祝你编码愉快！** 🎉

**需要帮助？** 查看相关文档或提出问题。
