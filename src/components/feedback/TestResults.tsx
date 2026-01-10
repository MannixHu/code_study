/**
 * TestResults 组件
 * 显示测试结果
 */

import { Alert, Spin } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import type { TestResult } from '../../types/lesson'
import './feedback.css'

interface TestResultsProps {
  results: TestResult[]
  isCorrect: boolean
  isLoading?: boolean
}

function TestResults({ results, isCorrect, isLoading = false }: TestResultsProps) {
  if (isLoading) {
    return (
      <div className="test-results-loading">
        <Spin tip="运行测试中..." />
      </div>
    )
  }

  if (results.length === 0) {
    return null
  }

  return (
    <Alert
      title={isCorrect ? '🎉 完成！' : '❌ 还有问题'}
      type={isCorrect ? 'success' : 'error'}
      description={
        <div className="test-results">
          {results.map((result, idx) => (
            <div key={idx} className={`test-item ${result.passed ? 'passed' : 'failed'}`}>
              {result.passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              <span>{result.description}</span>
              {result.message && <span className="test-message">{result.message}</span>}
            </div>
          ))}
        </div>
      }
      className="result-alert"
      showIcon
    />
  )
}

export default TestResults
