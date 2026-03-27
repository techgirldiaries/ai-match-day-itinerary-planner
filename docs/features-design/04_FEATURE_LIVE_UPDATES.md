# Feature Specification: Live Itinerary Updates

**Status:** Planned  
**Priority:** Medium-High (competitive advantage)  
**Owner:** Backend Team (primary) + Full-Stack  
**Timeline:** 8-10 days

---

## 1. Overview

Keep shared itineraries synchronized in real-time. When match kick-off times change or trains are cancelled, all group members viewing the shared link see instant updates with visual alerts. This requires:

1. **Real-time connection** — WebSocket or Server-Sent Events for pushing updates
2. **External API integrations** — Fixture APIs for match changes, National Rail for train cancellations
3. **Change detection** — Compare current state to previous and identify what changed
4. **Smart notifications** — Escalate to push notifications for critical changes

---

## 2. User Story

**As a** group member viewing a shared itinerary  
**I want to** see live updates if the match time or train changes  
**So that** I'm never surprised by schedule changes and can adjust my plans

**As a** trip organizer  
**I want** my group to be instantly notified of any travel disruptions  
**So that** everyone stays on the same page and can react in time

### Acceptance Criteria

- [ ] Match reschedule detected and displayed within 2 minutes
- [ ] Train cancellation shown with ⚠️ badge instantly
- [ ] Updated information persists in itinerary view
- [ ] Toast/banner notification appears with "Update:" prefix
- [ ] User can regenerate itinerary with new info
- [ ] Update history available (last 10 updates)
- [ ] Works on live shared links (not expired)
- [ ] No false positives (confirmed changes only)
- [ ] WebSocket connection stays open for 24+ hours
- [ ] Auto-reconnect on drop with exponential backoff

---

## 3. System Architecture

### 3.1 Component Overview

```plaintext
┌────────────────────────────────────────┐
│ Frontend (Shared Itinerary View)       │
│ ┌──────────────────────────────────┐   │
│ │ WebSocket Connection (Socket.io) │   │
│ ├──────────────────────────────────┤   │
│ │ Connect: /ws?shareId={id}&...    │   │
│ │ Listen for "update" messages     │   │
│ │ Display toast/badge on change    │   │
│ └──────────────────────────────────┘   │
└────────────────────────────────────────┘
         ↕ (Persistent TCP)
┌────────────────────────────────────────┐
│ Backend (Node.js)                       │
│ ┌──────────────────────────────────┐   │
│ │ WebSocket Server (Socket.io)     │   │
│ ├──────────────────────────────────┤   │
│ │ - Room per share_id              │   │
│ │ - Broadcast updates              │   │
│ │ - Track connected clients        │   │
│ └──────────────────────────────────┘   │
│ ┌──────────────────────────────────┐   │
│ │ Change Detection Engine          │   │
│ ├──────────────────────────────────┤   │
│ │ - Poll external APIs (30 min)    │   │
│ │ - Webhook receivers (optional)   │   │
│ │ - Diff itinerary vs previous     │   │
│ │ - Identify critical changes      │   │
│ └──────────────────────────────────┘   │
│ ┌──────────────────────────────────┐   │
│ │ Database                         │   │
│ │ - itinerary_updates table        │   │
│ │ - update_log table               │   │
│ └──────────────────────────────────┘   │
└────────────────────────────────────────┘
    ↓ (HTTP polls)       ↑ (Webhooks)
┌────────────────────────────────────────┐
│ External APIs                            │
│ - Sportmonks (match fixtures)           │
│ - National Rail Enquiries (trains)      │
│ - ESPN (match updates) — optional       │
└────────────────────────────────────────┘
```

---

## 4. Backend Implementation

### 4.1 Database Schema

#### Table: itinerary_updates

```sql
CREATE TABLE itinerary_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  share_id UUID NOT NULL REFERENCES group_shares(id) ON DELETE CASCADE,

  -- Change metadata
  update_type VARCHAR(50) NOT NULL,              -- 'match_rescheduled', 'train_cancelled', 'price_changed'
  field_changed VARCHAR(100),                    -- 'match.kickoff_time', 'transport.train.status'

  -- Previous and new values
  previous_value JSONB,
  new_value JSONB,

  -- Source and timing
  source VARCHAR(50),                             -- 'fixture_api', 'national_rail', 'webhook', 'manual'
  detected_at TIMESTAMP DEFAULT NOW(),
  notified_at TIMESTAMP,

  -- Criticality
  is_critical BOOLEAN DEFAULT FALSE,              -- Requires user action (cancellation > reschedule > price change)
  severity VARCHAR(20),                           -- 'low', 'medium', 'high', 'critical'

  -- Tracking
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_failure_reason VARCHAR(255),

  CONSTRAINT update_type_check CHECK (
    update_type IN ('match_rescheduled', 'train_cancelled', 'train_delayed', 'coach_cancelled', 'price_changed', 'other')
  ),
  CONSTRAINT severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_share_id ON itinerary_updates(share_id, detected_at DESC);
CREATE INDEX idx_critical ON itinerary_updates(is_critical) WHERE is_critical = TRUE;
CREATE INDEX idx_notified ON itinerary_updates(notification_sent) WHERE notification_sent = FALSE;

-- Denormalized for dashboard queries
ALTER TABLE group_shares ADD COLUMN last_update_at TIMESTAMP;
ALTER TABLE group_shares ADD COLUMN last_update_type VARCHAR(50);
ALTER TABLE group_shares ADD COLUMN update_count INT DEFAULT 0;
```

#### Table: update_log (optional, for audit trail)

```sql
CREATE TABLE update_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  update_id UUID NOT NULL REFERENCES itinerary_updates(id) ON DELETE CASCADE,

  -- Tracking
  detected_by_source VARCHAR(50),                 -- Which system detected it
  api_status_code INT,
  api_response_time_ms INT,

  -- Broadcasting
  websocket_clients_notified INT,
  push_notifications_sent INT,
  push_notifications_failed INT,

  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_update_id ON update_log(update_id);
CREATE INDEX idx_logged_at ON update_log(logged_at DESC);
```

---

### 4.2 WebSocket Server (Socket.io)

**File: `services/websocketService.ts`**

```typescript
import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import db from "~db";

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
    transports: ["websocket", "polling"], // Fallback to polling for HTTP
    pingInterval: 25000,
    pingTimeout: 60000,
    maxHttpBufferSize: 1e6, // 1MB max message size
  });

  // Middleware: Authenticate connection
  io.use(async (socket, next) => {
    const shareId = socket.handshake.query.share_id as string;
    const userId = socket.handshake.query.user_id as string;

    if (!shareId || !/^[a-zA-Z0-9]{8,12}$/.test(shareId)) {
      return next(new Error("Invalid share ID"));
    }

    // Verify share exists and is active
    const share = await db.query(
      "SELECT id FROM group_shares WHERE share_id = $1 AND is_active = TRUE",
      [shareId],
    );

    if (share.rows.length === 0) {
      return next(new Error("Share not found or expired"));
    }

    socket.shareId = shareId;
    socket.userId = userId;
    next();
  });

  // Connection handler
  io.on(
    "connection",
    (socket: Socket & { shareId: string; userId: string }) => {
      console.log(
        `[WS] Client connected: ${socket.id} | Share: ${socket.shareId}`,
      );

      // Join room for this share
      socket.join(`itinerary:${socket.shareId}`);

      // Send current state (optional)
      socket.emit("connected", {
        share_id: socket.shareId,
        timestamp: new Date().toISOString(),
        recent_updates: await getRecentUpdates(socket.shareId),
      });

      // Listen for disconnect
      socket.on("disconnect", () => {
        console.log(`[WS] Client disconnected: ${socket.id}`);
      });

      // Heartbeat check
      socket.on("ping", () => {
        socket.emit("pong", { timestamp: Date.now() });
      });
    },
  );

  return io;
}

async function getRecentUpdates(shareId: string): Promise<any[]> {
  const result = await db.query(
    `
    SELECT id, update_type, field_changed, previous_value, new_value, 
           detected_at, severity, is_critical
    FROM itinerary_updates
    WHERE share_id = (
      SELECT id FROM group_shares WHERE share_id = $1
    )
    ORDER BY detected_at DESC
    LIMIT 10
  `,
    [shareId],
  );

  return result.rows;
}

export function broadcastUpdate(io: Server, shareId: string, update: any) {
  io.to(`itinerary:${shareId}`).emit("update", {
    update_id: update.id,
    type: update.update_type,
    field: update.field_changed,
    previousValue: update.previous_value,
    newValue: update.new_value,
    severity: update.severity,
    isCritical: update.is_critical,
    detectedAt: update.detected_at,
    timestamp: new Date().toISOString(),
  });

  console.log(`[WS] Broadcasted update to itinerary:${shareId}`);
}
```

---

### 4.3 Fixture API Integration

**File: `services/fixtureService.ts`**

```typescript
import db from "~db";
import { broadcastUpdate, getIO } from "~websocketService";

interface FixtureUpdate {
  match_id: string;
  match_date: string;
  previous_kickoff: string;
  new_kickoff: string;
  status_change?: "scheduled" | "postponed" | "cancelled";
}

export class FixtureService {
  private apiBaseUrl = process.env.FIXTURE_API_URL;
  private apiKey = process.env.FIXTURE_API_KEY;

  async checkForFixtureUpdates(): Promise<FixtureUpdate[]> {
    console.log("[Fixtures] Checking for updates...");

    // Get all active shares with matches in next 7 days
    const shares = await db.query(`
      SELECT 
        gs.id, gs.share_id,
        (gs.itinerary_data -> 'match' ->> 'match_id') as match_id,
        (gs.itinerary_data -> 'match' ->> 'kickoff_time') as current_kickoff,
        gs.match_date
      FROM group_shares gs
      WHERE gs.is_active = TRUE
      AND gs.match_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      GROUP BY gs.id
    `);

    const updates: FixtureUpdate[] = [];

    for (const share of shares.rows) {
      try {
        // Fetch from Fixture API
        const fixtureData = await this.fetchFixture(share.match_id);

        if (!fixtureData) continue;

        // Compare with stored data
        const changes = this.detectChanges(share, fixtureData);

        if (changes.length > 0) {
          updates.push(...changes);

          // Store in database
          for (const change of changes) {
            await this.logUpdate(share, change);
          }
        }
      } catch (error) {
        console.error(
          `[Fixtures] Error checking match ${share.match_id}:`,
          error,
        );
      }
    }

    return updates;
  }

  private async fetchFixture(matchId: string): Promise<any> {
    const response = await fetch(`${this.apiBaseUrl}/matches/${matchId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) throw new Error(`Fixture API error: ${response.status}`);

    return response.json();
  }

  private detectChanges(storedShare: any, fixtureData: any): any[] {
    const changes = [];

    const storedTime = storedShare.current_kickoff;
    const newTime = fixtureData.kickoff_time;

    if (storedTime !== newTime) {
      changes.push({
        update_type: "match_rescheduled",
        field_changed: "match.kickoff_time",
        previous_value: { time: storedTime },
        new_value: { time: newTime },
        severity: this.calculateSeverity(storedShare, fixtureData),
        is_critical: true,
      });
    }

    if (
      fixtureData.status === "postponed" ||
      fixtureData.status === "cancelled"
    ) {
      changes.push({
        update_type:
          fixtureData.status === "cancelled"
            ? "match_cancelled"
            : "match_postponed",
        field_changed: "match.status",
        previous_value: { status: "scheduled" },
        new_value: { status: fixtureData.status },
        severity: "critical",
        is_critical: true,
      });
    }

    return changes;
  }

  private calculateSeverity(storedShare: any, fixtureData: any): string {
    const now = new Date();
    const matchTime = new Date(
      storedShare.match_date + "T" + fixtureData.kickoff_time,
    );

    const hoursDifference = Math.abs(
      (matchTime.getTime() - now.getTime()) / (1000 * 60 * 60),
    );

    // More critical if closer to match time
    if (hoursDifference < 4) return "critical";
    if (hoursDifference < 12) return "high";
    if (hoursDifference < 24) return "medium";
    return "low";
  }

  private async logUpdate(share: any, change: any): Promise<void> {
    const result = await db.query(
      `
      INSERT INTO itinerary_updates 
      (share_id, update_type, field_changed, previous_value, new_value, severity, is_critical, source)
      VALUES (
        (SELECT id FROM group_shares WHERE share_id = $1),
        $2, $3, $4, $5, $6, $7, 'fixture_api'
      )
      RETURNING *
    `,
      [
        share.share_id,
        change.update_type,
        change.field_changed,
        JSON.stringify(change.previous_value),
        JSON.stringify(change.new_value),
        change.severity,
        change.is_critical,
      ],
    );

    const update = result.rows[0];

    // Broadcast to all listeners
    const io = getIO();
    broadcastUpdate(io, share.share_id, update);

    // Send push notification if critical
    if (update.is_critical) {
      await this.sendCriticalNotification(share.share_id, update);
    }

    // Update denormalized fields
    await db.query(
      `
      UPDATE group_shares
      SET last_update_at = NOW(), last_update_type = $1, update_count = update_count + 1
      WHERE share_id = $2
    `,
      [change.update_type, share.share_id],
    );
  }

  private async sendCriticalNotification(
    shareId: string,
    update: any,
  ): Promise<void> {
    // Send push notifications to subscribers
    const subscriptions = await db.query(
      `
      SELECT ps.* FROM push_subscriptions ps
      WHERE ps.share_id = (SELECT id FROM group_shares WHERE share_id = $1)
      AND ps.is_active = TRUE
    `,
      [shareId],
    );

    for (const sub of subscriptions.rows) {
      // Send push via notification service
      // ... (see push notification service)
    }
  }
}

// Schedule fixture checks every 30 minutes
schedule("*/30 * * * *", async () => {
  const service = new FixtureService();
  await service.checkForFixtureUpdates();
});
```

---

### 4.4 National Rail Integration

**File: `services/trainService.ts`**

```typescript
import db from '~db';
import { broadcastUpdate, getIO } from '~websocketService';

export class TrainService {
  private apiUrl = 'https://api.nationalrail.co.uk';
  private apiKey = process.env.NATIONAL_RAIL_API_KEY;

  async checkForTrainUpdates(): Promise<void> {
    console.log('[Trains] Checking for status updates...');

    // Get all active shares with trains departing in next 24 hours
    const shares = await db.query(`
      SELECT
        gs.id, gs.share_id,
        json_array_elements(gs.itinerary_data -> 'transport' -> 'trains') as train,
        gs.match_date
      FROM group_shares gs
      WHERE gs.is_active = TRUE
      AND gs.itinerary_data -> 'transport' -> 'trains' IS NOT NULL
    `);

    for (const row of shares.rows) {
      const train = row.train;
      const trainKey = `${train.operator}:${train.departure_station}:${train.departure_time}`;

      try {
        const status = await this.fetchTrainStatus(train);

        if (status.hasChanged) {
          await this.logTrainUpdate(row.share_id, train, status);
        }
      } catch (error) {
        console.error(`[Trains] Error checking ${trainKey}:`, error);
      }
    }
  }

  private async fetchTrainStatus(train: any): Promise<any> {
    // Call National Rail API or Trainline API
    const response = await fetch(
      `${this.apiUrl}/service/${train.service_id}`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();

    return {
      current_status: data.status,  // 'on_time', 'delayed', 'cancelled'
      new_arrival?: data.estimated_arrival,
      delay_minutes: data.delay_minutes,
      hasChanged: data.status !== train.status
    };
  }

  private async logTrainUpdate(shareId: string, train: any, status: any): Promise<void> {
    let updateType = 'train_delayed';
    let severity = 'medium';

    if (status.current_status === 'cancelled') {
      updateType = 'train_cancelled';
      severity = 'critical';
    } else if (status.delay_minutes > 30) {
      severity = 'high';
    }

    const result = await db.query(`
      INSERT INTO itinerary_updates
      (share_id, update_type, field_changed, previous_value, new_value, severity, is_critical, source)
      VALUES (
        (SELECT id FROM group_shares WHERE share_id = $1),
        $2, 'transport.train.status', $3, $4, $5, $6, 'national_rail'
      )
      RETURNING *
    `, [
      shareId,
      updateType,
      JSON.stringify({ status: train.status, arrival: train.arrival }),
      JSON.stringify({ status: status.current_status, arrival: status.new_arrival, delay: status.delay_minutes }),
      severity,
      severity === 'critical'
    ]);

    const update = result.rows[0];

    // Broadcast to listeners
    const io = getIO();
    broadcastUpdate(io, shareId, update);

    // Send push for critical updates
    if (update.is_critical) {
      // ... send push notification ...
    }
  }
}

// Schedule train checks every 15 minutes
schedule('*/15 * * * *', async () => {
  const service = new TrainService();
  await service.checkForTrainUpdates();
});
```

---

## 5. Frontend Implementation

### 5.1 WebSocket Hook

**File: [src/hooks/useLiveUpdates.ts](src/hooks/useLiveUpdates.ts)**

```typescript
import { createSignal, createEffect, onCleanup } from "preact/signals";
import { io, Socket } from "socket.io-client";

export interface ItineraryUpdate {
  update_id: string;
  type: string;
  field: string;
  previousValue: any;
  newValue: any;
  severity: "low" | "medium" | "high" | "critical";
  isCritical: boolean;
  detectedAt: string;
  timestamp: string;
}

export const useLiveUpdates = (shareId: string, userId: string) => {
  const [updates, setUpdates] = createSignal<ItineraryUpdate[]>([]);
  const [isConnected, setIsConnected] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [connectionStatus, setConnectionStatus] = createSignal<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  let socket: Socket | null = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;

  createEffect(() => {
    // Connect to WebSocket
    socket = io(process.env.VITE_BACKEND_URL || "http://localhost:3000", {
      query: {
        share_id: shareId,
        user_id: userId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      transports: ["websocket", "polling"],
    });

    // Connection established
    socket.on("connect", () => {
      console.log("[Live Updates] Connected:", socket!.id);
      setConnectionStatus("connected");
      setIsConnected(true);
      setError(null);
      reconnectAttempts = 0;
    });

    // Receive update
    socket.on("update", (data: ItineraryUpdate) => {
      console.log("[Live Updates] Update received:", data);
      setUpdates((prev) => [data, ...prev]);

      // Optional: Show toast notification
      if (data.isCritical) {
        showUpdateNotification(data);
      }
    });

    // Connection lost
    socket.on("disconnect", () => {
      console.log("[Live Updates] Disconnected");
      setConnectionStatus("disconnected");
      setIsConnected(false);
    });

    // Reconnection attempt
    socket.on("connect_error", (error) => {
      console.error("[Live Updates] Connection error:", error);
      reconnectAttempts++;

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        setError("Connection lost. Updates may be delayed.");
        setConnectionStatus("disconnected");
      }
    });

    // Initial connection message
    socket.on("connected", (data) => {
      console.log("[Live Updates] Server connected:", data);
      if (data.recent_updates) {
        setUpdates(data.recent_updates);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  });

  const getUpdateMessage = (update: ItineraryUpdate): string => {
    switch (update.type) {
      case "match_rescheduled":
        return `Match rescheduled to ${update.newValue.time}`;
      case "train_cancelled":
        return `Train cancelled: ${update.field}`;
      case "train_delayed":
        const delay = update.newValue.delay;
        return `Train delayed by ${delay} minutes`;
      case "price_changed":
        return `Price updated: £${update.previousValue.price} → £${update.newValue.price}`;
      default:
        return "Itinerary updated";
    }
  };

  return {
    updates: updates(),
    isConnected: isConnected(),
    connectionStatus: connectionStatus(),
    error: error(),
    getUpdateMessage,
  };
};

function showUpdateNotification(update: ItineraryUpdate) {
  // Play sound (optional)
  const audio = new Audio("/notification.mp3");
  audio.play().catch(() => {}); // Ignore errors

  // Could integrate with toast/notification system
  console.warn("🔔 Update:", update);
}
```

---

### 5.2 Update Display Component

**File: [src/components/live-update-badge.tsx](src/components/live-update-badge.tsx)**

```typescript
import { createSignal } from 'preact/signals';

export interface LiveUpdateBadgeProps {
  update: ItineraryUpdate;
  onDismiss: () => void;
  onRegenerate: () => void;
}

export const LiveUpdateBadge = ({ update, onDismiss, onRegenerate }: LiveUpdateBadgeProps) => {
  const [dismissed, setDismissed] = createSignal(false);

  if (dismissed()) return null;

  const severityColor = {
    low: 'bg-blue-100 border-blue-300 text-blue-900',
    medium: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    high: 'bg-orange-100 border-orange-300 text-orange-900',
    critical: 'bg-red-100 border-red-300 text-red-900'
  }[update.severity];

  const severityIcon = {
    low: 'ℹ️',
    medium: '⚠️',
    high: '🔴',
    critical: '🚨'
  }[update.severity];

  return (
    <div class={`border rounded-lg p-4 mb-4 ${severityColor}`}>
      <div class="flex items-start justify-between gap-3">
        <div class="flex gap-3 flex-1">
          <span class="text-xl">{severityIcon}</span>
          <div class="flex-1">
            <h4 class="font-semibold mb-1">
              {getUpdateTitle(update)}
            </h4>
            <p class="text-sm mb-2">
              <strong>Before:</strong> {formatValue(update.previousValue)} →
              <strong> After:</strong> {formatValue(update.newValue)}
            </p>
            <p class="text-xs opacity-75">
              Updated {formatTime(new Date(update.timestamp))}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss();
          }}
          class="text-xl hover:opacity-70"
        >
          ✕
        </button>
      </div>

      {/* Action buttons for critical updates */}
      {update.isCritical && (
        <div class="flex gap-2 mt-3">
          <button
            onClick={onRegenerate}
            class="btn btn-sm btn-primary"
          >
            Regenerate Plan
          </button>
          <button
            onClick={() => setDismissed(true)}
            class="btn btn-sm btn-outline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

function getUpdateTitle(update: ItineraryUpdate): string {
  const titles = {
    'match_rescheduled': '⏰ Match Time Changed',
    'match_postponed': '📅 Match Postponed',
    'match_cancelled': '❌ Match Cancelled',
    'train_cancelled': '🚄 Train Cancelled',
    'train_delayed': '⏳ Train Delayed',
    'coach_cancelled': '🚌 Coach Cancelled',
    'price_changed': '💷 Price Updated'
  };
  return titles[update.type] || 'Itinerary Updated';
}

function formatValue(value: any): string {
  if (typeof value === 'object') {
    return JSON.stringify(value).slice(0, 50);
  }
  return String(value);
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleDateString();
}
```

---

### 5.3 Update History Panel

**File: [src/components/update-history.tsx](src/components/update-history.tsx)**

```typescript
export interface UpdateHistoryProps {
  updates: ItineraryUpdate[];
  onRegenerate: (update: ItineraryUpdate) => void;
}

export const UpdateHistory = ({ updates, onRegenerate }: UpdateHistoryProps) => {
  return (
    <div class="update-history bg-white rounded-lg border">
      <div class="p-4 border-b">
        <h3 class="font-bold text-lg">Update History</h3>
        <p class="text-sm text-gray-600">Last {updates.length} changes to this itinerary</p>
      </div>

      <div class="divide-y max-h-96 overflow-y-auto">
        {updates.length === 0 ? (
          <p class="p-4 text-gray-500 text-center">No updates yet</p>
        ) : (
          updates.map(update => (
            <div key={update.update_id} class="p-4 hover:bg-gray-50 transition">
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class={`px-2 py-1 rounded text-xs font-semibold
                  ${update.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    update.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'}`}>
                  {update.severity.toUpperCase()}
                </span>
                <span class="text-xs text-gray-500">
                  {formatTime(new Date(update.timestamp))}
                </span>
              </div>

              <h4 class="font-semibold text-sm mb-1">
                {getUpdateTitle(update)}
              </h4>

              <p class="text-sm text-gray-700 mb-2">
                {update.field}: {formatValue(update.previousValue)}
                → {formatValue(update.newValue)}
              </p>

              {update.isCritical && (
                <button
                  onClick={() => onRegenerate(update)}
                  class="text-xs btn btn-outline"
                >
                  Regenerate from this point
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

---

### 5.4 Integration into Shared Itinerary Page

**Update: [src/pages/shared-itinerary-page.tsx](src/pages/shared-itinerary-page.tsx)**

```typescript
import { useLiveUpdates } from '~hooks/useLiveUpdates';
import { LiveUpdateBadge } from '~components/live-update-badge';
import { UpdateHistory } from '~components/update-history';

export const SharedItineraryPage = ({ shareId }: SharedItineraryPageProps) => {
  const [itinerary, setItinerary] = createSignal(null);
  const [showHistory, setShowHistory] = createSignal(false);

  const { updates, isConnected, error, getUpdateMessage } = useLiveUpdates(shareId, getUserId());

  return (
    <div class="shared-itinerary">
      {/* Connection status */}
      {!isConnected() && (
        <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <p class="text-sm text-yellow-900">
            ⚠️ Disconnected from live updates. Reconnecting...
          </p>
        </div>
      )}

      {/* Live updates display */}
      <div class="updates-container">
        {updates().map(update => (
          <LiveUpdateBadge
            key={update.update_id}
            update={update}
            onDismiss={() => {}}
            onRegenerate={async () => {
              // Call Relevance AI to regenerate itinerary
              const newItinerary = await regenerateItinerary(itinerary(), update);
              setItinerary(newItinerary);
            }}
          />
        ))}
      </div>

      {/* Itinerary content */}
      {itinerary() && <ItineraryRenderer itinerary={itinerary()} />}

      {/* Update history button */}
      {updates().length > 0 && (
        <div class="mt-4">
          <button
            onClick={() => setShowHistory(!showHistory())}
            class="btn btn-outline text-sm"
          >
            📋 View {updates().length} updates
          </button>
        </div>
      )}

      {/* Update history panel */}
      {showHistory() && (
        <UpdateHistory
          updates={updates()}
          onRegenerate={async (update) => {
            const newItinerary = await regenerateItinerary(itinerary(), update);
            setItinerary(newItinerary);
            setShowHistory(false);
          }}
        />
      )}
    </div>
  );
};
```

---

## 6. Webhook Integration (Optional but Recommended)

### 6.1 Webhook Receivers

**File: `routes/webhooks.ts`**

```typescript
import express from "express";
import { broadcastUpdate } from "~websocketService";

const router = express.Router();

// Verify webhook signature
function verifyWebhookSignature(req: express.Request, secret: string): boolean {
  const signature = req.headers["x-webhook-signature"] as string;
  if (!signature) return false;

  const body = JSON.stringify(req.body);
  const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");

  return hash === signature;
}

// Webhook: Match update from Sportmonks
router.post("/webhooks/fixtures", (req, res) => {
  if (!verifyWebhookSignature(req, process.env.SPORTMONKS_WEBHOOK_SECRET!)) {
    return res.status(401).send("Unauthorized");
  }

  const event = req.body;

  console.log("[Webhook] Fixture update:", event);

  // Process update immediately (no 30-min polling delay)
  // ... call FixtureService.logUpdate ...

  res.json({ success: true });
});

// Webhook: Train status from National Rail
router.post("/webhooks/trains", (req, res) => {
  if (!verifyWebhookSignature(req, process.env.NATIONAL_RAIL_WEBHOOK_SECRET!)) {
    return res.status(401).send("Unauthorized");
  }

  const event = req.body;

  console.log("[Webhook] Train update:", event);

  // Process update immediately
  // ... call TrainService.logUpdate ...

  res.json({ success: true });
});

export default router;
```

---

## 7. Deployment Checklist

- [ ] WebSocket server running on separate port or path
- [ ] Socket.io Redis adapter configured (for multi-server scaling)
- [ ] Fixture API credentials configured
- [ ] National Rail API credentials configured
- [ ] Scheduled jobs running (30-min fixture, 15-min train checks)
- [ ] Webhook endpoints configured in external services
- [ ] Database indexes created for query performance
- [ ] Monitoring dashboards for update latency
- [ ] Dead connection cleanup (idle >24hrs)
- [ ] Error alerts for API failures
- [ ] SSL/TLS for WebSocket connections

---

## 8. Monitoring & Metrics

### Key Metrics

- **Update latency** — Time from API detection to user notification (target: <2 mins)
- **WebSocket uptime** — Connection stability (target: >99.5%)
- **Update accuracy** — False positive rate (target: <1%)
- **Change detection hits** — % of shares receiving updates (monitor for false alarms)
- **Broadcast speed** — Time to notify all connected clients (target: <200ms)

### Alerts

- Update latency > 5 mins → Investigate scheduler
- WebSocket connection failures > 5% → Check infrastructure
- Fixture API failures > 10% → Page notifiy
- Database growth > 1M rows in `itinerary_updates` → Archive old data

---

## 9. Success Criteria

- [ ] Match reschedules detected within 2 minutes
- [ ] Train cancellations shown immediately
- [ ] 95%+ WebSocket connection stability
- [ ] <1% false positive updates
- [ ] Update broadcast to all clients <500ms
- [ ] 0 crashes/errors from update processing
- [ ] Users can regenerate itineraries from update history
- [ ] 80% engagement with critical updates (click action)
