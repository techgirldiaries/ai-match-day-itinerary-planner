import type { MatchSummary } from "@/core/types";

export function MatchSummaryCard({ data }: { data: MatchSummary }) {
  return (
    <div class="rounded-2xl border-l-4 border-[#F5820D] bg-[#1a1f3c] text-white p-4 mb-4">
      <div class="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p class="text-xs text-orange-300 font-medium uppercase tracking-wider mb-1">
            {data.competition ?? "Match Day"}
          </p>
          <h3 class="text-lg font-bold">LTFC vs {data.opponent}</h3>
          <p class="text-sm text-zinc-300 mt-0.5">{data.venue}</p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-xs text-zinc-400">Kick-off</p>
          <p class="text-base font-semibold text-[#F5820D]">{data.kick_off}</p>
        </div>
      </div>
    </div>
  );
}
