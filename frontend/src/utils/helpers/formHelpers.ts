/**
 * Utility functions for working with form data and mappings
 * Provides type-safe methods to retrieve and transform form options
 */

import {
	ACCESSIBILITY_OPTIONS,
	FAN_TYPE_OPTIONS,
	INTEREST_OPTIONS,
	TRANSPORT_OPTIONS,
	TRAVEL_STYLE_OPTIONS,
} from "@/config/formConfig";
import type { FanType, TravelStyle } from "@/core/types";

/**
 * Get the display label for a fan type value
 * @param fanType - The fan type value to look up
 * @returns The display label, or the value itself if not found
 */
export function getFanTypeLabel(fanType: FanType): string {
	return (
		FAN_TYPE_OPTIONS.find((opt) => opt.value === fanType)?.label ?? fanType
	);
}

/**
 * Get the translation key for a fan type value
 * @param fanType - The fan type value to look up
 * @returns The translation key
 */
export function getFanTypeTransKey(fanType: FanType): string {
	return FAN_TYPE_OPTIONS.find((opt) => opt.value === fanType)?.transKey ?? "";
}

/**
 * Get the display label for a travel style value
 * @param style - The travel style value to look up
 * @returns The display label, or the value itself if not found
 */
export function getTravelStyleLabel(style: TravelStyle): string {
	return (
		TRAVEL_STYLE_OPTIONS.find((opt) => opt.value === style)?.label ?? style
	);
}

/**
 * Get the emoji for a travel style value
 * @param style - The travel style value to look up
 * @returns The emoji, or empty string if not found
 */
export function getTravelStyleEmoji(style: TravelStyle): string {
	return TRAVEL_STYLE_OPTIONS.find((opt) => opt.value === style)?.emoji ?? "";
}

/**
 * Get all transport option emojis mapped by value
 * @returns Object mapping transport mode values to emojis
 */
export function getTransportEmojiMap(): Record<string, string> {
	return Object.fromEntries(
		TRANSPORT_OPTIONS.map((opt) => [opt.value, opt.emoji]),
	);
}

/**
 * Get all interest option translation keys mapped by value
 * @returns Object mapping interest type values to trans keys
 */
export function getInterestTransKeyMap(): Record<string, string> {
	return Object.fromEntries(
		INTEREST_OPTIONS.map((opt) => [opt.value, opt.transKey]),
	);
}

/**
 * Get all accessibility option translation keys mapped by value
 * @returns Object mapping accessibility values to trans keys
 */
export function getAccessibilityTransKeyMap(): Record<string, string> {
	return Object.fromEntries(
		ACCESSIBILITY_OPTIONS.map((opt) => [opt.value, opt.transKey]),
	);
}

/**
 * Check if a transport mode is valid
 * @param mode - The mode to check
 * @returns True if the mode is valid
 */
export function isValidTransportMode(mode: string): boolean {
	return TRANSPORT_OPTIONS.some((opt) => opt.value === mode);
}

/**
 * Check if multiple transport modes are valid
 * @param modes - Array of modes to check
 * @returns True if all modes are valid
 */
export function areValidTransportModes(modes: string[]): boolean {
	return modes.every(isValidTransportMode);
}
