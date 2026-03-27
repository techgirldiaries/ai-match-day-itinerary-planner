import { AgentDetailPage } from "@/components/pages/agent-detail-page";
import type { AgentCapability } from "@/components/pages/agent-detail-page";

const CAPABILITIES: AgentCapability[] = [
  {
    icon: "🌤️",
    title: "Match-Day Forecasts",
    description:
      "Detailed weather forecasts for match locations — temperature, precipitation, wind speed and visibility.",
    tool: "Unknown reference",
  },
  {
    icon: "🌡️",
    title: "Current Weather",
    description:
      "Real-time weather conditions at the match venue and along your travel route on the day of the match.",
    tool: "Unknown reference",
  },
  {
    icon: "🚂",
    title: "Travel Impact Analysis",
    description:
      "Assesses how weather conditions affect transport options — delays, cancellations, road closures and safety warnings.",
  },
  {
    icon: "🧥",
    title: "Clothing Recommendations",
    description:
      "Suggests appropriate attire based on temperature, rainfall, wind conditions and the exposure level of the stadium.",
  },
  {
    icon: "🏛️",
    title: "Indoor Alternatives",
    description:
      "Recommends covered venues, indoor pubs and sheltered activities during severe or adverse weather conditions.",
  },
  {
    icon: "⚠️",
    title: "Weather Alerts",
    description:
      "Real-time warnings for storms, heavy snow, extreme temperatures and severe weather events on matchdays.",
  },
  {
    icon: "📅",
    title: "Seasonal Adjustments",
    description:
      "Adapts itinerary recommendations for summer and winter match conditions — from sun cream to thermals.",
  },
  {
    icon: "🏟️",
    title: "Stadium Weather Info",
    description:
      "Kenilworth Road-specific exposure levels, covered seating areas, wind corridor information and shelter advice.",
  },
  {
    icon: "📆",
    title: "Multi-day Forecasts",
    description:
      "Extended weather predictions for away matches requiring overnight stays or multi-day travel planning.",
    tool: "Unknown reference",
  },
];

export function WeatherAgentPage() {
  return (
    <AgentDetailPage
      agentNumber={12}
      icon="☁️"
      name="Weather Agent"
      subtitle="Match-day forecasting, travel impact & clothing recommendations"
      description="The Weather Agent ensures you're never caught off guard by the British weather — or anywhere else LTFC travel takes you. From real-time conditions at Kenilworth Road to extended forecasts for mid-week away trips, this agent factors the forecast into every aspect of your matchday plan, from what to wear to whether your train is likely to be delayed."
      capabilities={CAPABILITIES}
      badge="v3.0"
    />
  );
}
