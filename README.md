# LTFC AI Match-Day Itinerary Planner

> AI-powered multi-agent match-day planning platform built for Luton Town Football Club supporters.⚽

The LTFC AI Match-Day Itinerary Planner is a full-stack chat application that generates personalised football match-day itineraries using a coordinated multi-agent architecture. 

An Orchestrator Agent coordinates 11 specialised AI agents running in parallel to produce tailored travel plans, weather recommendations, restaurant suggestions, accommodation options, match information, community coordination and live updates.

The application also supports:
- Live travel recommendations
- Weather-aware packing suggestions
- Real-time venue discovery
- Group itinerary sharing
- Push notifications
- Live match updates
- Calendar integration 
- Personalised fan experiences

## Tech Stack

- **Frontend**: Preact, Preact Signals, Tailwind CSS, Vite
- **Backend**: Hono.js, TypeScript
- **Database**: sql.js (pure JavaScript SQLite)
- **Testing**: Jest, Playwright

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

- **[Development Workflow](docs/DEVELOPMENT.md)** - Architecture, commands, code standards
- **[Testing Guide](docs/TESTING.md)** - Unit, component and E2E tests
- **[Deployment](docs/DEPLOY.md)** - Production setup and CI/CD

## Project Structure

```
├── frontend/                  # Preact SPA
│   └── src/
│       ├── components/        # Feature-organised UI components
│       ├── pages/             # Page-level components & routing
│       ├── core/              # State management, types, constants
│       ├── services/          # API client, external integrations
│       ├── storage/           # localStorage persistence
│       ├── utils/             # Shared utilities & validators
│       ├── i18n/              # 11-language localisation
│       └── index.tsx          # App entry point
│
├── backend/                   # Hono API server
│   ├── src/
│   │   ├── routes/            # API endpoints (conversations, shares)
│   │   ├── services/          # Business logic
│   │   ├── db/                # Database initialisation & queries
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
- **`services/`** — Relevance AI SDK initialisation and API clients
- **`storage/`** — localStorage persistence (drafts, messages, preferences)
- **`i18n/`** — 11-language localisation setup
- **`utils/`** — Shared helpers and validators

See [DEVELOPMENT.md](docs/DEVELOPMENT.md#frontend-architecture) for detailed component structure.

### Backend

- **`routes/`** — API endpoints (conversations, shares)
- **`services/`** — Business logic and Relevance AI integration
- **`db/`** — sql.js database initialisation and queries
- **`types/`** — Shared TypeScript definitions

### Database

Uses **sql.js** (pure JavaScript SQLite) with JSON file persistence (`backend/data/ltfc.json`). No native modules or C++ build tools required.

## License

See [LICENSE](LICENSE.md)
