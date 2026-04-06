export interface ChatMessage {
	id: string;
	type: "user-message" | "agent-message" | "streaming-message";
	text: string;
	createdAt: Date;
	agentName?: string;
	isAgent: () => boolean;
}

// Backward compatibility alias
export type Message = ChatMessage;

// Storage format for messages (different from ChatMessage due to serialization requirements)
export interface StorageMessage {
	id: string;
	role: "user" | "agent";
	content: string;
	timestamp: number;
	agentName?: string;
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

export interface DetailedDirections {
	public_transport?: string | null;
	driving?: string | null;
	walking_cycling?: string | null;
}

export interface TransportRecommendation {
	best_value?: TransportOption | null;
	fastest?: TransportOption | null;
	fewest_transfers?: TransportOption | null;
	least_walking?: TransportOption | null;
	detailed_directions?: DetailedDirections | null;
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

export interface Hotel {
	name: string;
	price_per_night: string | number;
	distance_from_stadium?: string | null;
	booking_info?: string | null;
}

export interface FoodAndDrink {
	name: string;
	distance_from_stadium?: string | null;
	description?: string | null;
}

export interface ItineraryResponse {
	match_summary?: MatchSummary | null;
	timeline?: TimelineEntry[] | null;
	transport_recommendation?: TransportRecommendation | null;
	community_note?: string | null;
	cost_breakdown?: CostBreakdown | null;
	top_tips?: string[] | null;
	booking_links?: BookingLink[] | null;
	accommodation?: Hotel[] | null;
	food_and_drink?: FoodAndDrink[] | null;
	confidence?: "low" | "medium" | "high" | null;
}

// ── App Route States ──────────────────────────────────────
export type AppRoute = "intake" | "chat";

// ── Intake Form (New Flow) ────────────────────────────────
export type MatchTicketType =
	| "home"
	| "away"
	| "neutral"
	| "watching-elsewhere";

export type TravelModeNew =
	| "car"
	| "train"
	| "bus"
	| "coach"
	| "taxi"
	| "flight"
	| "walking"
	| "cycling"
	| "other";

export type GroupType =
	| "solo"
	| "couple"
	| "solo-senior"
	| "couple-senior"
	| "family-with-kids"
	| "family-mixed-ages"
	| "group-of-friends"
	| "group-mixed-ages"
	| "corporate"
	| "community-group"
	| "school-group";

export type IntakeFanType =
	| "loyal-hatter"
	| "heritage-fan"
	| "international-supporter"
	| "returning-fan"
	| "family-tradition"
	| "first-time"
	| "corporate-hospitality"
	| "other";

export interface IntakeFormDataNew {
	// Match details:
	matchDate: string; // ISO date string "YYYY-MM-DD"
	kickoffTime: string; // "HH:MM" 24hr
	opponent: string; // e.g. "Burnley FC" or "TBD"
	ticketType: MatchTicketType;

	// Fan details:
	fanType: IntakeFanType; // e.g. "loyal-hatter"
	groupType: GroupType;
	groupSize: number; // min 1, max 50
	travelModes: TravelModeNew[]; // Multiple transport modes
	departureLocation: string; // free text e.g. "Luton Town Centre"

	// Preferences:
	prefersPubPreMatch: boolean;
	prefersFood: boolean;
	prefersShoppingAreas: boolean;
	prefersAttractionSites: boolean;
	prefersLocationHistory: boolean;
	prefersParkingRecommendations: boolean;
	accessibilityNeeds: string; // free text, empty string if none
	budgetPerPerson: number; // GBP, min 0
	additionalNotes: string; // free text, empty string if none
}

// ── Validation ────────────────────────────────────────────
export type IntakeFieldKey = keyof IntakeFormDataNew;

export interface IntakeValidationError {
	field: IntakeFieldKey;
	message: string;
}

export interface IntakeValidationResult {
	isValid: boolean;
	errors: IntakeValidationError[];
}

// ── Messages (New Flow) ───────────────────────────────────
export type IntakeMessageRole = "user" | "agent";

export interface IntakeMessage {
	id: string; // Always crypto.randomUUID()
	role: IntakeMessageRole;
	content: string;
	timestamp: number; // Date.now()
	agentName?: string;
	isItinerary?: boolean; // true flags final itinerary message
	// for special rendering
}

// ── Itinerary Output ──────────────────────────────────────
export type ItinerarySlotTime =
	| "pre-match-morning"
	| "pre-match-afternoon"
	| "matchday-arrival"
	| "half-time"
	| "post-match"
	| "evening";

export interface ItinerarySlot {
	id: string;
	time: ItinerarySlotTime;
	title: string;
	description: string;
	location?: string;
	durationMinutes?: number;
	estimatedCostGBP?: number;
}

export interface ItineraryOutputNew {
	id: string;
	generatedAt: number; // Date.now()
	matchDate: string;
	opponent: string;
	slots: ItinerarySlot[];
	totalEstimatedCostGBP: number;
	travelNotes: string;
	accessibilityNotes?: string;
}

// ── Type Guards ───────────────────────────────────────────
export function isAgentMessage(message: IntakeMessage): boolean {
	return message.role === "agent";
}

// Exhaustive role matcher — errors at compile time if
// IntakeMessageRole grows and handler not updated:
export function matchIntakeMessageRole<T>(
	message: IntakeMessage,
	handlers: Record<IntakeMessageRole, (m: IntakeMessage) => T>,
): T {
	return handlers[message.role](message);
}
