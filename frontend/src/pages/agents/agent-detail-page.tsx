import { currentPage } from "@/core/state";

export interface AgentCapability {
	icon: string;
	title: string;
	description: string;
	// Kept for data compatibility, but not shown in the card UI.
	tool?: string;
}

export interface AgentDetailPageProps {
	agentNumber: number;
	icon: string;
	name: string;
	subtitle: string;
	description: string;
	capabilities: AgentCapability[];
	badge?: string;
	badgeClass?: string;
}

function CapabilityCard({ icon, title, description }: AgentCapability) {
	return (
		<div class="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 bg-white dark:bg-zinc-900 flex items-start gap-3">
			<span class="text-xl shrink-0 mt-0.5" aria-hidden="true">
				{icon}
			</span>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-semibold text-zinc-900 dark:text-white mb-0.5">
					{title}
				</p>
				<p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
					{description}
				</p>
			</div>
		</div>
	);
}

export function AgentDetailPage({
	agentNumber,
	icon,
	name,
	subtitle,
	description,
	capabilities,
	badge,
	badgeClass = "bg-[#F5820D]",
}: AgentDetailPageProps) {
	return (
		<div class="max-w-3xl mx-auto px-4 py-6">
			{/* Back button */}
			<button
				type="button"
				onClick={() => {
					currentPage.value = "agents";
				}}
				class="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 mb-5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F5820D] rounded-lg px-1"
			>
				â† All Agents
			</button>

			{/* Hero card */}
			<div class="bg-linear-to-br from-[#1a1f3c] to-[#252d57] rounded-2xl p-6 mb-6 text-white">
				<div class="flex items-start gap-4 mb-4">
					<div
						class="w-14 h-14 rounded-xl bg-[#F5820D]/20 border border-[#F5820D]/30 flex items-center justify-center text-3xl shrink-0"
						aria-hidden="true"
					>
						{icon}
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 mb-1 flex-wrap">
							<span class="text-xs font-semibold text-orange-300 uppercase tracking-wider">
								Agent {agentNumber} of 12
							</span>
							{badge && (
								<span
									class={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${badgeClass}`}
								>
									{badge}
								</span>
							)}
						</div>
						<h2 class="text-xl font-bold leading-tight">{name}</h2>
						<p class="text-sm text-orange-300 mt-0.5">{subtitle}</p>
					</div>
				</div>
				<p class="text-sm text-zinc-300 leading-relaxed">{description}</p>
			</div>

			{/* Capabilities grid */}
			<h3 class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
				Capabilities
			</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
				{capabilities.map((cap, i) => (
					<CapabilityCard key={i} {...cap} />
				))}
			</div>

			{/* CTA */}
			<div class="rounded-2xl border border-[#F5820D]/30 bg-orange-50 dark:bg-orange-950/20 p-4 flex items-center justify-between flex-wrap gap-3">
				<div>
					<p class="text-sm font-semibold text-zinc-900 dark:text-white">
						Ready to plan your match day?
					</p>
					<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
						This agent activates automatically when you plan your itinerary.
					</p>
				</div>
				<button
					type="button"
					onClick={() => {
						currentPage.value = "chat";
					}}
					class="px-4 py-2 rounded-xl bg-[#F5820D] text-[#1a1f3c] font-semibold text-sm hover:bg-orange-500 active:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F5820D] focus:ring-offset-2 ex-shrink-0"
				>
					Start Planning ðŸŸï¸
				</button>
			</div>

			<p class="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-6">
				Come On You Hatters! ðŸ§¡ðŸ¤
			</p>
		</div>
	);
}
