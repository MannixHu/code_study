/**
 * AppLayout 组件
 * 主布局容器，整合所有主要区域
 */

import { Layout } from 'antd'
import AppHeader from './AppHeader'
import AppSidebar from './AppSidebar'
import { LearningPage } from '../../../features/lessons'
import './layout.css'

const { Content } = Layout

function AppLayout() {
  return (
    <Layout className="app-layout">
      {/* 顶部导航 */}
      <AppHeader />

      <Layout className="app-body">
        {/* 左侧边栏 */}
        <AppSidebar />

        {/* 主内容区 */}
        <Content className="app-content">
          <LearningPage />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
