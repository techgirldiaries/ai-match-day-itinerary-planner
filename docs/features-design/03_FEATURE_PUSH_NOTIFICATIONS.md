# Feature Specification: Push Notifications & Reminders

**Status:** Planned  
**Priority:** High (engagement booster)  
**Owner:** Full-Stack Team (Backend primary)  
**Timeline:** 6-8 days

---

## 1. Overview

Send browser push notifications to group members with time-sensitive reminders:

- **24 hours before match:** "Your match is tomorrow — here's your plan"
- **90 minutes before train departure:** "Your train departs in 90 mins!"

Leverages existing ICS calendar infrastructure to schedule notifications precisely.

---

## 2. User Story

**As a** group member  
**I want to** receive push notifications reminding me about the trip  
**So that** I don't forget travel times and can leave on schedule

**As a** trip organizer  
**I want to** keep my group engaged with timely reminders  
**So that** everyone shows up on time and the trip runs smoothly

### Acceptance Criteria

- [ ] User can opt-in to notifications via browser prompt
- [ ] 24hr before match: Notification sent automatically
- [ ] 90 mins before train: Notification sent automatically
- [ ] Notification displays match details + itinerary link
- [ ] Clicking notification opens itinerary in browser
- [ ] Notifications work on Chrome, Firefox, Safari, Edge
- [ ] Works on mobile (iOS Safari, Android Chrome)
- [ ] User can opt-out at any time
- [ ] Failed subscriptions don't crash the app
- [ ] No notifications sent after link has expired

---

## 3. Architecture Overview

### 3.1 System Components

```plaintext
┌─────────────────────────────────────────────────────┐
│ Frontend (Browser)                                   │
│ ┌────────────────────────────────────────────────┐  │
│ │ Service Worker (service-worker.js)             │  │
│ │ - Receives push messages                        │  │
│ │ - Displays notifications                        │  │
│ │ - Handles notification clicks                   │  │
│ └────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────┐  │
│ │ App Component                                   │  │
│ │ - Permission request UI                         │  │
│ │ - Subscribe/unsubscribe logic                   │  │
│ │ - Display notifications settings                │  │
│ └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
         ↕ (HTTPS, Web Push API)
┌─────────────────────────────────────────────────────┐
│ Backend (Node.js)                                    │
│ ┌────────────────────────────────────────────────┐  │
│ │ API Routes                                      │  │
│ │ - POST /api/notifications/subscribe            │  │
│ │ - POST /api/notifications/unsubscribe          │  │
│ │ - GET  /api/notifications/settings             │  │
│ └────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────┐  │
│ │ Notification Scheduler (Cron Jobs)             │  │
│ │ - Query upcoming matches/trains                │  │
│ │ - Send push notifications at scheduled times   │  │
│ │ - Retry failed sends                           │  │
│ └────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────┐  │
│ │ Push Service Integration                        │  │
│ │ - web-push library (Web Push Protocol)          │  │
│ │ - Send to Push Service (e.g., GCM, APNS)       │  │
│ └────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────┐  │
│ │ Database                                        │  │
│ │ - push_subscriptions table                      │  │
│ │ - notification_log table (optional)             │  │
│ └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
         ↕ (Web Push Protocol)
┌─────────────────────────────────────────────────────┐
│ Push Services (Third-Party)                          │
│ - Google Cloud Messaging (GCM)                       │
│ - Apple Push Notification service (APNs)            │
│ - Firefox Cloud Push Service                        │
└─────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

1. **User lands on app:**
   - App detects if notifications permission is requested
   - Show optional prompt: "Enable reminders for your trip?"

2. **User grants permission:**
   - Browser calls `Notification.requestPermission()` → returns "granted"
   - App calls `serviceWorkerRegistration.pushManager.subscribe()`
   - Browser generates unique push subscription object

3. **App sends subscription to backend:**
   - `POST /api/notifications/subscribe` with PushSubscription object
   - Backend stores in `push_subscriptions` table

4. **Backend scheduler runs (every 10 mins):**
   - Query `group_shares` for matches/trains in next 24-90 mins
   - Query `push_subscriptions` linked to those shares
   - Generate notification payload
   - Send via Web Push Protocol to each subscription

5. **Push service receives notification:**
   - Stores notification in delivery queue
   - Routes to device's browser/OS

6. **Device receives notification:**
   - Service worker's `push` event fires
   - Displays notification via `showNotification()`

7. **User clicks notification:**
   - `notificationclick` event fires
   - Service worker opens browser window to itinerary

---

## 4. Backend Implementation

### 4.1 Database Schema

#### Table: push_subscriptions

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification (anonymous model)
  user_id VARCHAR(36) NOT NULL,

  -- Share identification (optional link to itinerary)
  share_id UUID REFERENCES group_shares(id) ON DELETE CASCADE,

  -- Web Push subscription object (RFC 8291)
  subscription_endpoint TEXT NOT NULL,  -- Push service endpoint
  subscription_auth VARCHAR(255) NOT NULL,     -- HMAC auth secret (base64)
  subscription_p256dh VARCHAR(255) NOT NULL,   -- ECDH public key (base64)

  -- Metadata
  device_type VARCHAR(20),  -- 'desktop', 'mobile', 'tablet'
  browser_type VARCHAR(50), -- 'chrome', 'firefox', 'safari', 'edge'

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_success_at TIMESTAMP,            -- Last successful notification send
  consecutive_failures INT DEFAULT 0,   -- For marking dead subscriptions

  -- Preferences
  prefer_match_reminders BOOLEAN DEFAULT TRUE,
  prefer_train_alerts BOOLEAN DEFAULT TRUE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,  -- E.g., "22:00"
  quiet_hours_end TIME,    -- E.g., "08:00"

  CONSTRAINT endpoint_unique UNIQUE (subscription_endpoint, user_id),
  CONSTRAINT valid_device CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  CONSTRAINT consecutive_failures_valid CHECK (consecutive_failures >= 0)
);

CREATE INDEX idx_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_share_id ON push_subscriptions(share_id);
CREATE INDEX idx_active ON push_subscriptions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_device_browser ON push_subscriptions(device_type, browser_type);
```

#### Table: notification_log (Optional, for analytics)

```sql
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  subscription_id UUID NOT NULL REFERENCES push_subscriptions(id),
  share_id UUID REFERENCES group_shares(id),

  -- Notification content
  notification_type VARCHAR(50), -- 'match_reminder', 'train_alert'
  title VARCHAR(255),
  body VARCHAR(500),

  -- Delivery tracking
  queued_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP,

  -- Result
  status VARCHAR(20), -- 'queued', 'sent', 'delivered', 'failed'
  failure_reason VARCHAR(255),

  -- Retry tracking
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,

  CONSTRAINT status_check CHECK (status IN ('queued', 'sent', 'delivered', 'failed'))
);

CREATE INDEX idx_share_id_type ON notification_log(share_id, notification_type);
CREATE INDEX idx_sent_at ON notification_log(sent_at);
CREATE INDEX idx_status ON notification_log(status);
```

---

### 4.2 Backend API Endpoints

#### Endpoint 1: Subscribe to Notifications

**POST /api/notifications/subscribe**

**Request:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "share_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479", // Optional
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "auth": "jPIWfW3a...==",
      "p256dh": "BC...=="
    }
  },
  "device_info": {
    "device_type": "mobile",
    "browser_type": "chrome",
    "user_agent": "Mozilla/5.0 ..."
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "subscription": {
    "id": "sub_abc123xyz",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "active",
    "created_at": "2026-03-26T14:30:00Z",
    "reminder_preferences": {
      "match_reminders": true,
      "train_alerts": true,
      "quiet_hours_enabled": false
    }
  },
  "message": "Notifications enabled. You'll receive reminders for your trips."
}
```

**Error Responses:**

```json
// 400 Bad Request (invalid subscription object)
{
  "success": false,
  "error": "invalid_subscription",
  "message": "Subscription object missing required keys: endpoint, keys"
}

// 409 Conflict (duplicate subscription)
{
  "success": false,
  "error": "already_subscribed",
  "message": "Device is already subscribed for notifications"
}
```

**Implementation Details:**

- Validate Web Push subscription object format
- Check for duplicate subscriptions (same endpoint + user_id)
- Parse user agent to detect device/browser
- Store in database
- If share_id provided, link to specific itinerary

---

#### Endpoint 2: Unsubscribe

**POST /api/notifications/unsubscribe**

**Request:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "subscription_id": "sub_abc123xyz" // OR
  // "subscription_endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Notifications disabled for this device."
}
```

**Implementation Details:**

- Match by subscription_id OR endpoint
- Set is_active = FALSE (soft delete for analytics)
- Don't cascade delete (keep notification log)

---

#### Endpoint 3: Get Notification Preferences

**GET /api/notifications/settings?user_id={user_id}**

**Response (200 OK):**

```json
{
  "subscriptions": [
    {
      "id": "sub_abc123",
      "device_type": "mobile",
      "browser_type": "chrome",
      "is_active": true,
      "created_at": "2026-03-26T14:30:00Z",
      "last_success_at": "2026-03-26T14:45:00Z",
      "preferences": {
        "match_reminders": true,
        "train_alerts": true,
        "quiet_hours_enabled": true,
        "quiet_hours_start": "22:00",
        "quiet_hours_end": "08:00"
      }
    }
  ]
}
```

---

### 4.3 Notification Scheduler

#### Job 1: Match Reminder (Runs daily at 10 PM UTC)

```typescript
// Background job: Send match reminders 24 hours before kickoff

async function sendMatchReminders() {
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  // Find all shares with match tomorrow
  const sharesWithMatchTomorrow = await db.query(
    `
    SELECT id, share_id, itinerary_data, creator_user_id
    FROM group_shares
    WHERE match_date = $1::DATE
    AND is_active = TRUE
    AND created_at < NOW() - INTERVAL '1 hour'  -- Avoid duplicates
  `,
    [tomorrowStart],
  );

  for (const share of sharesWithMatchTomorrow.rows) {
    // Get subscriptions for this share
    const subscriptions = await db.query(
      `
      SELECT ps.* FROM push_subscriptions ps
      WHERE ps.share_id = $1
      AND ps.is_active = TRUE
      AND ps.prefer_match_reminders = TRUE
      AND NOT (
        ps.quiet_hours_enabled AND
        CURRENT_TIME >= ps.quiet_hours_start AND
        CURRENT_TIME < ps.quiet_hours_end
      )
    `,
      [share.id],
    );

    const itinerary = JSON.parse(share.itinerary_data);
    const payload = {
      title: `⚽ Your match is tomorrow!`,
      body: `${itinerary.match.team1} vs ${itinerary.match.team2} at ${itinerary.match.kickoff_time}`,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: `match-${share.share_id}`,
      data: {
        share_id: share.share_id,
        type: "match_reminder",
        url: `https://ltfc.app/j/${share.share_id}`,
      },
      requireInteraction: true, // Keep notification until user dismisses
    };

    for (const sub of subscriptions.rows) {
      try {
        await sendNotification(sub, payload);

        // Log success
        await db.query(
          `
          INSERT INTO notification_log (subscription_id, share_id, notification_type, title, body, status, sent_at)
          VALUES ($1, $2, $3, $4, $5, 'sent', NOW())
        `,
          [sub.id, share.id, "match_reminder", payload.title, payload.body],
        );

        // Update last success and reset failure count
        await db.query(
          `
          UPDATE push_subscriptions
          SET last_success_at = NOW(), consecutive_failures = 0
          WHERE id = $1
        `,
          [sub.id],
        );
      } catch (error) {
        console.error(`Failed to send notification to ${sub.id}`, error);

        // Handle 410 Gone (subscription expired)
        if (error.statusCode === 410) {
          await db.query(
            `
            UPDATE push_subscriptions SET is_active = FALSE WHERE id = $1
          `,
            [sub.id],
          );
        } else {
          // Increment failure counter
          await db.query(
            `
            UPDATE push_subscriptions
            SET consecutive_failures = consecutive_failures + 1
            WHERE id = $1
          `,
            [sub.id],
          );

          // If > 5 failures, mark inactive
          if (error.retryCount >= 5) {
            await db.query(
              `
              UPDATE push_subscriptions SET is_active = FALSE WHERE id = $1
            `,
              [sub.id],
            );
          }
        }

        // Log failure
        await db.query(
          `
          INSERT INTO notification_log (subscription_id, share_id, notification_type, status, failure_reason)
          VALUES ($1, $2, $3, 'failed', $4)
        `,
          [sub.id, share.id, "match_reminder", error.message],
        );
      }
    }
  }

  console.log(`Sent ${sharesWithMatchTomorrow.rowCount} match reminders`);
}

// Schedule with node-cron
schedule("0 22 * * *", sendMatchReminders); // 10 PM UTC every day
```

#### Job 2: Train Departure Alert (Runs every 10 minutes)

```typescript
// Background job: Send train alerts 90 minutes before departure

async function sendTrainAlerts() {
  const now = new Date();
  const in90mins = new Date(now.getTime() + 90 * 60 * 1000);
  const in110mins = new Date(now.getTime() + 110 * 60 * 1000);

  // Find all shares with trains departing in next 90-110 minutes
  const sharesWithTrains = await db.query(`
    SELECT 
      gs.id, gs.share_id, gs.itinerary_data,
      json_array_elements(gs.itinerary_data -> 'transport' -> 'trains') as train
    FROM group_shares gs
    WHERE gs.is_active = TRUE
    AND gs.itinerary_data -> 'transport' ->> 'train_status' != 'cancelled'
  `);

  for (const row of sharesWithTrains.rows) {
    const train = row.train;
    const departureTime = parseTime(train.departure_time);

    if (departureTime >= in90mins && departureTime <= in110mins) {
      // Get subscriptions
      const subscriptions = await db.query(
        `
        SELECT ps.* FROM push_subscriptions ps
        WHERE ps.share_id = $1
        AND ps.is_active = TRUE
        AND ps.prefer_train_alerts = TRUE
        AND NOT (ps.quiet_hours_enabled AND CURRENT_TIME >= ps.quiet_hours_start AND CURRENT_TIME < ps.quiet_hours_end)
      `,
        [row.share_id],
      );

      const payload = {
        title: `🚂 Train departs in 90 minutes!`,
        body: `${train.operator} • ${train.route} • Platform ${train.platform || "?"}`,
        tag: `train-${row.share_id}-${train.departure_time}`,
        data: {
          share_id: row.share_id,
          type: "train_alert",
          url: `https://ltfc.app/j/${row.share_id}#transport`,
        },
        requireInteraction: true,
      };

      for (const sub of subscriptions.rows) {
        try {
          await sendNotification(sub, payload);
          // ... same logging as above ...
        } catch (error) {
          // ... same error handling ...
        }
      }
    }
  }
}

// Schedule with node-cron
schedule("*/10 * * * *", sendTrainAlerts); // Every 10 minutes
```

---

### 4.4 Notification Service

**File: `services/notificationService.ts`**

```typescript
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!, // mailto:admin@ltfc.app
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

interface PushSubscription {
  id: string;
  subscription_endpoint: string;
  subscription_auth: string;
  subscription_p256dh: string;
  consecutive_failures: number;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  requireInteraction?: boolean;
}

export async function sendNotification(
  subscription: PushSubscription,
  payload: NotificationPayload,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Don't retry if already failed 5+ times
    if (subscription.consecutive_failures >= 5) {
      return { success: false, error: "Max failures exceeded" };
    }

    const pushSubscription = {
      endpoint: subscription.subscription_endpoint,
      keys: {
        auth: subscription.subscription_auth,
        p256dh: subscription.subscription_p256dh,
      },
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    return { success: true };
  } catch (error) {
    if (error.statusCode === 410) {
      // Subscription no longer valid
      throw new ErrorWithCode("Gone", 410);
    }

    // Retry on transient errors
    if (error.statusCode >= 500 || error.statusCode === 429) {
      throw new ErrorWithCode(error.message, error.statusCode, true);
    }

    throw error;
  }
}

class ErrorWithCode extends Error {
  statusCode: number;
  isRetryable: boolean;

  constructor(message: string, statusCode: number, isRetryable = false) {
    super(message);
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
  }
}
```

---

## 5. Frontend Implementation

### 5.1 Service Worker

**File: [public/service-worker.js](public/service-worker.js)**

```javascript
// Service Worker for handling push notifications

const CACHE_NAME = "ltfc-cache-v1";
const ICON_URL = "/icon-192x192.png";

// Install event
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Installing...");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activating...");
  event.waitUntil(clients.claim());
});

// Push event - receive notification from backend
self.addEventListener("push", (event) => {
  console.log("[ServiceWorker] Push received:", event);

  if (!event.data) {
    // Silent push (no data)
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch {
    notificationData = {
      title: "Match Day Itinerary",
      body: event.data.text(),
    };
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || ICON_URL,
    badge: notificationData.badge || "/badge-72x72.png",
    tag: notificationData.tag || "notification",
    data: notificationData.data || {},
    requireInteraction: notificationData.requireInteraction || false,
    actions: [
      { action: "open", title: "View Itinerary" },
      { action: "close", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options),
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[ServiceWorker] Notification clicked:", event);
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const url = event.notification.data.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }

        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});

// Notification close event
self.addEventListener("notificationclose", (event) => {
  console.log("[ServiceWorker] Notification closed:", event);
  // Optional: track dismissal analytics
});
```

---

### 5.2 Request Permission Hook

**File: [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts)**

```typescript
import { createSignal, createEffect, onCleanup } from "preact/signals";

export interface NotificationStatus {
  permission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
  subscriptionId?: string;
}

export const useNotifications = () => {
  const [status, setStatus] = createSignal<NotificationStatus>({
    permission: "denied",
    isSupported: false,
    isSubscribed: false,
  });

  // Check browser support on mount
  createEffect(() => {
    const isSupported = "serviceWorker" in navigator && "PushManager" in window;
    const permission = (Notification as any)?.permission || "denied";

    setStatus((prev) => ({
      ...prev,
      isSupported,
      permission: permission as NotificationPermission,
    }));

    if (isSupported && permission === "granted") {
      checkSubscription();
    }
  });

  const checkSubscription = async () => {
    if (!status().isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      setStatus((prev) => ({
        ...prev,
        isSubscribed: !!subscription,
        subscriptionId: subscription?.endpoint.split("/").pop(),
      }));
    } catch (error) {
      console.error("Failed to check subscription:", error);
    }
  };

  const requestPermission = async () => {
    if (!status().isSupported) {
      console.warn("Notifications not supported");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setStatus((prev) => ({ ...prev, permission }));

      if (permission === "granted") {
        await subscribeToPushNotifications();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Permission request failed:", error);
      return false;
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(
          process.env.VITE_VAPID_PUBLIC_KEY!,
        ),
      });

      // Send subscription to backend
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: getUserId(), // From localStorage
          subscription: subscription.toJSON(),
          device_info: {
            device_type: getDeviceType(),
            browser_type: getBrowserType(),
            user_agent: navigator.userAgent,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      const data = await response.json();
      setStatus((prev) => ({
        ...prev,
        isSubscribed: true,
        subscriptionId: data.subscription.id,
      }));

      return true;
    } catch (error) {
      console.error("Failed to subscribe to push:", error);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Notify backend
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: getUserId(),
            subscription_endpoint: subscription.endpoint,
          }),
        });

        // Unsubscribe locally
        await subscription.unsubscribe();

        setStatus((prev) => ({ ...prev, isSubscribed: false }));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      return false;
    }
  };

  return {
    status: status(),
    requestPermission,
    subscribeToPushNotifications,
    unsubscribe,
    checkSubscription,
  };
};

// Helper functions
function base64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(b64);
  return new Uint8Array(rawData.split("").map((x) => x.charCodeAt(0)));
}

function getUserId(): string {
  return localStorage.getItem("ltfc-anonymous-user-id") || "";
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/mobile|android/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}

function getBrowserType(): string {
  const ua = navigator.userAgent;
  if (/edg/i.test(ua)) return "edge";
  if (/chrome|chromium|crios/i.test(ua)) return "chrome";
  if (/firefox/i.test(ua)) return "firefox";
  if (/safari/i.test(ua)) return "safari";
  return "unknown";
}
```

---

### 5.3 Notification Prompt UI

**File: [src/components/notification-prompt.tsx](src/components/notification-prompt.tsx)**

```typescript
import { createSignal, Show } from 'preact/signals';
import { useNotifications } from '~hooks/useNotifications';

export const NotificationPrompt = () => {
  const { status, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = createSignal(false);
  const [isRequesting, setIsRequesting] = createSignal(false);

  const handleEnable = async () => {
    setIsRequesting(true);
    await requestPermission();
    setIsRequesting(false);
    setDismissed(true);
  };

  return (
    <Show when={
      !dismissed() &&
      status().isSupported &&
      status().permission === 'default' &&
      !status().isSubscribed
    }>
      <div class="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Get Match Day Reminders</h3>
            <p class="text-sm text-gray-600 mt-1">
              We'll remind you 24 hours before your match and when your train departs.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div class="flex gap-2 mt-4">
          <button
            onClick={handleEnable}
            disabled={isRequesting()}
            class="btn btn-primary flex-1 gap-2"
          >
            {isRequesting() ? <Spinner size="sm" /> : null}
            {isRequesting() ? 'Enabling...' : 'Enable Reminders'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            class="btn btn-outline"
          >
            Not now
          </button>
        </div>
      </div>
    </Show>
  );
};
```

---

### 5.4 Notification Settings Component

**File: [src/components/notification-settings.tsx](src/components/notification-settings.tsx)**

```typescript
import { createSignal, createEffect } from 'preact/signals';

export const NotificationSettings = () => {
  const [subscriptions, setSubscriptions] = createSignal([]);
  const [loading, setLoading] = createSignal(true);

  createEffect(async () => {
    const userId = localStorage.getItem('ltfc-anonymous-user-id');
    const response = await fetch(`/api/notifications/settings?user_id=${userId}`);
    const data = await response.json();
    setSubscriptions(data.subscriptions);
    setLoading(false);
  });

  const handleUnsubscribe = async (subscriptionId: string) => {
    const userId = localStorage.getItem('ltfc-anonymous-user-id');
    await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, subscription_id: subscriptionId })
    });
    setSubscriptions(prev => prev.filter(s => s.id !== subscriptionId));
  };

  return (
    <div class="notification-settings">
      <h2 class="text-xl font-bold mb-4">Notification Settings</h2>

      {loading() ? (
        <p>Loading...</p>
      ) : subscriptions().length === 0 ? (
        <p class="text-gray-600">No active notification subscriptions.</p>
      ) : (
        <div class="space-y-4">
          {subscriptions().map(sub => (
            <div key={sub.id} class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold">
                  {sub.device_type === 'mobile' ? '📱' : '🖥️'} {sub.browser_type}
                </h3>
                <button
                  onClick={() => handleUnsubscribe(sub.id)}
                  class="btn btn-sm btn-danger"
                >
                  Disable
                </button>
              </div>

              <div class="space-y-2 text-sm">
                <label class="flex items-center gap-2">
                  <input type="checkbox" checked={sub.preferences.match_reminders} disabled />
                  Match day reminders (24 hours before)
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" checked={sub.preferences.train_alerts} disabled />
                  Train departure alerts (90 minutes before)
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" checked={sub.preferences.quiet_hours_enabled} disabled />
                  Quiet hours: {sub.preferences.quiet_hours_start} - {sub.preferences.quiet_hours_end}
                </label>
              </div>

              <p class="text-xs text-gray-500 mt-3">
                Subscribed: {new Date(sub.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 6. VAPID Keys Setup

### Generate VAPID Keys (One-time)

```bash
# Using web-push CLI
npx web-push generate-vapid-keys

# Output:
# Public Key: BCxxxxxx...
# Private Key: yyyyyy...

# Store in .env:
VAPID_PUBLIC_KEY=BCxxxxxx...
VAPID_PRIVATE_KEY=yyyyyy...
VAPID_SUBJECT=mailto:admin@ltfc.app
```

---

## 7. Deployment Checklist

- [ ] HTTPS enabled (required for service workers)
- [ ] Service worker file served with correct headers (Cache-Control: no-cache)
- [ ] VAPID keys generated and stored securely
- [ ] Database tables created and indexed
- [ ] Notification scheduler running
- [ ] Monitoring dashboards created (delivery rate, failures)
- [ ] Retry logic tested for failed sends
- [ ] Browser compatibility tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile notifications tested (iOS, Android)
- [ ] Quiet hours filtering working
- [ ] Dead subscription cleanup working

---

## 8. Monitoring & Alerting

### Key Metrics

- Subscription success rate (target: >95%)
- Notification delivery rate (target: >90%)
- Mean time to deliver (target: <30 secs)
- Average failure per subscription (target: <5%)
- Dead subscriptions cleaned (daily)

### Alerts

- Delivery rate < 80% → Investigate API issues
- Scheduler job failure → Page alert
- DB table growth > 100K rows → Archive old logs

---

## 9. Success Criteria

- [ ] 25%+ opt-in rate for notifications
- [ ] 90%+ successful delivery rate
- [ ] <5% user complaints (wrong time, duplicate notifications)
- [ ] 60%+ click-through rate (users open itinerary)
- [ ] Zero delivery failures during peak match times
- [ ] Works on Chrome, Firefox, Safari (Desktop + Mobile)
