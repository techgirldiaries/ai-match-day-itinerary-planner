import { AgentDetailPage } from "@/components/pages/agent-detail-page";
import type { AgentCapability } from "@/components/pages/agent-detail-page";

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
