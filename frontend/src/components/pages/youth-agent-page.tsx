import { AgentDetailPage } from "@/components/pages/agent-detail-page";
import type { AgentCapability } from "@/components/pages/agent-detail-page";

const CAPABILITIES: AgentCapability[] = [
  {
    icon: "🎒",
    title: "Junior Fan Programmes",
    description:
      "Recommends age-appropriate activities, Junior Hatters experiences and family-friendly matchday plans for young supporters.",
  },
  {
    icon: "📚",
    title: "Educational Content",
    description:
      "Provides football history lessons, club facts, Rule Britannia quizzes and engaging LTFC learning materials for young fans.",
    tool: "LLM",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Family Engagement",
    description:
      "Plans family matchday itineraries including family sections, accessible routes, child-friendly venues and pre-match activities.",
  },
  {
    icon: "🏫",
    title: "School & Community Outreach",
    description:
      "Connects schools and youth groups with LTFC Foundation programmes, stadium tours and player engagement events.",
  },
  {
    icon: "⭐",
    title: "Youth Loyalty Programmes",
    description:
      "Tracks Junior Hatters memberships, reward milestones and birthday experiences to build lifelong fan loyalty.",
  },
  {
    icon: "🎮",
    title: "Gamification for Young Fans",
    description:
      "Interactive matchday scavenger hunts, prediction games and fan challenges designed for young supporters.",
    tool: "LLM",
  },
];

export function YouthAgentPage() {
  return (
    <AgentDetailPage
      agentNumber={11}
      icon="👦"
      name="Youth Development Agent"
      subtitle="Junior fan programmes, educational content & family engagement"
      description="The Youth Development Agent nurtures the next generation of Hatters. From Junior fan memberships and educational football content to family matchday planning and school outreach, this agent ensures that every young supporter's first experiences at Kenilworth Road — and beyond — plant the seeds of lifelong LTFC passion."
      capabilities={CAPABILITIES}
      badge="v3.0"
    />
  );
}
