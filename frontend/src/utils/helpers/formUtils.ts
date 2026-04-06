/**
 * Reusable form utility functions
 * Reduces duplication and improves maintainability
 */

/**
 * Toggle an item in an array
 * @param item - Item to toggle
 * @param array - Current array
 * @returns Updated array with item toggled
 */
export function toggleArrayItem<T>(item: T, array: T[]): T[] {
	return array.includes(item)
		? array.filter((i) => i !== item)
		: [...array, item];
}

/**
 * Sanitize user input by removing potentially harmful characters
 * @param input - Raw user input
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
	return input
		.trim()
		.replace(/[<>]/g, "") // Remove angle brackets
		.slice(0, 500); // Limit length to prevent DoS
}

/**
 * Validate city name format
 * @param city - City name to validate
 * @returns true if valid
 */
export function isValidCity(city: string): boolean {
	const cityRegex = /^[a-zA-Z\s\-']{2,50}$/;
	return cityRegex.test(city.trim());
}

/**
 * Form input constraints
 */
export const FORM_CONSTRAINTS = {
	groupSize: { min: 1, max: 50 },
	budget: { min: 10, max: 2000, step: 10 },
	preferencesMaxLength: 500,
	cityMaxLength: 50,
} as const;
