/**
 * AppSidebar 组件
 * 左侧边栏，显示课程列表和相关信息
 */

import { Layout, Select, Tag, Button, Alert } from "antd";
import { LeftOutlined, RightOutlined, BulbOutlined } from "@ant-design/icons";
import { useLesson } from "../../../features/lessons";
import { useProgress } from "../../../features/progress";
import { useUIStore } from "../../../store";
import { useMemo } from "react";
import "./layout.css";

const { Sider } = Layout;

function AppSidebar() {
  const { currentCategory, currentLesson, currentLessonId, setCurrentLesson } =
    useLesson();
  const { completedLessonIds } = useProgress();
  const { showHint, hintIndex, resetHint } = useUIStore();

  // 计算当前课程的索引
  const currentIndex = useMemo(() => {
    if (!currentCategory || !currentLessonId) return -1;
    return currentCategory.lessons.findIndex((l) => l.id === currentLessonId);
  }, [currentCategory, currentLessonId]);

  const isFirstLesson = currentIndex === 0;
  const isLastLesson =
    currentIndex === (currentCategory?.lessons.length ?? 0) - 1;

  // 导航到上一课
  const goToPrevLesson = () => {
    if (currentCategory && currentIndex > 0) {
      setCurrentLesson(currentCategory.lessons[currentIndex - 1].id);
      resetHint();
    }
  };

  // 导航到下一课
  const goToNextLesson = () => {
    if (currentCategory && currentIndex < currentCategory.lessons.length - 1) {
      setCurrentLesson(currentCategory.lessons[currentIndex + 1].id);
      resetHint();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "error";
      default:
        return "default";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "简单";
      case "medium":
        return "中等";
      case "hard":
        return "困难";
      default:
        return difficulty;
    }
  };

  if (!currentCategory || !currentLesson) {
    return null;
  }

  return (
    <Sider
      width={380}
      theme="light"
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden [&_.ant-layout-sider-children]:h-full"
    >
      <div className="flex h-full flex-col">
        {/* 顶部：选择器 + 标签 + 标题 */}
        <div
          className="border-b border-gray-100"
          style={{ padding: "20px 20px 16px" }}
        >
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              选择题目
            </label>
            <Select
              value={currentLessonId}
              onChange={setCurrentLesson}
              className="w-full"
              size="middle"
              options={currentCategory.lessons.map((lesson, idx) => ({
                value: lesson.id,
                label: (
                  <span className="flex items-center gap-2 min-w-0">
                    {completedLessonIds.has(lesson.id) && (
                      <span className="text-green-500">✓</span>
                    )}
                    <span className="truncate">
                      {idx + 1}. {lesson.title}
                    </span>
                  </span>
                ),
              }))}
            />
            <div className="flex flex-wrap gap-2 pt-0.5">
              <Tag color={getDifficultyColor(currentLesson.difficulty)}>
                {getDifficultyText(currentLesson.difficulty)}
              </Tag>
              {currentLesson.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              <Tag icon={<BulbOutlined />}>
                {currentLesson.estimatedTime} 分钟
              </Tag>
            </div>
          </div>

          <h3 className="mt-4 mb-0 text-lg font-semibold text-gray-900 leading-tight">
            {currentLesson.title}
          </h3>
        </div>

        {/* 中部：内容（可滚动） */}
        <div
          className="flex-1 overflow-y-auto flex flex-col gap-6"
          style={{ padding: "24px 20px" }}
        >
          {/* 任务说明 */}
          <Alert
            message="任务"
            description={currentLesson.question}
            type="info"
            showIcon
            className="animate-slide-in [&_.ant-alert-message]:font-semibold [&_.ant-alert-description]:text-gray-700 [&_.ant-alert-description]:leading-relaxed"
          />

          {/* 描述 */}
          <div className="space-y-3 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
              说明
            </label>
            <p className="m-0 text-[15px] text-gray-600 leading-7">
              {currentLesson.description}
            </p>
          </div>

          {/* 提示 */}
          {showHint && hintIndex > 0 && (
            <Alert
              message={`提示 ${hintIndex}/${currentLesson.hints.length}`}
              description={currentLesson.hints[hintIndex - 1]}
              type="warning"
              showIcon
              className="animate-slide-in [&_.ant-alert-description]:text-gray-700 [&_.ant-alert-description]:leading-relaxed"
            />
          )}
        </div>

        {/* 底部：导航按钮（固定） */}
        <div
          className="border-t border-gray-200 bg-white"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex gap-3">
            <Button
              icon={<LeftOutlined />}
              onClick={goToPrevLesson}
              disabled={isFirstLesson}
              className="flex-1 min-h-[40px]"
            >
              上一题
            </Button>
            <Button
              type="primary"
              onClick={goToNextLesson}
              disabled={isLastLesson}
              className="flex-1 min-h-[40px]"
            >
              下一题 <RightOutlined />
            </Button>
          </div>
        </div>
      </div>
    </Sider>
  );
}

export default AppSidebar;
