/**
 * AppLayout 组件
 * 沉浸式布局 - 左侧题目列表 + 右侧编辑器/预览
 */

import { Layout } from "antd";
import AppSidebar from "./AppSidebar";
import { LearningPage } from "../../../features/lessons";
import "./layout.css";

const { Content } = Layout;

function AppLayout() {
  return (
    <Layout className="app-layout h-screen bg-[#1e1e1e]">
      <Layout className="app-body flex-1 overflow-hidden flex flex-row gap-4 p-4">
        {/* 左侧边栏 - 题目列表 */}
        <AppSidebar />

        {/* 主内容区 - 沉浸式编辑器 */}
        <Content
          id="main-content"
          role="main"
          tabIndex={-1}
          className="app-content flex-1 min-w-0 overflow-hidden flex flex-col rounded-xl border border-[#2a2a2a] bg-[#1e1e1e]"
        >
          <div className="p-4 flex-1 min-h-0 flex flex-col">
            <LearningPage />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
