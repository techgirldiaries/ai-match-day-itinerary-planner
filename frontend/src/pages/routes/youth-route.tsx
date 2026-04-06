import { YouthAgentPage } from "@/pages/agents/youth-agent-page";

export function YouthRoute() {
  return (
    <main
      class="flex-1 bg-zinc-100 dark:bg-zinc-950 transition-colors overflow-y-auto"
      id="main-content"
    >
      <YouthAgentPage />
    </main>
  );
}
