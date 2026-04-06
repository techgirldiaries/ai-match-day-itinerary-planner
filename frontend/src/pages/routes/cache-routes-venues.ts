/**
 * Route & Venue Cache
 * Pre-computed data to avoid repeated API calls and speed up agent responses
 */

export interface Route {
	origin: string;
	destination: string;
	options: {
		name: string;
		modes: string[];
		duration: string;
		cost: string;
		notes: string;
	}[];
}

export interface Venue {
	name: string;
	category: "pub" | "restaurant" | "accommodation" | "shopping";
	address: string;
	description: string;
	openingHours?: string;
	website?: string;
}

// Pre-computed common routes to Luton
export const COMMON_ROUTES: Route[] = [
	{
		origin: "London",
		destination: "Luton (Kenilworth Stadium)",
		options: [
			{
				name: "Thameslink Rail",
				modes: ["Train"],
				duration: "30 mins",
				cost: "£15-25",
				notes:
					"Direct from King's Cross/St Pancras. Multiple departures per hour.",
			},
			{
				name: "National Express Bus",
				modes: ["Bus"],
				duration: "60-90 mins",
				cost: "£8-15",
				notes: "Slower but affordable. From central London.",
			},
			{
				name: "Taxi/Rideshare",
				modes: ["Taxi"],
				duration: "45-60 mins",
				cost: "£35-50",
				notes: "Direct door-to-door. Traffic dependent.",
			},
		],
	},
	{
		origin: "Birmingham",
		destination: "Luton (Kenilworth Stadium)",
		options: [
			{
				name: "West Midlands to Thameslink",
				modes: ["Train"],
				duration: "90 mins",
				cost: "£25-40",
				notes: "Train to Luton via London rail network.",
			},
			{
				name: "Coach Service",
				modes: ["Coach"],
				duration: "120 mins",
				cost: "£15-25",
				notes:
					"National Express or similar. Direct routes available on match days.",
			},
		],
	},
	{
		origin: "Manchester",
		destination: "Luton (Kenilworth Stadium)",
		options: [
			{
				name: "Train via London",
				modes: ["Train"],
				duration: "180-210 mins",
				cost: "£45-75",
				notes: "Manchester to London + Thameslink to Luton.",
			},
			{
				name: "Coach Service",
				modes: ["Coach"],
				duration: "240 mins",
				cost: "£25-40",
				notes: "Direct coach services available.",
			},
		],
	},
	{
		origin: "Hatfield",
		destination: "Luton (Kenilworth Stadium)",
		options: [
			{
				name: "Multi-modal via St Albans",
				modes: ["Bus", "Train"],
				duration: "60-75 mins",
				cost: "£8-12",
				notes:
					"Bus 724 to St Albans, then Thameslink to Luton. NO direct train exists.",
			},
		],
	},
];

// Pre-computed venues near stadium
export const STADIUM_VENUES: Venue[] = [
	{
		name: "Bricklayers Arms",
		category: "pub",
		address: "High Town Road, Luton",
		description: "Traditional LTFC fan pub, warm welcome for all supporters.",
		openingHours: "11am-11pm",
	},
	{
		name: "Painters Arms",
		category: "pub",
		address: "Dunstable Road, Luton",
		description: "Local pub with TV screens, match-day atmosphere.",
		openingHours: "11am-11pm",
	},
	{
		name: "Two Brewers",
		category: "pub",
		address: "Near Kenilworth Stadium",
		description: "Close to stadium, mix of home and away fans.",
		openingHours: "10am-11pm",
	},
	{
		name: "LTFC Official Club Shop",
		category: "shopping",
		address: "Unit 55, The Point, Luton, LU1 2TL",
		description: "Official merchandise, match-day souvenirs, club memorabilia.",
	},
];

// Accommodation price ranges by travel_style
export const ACCOMMODATION_RANGES = {
	Budget: "£40-60 per night",
	Standard: "£60-100 per night",
	Premium: "£100-150 per night",
	Luxury: "£150+ per night",
};

// Estimated food costs
export const FOOD_COSTS = {
	Budget: "£10-15 per person",
	Standard: "£15-25 per person",
	Premium: "£25-40 per person",
	Luxury: "£40+ per person",
};

/**
 * Get cached route data or return null if not in cache
 * Avoids API calls for common routes
 */
export function getCachedRoute(
	origin: string,
	destination: string,
): Route | null {
	return (
		COMMON_ROUTES.find(
			(r) =>
				r.origin.toLowerCase().includes(origin.toLowerCase()) &&
				r.destination.toLowerCase().includes(destination.toLowerCase()),
		) || null
	);
}

/**
 * Get all stadium venues by category
 */
export function getVenuesByCategory(category: Venue["category"]): Venue[] {
	return STADIUM_VENUES.filter((v) => v.category === category);
}

/**
 * Quick cost estimate based on style
 */
export function estimateCost(params: {
	travelCost: number;
	accommodation: boolean;
	travelStyle: "Budget" | "Standard" | "Premium" | "Luxury";
	numPeople: number;
}): { breakdown: Record<string, number>; total: number } {
	const { travelCost, accommodation, travelStyle, numPeople } = params;

	let accomCost = 0;
	if (accommodation) {
		const ranges: Record<string, number> = {
			Budget: 50,
			Standard: 80,
			Premium: 125,
			Luxury: 150,
		};
		accomCost = ranges[travelStyle] || 80;
	}

	const foodRanges: Record<string, number> = {
		Budget: 12,
		Standard: 20,
		Premium: 32,
		Luxury: 50,
	};
	const foodCost = foodRanges[travelStyle] || 20;

	const perPersonCost = travelCost + accomCost + foodCost;
	const totalCost = perPersonCost * numPeople;

	return {
		breakdown: {
			transport: travelCost * numPeople,
			accommodation: accomCost * numPeople,
			food: foodCost * numPeople,
		},
		total: totalCost,
	};
}
