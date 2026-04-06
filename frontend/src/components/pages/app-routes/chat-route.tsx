import { For, Show } from "@preact/signals/utils";
import { FunctionComponent } from "preact";
import * as preact from "preact";
import { IntakeForm } from "@/components/intake/IntakeForm";
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
import type { IntakeMessage, IntakeMessageRole } from "@/core/types";
import {
  intakeMessages,
  isAgentThinking,
  isChatInputEnabled,
} from "@/core/signals";
import { AgentTyping as AgentThinkingBubble } from "@/components/agent-typing";
import {
  useProcessIntakeOnMount,
  useSendMessageNew,
} from "@/components/hooks/useSendMessage";

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
