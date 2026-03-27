import { For, Show } from "@preact/signals/utils";
import { IntakeForm } from "@/components/intake-form";
import { AgentMessage } from "@/components/agent-message";
import { UserMessage } from "@/components/user-message";
import { AgentTyping, TimeoutMessage } from "@/components/agent-typing";
import { Footer } from "@/components/footer";
import { EmailExportModal } from "@/components/email-export-modal";
import { ShareModal } from "@/components/share-modal";
import { UserDraftBubble } from "@/components/user-draft-bubble";
import {
  hasMessages,
  isAgentTyping,
  agentTypingTimedOut,
  messages,
  showEmailExportModal,
  canShareItinerary,
  currentItinerary,
} from "@/core/signals";

export function ChatRoute() {
  return (
    <>
      <div class="flex flex-1 min-h-0 flex-col">
        <main
          class="flex-1 min-h-0 p-3 sm:p-4 md:p-5 bg-zinc-100 dark:bg-zinc-950 transition-colors overflow-x-hidden overflow-y-auto"
          id="main-content"
        >
          <div class="w-full max-w-4xl mx-auto flex flex-col gap-y-3 sm:gap-y-4 md:gap-y-5 pb-4">
            <For each={messages} fallback={<IntakeForm />} keyFn={(m) => m.id}>
              {(m) =>
                m.isAgent() ? (
                  <AgentMessage message={m} />
                ) : (
                  <UserMessage message={m} />
                )
              }
            </For>
            <UserDraftBubble />
            <Show when={isAgentTyping}>
              <AgentTyping />
            </Show>
            <Show when={agentTypingTimedOut}>
              <TimeoutMessage />
            </Show>
          </div>
        </main>
      </div>
      <Show when={hasMessages}>
        <Footer />
      </Show>
      <Show when={showEmailExportModal}>
        <EmailExportModal />
      </Show>
      <Show when={canShareItinerary}>
        <ShareModal itinerary={currentItinerary.value!} />
      </Show>
    </>
  );
}
