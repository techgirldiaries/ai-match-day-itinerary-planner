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
