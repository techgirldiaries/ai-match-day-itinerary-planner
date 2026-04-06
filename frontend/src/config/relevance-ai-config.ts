/**
 * Relevance AI Agent Configuration Reference
 * Maps frontend to actual Relevance AI platform tools and settings
 *
 * Source: grp4_agent.rai (agent configuration from Relevance AI)
 */

/**
 * Agent Configuration Details
 * All sensitive values loaded from environment variables
 */
export const RELEVANCE_AI_CONFIG = {
	// Agent identification (from environment variables)
	agentId: import.meta.env.VITE_AGENT_ID as string,
	projectId: import.meta.env.VITE_PROJECT as string,
	region: import.meta.env.VITE_REGION as string,
	agentName: "LTFC Fan Itinerary Planner",

	// Configuration
	model: "relevance-performance-optimized",
	fallbackModel: "relevance-cost-optimized",
	temperature: 0, // Deterministic responses (important for consistency)
	maxAutonomy: 20,

	// API endpoints & headers
	baseUrl: "https://api.relevance.ai/agent",
	apiVersion: "v2",

	// Timeout configuration
	timeoutMs: 30000, // 30 seconds (platform limit)
	coreResponseTargetMs: 20000, // Core response target
	advancedFeaturesMs: 8000, // Additional time for advanced features
};

/**
 * Tool/Action Mappings - Actual IDs from Relevance AI Agent
 * Use these IDs when referencing tools in prompts: {{_actions.ACTION_ID}}
 */
export const RELEVANCE_TOOLS = {
	// Search tools
	GOOGLE_SEARCH: {
		id: "15a9a3c4d689ffa1",
		name: "Google Search",
		description: "Search the web for keywords using Google",
		purpose: "Finding travel info, routes, match schedules",
		timeout: 3000,
	},

	GOOGLE_MAPS: {
		id: "10937b534d1b6770",
		name: "Google Maps (Places API)",
		description: "Search for businesses and places (pubs, restaurants, hotels)",
		purpose: "Finding venues near stadium, accommodation, local attractions",
		timeout: 3000,
		autoComplete: true,
	},

	WEB_SEARCH: {
		id: "ba47f65b1aa55055",
		name: "Web Search",
		description: "General web search for current information",
		purpose: "Latest travel prices, match updates, stadium news",
		timeout: 3000,
	},

	// Calendar/reminder tools
	CREATE_GOOGLE_CALENDAR: {
		id: "d0bb2821da0134e2",
		name: "Create Google Calendar Event",
		description: "Create match-day calendar event with reminders",
		purpose: "Itinerary calendar integration, travel reminders",
		timeout: 2000,
	},

	CREATE_OUTLOOK_EVENT: {
		id: "db09a3489e0cabef",
		name: "Create Outlook Calendar Event",
		description: "Create calendar event in Microsoft Outlook",
		purpose: "Outlook users - match day + travel calendar",
		timeout: 2000,
	},

	CREATE_CALENDAR_EVENT: {
		id: "b8ffe51c9c792523",
		name: "Create Calendar Event (Auto)",
		description: "Auto-detect and create in Google Calendar or Outlook",
		purpose: "Universal calendar integration",
		timeout: 2000,
	},

	CHECK_GOOGLE_AVAILABILITY: {
		id: "53a2378419b7606e",
		name: "Check Google Calendar Availability",
		description: "Check existing calendar for availability",
		purpose: "Find free time slots on match day",
		timeout: 2000,
	},

	CHECK_OUTLOOK_AVAILABILITY: {
		id: "8db43bd8419a3746",
		name: "Check Outlook Calendar Availability",
		description: "Check Outlook calendar for availability",
		purpose: "Check Outlook calendar availability",
		timeout: 2000,
	},

	// Email tool
	SEND_GMAIL: {
		id: "688e972fa6189078",
		name: "Send Gmail Email",
		description: "Send confirmation emails with itinerary details",
		purpose: "Email booking confirmations, itinerary summaries",
		timeout: 2000,
	},

	// LLM tool
	LLM: {
		id: "22c98acef96245e5",
		name: "LLM Transformation",
		description: "Language model for content generation/transformation",
		purpose: "Format responses, summarize, translate content",
		timeout: 3000,
	},

	// Optional sports/odds
	ODDS_API: {
		id: "6f9863fc5490353b",
		name: "The Odds API",
		description: "Sports odds data",
		purpose: "Match betting odds (optional feature)",
		timeout: 2000,
	},
};

/**
 * Tool Usage Strategy for Timeout Management
 *
 * RULE: Use cached data first, API tools only if essential
 */
export const TOOL_STRATEGY = {
	priority: [
		"CACHED_DATA", // Use pre-computed routes/venues (0ms)
		"WEB_SEARCH", // General search for current info (2-3s)
		"GOOGLE_MAPS", // Specific venue/place search (2-3s)
		"GOOGLE_SEARCH", // Deep web search if WEB_SEARCH fails (3s)
		"EMAIL_CALENDAR", // Calendar integration (2s)
		"LLM", // Only for transformation if needed (3s)
	],

	maxToolCalls: 2, // Never call more than 2 tools in parallel
	serialTimeout: false, // Don't call tools sequentially (too slow)

	callOrder: "parallel", // Call available tools in parallel only

	fallbackStrategy: {
		transportFails: "Use cached routes",
		venuesFails: "Use hardcoded pub names (Bricklayers, Painters, Two Brewers)",
		weatherFails: "Skip weather section entirely",
		searchFails: "Return core itinerary only",
	},
};

/**
 * Data Protection & Compliance Settings
 * GDPR/UK Data Protection Act 2018
 */
export const COMPLIANCE = {
	// Data collection
	minimalDataCollection: true,
	encryptionEnabledByDefault: true,

	// Retention
	itineraryRetentionDays: 7,
	groupDataRetentionDays: 14,
	paymentRecordRetentionYears: 6,
	loyaltyDataRetentionMonths: 12,

	// User rights
	supportsDataExport: true,
	supportsDataDeletion: true,
	supportsPortability: true,

	// Payment
	neverStoreCardDetails: true,
	paymentProcessor: ["Stripe", "PayPal"], // PCI-DSS certified

	// Notifications
	privacyNoticeAlways: true,
	conscentRequiredFor: ["group_sharing", "loyalty_tracking", "email_contact"],

	// Contact
	privacyEmail: "privacy@ltfcitinerary.co.uk", // Update with real email
};

/**
 * Feature Flags - Enable/disable features for performance tuning
 */
export const FEATURE_FLAGS = {
	// Core features (always on)
	coreItinerary: true,
	transportOptions: true,
	venueRecommendations: true,
	costBreakdown: true,

	// Advanced features (conditional)
	groupFeatures: true,
	loyaltyIntegration: true,
	internationalSupport: true,
	powerCourtUpdates: true,
	realTimeUpdates: true,
	bookingIntegration: true,

	// Optimization
	useCachedData: true,
	useParallelTools: true,
	timeout_protection: true,
	gracefulDegradation: true,

	// Monitoring
	logToolCalls: true,
	logTimeouts: true,
	logDataAccess: false, // Don't log for privacy
};

/**
 * Stadiums Database
 * Reference data for home/away matches
 */
export const STADIUMS = {
	HOME: {
		name: "Kenilworth Stadium Road",
		address: "1 Maple Rd E, Luton LU4 8AW",
		coordinates: { lat: 51.8746, lng: -0.4253 },
		capacity: 10356,
		colors: ["Orange", "Navy", "White"],
		nickname: "The Hatters",
		county: "Bedfordshire",
		postcode: "LU4 8AW",
	},
};

/**
 * Venue Cache - Pre-computed nearby locations
 */
export const VENUE_CACHE = {
	pubs: [
		{
			name: "Bricklayers Arms",
			address: "High Town Road, Luton",
			distance: "0.3 miles",
			atmosphere: "Fan favourite, traditional pub",
			rating: 4.5,
		},
		{
			name: "Painters Arms",
			address: "Dunstable Road, Luton",
			distance: "0.4 miles",
			atmosphere: "Match day atmosphere, screens",
			rating: 4.3,
		},
		{
			name: "Two Brewers",
			address: "Near Kenilworth Stadium",
			distance: "0.2 miles",
			atmosphere: "Close to stadium, mix of supporters",
			rating: 4.2,
		},
	],

	food: [
		{
			name: "Local restaurants",
			distance: "within 5-min walk",
			types: ["Indian", "Italian", "Chinese", "British"],
		},
	],

	shopping: [
		{
			name: "LTFC Official Club Shop",
			address: "Unit 55, The Point, Luton, LU1 2TL",
			items: "Merchandise, match-day souvenirs, memorabilia",
		},
	],
};

/**
 * Route Cache - Pre-computed popular routes
 */
export const ROUTE_CACHE = {
	"London-Luton": [
		{
			mode: "train",
			provider: "Thameslink",
			duration: "30min",
			cost: "£15-25",
		},
		{
			mode: "bus",
			provider: "National Express",
			duration: "45min",
			cost: "£10-20",
		},
	],
};
