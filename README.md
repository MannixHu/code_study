# - React Learning Platform

[![CI](https://github.com/OWNER//actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER//actions/workflows/ci.yml)
[![Performance](https://github.com/OWNER//actions/workflows/performance.yml/badge.svg)](https://github.com/OWNER//actions/workflows/performance.yml)

An interactive React learning platform with code exercises, real-time feedback, and progress tracking.

## Features

- Interactive code exercises with Monaco Editor
- Real-time code evaluation and testing
- Progress tracking with IndexedDB persistence
- Category-based lesson organization
- Web Vitals monitoring

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Ant Design** - UI components
- **Zustand** - State management
- **Dexie** - IndexedDB wrapper
- **Monaco Editor** - Code editor
- **Jest** - Unit testing

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Development

### Git Hooks

This project uses Husky for git hooks:

**Pre-commit (fast ~10-20s):**

- Lints and formats staged files with ESLint + Prettier
- Type checks all files

**Pre-push (comprehensive ~30-60s):**

- Full TypeScript check
- All test suites
- Production build verification

**Bypass hooks (emergency only):**

```bash
git commit --no-verify
git push --no-verify
```

### Testing

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Performance

Bundle targets:

- Main bundle: < 500KB (uncompressed)
- Lighthouse Performance: >= 85
- Lighthouse Accessibility: >= 90

Check bundle size:

```bash
npm run build:analyze
```

### Code Quality

The project enforces code quality through:

- ESLint for linting
- Prettier for formatting
- TypeScript strict mode
- Pre-commit hooks

## Project Structure

```
src/
├── components/        # Shared UI components
├── features/          # Feature modules
│   ├── editor/        # Code editor feature
│   ├── lessons/       # Lesson management
│   └── progress/      # Progress tracking
├── shared/            # Shared utilities
├── store/             # Zustand stores
└── utils/             # Utility functions
```

## Scripts

| Script                  | Description                |
| ----------------------- | -------------------------- |
| `npm run dev`           | Start development server   |
| `npm run build`         | Build for production       |
| `npm run build:analyze` | Build with bundle analysis |
| `npm test`              | Run tests                  |
| `npm run test:coverage` | Run tests with coverage    |
| `npm run lint`          | Run ESLint                 |

## License

MIT
