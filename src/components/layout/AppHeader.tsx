/**
 * AppHeader 组件
 * 应用顶部导航栏
 */

import { Layout, Badge, Tabs } from 'antd'
import { CodeOutlined } from '@ant-design/icons'
import { useLessonStore } from '../../store'
import { progressService } from '../../services'
import { useState, useEffect } from 'react'
import type { StatisticsData } from '../../types/service'

const { Header } = Layout

function AppHeader() {
  const { currentCategoryId, categories, setCurrentCategoryId } = useLessonStore()
  const [categoryStats, setCategoryStats] = useState<Map<string, StatisticsData>>(new Map())

  // 加载各分类的统计信息
  useEffect(() => {
    const loadStats = async () => {
      const stats = new Map<string, StatisticsData>()

      for (const cat of categories) {
        const result = await progressService.calculateStatistics(cat.id)
        if (result.success) {
          stats.set(cat.id, result.data)
        }
      }

      setCategoryStats(stats)
    }

    if (categories.length > 0) {
      loadStats()
    }
  }, [categories])

  // 生成 Tabs items
  const tabItems = categories.map((cat) => {
    const stats = categoryStats.get(cat.id)

    return {
      key: cat.id,
      label: (
        <span className="tab-label">
          <span className="tab-icon">{cat.icon}</span>
          <span className="tab-name">{cat.name}</span>
          <Badge
            count={`${stats?.completedLessons || 0}/${stats?.totalLessons || 0}`}
            showZero
            color={
              stats && stats.completedLessons === stats.totalLessons && stats.totalLessons > 0
                ? '#52c41a'
                : '#8c8c8c'
            }
            className="tab-badge"
          />
        </span>
      ),
    }
  })

  return (
    <Header className="app-header">
      <div className="header-logo">
        <CodeOutlined /> React 学习
      </div>
      <Tabs
        activeKey={currentCategoryId}
        onChange={(key) => setCurrentCategoryId(key)}
        items={tabItems}
        className="header-tabs"
        tabBarStyle={{ margin: 0, borderBottom: 'none' }}
      />
    </Header>
  )
}

export default AppHeader
