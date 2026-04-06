import type { AgentCapability } from "@/pages/agents/agent-detail-page";
import { AgentDetailPage } from "@/pages/agents/agent-detail-page";

const CAPABILITIES: AgentCapability[] = [
  {
    icon: "👥",
    title: "Fan Analytics",
    description:
      "Tracks fan behaviour, travel patterns, spending habits and engagement levels to generate actionable insights.",
    tool: "Google Analytics — Run Report",
  },
  {
    icon: "💰",
    title: "Revenue Optimisation",
    description:
      "Analyses booking patterns and pricing sensitivity to identify revenue opportunities across matchday operations.",
  },
  {
    icon: "🔮",
    title: "Predictive Modelling",
    description:
      "Forecasts attendance figures, merchandise demand and hospitality uptake for upcoming fixtures.",
    tool: "LLM",
  },
  {
    icon: "📊",
    title: "ROI Analysis",
    description:
      "Measures the effectiveness of marketing campaigns, fan engagement programmes and loyalty initiatives.",
  },
  {
    icon: "📈",
    title: "Data Visualisation",
    description:
      "Generates clear performance reports and dashboards for club management, summarising key metrics and trends.",
  },
  {
    icon: "🏟️",
    title: "Stadium & Matchday Reports",
    description:
      "Provides post-match summaries on supporter journeys, dwell times, hospitality satisfaction and transport usage.",
  },
];

export function BusinessIntelligenceAgentPage() {
  return (
    <AgentDetailPage
      agentNumber={10}
      icon="📊"
      name="Business Intelligence Agent"
      subtitle="Fan analytics, revenue optimisation & predictive insights"
      description="The Business Intelligence Agent provides LTFC and its commercial partners with data-driven insights into the fan experience. By analysing supporter behaviour, travel patterns and engagement metrics, this agent helps optimise matchday operations, forecast demand and measure the impact of fan-facing programmes — all in service of a better Hatters experience."
      capabilities={CAPABILITIES}
      badge="v3.0"
    />
  );
}
