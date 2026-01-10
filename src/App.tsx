import { useState, useEffect, useRef, useCallback, useContext, createContext } from 'react'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
import {
  Layout,
  Tabs,
  Select,
  Button,
  Tag,
  Card,
  Space,
  Typography,
  Badge,
  Alert,
  Tooltip,
  Spin,
  ConfigProvider,
  theme
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  ReloadOutlined,
  EyeOutlined,
  SendOutlined,
  LeftOutlined,
  RightOutlined,
  CodeOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import {
  loadCategory,
  preloadNextCategory,
  getAllCategoryMetadata
} from './utils/lesson-loader'
import { runAllTests } from './utils/ast-tester'
import { saveProgress, getProgress, getCompletedCount } from './db/dexie-db'
import type { Category, Lesson, CategoryMeta } from './types/lesson'
import './App.css'

const { Header, Sider, Content } = Layout
const { Title, Text, Paragraph } = Typography

function App() {
  // 分类相关状态
  const [currentCategoryId, setCurrentCategoryId] = useState('jsx-basics')
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [categoryMetaList, setCategoryMetaList] = useState<CategoryMeta[]>([])
  const [loading, setLoading] = useState(true)

  // 课程相关状态
  const [currentLessonId, setCurrentLessonId] = useState<string>('')
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [userCode, setUserCode] = useState('')
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())

  // 测试和提示状态
  const [testResults, setTestResults] = useState<Array<{ description: string; passed: boolean }>>([])
  const [showHint, setShowHint] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)

  // 加载分类元数据
  useEffect(() => {
    const metadata = getAllCategoryMetadata()

    Promise.all(
      metadata.map(async (meta) => {
        try {
          const category = await loadCategory(meta.id)
          const completed = await getCompletedCount(meta.id)
          return {
            id: meta.id,
            name: meta.name,
            icon: meta.icon,
            total: category.lessons.length,
            completed
          }
        } catch (error) {
          console.error(`Failed to load metadata for ${meta.id}:`, error)
          return {
            id: meta.id,
            name: meta.name,
            icon: meta.icon,
            total: 0,
            completed: 0
          }
        }
      })
    ).then(setCategoryMetaList)
  }, [completedLessonIds])

  // 加载当前分类
  useEffect(() => {
    let mounted = true

    setLoading(true)

    loadCategory(currentCategoryId)
      .then((category) => {
        if (!mounted) return

        setCurrentCategory(category)

        if (category.lessons.length > 0 && !currentLessonId) {
          setCurrentLessonId(category.lessons[0].id)
        }

        setLoading(false)
        preloadNextCategory(currentCategoryId)
      })
      .catch((error) => {
        console.error('Failed to load category:', error)
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [currentCategoryId])

  // 加载已完成的课程列表
  useEffect(() => {
    loadCompletedLessons()
  }, [])

  const loadCompletedLessons = async () => {
    try {
      const allProgress = await Promise.all(
        currentCategory?.lessons.map((lesson) => getProgress(lesson.id)) || []
      )

      const completed = new Set(
        allProgress
          .filter((p) => p && p.completed)
          .map((p) => p!.lessonId)
      )

      setCompletedLessonIds(completed)
    } catch (error) {
      console.error('Failed to load completed lessons:', error)
    }
  }

  // 当切换课程时重置状态
  useEffect(() => {
    if (!currentCategory || !currentLessonId) return

    const lesson = currentCategory.lessons.find((l) => l.id === currentLessonId)
    if (!lesson) return

    setCurrentLesson(lesson)

    getProgress(lesson.id)
      .then((progress) => {
        if (progress && progress.userCode) {
          setUserCode(progress.userCode)
        } else {
          setUserCode(lesson.starterCode)
        }
      })
      .catch(() => {
        setUserCode(lesson.starterCode)
      })

    setTestResults([])
    setShowHint(false)
    setHintIndex(0)
    setIsCorrect(false)
  }, [currentLessonId, currentCategory])

  // 提交答案
  const handleSubmit = async () => {
    if (!currentLesson) return

    const results = runAllTests(userCode, currentLesson.testCases)

    setTestResults(results)

    const allPassed = results.every((r) => r.passed)
    setIsCorrect(allPassed)

    try {
      await saveProgress({
        lessonId: currentLesson.id,
        completed: allPassed,
        attempts: 1,
        lastAttempt: new Date().toISOString(),
        userCode,
        passedTests: results.filter((r) => r.passed).length,
        totalTests: results.length
      })

      if (allPassed) {
        setCompletedLessonIds((prev) => new Set([...prev, currentLesson.id]))
      }
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  // 显示提示
  const handleShowHint = () => {
    if (!currentLesson) return

    setShowHint(true)
    if (hintIndex < currentLesson.hints.length - 1) {
      setHintIndex(hintIndex + 1)
    }
  }

  // 查看答案
  const handleShowSolution = () => {
    if (!currentLesson) return

    setUserCode(currentLesson.solution)
    setIsCorrect(false)
    setTestResults([])
  }

  // 重置代码
  const handleReset = () => {
    if (!currentLesson) return

    setUserCode(currentLesson.starterCode)
    setTestResults([])
    setShowHint(false)
    setHintIndex(0)
    setIsCorrect(false)
  }

  // 切换分类
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategoryId(categoryId)
    setCurrentLessonId('')
  }

  // 切换课程
  const handleLessonChange = (lessonId: string) => {
    setCurrentLessonId(lessonId)
  }

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'default'
    }
  }

  // 获取难度文本
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '困难'
      default: return difficulty
    }
  }

  // 导航到上一题/下一题
  const goToPrevLesson = () => {
    if (!currentCategory) return
    const currentIndex = currentCategory.lessons.findIndex((l) => l.id === currentLessonId)
    if (currentIndex > 0) {
      setCurrentLessonId(currentCategory.lessons[currentIndex - 1].id)
    }
  }

  const goToNextLesson = () => {
    if (!currentCategory) return
    const currentIndex = currentCategory.lessons.findIndex((l) => l.id === currentLessonId)
    if (currentIndex < currentCategory.lessons.length - 1) {
      setCurrentLessonId(currentCategory.lessons[currentIndex + 1].id)
    }
  }

  const currentIndex = currentCategory?.lessons.findIndex((l) => l.id === currentLessonId) ?? -1
  const isFirstLesson = currentIndex === 0
  const isLastLesson = currentIndex === (currentCategory?.lessons.length ?? 0) - 1

  if (loading || !currentCategory || !currentLesson) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  // 生成 Tabs items
  const tabItems = categoryMetaList.map(cat => ({
    key: cat.id,
    label: (
      <span className="tab-label">
        <span className="tab-icon">{cat.icon}</span>
        <span className="tab-name">{cat.name}</span>
        <Badge
          count={`${cat.completed}/${cat.total}`}
          showZero
          color={cat.completed === cat.total && cat.total > 0 ? '#52c41a' : '#8c8c8c'}
          className="tab-badge"
        />
      </span>
    )
  }))

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
      <Layout className="app-layout">
        {/* 顶部导航 */}
        <Header className="app-header">
          <div className="header-logo">
            <CodeOutlined /> React 学习
          </div>
          <Tabs
            activeKey={currentCategoryId}
            onChange={handleCategoryChange}
            items={tabItems}
            className="header-tabs"
            tabBarStyle={{ margin: 0, borderBottom: 'none' }}
          />
        </Header>

        <Layout className="app-body">
          {/* 左侧面板 */}
          <Sider width={400} className="app-sider" theme="light">
            <div className="sider-content">
              {/* 题目选择器 */}
              <Card size="small" className="lesson-card">
                <Text type="secondary" className="label">选择题目</Text>
                <Select
                  value={currentLessonId}
                  onChange={handleLessonChange}
                  className="lesson-select"
                  options={currentCategory.lessons.map((lesson, idx) => ({
                    value: lesson.id,
                    label: (
                      <span className="lesson-option">
                        {completedLessonIds.has(lesson.id) && (
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        )}
                        {idx + 1}. {lesson.title}
                      </span>
                    )
                  }))}
                />
                <div className="lesson-meta">
                  <Tag color={getDifficultyColor(currentLesson.difficulty)}>
                    {getDifficultyText(currentLesson.difficulty)}
                  </Tag>
                  {currentLesson.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                  <Tag icon={<BulbOutlined />}>{currentLesson.estimatedTime} 分钟</Tag>
                </div>
              </Card>

              {/* 题目标题 */}
              <Title level={4} className="lesson-title">{currentLesson.title}</Title>

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
                <Text type="secondary" className="label">说明</Text>
                <Paragraph className="desc-text">{currentLesson.description}</Paragraph>
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

              {/* 测试结果 */}
              {testResults.length > 0 && (
                <Alert
                  title={isCorrect ? '🎉 完成！' : '❌ 还有问题'}
                  type={isCorrect ? 'success' : 'error'}
                  description={
                    <div className="test-results">
                      {testResults.map((result, idx) => (
                        <div key={idx} className={`test-item ${result.passed ? 'passed' : 'failed'}`}>
                          {result.passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                          <span>{result.description}</span>
                        </div>
                      ))}
                    </div>
                  }
                  className="result-alert"
                />
              )}

              {/* 操作按钮 */}
              <Space wrap className="action-buttons">
                <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>
                  提交答案
                </Button>
                <Tooltip title={`查看提示 (${hintIndex}/${currentLesson.hints.length})`}>
                  <Button icon={<BulbOutlined />} onClick={handleShowHint}>
                    提示
                  </Button>
                </Tooltip>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
                <Button danger icon={<EyeOutlined />} onClick={handleShowSolution}>
                  答案
                </Button>
              </Space>

              {/* 导航 */}
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

          {/* 右侧代码区 */}
          <Content className="app-content">
            <div className="editor-panel">
              <div className="panel-header">
                <CodeOutlined /> 代码编辑区
              </div>
              <LiveProvider
                code={userCode}
                scope={{
                  useState,
                  useEffect,
                  useRef,
                  useCallback,
                  useContext,
                  createContext,
                  localStorage
                }}
              >
                <div className="editor-wrapper">
                  <LiveEditor className="code-editor" onChange={setUserCode} />
                </div>

                <div className="preview-panel">
                  <div className="panel-header light">
                    <PlayCircleOutlined /> 实时预览
                  </div>
                  <div className="preview-wrapper">
                    <LivePreview />
                  </div>
                  <LiveError className="live-error" />
                </div>
              </LiveProvider>
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
