/**
 * LTFC Itinerary Planner - Secure Agent Configuration
 *
 * SECURITY: All credentials loaded from environment variables only
 * NEVER hardcode: VITE_AGENT_ID, VITE_PROJECT, VITE_REGION, VITE_WORKFORCE_ID
 *
 * Source: Frontend environment variables (.env)
 * Tools: Mapped from Relevance AI agent configuration
 */

/**
 * Core agent configuration - loaded entirely from environment
 */
export const getAgentConfig = () => {
  const region = import.meta.env.VITE_REGION;
  const projectId = import.meta.env.VITE_PROJECT;
  const agentId = import.meta.env.VITE_AGENT_ID;
  const workforceId = import.meta.env.VITE_WORKFORCE_ID;

  // Validate that required env vars are set
  if (!region || !projectId || (!agentId && !workforceId)) {
    throw new Error(
      "Missing required environment variables. " +
        "Ensure VITE_REGION, VITE_PROJECT, and (VITE_AGENT_ID or VITE_WORKFORCE_ID) are set in .env",
    );
  }

  return {
    // Agent identification (from environment only)
    agentId: agentId || undefined,
    workforceId: workforceId || undefined,
    projectId,
    region,
    agentName: "LTFC Fan Itinerary Planner",

    // Prompt configuration
    useOptimizedPrompt: true,
    optimizedPromptVersion: "1.0",

    // Model settings (performance-critical for 30s timeout)
    model: "relevance-performance-optimized",
    fallbackModel: "relevance-cost-optimized",
    temperature: 0, // Deterministic responses (no randomness)
    maxAutonomy: 20, // Prevent agent runaway

    // Timeout settings (platform limit: 30 seconds)
    timeoutMs: 30000,
    safeBufferMs: 28000, // Detect timeout at 28s
    retryAttempts: 2,

    // API configuration
    baseUrl: "https://api.relevance.ai",
    apiVersion: "v2",

    // Feature flags
    features: {
      groupCoordination: true,
      loyaltyIntegration: true,
      internationalSupport: true,
      powerCourtUpdates: true,
      realTimeUpdates: true,
      bookingIntegration: true,
      gdprCompliance: true, // Always enabled
    },
  };
};

/**
 * Tool mappings - tool IDs from Relevance AI agent
 * Each tool is configured with security and timeout settings
 */
export const RELEVANCE_TOOLS = {
  GOOGLE_SEARCH: {
    actionId: "15a9a3c4d689ffa1",
    name: "Google Search",
    timeout: 3000,
    priority: "high",
  },
  WEB_SEARCH: {
    actionId: "ba47f65b1aa55055",
    name: "Web Search",
    timeout: 3000,
    priority: "medium",
  },
  GOOGLE_MAPS: {
    actionId: "10937b534d1b6770",
    name: "Google Maps (Places API)",
    timeout: 3000,
    priority: "high",
  },
  GOOGLE_CALENDAR: {
    actionId: "d0bb2821da0134e2",
    name: "Create Google Calendar Event",
    timeout: 2000,
    priority: "medium",
  },
  OUTLOOK_CALENDAR: {
    actionId: "db09a3489e0cabef",
    name: "Create Outlook Calendar Event",
    timeout: 2000,
    priority: "medium",
  },
  GMAIL: {
    actionId: "688e972fa6189078",
    name: "Send Gmail Email",
    timeout: 2000,
    priority: "low",
  },
  PYTHON_EXECUTOR: {
    actionId: "b6ae4934fd1c5e65",
    name: "Python Code Executor",
    timeout: 3000,
    priority: "low",
  },
  LLM: {
    actionId: "22c98acef96245e5",
    name: "LLM (Internal)",
    timeout: 3000,
    priority: "high",
  },
  WEATHER_API: {
    actionId: "0b51097feef063f5",
    name: "OpenWeather API",
    timeout: 2000,
    priority: "low",
  },
  LTFC_TRAVEL_AGENT: {
    actionId: "984840b9344ec96c",
    name: "LTFC Travel Agent",
    timeout: 5000,
    priority: "high",
  },
};

/**
 * Tool strategy for optimal performance
 */
export const TOOL_STRATEGY = {
  maxParallelCalls: 2, // Don't overwhelm with simultaneous requests
  dataCheckOrder: ["cache", "search", "api"],
  timeoutStrategy: "graceful-fallback",
  onTimeout: "return-best-available",
};

/**
 * Stadium configuration
 */
export const STADIUM = {
  name: "Kenilworth Stadium Road",
  address: "1 Maple Rd E, Luton LU4 8AW",
  city: "Luton",
  capacity: 10356,
  coordinates: { lat: 51.8397, lng: -0.4101 },
};

/**
 * Pre-computed venue cache
 * Eliminates ~3 API calls per request
 */
export const VENUE_CACHE = {
  pubs: [
    {
      name: "Bricklayers Arms",
      distance: "0.3 miles",
      rating: 4.5,
      walkTime: "5-7 mins",
    },
    {
      name: "Painters Arms",
      distance: "0.4 miles",
      rating: 4.3,
      walkTime: "8-10 mins",
    },
    {
      name: "Two Brewers",
      distance: "0.2 miles",
      rating: 4.2,
      walkTime: "3-5 mins",
    },
  ],
  restaurants: [
    { name: "Local pizzeria", distance: "0.3 miles", cuisines: ["Italian"] },
    { name: "Asian fusion", distance: "0.4 miles", cuisines: ["Asian"] },
    { name: "Burger joint", distance: "0.2 miles", cuisines: ["American"] },
  ],
  shopping: [
    { name: "Town Centre Shopping", distance: "0.5 miles" },
    { name: "Local shops", distance: "0.3 miles" },
  ],
};

/**
 * Pre-computed route cache
 * Eliminates ~5 API calls, saves ~8 seconds per request
 */
export const ROUTE_CACHE = {
  London: {
    options: [
      {
        type: "Thameslink Train",
        duration: "30-35 mins",
        cost: "£15-25",
        frequency: "Every 10-20 mins",
      },
      {
        type: "National Express Bus",
        duration: "60-90 mins",
        cost: "£8-15",
        frequency: "Multiple daily",
      },
      {
        type: "Taxi/Uber",
        duration: "45-60 mins",
        cost: "£35-50",
        frequency: "On-demand",
      },
    ],
  },
  Birmingham: {
    options: [
      {
        type: "Train",
        duration: "90 mins",
        cost: "£25-40",
        frequency: "Hourly",
      },
      {
        type: "Coach",
        duration: "120 mins",
        cost: "£15-25",
        frequency: "Multiple daily",
      },
    ],
  },
  Manchester: {
    options: [
      {
        type: "Train",
        duration: "180-210 mins",
        cost: "£45-75",
        frequency: "Hourly",
      },
      {
        type: "Coach",
        duration: "240 mins",
        cost: "£25-40",
        frequency: "Daily",
      },
    ],
  },
  Hatfield: {
    options: [
      {
        type: "Bus + Train",
        duration: "60-75 mins",
        cost: "£8-12",
        frequency: "Regular",
      },
      {
        type: "Note",
        details: "No direct train from Hatfield to Luton",
      },
    ],
  },
};

/**
 * Cost estimation ranges by travel style
 */
export const COST_RANGES = {
  accommodation: {
    Budget: "£30-50/night",
    Standard: "£50-80/night",
    Premium: "£80-120/night",
    Luxury: "£120+/night",
  },
  food: {
    Budget: "£15-25/person",
    Standard: "£25-45/person",
    Premium: "£45-75/person",
    Luxury: "£75+/person",
  },
};

/**
 * GDPR/Data Protection compliance settings
 */
export const COMPLIANCE = {
  gdprArticles: ["6", "13", "14", "17", "20", "21"],
  dataRetention: {
    itineraries: "7 days",
    groupData: "14 days",
    paymentRecords: "6 years",
    loyaltyData: "consent-based",
  },
  userRights: [
    "access",
    "deletion",
    "portability",
    "objection",
    "rectification",
  ],
  paymentSecurity: "Stripe/PayPal PCI-DSS certified",
  dataCollection: [
    "origin_city",
    "match_date",
    "budget",
    "number_of_people",
    "transport_preference",
  ],
  nonCollected: [
    "full_names",
    "home_addresses",
    "payment_card_details",
    "phone_numbers",
  ],
};

/**
 * Keyword detection patterns for feature activation
 * Used by frontend to determine which features to enable
 */
export const KEYWORD_PATTERNS = {
  group: /group|friends|split|invite|coordination|team|supporters|colleagues/i,
  loyalty:
    /loyalty|member|privilege|discount|vip|exclusive|ltfc_member|supporter/i,
  international:
    /international|visa|abroad|foreign|worldwide|overseas|passport|flight/i,
  powerCourt:
    /power court|stadium development|expansion|new stadium|renovation|kenilworth/i,
  realTime: /update|live|notification|alert|reminder|subscribe|calendar|sync/i,
  booking: /book|reserve|payment|split payment|installment|purchase|checkout/i,
};

/**
 * Validates that all required environment variables are set
 */
export const validateEnvironment = (): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!import.meta.env.VITE_REGION) {
    errors.push("VITE_REGION is not set");
  }
  if (!import.meta.env.VITE_PROJECT) {
    errors.push("VITE_PROJECT is not set");
  }
  if (!import.meta.env.VITE_AGENT_ID && !import.meta.env.VITE_WORKFORCE_ID) {
    errors.push("Either VITE_AGENT_ID or VITE_WORKFORCE_ID must be set");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
