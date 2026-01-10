/**
 * CodeEditor 组件
 * 使用 Monaco Editor 的代码编辑器
 */

import { useRef } from 'react'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

interface CodeEditorProps {
  value: string
  onChange: (code: string) => void
  language?: string
  height?: string | number
  theme?: string
  options?: editor.IStandaloneEditorConstructionOptions
}

function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '100%',
  theme = 'vs-dark',
  options = {},
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor

    // 设置编辑器快捷键
    editor.addCommand(
      // @ts-ignore - Monaco Editor API
      editor.KeyMod.CtrlCmd | editor.KeyCode.KeyS,
      () => {
        // Ctrl+S 保存（由上层处理）
        console.log('Save triggered')
      }
    )
  }

  const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    fontSize: 13,
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    lineHeight: 1.6,
    padding: { top: 16 },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    formatOnPaste: true,
    autoIndent: 'full',
    tabSize: 2,
    insertSpaces: true,
    ...options,
  }

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={handleEditorChange}
      onMount={handleEditorMount}
      theme={theme === 'light' ? 'vs' : 'vs-dark'}
      options={defaultOptions}
      loading={<div style={{ padding: '20px' }}>加载编辑器中...</div>}
    />
  )
}

export default CodeEditor
