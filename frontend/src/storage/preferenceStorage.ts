/**
 * User preference storage and persistence
 * Handles dark mode, language, and other user preference storage
 */

import { STORAGE_KEYS } from "@/config/formConfig";

/**
 * Get the user's dark mode preference from storage
 * @returns True if dark mode is enabled, false otherwise
 */
export function getDarkModePreference(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.darkMode);
    if (stored === null) return false; // Default to light mode

    return JSON.parse(stored);
  } catch (error) {
    console.error(
      `Failed to load dark mode preference: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return false;
  }
}

/**
 * Save the user's dark mode preference to storage
 * @param isDark - Whether dark mode is enabled
 */
export function setDarkModePreference(isDark: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.darkMode, JSON.stringify(isDark));
  } catch (error) {
    console.error(
      `Failed to save dark mode preference: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get the user's preferred language from storage
 * @returns Language code (e.g., "en", "es", "fr"), defaults to "en"
 */
export function getLanguagePreference(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.preferredLanguage);
    if (!stored) return "en"; // Default to English

    // Validate that stored language is a string
    if (typeof stored !== "string") return "en";

    return stored;
  } catch (error) {
    console.error(
      `Failed to load language preference: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return "en";
  }
}

/**
 * Save the user's preferred language to storage
 * @param languageCode - Language code to save (e.g., "en", "es", "fr")
 */
export function setLanguagePreference(languageCode: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.preferredLanguage, languageCode);
  } catch (error) {
    console.error(
      `Failed to save language preference: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Clear all stored preferences from localStorage
 */
export function clearAllPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.darkMode);
    localStorage.removeItem(STORAGE_KEYS.preferredLanguage);
  } catch (error) {
    console.error(
      `Failed to clear preferences: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
