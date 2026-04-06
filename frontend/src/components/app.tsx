import { For, Show } from "@preact/signals/utils";
import { useEffect } from "preact/hooks";
import { AgentMessage } from "@/components/features/chat";
import { AgentTyping, TimeoutMessage } from "@/components/features/chat";
import { ConnectionErrorScreen } from "@/components/common";
import { EmailExportModal } from "@/components/features/modals";
import { Footer, Header, Nav } from "@/components/layout";
import { IntakeForm } from "@/components/features/intake";
import { LoadingScreen } from "@/components/common";
import { AccessibilityModeRoute } from "@/pages/routes/accessibility-mode-route";
import { AgentsRoute } from "@/pages/routes/agents-route";
import { BiRoute } from "@/pages/routes/bi-route";
import { ChatRoute } from "@/pages/routes/chat-route";
import { ComingSoonRoute } from "@/pages/routes/coming-soon-route";
import { DraftsRoute } from "@/pages/routes/drafts-route";
import { FantasyRoute } from "@/pages/routes/fantasy-route";
import { HeritageRoute } from "@/pages/routes/heritage-route";
import { SocialRoute } from "@/pages/routes/social-route";
import { WeatherRoute } from "@/pages/routes/weather-route";
import { YouthRoute } from "@/pages/routes/youth-route";
import { SharedItineraryPage } from "@/pages/agents/shared-itinerary-page";
import { SavedDraftsPanel } from "@/components/features/panels";
import { UserDraftBubble } from "@/components/features/panels";
import { UserMessage } from "@/components/features/chat";
import {
  agent,
  agentTypingTimedOut,
  type ChatMessage,
  client,
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
} from "@/core/state";
import { t } from "@/i18n";
import { debugLog, debugWarn, logAppState } from "@/utils/helpers";

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
      {page === "accessibility-mode" && <AccessibilityModeRoute />}
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
