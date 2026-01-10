# Features Directory

This directory contains feature-based modules for the MeFlow3 application. Each feature is self-contained with its own components, hooks, services, and types.

## Structure

Each feature follows this pattern:

```
src/features/{featureName}/
├── components/     # React components for this feature
├── hooks/          # Custom React hooks
├── services/       # Business logic and data access
├── types/          # TypeScript interfaces and types
├── index.ts        # Public API export
└── [other]/        # Feature-specific utilities or workers
```

## Features

### lessons
Lesson selection, category management, lesson display

- **Components**: LessonSelector, CategoryTabs, LearningPage
- **Hooks**: useLesson
- **Services**: lessonService
- **Data**: lessonData

### editor
Code editing, AST analysis, test running

- **Components**: CodeEditor
- **Hooks**: useEditor, useTestRunner
- **Services**: codeAnalyzer, testService
- **Utils**: astTester
- **Workers**: ast-worker

### progress
Progress tracking, completion status, test results

- **Components**: TestResults
- **Hooks**: useProgress
- **Services**: progressService
- **Repository**: progressRepository

### testing
(Reserved for future test execution features)

## Import Rules

### ✅ Correct Usage

**From same feature (use relative imports):**
```typescript
import { useEditor } from '../hooks'
import { codeAnalyzer } from '../services'
```

**From other features (use public API):**
```typescript
import { lessonService, useLesson } from '../../features/lessons'
import { progressService } from '../../features/progress'
```

**From shared resources:**
```typescript
import { AppLayout } from '../../shared/components/layout'
import { db } from '../../shared/db'
```

### ❌ Avoid

- Importing internal modules from other features directly
  ```typescript
  // DON'T do this:
  import { LessonSelector } from '../../lessons/components/LessonSelector'
  // DO this instead:
  import { LessonSelector } from '../../features/lessons'
  ```

- Importing deeply nested paths
  ```typescript
  // DON'T:
  import { useLesson } from '../../features/lessons/hooks/useLesson'
  // DO:
  import { useLesson } from '../../features/lessons'
  ```

## Adding a New Feature

1. Create directory: `src/features/newFeature/`
2. Create subdirectories: components, hooks, services, types
3. Implement feature code
4. Create `index.ts` with public API exports
5. Import from `../../features/newFeature` in other modules

## Design Principles

- **Single Responsibility**: Each feature handles one domain
- **Encapsulation**: Internal details are hidden via index.ts
- **Minimal Coupling**: Features communicate through public APIs
- **Reusability**: Shared code goes to `src/shared`
