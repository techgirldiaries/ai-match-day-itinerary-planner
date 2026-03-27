# Feature Specification: Group Invite Links

**Status:** Planned  
**Priority:** High (core sharing feature)  
**Owner:** Full-Stack Team  
**Timeline:** 4-5 days

---

## 1. Overview

Generate shareable URLs for match-day itineraries so group members can instantly access and collaborate on the plan without email. Think: "Share on WhatsApp" → One click → Everyone sees same itinerary.

---

## 2. User Story

**As a** group organizer  
**I want to** share an itinerary with a short, mobile-friendly URL  
**So that** everyone in the group can open it instantly on their phone during WhatsApp conversations

**As a** group member  
**I want to** open a shared itinerary link from my phone  
**So that** I can save it as a draft and access it later without searching through messages

### Acceptance Criteria

- [ ] Share link generated in <1 second
- [ ] Link format: `ltfc.app/j/abc123` (short, memorable)
- [ ] Shared itinerary loads in <3 seconds
- [ ] Mobile fully responsive (optimized for 375px)
- [ ] Read-only view prevents accidental edits
- [ ] "Save as Draft" button persists itinerary locally
- [ ] Link active for 48 hours (default expiry)
- [ ] Viewing doesn't require login or email
- [ ] QR code included for easy sharing (optional enhancement)

---

## 3. Technical Architecture

### 3.1 URL Structure

**Share URL Format:**

```link
https://ltfc.app/j/{share_id}
```

where `share_id` is an 8-12 character base62-encoded token:

- Base62 alphabet: `0-9`, `a-z`, `A-Z` (62 chars)
- Collision probability: ~1 in 1 trillion (for 12 chars)
- URL length: 24 characters (human-friendly, short for QR codes)

**Example:**

```link
https://ltfc.app/j/Kg7mXp2q
https://ltfc.app/j/b3N4Vq9RsT
```

### 3.2 Database Schema

#### Table: `group_shares`

```sql
CREATE TABLE group_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Share identifier
  share_id VARCHAR(12) UNIQUE NOT NULL,  -- Short URL token

  -- Creator info (anonymous model)
  creator_user_id VARCHAR(36),           -- User UUID from ltfc-anonymous-user-id
  creator_ip_hash VARCHAR(64),           -- Hash of IP for basic abuse detection

  -- Itinerary data
  itinerary_data JSONB NOT NULL,         -- Full ItineraryResponse object
  itinerary_hash VARCHAR(64),            -- SHA256 of itinerary for dedup

  -- Group metadata
  group_size INT,                        -- Expected number of participants
  match_date DATE,                       -- Extracted from itinerary
  match_city VARCHAR(100),               -- Extracted from itinerary

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,         -- Usually created_at + 48 hours

  -- Tracking
  view_count INT DEFAULT 0,
  unique_viewers INT DEFAULT 0,          -- Distinct user IDs that viewed
  is_active BOOLEAN DEFAULT TRUE,        -- Soft delete flag

  -- Optional: Parent share (for itinerary regenerations)
  parent_share_id UUID REFERENCES group_shares(id),

  CONSTRAINT share_id_format CHECK (share_id ~ '^[0-9a-zA-Z]{8,12}$'),
  CONSTRAINT expiry_valid CHECK (expires_at > created_at)
);

-- Indexes for quick lookups
CREATE UNIQUE INDEX idx_share_id_active ON group_shares(share_id)
  WHERE is_active = TRUE;
CREATE INDEX idx_creator_user_id ON group_shares(creator_user_id);
CREATE INDEX idx_expires_at ON group_shares(expires_at)
  WHERE is_active = TRUE;
CREATE INDEX idx_match_date ON group_shares(match_date)
  WHERE is_active = TRUE;

-- Table: Share views (optional, for analytics)
CREATE TABLE group_share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES group_shares(id) ON DELETE CASCADE,
  viewer_user_id VARCHAR(36),            -- User UUID (or NULL for anonymous)
  viewer_ip_hash VARCHAR(64),
  viewed_at TIMESTAMP DEFAULT NOW(),
  device_type VARCHAR(20),               -- 'mobile', 'desktop', 'tablet'
  referrer VARCHAR(255),                 -- Where they came from (WhatsApp, etc.)

  INDEX idx_share_id ON group_share_views(share_id)
);
```

---

### 3.3 Backend API Endpoints

#### Endpoint 1: Create Share

**POST /api/shares**

**Request:**

```json
{
  "itinerary": {
    /* full ItineraryResponse object */
  },
  "group_size": 4,
  "expires_in_hours": 48, // Optional, defaults to 48
  "note": "Match day trip to Manchester" // Optional
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "share": {
    "share_id": "Kg7mXp2q",
    "share_url": "https://ltfc.app/j/Kg7mXp2q",
    "short_url": "ltfc.app/j/Kg7mXp2q",
    "qr_code_url": "https://ltfc.app/api/shares/Kg7mXp2q/qr",
    "created_at": "2026-03-26T14:30:00Z",
    "expires_at": "2026-03-28T14:30:00Z"
  },
  "message": "Share link created. Link expires in 48 hours."
}
```

**Implementation Details:**

- Generate unique `share_id` using base62 encoding of 48-bit random integer
- Validate itinerary object (required fields: match_date, origin, destination)
- Set default expiry to 48 hours from now
- Store in database with creator UUID
- Return shareable URL + QR code endpoint

**Error Responses:**

```json
// 400 Bad Request
{
  "success": false,
  "error": "invalid_itinerary",
  "message": "Itinerary missing required fields: match_date"
}

// 409 Conflict (duplicate itinerary)
{
  "success": false,
  "error": "duplicate_share",
  "message": "This itinerary was already shared. Use existing link.",
  "existing_share_id": "Kg7mXp2q"
}

// 429 Too Many Requests
{
  "success": false,
  "error": "rate_limit_exceeded",
  "message": "Max 10 shares per hour per user"
}
```

---

#### Endpoint 2: Fetch Shared Itinerary

**GET /api/shares/{share_id}**

**Response (200 OK):**

```json
{
  "success": true,
  "share": {
    "share_id": "Kg7mXp2q",
    "itinerary": {
      /* full ItineraryResponse */
    },
    "metadata": {
      "created_at": "2026-03-26T14:30:00Z",
      "expires_at": "2026-03-28T14:30:00Z",
      "time_until_expiry_hours": 42,
      "view_count": 5,
      "group_size": 4,
      "match_city": "Manchester",
      "match_date": "2026-04-15"
    }
  }
}
```

**Error Responses:**

```json
// 404 Not Found (share doesn't exist)
{
  "success": false,
  "error": "share_not_found",
  "message": "This share link does not exist or has been deleted."
}

// 410 Gone (share expired)
{
  "success": false,
  "error": "share_expired",
  "message": "This share link expired on 2026-03-28."
}

// 403 Forbidden (share deactivated)
{
  "success": false,
  "error": "share_inactive",
  "message": "This share has been removed by the creator."
}
```

**Implementation Details:**

- Extract and validate `share_id` from URL
- Query database for active share
- Check expiry: if `expires_at < NOW()` → mark inactive + return 410
- Increment view count (atomic)
- Track viewer in `group_share_views` table
- Return full itinerary + metadata

---

#### Endpoint 3: Delete Share (Creator Only)

**DELETE /api/shares/{share_id}**

**Request:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Share deleted. Link is no longer active."
}
```

**Error Response:**

```json
// 403 Forbidden (not creator)
{
  "success": false,
  "error": "not_authorized",
  "message": "Only the creator can delete this share."
}
```

**Implementation Details:**

- Validate user_id matches creator_user_id
- Soft delete: set `is_active = FALSE` + `updated_at = NOW()`
- Don't cascade delete view records (keep analytics)
- Subsequent fetches return 403

---

#### Endpoint 4: Generate QR Code

**GET /api/shares/{share_id}/qr**

**Response:** PNG image (200x200px)

**Implementation:**

- Use `qrcode` npm library
- Encode share URL: `https://ltfc.app/j/{share_id}`
- Cache QR code in memory or Redis for 24 hours
- Return as image/png with 1-hour cache headers

---

### 3.4 Cleanup Job

**Background Job: Delete Expired Shares**

Run daily at 2 AM UTC:

```typescript
async function cleanupExpiredShares() {
  const result = await db.query(`
    UPDATE group_shares
    SET is_active = FALSE
    WHERE expires_at < NOW()
    AND is_active = TRUE
    RETURNING id, share_id;
  `);

  console.log(`Cleaned up ${result.rowCount} expired shares`);

  // Optional: Hard delete shares older than 30 days
  await db.query(`
    DELETE FROM group_shares
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND is_active = FALSE;
  `);
}
```

---

## 4. Frontend Implementation

### 4.1 Routing & Page Structure

**URL Routing (in [src/components/app.tsx](src/components/app.tsx)):**

```typescript
// Determine current page from URL
const route = location.pathname;

if (route === '/') {
  // Home
} else if (route.match(/^\/j\/([a-zA-Z0-9]{8,12})$/)) {
  // Shared itinerary view
  const shareId = route.match(/^\/j\/([a-zA-Z0-9]{8,12})$/)[1];
  currentPage.value = 'shared-itinerary';
  return <SharedItineraryPage shareId={shareId} />;
} else if (route === '/drafts') {
  // Drafts page
  ...
}
```

### 4.2 New Component: Share Modal

**File: [src/components/share-itinerary-modal.tsx](src/components/share-itinerary-modal.tsx)**

```typescript
export interface ShareItineraryModalProps {
  itinerary: ItineraryResponse;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareItineraryModal = ({ itinerary, isOpen, onClose }: ShareItineraryModalProps) => {
  const [shareUrl, setShareUrl] = createSignal<string | null>(null);
  const [qrCode, setQrCode] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [copied, setCopied] = createSignal(false);

  const generateShare = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary,
          group_size: itinerary.intake?.group_size || 4
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      setShareUrl(data.share.share_url);
      setQrCode(data.share.qr_code_url);
    } catch (err) {
      setError((err as Error).message || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl()) return;

    try {
      await navigator.clipboard.writeText(shareUrl()!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: create text input + select
      const input = document.createElement('input');
      input.value = shareUrl()!;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Itinerary</DialogTitle>
        </DialogHeader>

        {!shareUrl() ? (
          <div class="flex flex-col gap-4">
            <p class="text-sm text-gray-600">
              Create a shareable link to send to your group on WhatsApp or any messaging app.
            </p>
            <button
              onClick={generateShare}
              disabled={loading()}
              class="btn btn-primary gap-2"
            >
              {loading() ? <Spinner /> : null}
              {loading() ? 'Generating...' : 'Create Share Link'}
            </button>
            {error() && <p class="text-red-600 text-sm">{error()}</p>}
          </div>
        ) : (
          <div class="flex flex-col gap-4">
            {/* Share URL */}
            <div class="bg-gray-100 rounded-lg p-4">
              <p class="text-xs text-gray-600 mb-2">Share Link</p>
              <div class="flex gap-2">
                <input
                  readOnly
                  value={shareUrl()!}
                  class="flex-1 px-3 py-2 border rounded text-sm font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  class={`btn ${copied() ? 'btn-success' : 'btn-outline'}`}
                >
                  {copied() ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* QR Code */}
            {qrCode() && (
              <div class="flex flex-col items-center gap-2">
                <p class="text-xs text-gray-600">Scan with Phone</p>
                <img src={qrCode()} alt="QR Code" class="w-40 h-40 border" />
              </div>
            )}

            {/* Actions */}
            <div class="flex gap-2">
              <button
                onClick={() => {
                  const text = `Check out our match-day plan! ${shareUrl()}`;
                  if (navigator.share) {
                    navigator.share({ title: 'Match Day Itinerary', text });
                  } else {
                    copyToClipboard();
                  }
                }}
                class="btn btn-secondary flex-1"
              >
                Share via {navigator.share ? 'System' : 'Copy'}
              </button>
              <button onClick={onClose} class="btn btn-outline flex-1">
                Done
              </button>
            </div>

            {/* Info */}
            <p class="text-xs text-gray-600 text-center">
              Link will expire in 48 hours
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

### 4.3 New Page: Shared Itinerary View

**File: [src/pages/shared-itinerary-page.tsx](src/pages/shared-itinerary-page.tsx)**

```typescript
export interface SharedItineraryPageProps {
  shareId: string;
}

export const SharedItineraryPage = ({ shareId }: SharedItineraryPageProps) => {
  const [itinerary, setItinerary] = createSignal<ItineraryResponse | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [saved, setSaved] = createSignal(false);

  // Fetch shared itinerary on mount
  createEffect(async () => {
    try {
      const response = await fetch(`/api/shares/${shareId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      setItinerary(data.share.itinerary);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  });

  const saveAsDraft = async () => {
    if (!itinerary()) return;

    try {
      // Use existing draft-storage utility
      const draftId = await saveDraft({
        title: `${itinerary()!.match?.team1} vs ${itinerary()!.match?.team2} - Shared`,
        messages: [{ type: 'agent', text: JSON.stringify(itinerary()) }]
      });

      setSaved(true);
      setTimeout(() => {
        // Navigate to drafts page
        window.location.hash = '#/drafts';
      }, 2000);
    } catch (err) {
      setError('Failed to save as draft');
    }
  };

  return (
    <div class="shared-itinerary-page">
      {error() && (
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 class="text-red-900 font-semibold">Cannot Load Itinerary</h3>
          <p class="text-red-800 text-sm">{error()}</p>
          {error().includes('expired') && (
            <p class="text-red-700 text-sm mt-2">
              This link has expired. Ask the creator to generate a new one.
            </p>
          )}
        </div>
      )}

      {loading() && (
        <div class="flex items-center justify-center h-screen">
          <Spinner /> <span class="ml-2">Loading itinerary...</span>
        </div>
      )}

      {itinerary() && (
        <>
          {/* Header */}
          <div class="bg-blue-50 border-b border-blue-200 p-4 mb-4 sticky top-0">
            <h1 class="text-2xl font-bold">Shared Match-Day Plan</h1>
            <p class="text-sm text-gray-600">
              Shared by group organizer • {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Itinerary Content (Read-Only) */}
          <ItineraryRenderer itinerary={itinerary()!} isReadOnly={true} />

          {/* Save as Draft Button */}
          <div class="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <button
              onClick={saveAsDraft}
              disabled={saved()}
              class="btn btn-primary flex-1"
            >
              {saved() ? '✓ Saved as Draft' : 'Save as My Draft'}
            </button>
            <button
              onClick={() => window.history.back()}
              class="btn btn-outline"
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

### 4.4 Add Share Button to Itinerary

**Update: [src/components/footer.tsx](src/components/footer.tsx)**

```typescript
export const Footer = ({ itinerary, onRefresh }) => {
  const [shareModalOpen, setShareModalOpen] = createSignal(false);

  return (
    <footer class="footer">
      <div class="flex gap-2">
        {itinerary && (
          <>
            <button
              onClick={() => setShareModalOpen(true)}
              class="btn btn-primary gap-2 flex-1"
            >
              <Share2 size={18} />
              Share with Group
            </button>
            {/* ... email export, etc. */}
          </>
        )}
      </div>

      <ShareItineraryModal
        itinerary={itinerary}
        isOpen={shareModalOpen()}
        onClose={() => setShareModalOpen(false)}
      />
    </footer>
  );
};
```

---

## 5. Security & Privacy Considerations

### 5.1 Access Control

- **Public shares:** No authentication required (anyone with link can view)
- **Creator delete:** Only creator (verified by user_id) can delete
- **No edit:** Shared itineraries are read-only (no modifications allowed)

### 5.2 Abuse Prevention

- **Rate limiting:** Max 10 shares per user per hour
- **IP-based tracking:** Hash IP to detect bulk share creation abuse
- **Content validation:** Validate itinerary before storing (no malicious data)
- **Expiry:** Default 48-hour expiry auto-cleans old shares

### 5.3 Privacy

- **Anonymous model:** Don't store IP addresses (only hashed for abuse detection)
- **Viewer privacy:** Optional tracking; don't reveal viewer list to creator
- **No emails:** Shares don't require or store email addresses

---

## 6. TypeScript Types

Add to [src/types.ts](src/types.ts):

```typescript
export interface GroupShare {
  share_id: string;
  share_url: string;
  itinerary: ItineraryResponse;
  metadata: {
    created_at: string;
    expires_at: string;
    view_count: number;
    group_size: number;
    match_city: string;
    match_date: string;
  };
}

export interface CreateShareRequest {
  itinerary: ItineraryResponse;
  group_size?: number;
  expires_in_hours?: number;
  note?: string;
}

export interface CreateShareResponse {
  success: boolean;
  share: {
    share_id: string;
    share_url: string;
    short_url: string;
    qr_code_url: string;
    created_at: string;
    expires_at: string;
  };
  message: string;
}

export interface FetchShareResponse {
  success: boolean;
  share: GroupShare;
}
```

---

## 7. Deployment & Monitoring

### Database Migrations

```bash
# Run migrations before deployment
npm run db:migrate

# Rollback if needed
npm run db:rollback
```

### Monitoring Metrics

- Share creation rate: `#/minute`
- Share view rate: `#/day`
- Average shares per user
- Most shared match destinations
- Expiry cleanup job success rate

### Alerts

- Share creation API latency > 2 secs → Investigate
- QR code generation failure > 1% of requests
- Database growth: `group_shares` table > 10GB (plan archival)

---

## 8. Rollout Strategy

1. **Phase 1:** Deploy backend API (feature flag OFF)
2. **Phase 2:** Deploy frontend UI (feature flag OFF)
3. **Phase 3:** Enable for internal team only (10% of traffic)
4. **Phase 4:** Gradual rollout: 25% → 50% → 100%
5. **Phase 5:** Monitor for 1 week, then remove feature flag

### Rollout Checklist

- [ ] Database migrations applied
- [ ] Backend API tested (integration + load tests)
- [ ] Frontend component tested (mobile + desktop)
- [ ] QR code generation verified
- [ ] Cleanup job scheduled
- [ ] Monitoring dashboards created
- [ ] Rollback plan documented

---

## 9. Success Criteria

- [ ] Share links created within 1 second
- [ ] Shared itineraries load within 3 seconds
- [ ] > 40% of generated itineraries are shared
- [ ] Average shares per user: 2.5
- [ ] QR code scan success rate > 95%
- [ ] Save as draft conversion: > 60% of viewers
- [ ] Zero security incidents (unpermitted access)
- [ ] User satisfaction (via survey): > 4.5/5
