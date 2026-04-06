import { AlertTriangle, Clock, MapPin } from "lucide-preact";
import type { TimelineEntry } from "@/core/types";

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
	return (
		<div class="mb-4">
			<h4 class="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
				Your itinerary
			</h4>
			<ol aria-label="Match day timeline" class="space-y-0">
				{entries.map((entry, i) => (
					<li
						key={`${entry.time}-${entry.activity.slice(0, 20)}`}
						class="relative flex gap-3 pb-4 last:pb-0"
					>
						{/* Connector line */}
						{i < entries.length - 1 && (
							<div
								class="absolute left-2.75 top-6 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-700"
								aria-hidden="true"
							/>
						)}
						{/* Dot */}
						<div
							class="relative mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-[#F5820D]"
							aria-hidden="true"
						>
							<Clock size={12} class="text-white" />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<p class="text-sm font-semibold text-zinc-900 dark:text-white">
									{entry.time}
								</p>
								{entry.confidence === "low" && (
									<span
										class="confidence-badge"
										role="img"
										aria-label="Low confidence — please verify"
									>
										<AlertTriangle size={10} aria-hidden="true" />
										Verify
									</span>
								)}
							</div>
							<p class="text-sm text-zinc-800 dark:text-zinc-200 mt-0.5">
								{entry.activity}
							</p>
							{entry.location && (
								<p class="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
									<MapPin size={10} aria-hidden="true" />
									{entry.location}
								</p>
							)}
							{entry.notes && (
								<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 italic">
									{entry.notes}
								</p>
							)}
						</div>
					</li>
				))}
			</ol>
		</div>
	);
}
