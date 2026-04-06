import { WeatherAgentPage } from "@/pages/agents/weather-agent-page";

export function WeatherRoute() {
  return (
    <main
      class="flex-1 bg-zinc-100 dark:bg-zinc-950 transition-colors overflow-y-auto"
      id="main-content"
    >
      <WeatherAgentPage />
    </main>
  );
}
