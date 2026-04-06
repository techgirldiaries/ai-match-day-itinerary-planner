import { SocialImpactAgentPage } from "@/pages/agents/social-impact-agent-page";

export function SocialRoute() {
  return (
    <main
      class="flex-1 bg-zinc-100 dark:bg-zinc-950 transition-colors overflow-y-auto"
      id="main-content"
    >
      <SocialImpactAgentPage />
    </main>
  );
}
