export interface ChatMessage {
  id: string;
  type: "user-message" | "agent-message" | "streaming-message";
  text: string;
  createdAt: Date;
  agentName?: string;
  isAgent: () => boolean;
}

export type TransportMode =
  | "train"
  | "coach"
  | "car"
  | "taxi"
  | "fly"
  | "bus"
  | "cycling"
  | "walking";
export type TravelStyle = "budget" | "standard" | "premium" | "luxury";
export type FanType =
  | "loyal_hatter"
  | "kenilworth_road_faithful"
  | "supporters_trust_owner"
  | "international_modern"
  | "away_day_specialists"
  | "multicultural_town"
  | "men_in_gear"
  | "other";
export type MatchType = "home" | "away";
export type InterestType =
  | "pubs"
  | "shopping"
  | "attractions"
  | "history"
  | "food";

export interface IntakeFormData {
  origin_city: string;
  match_date: string;
  match_time: string;
  match_type: MatchType;
  group_size: number;
  budget_gbp: number;
  overnight_stay: boolean;
  transport_modes: TransportMode[];
  travel_style: TravelStyle;
  fan_type: FanType;
  interests: InterestType[];
  group_coordination: boolean;
  loyalty_member: boolean;
  accessibility_needs: string[];
  community_opt_in: boolean;
  preferences: string;
}

export interface MatchSummary {
  opponent: string;
  kick_off: string;
  venue: string;
  competition?: string;
}

export interface TimelineEntry {
  time: string;
  activity: string;
  location?: string | null;
  notes?: string | null;
  confidence?: "low" | "medium" | "high" | null;
}

export interface TransportOption {
  mode: string;
  provider?: string | null;
  departure_time?: string | null;
  arrival_time?: string | null;
  duration?: string | null;
  cost?: string | null;
  booking_url?: string | null;
  notes?: string | null;
}

export interface TransportRecommendation {
  best_value?: TransportOption | null;
  fastest?: TransportOption | null;
}

export interface CostBreakdownItem {
  label: string;
  amount: number | string;
  currency?: string;
}

export interface CostBreakdown {
  items?: CostBreakdownItem[] | null;
  total?: number | string | null;
  currency?: string;
  per_person?: boolean;
}

export interface BookingLink {
  label: string;
  url: string;
  category?: string | null;
}

export interface ItineraryResponse {
  match_summary?: MatchSummary | null;
  timeline?: TimelineEntry[] | null;
  transport_recommendation?: TransportRecommendation | null;
  community_note?: string | null;
  cost_breakdown?: CostBreakdown | null;
  top_tips?: string[] | null;
  booking_links?: BookingLink[] | null;
  confidence?: "low" | "medium" | "high" | null;
}
