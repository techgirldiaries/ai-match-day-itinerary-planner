# Technical Implementation Plan: 4 Features

## Overview

This document breaks down each feature into actionable tasks, identifies dependencies, and provides complexity estimates for engineering execution.

---

## Feature 1: Real-Time Train/Coach Pricing

### Objective

Replace estimated transport costs in the itinerary with live pricing fetched from Trainline/National Rail API on demand.

### Architecture Diagram

```flowchart
User Submits Itinerary
    ↓
Agent generates estimate (backend: Relevance AI)
    ↓
Frontend fetches live prices for route+date+time
    ↓
Merge live data into cost breakdown
    ↓
Display to user with "Last updated X minutes ago"
```

---

### Backend Tasks

#### Task 1.1: Set Up Transport API Proxy

- **Description:** Create backend endpoint to fetch/cache live transport prices
- **Deliverable:** `GET /api/costs/transport?origin=London&destination=Manchester&date=2026-04-15&transport_types=train,coach&passengers=4`
- **Implementation:**
  - Research and select API (Trainline SDK, National Rail Enquiries, Skyscanner)
  - Create API client wrapper with error handling
  - Implement caching layer (Redis 5-10 min TTL)
  - Handle rate limiting (implement exponential backoff)
  - Return standardized response: `{ transport_type, operator, price, eta, availability }`
- **Complexity:** Medium (3-4 days)
- **Dependencies:** Backend server setup (Node.js), Redis cache configured
- **Output:**

  ```json
  {
    "train": [
      {
        "operator": "Avanti",
        "price_gbp": 45.5,
        "departure": "14:30",
        "arrival": "17:15",
        "transfers": 0
      },
      {
        "operator": "TransPennine",
        "price_gbp": 38.0,
        "departure": "15:00",
        "arrival": "18:00",
        "transfers": 1
      }
    ],
    "coach": [
      {
        "operator": "National Express",
        "price_gbp": 15.0,
        "departure": "13:00",
        "arrival": "18:30",
        "transfers": 0
      }
    ],
    "last_updated": "2026-03-26T14:23:00Z",
    "cache_expires": "2026-03-26T14:33:00Z"
  }
  ```

#### Task 1.2: Implement Price Caching & Invalidation

- **Description:** Cache live prices with intelligent invalidation
- **Deliverable:** Redis-backed cache with automatic expiration
- **Implementation:**
  - Store prices keyed by `{origin}:{destination}:{date}:{transport_type}`
  - Set 5-min TTL for peak times (8am-9am, 5pm-6pm), 10-min for off-peak
  - Implement cache invalidation on operator schedule updates (webhook listener optional)
  - Add metrics: cache hit rate, API call count, average latency
- **Complexity:** Low (1-2 days)
- **Dependencies:** Redis instance, monitoring dashboard

---

### Frontend Tasks

#### Task 1.3: Update Cost Breakdown Component

- **Description:** Fetch live prices and display in `CostBreakdownSection.tsx`
- **Deliverable:** Modified itinerary rendering with live costs
- **Implementation:**
  - Add `useEffect` hook to fetch prices when agent response arrives
  - Parse agent-generated transport section for route + date
  - Call `GET /api/costs/transport` with extracted params
  - Merge live prices with agent estimate (show both if significant difference)
  - Add loading state spinner during fetch
  - Display "Last updated 2 minutes ago" timestamp
  - Handle errors: Show estimate with warning badge if API fails
- **Complexity:** Low (1-2 days)
- **Dependencies:** API endpoint ready, TypeScript types defined
- **Changes to [CostBreakdownSection.tsx](src/components/itinerary-renderer/CostBreakdownSection.tsx):**

  ```typescript
  // Before: Display static agent-estimated costs
  // After: Fetch live costs + merge with estimate

  const [livePrices, setLivePrices] = useState(null);
  const [pricesFetchedAt, setPricesFetchedAt] = useState(null);

  useEffect(() => {
    if (transportDetails) {
      fetchLivePrices(transportDetails).then((data) => {
        setLivePrices(data);
        setPricesFetchedAt(new Date());
      });
    }
  }, [transportDetails]);
  ```

#### Task 1.4: Add Refresh Button

- **Description:** Allow user to manually refresh prices
- **Deliverable:** Button in footer or cost breakdown section
- **Implementation:**
  - Add "Refresh Prices" button in `CostBreakdownSection`
  - Show loading spinner during fetch
  - Display toast confirmation: "Prices updated"
  - Disable refresh for 30 secs to prevent spam
- **Complexity:** Low (0.5 days)
- **Dependencies:** Task 1.3 complete

#### Task 1.5: TypeScript Types for Pricing

- **Description:** Define types for transport pricing responses
- **Deliverable:** Types in [types.ts](src/types.ts)
- **Implementation:**

  ```typescript
  interface TransportPrice {
    operator: string;
    transportType: "train" | "coach" | "bus" | "carpool";
    price_gbp: number;
    departure: string; // ISO 8601 time
    arrival: string;
    duration_minutes: number;
    transfers: number;
    url?: string; // Direct booking link
  }

  interface LivePricesResponse {
    train: TransportPrice[];
    coach: TransportPrice[];
    bus?: TransportPrice[];
    last_updated: string;
    cache_expires: string;
  }
  ```

- **Complexity:** Low (0.5 days)

### Testing Strategy

- **Unit:** API client error handling, cache hit/miss scenarios
- **Integration:** Frontend mock API calls, error recovery
- **E2E:** Generate itinerary → verify live prices display

### Rollout Plan

1. Deploy backend API with caching (internal testing)
2. Feature flag `showLivePrices` in frontend
3. Gradual rollout: 10% → 50% → 100% of users
4. Monitor API latency and error rates

---

## Feature 2: Group Invite Links

### Purpose

Generate shareable URLs so multiple users can access the same itinerary without email. Link is mobile-friendly and works instantly.

### Architecture Diagram

```flowchart
User generates itinerary
    ↓
Clicks "Share with Group" → Creates group link
    ↓
Backend stores itinerary + group metadata
    ↓
Generate short URL (e.g., ltfc.app/j/abc123)
    ↓
Desktop/mobile user opens link → Views shared itinerary (read-only)
    ↓
Optional: User can save as draft
```

---

### Backend Tasks

#### Task 2.1: Set Up Group Share Storage

- **Description:** Database schema for storing group itineraries
- **Deliverable:** PostgreSQL tables + migrations
- **Implementation:**
  - Create `group_shares` table:

    ```sql
    CREATE TABLE group_shares (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      share_id VARCHAR(12) UNIQUE NOT NULL,  -- Short URL token
      creator_user_id VARCHAR(36),           -- Anonymous user ID
      itinerary_data JSONB NOT NULL,         -- Full itinerary JSON
      group_size INT,                        -- Expected participants
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP,                  -- Optional expiry (48h default)
      view_count INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE
    );

    INDEX ON share_id;
    INDEX ON creator_user_id;
    INDEX ON expires_at WHERE is_active = TRUE;
    ```

  - Add migration script for setup

- **Complexity:** Low (1 day)
- **Dependencies:** PostgreSQL running, migration tool (Knex/TypeORM)

#### Task 2.2: Implement Share Creation Endpoint

- **Description:** Create endpoint to store itinerary and generate share link
- **Deliverable:** `POST /api/shares`
- **Implementation:**
  - Accept request body: `{ itinerary, group_size?, expiresIn? }`
  - Validate itinerary structure
  - Generate 8-12 character short token (base62 encoding)
  - Store in database with expiry (default 48 hours)
  - Return: `{ share_url: "ltfc.app/j/abc123", expires_at, share_id }`
  - Handle duplicates: retry token generation if collision
- **Complexity:** Low (1.5 days)
- **Output:**

  ```json
  {
    "share_url": "https://ltfc.app/j/abc123xyz",
    "share_id": "abc123xyz",
    "expires_at": "2026-03-28T14:30:00Z",
    "short_url": "ltfc.app/j/abc123xyz"
  }
  ```

#### Task 2.3: Implement Share Fetch Endpoint

- **Description:** Retrieve shared itinerary by share ID
- **Deliverable:** `GET /api/shares/{share_id}`
- **Implementation:**
  - Validate share ID format
  - Check if share is expired → 410 Gone
  - Check if is_active → 403 Forbidden if inactive
  - Increment view_count
  - Return full itinerary + metadata
  - Handle permissions: any user can view (public share)
- **Complexity:** Low (0.5 days)
- **Output:**

  ```json
  {
    "share_id": "abc123xyz",
    "itinerary": {
      /* full itinerary object */
    },
    "created_at": "2026-03-26T14:30:00Z",
    "expires_at": "2026-03-28T14:30:00Z",
    "view_count": 5,
    "creator_anonymous": true
  }
  ```

#### Task 2.4: Implement Share Deletion Endpoint

- **Description:** Allow creator (by user ID) to delete share
- **Deliverable:** `DELETE /api/shares/{share_id}` (optional, MVP may skip)
- **Complexity:** Low (0.5 days)

#### Task 2.5: Add Cleanup Job

- **Description:** Auto-delete expired shares (background job)
- **Deliverable:** Daily cron job to clean up expired shares
- **Implementation:**
  - Run daily at 2 AM UTC
  - Delete records where `expires_at < NOW()`
  - Log cleanup stats
- **Complexity:** Low (0.5 days)
- **Dependencies:** Cron setup (node-cron or Bull)

---

### Frontend Tasks

#### Task 2.6: Add "Share Link" Button

- **Description:** Button in itinerary to generate share link
- **Deliverable:** UI button + share modal in itinerary renderer
- **Implementation:**
  - Add button in `ItineraryRenderer.tsx` or footer
  - On click: Show modal with copy-to-clipboard button
  - Call `POST /api/shares` with current itinerary
  - Display loading state during API call
  - Show "Link copied!" toast after copy
  - Include QR code for mobile (optional enhancement)
- **Complexity:** Low (1.5 days)
- **Changes:**

  ```typescript
  // New file: src/components/share-itinerary-modal.tsx
  export const ShareItineraryModal = ({ itinerary, onClose }) => {
    const [shareUrl, setShareUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateShareLink = async () => {
      setLoading(true);
      const res = await fetch('/api/shares', {
        method: 'POST',
        body: JSON.stringify({ itinerary })
      });
      const data = await res.json();
      setShareUrl(data.share_url);
      setLoading(false);
    };

    return (
      <Modal>
        <h2>Share with Your Group</h2>
        {!shareUrl ? (
          <button onClick={generateShareLink}>Generate Link</button>
        ) : (
          <>
            <input readOnly value={shareUrl} />
            <button onClick={() => copyToClipboard(shareUrl)}>Copy</button>
          </>
        )}
      </Modal>
    );
  };
  ```

#### Task 2.7: Add Shared Itinerary View Route

- **Description:** New route `/{share_id}` for viewing shared itineraries
- **Deliverable:** New page component + routing
- **Implementation:**
  - Create [src/pages/shared-itinerary-page.tsx](src/pages/shared-itinerary-page.tsx)
  - Extract `share_id` from URL params
  - On mount: `GET /api/shares/{share_id}`
  - Display itinerary in read-only mode (no edit/follow-up)
  - Show "Shared by X at Y time" header
  - Add "Save as Draft" button for receiver
  - Handle errors: 404, 410 (expired), network errors
- **Complexity:** Medium (2 days)
- **Routing in [app.tsx](src/components/app.tsx):**

  ```typescript
  const shareMatch = route.match(/^\/j\/([a-z0-9]+)$/i);
  if (shareMatch) {
    currentPage.value = `shared-itinerary-${shareMatch[1]}`;
    return <SharedItineraryPage shareId={shareMatch[1]} />;
  }
  ```

#### Task 2.8: Add "Save as My Draft" Button

- **Description:** Shared itinerary viewers can import to their drafts
- **Deliverable:** Button + import logic
- **Implementation:**
  - Button in shared itinerary view: "Save as Draft"
  - Prompt for custom title
  - Call existing `saveDraft()` from [draft-storage.ts](src/draft-storage.ts)
  - Show success toast + redirect to drafts
- **Complexity:** Low (1 day)
- **Dependencies:** [draft-storage.ts](src/draft-storage.ts) already handles persistence

#### Task 2.9: Update Navigation

- **Description:** Add "Share Link" option to footer or header menu
- **Deliverable:** UI menu option
- **Implementation:**
  - Add "Share with Group" button in footer next to "Email Export"
  - Conditionally show only when itinerary is generated
- **Complexity:** Low (0.5 days)

### Testing Strategy

- **Unit:** Share ID generation (no collisions), token encoding/decoding
- **Integration:** Create share → fetch → verify data integrity
- **E2E:** User 1 creates share → User 2 opens link → imports as draft
- **Security:** Test expired links, invalid IDs, XSS in share payload

### Rollout Plan

1. Deploy backend share endpoints (feature flag off)
2. Add frontend UI with feature flag
3. Early access to internal team
4. Gradual rollout: 25% → 75% → 100%

---

## Feature 3: Push Notifications / Reminders

### Objective

Send browser push notifications to users with reminders 24 hours before match and 90 minutes before train departure.

### Architecture Diagram

```flowchart
User enables notifications → Stores push subscription in backend
    ↓
Backend scheduler checks daily for upcoming matches (Runs at 10 PM UTC)
    ↓
For each upcoming match (match_date tomorrow):
    → Send push: "Your match is tomorrow! Here's your plan"
    ↓
On match day, scheduler checks for train departures
    ↓
For each train in next 90 mins:
    → Send push: "Your train departs in 90 mins!"
    ↓
Service worker receives push → Displays notification
    ↓
Click notification → Opens itinerary in browser
```

---

### Backend Tasks

#### Task 3.1: Set Up Push Subscription Storage

- **Description:** Database schema for push subscription management
- **Deliverable:** PostgreSQL `push_subscriptions` table + migrations
- **Implementation:**

  ```sql
  CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,         -- Anonymous user by UUID
    subscription_endpoint TEXT NOT NULL,   -- Push service endpoint
    subscription_auth TEXT NOT NULL,       -- Auth key (base64)
    subscription_p256dh TEXT NOT NULL,     -- ECDH key (base64)
    itinerary_id UUID,                     -- Link to shared itinerary
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    browser_type VARCHAR(50),              -- Chrome, Firefox, Safari
    UNIQUE(user_id, subscription_endpoint)
  );

  INDEX ON user_id;
  INDEX ON itinerary_id;
  INDEX ON is_active WHERE created_at > NOW() - INTERVAL '7 days';
  ```

- **Complexity:** Low (1 day)
- **Dependencies:** PostgreSQL

#### Task 3.2: Implement Subscription Endpoint

- **Description:** Save push subscriptions from frontend
- **Deliverable:** `POST /api/notifications/subscribe`
- **Implementation:**
  - Accept: `{ user_id, subscription: { endpoint, keys: { auth, p256dh } }, itinerary_id? }`
  - Validate subscription object format (Web Push API spec)
  - Store in database with hash to avoid duplicates
  - Return: `{ subscription_id, status: "subscribed" }`
  - Handle errors: invalid format → 400, DB errors → 500
- **Complexity:** Low (1.5 days)
- **Output:**

  ```json
  {
    "subscription_id": "sub_abc123",
    "status": "subscribed",
    "expires_in_days": 30
  }
  ```

#### Task 3.3: Implement Unsubscribe Endpoint

- **Description:** Allow users to disable notifications
- **Deliverable:** `POST /api/notifications/unsubscribe` or `DELETE /api/notifications/{subscription_id}`
- **Complexity:** Low (0.5 days)

#### Task 3.4: Set Up Notification Scheduler

- **Description:** Background job to check for upcoming matches/trains and send notifications
- **Deliverable:** Scheduled job runner (Bull + Redis or node-cron)
- **Implementation:**
  - Job 1: "Match Reminder" (runs nightly at 10 PM UTC)
    - Query database for itineraries created today
    - For each: extract match_date from itinerary
    - If match_date == tomorrow → get all users subscribed to that itinerary
    - Send push notification to each subscription endpoint
  - Job 2: "Train Departure Alert" (runs every 10 minutes)
    - Query active itineraries for trains departing in next 90-110 minutes
    - Send push to subscribed users
  - Retry logic: 3 retries with exponential backoff if push fails
  - Logging: Track sent count, failures, error reasons
- **Complexity:** Medium (3-4 days)
- **Dependencies:** Bull/node-cron, push service credentials

#### Task 3.5: Create Notification Service

- **Description:** Abstraction for sending Web Push notifications
- **Deliverable:** `services/notificationService.ts`
- **Implementation:**

  ```typescript
  interface PushSubscription {
    endpoint: string;
    keys: { auth: string; p256dh: string };
  }

  async function sendNotification(
    subscription: PushSubscription,
    payload: { title; body; icon?; tag?; data? },
  ): Promise<{ success: boolean; error?: string }> {
    // Use web-push library to send
    // Handle 410 Gone (subscription expired) → mark inactive in DB
    // Retry on transient errors (429, 5xx)
  }
  ```

- **Complexity:** Low (1.5 days)
- **Dependencies:** `web-push` npm package

#### Task 3.6: Set Up Web Push Credentials

- **Description:** Generate VAPID keys for Web Push API
- **Deliverable:** Environment variables + secrets management
- **Implementation:**
  - Generate VAPID key pair (one-time)
  - Store in `.env`: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
  - Store subject (mailto email) in `.env`: `VAPID_SUBJECT`
  - Document in deployment guide
- **Complexity:** Low (0.5 days)

---

### Frontend Tasks

#### Task 3.7: Create Service Worker

- **Description:** Register service worker to receive and display push notifications
- **Deliverable:** [public/service-worker.js](public/service-worker.js)
- **Implementation:**

  ```javascript
  // public/service-worker.js
  self.addEventListener("push", (event) => {
    const data = event.data.json();
    const notificationOptions = {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/badge-72.png",
      tag: "match-reminder",
      requireInteraction: true, // Don't auto-dismiss
      data: {
        itinerary_id: data.itinerary_id,
        url: data.url || "/",
      },
    };
    event.waitUntil(
      self.registration.showNotification(data.title, notificationOptions),
    );
  });

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Open or focus window to itinerary
        return clients.openWindow(event.notification.data.url);
      }),
    );
  });
  ```

- **Complexity:** Low (1 day)

#### Task 3.8: Request Notification Permission

- **Description:** Prompt user to enable browser notifications
- **Deliverable:** Permission request UI in app
- **Implementation:**
  - On app load: check `Notification.permission` status
  - If "default": show banner "Enable reminders for match notifications"
  - Button: "Enable Notifications"
  - On click: `Notification.requestPermission()` → subscribe if granted
  - Handle dismissal: show once per session
- **Complexity:** Low (1.5 days)
- **File:** New hook [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts)

  ```typescript
  export const useNotifications = () => {
    const [permission, setPermission] = createSignal(
      Notification?.permission || "denied",
    );

    const requestPermission = async () => {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === "granted") {
        await subscribeToPushNotifications();
      }
    };

    const subscribeToPushNotifications = async () => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      });

      // Send subscription to backend
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          subscription: subscription.toJSON(),
        }),
      });
    };

    return { permission, requestPermission };
  };
  ```

#### Task 3.9: Register Service Worker in App

- **Description:** Initialize service worker on app startup
- **Deliverable:** Service worker registration in [index.tsx](src/index.tsx)
- **Implementation:**

  ```typescript
  // In src/index.tsx on app mount
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => console.log("SW registered"))
      .catch((err) => console.error("SW registration failed", err));
  }
  ```

- **Complexity:** Low (0.5 days)

#### Task 3.10: Add Notification Preference UI

- **Description:** Settings page for notification preferences
- **Deliverable:** Settings/preferences modal or page
- **Implementation:**
  - Toggle: "Match day reminders (24 hours before)"
  - Toggle: "Train departure alerts (90 minutes before)"
  - Status: "Notifications enabled" / "Notifications disabled"
  - Button: "Disable Notifications" → calls unsubscribe endpoint
  - Show user email of notification subscription (for debugging)
- **Complexity:** Low (1 day)

### Testing Strategy

- **Unit:** Notification payload formatting, subscription validation
- **Integration:** Subscribe → mock scheduler → verify push sent
- **E2E:** Request permission → confirm service worker receives push → opens page
- **Manual:** Test on Chrome, Firefox, Safari; test on mobile

### Deployment Checklist

- [ ] HTTPS enabled (required for service workers)
- [ ] VAPID keys generated and stored
- [ ] Service worker file served with correct headers
- [ ] Scheduler job running (cron or queue)
- [ ] Database table created and indexed
- [ ] Error handling for "subscription no longer valid" (410 Gone)

### Rollout Plan

1. Deploy backend scheduler (runs daily)
2. Add service worker to frontend (no user visible change yet)
3. Feature flag: `showNotificationPrompt`
4. A/B test: 50% see prompt → measure opt-in rate
5. Full rollout if opt-in > 20%

---

## Feature 4: Live Itinerary Updates

### Objective

Real-time synchronization of itinerary changes when match kick-off times change or trains are cancelled. Updates delivered via WebSocket to all group members viewing the shared link.

### Architecture Diagram

```flowchart
Backend webhook receiver listens to:
  - Fixture API (match schedule changes)
  - National Rail Enquiries (train cancellations/delays)
    ↓
Change detected → Broadcast update via WebSocket
    ↓
Connected clients receive real-time updates
    ↓
Frontend displays change badge: "⚠ Kick-off moved to 3 PM"
    ↓
User can regenerate itinerary or dismiss alert
```

---

### Backend Tasks

#### Task 4.1: Set Up WebSocket Server

- **Description:** Implement real-time connection for live updates
- **Deliverable:** WebSocket endpoint at `/ws`
- **Implementation:**
  - Use Socket.io or native `ws` library
  - Route: `ws://backend.ltfc.app/ws?share_id={id}&user_id={uuid}`
  - Authentication: Validate share_id exists and is active
  - Message types:
    - `connect_itinerary` → Subscribe to itinerary updates
    - `update` → Server broadcasts to all users viewing same itinerary
    - `disconnect` → User leaves
  - Fallback: SSE for browsers without WebSocket support (optional)
- **Complexity:** Medium (2 days)
- **Dependencies:** Socket.io or ws npm package

#### Task 4.2: Implement Fixture API Integration

- **Description:** Subscribe to match fixture updates
- **Deliverable:** Fixture crawler + webhook handler
- **Implementation:**
  - Research API: Sportmonks, ESPN API, Genius Sports, or local football data provider
  - Create API client wrapper
  - Polling strategy: Every 30 mins check for changes in upcoming matches (or webhook if available)
  - For each match change detected (kick-off time, status, teams):
    - Query database for itineraries linked to that match
    - Broadcast update via WebSocket to connected users
  - Fallback: Manual refresh button if user detects outdated info
  - Cache match data to avoid duplicate API calls
- **Complexity:** High (3-4 days)
- **Dependencies:** Fixture API credentials, database of matches

#### Task 4.3: Implement National Rail Integration

- **Description:** Track train schedule changes and cancellations
- **Deliverable:** Train status crawler
- **Implementation:**
  - Integrate with National Rail Enquiries API or Trainline
  - Polling: Every 15 mins for trains departing within next 24 hours
  - For each train found in itinerary:
    - Fetch current status (on-time, delayed, cancelled)
    - Compare to previous state in update_log
    - If changed: broadcast update via WebSocket
  - Payload: `{ type: 'train_cancelled', operator, route, originalTime, newTime? }`
  - Debounce rapid updates (same change twice within 5 mins = 1 broadcast)
- **Complexity:** High (3-4 days)
- **Dependencies:** Train API credentials, caching strategy

#### Task 4.4: Create Update Log Database

- **Description:** Schema for tracking itinerary changes
- **Deliverable:** PostgreSQL table
- **Implementation:**

  ```sql
  CREATE TABLE itinerary_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id UUID NOT NULL,
    update_type VARCHAR(50),        -- 'match_rescheduled', 'train_cancelled', 'price_changed'
    field_changed VARCHAR(100),     -- 'kick_off_time', 'train_status', 'coach_price'
    previous_value JSONB,
    new_value JSONB,
    source VARCHAR(50),              -- 'fixture_api', 'national_rail', 'manual'
    detected_at TIMESTAMP DEFAULT NOW(),
    notified_at TIMESTAMP,
    is_critical BOOLEAN,             -- User needs to know immediately
    FOREIGN KEY (itinerary_id) REFERENCES group_shares(id)
  );

  INDEX ON itinerary_id, detected_at;
  INDEX ON is_critical WHERE notified_at IS NULL;
  ```

- **Complexity:** Low (1 day)

#### Task 4.5: Build Update Broadcasting Service

- **Description:** Logic to detect, format, and broadcast changes
- **Deliverable:** `services/updateBroadcaster.ts`
- **Implementation:**

  ```typescript
  class UpdateBroadcaster {
    async broadcastUpdate(update: ItineraryUpdate) {
      // 1. Store in update_log
      await db.query("INSERT INTO itinerary_updates ...");

      // 2. Notify push subscriptions (if critical)
      if (update.is_critical) {
        await notificationService.sendToItinerary(update.itinerary_id);
      }

      // 3. Broadcast via WebSocket to connected clients
      io.to(`itinerary:${update.itinerary_id}`).emit("update", {
        type: update.type,
        field: update.field_changed,
        newValue: update.new_value,
        timestamp: update.detected_at,
        isCritical: update.is_critical,
      });
    }
  }
  ```

- **Complexity:** Medium (1.5 days)
- **Dependencies:** Database, Socket.io, notification service

#### Task 4.6: Add Webhook Receiver (Optional but Recommended)

- **Description:** Receive real-time webhooks instead of polling (if API supports)
- **Deliverable:** `POST /webhooks/fixture` and `POST /webhooks/national-rail`
- **Implementation:**
  - Verify webhook signature (HMAC or JWT)
  - Parse payload and identify affected itineraries
  - Call UpdateBroadcaster to notify users
  - Handle retries: Accept same webhook ID up to 2x (idempotency)
  - Log all webhooks for debugging
- **Complexity:** Medium (2 days)
- **Dependencies:** Fixture API + National Rail support for webhooks

#### Task 4.7: Set Up Scheduled Polling Jobs

- **Description:** Fallback polling if webhooks unavailable
- **Deliverable:** Cron jobs for fixture + train status checks
- **Implementation:**
  - Job 1: Every 30 mins → Poll fixture API for matches in next 7 days
  - Job 2: Every 15 mins → Poll train status for departures in next 24 hours
  - Implement smart filtering: Only check itineraries active in DB
  - Use differential caching: Compare new data to previous state
  - Log job execution time and errors
- **Complexity:** Medium (2 days)

---

### Frontend Tasks

#### Task 4.8: Add WebSocket Connection Hook

- **Description:** Establish real-time connection to backend
- **Deliverable:** [src/hooks/useLiveUpdates.ts](src/hooks/useLiveUpdates.ts)
- **Implementation:**

  ```typescript
  export const useLiveUpdates = (shareId: string, userId: string) => {
    const [updates, setUpdates] = createSignal<ItineraryUpdate[]>([]);
    const [isConnected, setIsConnected] = createSignal(false);

    createEffect(() => {
      const socket = io(BACKEND_URL, {
        query: { share_id: shareId, user_id: userId },
      });

      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));

      socket.on("update", (data: ItineraryUpdate) => {
        setUpdates((prev) => [data, ...prev]);
      });

      return () => socket.disconnect();
    });

    return { updates, isConnected };
  };
  ```

- **Complexity:** Medium (1.5 days)
- **Dependencies:** Socket.io client library

#### Task 4.9: Update Shared Itinerary View

- **Description:** Display live updates in real-time
- **Deliverable:** Updated [shared-itinerary-page.tsx](src/pages/shared-itinerary-page.tsx)
- **Implementation:**
  - On mount: Connect to WebSocket with share_id
  - Listen for updates
  - For each update:
    - Add badge to affected section: "⚠ UPDATED"
    - Show change description: "Kick-off moved from 2 PM to 3 PM"
    - Highlight changed value in red/orange
    - Option to dismiss or regenerate itinerary
  - Persist updates in session state
- **Complexity:** Medium (2 days)
- **Sample UI:**

  ```typescript
  // In ItineraryRenderer or component
  {updates().map(update => (
    <AlertBadge type={update.type} message={update.message}>
      <p>
        <strong>{update.field}:</strong> {update.previousValue} → {update.newValue}
      </p>
      <button onClick={() => regenerateItinerary()}>
        Regenerate Plan
      </button>
    </AlertBadge>
  ))}
  ```

#### Task 4.10: Add "Regenerate Itinerary" Button

- **Description:** Allow users to regenerate plan after critical updates
- **Deliverable:** Button + flow in shared view
- **Implementation:**
  - Button: "Regenerate with Updated Info"
  - On click: Call Relevance AI agents with same intake data + new constraints
  - Show loading spinner
  - Display new itinerary with highlighted changes
  - Option to save both versions or replace
- **Complexity:** Medium (1 day)
- **Dependencies:** Agent integration already exists

#### Task 4.11: Add Update Notification Toast

- **Description:** Non-blocking alert when update arrives
- **Deliverable:** Toast component + trigger
- **Implementation:**
  - Toast appears in top-right: "⚠ Kick-off time changed to 3 PM"
  - Auto-dismiss after 8 seconds or manual close
  - Action button: "View Details" → scroll to affected section
  - Store last 10 updates for later review
- **Complexity:** Low (0.5 days)

#### Task 4.12: Add Update History Panel

- **Description:** Show all updates received during session
- **Deliverable:** Optional side panel or modal
- **Implementation:**
  - Panel: Timeline of all updates for this itinerary
  - Each entry: timestamp, field changed, old → new value
  - Sort by most recent first
  - Option to regenerate from any point in history
- **Complexity:** Low (1.5 days)

### Testing Strategy

- **Unit:** Update detection logic, diff algorithm
- **Integration:** Mock fixture API → verify update broadcast
- **E2E:** Multiple users open shared link → one client triggers update → both see notification
- **Load:** Simulate 100+ concurrent WebSocket connections
- **Manual:** Verify updates for match reschedule, train cancellation, price change

### Rollout Plan

1. Deploy backend WebSocket + polling jobs (non-production)
2. Internal testing with real APIs
3. Feature flag: `enableLiveUpdates`
4. Beta: 5% of users
5. Monitor WebSocket connection stability + update accuracy
6. Gradual rollout to 100%

---

## Cross-Feature Dependencies & Critical Path

### Dependency Graph

```directory
Backend Infrastructure
├── Node.js + Express
├── PostgreSQL
└── Redis

    ↓ (all features depend on this)

Feature 2 (Share Links) ← Must complete FIRST
    ├── Backend: Group storage + endpoints
    └── Frontend: Share route + save import

    ↓ (Foundation for 3 & 4)

Feature 1 (Real-Time Pricing) ← Independent parallel path
    ├── Backend: Transport API proxy + caching
    └── Frontend: Cost component updates

Feature 3 (Notifications) ← Depends on Feature 2
    ├── Backend: Push subscription + scheduler
    └── Frontend: Service worker + permission prompt

Feature 4 (Live Updates) ← Depends on Feature 2 & 3
    ├── Backend: WebSocket + fixture/rail APIs
    └── Frontend: Live update UI + broadcasting
```

### Critical Path

1. **Week 1:** Backend infrastructure + Feature 2 (share links)
2. **Week 2:** Feature 1 (pricing) + Feature 3 (notifications) in parallel
3. **Week 3:** Feature 4 (live updates) + integration testing
4. **Week 4:** Hardening, monitoring, gradual rollout

### Parallel Work Streams

- **Stream A (Frontend):** Tasks 1.3-1.5, 2.6-2.9 (can start after API contracts defined)
- **Stream B (Backend):** Tasks 1.1-1.2, 2.1-2.5, 3.1-3.6, 4.1-4.7 (can start immediately)
- **Stream C (DevOps):** Database setup, WebSocket infrastructure, monitoring (start immediately)

---

## Effort Summary

| Component                    | Effort                                                             | Dependencies        |
| ---------------------------- | ------------------------------------------------------------------ | ------------------- |
| **Backend Setup**            | 2-3 days                                                           | None                |
| **Feature 1: Pricing**       | 4-6 days                                                           | Backend             |
| **Feature 2: Share Links**   | 4-5 days                                                           | Backend             |
| **Feature 3: Notifications** | 6-8 days                                                           | Backend + Feature 2 |
| **Feature 4: Live Updates**  | 8-10 days                                                          | Backend + Feature 2 |
| **Testing & QA**             | 5-7 days                                                           | All features        |
| **Deployment & Monitoring**  | 2-3 days                                                           | All features        |
| **TOTAL**                    | **31-42 days** (sequential) or **18-22 days** (optimised parallel) |

---

## Success Metrics

### Feature 1: Real-Time Pricing

- ✅ Live prices displayed within 2 secs of itinerary generation
- ✅ Cache hit rate > 80% to reduce API calls
- ✅ Fallback to estimates if API fails (no user-facing errors)

### Feature 2: Share Links

- ✅ Share link generated within 1 sec
- ✅ Shared itinerary loads within 3 secs
- ✅ > 50% of users try sharing (analytics)

### Feature 3: Push Notifications

- ✅ Opt-in rate > 25%
- ✅ Notification delivered within 30 secs of trigger
- ✅ 0 delivery failures for valid subscriptions
- ✅ Click-through rate > 60%

### Feature 4: Live Updates

- ✅ Update received within 2 mins of API detection
- ✅ WebSocket connections stable for 24+ hours
- ✅ False positive update rate < 1%
- ✅ 80% of users see and engage with updates

---

## Risk Mitigation

| Risk                             | Probability     | Impact                        | Mitigation                             |
| -------------------------------- | --------------- | ----------------------------- | -------------------------------------- |
| Fixture API rate limits          | High            | Blocks updates                | Implement caching + queuing            |
| National Rail API unreliable     | Medium          | Missing train alerts          | Fallback to user-manual refresh        |
| WebSocket connections drop       | Medium          | Users miss updates            | Auto-reconnect + SSE fallback          |
| Database scaling                 | Low (MVP phase) | Performance degrades          | Use connection pooling + read replicas |
| Push notification deliverability | Low             | Users don't see notifications | Test on major browsers + devices       |
