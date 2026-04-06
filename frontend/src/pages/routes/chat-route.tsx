import { For, Show } from "@preact/signals/utils";
import type * as preact from "preact";
import type { FunctionComponent } from "preact";
import { AgentMessage } from "@/components/features/chat";
import {
  AgentTyping as AgentThinkingBubble,
  AgentTyping,
  TimeoutMessage,
} from "@/components/features/chat";
import { EmailExportModal } from "@/components/features/modals";
import { Footer } from "@/components/layout";
import { ItineraryRenderer } from "@/components/features/itinerary";
import {
  useProcessIntakeOnMount,
  useSendMessageNew,
} from "@/components/hooks/useSendMessage";
import { IntakeForm } from "@/components/features/intake";
import { ShareModal } from "@/components/features/modals";
import { UserDraftBubble } from "@/components/features/panels";
import { UserMessage } from "@/components/features/chat";
import {
  agentTypingTimedOut,
  canShareItinerary,
  currentItinerary,
  hasMessages,
  intakeMessages,
  isAgentThinking,
  isAgentTyping,
  isChatInputEnabled,
  messages,
  showEmailExportModal,
} from "@/core/state";
import type {
  IntakeMessage,
  IntakeMessageRole,
  ItineraryResponse,
} from "@/core/types/types";

// Render message with exhaustive type checking:
const renderMessage = (message: IntakeMessage): preact.VNode<unknown> => {
  const role: IntakeMessageRole = message.role;
  switch (role) {
    case "user":
      return (
        <div
          key={message.id}
          class="flex items-end gap-x-2 max-w-[92%] sm:max-w-[85%] lg:max-w-[65%] self-end flex-row-reverse"
        >
          <div class="shrink-0 w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
            ME
          </div>
          <div class="flex flex-col gap-y-1 items-end max-w-full">
            <div class="bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm">
              {message.content}
            </div>
            <small class="text-gray-500 text-xs">
              {new Date(message.timestamp).toLocaleTimeString()}
            </small>
          </div>
        </div>
      );
    case "agent":
      // Check if this is an itinerary response
      if (message.isItinerary) {
        try {
          const itineraryData = JSON.parse(
            message.content,
          ) as ItineraryResponse;
          // Update current itinerary signal for sharing/modals
          currentItinerary.value = itineraryData;
          return (
            <div
              key={message.id}
              class="flex items-start gap-x-2 w-full self-start flex-row"
            >
              <div class="shrink-0 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                AI
              </div>
              <div class="flex flex-col gap-y-1 items-start max-w-full w-full">
                <small class="text-gray-500 text-xs">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </small>
                <ItineraryRenderer itinerary={itineraryData} />
              </div>
            </div>
          );
        } catch (e) {
          console.error("Failed to parse itinerary JSON:", e);
          // Fall through to plain text rendering on parse error
        }
      }
      // Plain text rendering for regular agent messages or parse failures
      return (
        <div
          key={message.id}
          class="flex items-start gap-x-2 max-w-[92%] sm:max-w-[85%] lg:max-w-[65%] self-start flex-row"
        >
          <div class="shrink-0 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
            AI
          </div>
          <div class="flex flex-col gap-y-1 items-start max-w-full">
            <div class="bg-gray-800 text-gray-100 rounded-lg px-4 py-2 text-sm">
              {message.content}
            </div>
            <small class="text-gray-500 text-xs">
              {new Date(message.timestamp).toLocaleTimeString()}
            </small>
          </div>
        </div>
      );
    default: {
      const _exhaustiveCheck: never = role;
      return _exhaustiveCheck;
    }
  }
};

export const ChatRoute: FunctionComponent = () => {
  // Auto-processes intake form data on mount — fires once:
  useProcessIntakeOnMount();

  const { sendMessage } = useSendMessageNew();

  return (
    <>
      <div class="flex flex-1 min-h-0 flex-col">
        <main
          class="flex-1 min-h-0 p-3 sm:p-4 md:p-5 bg-white dark:bg-gray-950 transition-colors overflow-x-hidden overflow-y-auto"
          id="main-content"
        >
          <div class="w-full max-w-4xl mx-auto flex flex-col gap-y-3 sm:gap-y-4 md:gap-y-5 pb-4">
            {/* Render messages from new intake flow */}
            <For
              each={intakeMessages}
              fallback={<IntakeForm />}
              key={(m: IntakeMessage) => m.id}
            >
              {(m: IntakeMessage) => renderMessage(m)}
            </For>

            <UserDraftBubble />

            {/* Thinking bubble — OUTSIDE message array, never in messages */}
            <Show when={isAgentThinking}>
              <AgentThinkingBubble />
            </Show>

            <Show when={agentTypingTimedOut}>
              <TimeoutMessage />
            </Show>
          </div>
        </main>
      </div>
      <Show when={() => intakeMessages.value.length > 0}>
        <Footer />
      </Show>
      <Show when={() => showEmailExportModal.value}>
        <EmailExportModal />
      </Show>
      <Show when={() => canShareItinerary.value && currentItinerary.value}>
        <ShareModal itinerary={currentItinerary.value!} />
      </Show>
    </>
  );
};
