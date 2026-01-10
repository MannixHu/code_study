/**
 * AppSidebar 组件
 * 左侧边栏，显示课程列表和相关信息
 */

import { Layout, Card, Select, Tag, Button, Space, Tooltip, Alert } from 'antd'
import { LeftOutlined, RightOutlined, BulbOutlined, SendOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { useLesson } from '../../../features/lessons'
import { useProgress } from '../../../features/progress'
import { useUIStore } from '../../../store'
import { useMemo } from 'react'
import './layout.css'

const { Sider } = Layout

function AppSidebar() {
  const { currentCategory, currentLesson, currentLessonId, setCurrentLesson } = useLesson()
  const { completedLessonIds } = useProgress()
  const { showHint, hintIndex, resetHint, nextHint } = useUIStore()

  // 计算当前课程的索引
  const currentIndex = useMemo(() => {
    if (!currentCategory || !currentLessonId) return -1
    return currentCategory.lessons.findIndex((l) => l.id === currentLessonId)
  }, [currentCategory, currentLessonId])

  const isFirstLesson = currentIndex === 0
  const isLastLesson = currentIndex === (currentCategory?.lessons.length ?? 0) - 1

  // 导航到上一课
  const goToPrevLesson = () => {
    if (currentCategory && currentIndex > 0) {
      setCurrentLesson(currentCategory.lessons[currentIndex - 1].id)
      resetHint()
    }
  }

  // 导航到下一课
  const goToNextLesson = () => {
    if (currentCategory && currentIndex < currentCategory.lessons.length - 1) {
      setCurrentLesson(currentCategory.lessons[currentIndex + 1].id)
      resetHint()
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'default'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '困难'
      default: return difficulty
    }
  }

  if (!currentCategory || !currentLesson) {
    return null
  }

  return (
    <Sider width={400} className="app-sider" theme="light">
      <div className="sider-content">
        {/* 题目选择器 */}
        <Card size="small" className="lesson-card">
          <label className="label">选择题目</label>
          <Select
            value={currentLessonId}
            onChange={setCurrentLesson}
            className="lesson-select"
            options={currentCategory.lessons.map((lesson, idx) => ({
              value: lesson.id,
              label: (
                <span className="lesson-option">
                  {completedLessonIds.has(lesson.id) && (
                    <span style={{ color: '#52c41a', marginRight: 8 }}>✓</span>
                  )}
                  {idx + 1}. {lesson.title}
                </span>
              ),
            }))}
          />
          <div className="lesson-meta">
            <Tag color={getDifficultyColor(currentLesson.difficulty)}>
              {getDifficultyText(currentLesson.difficulty)}
            </Tag>
            {currentLesson.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            <Tag icon={<BulbOutlined />}>{currentLesson.estimatedTime} 分钟</Tag>
          </div>
        </Card>

        {/* 题目标题 */}
        <h4 className="lesson-title">{currentLesson.title}</h4>

        {/* 任务说明 */}
        <Alert
          title="任务"
          description={currentLesson.question}
          type="info"
          showIcon
          className="task-alert"
        />

        {/* 描述 */}
        <Card size="small" className="desc-card">
          <label className="label">说明</label>
          <p className="desc-text">{currentLesson.description}</p>
        </Card>

        {/* 提示 */}
        {showHint && hintIndex > 0 && (
          <Alert
            title={`提示 ${hintIndex}/${currentLesson.hints.length}`}
            description={currentLesson.hints[hintIndex - 1]}
            type="warning"
            showIcon
            className="hint-alert"
          />
        )}

        {/* 操作按钮 */}
        <Space wrap className="action-buttons">
          <Button type="primary" icon={<SendOutlined />}>
            提交答案
          </Button>
          <Tooltip title={`查看提示 (${hintIndex}/${currentLesson.hints.length})`}>
            <Button icon={<BulbOutlined />} onClick={() => nextHint(currentLesson.hints.length)}>
              提示
            </Button>
          </Tooltip>
          <Button icon={<ReloadOutlined />}>
            重置
          </Button>
          <Button danger icon={<EyeOutlined />}>
            答案
          </Button>
        </Space>

        {/* 导航按钮 */}
        <div className="nav-buttons">
          <Button
            icon={<LeftOutlined />}
            onClick={goToPrevLesson}
            disabled={isFirstLesson}
          >
            上一题
          </Button>
          <Button
            onClick={goToNextLesson}
            disabled={isLastLesson}
          >
            下一题 <RightOutlined />
          </Button>
        </div>
      </div>
    </Sider>
  )
}

export default AppSidebar
