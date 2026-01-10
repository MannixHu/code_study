# Contributing to MeFlow3

Thank you for your interest in contributing to MeFlow3!

## Development Workflow

1. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes with frequent commits**
   - Write tests first (TDD approach)
   - Implement feature
   - Ensure all tests pass

3. **Pre-commit checks run automatically**
   - Linting and formatting
   - Type checking

4. **Push triggers pre-push checks**
   - Full TypeScript check
   - All tests
   - Build verification

5. **Create Pull Request**
   - CI runs automatically
   - Performance checks run
   - Request review

## Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (auto-formatted on commit)
- **Linting**: ESLint (auto-fixed on commit)
- **Testing**: Jest + React Testing Library

## Commit Messages

Follow conventional commits format:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
perf: performance improvements
ci: CI/CD changes
```

Examples:

- `feat: add dark mode toggle`
- `fix: resolve login redirect issue`
- `docs: update API documentation`

## Testing Requirements

- Write tests before implementation (TDD)
- Test user interactions, not implementation
- Use descriptive test names
- Target high coverage

Run tests:

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
```

## Performance Guidelines

- Keep bundle size under 500KB
- Use React.memo for expensive components
- Lazy load heavy dependencies
- Check Lighthouse scores in CI

Analyze bundle:

```bash
npm run build:analyze
```

## Pull Request Process

1. Update README.md if needed
2. Add tests for new functionality
3. Ensure all checks pass
4. Request review from maintainers

## Questions?

Open an issue for questions or suggestions.
