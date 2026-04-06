import { For, Show } from "@preact/signals/utils";
import { useEffect } from "preact/hooks";
import { AgentMessage } from "@/components/agent-message";
import { AgentTyping, TimeoutMessage } from "@/components/agent-typing";
import { IntakeForm } from "@/components/intake-form";
import { Header } from "@/components/header";
import { Nav } from "@/components/nav";
import { UserMessage } from "@/components/user-message";
import { Footer } from "@/components/footer";
import { EmailExportModal } from "@/components/email-export-modal";
import { SavedDraftsPanel } from "@/components/saved-drafts-panel";
import { ChatRoute } from "@/components/pages/app-routes/chat-route";
import { AgentsRoute } from "@/components/pages/app-routes/agents-route";
import { DraftsRoute } from "@/components/pages/app-routes/drafts-route";
import { ComingSoonRoute } from "@/components/pages/app-routes/coming-soon-route";
import { HeritageRoute } from "@/components/pages/app-routes/heritage-route";
import { FantasyRoute } from "@/components/pages/app-routes/fantasy-route";
import { SocialRoute } from "@/components/pages/app-routes/social-route";
import { BiRoute } from "@/components/pages/app-routes/bi-route";
import { YouthRoute } from "@/components/pages/app-routes/youth-route";
import { WeatherRoute } from "@/components/pages/app-routes/weather-route";
import { SharedItineraryPage } from "@/components/pages/shared-itinerary-page";
import { t } from "@/i18n";
import { LoadingScreen } from "@/components/loading-screen";
import { ConnectionErrorScreen } from "@/components/connection-error-screen";
import { UserDraftBubble } from "@/components/user-draft-bubble";
import {
  agent,
  agentTypingTimedOut,
  client,
  type ChatMessage,
  connectionError,
  currentPage,
  currentShareId,
  draftMessage,
  hasMessages,
  isAgentTyping,
  isSidebarCollapsed,
  messages,
  showEmailExportModal,
  workforce,
} from "@/core/signals";
import { debugLog, debugWarn, logAppState } from "@/utils/debug";

export function App() {
  useEffect(() => {
    const path = window.location.pathname;
    const shareMatch = path.match(/^\/j\/([a-zA-Z0-9]{8,12})$/);

    if (shareMatch && shareMatch[1]) {
      currentShareId.value = shareMatch[1];
      currentPage.value = "shared-itinerary";
    }

    // Log app state for debugging (only in debug mode)
    logAppState({
      client: Boolean(client.value),
      agent: Boolean(agent.value),
      workforce: Boolean(workforce.value),
      connectionError: connectionError.value,
    });
  }, []);

  if (connectionError.value) {
    debugWarn("Showing error screen", { error: connectionError.value });
    return <ConnectionErrorScreen />;
  }

  if (
    !agent.value &&
    !workforce.value &&
    currentPage.value !== "shared-itinerary"
  ) {
    debugLog("Showing loading screen");
    return <LoadingScreen />;
  }

  const page = currentPage.value;
  const desktopOffsetClass = isSidebarCollapsed.value ? "lg:pl-16" : "lg:pl-64";

  return (
    <div
      class={`flex flex-col min-h-dvh bg-white dark:bg-gray-950 ${desktopOffsetClass}`}
    >
      {page !== "shared-itinerary" && <Nav />}
      {page !== "shared-itinerary" && <Header />}

      {page === "chat" && <ChatRoute />}
      {page === "agents" && <AgentsRoute />}
      {page === "drafts" && <DraftsRoute />}
      {page === "coming-soon" && <ComingSoonRoute />}
      {page === "heritage" && <HeritageRoute />}
      {page === "fantasy" && <FantasyRoute />}
      {page === "social" && <SocialRoute />}
      {page === "bi" && <BiRoute />}
      {page === "youth" && <YouthRoute />}
      {page === "weather" && <WeatherRoute />}
      {page === "shared-itinerary" && (
        <SharedItineraryPage shareId={currentShareId.value} />
      )}
    </div>
  );
}
