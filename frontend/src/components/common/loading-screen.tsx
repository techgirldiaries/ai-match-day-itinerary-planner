import { t } from "@/i18n";

export function LoadingScreen() {
	return (
		<div
			class="flex flex-col items-center justify-center min-h-dvh bg-zinc-100 dark:bg-zinc-950 transition-colors"
			role="status"
			aria-label="Connecting to planning agents"
		>
			<div class="text-5xl mb-4" aria-hidden="true">
				🏟️
			</div>
			<h1 class="text-xl font-bold text-zinc-900 dark:text-white mb-1">
				{t("appName")}
			</h1>
			<p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
				{t("connectingAgents")}
			</p>
			<div class="flex" aria-hidden="true">
				<span class="typing-dot text-[#F5820D] text-2xl">•</span>
				<span class="typing-dot typing-dot-delay-1 text-[#F5820D] text-2xl">
					•
				</span>
				<span class="typing-dot typing-dot-delay-2 text-[#F5820D] text-2xl">
					•
				</span>
			</div>
		</div>
	);
}
