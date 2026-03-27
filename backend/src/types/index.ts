/**
 * Shared TypeScript Types for Match-Day Itinerary Planner
 * Used by both Frontend (Preact) and Backend (Hono)
 */

export interface ItineraryResponse {
  id: string;
  match: {
    team1: string;
    team2: string;
    kickoff_time: string; // HH:MM format
    stadium?: string;
    city?: string;
  };
  transport: {
    trains?: TransportOption[];
    coaches?: TransportOption[];
  };
  [key: string]: any; // Allow additional fields from Relevance AI
}

export interface TransportOption {
  id: string;
  operator: string;
  departure_time: string;
  arrival_time: string;
  price_gbp: number;
  status: string;
}

export interface IntakeFormData {
  origin_city: string;
  match_date: string; // YYYY-MM-DD
  group_size: number;
  budget_gbp?: number;
  [key: string]: any;
}

// ============ Feature 2: Group Shares ============

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
    qr_code_url?: string;
    created_at: string;
    expires_at: string;
  };
  message?: string;
}

export interface GroupShare {
  id: string; // Database UUID
  share_id: string; // Short token for URL
  itinerary: ItineraryResponse;
  creator_user_id?: string;
  group_size?: number;
  created_at: string;
  expires_at: string;
  view_count: number;
  is_active: boolean;
}

export interface FetchShareResponse {
  success: boolean;
  share?: GroupShare;
  error?: string;
  message?: string;
}

export interface ListSharesResponse {
  success: boolean;
  shares: GroupShare[];
  total: number;
}

export interface DeleteShareResponse {
  success: boolean;
  message?: string;
}

// ============ Feature 1: Real-Time Pricing (Future) ============

export interface TransportPrice {
  id: string;
  operator: string;
  transportType: "train" | "coach" | "bus" | "flight";
  departure: string;
  arrival: string;
  duration_minutes: number;
  price_gbp: {
    per_person: number;
    total: number;
  };
}

export interface LivePricesResponse {
  success: boolean;
  options: {
    train: TransportPrice[];
    coach: TransportPrice[];
  };
  metadata: {
    last_updated: string;
    cache_expires: string;
  };
}

// ============ Feature 3: Push Notifications (Future) ============

export interface PushSubscriptionPayload {
  user_id: string;
  subscription: {
    endpoint: string;
    keys: {
      auth: string;
      p256dh: string;
    };
  };
  device_info?: {
    device_type: "mobile" | "desktop" | "tablet";
    browser_type: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, any>;
}

// ============ Feature 4: Live Updates (Future) ============

export interface ItineraryUpdate {
  id: string;
  share_id: string;
  update_type:
    | "match_rescheduled"
    | "train_cancelled"
    | "train_delayed"
    | "price_changed";
  field_changed: string;
  previous_value: any;
  new_value: any;
  severity: "low" | "medium" | "high" | "critical";
  detected_at: string;
  is_critical: boolean;
}

// ============ Error Responses ============

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  status_code: number;
}

export type ApiResponse<T> = { success: true; data: T } | ErrorResponse;
