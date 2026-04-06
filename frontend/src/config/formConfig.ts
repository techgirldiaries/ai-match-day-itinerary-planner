/**
 * Form configuration and options
 * Centralized definitions for all form-related constants
 * Simplifies maintenance and ensures consistency across components
 */

import type {
	FanType,
	InterestType,
	TransportMode,
	TravelStyle,
} from "@/core/types";

/** Available transport modes with icons and metadata */
export const TRANSPORT_OPTIONS = [
	{ value: "train" as TransportMode, emoji: "🚂", label: "Train" },
	{ value: "coach" as TransportMode, emoji: "🚌", label: "Coach" },
	{ value: "car" as TransportMode, emoji: "🚗", label: "Car" },
	{ value: "taxi" as TransportMode, emoji: "🚕", label: "Taxi" },
	{ value: "fly" as TransportMode, emoji: "✈️", label: "Fly" },
	{ value: "bus" as TransportMode, emoji: "🚌", label: "Bus" },
	{ value: "cycling" as TransportMode, emoji: "🚴", label: "Cycling" },
	{ value: "walking" as TransportMode, emoji: "🚶", label: "Walking" },
] as const;

/** User interests with icons and translation keys */
export const INTEREST_OPTIONS = [
	{ value: "pubs" as InterestType, emoji: "🍺", transKey: "pubs" },
	{ value: "shopping" as InterestType, emoji: "🛍️", transKey: "shopping" },
	{
		value: "attractions" as InterestType,
		emoji: "🎡",
		transKey: "attractions",
	},
	{ value: "history" as InterestType, emoji: "🏛️", transKey: "history" },
	{ value: "food" as InterestType, emoji: "🍽️", transKey: "food" },
] as const;

/** Travel style preferences with icons and labels */
export const TRAVEL_STYLE_OPTIONS = [
	{ value: "budget" as TravelStyle, emoji: "💰", label: "Budget" },
	{ value: "standard" as TravelStyle, emoji: "⭐", label: "Standard" },
	{ value: "premium" as TravelStyle, emoji: "✨", label: "Premium" },
	{ value: "luxury" as TravelStyle, emoji: "👑", label: "Luxury" },
] as const;

/** Fan types with display labels and translation keys */
export const FAN_TYPE_OPTIONS = [
	{
		value: "loyal_hatter" as FanType,
		label: 'The "Loyal Hatter"',
		transKey: "loyalHatter",
	},
	{
		value: "kenilworth_road_faithful" as FanType,
		label: "The Kenilworth Road Faithful",
		transKey: "kenilworthRoadFaithful",
	},
	{
		value: "supporters_trust_owner" as FanType,
		label: "The Supporters' Trust/Owner Supporters",
		transKey: "supportersTrustOwner",
	},
	{
		value: "international_modern" as FanType,
		label: "International/Modern Hatters",
		transKey: "internationalModernHatters",
	},
	{
		value: "away_day_specialists" as FanType,
		label: "The Away Day Specialists (Bobbers Travel Club)",
		transKey: "awayDaySpecialistsBobbers",
	},
	{
		value: "multicultural_town" as FanType,
		label: "Multicultural Town Supporters",
		transKey: "multiculturalTownSupporters",
	},
	{
		value: "men_in_gear" as FanType,
		label: "Men in Gear (MIGs)",
		transKey: "menInGearMIGs",
	},
	{
		value: "other" as FanType,
		label: "Other",
		transKey: "otherFanType",
	},
] as const;

/** Accessibility needs with icons and translation keys */
export const ACCESSIBILITY_OPTIONS = [
	{
		value: "wheelchair_access",
		emoji: "♿",
		transKey: "wheelchairAccess",
		label: "Wheelchair Access",
	},
	{
		value: "lift_required",
		emoji: "🛗",
		transKey: "liftRequired",
		label: "Lift Required",
	},
	{
		value: "companion_support",
		emoji: "👥",
		transKey: "companionSupport",
		label: "Companion Support",
	},
	{
		value: "other",
		emoji: "❓",
		transKey: "accessibilityOther",
		label: "Other",
	},
	{
		value: "none",
		emoji: "❓",
		transKey: "accessibilityNone",
		label: "None",
	},
] as const;

/** Available languages with native names */
export const LANGUAGES = [
	{ code: "en", label: "English" },
	{ code: "es", label: "Español" },
	{ code: "fr", label: "Français" },
	{ code: "pl", label: "Polski" },
	{ code: "ar", label: "العربية" },
	{ code: "bn", label: "বাংলা" },
	{ code: "pt", label: "Português" },
	{ code: "de", label: "Deutsch" },
	{ code: "it", label: "Italiano" },
	{ code: "hi", label: "हिन्दी" },
	{ code: "zh", label: "中文(简体)" },
] as const;

/** Layout and styling constants */
export const CSS_CLASSES = {
	header:
		"px-3 sm:px-4 py-2 sm:py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 bg-white dark:bg-gray-900 transition-colors",
	skipLink:
		"sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:font-semibold focus:rounded-lg",
	sidebarButton:
		"p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500",
	focusRing: "focus:outline-none focus:ring-2 focus:ring-orange-500",
	primaryButton:
		"px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors",
	avatarFallback:
		"size-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold",
	messageRowContainer:
		"flex items-start gap-x-2 pr-12 md:pr-0 md:max-w-4/6 self-start",
	failedMessageBubble:
		"py-3 px-4 rounded-3xl rounded-tl-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800",
	messageBubble:
		"py-3 px-4 rounded-3xl rounded-tl-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors w-full overflow-hidden",
	retryButton:
		"text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1",
	// Form-specific styles
	formCard:
		"w-full box-border mb-2 sm:mb-3 md:mb-5 border border-gray-300 dark:border-gray-700 rounded-2xl p-3 sm:p-4 md:p-5 bg-white dark:bg-transparent",
	formLegend:
		"text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 px-1",
	formLabel:
		"block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
	inputBase:
		"w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:focus:ring-offset-gray-950",
	inputBorder: "border-gray-300 dark:border-gray-700",
	inputError: "border-red-500 dark:border-red-500",
	helpText: "mt-1 text-xs text-gray-600 dark:text-gray-400",
	errorText:
		"mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1",
	submitButton:
		"w-full py-3 sm:py-3.5 px-6 rounded-2xl font-semibold text-sm sm:text-base bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 dark:focus:ring-offset-gray-950 flex items-center justify-center gap-2",
	spinner:
		"inline-block w-3 sm:w-4 h-3 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin",
	transportOption:
		"flex items-center gap-1.5 px-3 py-2 rounded-xl border cursor-pointer transition-colors select-none text-sm font-medium",
	transportOptionSelected:
		"border-orange-500 bg-orange-950/30 text-gray-900 dark:text-white",
	transportOptionUnselected:
		"border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600",
	switchContainer:
		"relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950",
	switchOn: "bg-orange-500",
	switchOff: "bg-gray-400 dark:bg-gray-600",
	switchThumb:
		"pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
	switchThumbOn: "translate-x-5",
	switchThumbOff: "translate-x-0",
} as const;

/** Brand colors and theme values */
export const THEME = {
	primary: "#F5820D",
	primaryDark: "#e07500",
	dark: "#1a1f3c",
	light: "#ffffff",
} as const;

/** Session and storage keys */
export const STORAGE_KEYS = {
	sessionMessages: "ltfc-session-messages",
	darkMode: "darkMode",
	preferredLanguage: "preferredLanguage",
} as const;

/** API and timeout constants */
export const API_DEFAULTS = {
	agentOperationTimeoutMs: 30000,
	messageStorageLimit: 100,
} as const;
