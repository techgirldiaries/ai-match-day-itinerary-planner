export function CommunityNote({ note }: { note: string }) {
	return (
		<div
			class="rounded-xl border-l-4 border-[#F5820D] bg-orange-50 dark:bg-orange-950/20 px-4 py-3 mb-4"
			role="note"
			aria-label="Community tip from fellow Hatters"
		>
			<p class="text-xs font-semibold text-[#F5820D] mb-1 uppercase tracking-wider">
				🟠 Hatters community tip
			</p>
			<p class="text-sm text-zinc-800 dark:text-zinc-200">{note}</p>
		</div>
	);
}
