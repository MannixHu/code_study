# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React + TypeScript application code.
  - `src/components/`: UI (`layout/`, `editor/`, `pages/`, `feedback/`).
  - `src/hooks/`: feature hooks (e.g. `useLesson`, `useProgress`).
  - `src/store/`: Zustand stores (`*Store.ts`).
  - `src/services/`: business/services layer (`*-service.ts`).
  - `src/repository/` + `src/db/`: Dexie persistence (`*-repository.ts`).
  - `src/workers/`: Web Workers (AST parsing/evaluation).
  - `src/types/`, `src/utils/`: shared types and helpers.
- `public/lessons/`: lesson JSON content served by Vite at runtime.
- `tests/`: Vitest tests (keep files as `tests/**/*.test.ts(x)`).
- `dist/`: production build output (generated).

## Build, Test, and Development Commands
Preferred package manager is `pnpm` (lockfile: `pnpm-lock.yaml`). If you use `npm`, avoid updating both lockfiles in one PR.
- `pnpm install`: install dependencies.
- `pnpm dev`: start local Vite dev server.
- `pnpm build`: typecheck/build (`tsc -b`) + `vite build`.
- `pnpm preview`: serve the built `dist/` bundle locally.
- `pnpm lint`: run ESLint on the repo.
- `pnpm test` / `pnpm test:ui` / `pnpm test:coverage`: run Vitest (headless/UI/coverage).

## Coding Style & Naming Conventions
- TypeScript is `strict`; keep types explicit and avoid `any` unless justified.
- Follow existing formatting (2-space indent, single quotes, no semicolons) and fix issues via `pnpm lint`.
- Naming patterns:
  - Components: `PascalCase.tsx` (e.g. `src/components/LessonSelector.tsx`).
  - Hooks: `useX.ts` in `src/hooks/`.
  - Services: `*-service.ts` in `src/services/`.
  - Repos: `*-repository.ts` in `src/repository/`.
  - Stores: `*Store.ts` in `src/store/`.
- Import alias: `@` maps to `src/` (see `vite.config.ts`).

## Testing Guidelines
- Framework: Vitest with `happy-dom` (configured in `vite.config.ts`).
- Put new tests under `tests/` and name them `*.test.ts` / `*.test.tsx`.
- When adding features or bug fixes, include focused unit tests where practical and keep tests deterministic.

## Commit & Pull Request Guidelines
- Git history currently includes `feat: ...` and short `opt` commits; prefer consistent Conventional Commits (`feat:`, `fix:`, `perf:`, `chore:`) with a clear subject.
- PRs should include: what/why, how to test (commands), and screenshots for UI changes.
- Do not commit generated or local artifacts (e.g. `dist/`, `node_modules/`).

## Security & Configuration Notes
- Lesson “checker” expressions can be evaluated in a worker; treat lesson JSON as trusted input and avoid plumbing user-provided strings into evaluation paths.
