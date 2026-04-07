import type {
  IntakeFieldKey,
  IntakeFormDataNew,
  IntakeValidationError,
  IntakeValidationResult,
} from "./types";

export function validateIntakeForm(
  data: Partial<IntakeFormDataNew>,
): IntakeValidationResult {
  const errors: IntakeValidationError[] = [];

  const addError = (field: IntakeFieldKey, message: string): void => {
    errors.push({ field, message });
  };

  // Match date — required, must not be in the past:
  if (data.matchDate === undefined || data.matchDate.trim() === "") {
    addError("matchDate", "Match date is required");
  } else if (new Date(data.matchDate) < new Date()) {
    addError("matchDate", "Match date cannot be in the past");
  }

  // Kickoff time — required, HH:MM format:
  if (
    data.kickoffTime === undefined ||
    !/^\d{2}:\d{2}$/.test(data.kickoffTime)
  ) {
    addError("kickoffTime", "Valid kickoff time required (HH:MM)");
  }

  // Opponent — required:
  if (data.opponent === undefined || data.opponent.trim() === "") {
    addError("opponent", "Opponent name is required");
  }

  // Ticket type — required, must be valid union member:
  const validTicketTypes = [
    "home",
    "away",
    "neutral",
    "watching-elsewhere",
  ] as const;
  if (
    data.ticketType === undefined ||
    !validTicketTypes.includes(data.ticketType)
  ) {
    addError("ticketType", "Please select a ticket type");
  }

  // Fan type — required, must be valid union member:
  const validFanTypes = [
    "loyal-hatter",
    "heritage-fan",
    "international-supporter",
    "returning-fan",
    "family-tradition",
    "first-time",
    "corporate-hospitality",
    "other",
  ] as const;
  if (
    data.fanType === undefined ||
    !validFanTypes.includes(data.fanType as never)
  ) {
    addError("fanType", "Please tell us your fan story");
  }

  // Group type — required, must be valid union member:
  const validGroupTypes = [
    "solo",
    "couple",
    "solo-senior",
    "couple-senior",
    "family-with-kids",
    "family-mixed-ages",
    "group-of-friends",
    "group-mixed-ages",
    "corporate",
    "community-group",
    "school-group",
  ] as const;
  if (
    data.groupType === undefined ||
    !validGroupTypes.includes(data.groupType)
  ) {
    addError("groupType", "Please select a group type");
  }

  // Group size — min 1, max 50:
  if (
    data.groupSize === undefined ||
    data.groupSize < 1 ||
    data.groupSize > 20
  ) {
    addError("groupSize", "Group size must be between 1 and 20");
  }

  // Travel mode — required:
  const validTravelModes = [
    "car",
    "train",
    "bus",
    "coach",
    "taxi",
    "flight",
    "walking",
    "cycling",
    "other",
  ] as const;
  if (
    data.travelModes === undefined ||
    data.travelModes.length === 0 ||
    !data.travelModes.every((mode) => validTravelModes.includes(mode))
  ) {
    addError("travelModes", "Please select at least one travel mode");
  }

  // Departure location — required:
  if (
    data.departureLocation === undefined ||
    data.departureLocation.trim() === ""
  ) {
    addError("departureLocation", "Departure location is required");
  }

  // Budget — min 0:
  if (data.budgetPerPerson === undefined || data.budgetPerPerson < 0) {
    addError("budgetPerPerson", "Budget must be 0 or more");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Build the initial prompt string sent to agent from
// validated intake data — OPTIMISED for speed and reduced API errors
// Uses performance-optimized hybrid architecture: 15-20 seconds max
export function buildIntakePrompt(data: IntakeFormDataNew): string {
  const preferences: string[] = [];

  // Only include enabled preferences to reduce prompt size
  if (data.prefersPubPreMatch) preferences.push("Pre-match pub");
  if (data.prefersFood) preferences.push("Food recommendations");
  if (data.prefersShoppingAreas) preferences.push("Shopping areas");
  if (data.prefersAttractionSites) preferences.push("Attraction history");
  if (data.prefersLocationHistory) preferences.push("Location history");
  if (data.prefersParkingRecommendations) preferences.push("Parking");

  const accessibilityText = data.accessibilityNeeds?.trim()
    ? `Accessibility: ${data.accessibilityNeeds}`
    : "";

  const preferencesText =
    preferences.length > 0 ? `Preferences: ${preferences.join(", ")}` : "";

  return `
Generate quick match-day itinerary for Luton Town FC fan. PRIORITY: Speed & accuracy.

MATCH: ${data.matchDate} at ${data.kickoffTime} vs ${data.opponent} (${data.ticketType})
TRAVELLERS: ${data.groupSize} ${data.groupType} from ${data.departureLocation}
BUDGET: £${data.budgetPerPerson.toFixed(2)}/person | Fan type: ${data.fanType}
TRAVEL: ${data.travelModes.join(", ")}
${preferencesText}${accessibilityText ? "\n" + accessibilityText : ""}

ESSENTIAL OUTPUT (15-20 seconds):
1. Match confirmation (date, time, opponent, venue)
2. Top 3 routes: Budget/Fast/Convenient (with costs & times)
3. 2 venue picks (pubs/food near Kenilworth Stadium Road or for away matches in nearby areas)
4. Total cost breakdown per person
5. Key timings (depart → arrive → kickoff → return)

Use cached data for common UK routes. Optimize for speed first.
`.trim();
}
