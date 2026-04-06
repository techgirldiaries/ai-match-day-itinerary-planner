import type { AgentCapability } from "@/pages/agents/agent-detail-page";
import { AgentDetailPage } from "@/pages/agents/agent-detail-page";

export interface AgentPageConfig {
  agentNumber: number;
  icon: string;
  name: string;
  subtitle: string;
  description: string;
  capabilities: AgentCapability[];
  badge?: string;
  badgeClass?: string;
}

export function AgentPageTemplate(config: AgentPageConfig) {
  return <AgentDetailPage {...config} />;
}
