import type { CategoryMeta } from '../types/lesson'

interface CategoryTabsProps {
  categories: CategoryMeta[]
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
}

/**
 * 分类标签页组件
 * 显示所有课程分类，支持点击切换
 */
function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <nav className="category-tabs">
      <div className="category-tabs-header">
        <span className="logo">⚛️ React 学习</span>
      </div>
      <div className="category-tabs-container">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
            <span className="category-progress">
              {category.completed}/{category.total}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default CategoryTabs
