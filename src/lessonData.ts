// 课程类型定义
export interface Lesson {
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
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

// 课程分类
export interface Category {
  id: string
  name: string
  description: string
  lessons: Lesson[]
}

// 所有课程数据
export const categories: Category[] = [
  {
    id: 'jsx-basics',
    name: 'JSX 基础',
    description: '学习 JSX 语法、元素渲染和基本规则',
    lessons: [
      {
        id: 1,
        category: 'jsx-basics',
        title: 'Hello World',
        difficulty: 'easy',
        question: '创建一个显示 "Hello React" 的 div 元素',
        description: 'JSX 是 JavaScript 的语法扩展，看起来像 HTML 但实际上是 JavaScript。',
        starterCode: `function App() {
  return (
    // 在这里写 JSX
  )
}

render(<App />)`,
        solution: `function App() {
  return <div>Hello React</div>
}

render(<App />)`,
        hints: [
          'JSX 元素写法和 HTML 类似',
          '使用 <div>Hello React</div>',
          '不需要引号包裹'
        ],
        testCases: [
          {
            description: '应该返回 div 元素',
            test: (code) => code.includes('<div>')
          },
          {
            description: '应该包含文字 "Hello React"',
            test: (code) => code.includes('Hello React')
          }
        ]
      },
      {
        id: 2,
        category: 'jsx-basics',
        title: '多个元素',
        difficulty: 'easy',
        question: '创建一个 h1 标题和一个 p 段落，用 Fragment 包裹',
        description: 'React 组件只能返回一个根元素，使用 Fragment (<>) 可以不添加额外 DOM 节点。',
        starterCode: `function App() {
  return (
    // 使用 <> </> 包裹多个元素
  )
}

render(<App />)`,
        solution: `function App() {
  return (
    <>
      <h1>标题</h1>
      <p>这是一个段落</p>
    </>
  )
}

render(<App />)`,
        hints: [
          '使用 <> 和 </> 包裹多个元素',
          'Fragment 不会在 DOM 中创建额外节点',
          'h1 和 p 元素都要在 Fragment 内'
        ],
        testCases: [
          {
            description: '应该包含 h1 元素',
            test: (code) => code.includes('<h1>')
          },
          {
            description: '应该包含 p 元素',
            test: (code) => code.includes('<p>')
          },
          {
            description: '应该使用 Fragment',
            test: (code) => code.includes('<>') || code.includes('Fragment')
          }
        ]
      },
      {
        id: 3,
        category: 'jsx-basics',
        title: 'JSX 中使用变量',
        difficulty: 'easy',
        question: '定义一个变量 name，在 JSX 中使用 {} 显示它',
        description: '在 JSX 中使用 {} 可以嵌入 JavaScript 表达式。',
        starterCode: `function App() {
  const name = 'React'

  return (
    <div>你好, {/* 在这里显示 name */}</div>
  )
}

render(<App />)`,
        solution: `function App() {
  const name = 'React'

  return (
    <div>你好, {name}</div>
  )
}

render(<App />)`,
        hints: [
          '使用 {name} 在 JSX 中显示变量',
          '花括号内可以写任何 JavaScript 表达式',
          '变量会自动转换为字符串显示'
        ],
        testCases: [
          {
            description: '应该定义 name 变量',
            test: (code) => code.includes('name')
          },
          {
            description: '应该在 JSX 中使用 {name}',
            test: (code) => code.includes('{name}') || code.includes('{ name }')
          }
        ]
      },
      {
        id: 4,
        category: 'jsx-basics',
        title: 'JSX 中的表达式',
        difficulty: 'medium',
        question: '在 JSX 中计算并显示 1 + 2 的结果',
        description: '花括号内可以放任何 JavaScript 表达式，包括运算、函数调用等。',
        starterCode: `function App() {
  return (
    <div>结果是: {/* 在这里计算 1 + 2 */}</div>
  )
}

render(<App />)`,
        solution: `function App() {
  return (
    <div>结果是: {1 + 2}</div>
  )
}

render(<App />)`,
        hints: [
          '在 {} 中直接写 1 + 2',
          '表达式会自动计算并显示结果',
          '可以写任何有效的 JavaScript 表达式'
        ],
        testCases: [
          {
            description: '应该包含加法运算',
            test: (code) => code.includes('1 + 2') || code.includes('1+2')
          },
          {
            description: '应该在花括号中',
            test: (code) => /\{.*1.*\+.*2.*\}/.test(code)
          }
        ]
      },
      {
        id: 5,
        category: 'jsx-basics',
        title: 'className 样式',
        difficulty: 'easy',
        question: '给 div 添加 className="container"',
        description: '在 JSX 中使用 className 而不是 class（因为 class 是 JavaScript 关键字）。',
        starterCode: `function App() {
  return (
    <div>我需要样式</div>
  )
}

render(<App />)`,
        solution: `function App() {
  return (
    <div className="container">我需要样式</div>
  )
}

render(<App />)`,
        hints: [
          '使用 className 而不是 class',
          'className="container"',
          'HTML 的 class 在 JSX 中要改为 className'
        ],
        testCases: [
          {
            description: '应该使用 className',
            test: (code) => code.includes('className')
          },
          {
            description: '值应该是 "container"',
            test: (code) => code.includes('className="container"')
          }
        ]
      }
    ]
  },
  {
    id: 'components',
    name: '组件基础',
    description: '创建和使用 React 组件',
    lessons: [
      {
        id: 6,
        category: 'components',
        title: '创建第一个组件',
        difficulty: 'easy',
        question: '创建一个名为 Welcome 的组件，显示 "欢迎学习 React"',
        description: 'React 组件就是返回 JSX 的函数，组件名首字母必须大写。',
        starterCode: `// 创建 Welcome 组件

function App() {
  return <Welcome />
}

render(<App />)`,
        solution: `function Welcome() {
  return <div>欢迎学习 React</div>
}

function App() {
  return <Welcome />
}

render(<App />)`,
        hints: [
          '组件名首字母大写：Welcome',
          '组件是返回 JSX 的函数',
          'function Welcome() { return ... }'
        ],
        testCases: [
          {
            description: '应该定义 Welcome 组件',
            test: (code) => code.includes('function Welcome')
          },
          {
            description: '应该返回 JSX',
            test: (code) => code.includes('return') && code.includes('欢迎学习 React')
          },
          {
            description: '应该在 App 中使用 <Welcome />',
            test: (code) => code.includes('<Welcome')
          }
        ]
      },
      {
        id: 7,
        category: 'components',
        title: '组件复用',
        difficulty: 'easy',
        question: '创建 Card 组件并在 App 中使用 3 次',
        description: '组件可以复用多次，每个实例都是独立的。',
        starterCode: `function Card() {
  return <div>卡片</div>
}

function App() {
  return (
    <div>
      {/* 使用 3 个 Card 组件 */}
    </div>
  )
}

render(<App />)`,
        solution: `function Card() {
  return <div>卡片</div>
}

function App() {
  return (
    <div>
      <Card />
      <Card />
      <Card />
    </div>
  )
}

render(<App />)`,
        hints: [
          '直接写 3 个 <Card />',
          '组件可以像 HTML 标签一样使用',
          '每个 Card 都是独立的实例'
        ],
        testCases: [
          {
            description: '应该有 Card 组件定义',
            test: (code) => code.includes('function Card')
          },
          {
            description: '应该使用 3 次 Card',
            test: (code) => (code.match(/<Card/g) || []).length >= 3
          }
        ]
      },
      {
        id: 8,
        category: 'components',
        title: '嵌套组件',
        difficulty: 'easy',
        question: '创建 Header 和 Footer 组件，在 App 中组合使用',
        description: '组件可以相互嵌套，构建复杂的 UI 结构。',
        starterCode: `function Header() {
  return <header>头部</header>
}

function Footer() {
  return <footer>底部</footer>
}

function App() {
  return (
    // 组合 Header 和 Footer
  )
}

render(<App />)`,
        solution: `function Header() {
  return <header>头部</header>
}

function Footer() {
  return <footer>底部</footer>
}

function App() {
  return (
    <div>
      <Header />
      <div>内容区域</div>
      <Footer />
    </div>
  )
}

render(<App />)`,
        hints: [
          '在 App 的 div 中依次放 Header、内容、Footer',
          '组件可以像搭积木一样组合',
          '注意只能有一个根元素'
        ],
        testCases: [
          {
            description: '应该使用 Header',
            test: (code) => code.includes('<Header')
          },
          {
            description: '应该使用 Footer',
            test: (code) => code.includes('<Footer')
          },
          {
            description: 'App 应该返回 JSX',
            test: (code) => /function App[\s\S]*return/.test(code)
          }
        ]
      },
      {
        id: 9,
        category: 'components',
        title: '自闭合标签',
        difficulty: 'easy',
        question: '使用自闭合标签渲染 3 个 <br /> 换行',
        description: '没有子元素的标签可以使用自闭合形式 <Tag />。',
        starterCode: `function App() {
  return (
    <div>
      第一行
      {/* 添加 3 个 br 换行 */}
      第二行
    </div>
  )
}

render(<App />)`,
        solution: `function App() {
  return (
    <div>
      第一行
      <br />
      <br />
      <br />
      第二行
    </div>
  )
}

render(<App />)`,
        hints: [
          '使用 <br /> 而不是 <br>',
          'JSX 中所有标签都要闭合',
          '自闭合标签写法: <Tag />'
        ],
        testCases: [
          {
            description: '应该包含 br 标签',
            test: (code) => code.includes('<br')
          },
          {
            description: '应该是自闭合形式',
            test: (code) => code.includes('<br />')
          }
        ]
      },
      {
        id: 10,
        category: 'components',
        title: '导出和使用组件',
        difficulty: 'easy',
        question: '创建 Button 组件并导出为默认导出',
        description: 'export default 用于导出组件，方便在其他文件中引入。',
        starterCode: `function Button() {
  return <button>点击</button>
}

// 导出 Button 组件

function App() {
  return <Button />
}

render(<App />)`,
        solution: `function Button() {
  return <button>点击</button>
}

export default Button

function App() {
  return <Button />
}

render(<App />)`,
        hints: [
          '在组件定义后添加 export default Button',
          'export default 用于导出组件',
          '一个文件只能有一个默认导出'
        ],
        testCases: [
          {
            description: '应该有 Button 组件',
            test: (code) => code.includes('function Button')
          },
          {
            description: '应该导出 Button',
            test: (code) => code.includes('export') && code.includes('Button')
          }
        ]
      }
    ]
  },
  {
    id: 'props',
    name: 'Props 传递',
    description: '学习父子组件通过 Props 通信',
    lessons: [
      {
        id: 11,
        category: 'props',
        title: 'Props 基础',
        difficulty: 'easy',
        question: '创建 Greeting 组件，接收 name prop 并显示',
        description: 'Props 是父组件传递给子组件的数据，类似函数参数。',
        starterCode: `function Greeting(props) {
  return <div>你好, {/* 显示 props.name */}</div>
}

function App() {
  return <Greeting name="张三" />
}

render(<App />)`,
        solution: `function Greeting(props) {
  return <div>你好, {props.name}</div>
}

function App() {
  return <Greeting name="张三" />
}

render(<App />)`,
        hints: [
          '使用 props.name 访问传入的 name',
          'props 是组件的第一个参数',
          '在 JSX 中用 {} 包裹变量'
        ],
        testCases: [
          {
            description: '应该使用 props.name',
            test: (code) => code.includes('props.name')
          },
          {
            description: 'App 应该传递 name prop',
            test: (code) => code.includes('name=')
          }
        ]
      },
      {
        id: 12,
        category: 'props',
        title: 'Props 解构',
        difficulty: 'easy',
        question: '使用解构语法获取 name 和 age props',
        description: '可以在函数参数中直接解构 props，让代码更简洁。',
        starterCode: `function UserCard(props) {
  return (
    <div>
      <p>姓名: {/* name */}</p>
      <p>年龄: {/* age */}</p>
    </div>
  )
}

function App() {
  return <UserCard name="李四" age={25} />
}

render(<App />)`,
        solution: `function UserCard({ name, age }) {
  return (
    <div>
      <p>姓名: {name}</p>
      <p>年龄: {age}</p>
    </div>
  )
}

function App() {
  return <UserCard name="李四" age={25} />
}

render(<App />)`,
        hints: [
          '使用 { name, age } 替代 props',
          '这样可以直接使用 name 和 age',
          '解构语法: function UserCard({ name, age })'
        ],
        testCases: [
          {
            description: '应该使用解构参数',
            test: (code) => code.includes('{') && /function UserCard\s*\(\s*\{/.test(code)
          },
          {
            description: '应该显示 name 和 age',
            test: (code) => code.includes('{name}') && code.includes('{age}')
          }
        ]
      },
      {
        id: 13,
        category: 'props',
        title: '数字类型 Props',
        difficulty: 'easy',
        question: '传递数字 count 给子组件（使用 {} 包裹）',
        description: '传递非字符串类型的 props 需要用 {} 包裹。',
        starterCode: `function Counter({ count }) {
  return <div>计数: {count}</div>
}

function App() {
  return <Counter count={/* 传递数字 10 */} />
}

render(<App />)`,
        solution: `function Counter({ count }) {
  return <div>计数: {count}</div>
}

function App() {
  return <Counter count={10} />
}

render(<App />)`,
        hints: [
          '数字要用 {} 包裹: count={10}',
          '字符串可以用引号: count="10"',
          '但数字类型需要 {}'
        ],
        testCases: [
          {
            description: '应该传递 count prop',
            test: (code) => code.includes('count=')
          },
          {
            description: 'count 应该用 {} 包裹数字',
            test: (code) => code.includes('count={')
          }
        ]
      },
      {
        id: 14,
        category: 'props',
        title: '布尔类型 Props',
        difficulty: 'easy',
        question: '传递 isActive={true} 给 Button 组件',
        description: '布尔值也需要用 {} 包裹，简写形式 <Button disabled /> 等于 disabled={true}。',
        starterCode: `function Button({ isActive }) {
  return (
    <button style={{ background: isActive ? 'green' : 'gray' }}>
      按钮
    </button>
  )
}

function App() {
  return <Button {/* 传递 isActive={true} */} />
}

render(<App />)`,
        solution: `function Button({ isActive }) {
  return (
    <button style={{ background: isActive ? 'green' : 'gray' }}>
      按钮
    </button>
  )
}

function App() {
  return <Button isActive={true} />
}

render(<App />)`,
        hints: [
          '布尔值用 {} 包裹: isActive={true}',
          '简写形式: <Button isActive /> 等于 isActive={true}',
          '<Button /> 不传则是 undefined'
        ],
        testCases: [
          {
            description: '应该传递 isActive',
            test: (code) => code.includes('isActive')
          },
          {
            description: '值应该是 true 或使用简写',
            test: (code) => code.includes('isActive={true}') || code.includes('isActive />')
          }
        ]
      },
      {
        id: 15,
        category: 'props',
        title: '对象类型 Props',
        difficulty: 'medium',
        question: '传递 user 对象 { name: "王五", age: 30 } 给子组件',
        description: '可以传递对象、数组等复杂类型的数据。',
        starterCode: `function UserInfo({ user }) {
  return (
    <div>
      <p>{user.name}</p>
      <p>{user.age}岁</p>
    </div>
  )
}

function App() {
  return <UserInfo user={/* 传递对象 */} />
}

render(<App />)`,
        solution: `function UserInfo({ user }) {
  return (
    <div>
      <p>{user.name}</p>
      <p>{user.age}岁</p>
    </div>
  )
}

function App() {
  return <UserInfo user={{ name: "王五", age: 30 }} />
}

render(<App />)`,
        hints: [
          '对象字面量用双花括号: user={{ ... }}',
          '外层 {} 是 JSX 语法，内层 {} 是对象',
          '对象包含 name 和 age 属性'
        ],
        testCases: [
          {
            description: '应该传递 user prop',
            test: (code) => code.includes('user=')
          },
          {
            description: '应该是对象形式',
            test: (code) => code.includes('user={{')
          },
          {
            description: '对象应该有 name 和 age',
            test: (code) => code.includes('name:') && code.includes('age:')
          }
        ]
      },
      {
        id: 16,
        category: 'props',
        title: '函数类型 Props',
        difficulty: 'medium',
        question: '传递 onClick 函数给 Button，点击时 alert',
        description: '可以传递函数作为 props，实现子组件向父组件通信。',
        starterCode: `function Button({ onClick }) {
  return <button onClick={onClick}>点击我</button>
}

function App() {
  return <Button onClick={/* 传递函数 */} />
}

render(<App />)`,
        solution: `function Button({ onClick }) {
  return <button onClick={onClick}>点击我</button>
}

function App() {
  return <Button onClick={() => alert('被点击了')} />
}

render(<App />)`,
        hints: [
          '传递箭头函数: onClick={() => alert("...")}',
          '函数会在 Button 内部被调用',
          '这是子组件向父组件通信的方式'
        ],
        testCases: [
          {
            description: '应该传递 onClick prop',
            test: (code) => /App[\s\S]*onClick=/.test(code)
          },
          {
            description: '应该是函数形式',
            test: (code) => code.includes('=>') || code.includes('function')
          }
        ]
      },
      {
        id: 17,
        category: 'props',
        title: 'children 属性',
        difficulty: 'medium',
        question: '创建 Card 组件，使用 children 显示内部内容',
        description: 'children 是特殊的 prop，表示组件标签之间的内容。',
        starterCode: `function Card({ children }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px' }}>
      {/* 显示 children */}
    </div>
  )
}

function App() {
  return (
    <Card>
      <h3>标题</h3>
      <p>内容</p>
    </Card>
  )
}

render(<App />)`,
        solution: `function Card({ children }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px' }}>
      {children}
    </div>
  )
}

function App() {
  return (
    <Card>
      <h3>标题</h3>
      <p>内容</p>
    </Card>
  )
}

render(<App />)`,
        hints: [
          'children 表示 <Card> 和 </Card> 之间的内容',
          '直接使用 {children} 显示',
          'children 可以是任何 JSX'
        ],
        testCases: [
          {
            description: '应该使用 children',
            test: (code) => code.includes('{children}') || code.includes('{ children }')
          },
          {
            description: 'Card 应该接收 children prop',
            test: (code) => code.includes('children')
          }
        ]
      },
      {
        id: 18,
        category: 'props',
        title: '默认 Props',
        difficulty: 'medium',
        question: '给 color prop 设置默认值 "blue"',
        description: '可以使用默认参数语法为 props 提供默认值。',
        starterCode: `function Button({ label, color }) {
  return (
    <button style={{ background: color }}>
      {label}
    </button>
  )
}

function App() {
  return (
    <div>
      <Button label="按钮1" color="red" />
      <Button label="按钮2" />
    </div>
  )
}

render(<App />)`,
        solution: `function Button({ label, color = 'blue' }) {
  return (
    <button style={{ background: color }}>
      {label}
    </button>
  )
}

function App() {
  return (
    <div>
      <Button label="按钮1" color="red" />
      <Button label="按钮2" />
    </div>
  )
}

render(<App />)`,
        hints: [
          '在参数中设置默认值: color = "blue"',
          '解构时可以直接赋值',
          '不传 color 时会使用默认值'
        ],
        testCases: [
          {
            description: '应该给 color 设置默认值',
            test: (code) => code.includes('color =') || code.includes('color=')
          },
          {
            description: '默认值应该是 "blue"',
            test: (code) => /color\s*=\s*['"]blue['"]/.test(code)
          }
        ]
      }
    ]
  }
]
