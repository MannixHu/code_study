# Shared Directory

Contains shared resources used across features.

## Structure

```
src/shared/
├── components/      # Reusable UI components (Layout, etc.)
├── db/             # Database configuration (Dexie)
├── hooks/          # Global hooks
├── types/          # Global type definitions
├── constants/      # Application constants
├── utils/          # Utility functions
├── styles/         # Global styles and theme
└── index.ts        # Public API export
```

## Components

### layout/
- **AppLayout**: Main application layout wrapper
- **AppHeader**: Application header
- **AppSidebar**: Sidebar navigation

## Database

- **dexie-db.ts**: Dexie database configuration for offline storage

## Types

Global type definitions that cross feature boundaries.

## Usage Examples

```typescript
// Importing shared components
import { AppLayout, AppHeader, AppSidebar } from '../../shared/components/layout'

// Importing database
import { db } from '../../shared/db'

// Importing global types
import type { ServiceResult } from '../../shared/types'
```

## Guidelines

- Add to shared only when used by 2+ features
- Keep global styles minimal
- Avoid feature-specific logic in shared modules
- Document public APIs in each module's index.ts
