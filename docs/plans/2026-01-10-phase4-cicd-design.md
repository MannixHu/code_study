# Phase 4: CI/CD, Performance & Monitoring - Design Document

**Project:** - React Learning Platform
**Phase:** Phase 4 - CI/CD, Automation & Production Readiness
**Design Date:** 2026-01-10
**Estimated Duration:** 7-10 days
**Status:** 📋 Design Complete → Ready for Implementation

---

## 🎯 Design Overview

### Scope

**Included in Phase 4:**

- ✅ GitHub Actions CI workflows (testing + building)
- ✅ Pre-commit & Pre-push hooks (quality gates)
- ✅ Performance optimization (bundle, lazy loading, React.memo)
- ✅ Monitoring setup (error boundaries, Web Vitals, local logging)

**Excluded from Phase 4:**

- ❌ Deployment (deferred to later)
- ❌ Extensive documentation (only essentials)
- ❌ External monitoring services (Sentry - optional future upgrade)

### Key Decisions

1. **Coverage Strategy**: Proceed with 45% coverage, add tests incrementally
2. **Deployment**: Skip deployment in Phase 4, focus on automation
3. **Hooks Strategy**: Pre-commit (fast) + Pre-push (strict) balance
4. **CI Triggers**: Pull Request + main branch pushes only
5. **Monitoring**: Lightweight local solution (error boundaries + Web Vitals)

---

## 🏗️ Architecture Design

### 1. CI/CD Architecture

#### Two Main Workflows

**Workflow 1: CI Pipeline (`.github/workflows/ci.yml`)**

**Trigger Conditions:**

- Pull Request creation/update
- Push to `main` branch

**Jobs:**

1. **Type Check Job**
   - Run TypeScript compiler (`tsc --noEmit`)
   - Fail fast if type errors

2. **Lint Job**
   - Run ESLint on all files
   - Check code quality and standards

3. **Test Job**
   - Run Jest with coverage
   - Upload coverage to Codecov (optional)
   - Generate coverage badge

4. **Build Job**
   - Production build verification
   - Ensure no build errors

**Parallelization:**

- Type check, lint, test run in parallel
- Build runs after tests pass
- Estimated time: 3-5 minutes

**Workflow 2: Performance Check (`.github/workflows/performance.yml`)**

**Trigger Conditions:**

- Pull Request to `main` branch

**Jobs:**

1. **Bundle Analysis**
   - Build production bundle
   - Analyze bundle size with rollup-plugin-visualizer
   - Check against size budgets
   - Fail if bundle > 500KB (uncompressed)

2. **Lighthouse CI**
   - Run Lighthouse on built app
   - Check performance metrics
   - Post results as PR comment
   - Targets:
     - Performance: ≥ 85
     - Accessibility: ≥ 90
     - Best Practices: ≥ 90
     - SEO: ≥ 80

**Estimated time:** 2-3 minutes

#### Caching Strategy

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Benefits:**

- Faster CI runs (50-70% speedup)
- Reduced network usage
- Consistent builds

---

### 2. Git Hooks Design

#### Husky + Lint-staged Setup

**Tools:**

- **Husky**: Git hooks manager
- **Lint-staged**: Run linters on staged files only

#### Pre-commit Hook (Fast - 10-20s)

**Purpose:** Quick sanity checks before commit

**Checks:**

1. **Lint-staged** (staged files only)
   - ESLint with auto-fix
   - Prettier formatting

2. **TypeScript** (staged files only)
   - Type check modified files

3. **Related Tests**
   - `jest --findRelatedTests`
   - Only tests related to changed files

**Configuration:**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

#### Pre-push Hook (Strict - 30-60s)

**Purpose:** Comprehensive validation before push

**Checks:**

1. **Full TypeScript build**
   - `npm run build -- --noEmit`
   - Catch all type errors

2. **All test suites**
   - `npm test -- --watchAll=false`
   - Ensure nothing is broken

3. **Build verification**
   - `npm run build`
   - Ensure production build works

**Bypass Option:**

- Allow `--no-verify` for emergency situations
- Document when to use it

#### Hook Performance

**Optimization strategies:**

- Use `--findRelatedTests` in pre-commit
- Cache TypeScript incremental builds
- Skip tests that haven't changed
- Parallel execution where possible

---

### 3. Performance Optimization

#### Bundle Optimization

**Analysis Tools:**

- `rollup-plugin-visualizer` for bundle analysis
- Vite built-in code splitting

**Size Targets:**
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Main bundle (raw) | < 500KB | TBD | 🎯 |
| Main bundle (gzip) | < 150KB | TBD | 🎯 |
| Initial load (FCP) | < 1.5s | TBD | 🎯 |

**Optimization Strategies:**

1. **Code Splitting by Routes**

```typescript
// App.tsx
import { lazy, Suspense } from 'react'

const LearningPage = lazy(() => import('./features/lessons/components/LearningPage'))
const ProgressDashboard = lazy(() => import('./features/progress/components/Dashboard'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<LearningPage />} />
        <Route path="/progress" element={<ProgressDashboard />} />
      </Routes>
    </Suspense>
  )
}
```

2. **Lazy Load Heavy Dependencies**

```typescript
// Monaco Editor (large dependency ~2MB)
const CodeEditor = lazy(() => import("@monaco-editor/react"));

// Babel (only needed at runtime)
const loadBabel = async () => {
  const { transform } = await import("@babel/standalone");
  return transform;
};
```

3. **Optimize Antd Imports**

```typescript
// ❌ Bad: Imports entire library
import { Button, Modal } from "antd";

// ✅ Good: Tree-shakeable imports (if using babel-plugin-import)
import Button from "antd/es/button";
import Modal from "antd/es/modal";
```

4. **Remove Unused Dependencies**

- Audit package.json
- Run `npx depcheck`
- Remove unused imports

#### React Performance Optimization

**Strategic use of React.memo:**

Only memoize expensive components:

```typescript
// 1. CodeEditor - prevents editor re-renders
export default memo(CodeEditor, (prev, next) => {
  return prev.value === next.value && prev.language === next.language;
});

// 2. TestResults - expensive rendering
export default memo(TestResults);

// 3. CategoryTabs - static content
export default memo(CategoryTabs);
```

**Avoid over-optimization:**

- Don't memo every component
- Measure with React DevTools Profiler first
- Only optimize actual bottlenecks

**Other optimizations:**

- `useMemo` for expensive calculations
- `useCallback` for stable references
- Virtual scrolling for long lists (if needed)

#### Lighthouse CI Integration

**Configuration (`.github/workflows/performance.yml`):**

```yaml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=lighthouserc.json
```

**lighthouserc.json:**

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.8 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**PR Comments:**

- Lighthouse bot posts results to PR
- Shows score changes from base branch
- Warns if scores drop > 5 points

---

### 4. Monitoring & Error Tracking

#### Lightweight Monitoring Architecture

**Design Philosophy:**

- No external services (yet)
- Local-first approach
- Easy to upgrade to Sentry later
- Privacy-friendly

#### Error Boundary Hierarchy

**Three-layer error handling:**

1. **Global Error Boundary** (`src/components/GlobalErrorBoundary.tsx`)
   - Catches entire app crashes
   - Shows friendly error page
   - Logs to IndexedDB
   - Provides "Report Issue" button

2. **Feature Error Boundaries**
   - `LessonErrorBoundary`: Wraps lesson features
   - `EditorErrorBoundary`: Wraps code editor
   - `ProgressErrorBoundary`: Wraps progress tracking
   - Allows partial failures without crashing entire app

3. **Async Error Handler**
   - Global `window.onerror` handler
   - Promise rejection handler
   - Unhandled async errors

**Implementation:**

```typescript
// GlobalErrorBoundary.tsx
class GlobalErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to IndexedDB
    errorLogger.log({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

#### Error Logging System

**Storage:** IndexedDB (via existing Dexie setup)

**Schema:**

```typescript
interface ErrorLog {
  id?: number;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  severity: "error" | "warning" | "info";
}
```

**Error Logger Service:**

```typescript
// src/services/error-logger.ts
class ErrorLogger {
  async log(error: ErrorLog) {
    await db.errorLogs.add(error);

    // Development: Also log to console
    if (import.meta.env.DEV) {
      console.error("[ErrorLogger]", error);
    }
  }

  async getLogs(limit = 50) {
    return db.errorLogs.orderBy("timestamp").reverse().limit(limit).toArray();
  }

  async clear() {
    await db.errorLogs.clear();
  }
}

export const errorLogger = new ErrorLogger();
```

#### Web Vitals Monitoring

**Track Core Web Vitals:**

```typescript
// src/utils/web-vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from "web-vitals";

function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value);
  }

  // Store in IndexedDB for analysis
  db.webVitals.add({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    timestamp: Date.now(),
  });
}

// Initialize
onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

**Metrics Targets:**

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

#### User Feedback Interface

**Error Report Dialog:**

```typescript
// When error occurs, show dialog
<ErrorDialog
  error={error}
  onReport={(feedback) => {
    errorLogger.log({
      ...error,
      userFeedback: feedback,
      severity: 'error'
    })
  }}
/>
```

**Features:**

- Pre-filled error details
- User can add context
- One-click report
- Stores locally (no external service)

#### Future: Sentry Integration (Optional)

**Preparation for Sentry:**

```typescript
// src/services/monitoring.ts
interface MonitoringService {
  logError(error: Error, context?: any): void;
  logMessage(message: string, level: string): void;
}

// Current: Local implementation
class LocalMonitoring implements MonitoringService {
  logError(error: Error, context?: any) {
    errorLogger.log({ ...error, ...context });
  }
}

// Future: Sentry implementation
class SentryMonitoring implements MonitoringService {
  logError(error: Error, context?: any) {
    Sentry.captureException(error, { extra: context });
  }
}

// Factory
export const monitoring: MonitoringService =
  import.meta.env.VITE_ENABLE_SENTRY === "true"
    ? new SentryMonitoring()
    : new LocalMonitoring();
```

**Benefits:**

- Easy to swap implementations
- No vendor lock-in
- Start local, upgrade when needed

---

## 📋 Implementation Plan

### Phase 1: CI Foundation (2-3 days)

**Day 1: CI Workflow Setup**

- [ ] Create `.github/workflows/ci.yml`
- [ ] Configure Node.js setup and caching
- [ ] Add TypeScript check job
- [ ] Add ESLint check job
- [ ] Test workflow on feature branch

**Day 2: Test & Build Jobs**

- [ ] Add Jest test job with coverage
- [ ] Configure coverage reporting
- [ ] Add build verification job
- [ ] Set up job dependencies and parallelization
- [ ] Test complete workflow

**Day 3: Performance Workflow**

- [ ] Create `.github/workflows/performance.yml`
- [ ] Add bundle size analysis
- [ ] Configure Lighthouse CI
- [ ] Set up PR comment bot
- [ ] Test on sample PR

**Deliverables:**

- ✅ Working CI workflow
- ✅ Performance workflow with Lighthouse
- ✅ Coverage reports
- ✅ PR status checks

---

### Phase 2: Git Hooks (1 day)

**Tasks:**

- [ ] Install Husky: `npm install --save-dev husky`
- [ ] Install lint-staged: `npm install --save-dev lint-staged`
- [ ] Initialize Husky: `npx husky install`
- [ ] Configure lint-staged in package.json
- [ ] Create pre-commit hook script
- [ ] Create pre-push hook script
- [ ] Test hooks locally
- [ ] Document bypass procedures

**Deliverables:**

- ✅ Pre-commit hook (fast checks)
- ✅ Pre-push hook (full checks)
- ✅ Lint-staged configuration
- ✅ Documentation

---

### Phase 3: Performance Optimization (2-3 days)

**Day 1: Bundle Analysis & Code Splitting**

- [ ] Add rollup-plugin-visualizer
- [ ] Generate initial bundle report
- [ ] Implement route-based code splitting
- [ ] Lazy load Monaco Editor
- [ ] Lazy load Babel transform

**Day 2: React Optimization**

- [ ] Add React.memo to CodeEditor
- [ ] Add React.memo to TestResults
- [ ] Add React.memo to CategoryTabs
- [ ] Profile with React DevTools
- [ ] Optimize re-renders

**Day 3: Lighthouse & Validation**

- [ ] Run Lighthouse locally
- [ ] Fix performance issues
- [ ] Configure lighthouserc.json
- [ ] Validate in CI
- [ ] Document performance targets

**Deliverables:**

- ✅ Bundle < 500KB (uncompressed)
- ✅ Lazy loading implemented
- ✅ React.memo optimizations
- ✅ Lighthouse score ≥ 85

---

### Phase 4: Monitoring Setup (1-2 days)

**Day 1: Error Boundaries**

- [ ] Create GlobalErrorBoundary component
- [ ] Create feature-level error boundaries
- [ ] Add ErrorFallback UI components
- [ ] Implement error logger service
- [ ] Add IndexedDB error log table

**Day 2: Web Vitals & Testing**

- [ ] Install web-vitals library
- [ ] Implement Web Vitals tracking
- [ ] Create error report dialog
- [ ] Test error scenarios
- [ ] Add Web Vitals dashboard (optional)

**Deliverables:**

- ✅ Error boundary hierarchy
- ✅ Error logging to IndexedDB
- ✅ Web Vitals tracking
- ✅ User feedback interface

---

### Phase 5: Documentation & Validation (1 day)

**Tasks:**

- [ ] Update README with CI badges
- [ ] Add development setup guide
- [ ] Create CONTRIBUTING.md (minimal)
- [ ] Document performance targets
- [ ] Document monitoring system
- [ ] Run complete validation
- [ ] Create Phase 4 completion report

**Validation Checklist:**

- [ ] All CI workflows passing
- [ ] Pre-commit hook < 20s
- [ ] Pre-push hook runs all tests
- [ ] Bundle size within limits
- [ ] Lighthouse score ≥ 85
- [ ] Error boundaries catch errors
- [ ] Web Vitals tracking works

**Deliverables:**

- ✅ Updated documentation
- ✅ Validation complete
- ✅ Phase 4 completion report

---

## ✅ Acceptance Criteria

### CI/CD Acceptance

- [ ] **CI runs automatically on PR creation**
- [ ] **Tests must pass before merge**
- [ ] **Build must succeed before merge**
- [ ] **Coverage report generated on every PR**
- [ ] **Performance workflow runs on PRs to main**
- [ ] **Bundle size check passes**
- [ ] **Lighthouse score ≥ 85 or warning issued**

### Git Hooks Acceptance

- [ ] **Pre-commit runs in < 20 seconds**
- [ ] **Pre-commit checks only staged files**
- [ ] **Pre-push runs full test suite**
- [ ] **Pre-push completes in < 60 seconds**
- [ ] **Can bypass with --no-verify if needed**
- [ ] **Hooks work on all team machines**

### Performance Acceptance

- [ ] **Main bundle < 500KB (uncompressed)**
- [ ] **Main bundle < 150KB (gzipped)**
- [ ] **Monaco Editor lazy loads**
- [ ] **Initial page load < 2s (Fast 3G)**
- [ ] **Lighthouse Performance ≥ 85**
- [ ] **Lighthouse Accessibility ≥ 90**
- [ ] **No performance regressions in CI**

### Monitoring Acceptance

- [ ] **Global error boundary catches crashes**
- [ ] **Feature boundaries contain failures**
- [ ] **Errors logged to IndexedDB**
- [ ] **Error logs viewable in dev tools**
- [ ] **Web Vitals data collected**
- [ ] **User can report errors**
- [ ] **Development shows detailed errors**
- [ ] **Production shows friendly errors**

---

## 📊 Success Metrics

| Metric                       | Target  | Measurement              |
| ---------------------------- | ------- | ------------------------ |
| **CI Success Rate**          | > 95%   | GitHub Actions dashboard |
| **CI Duration**              | < 5 min | Workflow timing          |
| **Pre-commit Time**          | < 20s   | Local testing            |
| **Pre-push Time**            | < 60s   | Local testing            |
| **Bundle Size**              | < 500KB | Build output             |
| **Lighthouse Performance**   | ≥ 85    | Lighthouse CI            |
| **Lighthouse Accessibility** | ≥ 90    | Lighthouse CI            |
| **Error Capture Rate**       | 100%    | Manual testing           |
| **Web Vitals LCP**           | < 2.5s  | Performance API          |
| **Web Vitals FID**           | < 100ms | Performance API          |

---

## 🚨 Risks & Mitigation

| Risk                       | Impact | Likelihood | Mitigation                         |
| -------------------------- | ------ | ---------- | ---------------------------------- |
| **CI too slow**            | Medium | Medium     | Optimize caching, parallelize jobs |
| **Hooks too strict**       | Low    | High       | Balance checks, allow bypass       |
| **Bundle size creep**      | Medium | Medium     | Automated size checks in CI        |
| **Performance regression** | Medium | Medium     | Lighthouse CI catches issues       |
| **Error boundary bugs**    | Low    | Low        | Comprehensive testing              |
| **Web Vitals inaccurate**  | Low    | Low        | Multiple measurement runs          |

---

## 🔧 Technical Stack

### New Dependencies

**Development:**

- `husky`: ^8.0.0 - Git hooks
- `lint-staged`: ^15.0.0 - Staged files linting
- `@lhci/cli`: ^0.12.0 - Lighthouse CI
- `rollup-plugin-visualizer`: ^5.9.0 - Bundle analysis
- `web-vitals`: ^3.5.0 - Performance monitoring

**Runtime:**

- None (monitoring is built-in)

### Configuration Files

**New files:**

- `.github/workflows/ci.yml`
- `.github/workflows/performance.yml`
- `.husky/pre-commit`
- `.husky/pre-push`
- `lighthouserc.json`

**Modified files:**

- `package.json` (scripts, lint-staged config)
- `vite.config.ts` (bundle analysis plugin)
- `src/main.tsx` (error boundaries, Web Vitals)

---

## 📚 Documentation Updates

### README.md Updates

**Add CI badges:**

```markdown
[![CI](https://github.com/username//workflows/CI/badge.svg)](https://github.com/username//actions)
[![Coverage](https://codecov.io/gh/username//branch/main/graph/badge.svg)](https://codecov.io/gh/username/)
```

**Add development section:**

- Git hooks explanation
- How to run tests locally
- How to bypass hooks
- Performance optimization guide

### CONTRIBUTING.md (New)

**Content:**

- Code style guide
- PR process
- Testing requirements
- Commit message format
- Pre-commit/pre-push explanation

---

## 🎓 Expected Benefits

### Developer Experience

**Before Phase 4:**

- ❌ Manual testing before PR
- ❌ Inconsistent code quality
- ❌ No performance monitoring
- ❌ Errors go unnoticed

**After Phase 4:**

- ✅ Automatic testing on PR
- ✅ Consistent code quality (hooks)
- ✅ Performance regression detection
- ✅ Error tracking and logging

### Code Quality

**Improvements:**

- 30% faster PR review (automated checks)
- 80% fewer broken commits (pre-push hooks)
- 100% test coverage visibility
- Performance regressions caught early

### User Experience

**Improvements:**

- Faster initial load (code splitting)
- Better error handling (boundaries)
- Performance monitoring (Web Vitals)
- Smaller bundle size

---

## 📅 Timeline Summary

```
Week 1 (Days 1-5):
├─ Day 1-3: CI/CD workflows
├─ Day 4: Git hooks
└─ Day 5: Performance analysis

Week 2 (Days 6-10):
├─ Day 6-7: Performance optimization
├─ Day 8-9: Monitoring setup
└─ Day 10: Documentation & validation
```

**Total Duration: 7-10 days**

---

## 🚀 Next Steps

1. **Review and approve this design**
2. **Create Phase 4 branch**: `git checkout -b feature/phase4-cicd`
3. **Begin Phase 1**: CI Foundation
4. **Daily standup**: Review progress and blockers
5. **Iterate**: Adjust design based on implementation learnings

---

## 📝 Notes

### Design Decisions Rationale

1. **Why skip deployment?**
   - Focus on automation first
   - Deployment can be added anytime
   - Reduces complexity in Phase 4

2. **Why local monitoring instead of Sentry?**
   - No external dependency
   - No cost
   - Privacy-friendly
   - Easy to upgrade later

3. **Why pre-commit + pre-push split?**
   - Balance speed and quality
   - Pre-commit fast feedback
   - Pre-push comprehensive checks

4. **Why Lighthouse CI?**
   - Industry standard
   - Free and open source
   - Catches performance regressions
   - Integrates with GitHub

### Future Enhancements

**Phase 4.5 (Optional):**

- Sentry integration for production
- Full deployment pipeline
- Advanced performance monitoring
- Custom Lighthouse budgets
- E2E testing in CI

---

**Design by:** Claude Code
**Design Date:** 2026-01-10
**Version:** 1.0.0
**Status:** 📋 Ready for Implementation
