import { type AppPage, currentPage } from "@/core/state";

interface AgentCard {
	page?: AppPage;
	number: number;
	icon: string;
	name: string;
	role: string;
	description: string;
	isNew?: boolean;
}

const AGENTS: AgentCard[] = [
	{
		number: 1,
		icon: "ðŸŽ¯",
		name: "Orchestrator",
		role: "Central coordinator",
		description:
			"Personalised planning, booking coordination and loyalty integration. The brain behind your complete match-day itinerary.",
	},
	{
		number: 2,
		icon: "ðŸ“‹",
		name: "Match Info Agent",
		role: "Fixture details & updates",
		description:
			"Home/away fixture information, Power Court stadium updates, real-time match changes and ticket availability.",
	},
	{
		number: 3,
		icon: "ðŸš‚",
		name: "Travel Agent",
		role: "Multi-modal transport planning",
		description:
			"UK domestic and international transport options, booking integration, group travel and split-ticket savings.",
	},
	{
		number: 4,
		icon: "ðŸº",
		name: "Food & Venues Agent",
		role: "Pubs, restaurants & attractions",
		description:
			"Fan-friendly pubs, restaurants, shopping and local attractions â€” both at Kenilworth Road and away grounds.",
	},
	{
		number: 5,
		icon: "ðŸ¨",
		name: "Accommodation Agent",
		role: "Hotels, flights & bookings",
		description:
			"Budget to luxury accommodation, direct booking links, group rooms and international flight options.",
	},
	{
		number: 6,
		icon: "ðŸ‘¥",
		name: "Community Agent",
		role: "Group coordination & support",
		description:
			"Fan matching, cost-splitting, group coordination, international supporter help and loyalty programme integration.",
	},
	{
		page: "heritage",
		number: 7,
		icon: "ðŸ›ï¸",
		name: "Heritage & Storytelling",
		role: "Fan narratives & history",
		description:
			"Personalised fan journey narratives, LTFC historical context, legacy tracking and heritage tour recommendations.",
		isNew: true,
	},
	{
		page: "fantasy",
		number: 8,
		icon: "âš½",
		name: "Fantasy & Prediction",
		role: "Predictions & gamification",
		description:
			"AI match predictions, fantasy lineups, betting insights, prediction competitions and tactical scenario modelling.",
		isNew: true,
	},
	{
		page: "social",
		number: 9,
		icon: "ðŸ¤",
		name: "Social Impact",
		role: "Charity & community initiatives",
		description:
			"Match-day charity collections, community volunteering, food bank coordination and fan mentorship programmes.",
		isNew: true,
	},
	{
		page: "bi",
		number: 10,
		icon: "ðŸ“Š",
		name: "Business Intelligence",
		role: "Analytics & optimisation",
		description:
			"Fan analytics, revenue optimisation, predictive attendance modelling and matchday performance reporting.",
		isNew: true,
	},
	{
		page: "youth",
		number: 11,
		icon: "ðŸ‘¦",
		name: "Youth Development",
		role: "Junior fans & families",
		description:
			"Junior fan programmes, educational football content, family matchday planning and school outreach initiatives.",
		isNew: true,
	},
	{
		page: "weather",
		number: 12,
		icon: "â˜ï¸",
		name: "Weather Agent",
		role: "Forecasts & travel impact",
		description:
			"Match-day forecasts, real-time conditions, travel impact analysis, clothing recommendations and weather alerts.",
		isNew: true,
	},
];

function AgentGridCard({
	page,
	number,
	icon,
	name,
	role,
	description,
	isNew,
}: AgentCard) {
	const clickable = Boolean(page);

	const cardClass = [
		"border rounded-2xl p-4 transition-colors",
		clickable
			? "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#F5820D] hover:shadow-sm cursor-pointer"
			: "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50",
	].join(" ");

	const content = (
		<>
			<div class="flex items-start gap-3 mb-2">
				<span class="text-2xl shrink-0 mt-0.5" aria-hidden="true">
					{icon}
				</span>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 flex-wrap mb-0.5">
						<span class="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
							#{number}
						</span>
						{isNew && (
							<span class="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-[#F5820D] text-[#1a1f3c]">
								NEW
							</span>
						)}
					</div>
					<p class="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
						{name}
					</p>
					<p class="text-xs text-[#F5820D] font-medium mt-0.5">{role}</p>
				</div>
			</div>
			<p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
				{description}
			</p>
			{clickable && (
				<p class="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-2">
					View details â†’
				</p>
			)}
		</>
	);

	if (clickable && page) {
		return (
			<button
				type="button"
				onClick={() => {
					currentPage.value = page;
				}}
				class={`${cardClass} text-left w-full focus:outline-none focus:ring-2 focus:ring-[#F5820D] focus:ring-offset-1`}
				aria-label={`View ${name} agent details`}
			>
				{content}
			</button>
		);
	}

	return <div class={cardClass}>{content}</div>;
}

export function AgentsOverviewPage() {
	return (
		<div class="max-w-3xl mx-auto px-4 py-6">
			{/* Header */}
			<div class="mb-6">
				<div class="flex items-center gap-3 mb-2">
					<div
						class="w-12 h-12 rounded-xl bg-[#1a1f3c] flex items-center justify-center text-2xl"
						aria-hidden="true"
					>
						ðŸ¤–
					</div>
					<div>
						<h2 class="text-xl font-bold text-zinc-900 dark:text-white">
							Your 12-Agent Team
						</h2>
						<p class="text-sm text-[#F5820D] font-medium">
							Enhanced System Architecture v3.0
						</p>
					</div>
				</div>
				<p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
					Every itinerary is powered by a coordinated team of specialist agents
					working together. The first 6 are core agents active on every plan.
					Agents 7â€“12 are new v3.0 capabilities, tap any card to explore their
					features.
				</p>
			</div>

			{/* Core agents label */}
			<div class="flex items-center gap-2 mb-3">
				<span class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
					Core Agents (1â€“6)
				</span>
				<div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
				{AGENTS.filter((a) => a.number <= 6).map((agent) => (
					<AgentGridCard key={agent.number} {...agent} />
				))}
			</div>

			{/* New agents v3.0 label */}
			<div class="flex items-center gap-2 mb-3">
				<span class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
					New Agents v3.0 (7â€“12)
				</span>
				<div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
				<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5820D] text-[#1a1f3c]">
					NEW
				</span>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
				{AGENTS.filter((a) => a.number > 6).map((agent) => (
					<AgentGridCard key={agent.number} {...agent} />
				))}
			</div>

			{/* CTA */}
			<div class="rounded-2xl border border-[#F5820D]/30 bg-orange-50 dark:bg-orange-950/20 p-4 flex items-center justify-between flex-wrap gap-3">
				<div>
					<p class="text-sm font-semibold text-zinc-900 dark:text-white">
						All 12 agents ready!
					</p>
					<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
						Start planning your next LTFC match day.
					</p>
				</div>
				<button
					type="button"
					onClick={() => {
						currentPage.value = "chat";
					}}
					class="px-4 py-2 rounded-xl bg-[#F5820D] text-[#1a1f3c] font-semibold text-sm hover:bg-orange-500 active:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F5820D] focus:ring-offset-2 shrink-0"
				>
					Plan My Match Day ðŸ§¡
				</button>
			</div>

			<p class="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-6">
				Come On You Hatters! ðŸ§¡ðŸ¤
			</p>
		</div>
	);
}
