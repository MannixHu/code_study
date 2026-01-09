import { useState, useEffect, useRef, useCallback, useContext, createContext } from 'react'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
import './App.css'

// 课程类型定义
interface Lesson {
  id: number
  title: string
  question: string
  description: string
  starterCode: string
  solution: string
  hints: string[]
  testCases: Array<{
    description: string
    test: (code: string) => boolean
  }>
}

// 预设的学习教程
const lessons: Lesson[] = [
  {
    id: 1,
    title: '1. 第一个组件',
    question: '创建一个名为 Welcome 的组件，显示文字 "欢迎学习 React"',
    description: 'React 组件就是返回 JSX 的函数。JSX 看起来像 HTML，但实际上是 JavaScript。',
    starterCode: `function Welcome() {
  // 在这里写代码
  return <div></div>
}

render(<Welcome />)`,
    solution: `function Welcome() {
  return <div>欢迎学习 React</div>
}

render(<Welcome />)`,
    hints: [
      '在 return 语句中的 <div> 标签里写入文字',
      '确保组件名称是 Welcome',
      'JSX 中的文字直接写在标签之间即可'
    ],
    testCases: [
      {
        description: '组件名称应该是 Welcome',
        test: (code) => code.includes('function Welcome')
      },
      {
        description: '应该返回包含文字的 div',
        test: (code) => code.includes('<div>') && code.includes('欢迎学习 React')
      },
      {
        description: '应该调用 render 渲染组件',
        test: (code) => code.includes('render(<Welcome />')
      }
    ]
  },
  {
    id: 2,
    title: '2. 使用 useState',
    question: '创建一个计数器，初始值为 0，点击按钮时数字加 1',
    description: 'useState 是 React Hook，用于在函数组件中添加状态。它返回 [状态值, 更新函数]。',
    starterCode: `function Counter() {
  // 使用 useState 创建一个 count 状态

  return (
    <div>
      <p>计数: {/* 在这里显示 count */}</p>
      <button onClick={() => {/* 点击时让 count + 1 */}}>
        +1
      </button>
    </div>
  )
}

render(<Counter />)`,
    solution: `function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  )
}

render(<Counter />)`,
    hints: [
      '使用 const [count, setCount] = useState(0) 创建状态',
      '在 JSX 中用 {count} 显示状态值',
      '在 onClick 中调用 setCount(count + 1) 更新状态'
    ],
    testCases: [
      {
        description: '应该使用 useState',
        test: (code) => code.includes('useState')
      },
      {
        description: '应该显示 count 变量',
        test: (code) => code.includes('{count}') || code.includes('{ count }')
      },
      {
        description: '按钮点击时应该更新状态',
        test: (code) => code.includes('setCount') && code.includes('count + 1')
      }
    ]
  },
  {
    id: 3,
    title: '3. 输入框双向绑定',
    question: '创建一个输入框，实时显示用户输入的内容',
    description: 'React 中没有 v-model，需要手动绑定 value 和 onChange 事件。',
    starterCode: `function InputDemo() {
  // 创建一个 text 状态

  return (
    <div>
      <input
        placeholder="输入点什么..."
        // 绑定 value 和 onChange
      />
      <p>你输入的是: {/* 显示 text */}</p>
    </div>
  )
}

render(<InputDemo />)`,
    solution: `function InputDemo() {
  const [text, setText] = useState('')

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入点什么..."
      />
      <p>你输入的是: {text}</p>
    </div>
  )
}

render(<InputDemo />)`,
    hints: [
      '创建一个 text 状态，初始值为空字符串',
      'input 的 value 属性绑定到 text',
      'onChange 事件中调用 setText(e.target.value)',
      'e.target.value 是输入框的当前值'
    ],
    testCases: [
      {
        description: '应该创建 text 状态',
        test: (code) => code.includes('useState') && code.includes('setText')
      },
      {
        description: '输入框应该绑定 value',
        test: (code) => code.includes('value={text}') || code.includes('value={ text }')
      },
      {
        description: '应该处理 onChange 事件',
        test: (code) => code.includes('onChange') && code.includes('e.target.value')
      }
    ]
  },
  {
    id: 4,
    title: '4. 列表渲染',
    question: '渲染一个待办事项列表，每项都要有 key 属性',
    description: '使用 map 遍历数组渲染列表，React 需要 key 来识别每个元素。',
    starterCode: `function TodoList() {
  const todos = [
    { id: 1, text: '学习 React' },
    { id: 2, text: '学习 Hooks' },
    { id: 3, text: '做项目' }
  ]

  return (
    <ul>
      {/* 使用 map 渲染 todos */}
    </ul>
  )
}

render(<TodoList />)`,
    solution: `function TodoList() {
  const todos = [
    { id: 1, text: '学习 React' },
    { id: 2, text: '学习 Hooks' },
    { id: 3, text: '做项目' }
  ]

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
}

render(<TodoList />)`,
    hints: [
      '使用 todos.map() 遍历数组',
      '每个 li 都需要 key 属性，使用 todo.id',
      '在 li 标签中显示 todo.text'
    ],
    testCases: [
      {
        description: '应该使用 map 遍历数组',
        test: (code) => code.includes('.map(')
      },
      {
        description: '每个 li 应该有 key 属性',
        test: (code) => code.includes('key={todo.id}') || code.includes('key={ todo.id }')
      },
      {
        description: '应该显示 todo.text',
        test: (code) => code.includes('{todo.text}') || code.includes('{ todo.text }')
      }
    ]
  },
  {
    id: 5,
    title: '5. 条件渲染',
    question: '创建登录按钮，点击后显示"已登录"和登出按钮',
    description: '使用三元表达式或 && 进行条件渲染，类似 Vue 的 v-if。',
    starterCode: `function LoginDemo() {
  const [isLogin, setIsLogin] = useState(false)

  return (
    <div>
      {/* 根据 isLogin 条件渲染不同内容 */}
    </div>
  )
}

render(<LoginDemo />)`,
    solution: `function LoginDemo() {
  const [isLogin, setIsLogin] = useState(false)

  return (
    <div>
      {isLogin ? (
        <div>
          <p>已登录</p>
          <button onClick={() => setIsLogin(false)}>
            登出
          </button>
        </div>
      ) : (
        <button onClick={() => setIsLogin(true)}>
          登录
        </button>
      )}
    </div>
  )
}

render(<LoginDemo />)`,
    hints: [
      '使用三元表达式: isLogin ? <已登录内容> : <未登录内容>',
      '登录按钮点击时调用 setIsLogin(true)',
      '登出按钮点击时调用 setIsLogin(false)'
    ],
    testCases: [
      {
        description: '应该创建 isLogin 状态',
        test: (code) => code.includes('isLogin') && code.includes('setIsLogin')
      },
      {
        description: '应该使用条件渲染',
        test: (code) => code.includes('isLogin ?') || code.includes('isLogin&&') || code.includes('isLogin &&')
      },
      {
        description: '按钮应该切换登录状态',
        test: (code) => code.includes('setIsLogin(true)') && code.includes('setIsLogin(false)')
      }
    ]
  },
  {
    id: 6,
    title: '6. Props 和 TypeScript',
    question: '创建一个带类型的 Button 组件，接收 label、onClick 和可选的 disabled 属性',
    description: 'TypeScript 可以为 props 提供类型检查，避免运行时错误。使用 interface 定义 props 类型。',
    starterCode: `// 定义 Props 类型
interface ButtonProps {
  // 在这里定义类型
}

function Button(props: ButtonProps) {
  return (
    <button>
      {/* 使用 props */}
    </button>
  )
}

function App() {
  return (
    <div>
      <Button label="点击我" onClick={() => alert('clicked')} />
      <Button label="禁用按钮" onClick={() => {}} disabled={true} />
    </div>
  )
}

render(<App />)`,
    solution: `interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

function App() {
  return (
    <div>
      <Button label="点击我" onClick={() => alert('clicked')} />
      <Button label="禁用按钮" onClick={() => {}} disabled={true} />
    </div>
  )
}

render(<App />)`,
    hints: [
      'interface 中 label: string, onClick: () => void',
      '可选属性用 disabled?: boolean',
      '使用解构: { label, onClick, disabled }: ButtonProps',
      'button 元素的 disabled 属性绑定到 props.disabled'
    ],
    testCases: [
      {
        description: '应该定义 ButtonProps interface',
        test: (code) => code.includes('interface ButtonProps')
      },
      {
        description: 'Props 应该包含 label, onClick',
        test: (code) => code.includes('label') && code.includes('onClick')
      },
      {
        description: 'disabled 应该是可选属性',
        test: (code) => code.includes('disabled?')
      },
      {
        description: '组件应该使用解构获取 props',
        test: (code) => code.includes('{') && code.includes('label') && code.includes('}')
      }
    ]
  },
  {
    id: 7,
    title: '7. useEffect 副作用',
    question: '创建一个计时器，每秒递增，并在组件卸载时清理定时器',
    description: 'useEffect 用于处理副作用（如定时器、API 调用）。返回清理函数避免内存泄漏。',
    starterCode: `function Timer() {
  const [seconds, setSeconds] = useState(0)

  // 使用 useEffect 创建定时器

  return <div>已运行: {seconds} 秒</div>
}

render(<Timer />)`,
    solution: `function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return <div>已运行: {seconds} 秒</div>
}

render(<Timer />)`,
    hints: [
      '使用 useEffect(() => { ... }, []) 在组件挂载时执行',
      '用 setInterval 创建定时器',
      'setSeconds(prev => prev + 1) 更新状态',
      'return () => clearInterval(timer) 清理定时器'
    ],
    testCases: [
      {
        description: '应该使用 useEffect',
        test: (code) => code.includes('useEffect')
      },
      {
        description: '应该使用 setInterval',
        test: (code) => code.includes('setInterval')
      },
      {
        description: '应该返回清理函数',
        test: (code) => code.includes('return') && code.includes('clearInterval')
      },
      {
        description: 'useEffect 应该有空依赖数组',
        test: (code) => code.includes('}, [])')
      }
    ]
  },
  {
    id: 8,
    title: '8. useRef 引用 DOM',
    question: '创建一个输入框，点击按钮时让输入框获得焦点',
    description: 'useRef 可以获取 DOM 元素的引用，直接操作 DOM。',
    starterCode: `function FocusInput() {
  // 创建 ref

  const handleFocus = () => {
    // 让输入框获得焦点
  }

  return (
    <div>
      <input placeholder="点击按钮聚焦我" />
      <button onClick={handleFocus}>聚焦输入框</button>
    </div>
  )
}

render(<FocusInput />)`,
    solution: `function FocusInput() {
  const inputRef = useRef(null)

  const handleFocus = () => {
    inputRef.current?.focus()
  }

  return (
    <div>
      <input ref={inputRef} placeholder="点击按钮聚焦我" />
      <button onClick={handleFocus}>聚焦输入框</button>
    </div>
  )
}

render(<FocusInput />)`,
    hints: [
      '使用 const inputRef = useRef(null) 创建 ref',
      'input 标签上添加 ref={inputRef}',
      'inputRef.current.focus() 让元素获得焦点',
      '使用可选链 ?. 避免 null 错误'
    ],
    testCases: [
      {
        description: '应该导入和使用 useRef',
        test: (code) => code.includes('useRef')
      },
      {
        description: 'input 应该绑定 ref',
        test: (code) => code.includes('ref={') && code.includes('Ref}')
      },
      {
        description: '应该调用 focus 方法',
        test: (code) => code.includes('.focus()')
      }
    ]
  },
  {
    id: 9,
    title: '9. 自定义 Hook',
    question: '创建一个 useCounter Hook，返回 count、increment 和 decrement 函数',
    description: '自定义 Hook 让你复用状态逻辑。Hook 名称必须以 use 开头。',
    starterCode: `// 自定义 Hook
function useCounter(initialValue = 0) {
  // 实现计数器逻辑
}

function App() {
  const { count, increment, decrement } = useCounter(0)

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  )
}

render(<App />)`,
    solution: `function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount(count + 1)
  const decrement = () => setCount(count - 1)

  return { count, increment, decrement }
}

function App() {
  const { count, increment, decrement } = useCounter(0)

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  )
}

render(<App />)`,
    hints: [
      'Hook 内部使用 useState 管理 count',
      '创建 increment 函数: () => setCount(count + 1)',
      '创建 decrement 函数: () => setCount(count - 1)',
      'return { count, increment, decrement }'
    ],
    testCases: [
      {
        description: 'useCounter 应该使用 useState',
        test: (code) => code.includes('useState')
      },
      {
        description: '应该返回 count, increment, decrement',
        test: (code) => code.includes('return {') && code.includes('count') && code.includes('increment') && code.includes('decrement')
      },
      {
        description: 'increment 应该增加计数',
        test: (code) => code.includes('increment') && code.includes('+ 1')
      },
      {
        description: 'decrement 应该减少计数',
        test: (code) => code.includes('decrement') && code.includes('- 1')
      }
    ]
  },
  {
    id: 10,
    title: '10. useCallback 优化',
    question: '使用 useCallback 缓存函数，避免子组件不必要的重渲染',
    description: 'useCallback 缓存函数引用，配合 React.memo 可以优化性能。',
    starterCode: `function ChildButton({ onClick, label }) {
  console.log('ChildButton 渲染')
  return <button onClick={onClick}>{label}</button>
}

function App() {
  const [count, setCount] = useState(0)
  const [other, setOther] = useState(0)

  // 使用 useCallback 缓存函数

  return (
    <div>
      <p>计数: {count}</p>
      <p>其他: {other}</p>
      <ChildButton onClick={handleClick} label="增加计数" />
      <button onClick={() => setOther(other + 1)}>增加其他</button>
    </div>
  )
}

render(<App />)`,
    solution: `function ChildButton({ onClick, label }) {
  console.log('ChildButton 渲染')
  return <button onClick={onClick}>{label}</button>
}

function App() {
  const [count, setCount] = useState(0)
  const [other, setOther] = useState(0)

  const handleClick = useCallback(() => {
    setCount(count + 1)
  }, [count])

  return (
    <div>
      <p>计数: {count}</p>
      <p>其他: {other}</p>
      <ChildButton onClick={handleClick} label="增加计数" />
      <button onClick={() => setOther(other + 1)}>增加其他</button>
    </div>
  )
}

render(<App />)`,
    hints: [
      '使用 useCallback(() => { ... }, [依赖]) 包装函数',
      'handleClick 依赖 count，所以 [count]',
      '当依赖不变时，函数引用保持不变',
      '配合 React.memo 可以避免子组件重渲染'
    ],
    testCases: [
      {
        description: '应该使用 useCallback',
        test: (code) => code.includes('useCallback')
      },
      {
        description: 'useCallback 应该有依赖数组',
        test: (code) => code.includes('useCallback') && code.includes('[count]')
      },
      {
        description: 'handleClick 应该更新 count',
        test: (code) => code.includes('setCount')
      }
    ]
  },
  {
    id: 11,
    title: '11. TypeScript 泛型 Hook',
    question: '创建一个泛型的 useLocalStorage Hook，可以存储任何类型的数据',
    description: 'TypeScript 泛型让 Hook 可以处理不同类型的数据，保持类型安全。',
    starterCode: `// 定义泛型 Hook
function useLocalStorage<T>(key: string, initialValue: T) {
  // 实现逻辑
}

function App() {
  const [name, setName] = useLocalStorage<string>('name', '')
  const [age, setAge] = useLocalStorage<number>('age', 0)

  return (
    <div>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="姓名"
      />
      <input
        type="number"
        value={age}
        onChange={e => setAge(Number(e.target.value))}
        placeholder="年龄"
      />
      <p>姓名: {name}, 年龄: {age}</p>
    </div>
  )
}

render(<App />)`,
    solution: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

function App() {
  const [name, setName] = useLocalStorage<string>('name', '')
  const [age, setAge] = useLocalStorage<number>('age', 0)

  return (
    <div>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="姓名"
      />
      <input
        type="number"
        value={age}
        onChange={e => setAge(Number(e.target.value))}
        placeholder="年龄"
      />
      <p>姓名: {name}, 年龄: {age}</p>
    </div>
  )
}

render(<App />)`,
    hints: [
      '使用 useState<T> 存储值',
      'localStorage.getItem(key) 读取数据',
      'useEffect 在值变化时保存到 localStorage',
      'return [value, setValue] as const 保持类型'
    ],
    testCases: [
      {
        description: '应该使用泛型 <T>',
        test: (code) => code.includes('function useLocalStorage<T>')
      },
      {
        description: '应该使用 localStorage',
        test: (code) => code.includes('localStorage')
      },
      {
        description: '应该使用 useEffect 保存数据',
        test: (code) => code.includes('useEffect') && code.includes('setItem')
      },
      {
        description: '应该返回数组',
        test: (code) => code.includes('return [') || code.includes('return[')
      }
    ]
  },
  {
    id: 12,
    title: '12. Context API',
    question: '创建一个 ThemeContext，实现深层组件共享主题状态',
    description: 'Context 可以避免 props 逐层传递，让深层组件直接访问全局状态。',
    starterCode: `// 创建 Context
const ThemeContext = createContext(null)

function ThemeProvider({ children }) {
  // 实现主题状态
}

function ThemedButton() {
  // 使用 Context
  return <button>切换主题</button>
}

function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  )
}

render(<App />)`,
    solution: `const ThemeContext = createContext(null)

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#000' : '#fff'
      }}
    >
      当前主题: {theme}
    </button>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  )
}

render(<App />)`,
    hints: [
      'Provider 中使用 useState 管理 theme',
      'value={{ theme, toggleTheme }} 传递值',
      '子组件用 useContext(ThemeContext) 获取',
      '根据 theme 值改变按钮样式'
    ],
    testCases: [
      {
        description: '应该创建 Context',
        test: (code) => code.includes('createContext')
      },
      {
        description: '应该使用 Provider',
        test: (code) => code.includes('.Provider')
      },
      {
        description: '应该使用 useContext',
        test: (code) => code.includes('useContext')
      },
      {
        description: '应该有 theme 和 toggleTheme',
        test: (code) => code.includes('theme') && code.includes('toggleTheme')
      }
    ]
  }
]

function App() {
  const [currentLesson, setCurrentLesson] = useState(0)
  const [userCode, setUserCode] = useState('')
  const [testResults, setTestResults] = useState<Array<{ description: string; passed: boolean }>>([])
  const [showHint, setShowHint] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [completed, setCompleted] = useState<number[]>([])

  const lesson = lessons[currentLesson]

  // 当切换课程时重置状态
  useEffect(() => {
    setUserCode(lesson.starterCode)
    setTestResults([])
    setShowHint(false)
    setHintIndex(0)
    setIsCorrect(false)
  }, [currentLesson, lesson.starterCode])

  // 提交答案
  const handleSubmit = () => {
    const results = lesson.testCases.map(testCase => ({
      description: testCase.description,
      passed: testCase.test(userCode)
    }))

    setTestResults(results)

    const allPassed = results.every(r => r.passed)
    setIsCorrect(allPassed)

    if (allPassed && !completed.includes(lesson.id)) {
      setCompleted([...completed, lesson.id])
    }
  }

  // 显示提示
  const handleShowHint = () => {
    setShowHint(true)
    if (hintIndex < lesson.hints.length - 1) {
      setHintIndex(hintIndex + 1)
    }
  }

  // 查看答案
  const handleShowSolution = () => {
    setUserCode(lesson.solution)
    setIsCorrect(false)
    setTestResults([])
  }

  // 重置代码
  const handleReset = () => {
    setUserCode(lesson.starterCode)
    setTestResults([])
    setShowHint(false)
    setHintIndex(0)
    setIsCorrect(false)
  }

  return (
    <div className="app">
      {/* 顶部导航 */}
      <header className="header">
        <h1>🚀 React 交互式学习</h1>
        <p>从 Vue2 开发者的视角学习 React - 完成任务，提交答案</p>
      </header>

      {/* 课程导航 */}
      <nav className="nav">
        {lessons.map((l, idx) => (
          <button
            key={l.id}
            className={`${currentLesson === idx ? 'active' : ''} ${completed.includes(l.id) ? 'completed' : ''}`}
            onClick={() => setCurrentLesson(idx)}
          >
            {completed.includes(l.id) && '✓ '}
            {l.title}
          </button>
        ))}
      </nav>

      {/* 主内容区 */}
      <main className="main">
        {/* 左侧：说明 */}
        <aside className="sidebar">
          <h2>{lesson.title}</h2>
          <div className="question-box">
            <h3>📝 任务</h3>
            <p>{lesson.question}</p>
          </div>

          <div className="description-box">
            <h3>💡 说明</h3>
            <p>{lesson.description}</p>
          </div>

          {showHint && (
            <div className="hint-box">
              <h3>💡 提示 {hintIndex}/{lesson.hints.length}</h3>
              <p>{lesson.hints[hintIndex - 1]}</p>
            </div>
          )}

          {testResults.length > 0 && (
            <div className={`test-results ${isCorrect ? 'success' : 'failure'}`}>
              <h3>{isCorrect ? '🎉 完成！' : '❌ 还有问题'}</h3>
              {testResults.map((result, idx) => (
                <div key={idx} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
                  {result.passed ? '✓' : '✗'} {result.description}
                </div>
              ))}
            </div>
          )}

          <div className="actions">
            <button className="btn-primary" onClick={handleSubmit}>
              ✅ 提交答案
            </button>
            <button className="btn-secondary" onClick={handleShowHint}>
              💡 提示 ({hintIndex}/{lesson.hints.length})
            </button>
            <button className="btn-secondary" onClick={handleReset}>
              🔄 重置
            </button>
            <button className="btn-danger" onClick={handleShowSolution}>
              👁️ 查看答案
            </button>
          </div>

          <div className="navigation">
            <button
              onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
              disabled={currentLesson === 0}
            >
              ← 上一课
            </button>
            <button
              onClick={() => setCurrentLesson(Math.min(lessons.length - 1, currentLesson + 1))}
              disabled={currentLesson === lessons.length - 1}
            >
              下一课 →
            </button>
          </div>
        </aside>

        {/* 右侧：代码编辑器 */}
        <section className="playground">
          <div className="editor-section">
            <h3>✏️ 代码编辑区</h3>
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
              <div className="editor-container">
                <LiveEditor
                  className="editor"
                  onChange={setUserCode}
                />
              </div>

              <div className="preview-section">
                <h3>👀 实时预览</h3>
                <div className="preview-container">
                  <LivePreview />
                </div>
                <LiveError className="error" />
              </div>
            </LiveProvider>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
