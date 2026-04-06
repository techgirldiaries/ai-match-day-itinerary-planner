import type { CostBreakdown } from "@/core/types";

const SECTION_TITLE_CLASS =
	"text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3";

export function CostBreakdownSection({ data }: { data: CostBreakdown }) {
	const items = data.items ?? [];
	const currency = data.currency ?? "£";
	if (items.length === 0 && data.total == null) return null;

	return (
		<div class="mb-4">
			<h4 class={SECTION_TITLE_CLASS}>
				Cost breakdown{data.per_person ? " (per person)" : ""}
			</h4>
			<table
				class="w-full text-sm rounded-xl overflow-hidden"
				aria-label={`Cost breakdown${data.per_person ? " per person" : ""}`}
			>
				<tbody>
					{items.map((item) => (
						<tr
							key={item.label}
							class={
								items.indexOf(item) % 2 === 0
									? "bg-zinc-50 dark:bg-zinc-800/50"
									: "bg-white dark:bg-zinc-900"
							}
						>
							<th
								scope="row"
								class="py-1.5 px-3 text-left font-normal text-zinc-700 dark:text-zinc-300"
							>
								{item.label}
							</th>
							<td class="py-1.5 px-3 text-right font-medium text-zinc-900 dark:text-white">
								{item.currency ?? currency}
								{item.amount}
							</td>
						</tr>
					))}
					{data.total != null && (
						<tr class="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
							<th
								scope="row"
								class="py-2 px-3 text-left font-semibold text-zinc-900 dark:text-white"
							>
								Total
							</th>
							<td class="py-2 px-3 text-right font-bold text-[#F5820D]">
								{currency}
								{data.total}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
