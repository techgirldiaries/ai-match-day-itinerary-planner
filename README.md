# LTFC AI Match-Day Itinerary Planner 

The LTFC AI Match-Day Itinerary Planner is a full-stack AI application that helps football supporters organise every stage of their match-day journey through a single conversational interface. Built as a 10-week Agile project, the platform combines a modern TypeScript monorepo with Relevance AI to provide intelligent travel planning, live fixture information, weather forecasts, venue recommendations, accommodation suggestions and collaborative trip planning. An orchestration layer coordinates multiple specialised AI agents to generate a single personalised itinerary in real time. 

--- 

## Overview 

Planning a football match day often requires switching between multiple applications for transport, weather, maps, restaurants and fixture information. This project brings those services together into one AI-powered assistant. User requests are analysed by an orchestration layer, delegated to specialised agents and combined into a structured itinerary that can be viewed, shared and updated throughout the day. 

--- 

## Features 

### Match-Day Planning 

- Personalised match-day itineraries
- Live fixture information
- Transport and route planning
- Parking recommendations
- Walking directions
- Restaurant and attraction discovery
- Accommodation suggestions
- Weather-aware packing lists
- Fantasy match predictions

### Collaboration

- Group itinerary sharing
- Push notifications
- Local storage persistence
- Multi-language support (11 languages)

### AI Platform 

- Orchestrated multi-agent workflows
- Parallel execution of specialised AI agents
- Context-aware recommendations
- Modular and extensible architecture

---

# System Architecture

```text
                        User

                         │

                         ▼

               Orchestrator Agent

                         │

 ┌──────────┬──────────┬──────────┬──────────┐

 ▼          ▼          ▼          ▼          ▼

Travel   Weather    Match      Food      Community
 Agent     Agent     Agent      Agent       Agent

        ├──────── Accommodation Agent
        ├──────── Packing Agent
        ├──────── Heritage Agent
        ├──────── Fantasy Agent
        ├──────── Social Impact Agent
        ├──────── Business Intelligence Agent
        └──────── Youth Development Agent

                         │

                         ▼

          Personalised Match-Day Itinerary
```

The orchestration layer distributes user requests across domain-specific AI agents, aggregates their responses and returns a unified itinerary. The modular design enables additional agents and services to be introduced without changing the overall workflow.

---

## Technology Stack

### Frontend

- Preact
- Preact Signals
- Tailwind CSS 4.1
- Vite 7
- TypeScript 5.9

### Backend

- Hono.js
- TypeScript
- sql.js (SQLite)
- REST APIs

### AI Platform

- Relevance AI
- Relevance AI SDK
- Model Context Protocol (MCP)

### External APIs

- Google Maps Places API
- OpenWeather API
- Google Search
- The Odds API
- Google Calendar
- Outlook Calendar

---

## Repository Structure

```text
ai-match-day-itinerary-planner/
│
├── frontend/
│   └── src/
│       ├── components/        # Feature-organised UI components
│       ├── pages/             # Page-level components and routing
│       ├── core/              # State management, types and constants
│       ├── services/          # API client and integrations
│       ├── storage/           # Local storage persistence
│       ├── utils/             # Shared utilities and validators
│       ├── i18n/              # Internationalisation (11 languages)
│       └── index.tsx          # Frontend entry point
│
├── backend/
│   ├── src/
│   │   ├── routes/            # REST API endpoints
│   │   ├── services/          # Business logic
│   │   ├── db/                # Database initialisation
│   │   ├── types/             # Shared TypeScript types
│   │   └── index.ts           # Backend entry point
│   └── data/
│       └── ltfc.json          # JSON persistence for sql.js
│
├── docs/
│   ├── DEVELOPMENT.md
│   ├── TESTING.md
│   ├── DEPLOY.md
│   └── ...
│
├── .config/                   # Shared TypeScript, Vite and Jest configuration
├── package.json
├── README.md
└── LICENSE
```

---

# AI Agents

| Agent | Responsibility |
|--------|----------------|
| Orchestrator | Coordinates all AI workflows |
| Travel | Route planning and transport |
| Match Information | Fixtures, tickets and kick-off times |
| Weather | Forecasts and clothing recommendations |
| Food & Venues | Restaurants, pubs and attractions |
| Accommodation | Hotel recommendations |
| Community | Group planning and ride sharing |
| Packing | Weather-based packing lists |
| Heritage | Club history and storytelling |
| Fantasy | Match predictions |
| Social Impact | Community engagement |
| Business Intelligence | Analytics and reporting |
| Youth Development | Academy and youth information |

---

# Quick Start

## Prerequisites

- Node.js 22+
- npm
- Git
- Relevance AI account with a deployed agent

## Installation

```bash
# Clone the repository
git clone https://github.com/techgirldiaries/ai-match-day-itinerary-planner.git

cd ai-match-day-itinerary-planner

# Install dependencies
npm install --legacy-peer-deps
```

## Configure Relevance AI

```bash
cd frontend

cp .env.example .env
```

Update the `.env` file with your Relevance AI credentials.

```env
VITE_REGION=
VITE_PROJECT=
VITE_AGENT_ID=
```

## Start the Development Servers

```bash
cd ..

npm run dev
```

Services:

| Service | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |

For detailed setup instructions, development workflow and troubleshooting, see **docs/DEVELOPMENT.md**.

---

# Documentation

| Document | Description |
|----------|-------------|
| docs/DEVELOPMENT.md | Development workflow, architecture, coding standards and setup |
| docs/TESTING.md | Unit, component and end-to-end testing |
| docs/DEPLOY.md | Production deployment and CI/CD |

---

# Project Management

This project was delivered by a five-person Agile team over a ten-week development cycle using Scrum. 

As Project Manager, I was responsible for: 

- Sprint planning, reviews and retrospectives
- Agile delivery across eight development sprints
- GitLab Kanban and backlog management
- Stakeholder communication and scope management
- MoSCoW prioritisation following changing requirements
- Coordinating frontend, backend and AI integration
- Supporting Relevance AI SDK implementation
- Integrating Maps, Weather and Transport services
- Promoting GDPR, WCAG accessibility and responsible AI practices

---

# Technical Challenges

Key engineering challenges included:

- Coordinating concurrent multi-agent workflows
- Implementing asynchronous trigger-then-poll execution
- Managing SDK request timeouts
- Handling third-party API rate limits
- Integrating multiple external services
- Responding to mid-project scope changes
- Delivering a production-ready MVP within a fixed ten-week schedule

---

# Project Outcomes

- Delivered a stable Minimum Viable Product within 10 weeks
- Successfully coordinated an orchestrator with 11 specialised AI agents
- Generated personalised real-time match-day itineraries
- Built a scalable multi-agent architecture
- Achieved a 98% average sprint delivery rate
- Embedded accessibility, GDPR and responsible AI principles throughout development

---

# Future Enhancements

Planned improvements include:

- User authentication
- Persistent user profiles
- Saved itinerary history
- WebSocket-based live updates
- Mobile application
- AI-powered budget optimisation
- Voice assistant support
- Docker deployment
- CI/CD pipeline
- Support for additional football clubs

---

## Team 

Developed as part of the **CIS047-3 Agile Project Management** module at the **University of Bedfordshire**. 
**Role:** Project Manager 

--- 

## License 

This project was developed for educational purposes. 

Copyright © 2026 Group 8 - Luton Power (University of Bedfordshire).
