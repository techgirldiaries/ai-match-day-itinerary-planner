import { Languages, Menu, Wifi, WifiOff } from "lucide-preact";
import { CSS_CLASSES, LANGUAGES } from "@/config/formConfig";
import {
	agent,
	connectionError,
	isSidebarOpen,
	preferredLanguage,
	workforce,
} from "@/core/state";
import { t } from "@/i18n";

/**
 * Language selector dropdown component
 * Allows users to switch between available languages
 * Signal update automatically triggers persistence via signals.ts effect
 */
function LanguageSelector() {
	return (
		<div class="relative flex items-center">
			<Languages
				size={16}
				strokeWidth={1.5}
				class="absolute left-2 text-zinc-500 dark:text-zinc-400 pointer-events-none"
				aria-hidden="true"
			/>
			<select
				value={preferredLanguage.value}
				onChange={(e) => {
					const val = (e.target as HTMLSelectElement).value;
					preferredLanguage.value = val;
				}}
				aria-label={t("selectLanguage")}
				class="pl-7 pr-2 py-1 sm:py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700
        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 
        cursor-pointer min-h-11 sm:min-h-auto"
			>
				{LANGUAGES.map((l) => (
					<option key={l.code} value={l.code}>
						{l.label}
					</option>
				))}
			</select>
		</div>
	);
}

/**
 * Network connection status indicator
 * Displays connected, connecting, or offline status with appropriate icon
 */
function NetworkIcon() {
	if (connectionError.value) {
		return (
			<span
				class="flex items-center gap-1 text-xs text-red-500 dark:text-red-400"
				title={connectionError.value}
				aria-label="Connection failed"
			>
				<WifiOff size={16} strokeWidth={1.5} aria-hidden="true" />
				<span class="hidden sm:inline">{t("offline")}</span>
			</span>
		);
	}
	if (agent.value || workforce.value) {
		return (
			<span
				class="flex items-center gap-1 text-xs text-emerald-500 dark:text-emerald-400"
				aria-label="Connected"
			>
				<Wifi size={16} strokeWidth={1.5} aria-hidden="true" />
				<span class="hidden sm:inline">{t("connected")}</span>
			</span>
		);
	}
	return (
		<span
			class="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 animate-pulse"
			aria-label="Connectingâ€¦"
		>
			<Wifi size={16} strokeWidth={1.5} aria-hidden="true" />
			<span class="hidden sm:inline">{t("connecting")}</span>
		</span>
	);
}

/**
 * Main header component with navigation and language selector
 * Sticky header with branding, menu trigger, and connection status
 */
export function Header() {
	return (
		<header class={CSS_CLASSES.header}>
			<div class="max-w-7xl mx-auto">
				<a href="#main-content" class={CSS_CLASSES.skipLink}>
					{t("skipToContent")}
				</a>

				<div class="flex flex-wrap items-center justify-between gap-x-2 sm:gap-x-3 gap-y-2">
					{/* Left: hamburger + logo + title */}
					<div class="flex items-center gap-x-2 sm:gap-x-3 min-w-0 shrink-0">
						<button
							type="button"
							class={`${CSS_CLASSES.sidebarButton} lg:hidden min-h-11 min-w-11 flex items-center justify-center`}
							onClick={() => {
								isSidebarOpen.value = true;
							}}
							aria-label="Open menu"
						>
							<Menu size={18} aria-hidden="true" />
						</button>
						<img
							src="/assets/img/logo/ltfc-badge.svg"
							alt="Luton Town FC badge"
							class="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 shrink-0 object-contain"
						/>
						<div class="flex flex-col gap-y-0.5 min-w-0">
							<h1 class="font-bold text-sm sm:text-base md:text-lg leading-tight text-[#f5820d] dark:text-orange-300 transition-colors wrap-break-word">
								<span>LTFC AI Match-Day Itinerary Planner</span>
							</h1>
							<p class="text-xs sm:text-sm md:text-base text-[#1a1f3c] dark:text-orange-200 leading-tight transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
								<span class="font-bold">Come On You Hatters! (COYH) ðŸŸ âšª</span>
							</p>
						</div>
					</div>

					{/* Right: language and connection */}
					<div class="flex items-center gap-x-1.5 sm:gap-x-3 shrink-0 justify-end">
						<LanguageSelector />
						<NetworkIcon />
					</div>
				</div>
			</div>
		</header>
	);
}
