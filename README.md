# AI Match-Day Itinerary Planner

> Agentic AI match day planning for LTFC football fans ⚽

A full-stack TypeScript monorepo that generates personalised match-day itineraries using Relevance AI. Includes group sharing, real-time updates, and multi-language support.

## Quick Start

**Prerequisites:** Node.js 22+, [Relevance AI](https://relevanceai.com) account with deployed agent

```bash
# Clone and install
git clone https://github.com/techgirldiaries/ai-match-day-itinerary-planner.git
cd ai-match-day-itinerary-planner
npm install --legacy-peer-deps

# Configure Relevance AI credentials
cd frontend
cp .env.example .env
# Edit .env with your VITE_REGION, VITE_PROJECT, VITE_AGENT_ID

# Start dev servers
cd ..
npm run dev  # Frontend: localhost:5173, Backend: localhost:3000
```

**See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed setup and troubleshooting.**

## Documentation

- **[Development Workflow](docs/DEVELOPMENT.md)** — Architecture, commands, code standards
- **[Testing Guide](docs/TESTING.md)** — Unit, component, and E2E tests
- **[Deployment](docs/DEPLOY.md)** — Production setup and CI/CD

## Tech Stack

- **Frontend**: Preact, Preact Signals, Tailwind CSS, Vite
- **Backend**: Hono.js, TypeScript
- **Database**: sql.js (pure JavaScript SQLite)
- **Testing**: Jest, Playwright

## Project Structure

```
├── frontend/                  # Preact SPA
│   └── src/
│       ├── components/        # Feature-organized UI components
│       ├── pages/             # Page-level components & routing
│       ├── core/              # State management, types, constants
│       ├── services/          # API client, external integrations
│       ├── storage/           # localStorage persistence
│       ├── utils/             # Shared utilities & validators
│       ├── i18n/              # 11-language localization
│       └── index.tsx          # App entry point
│
├── backend/                   # Hono API server
│   ├── src/
│   │   ├── routes/            # API endpoints (conversations, shares)
│   │   ├── services/          # Business logic
│   │   ├── db/                # Database initialization & queries
│   │   ├── types/             # Shared TypeScript types
│   │   └── index.ts           # Server entry point
│   └── data/
│       └── ltfc.json          # SQLite data persistence
│
├── docs/                      # Detailed documentation
│   ├── DEVELOPMENT.md         # Development guide
│   ├── TESTING.md             # Test procedures
│   ├── DEPLOY.md              # Deployment instructions
│   └── ...
│
└── .config/                   # Shared configs (TypeScript, Vite, Jest)
```

## Architecture

### Frontend

Component organization follows a feature-based pattern:

- **`components/common/`** — Reusable UI components (Avatar, LoadingScreen, ErrorScreen, etc.)
- **`components/layout/`** — App shell (Header, Footer, Navigation)
- **`components/features/`** — Feature groups (chat, intake, itinerary, modals, panels)
- **`pages/`** — Page-level components and routing logic
- **`core/`** — Global state (Preact Signals), types, constants
- **`services/`** — Relevance AI SDK initialization and API clients
- **`storage/`** — localStorage persistence (drafts, messages, preferences)
- **`i18n/`** — 11-language localization setup
- **`utils/`** — Shared helpers and validators

See [DEVELOPMENT.md](docs/DEVELOPMENT.md#frontend-architecture) for detailed component structure.

### Backend

- **`routes/`** — API endpoints (conversations, shares)
- **`services/`** — Business logic and Relevance AI integration
- **`db/`** — sql.js database initialization and queries
- **`types/`** — Shared TypeScript definitions

### Database

Uses **sql.js** (pure JavaScript SQLite) with JSON file persistence (`backend/data/ltfc.json`). No native modules or C++ build tools required.

## License

See [LICENSE](LICENSE.md)
