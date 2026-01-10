/**
 * LearningPage 组件
 * 主学习页面，包含代码编辑器和实时预览
 */

import { useState } from "react";
import { Spin } from "antd";
import { PlayCircleOutlined, CodeOutlined } from "@ant-design/icons";
import { useLesson } from "../hooks/useLesson";
import { useEditor, useTestRunner, CodeEditor } from "../../editor";
import { TestResults } from "../../progress";
import { useHint, HintButton, HintPanel } from "../../hints";

function LearningPage() {
  const { currentLesson, loading } = useLesson();
  const { userCode, isSaved, setUserCode, resetCode, saveCode } = useEditor(
    currentLesson?.id || "",
    currentLesson?.starterCode,
  );
  const { testResults, isRunningTests, isCorrect, runTests } = useTestRunner(
    currentLesson?.id || "",
  );

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

  if (loading || !currentLesson) {
    return (
      <div className="learning-page loading-state">
        <Spin size="large" />
      </div>
    );
  }

  const handleRunTests = async () => {
    await runTests(userCode, currentLesson.testCases);
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
  };

  return (
    <div className="learning-page">
      {/* 编辑器面板 */}
      <div className="editor-panel">
        <div className="panel-header">
          <CodeOutlined /> 代码编辑区
          <span className="save-indicator">
            {!isSaved && <span className="unsaved-dot"></span>}
            {isSaved && <span className="saved-text">已保存</span>}
          </span>
        </div>

        <CodeEditor
          value={userCode}
          onChange={setUserCode}
          language="javascript"
          height="100%"
        />
      </div>

      {/* 预览和结果面板 */}
      <div className="preview-panel">
        <div className="panel-header light">
          <PlayCircleOutlined /> 实时预览
        </div>

        <div className="preview-wrapper">
          {/* Hint Panel */}
          {showHintPanel && (hintHistory.length > 0 || hintError) && (
            <div style={{ marginBottom: 12 }}>
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
            <div className="preview-placeholder">
              <p>运行测试查看结果</p>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="preview-controls">
          <button
            className="btn btn-primary"
            onClick={handleRunTests}
            disabled={isRunningTests}
          >
            {isRunningTests ? "运行中..." : "运行测试"}
          </button>

          <HintButton
            onClick={handleRequestHint}
            isLoading={isHintLoading}
            currentLevel={currentLevel}
            maxLevel={maxLevel}
            disabled={!canRequestHint}
            hintsUsed={hintHistory.length}
          />

          <button className="btn btn-default" onClick={handleReset}>
            重置代码
          </button>
          <button className="btn btn-default" onClick={handleShowSolution}>
            查看答案
          </button>
          <button
            className="btn btn-default"
            onClick={() => saveCode(currentLesson.id)}
          >
            保存代码
          </button>
        </div>
      </div>
    </div>
  );
}

export default LearningPage;
