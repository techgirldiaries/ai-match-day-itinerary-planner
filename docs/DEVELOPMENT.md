# Development Workflow

## Project Structure

This is a **monorepo** with two independent workspaces:

- **`frontend/`** — Preact UI app served on <http://localhost:5173>
- **`backend/`** — Hono.js API server on <http://localhost:3000>

## Adding Features

### Frontend Features

1. **Create components** in `frontend/src/components/` following existing patterns
2. **Add types** to `frontend/src/core/types.ts`
3. **Add form config** to `frontend/src/config/formConfig.ts` if needed
4. **Use existing utilities** from `frontend/src/utils/` or create new ones following the naming convention
5. **Test in browser** — dev server auto-reloads on changes

Example workflow:

```bash
# 1. Start dev server
npm run dev:frontend

# 2. Create new component
# frontend/src/components/my-feature.tsx

# 3. Import and use in Parent component
# Changes appear instantly in browser
```

### Backend Features

1. **Create routes** in `backend/src/routes/`
2. **Add database operations** in `backend/src/db/`
3. **Create services** in `backend/src/services/` for business logic
4. **Add types** to `backend/src/types/`
5. **Test endpoints** with fetch or curl

Example workflow:

```bash
# 1. Create route file
# backend/src/routes/my-feature.ts

# 2. Register route in backend/src/index.ts
# app.route('/api/my-feature', myFeatureRoutes)

# 3. Dev server restarts on changes
```

## Monorepo Commands

```bash
npm run dev                    # Start both workspaces
npm run dev:frontend           # Frontend only
npm run dev:backend            # Backend only

npm run build                  # Build both workspaces
npm run build -w frontend      # Build frontend only
npm run build -w backend       # Build backend only

npm run type-check             # Type-check all workspaces
npm run type-check -w frontend # Type-check frontend only

npm run lint                   # Lint both workspaces
npm run lint:fix               # Auto-fix linting issues

npm install -w frontend        # Install deps in frontend only
npm install -w backend         # Install deps in backend only
```

## Code Quality Standards

- **TypeScript**: All code must be properly typed
- **Component naming**: Use kebab-case for file names (e.g., `user-message.tsx`)
- **Utility naming**: Descriptive, grouped by function (e.g., `dateHelpers.ts`)
- **Configuration**: Centralise options in `config/` and `core/`
- **No hardcoded values**: Use constants from `core/constant.ts`
- **Accessibility**: All interactive components must be keyboard accessible
- **Performance**: Use Preact signals for state, avoid unnecessary re-renders

## Frontend Architecture

The frontend `src/` directory is organised by responsibility for clarity and scalability:

```text
src/
├── core/                          # App state, types, and configuration
│   ├── signals.ts                 # Preact signals (messages, UI state, etc.)
│   ├── types.ts                   # TypeScript types
│   ├── constant.ts                # Relevance AI credentials from .env
│   └── user.ts                    # Anonymous user session management
│
├── services/                      # External integrations
│   └── client.ts                  # Relevance AI SDK client initialization
│
├── storage/                       # Data persistence
│   ├── draft-storage.ts           # Draft itinerary CRUD operations
│   ├── messageStorage.ts          # Chat message localStorage persistence
│   └── preferenceStorage.ts       # User preferences (dark mode, language)
│
├── config/                        # Feature configuration
│   ├── formConfig.ts              # Form fields, options, CSS classes
│   ├── relevance-ai-config.ts     # Tool IDs, strategy, compliance, feature flags
│   └── i18n.ts                    # Translations interface & English translations
│
├── utils/                         # Reusable utilities
│   ├── formUtils.ts               # Generic form utilities
│   ├── formHelpers.ts             # Form validation and helpers
│   ├── formThemes.ts              # CSS class builders for form styling
│   ├── dateHelpers.ts             # Date/time utilities
│   ├── stringHelpers.ts           # String manipulation utilities
│   └── debug.ts                   # Debug logging with environment toggle
│
├── components/                    # React/Preact components
│   ├── App.tsx                    # Main app shell and routing
│   ├── Header.tsx                 # Navigation and language selector
│   ├── Footer.tsx                 # Message input and sender
│   ├── IntakeForm.tsx             # Multi-step form for itinerary preferences
│   ├── AgentMessage.tsx           # Agent response with itinerary rendering
│   ├── UserMessage.tsx            # User message bubble
│   ├── Nav.tsx                    # Sidebar navigation
│   ├── ShareModal.tsx             # Group sharing modal with share link
│   ├── SavedDraftsPanel.tsx       # Draft management UI
│   ├── ConnectionErrorScreen.tsx  # Error state when offline
│   ├── LoadingScreen.tsx          # Initial load state
│   ├── EmailExportModal.tsx       # Email export functionality
│   ├── UserDraftBubble.tsx        # Draft indicator bubble
│   ├── AgentTyping.tsx            # Typing indicator animation
│   ├── EmptyState.tsx             # Initial empty state
│   ├── pages/                     # Agent detail pages
│   │   ├── agents-overview-page.tsx
│   │   ├── agent-detail-page.tsx
│   │   ├── shared-itinerary-page.tsx
│   │   └── [agent-specific pages]
│   ├── pages/app-routes/          # Route components
│   │   ├── chat-route.tsx
│   │   ├── agents-route.tsx
│   │   ├── drafts-route.tsx
│   │   └── [other routes]
│   ├── hooks/                     # Custom hooks
│   │   └── useSendMessage.ts      # Message sending logic
│   ├── itinerary-renderer/        # Itinerary display components
│   │   ├── Timeline.tsx           # Timeline section
│   │   ├── TransportSection.tsx   # Transport options
│   │   ├── CostBreakdownSection.tsx
│   │   ├── BookingLinks.tsx
│   │   └── [other sections]
│   └── utils/                     # Component-specific utilities
│       ├── formatIntakeMessage.ts # Format intake form to prompt
│       └── validateIntakeForm.ts  # Form validation rules
│
├── prompts/                       # AI prompts
│   └── system-prompt-optimised.ts # Main system prompt for LTFC agent
│
├── shims/                         # Cross-platform shims
│   └── crypto.ts                  # Crypto polyfill for browsers
│
├── i18n/                          # Internationalisation
│   ├── t.ts                       # Translation function
│   ├── translations.ts            # Translation key mappings
│   ├── types.ts                   # Translation interface
│   └── translations/              # Translation files per language
│       ├── en.json
│       ├── es.json
│       ├── fr.json
│       └── [other languages]
│
├── index.tsx                      # App entry point
└── style.css                      # Global Tailwind styles
```

**Key Design Principles:**

- **Separation of Concerns**: Core state → Services → Storage → Config → Components
- **Single Responsibility**: Each module has one clear purpose
- **Centralised Configuration**: All form options/styles in `formConfig.ts`, compliance settings in `relevance-ai-config.ts`
- **Reusable Utilities**: Generic helpers in `utils/`, component-specific ones in `components/utils/`
- **Type Safety**: All types in `core/types.ts`, shared across app
- **Easy Testing**: Isolated utilities and hooks for unit testing
- **Scalability**: Clear structure supports adding new features without confusion

## Project Configuration

This is a **monorepo** using centralised configuration files in `.config/`:

```text
.config/
├── typescript/         # tsconfig.base.json, tsconfig.frontend.json, tsconfig.backend.json
├── vite/               # vite.base.ts, vite.frontend.ts, vite.backend.ts
├── testing/            # jest.config.js, playwright.config.js
├── linting/            # biome reference configs
└── build/              # tailwind.config.js
```

Root-level configs (only essentials):

- `biome.json` — Linting rules for the entire monorepo
- `tsconfig.json` — Root paths with workspace path aliases (`@/*` → `frontend/src/*`)

Workspace-specific configs (in `frontend/` and `backend/`):

- Each workspace has its own `tsconfig.json`, `vite.config.ts` that extend from `.config/`
- Keeps concerns separated while reusing base configurations

**Key benefits:**

- Single source of truth in `.config/`
- Clean root directory (no stub files)
- Easy monorepo maintenance
- Windows-optimised TypeScript paths with case sensitivity checks

**Available commands:**

```bash
npm run dev                      # Start frontend & backend dev servers
npm run build                    # Build both workspaces
npm run type-check -w frontend   # Type-check frontend
npm run type-check -w backend    # Type-check backend
npm run lint                     # Lint both workspaces
npm run lint:fix                 # Auto-fix linting issues
```

**Windows Optimisation:** TypeScript configs include `skipLibCheck`, `forceConsistentCasingInFileNames` and `resolveJsonModule` for reliable cross-platform import resolution.
