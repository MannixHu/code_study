# MeFlow3 Testing Guide

**Version:** 1.0.0
**Last Updated:** 2025-01-10
**Status:** Complete

---

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [Testing Philosophy](#testing-philosophy)
3. [Test Structure](#test-structure)
4. [Writing Service Tests](#writing-service-tests)
5. [Writing Component Tests](#writing-component-tests)
6. [Writing Hook Tests](#writing-hook-tests)
7. [Writing Integration Tests](#writing-integration-tests)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

This guide explains how to write and maintain tests for the MeFlow3 project. We use Jest as our test runner and React Testing Library for component tests.

### Test Stack
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **ts-jest**: TypeScript support for Jest

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- lesson-service.test

# Run tests matching pattern
npm test -- --testPathPatterns="service"
```

---

## Testing Philosophy

### What We Test
✅ **DO Test:**
- Business logic and data transformations
- User interactions and workflows
- Error handling and edge cases
- Component rendering with different props
- State changes and side effects

❌ **DON'T Test:**
- Implementation details
- Third-party library internals
- Styling and visual appearance (use visual regression testing)
- Exact DOM structure (test behavior, not markup)

### Testing Pyramid

```
        /\
       /E2\      ← Few: Complete user journeys
      /────\
     / Int  \    ← Some: Feature workflows
    /────────\
   /   Unit   \  ← Many: Business logic, utilities
  /────────────\
```

**Our Focus:**
- **70% Unit Tests** - Services, utilities, pure functions
- **20% Integration Tests** - Feature workflows, state management
- **10% E2E Tests** - Critical user paths (future phase)

---

## Test Structure

### File Organization
```
src/
├── features/
│   └── lessons/
│       ├── services/
│       │   ├── lesson-service.ts
│       │   └── lesson-service.test.ts      ← Co-located with source
│       ├── components/
│       │   ├── LessonSelector.tsx
│       │   └── LessonSelector.test.tsx
│       └── hooks/
│           ├── useLesson.ts
│           └── useLesson.test.ts
```

### Test File Template
```typescript
/**
 * Tests for ComponentName / ServiceName
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from './ComponentName'

// Mock dependencies
jest.mock('../dependency')

describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test groups
  describe('feature group', () => {
    it('should do something specific', () => {
      // Arrange
      const props = { ... }

      // Act
      render(<ComponentName {...props} />)

      // Assert
      expect(screen.getByText('Expected')).toBeInTheDocument()
    })
  })
})
```

---

## Writing Service Tests

### Basic Pattern
```typescript
import { myService } from './my-service'
import { myRepository } from '../repository/my-repository'

// Mock the repository layer
jest.mock('../repository/my-repository')

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('methodName', () => {
    it('should return success result', async () => {
      // Arrange
      const mockData = { id: '1', name: 'Test' }
      myRepository.getData.mockResolvedValue(mockData)

      // Act
      const result = await myService.methodName('1')

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockData)
      }
      expect(myRepository.getData).toHaveBeenCalledWith('1')
    })

    it('should return error result when repository fails', async () => {
      // Arrange
      myRepository.getData.mockRejectedValue(new Error('DB error'))

      // Act
      const result = await myService.methodName('1')

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('ERROR_CODE')
      }
    })
  })
})
```

### Testing Result Types
```typescript
// Test success path
const result = await service.method()
expect(result.success).toBe(true)
if (result.success) {
  expect(result.data).toBeDefined()
  // Access result.data safely
}

// Test error path
const result = await service.method()
expect(result.success).toBe(false)
if (!result.success) {
  expect(result.error.code).toBe('ERROR_CODE')
  expect(result.error.message).toContain('Failed')
}
```

---

## Writing Component Tests

### Basic Component Test
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render with required props', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<MyComponent onClick={handleClick} />)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Testing with Context/Store
```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'
import { useLessonStore } from '../../../store'

// Mock the store
jest.mock('../../../store')

describe('MyComponent', () => {
  it('should display data from store', () => {
    // Arrange
    useLessonStore.mockReturnValue({
      currentLesson: { id: '1', title: 'Test Lesson' },
      setCurrentLesson: jest.fn(),
    })

    // Act
    render(<MyComponent />)

    // Assert
    expect(screen.getByText('Test Lesson')).toBeInTheDocument()
  })
})
```

### Testing Async Components
```typescript
it('should handle async data loading', async () => {
  render(<MyComponent />)

  // Wait for loading to complete
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // Wait for data to appear
  expect(await screen.findByText('Data Loaded')).toBeInTheDocument()

  // Loading should be gone
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
})
```

### Testing Error States
```typescript
it('should display error message on failure', async () => {
  // Mock service to throw error
  myService.getData.mockRejectedValue(new Error('Network error'))

  render(<MyComponent />)

  // Wait for error to appear
  expect(await screen.findByText(/error/i)).toBeInTheDocument()
})
```

---

## Writing Hook Tests

### Basic Hook Test
```typescript
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from './useMyHook'

describe('useMyHook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMyHook())

    expect(result.current.count).toBe(0)
    expect(result.current.loading).toBe(false)
  })

  it('should update state correctly', () => {
    const { result } = renderHook(() => useMyHook())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

### Testing Hooks with Props
```typescript
it('should respond to prop changes', () => {
  const { result, rerender } = renderHook(
    ({ id }) => useMyHook(id),
    { initialProps: { id: '1' } }
  )

  expect(result.current.data.id).toBe('1')

  rerender({ id: '2' })

  expect(result.current.data.id).toBe('2')
})
```

### Testing Async Hooks
```typescript
it('should handle async operations', async () => {
  const { result } = renderHook(() => useMyHook())

  expect(result.current.loading).toBe(false)

  act(() => {
    result.current.loadData()
  })

  expect(result.current.loading).toBe(true)

  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })

  expect(result.current.data).toBeDefined()
})
```

---

## Writing Integration Tests

### Complete Workflow Test
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

describe('Complete Lesson Workflow', () => {
  it('should complete entire lesson flow', async () => {
    const user = userEvent.setup()

    // 1. Render app
    render(<App />)

    // 2. Select category
    await user.click(screen.getByText('JSX Basics'))

    // 3. Select lesson
    await user.click(screen.getByText('First Component'))

    // 4. Wait for lesson to load
    expect(await screen.findByText('Create your first component')).toBeInTheDocument()

    // 5. Edit code
    const editor = screen.getByRole('textbox')
    await user.clear(editor)
    await user.type(editor, 'const App = () => <div>Hello</div>')

    // 6. Run tests
    await user.click(screen.getByText('Run Tests'))

    // 7. Verify success
    expect(await screen.findByText('All tests passed!')).toBeInTheDocument()
  })
})
```

### Testing State Across Features
```typescript
it('should maintain state across feature interactions', async () => {
  const user = userEvent.setup()

  render(<App />)

  // Action in feature A
  await user.click(screen.getByText('Select Lesson'))

  // Verify state change in feature B
  expect(screen.getByText('Lesson: First Component')).toBeInTheDocument()

  // Action in feature C
  await user.click(screen.getByText('Run Tests'))

  // Verify state change in feature D
  expect(await screen.findByText('Progress: 1/10')).toBeInTheDocument()
})
```

---

## Best Practices

### 1. Test Behavior, Not Implementation
```typescript
// ❌ BAD: Testing implementation details
expect(component.state.count).toBe(1)
expect(component.handleClick).toHaveBeenCalled()

// ✅ GOOD: Testing user-visible behavior
expect(screen.getByText('Count: 1')).toBeInTheDocument()
await user.click(screen.getByRole('button'))
expect(screen.getByText('Count: 2')).toBeInTheDocument()
```

### 2. Use Accessible Queries
```typescript
// Priority order:
screen.getByRole('button', { name: 'Submit' })     // Best
screen.getByLabelText('Email')                     // Good for forms
screen.getByPlaceholderText('Enter email')         // OK
screen.getByText('Click me')                       // OK
screen.getByTestId('submit-button')                // Last resort
```

### 3. Avoid Test Fragility
```typescript
// ❌ BAD: Brittle selectors
const button = container.querySelector('.btn-primary')
expect(container.firstChild.children[0]).toBeInTheDocument()

// ✅ GOOD: Semantic queries
const button = screen.getByRole('button', { name: 'Submit' })
expect(screen.getByText('Welcome')).toBeInTheDocument()
```

### 4. Keep Tests Independent
```typescript
// ❌ BAD: Tests depend on each other
let sharedState
it('test 1', () => { sharedState = 'value' })
it('test 2', () => { expect(sharedState).toBe('value') })

// ✅ GOOD: Each test is independent
it('test 1', () => {
  const state = 'value'
  expect(state).toBe('value')
})
it('test 2', () => {
  const state = 'value'
  expect(state).toBe('value')
})
```

### 5. Use Descriptive Test Names
```typescript
// ❌ BAD: Vague test names
it('works', () => {})
it('test button', () => {})

// ✅ GOOD: Descriptive names
it('should submit form when all fields are valid', () => {})
it('should display error when email is invalid', () => {})
```

---

## Common Patterns

### Pattern 1: Testing Forms
```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup()
  const handleSubmit = jest.fn()

  render(<MyForm onSubmit={handleSubmit} />)

  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.type(screen.getByLabelText('Password'), 'password123')
  await user.click(screen.getByRole('button', { name: 'Submit' }))

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  })
})
```

### Pattern 2: Testing Loading States
```typescript
it('should show loading state', async () => {
  render(<MyComponent />)

  // Initially loading
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // Wait for data
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  // Data loaded
  expect(screen.getByText('Data loaded')).toBeInTheDocument()
})
```

### Pattern 3: Testing Error Boundaries
```typescript
it('should catch and display errors', () => {
  const ThrowError = () => {
    throw new Error('Test error')
  }

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  )

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
})
```

---

## Troubleshooting

### Issue: "Unable to find an element with text"
```typescript
// Problem: Element not rendered yet
expect(screen.getByText('Data')).toBeInTheDocument()  // ❌ Fails

// Solution: Wait for element
expect(await screen.findByText('Data')).toBeInTheDocument()  // ✅ Works
```

### Issue: "Not wrapped in act(...)"
```typescript
// Problem: State update not wrapped
result.current.update()  // ❌ Warning

// Solution: Wrap in act
act(() => {
  result.current.update()  // ✅ No warning
})
```

### Issue: "Can't perform a React state update on unmounted component"
```typescript
// Problem: Async operation completes after unmount
useEffect(() => {
  fetchData().then(setData)
}, [])

// Solution: Cleanup on unmount
useEffect(() => {
  let mounted = true
  fetchData().then(data => {
    if (mounted) setData(data)
  })
  return () => { mounted = false }
}, [])
```

---

## Coverage Targets

### Current Coverage (After Phase 2)
- **Services**: 100% ✅
- **Components**: 0%
- **Hooks**: 0%
- **Overall**: ~30%

### Phase 3 Targets
- **Services**: 100% ✅
- **Components**: 80%+
- **Hooks**: 90%+
- **Overall**: 80%+

### Running Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event API](https://testing-library.com/docs/user-event/intro)

### Internal Resources
- Phase 2 Completion Report
- Service test examples: `src/features/*/services/*.test.ts`
- Jest configuration: `jest.config.js`

### Getting Help
- Check this guide first
- Review existing tests for patterns
- Ask in team chat
- Consult QA team for test scenarios

---

**Document Version:** 1.0.0
**Last Updated:** 2025-01-10
**Maintainer:** MeFlow3 Team

**Happy Testing! 🧪**
