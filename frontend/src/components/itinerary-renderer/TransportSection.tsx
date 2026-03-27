import type { TransportRecommendation, TransportOption } from "@/types";

const SECTION_TITLE_CLASS =
  "text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3";
const TRANSPORT_CARD_CLASS =
  "flex-1 min-w-[140px] rounded-xl border border-zinc-200 dark:border-zinc-700 p-3";

function TransportCard({
  option,
  label,
}: {
  option: TransportOption;
  label: string;
}) {
  return (
    <div class={TRANSPORT_CARD_CLASS}>
      <p class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p class="text-sm font-bold text-zinc-900 dark:text-white capitalize">
        {option.mode}
        {option.provider ? ` · ${option.provider}` : ""}
      </p>
      {(option.departure_time || option.arrival_time) && (
        <p class="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
          {option.departure_time}
          {option.arrival_time ? ` → ${option.arrival_time}` : ""}
          {option.duration ? ` (${option.duration})` : ""}
        </p>
      )}
      {option.cost && (
        <p class="text-sm font-bold text-[#F5820D] mt-1">{option.cost}</p>
      )}
      {option.notes && (
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 italic">
          {option.notes}
        </p>
      )}
      {option.booking_url && (
        <a
          href={option.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 mt-2 text-xs font-medium text-[#1a1f3c] dark:text-orange-400 hover:underline focus:outline-none focus:ring-2 focus:ring-[#F5820D] focus:ring-offset-1 rounded"
        >
          Book now
        </a>
      )}
    </div>
  );
}

export function TransportSection({ data }: { data: TransportRecommendation }) {
  if (!data.best_value && !data.fastest) return null;
  return (
    <div class="mb-4">
      <h4 class={SECTION_TITLE_CLASS}>Getting there</h4>
      <div class="flex gap-3 flex-wrap">
        {data.best_value && (
          <TransportCard option={data.best_value} label="🏷️ Best value" />
        )}
        {data.fastest && (
          <TransportCard option={data.fastest} label="⚡ Fastest" />
        )}
      </div>
    </div>
  );
}
