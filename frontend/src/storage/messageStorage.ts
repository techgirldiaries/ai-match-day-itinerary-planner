/**
 * Message storage and persistence management
 * Handles serialization, deserialization, and localStorage operations for chat messages
 */

import { STORAGE_KEYS } from "@/config/formConfig";
import type { ChatMessage, IntakeMessage, StorageMessage } from "@/core/types";

/**
 * Convert storage format to ChatMessage
 */
function storageToChatMessage(data: StorageMessage): ChatMessage {
  return {
    id: data.id,
    type: data.role === "user" ? "user-message" : "agent-message",
    text: data.content,
    createdAt: new Date(data.timestamp),
    agentName: data.agentName,
    isAgent: () => data.role === "agent",
  };
}

/**
 * Convert ChatMessage to storage format
 */
function chatMessageToStorage(msg: ChatMessage): StorageMessage {
  return {
    id: msg.id,
    role: msg.isAgent() ? "agent" : "user",
    content: msg.text,
    timestamp: msg.createdAt.getTime(),
    agentName: msg.agentName,
  };
}

/**
 * Hydrate a chat message from stored JSON format
 * Reconstructs a ChatMessage object from parsed JSON data
 * @param data - Raw message data from storage
 * @returns Reconstructed ChatMessage object
 */
export function hydrateMessage(data: {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
  agentName?: string;
}): ChatMessage {
  return storageToChatMessage(data as StorageMessage);
}

/**
 * Retrieve stored session messages from localStorage
 * Safely handles missing or corrupted data with error recovery
 * @returns Array of hydrated ChatMessage objects
 */
export function getStoredSessionMessages(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.sessionMessages);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(hydrateMessage);
  } catch (error) {
    console.error(
      `Failed to load session messages from localStorage: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return [];
  }
}

/**
 * Save messages to localStorage
 * Handles serialization and error handling for persistence
 * @param messages - Array of ChatMessage objects to save
 */
export function saveSessionMessages(messages: ChatMessage[]): void {
  try {
    const serialized = messages.map(chatMessageToStorage);

    localStorage.setItem(
      STORAGE_KEYS.sessionMessages,
      JSON.stringify(serialized),
    );
  } catch (error) {
    console.error(
      `Failed to save session messages to localStorage: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Clear all stored session messages from localStorage
 */
export function clearSessionMessages(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.sessionMessages);
  } catch (error) {
    console.error(
      `Failed to clear session messages: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get the count of stored messages
 * @returns Number of stored messages
 */
export function getStoredMessageCount(): number {
  const messages = getStoredSessionMessages();
  return messages.length;
}

// ── Intake Messages Persistence ───────────────────────────────────────────────

/**
 * Retrieve stored intake messages from localStorage
 * Safely handles missing or corrupted data with error recovery
 * @returns Array of intake messages
 */
export function getStoredIntakeMessages(): IntakeMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.intakeMessages);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    // Validate structure of each message
    return parsed.filter(
      (m: unknown) =>
        m &&
        typeof m === "object" &&
        "id" in m &&
        "role" in m &&
        "content" in m &&
        "timestamp" in m,
    ) as IntakeMessage[];
  } catch (error) {
    console.error(
      `Failed to load intake messages from localStorage: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return [];
  }
}

/**
 * Save intake messages to localStorage
 * Handles serialization and error handling for persistence
 * @param messages - Array of IntakeMessage objects to save
 */
export function saveIntakeMessages(messages: IntakeMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.intakeMessages, JSON.stringify(messages));
  } catch (error) {
    console.error(
      `Failed to save intake messages to localStorage: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Clear all stored intake messages from localStorage
 */
export function clearIntakeMessages(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.intakeMessages);
  } catch (error) {
    console.error(
      `Failed to clear intake messages: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ── Hybrid Storage: localStorage + Backend Persistence ───────────────────────

/**
 * Get the backend API base URL
 * @returns Backend API base URL
 */
function getBackendUrl(): string {
  return (
    import.meta.env.VITE_BACKEND_URL ||
    (() => {
      const protocol = window.location.protocol;
      const host = window.location.hostname;
      const port = 3000;
      return `${protocol}//${host}:${port}`;
    })()
  );
}

/**
 * Sync a message to the backend database
 * Non-blocking async operation - message already saved locally
 * @param message - StorageMessage to sync
 * @param userId - User ID for server-side storage
 */
export async function syncMessageToBackend(
  message: StorageMessage,
  userId: string,
): Promise<void> {
  if (!userId) {
    console.warn("Cannot sync message: missing userId");
    return;
  }

  try {
    const response = await fetch(
      `${getBackendUrl()}/api/conversations/${userId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId,
        },
        body: JSON.stringify(message),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.warn(`Failed to sync message ${message.id} to backend:`, error);
    } else {
      console.log(`Message ${message.id} synced to backend successfully`);
    }
  } catch (error) {
    console.warn(
      `Network error syncing message ${message.id} to backend:`,
      error,
    );
    // Message is already saved locally, will retry on next sync attempt
  }
}

/**
 * Fetch all messages from backend database
 * Used when localStorage is empty or on app startup
 * @param userId - User ID to fetch messages for
 * @returns Array of messages from backend
 */
export async function fetchMessagesFromBackend(
  userId: string,
): Promise<StorageMessage[]> {
  if (!userId) {
    console.warn("Cannot fetch messages: missing userId");
    return [];
  }

  try {
    const response = await fetch(
      `${getBackendUrl()}/api/conversations/${userId}/messages`,
      {
        method: "GET",
        headers: {
          "X-User-ID": userId,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.warn("Failed to fetch messages from backend:", error);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data.messages) ? data.messages : [];
  } catch (error) {
    console.warn("Network error fetching messages from backend:", error);
    return [];
  }
}

/**
 * Load messages with hybrid strategy: localStorage first, backend fallback
 * FAST: Returns immediately with localStorage data
 * RESILIENT: Merges with backend in background
 * @param userId - User ID for backend sync
 * @returns Array of ChatMessage objects
 */
export async function loadMessagesHybrid(
  userId: string,
): Promise<ChatMessage[]> {
  // Priority 1: Load from localStorage (IMMEDIATE)
  const localMessages = getStoredSessionMessages();

  if (localMessages.length > 0) {
    console.log(
      `[Hybrid] Loaded ${localMessages.length} messages from localStorage`,
    );

    // Priority 2: Fetch from backend in background (non-blocking)
    if (userId) {
      fetchMessagesFromBackend(userId)
        .then((backendMessages) => {
          if (backendMessages.length > 0) {
            // Merge: keep local, add any newer backend messages
            const localIds = new Set(localMessages.map((m) => m.id));
            const newMessages = backendMessages.filter(
              (m) => !localIds.has(m.id),
            );

            if (newMessages.length > 0) {
              console.log(
                `[Hybrid] Merged ${newMessages.length} new messages from backend`,
              );
              const merged = [
                ...localMessages,
                ...newMessages.map(hydrateMessage),
              ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

              saveSessionMessages(merged);
            }
          }
        })
        .catch((error) => {
          console.warn(
            "[Hybrid] Background sync failed, using local version:",
            error,
          );
        });
    }

    return localMessages;
  }

  // Fallback: localStorage is empty, fetch from backend
  console.log("[Hybrid] localStorage empty, fetching from backend...");

  if (!userId) {
    console.warn("[Hybrid] No userId provided, cannot fetch from backend");
    return [];
  }

  try {
    const backendMessages = await fetchMessagesFromBackend(userId);
    if (backendMessages.length > 0) {
      const hydrated = backendMessages.map(hydrateMessage);
      saveSessionMessages(hydrated); // Cache locally
      console.log(`[Hybrid] Restored ${hydrated.length} messages from backend`);
      return hydrated;
    }
  } catch (error) {
    console.error("[Hybrid] Failed to fetch from backend:", error);
  }

  return [];
}

/**
 * Hybrid save: localStorage immediately, backend in background
 * This is your primary save method for new messages
 * @param message - ChatMessage to save
 * @param userId - User ID for server sync
 */
export async function saveMessageHybrid(
  message: ChatMessage,
  userId: string,
): Promise<void> {
  // Priority 1: Save to localStorage (IMMEDIATE)
  const storageMsg = chatMessageToStorage(message);
  storageMsg.syncStatus = "local";

  const current = getStoredSessionMessages();
  const updated = [...current, message];
  saveSessionMessages(updated);
  console.log(`Message saved locally: ${message.id}`);

  // Priority 2: Sync to backend (ASYNC, non-blocking)
  if (userId) {
    syncMessageToBackend(storageMsg, userId)
      .then(() => {
        console.log(`Message synced to backend: ${message.id}`);
      })
      .catch(() => {
        console.warn(`Failed to sync message to backend: ${message.id}`);
        // Message remains in localStorage, will retry on next batch
      });
  }
}
