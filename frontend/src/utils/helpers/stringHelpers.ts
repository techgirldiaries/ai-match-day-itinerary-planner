/**
 * string formatting and manipulation utilities
 * Handles common string operations like case conversion and truncation
 */

/**
 * Safely truncate a string to a maximum length
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add if truncated (default: "...")
 * @returns Truncated string
 * @example
 * truncate("Hello World", 8) // returns "Hello..."
 */
export function truncate(
	str: string,
	maxLength: number,
	suffix: string = "...",
): string {
	if (!str || str.length <= maxLength) return str;
	return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert string to title case
 * @param str - String to convert
 * @returns Title cased string
 * @example
 * toTitleCase("hello world") // returns "Hello World"
 */
export function toTitleCase(str: string): string {
	if (!str) return "";
	return str
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Join array items with commas and 'and' for the last item
 * @param items - Items to join
 * @param conjunction - Word to use before last item (default: "and")
 * @returns Formatted string
 * @example
 * joinWithConjunction(["apples", "oranges", "bananas"])
 * // returns "apples, oranges, and bananas"
 */
export function joinWithConjunction(
	items: string[],
	conjunction: string = "and",
): string {
	if (!items.length) return "";
	if (items.length === 1) return items[0];
	if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
	return `${items.slice(0, -1).join(", ")}, ${conjunction} ${items[items.length - 1]}`;
}

/**
 * Pluralise a word based on count
 * @param word - Word to pluralise
 * @param count - Count to determine singular/plural
 * @param plural - Custom plural form (optional)
 * @returns Singular or plural form
 * @example
 * pluralise("person", 1) // returns "person"
 * pluralise("person", 2, "people") // returns "people"
 */
export function pluralise(
	word: string,
	count: number,
	plural?: string,
): string {
	if (count === 1) return word;
	return plural || `${word}s`;
}

/**
 * Remove extra whitespace from string
 * @param str - String to clean
 * @returns Cleaned string
 */
export function cleanWhitespace(str: string): string {
	return str.replace(/\s+/g, " ").trim();
}

/**
 * Check if a string is empty or contains only whitespace
 * @param str - String to check
 * @returns True if empty or whitespace only
 */
export function isEmpty(str: string): boolean {
	return !str || cleanWhitespace(str).length === 0;
}
