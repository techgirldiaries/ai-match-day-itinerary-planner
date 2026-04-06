# Gamification & Rewards System Architecture

## Overview

This document outlines the technical architecture for integrating a gamification and rewards system into the AI Match-Day Itinerary Planner. The system enables LTFC to:

- **Engage supporters** through quizzes and reward mechanics
- **Generate leads** by capturing behavioral data and segmentation
- **Optimise revenue** through targeted campaigns and premium tier offerings
- **Track conversions** to measure quiz engagement → ticket/merchandise sales attribution

---

## 1. System Architecture

### 1.1 High-Level Flow

```flowchart
User Completes Itinerary
    ↓
Points Awarded (10 pts)
    ↓
Quiz Available → User Takes Quiz
    ↓
Points Awarded (20-100 pts based on difficulty)
    ↓
Quiz Data Captured & User Segmented
    ↓
Rewards Unlocked / Premium Content Available
    ↓
Lead Data Sent to Sales/Marketing Pipeline
    ↓
Conversion Tracking (Ticket/Merchandise Purchase)
```

### 1.2 Component Map

**Frontend:**

- `quiz-page.tsx` — Quiz interface and delivery
- `rewards-page.tsx` — Points dashboard, reward catalog, redemption
- `quiz-renderer.tsx` — Reusable quiz rendering component
- `gamification-toast.tsx` — Points earned notifications
- Updated `app.tsx` → add rewards button to nav

**Backend:**

- `routes/quizzes.ts` — Quiz submission & scoring
- `routes/rewards.ts` — Points ledger, redemption, catalog
- `services/gamificationService.ts` — Business logic (scoring, segmentation, lead generation)
- `services/leadService.ts` — Lead capture & CRM integration
- `db/gamificationDb.ts` — Points, quiz responses, reward redemption tracking

**Types & Config:**

- Extend `core/types.ts` with `Quiz`, `RewardPoint`, `UserSegment` interfaces
- New `config/quizConfig.ts` — Quiz definitions, point schedules, reward catalog

---

## 2. Database Schema

### 2.1 Gamification Tables

**`user_quiz_responses`** — Captures quiz data for lead segmentation

```sql
CREATE TABLE user_quiz_responses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  answers JSONB NOT NULL,           -- {"q1": "answer", "q2": "answer"...}
  points_earned INTEGER,
  difficulty TEXT,                  -- "easy", "medium", "hard"
  completion_time_seconds INTEGER,
  completed_at TIMESTAMP,
  segmentation_tags JSONB,          -- ["season_ticket_prospect", "heritage_fan"]
  created_at TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (user_id, quiz_id),
  INDEX (completed_at)
);
```

**`user_points_ledger`** — Points history for each user

```sql
CREATE TABLE user_points_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  points_delta INTEGER,
  reason TEXT,                      -- "itinerary_completion", "quiz_completion", "reward_redemption"
  source_id TEXT,                   -- quiz_id or itinerary_id
  balance_after INTEGER,
  created_at TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (user_id, created_at),
  INDEX (reason)
);
```

**`user_rewards_redeemed`** — Redemption history

```sql
CREATE TABLE user_rewards_redeemed (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  points_spent INTEGER,
  redemption_code TEXT,             -- For physical/digital claiming
  status TEXT,                      -- "pending", "fulfilled", "expired"
  claimed_at TIMESTAMP,
  fulfilled_at TIMESTAMP,
  created_at TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (user_id, status),
  INDEX (claimed_at)
);
```

**`user_segments`** — Behavioral segmentation for targeting

```sql
CREATE TABLE user_segments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  segment_tag TEXT,                 -- "season_ticket_prospect", "heritage_fan", "budget_conscious"
  confidence_score DECIMAL(3,2),    -- 0.0-1.0
  quiz_sources JSONB,               -- Which quizzes identified this segment
  added_at TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (user_id, segment_tag),
  INDEX (segment_tag, confidence_score)
);
```

### 2.2 Quiz Configuration Table

**`quiz_definitions`** — Reusable quiz templates

```sql
CREATE TABLE quiz_definitions (
  id TEXT PRIMARY KEY,
  agent_id TEXT,                    -- "heritage_agent", "youth_agent", etc.
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,         -- Full quiz structure (see 2.3 below)
  difficulty TEXT,                  -- "easy", "medium", "hard"
  points_base INTEGER,              -- Base points for completion
  points_perfect_bonus INTEGER,     -- Extra for perfect score
  time_limit_seconds INTEGER,       -- Optional
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,

  PRIMARY KEY (id),
  INDEX (agent_id, active)
);
```

### 2.3 Quiz JSON Structure (In `quiz_definitions.questions`)

```json
{
  "q1": {
    "question": "How many league titles has LTFC won?",
    "type": "multiple-choice",
    "options": [
      { "label": "1", "value": "1", "isCorrect": true },
      { "label": "2", "value": "2" },
      { "label": "3", "value": "3" },
      { "label": "0", "value": "0" }
    ],
    "points": 10,
    "segmentationTag": "heritage_fan"
  },
  "q2": {
    "question": "What's your ideal pre-match budget (per person)?",
    "type": "multiple-choice",
    "options": [
      {
        "label": "£0-25",
        "value": "budget",
        "segmentationTag": "budget_conscious"
      },
      {
        "label": "£25-50",
        "value": "standard",
        "segmentationTag": "standard_supporter"
      },
      {
        "label": "£50+",
        "value": "premium",
        "segmentationTag": "premium_prospect"
      }
    ],
    "points": 20
  }
}
```

---

## 3. Type Definitions

### 3.1 Core Gamification Types

Add to `frontend/src/core/types.ts`:

```typescript
// Quiz Types
export interface Quiz {
  id: string;
  agentId: string; // "heritage_agent", "youth_agent", etc.
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
  pointsBase: number;
  pointsPerfectBonus: number;
  timeLimitSeconds?: number;
  active: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "text-input";
  options?: QuizOption[];
  points: number;
  segmentationTag?: string;
}

export interface QuizOption {
  label: string;
  value: string;
  isCorrect?: boolean;
  segmentationTag?: string;
}

export interface QuizResponse {
  quizId: string;
  userId: string;
  answers: Record<string, string>; // {"q1": "answer_value"}
  pointsEarned: number;
  segmentationTags: string[];
  completionTimeSecs: number;
  submittedAt: Date;
}

// Reward Types
export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  tier: "bronze" | "silver" | "gold";
  category: "merchandise" | "digital" | "hospitality" | "experience";
  imageUrl?: string;
  quantity?: number; // null = unlimited
  expiresAt?: Date;
  active: boolean;
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  redemptionCode?: string;
  status: "pending" | "fulfilled" | "expired";
  claimedAt: Date;
  fulfilledAt?: Date;
}

// Gamification State Types
export interface GamificationState {
  currentPoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  userSegments: UserSegment[];
  activeRewards: Reward[];
  redemptionHistory: UserReward[];
  dailyGoal?: number;
  streakDays?: number;
}

export interface UserSegment {
  tag: string; // "season_ticket_prospect", "heritage_fan", etc.
  confidenceScore: number; // 0.0-1.0
  sources: string[]; // Which quizzes identified this
}

export interface LeadEvent {
  userId: string;
  eventType: "quiz_completed" | "reward_redeemed" | "itinerary_exported";
  segments: string[];
  points: number;
  metadata: Record<string, unknown>;
  timestamp: Date;
}
```

### 3.2 Backend Service Types

Add to `backend/src/types/index.ts`:

```typescript
export interface QuizScore {
  totalScore: number;
  perfectScore: number;
  percentageScore: number;
  pointsEarned: number;
  segmentationTags: string[];
}

export interface SegmentationResult {
  tags: string[];
  confidence: Record<string, number>;
  supportingQuizzes: string[];
}

export interface LeadData {
  userId: string;
  segments: string[];
  pointsBalance: number;
  lastActivityDate: Date;
  engagementScore: number; // 0-100
  readyForCampaign: boolean;
}
```

---

## 4. Backend API Endpoints

### 4.1 Quiz Routes (`backend/src/routes/quizzes.ts`)

```typescript
// GET /api/quizzes — List all active quizzes
// Response: Quiz[]
// Filters: ?agentId, ?difficulty, ?active=true

// GET /api/quizzes/:quizId — Get single quiz
// Response: Quiz

// POST /api/quizzes/:quizId/submit — Submit quiz answers
// Body: {
//   userId: string,
//   answers: Record<string, string>,
//   completionTimeSecs: number
// }
// Response: {
//   pointsEarned: number,
//   score: QuizScore,
//   newSegments: string[]
// }

// GET /api/quizzes/user/:userId/history — Get user's quiz history
// Response: QuizResponse[]
```

### 4.2 Rewards Routes (`backend/src/routes/rewards.ts`)

```typescript
// GET /api/rewards — List all available rewards
// Response: Reward[]
// Filters: ?tier=bronze, ?category=merchandise, ?active=true

// GET /api/rewards/user/:userId/balance — Get user's points balance
// Response: {
//   currentPoints: number,
//   totalEarned: number,
//   totalSpent: number,
//   availableRewards: Reward[]
// }

// POST /api/rewards/user/:userId/redeem — Redeem a reward
// Body: {
//   rewardId: string,
//   pointsToSpend: number
// }
// Response: {
//   success: boolean,
//   redemptionCode: string,
//   newBalance: number
// }

// GET /api/rewards/user/:userId/redemptions — Get redemption history
// Response: UserReward[]

// POST /api/rewards — Create new reward (admin)
// Body: Reward (without id)
// Response: Reward
```

### 4.3 Gamification Routes (`backend/src/routes/gamification.ts`)

```typescript
// GET /api/gamification/user/:userId/state — Get full gamification state
// Response: GamificationState

// GET /api/gamification/user/:userId/segments — Get user's segments
// Response: {
//   segments: UserSegment[],
//   readyForTargeting: boolean,
//   targetingTags: string[]
// }

// POST /api/gamification/user/:userId/award-points — Manually award points (internal)
// Body: {
//   points: number,
//   reason: string,
//   sourceId?: string
// }
// Response: { newBalance: number }

// GET /api/gamification/leads — Get all segmented leads (admin/sales)
// Response: LeadData[]
// Filters: ?segment=season_ticket_prospect, ?minEngagement=75
```

---

## 5. Service Layer

### 5.1 Gamification Service (`backend/src/services/gamificationService.ts`)

```typescript
export class GamificationService {
  /**
   * Score a completed quiz and return points + segmentation
   */
  async scoreQuiz(
    quizId: string,
    answers: Record<string, string>,
    userId: string,
    completionTimeSecs: number,
  ): Promise<{
    pointsEarned: number;
    score: QuizScore;
    newSegments: string[];
  }> {
    // 1. Fetch quiz definition
    // 2. Calculate score based on correct answers
    // 3. Award base points + time-based bonus
    // 4. Extract segmentation tags from selected answers
    // 5. Update user_segments table with confidence scores
    // 6. Log points in user_points_ledger
    // 7. Return results
  }

  /**
   * Determine user segments based on quiz history
   */
  async calculateUserSegments(userId: string): Promise<UserSegment[]> {
    // 1. Query all quiz responses for user
    // 2. Aggregate segmentation tags and counts
    // 3. Calculate confidence scores (0.0-1.0) based on frequency
    // 4. Save/update in user_segments table
    // 5. Return segments with confidence
  }

  /**
   * Get user's current gamification state
   */
  async getUserState(userId: string): Promise<GamificationState> {
    // 1. Get current points balance from ledger
    // 2. Get active segments
    // 3. Get available rewards based on tier
    // 4. Get redemption history
    // 5. Calculate streaks/daily goals if applicable
  }

  /**
   * Award points for external events (itinerary completion, etc.)
   */
  async awardPoints(
    userId: string,
    points: number,
    reason: string,
    sourceId?: string,
  ): Promise<number> {
    // 1. Validate points > 0
    // 2. Insert into user_points_ledger
    // 3. Return new balance
  }

  /**
   * Check if user qualifies for reward redemption
   */
  async validateRedemption(
    userId: string,
    rewardId: string,
  ): Promise<{
    valid: boolean;
    message?: string;
    pointsRequired: number;
    userBalance: number;
  }> {
    // 1. Fetch reward
    // 2. Check user's points balance
    // 3. Check reward quantity available
    // 4. Check expiration
    // 5. Return validation result
  }
}
```

### 5.2 Lead Service (`backend/src/services/leadService.ts`)

```typescript
export class LeadService {
  /**
   * Capture and segment lead from quiz completion
   */
  async captureLeadFromQuiz(
    userId: string,
    quizResponse: QuizResponse,
    segments: UserSegment[],
  ): Promise<LeadData> {
    // 1. Create/update LeadData record
    // 2. Calculate engagement score based on:
    //    - Quiz completion rate
    //    - Points earned
    //    - Segment tier
    //    - Redemption activity
    // 3. Determine if ready for marketing campaign
    // 4. Queue for CRM sync if ready
    // 5. Return lead data
  }

  /**
   * Get all leads ready for targeting by segment
   */
  async getLeadsBySegment(
    segment: string,
    minEngagement: number = 50,
  ): Promise<LeadData[]> {
    // 1. Query users with segment tag
    // 2. Filter by engagement score
    // 3. Exclude recent converters (optional)
    // 4. Return lead list for marketing
  }

  /**
   * Track lead conversion event
   */
  async trackConversion(
    userId: string,
    conversionType:
      | "ticket_purchase"
      | "merchandise_purchase"
      | "season_ticket",
    conversionValue: number,
  ): Promise<void> {
    // 1. Log conversion event
    // 2. Update lead status (converted)
    // 3. Tag for attribution analysis
    // 4. Send to analytics/BI system
  }

  /**
   * Calculate attribution: Which quiz led to this conversion?
   */
  async attributeConversion(
    userId: string,
    conversionType: string,
  ): Promise<{
    attributedQuizzes: string[];
    strongestQuiz: string;
    segmentsInvolved: string[];
  }> {
    // 1. Get user's quiz history
    // 2. Get user's current segments
    // 3. Correlate with conversion type
    // 4. Return attribution analysis
  }
}
```

---

## 6. Frontend Components

### 6.1 Quiz Page (`frontend/src/components/pages/quiz-page.tsx`)

```typescript
export interface QuizPageProps {
  quizzes: Quiz[];
  userState: GamificationState;
}

/**
 * Main quiz listing page with:
 * - Quiz grid filterable by agent/difficulty
 * - User's current points and tier badge
 * - Recent quiz completion summary
 */
export const QuizPage = (props: QuizPageProps) => {
  // 1. Display available quizzes grouped by agent
  // 2. Show difficulty, estimated time, points reward
  // 3. Highlight newly completed quizzes
  // 4. Display "Start Quiz" button with click handler
};
```

### 6.2 Quiz Renderer (`frontend/src/components/quiz-renderer.tsx`)

```typescript
export interface QuizRendererProps {
  quiz: Quiz;
  onSubmit: (
    answers: Record<string, string>,
    timeSecs: number,
  ) => Promise<void>;
  onClose: () => void;
}

/**
 * Interactive quiz component with:
 * - Question-by-question display
 * - Progress bar
 * - Timer (if applicable)
 * - Points preview
 * - Submit and review screens
 */
export const QuizRenderer = (props: QuizRendererProps) => {
  // 1. Show current question
  // 2. Track answers in local state
  // 3. Show progress (Q1/5)
  // 4. Display countdown timer
  // 5. Handle submit → call onSubmit
  // 6. Show success screen with points earned
};
```

### 6.3 Rewards Page (`frontend/src/components/pages/rewards-page.tsx`)

```typescript
export interface RewardsPageProps {
  userState: GamificationState;
  onRedeem: (rewardId: string) => Promise<void>;
}

/**
 * Rewards marketplace with:
 * - Points balance display + visual progress
 * - Reward catalog filterable by tier/category
 * - "Redeem" button with confirmation dialog
 * - Redemption history timeline
 * - Tier upgrade path visualization
 */
export const RewardsPage = (props: RewardsPageProps) => {
  // 1. Display user's point balance as header
  // 2. Show tier status (bronze/silver/gold) with progress to next
  // 3. Grid of available rewards filtered by current tier
  // 4. "Redeem" modal with confirmation + code display
  // 5. Show past redemptions
};
```

### 6.4 Gamification Toast (`frontend/src/components/gamification-toast.tsx`)

```typescript
/**
 * Toast notification appearing when points are earned
 * Shows: "+20 pts • Heritage Fan identified!"
 */
export const GamificationToast = (props: {
  points: number;
  message: string;
  segmentationTags?: string[];
}) => {
  // Brief celebration animation with point display
};
```

### 6.5 Integration with Existing App

Update `frontend/src/components/app.tsx`:

```typescript
// Add to nav
<nav>
  {/* existing nav items */}
  <a href="/quizzes" class="nav-link">
    🎯 Quizzes
    <span class="badge">{userState.currentPoints} pts</span>
  </a>
  <a href="/rewards" class="nav-link">
    🏆 Rewards
  </a>
</nav>

// Add routes in AppRouter
<Router>
  {/* existing routes */}
  <Route path="/quizzes" component={QuizPage} />
  <Route path="/quizzes/:quizId" component={QuizRenderer} />
  <Route path="/rewards" component={RewardsPage} />
</Router>
```

---

> **Quiz Catalog & Reward Catalog**: See [QUIZ.md](QUIZ.md) for quiz templates, reward definitions, and catalogue organisation.

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)

- [ ] Design & implement gamification database schema
- [ ] Build `gamificationService.ts` core logic
- [ ] Create quiz submission API endpoint
- [ ] Implement user points ledger tracking
- [ ] Add types to `core/types.ts`
- [ ] Create basic `quiz-page.tsx` component
- [ ] Create `quiz-renderer.tsx` component

### Phase 2: Rewards System (Weeks 4-5)

- [ ] Implement reward redemption logic
- [ ] Build `rewards-page.tsx` with marketplace UI
- [ ] Add reward catalog to database
- [ ] Create redemption code generation
- [ ] Build admin reward management endpoint
- [ ] Integrate toast notifications

### Phase 3: Lead Segmentation & Sales (Weeks 6-8)

- [ ] Implement user segmentation algorithm
- [ ] Build `leadService.ts` for lead capture
- [ ] Create segment-based lead reports (admin endpoint)
- [ ] Integrate attribution tracking
- [ ] Build conversion tracking for sales
- [ ] Create CRM export/webhook for sales tool

### Phase 4: Content & Optimisation (Weeks 9+)

- [ ] Populate initial quiz catalog (heritage, youth, BI, etc.)
- [ ] Populate reward catalog
- [ ] A/B test quiz difficulty and point values
- [ ] Analyse conversion attribution
- [ ] Optimise segmentation tags for targeting
- [ ] Scale based on lead quality metrics

---

## 8. Lead Generation & Revenue Flow

### 8.1 Conversion Funnel

```flowchart
User Takes Quiz (e.g., Heritage Legends)
            ↓
Identified as Segment: "heritage_fan"
            ↓
Engagement Score: 75/100
            ↓
READY FOR TARGETING: YES
            ↓
Marketing Campaign Triggered:
  - Email: "Exclusive heritage tour for LTFC fans"
  - Offer: Season ticket and heritage content tier
  - Point multiplier: 2x points on next quiz
            ↓
User Clicks Email / Visits Campaign Page
            ↓
Conversion Event Tracked:
  - Segment: heritage_fan
  - Quiz attribution: quiz_heritage_legends
  - Value: £250 (season ticket)
            ↓
Attribution Analysis:
  "Heritage Legends Quiz → Season Ticket Purchase"
  ROI: Quiz engagement → £250 revenue
```

### 8.2 Segment-to-Campaign Mapping

| Segment               | Campaign Type   | Offer                               | Commission |
| --------------------- | --------------- | ----------------------------------- | ---------- |
| `heritage_fan`        | Season ticket   | Early access, exclusive content     | Direct     |
| `family_supporter`    | Youth academy   | Family packages, junior memberships | Direct     |
| `corporate_prospect`  | Hospitality     | Group packages, corporate rates     | Commission |
| `budget_conscious`    | Group discounts | Bundle deals, group season tickets  | Direct     |
| `premium_hospitality` | VIP packages    | Luxury experiences, concierge       | Commission |

### 8.3 Revenue Streams

1. **Direct**: Season tickets, merchandise, hospitality packages
2. **Partnerships**: Travel companies (commission on bookings), food vendors (referral fees)
3. **Data**: Anonymised segment insights sold to partners/sponsors
4. **Affiliate**: Fantasy betting, insurance (if applicable)

---

## 9. Admin & Analytics Views

### 9.1 Admin Dashboard Endpoints

```typescript
// GET /admin/gamification/stats
// Returns: {
//   totalQuizzesCreated: 150,
//   quizzesCompletedThisWeek: 3500,
//   averagePointsPerUser: 245,
//   segmentDistribution: { heritage_fan: 1200, family: 900, ... },
//   rewardRedemptionRate: 0.34
// }

// GET /admin/leads/ready-for-targeting?segment=heritage_fan&minEngagement=75
// Returns: LeadData[] with email/contact info for sales

// GET /admin/conversion/attribution
// Returns: {
//   "quiz_heritage_legends": { conversions: 450, value: £112500, roi: 15.2 },
//   "quiz_family_day_planner": { conversions: 320, value: £48000, roi: 8.7 }
// }
```

---

## 10. Privacy & Data Governance

- **PII**: Store minimal user data; quiz answers are behavioral, not personally identifying
- **GDPR**: Quiz/segment data must have clear consent; provide export/deletion options
- **Lead Data**: Only raw segment tags sent to CRM; no raw quiz answers
- **Anonymization**: For analytics/partner reports, aggregate by segment (never individual)

---

## 11. Future Enhancements

- **Leaderboards**: Weekly/monthly quiz leaderboards (opt-in)
- **Badges**: Visual badges for achievement milestones (e.g., "Heritage Expert")
- **Combo Bonuses**: Extra points for completing multiple quizzes from different agents
- **Referral**: "Invite a friend" rewards program
- **Social Sharing**: Share quiz results with "bragging rights" (with consent)
- **AI-Generated Quizzes**: Use Relevance AI to generate dynamic, personalised quizzes
- **Live Events**: Bonus points for attending live stadium events captured via beacon/check-in

---

## 12. Success Metrics

**Engagement:**

- Quiz completion rate (% of users who start a quiz finish it)
- Average points earned per user
- Reward redemption rate

**Lead Quality:**

- % of leads that convert to ticket/merchandise purchase
- Attribution ROI: Points spent on quiz → Revenue generated
- Segment predictive power: Which segments convert best?

**Business Impact:**

- Revenue attributed to quizzes (direct)
- Lead volume ready for sales campaigns
- Customer lifetime value for gamified users vs. non-gamified

---

## Questions & Contact

For architecture clarifications, implementation guidance, or design feedback, review this document with product and engineering teams before starting Phase 1 development.
