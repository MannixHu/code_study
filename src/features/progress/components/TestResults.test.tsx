/**
 * Tests for TestResults component
 */

import { render, screen } from '@testing-library/react'
import TestResults from './TestResults'
import type { TestResult } from '../../lessons/types/lesson'

describe('TestResults', () => {
  const passedResults: TestResult[] = [
    { description: 'Should have function declaration', passed: true },
    { description: 'Should return correct value', passed: true },
    { description: 'Should handle edge cases', passed: true }
  ]

  const failedResults: TestResult[] = [
    { description: 'Should have function declaration', passed: true },
    { description: 'Should return correct value', passed: false, message: 'Expected 5 but got 10' },
    { description: 'Should handle edge cases', passed: false }
  ]

  const mixedResults: TestResult[] = [
    { description: 'Test 1', passed: true },
    { description: 'Test 2', passed: false, message: 'Error message' },
    { description: 'Test 3', passed: true }
  ]

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<TestResults results={[]} isCorrect={false} isLoading={true} />)

      // Spin component is rendered in loading state
      const loadingContainer = document.querySelector('.test-results-loading')
      expect(loadingContainer).toBeInTheDocument()
    })

    it('should not show results when loading', () => {
      render(<TestResults results={passedResults} isCorrect={true} isLoading={true} />)

      expect(screen.queryByText('🎉 完成！')).not.toBeInTheDocument()
    })
  })

  describe('Empty Results', () => {
    it('should return null when no results', () => {
      const { container } = render(<TestResults results={[]} isCorrect={false} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Success State', () => {
    it('should show success alert when all tests pass', () => {
      render(<TestResults results={passedResults} isCorrect={true} />)

      const alert = document.querySelector('.ant-alert-success')
      expect(alert).toBeInTheDocument()
    })

    it('should show success message when isCorrect is true', () => {
      render(<TestResults results={passedResults} isCorrect={true} />)

      expect(screen.getByText('🎉 完成！')).toBeInTheDocument()
    })

    it('should display all passed test items', () => {
      render(<TestResults results={passedResults} isCorrect={true} />)

      expect(screen.getByText('Should have function declaration')).toBeInTheDocument()
      expect(screen.getByText('Should return correct value')).toBeInTheDocument()
      expect(screen.getByText('Should handle edge cases')).toBeInTheDocument()
    })

    it('should apply passed class to passed items', () => {
      render(<TestResults results={passedResults} isCorrect={true} />)

      const testItems = document.querySelectorAll('.test-item.passed')
      expect(testItems).toHaveLength(3)
    })
  })

  describe('Error State', () => {
    it('should show error alert when tests fail', () => {
      render(<TestResults results={failedResults} isCorrect={false} />)

      const alert = document.querySelector('.ant-alert-error')
      expect(alert).toBeInTheDocument()
    })

    it('should show error message when isCorrect is false', () => {
      render(<TestResults results={failedResults} isCorrect={false} />)

      expect(screen.getByText('❌ 还有问题')).toBeInTheDocument()
    })

    it('should display all test items including failed ones', () => {
      render(<TestResults results={failedResults} isCorrect={false} />)

      expect(screen.getByText('Should have function declaration')).toBeInTheDocument()
      expect(screen.getByText('Should return correct value')).toBeInTheDocument()
      expect(screen.getByText('Should handle edge cases')).toBeInTheDocument()
    })

    it('should apply failed class to failed items', () => {
      render(<TestResults results={failedResults} isCorrect={false} />)

      const failedItems = document.querySelectorAll('.test-item.failed')
      expect(failedItems).toHaveLength(2)
    })

    it('should display error message for failed tests', () => {
      render(<TestResults results={failedResults} isCorrect={false} />)

      expect(screen.getByText('Expected 5 but got 10')).toBeInTheDocument()
    })
  })

  describe('Mixed Results', () => {
    it('should correctly mark passed and failed tests', () => {
      render(<TestResults results={mixedResults} isCorrect={false} />)

      const passedItems = document.querySelectorAll('.test-item.passed')
      const failedItems = document.querySelectorAll('.test-item.failed')

      expect(passedItems).toHaveLength(2)
      expect(failedItems).toHaveLength(1)
    })

    it('should show error message only for tests with message', () => {
      render(<TestResults results={mixedResults} isCorrect={false} />)

      expect(screen.getByText('Error message')).toBeInTheDocument()

      // Only one message should be shown
      const messages = document.querySelectorAll('.test-message')
      expect(messages).toHaveLength(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single result', () => {
      const singleResult: TestResult[] = [
        { description: 'Single test', passed: true }
      ]

      render(<TestResults results={singleResult} isCorrect={true} />)

      expect(screen.getByText('Single test')).toBeInTheDocument()
    })

    it('should handle result with empty description', () => {
      const emptyDescResult: TestResult[] = [
        { description: '', passed: true }
      ]

      render(<TestResults results={emptyDescResult} isCorrect={true} />)

      const testItem = document.querySelector('.test-item.passed')
      expect(testItem).toBeInTheDocument()
    })

    it('should handle result with long description', () => {
      const longResult: TestResult[] = [
        { description: 'A'.repeat(200), passed: true }
      ]

      render(<TestResults results={longResult} isCorrect={true} />)

      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument()
    })

    it('should handle result with long error message', () => {
      const longMessage = 'Error: '.repeat(50)
      const longMessageResult: TestResult[] = [
        { description: 'Test', passed: false, message: longMessage }
      ]

      render(<TestResults results={longMessageResult} isCorrect={false} />)

      const messageElement = document.querySelector('.test-message')
      expect(messageElement).toBeInTheDocument()
      expect(messageElement?.textContent).toBe(longMessage)
    })
  })
})
