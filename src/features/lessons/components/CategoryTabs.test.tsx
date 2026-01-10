/**
 * Tests for CategoryTabs component
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategoryTabs from './CategoryTabs'
import type { CategoryMeta } from '../types/lesson'

describe('CategoryTabs', () => {
  const mockCategories: CategoryMeta[] = [
    {
      id: 'jsx',
      name: 'JSX 基础',
      icon: '📝',
      total: 5,
      completed: 3
    },
    {
      id: 'components',
      name: '组件开发',
      icon: '🧩',
      total: 8,
      completed: 0
    },
    {
      id: 'hooks',
      name: 'React Hooks',
      icon: '🎣',
      total: 10,
      completed: 10
    }
  ]

  const defaultProps = {
    categories: mockCategories,
    activeCategory: 'jsx',
    onCategoryChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render navigation with logo', () => {
      render(<CategoryTabs {...defaultProps} />)

      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByText('⚛️ React 学习')).toBeInTheDocument()
    })

    it('should render all category tabs', () => {
      render(<CategoryTabs {...defaultProps} />)

      expect(screen.getByRole('button', { name: /JSX 基础/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /组件开发/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /React Hooks/i })).toBeInTheDocument()
    })

    it('should display category icons', () => {
      render(<CategoryTabs {...defaultProps} />)

      expect(screen.getByText('📝')).toBeInTheDocument()
      expect(screen.getByText('🧩')).toBeInTheDocument()
      expect(screen.getByText('🎣')).toBeInTheDocument()
    })

    it('should display category progress', () => {
      render(<CategoryTabs {...defaultProps} />)

      expect(screen.getByText('3/5')).toBeInTheDocument()
      expect(screen.getByText('0/8')).toBeInTheDocument()
      expect(screen.getByText('10/10')).toBeInTheDocument()
    })
  })

  describe('Active State', () => {
    it('should apply active class to active category', () => {
      render(<CategoryTabs {...defaultProps} />)

      const activeTab = screen.getByRole('button', { name: /JSX 基础/i })
      expect(activeTab).toHaveClass('active')
    })

    it('should not apply active class to inactive categories', () => {
      render(<CategoryTabs {...defaultProps} />)

      const componentsTab = screen.getByRole('button', { name: /组件开发/i })
      const hooksTab = screen.getByRole('button', { name: /React Hooks/i })

      expect(componentsTab).not.toHaveClass('active')
      expect(hooksTab).not.toHaveClass('active')
    })

    it('should update active tab when activeCategory changes', () => {
      const { rerender } = render(<CategoryTabs {...defaultProps} />)

      expect(screen.getByRole('button', { name: /JSX 基础/i })).toHaveClass('active')

      rerender(<CategoryTabs {...defaultProps} activeCategory="hooks" />)

      expect(screen.getByRole('button', { name: /JSX 基础/i })).not.toHaveClass('active')
      expect(screen.getByRole('button', { name: /React Hooks/i })).toHaveClass('active')
    })
  })

  describe('User Interactions', () => {
    it('should call onCategoryChange when tab is clicked', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()

      render(<CategoryTabs {...defaultProps} onCategoryChange={handleChange} />)

      await user.click(screen.getByRole('button', { name: /组件开发/i }))

      expect(handleChange).toHaveBeenCalledWith('components')
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('should call onCategoryChange with correct id for each tab', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()

      render(<CategoryTabs {...defaultProps} onCategoryChange={handleChange} />)

      await user.click(screen.getByRole('button', { name: /JSX 基础/i }))
      expect(handleChange).toHaveBeenCalledWith('jsx')

      await user.click(screen.getByRole('button', { name: /React Hooks/i }))
      expect(handleChange).toHaveBeenCalledWith('hooks')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty categories array', () => {
      render(<CategoryTabs {...defaultProps} categories={[]} />)

      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByText('⚛️ React 学习')).toBeInTheDocument()
      expect(screen.queryAllByRole('button')).toHaveLength(0)
    })

    it('should handle single category', () => {
      const singleCategory: CategoryMeta[] = [{
        id: 'single',
        name: '唯一分类',
        icon: '🎯',
        total: 3,
        completed: 1
      }]

      render(<CategoryTabs {...defaultProps} categories={singleCategory} activeCategory="single" />)

      expect(screen.getByRole('button', { name: /唯一分类/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /唯一分类/i })).toHaveClass('active')
    })

    it('should handle category with zero total lessons', () => {
      const emptyCategory: CategoryMeta[] = [{
        id: 'empty',
        name: '空分类',
        icon: '📭',
        total: 0,
        completed: 0
      }]

      render(<CategoryTabs {...defaultProps} categories={emptyCategory} activeCategory="empty" />)

      expect(screen.getByText('0/0')).toBeInTheDocument()
    })

    it('should handle activeCategory not matching any category', () => {
      render(<CategoryTabs {...defaultProps} activeCategory="nonexistent" />)

      // No tab should be active
      const allTabs = screen.getAllByRole('button')
      allTabs.forEach(tab => {
        expect(tab).not.toHaveClass('active')
      })
    })
  })
})
