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
		data.groupSize > 50
	) {
		addError("groupSize", "Group size must be between 1 and 50");
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
// validated intake data — this is what agent processes
// to generate the itinerary:
export function buildIntakePrompt(data: IntakeFormDataNew): string {
	return `
    Please create a personalised match-day itinerary for a 
    Luton Town FC fan with the following details:

    MATCH DETAILS:
    - Date: ${data.matchDate}
    - Kickoff: ${data.kickoffTime}
    - Opponent: ${data.opponent}
    - Ticket type: ${data.ticketType}

    FAN PROFILE:
    - Fan story: ${data.fanType}
    - Group: ${data.groupType} (${data.groupSize} 
      ${data.groupSize === 1 ? "person" : "people"})
    - Travel modes: ${data.travelModes.join(", ")} from ${data.departureLocation}
    - Budget: £${data.budgetPerPerson.toFixed(2)} per person

    PREFERENCES:
    - Pre-match pub: ${data.prefersPubPreMatch ? "Yes" : "No"}
    - Food recommendations: ${data.prefersFood ? "Yes" : "No"}
    - Shopping areas: ${data.prefersShoppingAreas ? "Yes" : "No"}
    - Attraction sites: ${data.prefersAttractionSites ? "Yes" : "No"}
    - Location history: ${data.prefersLocationHistory ? "Yes" : "No"}
    - Parking recommendations: ${data.prefersParkingRecommendations ? "Yes" : "No"}
    - Accessibility needs: ${
			data.accessibilityNeeds.trim() !== "" ? data.accessibilityNeeds : "None"
		}
    - Additional notes: ${
			data.additionalNotes.trim() !== "" ? data.additionalNotes : "None"
		}

    Please structure the itinerary with timed slots from 
    arrival through to post-match, tailored for their fan story 
    and group composition. Come On You Hatters!
  `.trim();
}
