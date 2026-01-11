/**
 * LearningPage 组件
 * 沉浸式学习页面 - 上方编辑器 + 下方可调高度预览面板
 */

import { useState, useRef, useCallback } from "react";
import { Spin, Button } from "antd";
import {
  PlayCircleOutlined,
  ExpandOutlined,
  CompressOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useLesson } from "../hooks/useLesson";
import { useEditor, useTestRunner, CodeEditor } from "../../editor";
import { TestResults } from "../../progress";
import { useHint, HintButton, HintPanel } from "../../hints";

// 最小/最大预览面板高度
const MIN_PANEL_HEIGHT = 120;
const MAX_PANEL_HEIGHT = 400;
const DEFAULT_PANEL_HEIGHT = 200;

function LearningPage() {
  const { currentLesson, loading } = useLesson();
  const { userCode, isSaved, setUserCode, resetCode, saveCode } = useEditor(
    currentLesson?.id || "",
    currentLesson?.starterCode,
  );
  const { testResults, isRunningTests, isCorrect, runTests } = useTestRunner(
    currentLesson?.id || "",
  );

  // 预览面板高度状态
  const [panelHeight, setPanelHeight] = useState(DEFAULT_PANEL_HEIGHT);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Show/hide hint panel
  const [showHintPanel, setShowHintPanel] = useState(false);

  // Hint system - only initialize when lesson is available
  const hintOptions = currentLesson
    ? {
        lesson: currentLesson,
        userCode,
        testResults,
      }
    : null;

  const {
    currentHint,
    hintHistory,
    isLoading: isHintLoading,
    error: hintError,
    currentLevel,
    maxLevel,
    requestHint,
    resetHints,
    canRequestHint,
    isAIEnabled,
  } = useHint(
    hintOptions || {
      lesson: {
        id: "",
        title: "",
        difficulty: "easy",
        tags: [],
        estimatedTime: 0,
        question: "",
        description: "",
        starterCode: "",
        solution: "",
        hints: [],
        testCases: [],
      },
      userCode: "",
      testResults: [],
    },
  );

  // 拖拽调整高度
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      startY.current = e.clientY;
      startHeight.current = panelHeight;
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const deltaY = startY.current - e.clientY;
        const newHeight = Math.min(
          MAX_PANEL_HEIGHT,
          Math.max(MIN_PANEL_HEIGHT, startHeight.current + deltaY),
        );
        setPanelHeight(newHeight);
        setIsCollapsed(false);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [panelHeight],
  );

  // 折叠/展开
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  if (loading || !currentLesson) {
    return (
      <div className="loading-state flex-1 flex items-center justify-center bg-[#1e1e1e]">
        <Spin size="large" />
      </div>
    );
  }

  const handleRunTests = async () => {
    await runTests(userCode, currentLesson.testCases);
    // 运行测试时自动展开面板
    if (isCollapsed) setIsCollapsed(false);
  };

  const handleShowSolution = () => {
    setUserCode(currentLesson.solution);
  };

  const handleReset = async () => {
    await resetCode(currentLesson.id);
    setUserCode(currentLesson.starterCode);
    resetHints();
  };

  const handleRequestHint = async () => {
    await requestHint();
    setShowHintPanel(true);
    if (isCollapsed) setIsCollapsed(false);
  };

  const actualPanelHeight = isCollapsed ? 0 : panelHeight;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#1e1e1e]">
      {/* 代码编辑器区域 - 自适应填充剩余空间 */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0">
          <CodeEditor
            value={userCode}
            onChange={setUserCode}
            language="javascript"
            height="100%"
          />
        </div>
      </div>

      {/* 可拖拽分隔条 */}
      <div
        className="h-1 bg-[#3c3c3c] hover:bg-indigo-500 cursor-ns-resize transition-colors duration-150 flex-shrink-0"
        onMouseDown={handleMouseDown}
      />

      {/* 底部面板 - 预览结果 + 操作按钮 */}
      <div
        className="flex-shrink-0 flex flex-col bg-[#252526] transition-[height] duration-200 ease-out"
        style={{ height: actualPanelHeight + 56 }} // 56px 为底部操作栏高度
      >
        {/* 预览内容区 */}
        <div
          className="overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: actualPanelHeight }}
        >
          <div className="h-full overflow-y-auto p-6">
            {/* Hint Panel */}
            {showHintPanel && (hintHistory.length > 0 || hintError) && (
              <div className="mb-4">
                <HintPanel
                  currentHint={currentHint}
                  hintHistory={hintHistory}
                  error={hintError}
                  isAIEnabled={isAIEnabled}
                  onClose={() => setShowHintPanel(false)}
                />
              </div>
            )}

            {testResults.length > 0 && (
              <TestResults
                results={testResults}
                isCorrect={isCorrect}
                isLoading={isRunningTests}
              />
            )}

            {testResults.length === 0 && !showHintPanel && (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                <PlayCircleOutlined className="mr-2" />
                运行测试查看结果
              </div>
            )}
          </div>
        </div>

        {/* 固定底部操作栏 */}
        <div className="h-14 flex-shrink-0 flex items-center gap-3 pl-8 pr-6 bg-[#1e1e1e] border-t border-[#3c3c3c]">
          {/* 左侧：主要操作 */}
          <Button
            type="primary"
            size="middle"
            icon={
              isRunningTests ? <Spin size="small" /> : <PlayCircleOutlined />
            }
            onClick={handleRunTests}
            disabled={isRunningTests}
            style={{
              height: 36,
              paddingInline: 14,
            }}
          >
            {isRunningTests ? "运行中..." : "运行测试"}
          </Button>

          <HintButton
            onClick={handleRequestHint}
            isLoading={isHintLoading}
            currentLevel={currentLevel}
            maxLevel={maxLevel}
            disabled={!canRequestHint}
            hintsUsed={hintHistory.length}
          />

          {/* 分隔线 */}
          <div className="w-px h-6 bg-[#3c3c3c]" />

          {/* 中间：辅助操作 */}
          <Button
            type="text"
            size="middle"
            icon={<ReloadOutlined />}
            onClick={handleReset}
            title="重置代码"
            style={{ height: 36, color: "#9ca3af" }}
          >
            重置
          </Button>

          <Button
            type="text"
            size="middle"
            icon={<EyeOutlined />}
            onClick={handleShowSolution}
            title="查看答案"
            style={{ height: 36, color: "#9ca3af" }}
          >
            答案
          </Button>

          <Button
            type="text"
            size="middle"
            icon={<SaveOutlined />}
            onClick={() => saveCode(currentLesson.id)}
            title="保存代码"
            style={{ height: 36, color: isSaved ? "#4ade80" : "#9ca3af" }}
          >
            {isSaved ? "已保存" : "保存"}
          </Button>

          {/* 右侧：面板控制 */}
          <div className="ml-auto flex items-center gap-2">
            {isCorrect && (
              <span className="flex items-center gap-1 text-green-400 text-sm">
                <CheckCircleOutlined />
                通过
              </span>
            )}

            <Button
              type="text"
              size="middle"
              icon={isCollapsed ? <ExpandOutlined /> : <CompressOutlined />}
              onClick={toggleCollapse}
              title={isCollapsed ? "展开预览" : "收起预览"}
              style={{ height: 36, width: 36, color: "#9ca3af" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningPage;
