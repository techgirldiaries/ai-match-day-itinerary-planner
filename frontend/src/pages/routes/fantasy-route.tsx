import { FantasyAgentPage } from "@/pages/agents/fantasy-agent-page";

export function FantasyRoute() {
  return (
    <main
      class="flex-1 bg-zinc-100 dark:bg-zinc-950 transition-colors overflow-y-auto"
      id="main-content"
    >
      <FantasyAgentPage />
    </main>
  );
}
