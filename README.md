# Match-Day Itinerary Planner

> AI-powered match day planning for LTFC football fans ⚽

A monorepo chat application that generates personalised match-day itineraries using Relevance AI agents. Supports real-time pricing, group sharing, push notifications and live updates.

## Prerequisites

- Node.js 22+
- [Relevance AI](https://relevanceai.com) account with deployed agent

> **Note:** No C++ build tools required! This project uses pure JavaScript SQLite (sql.js) instead of native modules for maximum cross-platform compatibility.

## Quick Start

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Set Up Environment Variables

Create `.env` in root with your Relevance AI credentials:

```dotenv
# Relevance AI Configuration (required)
VITE_REGION=your_region_code          # From Relevance AI dashboard
VITE_PROJECT=your_project        # From Relevance AI dashboard
VITE_AGENT_ID=your_agent_id         # From your deployed agent

# Optional: Use VITE_WORKFORCE_ID if you prefer workforce-based routing
# VITE_WORKFORCE_ID=your_workforce_id
```

Get these values from your [Relevance AI dashboard](https://relevanceai.com) → Settings → API Keys.

### 3. Run Development Servers

```bash
npm run dev              # Both frontend & backend
npm run dev:frontend     # Frontend only (http://localhost:5173)
npm run dev:backend      # Backend only (http://localhost:3000)
```

## Key Features

- **Relevance AI Integration**: AI-driven multi-agent itinerary planning
- **Group Sharing**: Base62-encoded share links with expiry
- **Pure JavaScript Database**: sql.js SQLite (no native compilation needed)
- **Full-Stack TypeScript**: Frontend and backend type safety with Windows compatibility
- **Monorepo Structure**: Centralised configs with workspace separation

## Tech Stack

- **Frontend**: Preact and Preact Signals, Tailwind CSS 4.1, Vite 7
- **Backend**: Hono.js, sql.js (pure JavaScript SQLite), TypeScript 5.9
- **Database**: sql.js with JSON file persistence
- **Testing**: Jest, Vitest, Playwright
- **Linting**: Biome 2.2.4
- **Type Checking**: TypeScript with Windows path alias optimisation

## Frontend Architecture

The frontend `src/` directory is organised by responsibility for clarity and scalability:

```text
src/
├── core/                          # App state, types, and configuration
│   ├── signals.ts                 # Preact signals (messages, UI state, etc.)
│   ├── types.ts                   # TypeScript types (IntakeFormData, ItineraryResponse, etc.)
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
│   ├── formConfig.ts              # Form fields, options, CSS classes (centralized)
│   ├── relevance-ai-config.ts     # Tool IDs, strategy, compliance, feature flags
│   └── i18n.ts                    # Translations interface & English translations
│
├── utils/                         # Reusable utilities
│   ├── formUtils.ts               # Generic form utilities (toggleArrayItem, sanitizeInput)
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
│   └── system-prompt-optimized.ts # Main system prompt for LTFC agent
│
├── shims/                         # Cross-platform shims
│   └── crypto.ts                  # Crypto polyfill for browsers
│
├── i18n/                          # Internationalization
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
├── style.css                      # Global Tailwind styles
└── types.ts (deprecated)          # Old location - use core/types.ts instead
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
- Windows-optimized TypeScript paths with case sensitivity checks

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

## Troubleshooting

**"Connection setup needed"** → Add required Relevance AI credentials to `.env` and restart dev server (`npm run dev`)  
**"Dev server crashes on npm install"** → Run `npm install` in root to install monorepo dependencies  
**TypeScript import path errors on Windows** → Configs now include `forceConsistentCasingInFileNames: true` for Windows compatibility. If errors persist, restart the dev server.  
**Lint or type-check not picking up changes** → Stop and restart `npm run dev` (dev server caches environment variables on startup)
