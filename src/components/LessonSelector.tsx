import type { Lesson } from '../types/lesson'

interface LessonSelectorProps {
  lessons: Lesson[]
  currentLessonId: string
  completedLessonIds: Set<string>
  onLessonChange: (lessonId: string) => void
}

/**
 * 题目选择器组件
 * 下拉菜单显示当前分类的所有题目
 */
function LessonSelector({
  lessons,
  currentLessonId,
  completedLessonIds,
  onLessonChange
}: LessonSelectorProps) {
  // 获取难度标签颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#22c55e'
      case 'medium':
        return '#f59e0b'
      case 'hard':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  // 获取难度中文名
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单'
      case 'medium':
        return '中等'
      case 'hard':
        return '困难'
      default:
        return ''
    }
  }

  return (
    <div className="lesson-selector-wrapper">
      <label htmlFor="lesson-select" className="lesson-selector-label">
        选择题目:
      </label>
      <select
        id="lesson-select"
        value={currentLessonId}
        onChange={(e) => onLessonChange(e.target.value)}
        className="lesson-selector"
      >
        {lessons.map((lesson) => {
          const isCompleted = completedLessonIds.has(lesson.id)
          const difficultyText = getDifficultyText(lesson.difficulty)

          return (
            <option key={lesson.id} value={lesson.id}>
              {isCompleted ? '✓ ' : ''}
              {lesson.title}
              {' - '}
              {difficultyText}
              {lesson.estimatedTime ? ` (${lesson.estimatedTime}min)` : ''}
            </option>
          )
        })}
      </select>

      {/* 当前题目信息 */}
      <div className="current-lesson-info">
        {lessons.map((lesson) => {
          if (lesson.id !== currentLessonId) return null

          return (
            <div key={lesson.id} className="lesson-meta">
              <span
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(lesson.difficulty) }}
              >
                {getDifficultyText(lesson.difficulty)}
              </span>
              {lesson.tags.map((tag) => (
                <span key={tag} className="tag-badge">
                  {tag}
                </span>
              ))}
              {lesson.estimatedTime && (
                <span className="time-badge">⏱️ {lesson.estimatedTime} 分钟</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LessonSelector
