import { AgentDetailPage } from "@/components/pages/agent-detail-page";
import type { AgentCapability } from "@/components/pages/agent-detail-page";

const CAPABILITIES: AgentCapability[] = [
  {
    icon: "🎯",
    title: "Match Predictions",
    description:
      "AI-powered match forecasts using historical data, current form, head-to-head records and team news.",
    tool: "LLM",
  },
  {
    icon: "👕",
    title: "Fantasy Lineups",
    description:
      "Generates optimal team selections based on opponent analysis, form guides and tactical considerations.",
    tool: "LLM",
  },
  {
    icon: "📈",
    title: "Betting Insights",
    description:
      "Scrapes publicly available odds data to surface trends and value opportunities from major bookmakers.",
    tool: "Python (requests, BeautifulSoup, pandas)",
  },
  {
    icon: "🏅",
    title: "Prediction Competitions",
    description:
      "Tracks your prediction accuracy across games, building leaderboards and season-long score tracking.",
  },
  {
    icon: "🔮",
    title: '"What If" Scenarios',
    description:
      "Models different tactical approaches and alternate outcomes — what if LTFC played a high press? What if key players return?",
    tool: "LLM",
  },
  {
    icon: "📊",
    title: "Form Analysis",
    description:
      "Analyses current LTFC form, goal scoring patterns, defensive records and key player statistics.",
    tool: "Google Search",
  },
];

export function FantasyAgentPage() {
  return (
    <AgentDetailPage
      agentNumber={8}
      icon="⚽"
      name="Fantasy & Prediction Agent"
      subtitle="Match predictions, fantasy lineups & gamification features"
      description="The Fantasy & Prediction Agent brings data-driven fun to your match day. From AI-powered scoreline predictions to optimal fantasy team selections, this agent adds a competitive and analytical layer to your LTFC support — whether you're running the office sweepstake or managing your Fantasy Premier League side."
      capabilities={CAPABILITIES}
      badge="v3.0"
    />
  );
}
