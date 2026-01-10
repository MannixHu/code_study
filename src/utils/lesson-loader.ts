import type { Category } from '../types/lesson'

// 课程数据的基础 URL
const LESSON_BASE_URL = '/lessons/'

// 所有分类的 ID 列表（按顺序）
export const ALL_CATEGORY_IDS = [
  'jsx-basics',
  'components',
  'props',
  'state',
  'events',
  'conditional',
  'lists',
  'forms',
  'effects',
  'refs',
  'optimization',
  'custom-hooks',
  'context'
]

// 分类元数据（用于导航显示）
export const CATEGORY_METADATA = [
  { id: 'jsx-basics', name: 'JSX 基础', icon: '📝', description: '学习 JSX 语法和基本规则' },
  { id: 'components', name: '组件基础', icon: '🧩', description: '创建和使用 React 组件' },
  { id: 'props', name: 'Props 传递', icon: '📦', description: '父子组件通信' },
  { id: 'state', name: '状态管理', icon: '🔄', description: 'useState Hook 详解' },
  { id: 'events', name: '事件处理', icon: '⚡', description: '处理用户交互' },
  { id: 'conditional', name: '条件渲染', icon: '🔀', description: '动态显示内容' },
  { id: 'lists', name: '列表渲染', icon: '📋', description: '遍历数组渲染列表' },
  { id: 'forms', name: '表单处理', icon: '📝', description: '表单输入和验证' },
  { id: 'effects', name: '副作用', icon: '⚙️', description: 'useEffect Hook 详解' },
  { id: 'refs', name: 'Refs 引用', icon: '🔗', description: 'useRef 操作 DOM' },
  { id: 'optimization', name: '性能优化', icon: '⚡', description: 'useCallback 和 useMemo' },
  { id: 'custom-hooks', name: '自定义 Hook', icon: '🔧', description: '创建可复用逻辑' },
  { id: 'context', name: 'Context API', icon: '🌐', description: '全局状态管理' }
]

// 缓存已加载的分类
const categoryCache = new Map<string, Category>()

// 加载状态跟踪
const loadingPromises = new Map<string, Promise<Category>>()

/**
 * 加载指定分类的课程数据
 * 带缓存机制，避免重复加载
 */
export async function loadCategory(categoryId: string): Promise<Category> {
  // 检查缓存
  if (categoryCache.has(categoryId)) {
    return categoryCache.get(categoryId)!
  }

  // 检查是否正在加载
  if (loadingPromises.has(categoryId)) {
    return loadingPromises.get(categoryId)!
  }

  // 开始加载
  const loadingPromise = fetchCategory(categoryId)
  loadingPromises.set(categoryId, loadingPromise)

  try {
    const category = await loadingPromise
    categoryCache.set(categoryId, category)
    return category
  } catch (error) {
    console.error(`Failed to load category: ${categoryId}`, error)
    throw error
  } finally {
    loadingPromises.delete(categoryId)
  }
}

/**
 * 实际的 fetch 操作
 */
async function fetchCategory(categoryId: string): Promise<Category> {
  const response = await fetch(`${LESSON_BASE_URL}${categoryId}.json`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data as Category
}

/**
 * 预加载下一个分类（提升用户体验）
 */
export function preloadNextCategory(currentCategoryId: string): void {
  const currentIndex = ALL_CATEGORY_IDS.indexOf(currentCategoryId)

  if (currentIndex >= 0 && currentIndex < ALL_CATEGORY_IDS.length - 1) {
    const nextCategoryId = ALL_CATEGORY_IDS[currentIndex + 1]

    // 异步预加载，不阻塞当前操作
    loadCategory(nextCategoryId).catch(err => {
      console.warn('Preload failed:', err)
    })
  }
}

/**
 * 预加载前一个分类
 */
export function preloadPreviousCategory(currentCategoryId: string): void {
  const currentIndex = ALL_CATEGORY_IDS.indexOf(currentCategoryId)

  if (currentIndex > 0) {
    const prevCategoryId = ALL_CATEGORY_IDS[currentIndex - 1]

    loadCategory(prevCategoryId).catch(err => {
      console.warn('Preload failed:', err)
    })
  }
}

/**
 * 批量预加载多个分类
 */
export function preloadCategories(categoryIds: string[]): void {
  categoryIds.forEach(id => {
    loadCategory(id).catch(err => {
      console.warn(`Preload category ${id} failed:`, err)
    })
  })
}

/**
 * 清除所有缓存（用于刷新数据）
 */
export function clearCache(): void {
  categoryCache.clear()
  loadingPromises.clear()
}

/**
 * 获取分类的元数据
 */
export function getCategoryMetadata(categoryId: string) {
  return CATEGORY_METADATA.find(meta => meta.id === categoryId)
}

/**
 * 获取所有分类的元数据
 */
export function getAllCategoryMetadata() {
  return CATEGORY_METADATA
}

/**
 * 检查分类是否已加载
 */
export function isCategoryLoaded(categoryId: string): boolean {
  return categoryCache.has(categoryId)
}

/**
 * 获取已加载的分类数量
 */
export function getLoadedCategoryCount(): number {
  return categoryCache.size
}
