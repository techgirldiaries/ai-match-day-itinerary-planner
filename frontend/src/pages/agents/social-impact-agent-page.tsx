import type { AgentCapability } from "@/pages/agents/agent-detail-page";
import { AgentDetailPage } from "@/pages/agents/agent-detail-page";

const CAPABILITIES: AgentCapability[] = [
  {
    icon: "❤️",
    title: "Charity Coordination",
    description:
      "Organises match-day charity collections, coordinates with local charities and manages donation drives.",
    tool: "Send Gmail email",
  },
  {
    icon: "🤝",
    title: "Community Volunteering",
    description:
      "Connects fans with local volunteer opportunities before and after matches — stadium, food banks and community clean-ups.",
  },
  {
    icon: "🥫",
    title: "Social Initiatives",
    description:
      "Coordinates food bank donations, community clean-ups and fan-led social impact programmes on match days.",
  },
  {
    icon: "🧑‍🤝‍🧑",
    title: "Fan Mentorship",
    description:
      "Matches experienced Hatters with newcomers and away-day first-timers for a welcoming supporter experience.",
  },
  {
    icon: "📢",
    title: "Campaign Awareness",
    description:
      "Promotes LTFC community campaigns, equality initiatives and club charitable partnerships to supporters.",
  },
  {
    icon: "🌍",
    title: "Global Community Links",
    description:
      "Connects LTFC fans worldwide with local community projects during international pre-season tours and events.",
  },
];

export function SocialImpactAgentPage() {
  return (
    <AgentDetailPage
      agentNumber={9}
      icon="🤝"
      name="Social Impact Agent"
      subtitle="Charity coordination, community volunteering & social initiatives"
      description="The Social Impact Agent turns match days into opportunities for positive change. From organising charity collections on your way to Kenilworth Road to connecting fans with local volunteer projects, this agent helps the Hatters community give back — making every match day count beyond the 90 minutes."
      capabilities={CAPABILITIES}
      badge="v3.0"
    />
  );
}
