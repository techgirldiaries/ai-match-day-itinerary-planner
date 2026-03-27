import type { IntakeFormData, FanType, TravelStyle } from "@/core/types";
import { preferredLanguage } from "@/core/signals";

export function formatIntakeMessage(data: IntakeFormData): string {
  const modes =
    data.transport_modes.length > 0 ? data.transport_modes.join(", ") : "any";

  const interestList =
    data.interests.length > 0 ? data.interests.join(", ") : "general";

  const matchTypeLabel =
    data.match_type === "home"
      ? "Home (Kenilworth Road, Luton LU4 8AW)"
      : "Away match";

  const fanTypeLabels: Record<FanType, string> = {
    casual: "Casual fan",
    regular: "Regular supporter",
    season_ticket: "Season Ticket Holder",
    international: "International fan",
  };

  const travelStyleLabels: Record<TravelStyle, string> = {
    budget: "Budget",
    standard: "Standard",
    premium: "Premium",
    luxury: "Luxury",
  };

  function toGB(iso: string): string {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  const lines = [
    "Plan a comprehensive LTFC match-day itinerary.",
    `Origin: ${data.origin_city}. Match date: ${toGB(data.match_date)}. Kick-off: ${data.match_time}.`,
    `Match type: ${matchTypeLabel}. Party size: ${data.group_size} person(s).`,
    `Budget: £${data.budget_gbp} per person. Travel style: ${travelStyleLabels[data.travel_style]}.`,
    `Fan type: ${fanTypeLabels[data.fan_type]}. Overnight stay: ${data.overnight_stay}.`,
    `Preferred transport: ${modes}.`,
    `Interests: ${interestList}.`,
    `Group coordination: ${data.group_coordination}. LTFC loyalty member: ${data.loyalty_member}.`,
    `Community tips: ${data.community_opt_in}.`,
  ];

  const accessibilityString = Array.isArray(data.accessibility_needs)
    ? data.accessibility_needs.filter(Boolean).join(", ")
    : data.accessibility_needs;
  if (accessibilityString?.trim()) {
    lines.push(`Accessibility needs: ${accessibilityString.trim()}.`);
  }
  if (data.preferences.trim()) {
    lines.push(`Additional preferences: ${data.preferences.trim()}.`);
  }

  lines.push(
    `Please provide a full match-day itinerary following the system output format.`,
    `Respond in language code: ${preferredLanguage.value}.`,
  );

  return lines.join("\n");
}
