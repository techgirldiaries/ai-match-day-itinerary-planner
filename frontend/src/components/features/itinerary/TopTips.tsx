export function TopTips({ tips }: { tips: string[] }) {
	return (
		<div class="mb-4">
			<h4 class="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
				Top tips
			</h4>
			<ol class="space-y-2" aria-label="Top tips for your match day">
				{tips.map((tip, idx) => (
					<li key={tip.slice(0, 40)} class="flex items-start gap-3">
						<span
							class="shrink-0 w-6 h-6 rounded-full bg-[#F5820D] text-[#1a1f3c] text-xs font-bold flex items-center justify-center mt-0.5"
							aria-hidden="true"
						>
							{idx + 1}
						</span>
						<p class="text-sm text-zinc-800 dark:text-zinc-200">{tip}</p>
					</li>
				))}
			</ol>
		</div>
	);
}
