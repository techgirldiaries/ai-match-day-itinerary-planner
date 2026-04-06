import { computed, effect, signal } from "@preact/signals";
import { Agent, type Client, type Task, Workforce } from "@relevanceai/sdk";
import { AGENT_ID, WORKFORCE_ID } from "@/core/constant";
import { getOrCreateUserId } from "@/core/user";
import type { ChatMessage } from "@/core/types";
import type { SavedDraft } from "@/storage/draft-storage";
import { getAllDrafts } from "@/storage/draft-storage";
import {
  getStoredSessionMessages,
  saveSessionMessages,
} from "@/storage/messageStorage";
import {
  getDarkModePreference,
  setDarkModePreference,
  getLanguagePreference,
  setLanguagePreference,
} from "@/storage/preferenceStorage";
import { debugError, debugLog } from "@/utils/debug";

/**
 * Storage health check: Validates localStorage availability and quota
 * Runs on initialization and logs warnings if storage is unavailable
 */
function checkStorageHealth() {
  try {
    const testKey = `_health_${Date.now()}`;
    localStorage.setItem(testKey, "1");
    const stored = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    if (stored !== "1") {
      throw new Error("Storage read/write mismatch");
    }
    debugLog("✅ localStorage health check passed");
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    debugError(`⚠️ localStorage unavailable or quota exceeded: ${errorMsg}`);
    return false;
  }
}

// Run health check on module load
const storageHealthy = checkStorageHealth();

export type { ChatMessage };

export const client = signal<Client>();
export const agent = signal<Agent>();
export const workforce = signal<Workforce>();
export const task = signal<Task<any, any>>();

/**
 * Chat messages signal with hydrated data from localStorage
 * Loads previous session messages on initialization
 */
export const messages = signal<ChatMessage[]>(getStoredSessionMessages());

export const draftMessage = signal("");
export const isAgentTyping = signal(false);
export const agentTypingTimedOut = signal(false);
export const connectionError = signal<string>("");
export const hasMessages = computed(() => messages.value.length > 0);

/**
 * Dark mode preference signal
 * Persists to localStorage and applies to document element
 */
export const isDarkMode = signal(
  getDarkModePreference() ??
    window.matchMedia("(prefers-color-scheme: dark)").matches,
);

/**
 * Preferred language signal
 * Defaults to English (en) if not set
 */
export const preferredLanguage = signal(getLanguagePreference());

export const isSidebarOpen = signal(false);
export const isSidebarCollapsed = signal(false);

export const agentName = computed(
  () => agent.value?.name ?? workforce.value?.name,
);
export const agentInitials = computed(() =>
  agentName.value
    ?.split(/\W+/)
    .slice(0, 2)
    .map((s) => s.toLocaleUpperCase().charAt(0))
    .join(""),
);
export const agentAvatar = computed(() => agent.value?.avatar);
export const agentDescription = computed(() => agent.value?.description);

/**
 * Persist dark mode preference
 * Applies dark class to document element for styling
 */
effect(() => {
  setDarkModePreference(isDarkMode.value);
  if (isDarkMode.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
});

/**
 * Persist language preference
 */
effect(() => {
  setLanguagePreference(preferredLanguage.value);
});

/**
 * Load workforce or agent when client is available
 * Handles connection errors and provides user feedback
 */
effect(() => {
  if (client.value) {
    if (WORKFORCE_ID) {
      Workforce.get(WORKFORCE_ID, client.value)
        .then((w) => {
          workforce.value = w;
          connectionError.value = "";
          debugLog("Workforce loaded successfully", { id: WORKFORCE_ID });
        })
        .catch((error) => {
          debugError("Failed to load workforce", error);
          connectionError.value =
            "Could not connect to the Relevance AI workforce. " +
            "Check your .env values and workforce access.";
        });
    } else if (AGENT_ID) {
      Agent.get(AGENT_ID, client.value)
        .then((a) => {
          agent.value = a;
          connectionError.value = "";
          debugLog("Agent loaded successfully", { id: AGENT_ID });
        })
        .catch((error) => {
          debugError("Failed to load agent", error);
          connectionError.value =
            "Could not connect to the Relevance AI agent. " +
            "Check your .env values and agent access.";
        });
    } else {
      connectionError.value =
        "Missing VITE_WORKFORCE_ID (or VITE_AGENT_ID) in .env.";
    }
  }
});

/**
 * Handle incoming messages from task/agent
 * Updates local state and UI with new messages
 * Replaces optimistic user message with actual response
 */
effect(() => {
  const t = task.value;

  if (t) {
    const handleMessage = ({ detail }: any) => {
      const { message } = detail as { message: ChatMessage };
      const msgs = messages.value;
      const optimistic = msgs.find(
        (m) => m.type === "user-message" && m.id === "optimistic",
      );

      if (optimistic) {
        const i = msgs.indexOf(optimistic);
        const copy = msgs.concat();
        copy.splice(i, 1, message);

        messages.value = copy;
        isAgentTyping.value = true;
      } else {
        messages.value = [...msgs, message];

        if (message.type === "agent-message") {
          isAgentTyping.value = false;
        }
      }
    };

    (t as any).addEventListener("message", handleMessage);

    return () => {
      (t as any).removeEventListener("message", handleMessage);
      t?.unsubscribe();
    };
  }
});

// ── Page navigation ──────────────────────────────────────────────────────────

export type AppPage =
  | "chat"
  | "drafts"
  | "coming-soon"
  | "agents"
  | "heritage"
  | "fantasy"
  | "social"
  | "bi"
  | "youth"
  | "weather"
  | "shared-itinerary";

export const currentPage = signal<AppPage>("chat");
export const currentShareId = signal<string>("");

// ── Session & Draft Management ──────────────────────────────────────────────

export const userId = signal(getOrCreateUserId());
export const savedDrafts = signal<SavedDraft[]>(getAllDrafts());
export const showEmailExportModal = signal(false);
export const showShareModal = signal(false);
export const showDraftsPanel = signal(false);
export const emailForExport = signal("");
export const shareUrl = signal("");
export const currentItinerary = signal<any>(null);
export const canShareItinerary = computed(
  () => showShareModal.value && !!currentItinerary.value,
);

/**
 * Persist current chat session to localStorage for continuity
 * Updates storage whenever messages change
 */
effect(() => {
  saveSessionMessages(messages.value);
});

// 45-second timeout for long-running workforce requests
let _typingTimer: ReturnType<typeof setTimeout> | null = null;

effect(() => {
  if (_typingTimer !== null) {
    clearTimeout(_typingTimer);
    _typingTimer = null;
  }
  if (isAgentTyping.value) {
    agentTypingTimedOut.value = false;
    _typingTimer = setTimeout(() => {
      _typingTimer = null;
      isAgentTyping.value = false;
      agentTypingTimedOut.value = true;
    }, 45_000);
  }
});

// ── New Intake Flow Signals ─────────────────────────────────────────────────
import type {
  IntakeMessage,
  IntakeFormDataNew,
  ItineraryOutputNew,
  AppRoute,
} from "./types";

// Routing — controls which screen renders — 'intake' or 'chat':
export const currentRoute = signal<AppRoute>("intake");

// Null until form submitted and validated:
export const intakeFormData = signal<IntakeFormDataNew | null>(null);

// True while form is submitting — locks submit button:
export const isIntakeSubmitting = signal<boolean>(false);

// True after successful submission — prevents re-submission:
export const isIntakeComplete = signal<boolean>(false);

// New message interface for the intake flow (separate from ChatMessage):
// NEVER mutate with .push() — always replace array reference:
export const intakeMessages = signal<IntakeMessage[]>([]);

// Transport mutex — blocks duplicate send calls:
export const isSending = signal<boolean>(false);

// UI indicator — controls AgentThinkingBubble only:
export const isAgentThinking = signal<boolean>(false);

// One-shot guard — prevents re-appending user message:
export const hasUserMessageBeenAdded = signal<boolean>(false);

// True only during initial intake processing on chat mount:
export const isProcessingIntake = signal<boolean>(false);

// Null until agent produces final itinerary:
export const itineraryOutput = signal<ItineraryOutputNew | null>(null);

// True when chat is ready to accept user input:
export const isChatInputEnabled = computed<boolean>(
  () =>
    !isSending.value &&
    !isAgentThinking.value &&
    !isProcessingIntake.value &&
    isIntakeComplete.value,
);
