/**
 * AppHeader 组件
 * 应用顶部导航栏
 */

import { Layout, Badge, Tabs } from "antd";
import { CodeOutlined } from "@ant-design/icons";
import { useLessonStore } from "../../../store";
import { progressService } from "../../../features/progress";
import { useState, useEffect } from "react";
import type { StatisticsData } from "../../../features/editor/types/service";

const { Header } = Layout;

function AppHeader() {
  const { currentCategoryId, categories, setCurrentCategoryId } =
    useLessonStore();
  const [categoryStats, setCategoryStats] = useState<
    Map<string, StatisticsData>
  >(new Map());

  // 加载各分类的统计信息
  useEffect(() => {
    const loadStats = async () => {
      const stats = new Map<string, StatisticsData>();

      for (const cat of categories) {
        const result = await progressService.calculateStatistics(cat.id);
        if (result.success) {
          stats.set(cat.id, result.data);
        }
      }

      setCategoryStats(stats);
    };

    if (categories.length > 0) {
      loadStats();
    }
  }, [categories]);

  // 生成 Tabs items
  const tabItems = categories.map((cat) => {
    const stats = categoryStats.get(cat.id);

    return {
      key: cat.id,
      label: (
        <span className="flex items-center gap-1.5 text-sm">
          <span className="text-base">{cat.icon}</span>
          <span className="font-medium">{cat.name}</span>
          <Badge
            count={`${stats?.completedLessons || 0}/${stats?.totalLessons || 0}`}
            showZero
            color={
              stats &&
              stats.completedLessons === stats.totalLessons &&
              stats.totalLessons > 0
                ? "#52c41a"
                : "#8c8c8c"
            }
            className="ml-1 [&_.ant-badge-count]:text-[10px] [&_.ant-badge-count]:font-semibold [&_.ant-badge-count]:shadow-none"
          />
        </span>
      ),
    };
  });

  return (
    <Header className="flex items-center bg-white px-6 h-14 border-b border-gray-100 shadow-sm">
      <div className="font-bold text-base text-gray-900 pr-6 border-r border-gray-100 mr-2 flex items-center gap-2 whitespace-nowrap">
        <CodeOutlined /> Code Study
      </div>
      <Tabs
        activeKey={currentCategoryId}
        onChange={(key) => setCurrentCategoryId(key)}
        items={tabItems}
        className="flex-1 overflow-hidden [&_.ant-tabs-nav]:m-0 [&_.ant-tabs-tab]:px-4 [&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab]:m-0 [&_.ant-tabs-tab]:transition-all [&_.ant-tabs-tab]:duration-200 [&_.ant-tabs-tab:hover]:bg-gray-50 [&_.ant-tabs-tab-active]:bg-indigo-50"
        tabBarStyle={{ margin: 0, borderBottom: "none" }}
      />
    </Header>
  );
}

export default AppHeader;
