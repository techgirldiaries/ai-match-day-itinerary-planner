# Feature Specification: Real-Time Train/Coach Pricing

**Status:** Planned  
**Priority:** High (revenue impact)  
**Owner:** Backend Team  
**Timeline:** 4-6 days

---

## 1. Overview

Replace static transport cost estimates in itineraries with live pricing fetched from real transport operators (Trainline, National Rail, National Express). This transforms the cost breakdown section from a "guide" into a **booking and comparison tool**.

---

## 2. User Story

**As a** group organizer planning a match-day trip  
**I want to** see actual transport costs and availability at the time of planning  
**So that** we can book with confidence and budget accurately for the whole group

### Acceptance Criteria

- [ ] Live prices appear in itinerary within 2 seconds of generation
- [ ] Prices include all trains/coaches available for selected route and date
- [ ] If API fails, show estimate with warning badge (no hard error)
- [ ] Prices are cached for 5-10 minutes to avoid rate limits
- [ ] User can manually refresh prices with one click
- [ ] "Last updated X minutes ago" timestamp displayed
- [ ] Mobile responsive (fit on 375px screens)

---

## 3. Technical Requirements

### 3.1 Backend Requirements

#### API Endpoint: GET /api/costs/transport

**Request Parameters:**

```typescript
interface TransportPricingRequest {
  origin: string; // E.g., "London", "LHR", or postcode
  destination: string; // E.g., "Manchester", "MAN"
  date: string; // ISO 8601 date (YYYY-MM-DD)
  transport_types?: string[]; // ['train', 'coach', 'bus'] — defaults to all
  passengers: number; // Group size
  departure_time_window?: {
    // Optional filter for specific time window
    start: string; // HH:MM
    end: string; // HH:MM
  };
  return_journey?: boolean; // false (MVP doesn't support return)
}
```

**Response:**

```json
{
  "success": true,
  "route": {
    "origin": "London Waterloo",
    "destination": "Manchester Piccadilly",
    "date": "2026-04-15",
    "passengers": 4
  },
  "options": {
    "train": [
      {
        "id": "AVT_14302_15120",
        "operator": "Avanti West Coast",
        "departure": "14:30",
        "arrival": "17:15",
        "duration_minutes": 165,
        "transfers": 0,
        "stops": ["Coventry"],
        "price_gbp": {
          "per_person": 45.5,
          "total": 182.0,
          "currency": "GBP"
        },
        "availability": {
          "seats_remaining": 45,
          "status": "available",
          "booking_url": "https://trainline.com/book/..."
        },
        "amenities": ["wifi", "power_sockets", "catering"],
        "alerts": []
      },
      {
        "id": "TPN_15002_18000",
        "operator": "TransPennine Express",
        "departure": "15:00",
        "arrival": "18:00",
        "duration_minutes": 180,
        "transfers": 1,
        "stops": ["Stockport"],
        "price_gbp": {
          "per_person": 38.0,
          "total": 152.0,
          "currency": "GBP"
        },
        "availability": {
          "seats_remaining": 12,
          "status": "limited",
          "booking_url": "https://trainline.com/book/..."
        },
        "amenities": ["wifi"],
        "alerts": ["Only 12 seats left at this price"]
      }
    ],
    "coach": [
      {
        "id": "NX_13001_18300",
        "operator": "National Express",
        "departure": "13:00",
        "arrival": "18:30",
        "duration_minutes": 330,
        "transfers": 0,
        "price_gbp": {
          "per_person": 15.0,
          "total": 60.0,
          "currency": "GBP"
        },
        "availability": {
          "seats_remaining": 8,
          "status": "limited",
          "booking_url": "https://nationalexpress.com/book/..."
        },
        "amenities": ["onboard_wc"],
        "alerts": ["Limited availability"],
        "discount_code": "FOOTBALL20" // Optional: group discounts
      }
    ]
  },
  "metadata": {
    "last_updated": "2026-03-26T14:23:15Z",
    "cache_expires": "2026-03-26T14:33:15Z",
    "cache_ttl_seconds": 600,
    "data_source": "trainline_api",
    "request_id": "req_abc123xyz"
  }
}
```

**Error Response (200 with degraded data):**

```json
{
  "success": false,
  "error": "train_api_timeout",
  "message": "Train prices unavailable. Showing estimates.",
  "options": {
    "train": [
      {
        "is_estimate": true,
        "estimated_price_gbp": 45.0,
        "note": "Live prices unavailable. Refresh in 1 minute."
      }
    ],
    "coach": []
  }
}
```

---

#### 3.2 API Integration Strategy

**Selected providers (MVP):**

1. **Trainline API** — UK rail booking aggregator, covers most operators
2. **National Express** — Coach provider, direct API or web scraping
3. **Stagecoach** — Coach provider (optional Phase 2)

**Trainline Integration:**

- Request personal API credentials
- Rate limit: 100 requests/minute (sufficient for use case)
- Query format: `GET /prices?origin=STP&destination=MAN&outwardDate=2026-04-15&passengers=4`
- Caching: Cache responses by `{origin}:{destination}:{date}:{passengers}` tuple
- TTL: 5 minutes for off-peak, 2-3 minutes during peak hours (8-9am, 5-6pm)

**National Express Integration:**

- Option 1: Use Trainline (includes coaches)
- Option 2: Direct API or web scraping
- Fallback: Pre-loaded static prices by route

**Fallback Strategy:**

- If any API unreachable: return estimate + warning
- If all APIs fail: return agent-generated estimate
- Log failures for monitoring

---

#### 3.3 Caching Architecture

**Redis Keys:**

```plaintext
transport:prices:{origin}:{destination}:{date}→ Cache of all providers
transport:route_metadata:{origin}」→ City/station mappings, distance
transport:operators:{provider}:{updated_date} → Operator info
```

**Cache Warming (Pre-fetch):**

- On user login: Pre-fetch prices for "today" to "today + 14 days"
- Common routes: Prioritize caching for top 20 match fixture destinations
- Scheduled job: Every hour, refresh prices for matches in next 48 hours

**Invalidation:**

- TTL-based: Auto-expire after 5-10 mins
- Event-based: On operator schedule update (if webhooks available)
- Manual: Admin endpoint to clear specific route

---

#### 3.4 Rate Limiting & Cost Control

**Constraints:**

- Trainline: ~€0.01 per API call (estimated)
- Budget: Support ~1000 daily active users = ~50 API calls/day = <€1/day
- Rate limit: Max 100 calls/user/day, max 1000/minute globally

**Implementation:**

- Per-IP rate limit: 10 requests/minute
- Per-user rate limit: 0.1 requests/second (prevent spam refresh)
- Cache hit optimization: Aim for >80% cache hit rate
- Timeout: 5 sec max per API call, fall back to estimate if exceeded

---

### 3.5 Frontend Requirements

#### Component: Enhanced `CostBreakdownSection.tsx`

**Current State:**

```typescript
// Before
<Section title="Transport">
  <p>Train: £45 × 4 people = £180</p>
  <p>Coach: £15 × 4 people = £60</p>
</Section>
```

**New State:**

```typescript
// After: Interactive pricing with options
<Section title="Transport">
  <div class="price-refresh">
    <span>Live Prices • Last updated 2 minutes ago</span>
    <button onClick={refreshPrices} disabled={isRefreshing}>

      {isRefreshing ? <Spinner /> : "Refresh"}
    </button>
  </div>

  <TransportOptions
    trains={livePrices.train}
    coaches={livePrices.coach}
    passengers={4}
    onSelect={handleSelectOption}
  />

  {isDataEstimate && <WarningBadge>Estimated prices (API offline)</WarningBadge>}
</Section>
```

**New Component: `TransportOptions.tsx`**

```typescript
interface TransportOptionsProps {
  trains: TrainOption[];
  coaches: CoachOption[];
  passengers: number;
  onSelect?: (option: TransportOption) => void;
}

export const TransportOptions = ({ trains, coaches, passengers, onSelect }) => {
  return (
    <div class="transport-tabs">
      <Tab label={`Train (${trains.length} options)`}>
        {trains.map(train => (
          <OptionCard
            key={train.id}
            operator={train.operator}
            departure={train.departure}
            arrival={train.arrival}
            duration={train.duration_minutes}
            transfers={train.transfers}
            pricePerPerson={train.price_gbp.per_person}
            total={train.price_gbp.total}
            availability={train.availability}
            amenities={train.amenities}
            onBook={() => window.open(train.availability.booking_url, '_blank')}
            onSelect={() => onSelect?.(train)}
          />
        ))}
      </Tab>

      <Tab label={`Coach (${coaches.length} options)`}>
        {coaches.map(coach => (
          <OptionCard
            key={coach.id}
            operator={coach.operator}

            departure={coach.departure}
            arrival={coach.arrival}
            duration={coach.duration_minutes}
            pricePerPerson={coach.price_gbp.per_person}
            total={coach.price_gbp.total}
            availability={coach.availability}
            onBook={() => window.open(coach.availability.booking_url, '_blank')}
            onSelect={() => onSelect?.(coach)}
          />
        ))}
      </Tab>
    </div>
  );
};
```

**Hook: `useRealTimePrices.ts`**

```typescript
export const useRealTimePrices = (itinerary: ItineraryResponse) => {
  const [prices, setPrices] = createSignal(null);
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [lastUpdated, setLastUpdated] = createSignal<Date | null>(null);

  const fetchPrices = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const res = await fetch("/api/costs/transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: itinerary.departure_city,
          destination: itinerary.match_city,
          date: itinerary.match_date,
          transport_types: ["train", "coach"],
          passengers: itinerary.group_size,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
      }

      setPrices(data.options);
      setLastUpdated(new Date());
    } catch (err) {
      setError("network_error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-fetch on mount
  createEffect(() => {
    if (itinerary) {
      fetchPrices();
    }
  });

  // Manual refresh (debounced to 30 secs)
  let lastRefreshTime = 0;
  const manualRefresh = () => {
    const now = Date.now();
    if (now - lastRefreshTime < 30000) return; // Rate limit
    lastRefreshTime = now;

    fetchPrices();
  };

  return {
    prices: prices(),
    isRefreshing: isRefreshing(),
    error: error(),
    lastUpdated: lastUpdated(),
    refresh: manualRefresh,
  };
};
```

---

#### 3.6 Styling & UX

**Mobile Layout (375px):**

```plaintext
┌─────────────────────┐
│ Transport           │
├─────────────────────┤
│ Live Prices ↻       │ ← Refresh button
├─────────────────────┤
│ ✈ Train   Coach     │ ← Tab navigation
├─────────────────────┤
│ ▓▓▓ 14:30 → 17:15   │ ← Option card (one per line on mobile)
│ Avanti, no changes  │
│ £45/person = £180   │
│ ► Book on Trainline │
└─────────────────────┘
```

**Desktop Layout (1024px):**

- Two-column tab layout (train left, coach right)
- Cards displayed horizontally (3 per row)
- Hover effect: highlight selected option
- Booking button links out to operator website (new tab)

---

### 3.7 Data Types (TypeScript)

Add to [src/types.ts](src/types.ts):

```typescript
export interface TransportPrice {
  id: string;
  operator: string;
  transportType: "train" | "coach" | "bus" | "flight";
  departure: string; // HH:MM
  arrival: string; // HH:MM
  duration_minutes: number;
  transfers: number;
  stops?: string[];
  price_gbp: {
    per_person: number;
    total: number;
    currency: string;
  };
  availability: {
    seats_remaining: number;
    status: "available" | "limited" | "unavailable";
    booking_url: string;
  };
  amenities?: string[]; // wifi, catering, power_sockets, onboard_wc
  alerts?: string[]; // "Only 12 seats left at this price"
  discount_code?: string; // Group discount if applicable
}

export interface LivePricesResponse {
  success: boolean;
  route: {
    origin: string;
    destination: string;
    date: string;
    passengers: number;
  };
  options: {
    train: TransportPrice[];

    coach: TransportPrice[];
    bus?: TransportPrice[];
  };
  metadata: {
    last_updated: string;
    cache_expires: string;

    cache_ttl_seconds: number;
    data_source: string;
    request_id: string;
  };

  error?: string;
  message?: string;
}
```

---

## 4. API Selection & Contracts

### Option 1: Trainline API (Recommended)

**Pros:**

- Covers most UK train operators + National Express coaches
- Well-documented, reliable

- Group booking support
- Real-time availability

**Cons:**

- May have licensing costs
- Rate limiting

**JSON Request Example:**

```sh
GET https://www.thetrainline.com/api/v5/search/outward_journey
  ?originId=stp

  &destinationId=man
  &outwardDate=2026-04-15
  &passengers=4
  &transportModes=train,coach
```

### Option 2: Direct National Rail Enquiries API

**Pros:**

- Official UK rail data
- No middleman (Trainline)

**Cons:**

- Less user-friendly
- Coach data limited

**Contract:**

```sh
GET https://api.rtt.io/api/v1/search?from=LONDON&to=MANCHESTER&date=2026-04-15T14:00
```

```text

&passengers=4

```

### Implementation Recommendation

- Phase 1 (MVP): Trainline API covers both train + coach
- Phase 2: Add National Rail direct if better pricing/data
- Phase 3: Add Stagecoach coach routes separately

---

## 5. Error Handling

| Scenario               | Behavior                                 |
| ---------------------- | ---------------------------------------- |
| API timeout (>5 secs)  | Return agent estimate + warning badge    |
| API 429 (rate limited) | Cache hit falls back to cached result    |
| API 5xx error          | Return estimate + retry after 1 minute   |
| Network unreachable    | Show offline state, offer manual refresh |
| Invalid route          | Return empty list + "No options found"   |
| Malformed response     | Log error, return estimate               |

---

## 6. Monitoring & Rollout

### Metrics to Track

- Cache hit rate (target: >80%)
- API error rate (target: <2%)
- User engagement: % clicking "Book Now"
- Cost per request
- False positives: %mismatch between live + estimate

### Alerts

- API error rate > 5% → Page alert
- Average latency > 3 secs → Investigate
- Cache hit rate < 60% → Review caching strategy

### Rollout Gates

1. Backend ready + tested (internal only)
2. Feature flag `enableLivePrices = true` for team
3. 10% of users for 24 hours (monitor for errors)
4. 50% of users (if no issues)
5. 100% of users
6. Monitor for 1 week, rollback if error rate > 5%

---

## 7. Success Criteria

- [ ] Live prices displayed in <2 secs 80% of the time
- [ ] Cache hit rate > 80%
- [ ] API error rate < 2%
- [ ] User engagement (click to book) > 30%
- [ ] Revenue: 2% increase in conversions due to transparency
- [ ] < 1 complaint per 1000 itineraries generated
