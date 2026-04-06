import { useRef } from "preact/hooks";
import {
  getCachedRoute,
  getVenuesByCategory,
} from "@/pages/routes/cache-routes-venues";
import {
  agent,
  type ChatMessage,
  draftMessage,
  isAgentTyping,
  messages,
  task,
  workforce,
} from "@/core/state";

const AGENT_TIMEOUT_MS = 28000; // 28 seconds (safe buffer from 30s platform limit)

/**
 * Extracts key travel details from user message for quick processing
 */
function extractTravelDetails(message: string): {
  origin?: string;
  date?: string;
  fromCache?: boolean;
} {
  const dateMatch = message.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}/);
  const originMatch = message.match(/from\s+([A-Za-z\s]+)(?:\s|,|$)/i);

  return {
    date: dateMatch ? dateMatch[0] : undefined,
    origin: originMatch ? originMatch[1].trim() : undefined,
  };
}

/**
 * Detects which advanced features should be enabled based on message content
 */
function detectAdvancedFeatures(message: string): {
  group?: boolean;
  loyalty?: boolean;
  international?: boolean;
  powerCourt?: boolean;
  realTime?: boolean;
  booking?: boolean;
} {
  const lowerMsg = message.toLowerCase();

  return {
    group:
      /group|friends|split|invite|coordination|team|supporters|colleagues/.test(
        lowerMsg,
      ),
    loyalty: /loyalty|member|privilege|discount|vip|exclusive/.test(lowerMsg),
    international:
      /international|visa|abroad|foreign|worldwide|overseas|passport/.test(
        lowerMsg,
      ),
    powerCourt:
      /power court|stadium development|expansion|new stadium|renovation|kenilworth/.test(
        lowerMsg,
      ),
    realTime:
      /update|live|notification|alert|reminder|notification|subscribe/.test(
        lowerMsg,
      ),
    booking: /book|reserve|payment|split payment|installment/.test(lowerMsg),
  };
}

/**
 * Checks if we have cached data for this request
 */
function canUseCachedData(origin?: string): boolean {
  if (!origin) return false;
  const route = getCachedRoute(origin, "Luton");
  return !!route;
}

/**
 * Creates context prefix to hint which features to prioritize
 */
function createFeatureContext(
  features: ReturnType<typeof detectAdvancedFeatures>,
): string {
  const enabled = Object.entries(features)
    .filter(([_, val]) => val)
    .map(([key]) => key);

  if (enabled.length === 0) return "";

  return `\n[Enable features: ${enabled.join(", ")}]`;
}

/**
 * Creates a simplified retry message when first request times out
 */
function simplifyMessage(original: string, attemptNumber: number): string {
  if (attemptNumber === 2) {
    return (
      original +
      "\n\n[Quick response needed - provide essential travel & cost details only]"
    );
  }
  return original;
}

export function useSendMessage() {
  const input = useRef<HTMLInputElement>(null);
  const retryCount = useRef<Record<string, number>>({});
  const retryMessageAdded = useRef<Set<string>>(new Set()); // Track added retry messages

  const sendMessage = async (message: string, initialAttempt = true) => {
    if (isAgentTyping.value) return;
    if (!message?.trim()) return;

    // Set flag to block concurrent calls (only for initial user-initiated attempts)
    if (initialAttempt) {
      isAgentTyping.value = true;
    }

    draftMessage.value = "";

    // Track retry attempts per message
    const msgHash = message.substring(0, 30);
    if (!retryCount.current[msgHash]) {
      retryCount.current[msgHash] = 1;
    }
    const attemptNumber = retryCount.current[msgHash];

    // Only add user message on first attempt
    if (initialAttempt) {
      messages.value = [
        ...messages.value,
        {
          id: "optimistic",
          type: "user-message",
          text: message,
          createdAt: new Date(),
          isAgent: () => false,
        } as ChatMessage,
      ];
    }

    if (!workforce.value && !agent.value) return;

    try {
      // Detect which advanced features to enable based on message content
      const features = detectAdvancedFeatures(message);
      const featureContext = createFeatureContext(features);
      const messageWithContext = message + featureContext;

      // Create timeout promise that rejects after AGENT_TIMEOUT_MS
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Agent response timeout")),
          AGENT_TIMEOUT_MS,
        );
      });

      // Race between agent response and timeout
      const agentPromise = workforce.value
        ? task.value
          ? workforce.value.sendMessage(messageWithContext, task.value)
          : workforce.value.sendMessage(messageWithContext)
        : task.value
          ? agent.value?.sendMessage(messageWithContext, task.value)
          : agent.value?.sendMessage(messageWithContext);

      const task_signal = await Promise.race([agentPromise, timeoutPromise]);

      if (task.value !== task_signal) {
        task.value = task_signal as typeof task.value;
      }

      // Clear retry count on success
      retryCount.current[msgHash] = 0;
    } catch (error) {
      const isTimeout =
        error instanceof Error && error.message.includes("timeout");

      if (isTimeout && attemptNumber < 2) {
        // Timeout on first attempt - retry with simplified message
        console.warn(
          "⏱️ Agent timeout (attempt 1), retrying with simplified request...",
        );

        retryCount.current[msgHash] = 2;
        const simplifiedMsg = simplifyMessage(message, 2);

        // Add info message about retry (only once per message)
        const retryKeyId = `system-retry-${msgHash}`;
        if (!retryMessageAdded.current.has(retryKeyId)) {
          retryMessageAdded.current.add(retryKeyId);

          messages.value = [
            ...messages.value,
            {
              id: retryKeyId,
              type: "agent-message" as const,
              text: "⏱️ Request taking longer than expected. Retrying with streamlined approach...",
              createdAt: new Date(),
              isAgent: () => true,
            } as ChatMessage,
          ];

          // Add visible retry attempt as new "ME" user message bubble (only once)
          const retryUserMsgId = `retry-user-${msgHash}`;
          if (!retryMessageAdded.current.has(retryUserMsgId)) {
            retryMessageAdded.current.add(retryUserMsgId);
            messages.value = [
              ...messages.value,
              {
                id: retryUserMsgId,
                type: "user-message",
                text: simplifiedMsg,
                createdAt: new Date(),
                isAgent: () => false,
              } as ChatMessage,
            ];
          }
        }

        await sendMessage(simplifiedMsg, false);
      } else if (isTimeout && attemptNumber >= 2) {
        // Timeout on retry - provide cached fallback data
        console.error("❌ Agent timeout on retry, using cached data fallback");

        const details = extractTravelDetails(message);
        let fallbackMessage =
          "⚠️ Response taking too long. Here's quick info from our cached data:\n\n";

        if (details.origin) {
          const route = getCachedRoute(details.origin, "Luton");
          if (route) {
            fallbackMessage += `**Route from ${details.origin}:**\n`;
            route.options.slice(0, 2).forEach((opt) => {
              fallbackMessage += `- ${opt.name}: ${opt.duration}, ${opt.cost}\n`;
            });
          }
        }

        fallbackMessage +=
          "\n**Popular venues near stadium:**\n" +
          "- Bricklayers Arms (fan pub)\n" +
          "- Painters Arms (match day atmosphere)\n\n" +
          "📱 For full details, try refreshing or asking again in a moment.";

        messages.value = [
          ...messages.value,
          {
            id: `fallback-${Date.now()}`,
            type: "agent-message" as const,
            text: fallbackMessage,
            createdAt: new Date(),
            isAgent: () => true,
          } as ChatMessage,
        ];

        retryCount.current[msgHash] = 0;
      } else {
        // Non-timeout error
        console.error("❌ Error sending message:", error);
        const errorMsg = error instanceof Error ? error.message : String(error);

        messages.value = [
          ...messages.value,
          {
            id: `error-${Date.now()}`,
            type: "agent-message" as const,
            text: `❌ Error: ${errorMsg}\n\nPlease try again.`,
            createdAt: new Date(),
            isAgent: () => true,
          } as ChatMessage,
        ];

        retryCount.current[msgHash] = 0;
      }
    } finally {
      // Clear flag only for initial attempts
      if (initialAttempt) {
        isAgentTyping.value = false;
      }
      if (input.current) {
        input.current.value = "";
        input.current.focus();
      }
    }
  };

  return { input, sendMessage };
}

/**
 * NEW INTAKE FLOW FUNCTIONS
 * For processing intake form data automatically on chat route mount
 */

import { useEffect } from "preact/hooks";
import { buildIntakePrompt } from "@/core/intake-validation";
// Import new signals and types for intake flow
import {
  hasUserMessageBeenAdded,
  intakeFormData,
  intakeMessages,
  isAgentThinking,
  isProcessingIntake,
  isSending,
  itineraryOutput,
} from "@/core/state";
import type { IntakeMessage, IntakeMessageRole } from "@/core/types";

// Called once when ChatRoute mounts — processes intake form
// data automatically without user typing anything:
export function useProcessIntakeOnMount(): void {
  // Ref prevents StrictMode / HMR double-fire:
  const hasProcessed = useRef<boolean>(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    if (intakeFormData.value === null) return;

    hasProcessed.current = true;
    isProcessingIntake.value = true;
    isAgentThinking.value = true;

    const intakePrompt = buildIntakePrompt(intakeFormData.value);

    // Add intake as a user message so it appears in chat:
    const intakeUserMessage: IntakeMessage = {
      id: crypto.randomUUID(),
      role: "user" satisfies IntakeMessageRole,
      content: intakePrompt,
      timestamp: Date.now(),
    };

    const messageIds = new Set(
      intakeMessages.value.map((m: IntakeMessage) => m.id),
    );

    if (!messageIds.has(intakeUserMessage.id)) {
      intakeMessages.value = [...intakeMessages.value, intakeUserMessage];
    }

    // Call agent API with the full intake prompt:
    callAgentAPINew(intakePrompt)
      .then((responseContent: string): void => {
        const agentMessage: IntakeMessage = {
          id: crypto.randomUUID(),
          role: "agent" satisfies IntakeMessageRole,
          content: responseContent,
          timestamp: Date.now(),
          isItinerary: true, // Flags for ItineraryOutput renderer
        };

        const currentIds = new Set(
          intakeMessages.value.map((m: IntakeMessage) => m.id),
        );
        if (!currentIds.has(agentMessage.id)) {
          intakeMessages.value = [...intakeMessages.value, agentMessage];
        }
      })
      .catch((error: Error): void => {
        const errorMessage: IntakeMessage = {
          id: crypto.randomUUID(),
          role: "agent" satisfies IntakeMessageRole,
          content: `Sorry, I couldn't generate your itinerary: 
                    ${error.message}. Please try again.`,
          timestamp: Date.now(),
        };
        intakeMessages.value = [...intakeMessages.value, errorMessage];
      })
      .finally((): void => {
        isAgentThinking.value = false;
        isProcessingIntake.value = false;
        isSending.value = false;
      });

    // Empty deps — run once on mount only:
  }, []);
}

// Standard send handler for follow-up chat messages:
export function useSendMessageNew(): {
  sendMessage: (input: string) => void;
} {
  const sendMessage = (input: string): void => {
    if (isSending.value || input.trim() === "") return;

    isSending.value = true;
    hasUserMessageBeenAdded.value = false;

    const userMessage: IntakeMessage = {
      id: crypto.randomUUID(),
      role: "user" satisfies IntakeMessageRole,
      content: input.trim(),
      timestamp: Date.now(),
    };

    const messageIds = new Set(
      intakeMessages.value.map((m: IntakeMessage) => m.id),
    );

    if (!messageIds.has(userMessage.id)) {
      intakeMessages.value = [...intakeMessages.value, userMessage];
      hasUserMessageBeenAdded.value = true;
    }

    isAgentThinking.value = true;

    callAgentAPINew(input.trim())
      .then((responseContent: string): void => {
        const agentMessage: IntakeMessage = {
          id: crypto.randomUUID(),
          role: "agent" satisfies IntakeMessageRole,
          content: responseContent,
          timestamp: Date.now(),
        };
        const currentIds = new Set(
          intakeMessages.value.map((m: IntakeMessage) => m.id),
        );
        if (!currentIds.has(agentMessage.id)) {
          intakeMessages.value = [...intakeMessages.value, agentMessage];
        }
      })
      .catch((error: Error): void => {
        const errorMessage: IntakeMessage = {
          id: crypto.randomUUID(),
          role: "agent" satisfies IntakeMessageRole,
          content: `Sorry, something went wrong: ${error.message}`,
          timestamp: Date.now(),
        };
        intakeMessages.value = [...intakeMessages.value, errorMessage];
      })
      .finally((): void => {
        isAgentThinking.value = false;
        isSending.value = false;
        hasUserMessageBeenAdded.value = false;
      });
  };

  return { sendMessage };
}

// Helper function to call agent API (to be integrated with Relevance AI SDK)
async function callAgentAPINew(prompt: string): Promise<string> {
  // Use the agent or workforce from signals to make the API call
  if (!workforce.value && !agent.value) {
    throw new Error("Agent or Workforce not initialized");
  }

  try {
    const agentPromise = workforce.value
      ? task.value
        ? workforce.value.sendMessage(prompt, task.value)
        : workforce.value.sendMessage(prompt)
      : task.value
        ? agent.value?.sendMessage(prompt, task.value)
        : agent.value?.sendMessage(prompt);

    const task_signal = await agentPromise;

    if (task.value !== task_signal) {
      task.value = task_signal as typeof task.value;
    }

    // For now, return a placeholder response
    // The actual response will be handled by the task event listener
    return Promise.resolve("Processing your intake form...");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Agent API error: ${errorMsg}`);
  }
}
