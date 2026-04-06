/**
 * Date and time formatting utilities
 * Provides consistent date/time handling across the application
 */

/**
 * ISO date format (YYYY-MM-DD)
 */
export type ISODate = string & { readonly __brand: "ISODate" };

/**
 * Date in GB format (DD/MM/YYYY)
 */
export type GBDate = string & { readonly __brand: "GBDate" };

/**
 * Convert ISO date (YYYY-MM-DD) to GB format (DD/MM/YYYY)
 * @param isoDate - Date in ISO format
 * @returns Date in GB format, or empty string if invalid
 * @example
 * isoToGB("2024-12-25") // returns "25/12/2024"
 */
export function isoToGB(isoDate: string): GBDate {
	if (!isoDate || typeof isoDate !== "string") return "" as GBDate;

	const parts = isoDate.split("-");
	if (parts.length !== 3) return "" as GBDate;

	const [year, month, day] = parts;
	return `${day}/${month}/${year}` as GBDate;
}

/**
 * Convert GB format (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
 * @param gbDate - Date in GB format
 * @returns Date in ISO format, or empty string if invalid
 * @example
 * gbToISO("25/12/2024") // returns "2024-12-25"
 */
export function gbToISO(gbDate: string): ISODate {
	if (!gbDate || typeof gbDate !== "string") return "" as ISODate;

	const parts = gbDate.split("/");
	if (parts.length !== 3) return "" as ISODate;

	const [day, month, year] = parts;
	return `${year}-${month}-${day}` as ISODate;
}

/**
 * Validate if a string is a valid ISO date
 * @param dateStr - String to validate
 * @returns True if valid ISO date format
 */
export function isValidISODate(dateStr: string): boolean {
	if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

	const date = new Date(dateStr);
	return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Format time string for display
 * @param timeStr - Time in HH:MM format
 * @returns Formatted time string
 */
export function formatTimeForDisplay(timeStr: string): string {
	if (!timeStr) return "";
	return timeStr;
}

/**
 * Get current date in ISO format
 * @returns Current date in ISO format
 */
export function getCurrentISODate(): ISODate {
	return new Date().toISOString().split("T")[0] as ISODate;
}
