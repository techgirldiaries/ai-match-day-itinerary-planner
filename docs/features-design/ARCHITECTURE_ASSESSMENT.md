# Architecture Assessment: Feature Integration Points

## Executive Summary

The current system is a **frontend-only SPA** using Preact Signals, localStorage, and Relevance AI Workforce for agent orchestration. The four planned features introduce **stateful backend requirements** that necessitate a backend service layer. Current architecture is **not ready** for these features without modifications.

---

## Current Architecture Strengths

| Aspect                   | Current State                                     | Impact                                                    |
| ------------------------ | ------------------------------------------------- | --------------------------------------------------------- |
| **State Management**     | Preact Signals (reactive, localStorage-persisted) | Excellent for client-side session management              |
| **Scalability**          | Decoupled frontend, no backend coupling           | Easy to add a new backend without refactoring frontend    |
| **Extensibility**        | Agent-based workflow, modular components          | Ready for dynamic data sources                            |
| **Persistence**          | Browser localStorage only                         | Suitable for drafts, not for live data (pricing, updates) |
| **Real-time Capability** | None (one-way request-response)                   | Must add WebSocket or Server-Sent Events (SSE)            |
| **User Sessions**        | Anonymous UUIDs only                              | No auth layer; suitable for anonymous sharing links       |

---

## Feature Impact Analysis

### Feature 1: Real-Time Train/Coach Pricing

**Integration Points:**

- **New Backend Service** — Required to cache/proxy Trainline/National Rail APIs
- **API Endpoint** — `GET /api/costs/transport` with query params (route, date, transport_type)
- **Frontend Integration** — Replace static costs in `CostBreakdownSection.tsx` with live fetches
- **Data Refresh** — Triggered on intake form submission or manual refresh
- **Caching Strategy** — Backend caches for 5-10 mins to avoid rate limits

**Architectural Changes:**

```text
Current: Agent generates cost estimate → stored as JSON
New: Agent generates estimate → Frontend fetches live prices → Merge data
```

**Breaking Changes:** None. Cost rendering logic unchanged; data source changes only.

---

### Feature 2: Group Invite Links

**Integration Points:**

- **URL Structure** — `/{groupId}/itinerary` (short, shareable link)
- **Backend Storage** — Persist itinerary + group metadata (DB or long-lived cache)
- **Frontend Routing** — Add new route for shared itinerary view (read-only)
- **Serialization** — Compress itinerary JSON → short URL token (base64/brotli)
- **Expiry** — Optional: short-lived links (24-48 hours) or permanent storage

**Architectural Changes:**

```text
Current: Drafts stored in browser localStorage only
New: Drafts can be stored server-side + shared via short URL
```

**Backend Requirements:**

- Database (PostgreSQL/Firebase) or distributed cache (Redis)
- URL shortener or base64 token encoding
- User-less share model (no auth required)

**Breaking Changes:** None. Existing draft system unaffected.

---

### Feature 3: Push Notifications / Reminders

**Integration Points:**

- **Web Push API** — Browser notifications (requires HTTPS + service worker)
- **Backend Scheduler** — Cron job to send notifications at match -24h and train departure -90min
- **ICS Integration** — Parse existing ICS for calendar dates/times
- **Subscription Model** — Store user push subscriptions (endpoint + keys)
- **Notification Payload** — Match details + deep link to itinerary

**Architectural Changes:**

```text
Current: No background processes, one-way request-response
New: Backend maintains notification schedule, service worker receives messages
```

**Requirements:**

- Service worker manifest in frontend
- Backend notification service (Firebase Cloud Messaging or Notification API)
- Subscription storage (user ID + push endpoint)
- Scheduled job runner (Node.js Cron, Bull, or Temporal)

**Breaking Changes:** Requires HTTPS in production; opt-in user registration flow.

---

### Feature 4: Live Itinerary Updates

**Integration Points:**

- **Webhook Receiver** — Backend listens to fixture API + National Rail webhooks
- **Real-time Connection** — WebSocket or SSE from backend to frontend
- **Update Payload** — Changes detected (kick-off time, train cancellation) + flagged in UI
- **Change Detection** — Diff itinerary against previous state
- **Persistence** — Store update history in database

**Architectural Changes:**

```text
Current: Static itinerary after generation (no updates)
New: Itinerary becomes "live" after sharing; receives push updates
```

**Requirements:**

- WebSocket server or SSE endpoint
- Fixture API integration (e.g., Sportmonks, ESPN API for match times)
- National Rail Enquiries or Trainline webhook integration
- Change log database
- Real-time update UI (toast/badge)

**Breaking Changes:** Requires persistent user-itinerary association; updates only while page open.

---

## Backend Architecture Proposal

### Minimal Implementation (MVP)

```directory
Frontend (Preact SPA)
    ↓ (HTTP/REST + WebSocket)
Backend Server (Node.js/Deno)
    ├── API Routes (Express/Hono)
    │   ├── GET /api/costs/transport
    │   ├── POST /api/shares (generate group link)
    │   ├── GET /api/shares/{id} (fetch shared itinerary)
    │   └── POST /api/notifications/subscribe
    │
    ├── Real-Time (WebSocket)
    │   └── /ws/{groupId} (live updates)
    │
    ├── Scheduled Jobs (Node Cron / Bull)
    │   ├── Check fixture APIs
    │   ├── Check National Rail status
    │   └── Send due-date reminders
    │
    └── Database (PostgreSQL / Firestore)
        ├── group_itineraries (share storage)
        ├── push_subscriptions (notification endpoints)
        └── update_log (change history)

External APIs (Third-Party)
    ├── Trainline / National Rail (pricing + schedule)
    ├── Sportmonks / ESPN (match fixtures)
    ├── Firebase Cloud Messaging or Notification Service
    └── Web Push Protocol (push notifications)
```

### Tech Stack Recommendation

- **Language:** Node.js (TypeScript) — matches frontend stack
- **Framework:** Express or Hono (lightweight, existing ecosystem)
- **Database:** PostgreSQL (persistent) + Redis (caching, session)
- **Real-Time:** Socket.io or native WebSocket + ws library
- **Scheduling:** Bull (Redis-backed queue) or node-cron
- **Notifications:** Firebase Cloud Messaging or Web Push API

---

## Frontend Integration Points

### Components Requiring Changes

| Component                  | Change                         | Complexity |
| -------------------------- | ------------------------------ | ---------- |
| `CostBreakdownSection.tsx` | Fetch live prices on render    | Low        |
| `Navigation/Routing`       | Add shared itinerary route     | Low        |
| `App.tsx` (Root)           | Instantiate WebSocket on mount | Medium     |
| `Footer.tsx`               | Add "Share Link" button        | Low        |
| `ItineraryRenderer.tsx`    | Add live-update badges         | Low        |
| `service-worker.ts` (new)  | Register push handler          | Medium     |

### New Frontend Files Needed

- `src/hooks/useRealTimeUpdates.ts` — WebSocket connection + listener
- `src/components/shared-itinerary-view.tsx` — Read-only itinerary for group links
- `src/pages/shared-itinerary-page.tsx` — Route handler for public share URLs
- `public/service-worker.js` — Push notification handler
- `src/utils/shareLink.ts` — Encoding/decoding share tokens

---

## Data Model Extensions

### New Backend Models

```typescript
// Group Share
interface GroupShare {
  id: string; // Short token or UUID
  itinerary: ItineraryResponse; // Full itinerary object
  createdBy: string; // Anonymous user UUID
  createdAt: Date;
  expiresAt?: Date; // Optional expiry
  viewCount: number;
}

// Push Subscription
interface PushSubscription {
  userId: string;
  endpoint: string; // Push service endpoint
  auth: string; // Auth key
  p256dh: string; // Encryption key
  subscribedAt: Date;
  itineraryId?: string; // Optional link to itinerary
}

// Live Update
interface ItineraryUpdate {
  itineraryId: string;
  type: "match_rescheduled" | "train_cancelled" | "price_changed";
  previousValue: any;
  newValue: any;
  detectedAt: Date;
  notifiedAt?: Date;
}
```

---

## Dependency & Priority Analysis

### Blocking Order

1. **Feature 2 (Group Invite Links)** — Foundation for sharing; unblocked
2. **Feature 1 (Real-Time Pricing)** — Requires backend API; no hard dependencies
3. **Feature 3 (Notifications)** — Requires backend + UI; depends on Feature 2 (share links)
4. **Feature 4 (Live Updates)** — Most complex; requires WebSocket + external API integrations

### Parallel Development Path

- Backend infrastructure (server setup, DB) — Can start immediately
- Feature 1 (pricing API) — Start after backend scaffolding
- Feature 2 (share links) — Can start in parallel with Feature 1
- Features 3 & 4 — After 1 & 2 stabilized

---

## Risk Assessment

| Risk                                                                     | Severity | Mitigation                                                        |
| ------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------- |
| **Rate Limiting** — External APIs (Trainline, fixtures) rate-limit calls | Medium   | Backend caching layer with 5-10 min TTL                           |
| **Webhook Complexity** — Managing external webhooks + retry logic        | High     | Use managed service (Svix, Inngest) for webhook delivery          |
| **Browser Push Support** — Not all users enable notifications            | Low      | Graceful degradation; toast fallback                              |
| **Shared Link Expiry** — Managing cleanup of old shares                  | Low      | TTL-based deletion or lazy cleanup                                |
| **Real-time Scaling** — WebSocket connections scale poorly               | Medium   | Use Redis adapter (Socket.io scaling) for multi-server deployment |
| **CORS/HTTPS** — Notifications require HTTPS + proper CORS headers       | Medium   | Standard practice; documented in deployment                       |

---

## Implementation Timeline Estimate

| Feature                   | Backend  | Frontend | Testing  | Total          |
| ------------------------- | -------- | -------- | -------- | -------------- |
| **1: Real-Time Pricing**  | 2-3 days | 1-2 days | 1 day    | 4-6 days       |
| **2: Group Invites**      | 2-3 days | 1 day    | 1 day    | 4-5 days       |
| **3: Push Notifications** | 3-4 days | 2 days   | 1-2 days | 6-8 days       |
| **4: Live Updates**       | 4-5 days | 2-3 days | 2 days   | 8-10 days      |
| **Infrastructure Setup**  | 2-3 days | 0.5 days | —        | 2.5-3.5 days   |
| **Total (Sequential)**    | —        | —        | —        | **25-32 days** |

**Optimized (Parallel):** 15-18 days (infrastructure + Features 1 & 2 in parallel, then 3 & 4)

---

## Rollout Strategy

### Phase 1: MVP (Features 1 & 2)

- **Goal:** Live pricing + share links
- **Timeline:** Weeks 1-2
- **Testing:** Internal + limited beta
- **Deployment:** Feature flags to rollout gradually

### Phase 2: Notifications (Feature 3)

- **Goal:** Reminder push notifications
- **Timeline:** Week 3
- **Testing:** Push service integration tests + manual verification
- **Deployment:** Opt-in for users

### Phase 3: Live Updates (Feature 4)

- **Goal:** Real-time itinerary sync
- **Timeline:** Week 4+
- **Testing:** Load testing with WebSocket connections
- **Deployment:** Only for shared links initially

---

## Conclusion

The frontend architecture is **ready for extension** with minimal changes. The main work is building a **backend service layer** to support stateful operations (pricing caching, share storage, webhook handling, scheduling). No frontend breaking changes required; all features can be adopted gradually with feature flags.

**Recommended next step:** Set up backend scaffolding (Node.js + Express, PostgreSQL, Redis) before Feature implementation begins.
