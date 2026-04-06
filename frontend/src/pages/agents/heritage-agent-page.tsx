import type { AgentCapability } from "@/pages/agents/agent-detail-page";
import { AgentDetailPage } from "@/pages/agents/agent-detail-page";

const CAPABILITIES: AgentCapability[] = [
  {
    icon: "📖",
    title: "Personal Fan Journey",
    description:
      "Creates personalised narratives based on your fan history — first matches, memorable moments and milestones.",
    tool: "LLM",
  },
  {
    icon: "🔍",
    title: "Historical Context",
    description:
      "Searches LTFC history and match significance, providing rich background on opponents and competitions.",
    tool: "Google Search",
  },
  {
    icon: "🏆",
    title: "Legacy Tracking",
    description:
      "Documents fan milestones, attendance records, first matches and memorable moments in your personal LTFC story.",
  },
  {
    icon: "🎬",
    title: "Storytelling Content",
    description:
      "Generates match-day vlogs, historical comparisons, family tradition narratives and supporter stories.",
    tool: "LLM",
  },
  {
    icon: "🗺️",
    title: "Heritage Tours",
    description:
      "Recommends historical sites, former grounds, Kenilworth Road landmarks and club heritage locations.",
    tool: "Google Search",
  },
  {
    icon: "📅",
    title: "Anniversary & Milestones",
    description:
      "Recognises significant anniversaries — 100th visit, promotion matches, Cup runs — with personalised content.",
    tool: "LLM",
  },
];

export function HeritageAgentPage() {
  return (
    <AgentDetailPage
      agentNumber={7}
      icon="🏛️"
      name="Heritage & Storytelling Agent"
      subtitle="Personalised fan narratives, historical content & legacy tracking"
      description="The Heritage & Storytelling Agent transforms your match-day experience into a personal LTFC narrative. Whether you're attending your first game or your 500th, this agent weaves historical context, personal milestones and club heritage into your itinerary — keeping the spirit of the Hatters alive through every visit."
      capabilities={CAPABILITIES}
      badge="v3.0"
    />
  );
}
