import { ExternalLink } from "lucide-preact";
import type { BookingLink } from "@/core/types";

const BOOKING_LINK_CLASS =
	"inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a1f3c] text-white text-sm font-medium hover:bg-[#252d57] active:bg-[#131828] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F5820D] focus:ring-offset-2";

export function BookingLinks({ links }: { links: BookingLink[] }) {
	return (
		<div class="mb-2">
			<h4 class="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
				Book now
			</h4>
			<ul class="flex flex-wrap gap-2" aria-label="Booking links">
				{links.map((link) => (
					<li key={link.url}>
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class={BOOKING_LINK_CLASS}
						>
							{link.label}
							<ExternalLink size={12} aria-hidden="true" />
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
