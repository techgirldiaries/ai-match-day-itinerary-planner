# Frontend Structure Guide

## Project Organization

The frontend is organized for scalability, maintainability, and clean code separation of concerns.

### Directory Structure

```
src/
├── components/
│   ├── common/              # Reusable UI components (Avatar, Screens, etc.)
│   ├── layout/              # Layout wrapper components (Header, Footer, Nav)
│   ├── features/            # Feature-specific, business logic components
│   │   ├── chat/           # Chat interface components
│   │   ├── intake/         # Intake form components
│   │   ├── itinerary/      # Itinerary rendering components
│   │   ├── modals/         # Modal dialogs
│   │   └── panels/         # Side panels
│   └── hooks/              # Component hooks (useSendMessage, etc.)
├── pages/                   # Page-level components (not nested in components)
│   ├── agents/             # Agent detail pages
│   └── routes/             # App routing setup
├── core/                    # Core application logic
│   ├── state/              # State management (signals, store)
│   ├── types/              # TypeScript types and interfaces
│   ├── constants/          # Application constants
│   └── api/                # API client operations (future)
├── hooks/                   # Global custom hooks
├── utils/
│   ├── helpers/            # General helper functions
│   ├── formatters/         # Data formatting utilities
│   └── validators/         # Validation logic
├── services/               # Business logic services
├── storage/                # LocalStorage management
├── config/                 # Configuration files
├── i18n/                   # Internationalization
├── assets/                 # Static assets (images, fonts)
├── styles/                 # Global styles
├── shims/                  # Browser/runtime shims
└── prompts/               # LLM prompts

```

## Import Guidelines

### Use Barrel Files (index.ts)

Components organize exports through barrel files for cleaner imports:

**❌ Avoid:**

```typescript
import { AgentMessage } from "@/components/features/chat/agent-message";
import { EmailExportModal } from "@/components/features/modals/email-export-modal";
```

**✅ Prefer:**

```typescript
import { AgentMessage } from "@/components/features/chat";
import { EmailExportModal } from "@/components/features/modals";
```

### Path Aliases

Use `@` alias to import from src root:

```typescript
import type { ChatMessage } from "@/core/types";
import { signals } from "@/core/state";
import { Header, Footer } from "@/components/layout";
```

## Component Categories

### Common Components (`components/common/`)

- Avatar
- ConnectionErrorScreen
- EmptyState
- LoadingScreen

**Use for:** Generic, reusable UI components with no feature-specific logic

### Layout Components (`components/layout/`)

- Header
- Footer
- Nav

**Use for:** App wrapper/layout components used across multiple pages

### Feature Components (`components/features/`)

#### Chat (`chat/`)

- AgentMessage
- AgentTyping
- UserMessage

#### Intake (`intake/`)

- IntakeForm
- FormComponents

#### Itinerary (`itinerary/`)

- ItineraryRenderer
- MatchSummaryCard
- Timeline
- CostBreakdownSection
- TransportSection
- etc.

#### Modals (`modals/`)

- EmailExportModal
- ShareModal

#### Panels (`panels/`)

- SavedDraftsPanel
- UserDraftBubble

**Use for:** Business logic & feature-specific components

## Core Organization

### State Management (`core/state/`)

- Preact signals
- Global application state

### Types (`core/types/`)

- TypeScript interfaces
- Type definitions
- Response types

### Constants (`core/constants/`)

- App hardcoded values
- Feature flags
- Default values

## Utilities

### Helpers (`utils/helpers/`)

- `dateHelpers` - Date/time formatting
- `debug` - Debugging utilities
- `formHelpers` - Form manipulation
- `formThemes` - Theme utilities
- `formUtils` - Form utilities
- `stringHelpers` - String operations
- `TimeAgo` - Time ago component

### Formatters (`utils/formatters/`)

- `formatIntakeMessage` - Format intake form data

### Validators (`utils/validators/`)

- `validateIntakeForm` - Form validation logic

## Best Practices

### 1. Component Location

Choose location based on specificity:

- **Global reuse** → `common/`
- **Layout wrapper** → `layout/`
- **Feature-specific** → `features/<feature_name>/`

### 2. File Organization

Each feature folder should include:

```
features/chat/
├── index.ts
├── agent-message.tsx
├── agent-typing.tsx
├── user-message.tsx
└── hooks/               (feature-specific hooks)
```

### 3. Import Order

```typescript
// 1. External libraries
import { signal } from "@preact/signals";

// 2. Core imports
import type { ChatMessage } from "@/core/types";
import { messages } from "@/core/state";

// 3. Component imports
import { Header } from "@/components/layout";
import { AgentMessage } from "@/components/features/chat";

// 4. Utils
import { formatDate } from "@/utils/helpers";

// 5. Styles
import "./MyComponent.css";
```

### 4. Naming Conventions

- Files: `kebab-case.tsx` (e.g., `user-message.tsx`)
- Components: `PascalCase` classes/functions
- Constants: `UPPER_SNAKE_CASE`
- Utilities: `camelCase` functions
- Types/Interfaces: `PascalCase`

### 5. Component Structure

```typescript
import type { ComponentProps } from "preact";
import { useState } from "preact/hooks";
import type { ChatMessage } from "@/core/types";
import { sendMessage } from "@/services";

interface MyComponentProps {
  message: ChatMessage;
}

export function MyComponent({ message }: MyComponentProps) {
  const [state, setState] = useState(false);

  const handleClick = () => {
    // Logic
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Adding New Features

When adding a new feature:

1. **Create feature folder** in `components/features/<feature_name>/`
2. **Create index.ts** barrel file with exports
3. **Add components** for that feature
4. **Create feature-specific hooks** (if needed) in `components/features/<feature_name>/hooks/`
5. **Add types** to `core/types/`
6. **Add utilities** to `utils/` as needed
7. **Update barrel files** to export new components

## Refactoring Checklist

- [ ] Move components to appropriate folders
- [ ] Create/update barrel files (index.ts)
- [ ] Update import paths to use new structure
- [ ] Remove old directories
- [ ] Test that all imports resolve correctly
- [ ] Run type checking: `npm run type-check`
- [ ] Verify no linting errors: `npm run lint`
