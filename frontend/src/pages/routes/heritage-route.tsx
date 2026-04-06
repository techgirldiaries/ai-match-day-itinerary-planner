import { HeritageAgentPage } from "@/pages/agents/heritage-agent-page";

export function HeritageRoute() {
  return (
    <main
      class="flex-1 bg-zinc-100 dark:bg-zinc-950 transition-colors overflow-y-auto"
      id="main-content"
    >
      <HeritageAgentPage />
    </main>
  );
}
