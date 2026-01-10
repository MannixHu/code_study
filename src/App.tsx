/**
 * App.tsx - 主应用组件
 * 重构后的版本：仅处理布局组合，业务逻辑委托给 hooks 和 stores
 */

import { useEffect } from 'react'
import { ConfigProvider, theme, Spin } from 'antd'
import { useLesson } from './hooks'
import { useLessonStore, useProgressStore } from './store'
import { progressService, lessonService } from './services'
import AppLayout from './components/layout/AppLayout'
import './App.css'

function App() {
  const { currentCategory, loading, error } = useLesson()
  const { setCompletedLessonIds } = useProgressStore()
  const { currentCategoryId } = useLessonStore()

  // 初始化：加载已完成的课程列表
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 预热进度缓存
        await progressService.warmupCache()

        // 加载当前分类的已完成课程
        const completedResult = await progressService.getCompletedLessons(currentCategoryId)
        if (completedResult.success) {
          setCompletedLessonIds(new Set(completedResult.data))
        }

        // 预加载相邻分类
        await lessonService.preloadAdjacentCategories(currentCategoryId)
      } catch (err) {
        console.error('Failed to initialize app:', err)
      }
    }

    initializeApp()
  }, [currentCategoryId, setCompletedLessonIds])

  if (loading || !currentCategory) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading application</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
        },
      }}
    >
      <AppLayout />
    </ConfigProvider>
  )
}

export default App
