import { AlertTriangle } from "lucide-preact";
import type { ItineraryResponse } from "@/core/types";
import { BookingLinks } from "./BookingLinks";
import { CommunityNote } from "./CommunityNote";
import { CostBreakdownSection } from "./CostBreakdownSection";
import { MatchSummaryCard } from "./MatchSummaryCard";
import { Timeline } from "./Timeline";
import { TopTips } from "./TopTips";
import { TransportSection } from "./TransportSection";

const LOW_CONFIDENCE_ALERT_CLASS =
  "flex items-center gap-2 mb-3 text-sm text-amber-700 dark:text-amber-400 " +
  "bg-amber-50 dark:bg-amber-900/30 border border-amber-200 " +
  "dark:border-amber-800 rounded-xl px-3 py-2";

interface ItineraryRendererProps {
  itinerary: ItineraryResponse;
}

export function ItineraryRenderer({ itinerary }: ItineraryRendererProps) {
  const {
    match_summary,
    timeline,
    transport_recommendation,
    community_note,
    cost_breakdown,
    top_tips,
    booking_links,
    confidence,
  } = itinerary;

  const hasContent =
    match_summary ||
    (timeline?.length ?? 0) > 0 ||
    transport_recommendation ||
    community_note ||
    cost_breakdown ||
    (top_tips?.length ?? 0) > 0 ||
    (booking_links?.length ?? 0) > 0;

  if (!hasContent) return null;

  return (
    <section class="space-y-0 w-full" aria-label="Match day itinerary">
      {confidence === "low" && (
        <div class={LOW_CONFIDENCE_ALERT_CLASS} role="alert">
          <AlertTriangle size={14} aria-hidden="true" />
          <span>
            Some sections have low confidence — please verify details before
            booking.
          </span>
        </div>
      )}
      {match_summary && <MatchSummaryCard data={match_summary} />}
      {(timeline?.length ?? 0) > 0 && <Timeline entries={timeline ?? []} />}
      {transport_recommendation && (
        <TransportSection data={transport_recommendation} />
      )}
      {community_note && <CommunityNote note={community_note} />}
      {cost_breakdown && <CostBreakdownSection data={cost_breakdown} />}
      {(top_tips?.length ?? 0) > 0 && <TopTips tips={top_tips ?? []} />}
      {(booking_links?.length ?? 0) > 0 && (
        <BookingLinks links={booking_links ?? []} />
      )}
    </section>
  );
}
