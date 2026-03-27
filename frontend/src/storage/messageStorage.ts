/**
 * Message storage and persistence management
 * Handles serialization, deserialization, and localStorage operations for chat messages
 */

import type { ChatMessage } from "@/core/signals";
import { STORAGE_KEYS } from "@/config/formConfig";

/**
 * Hydrate a chat message from stored JSON format
 * Reconstructs a ChatMessage object with proper type methods from parsed JSON data
 * @param data - Raw message data from storage
 * @returns Reconstructed ChatMessage with proper isAgent method
 */
export function hydrateMessage(data: {
  id: string;
  type: string;
  text: string;
  createdAt: string;
  agentName?: string;
}): ChatMessage {
  return {
    id: data.id,
    type: data.type as ChatMessage["type"],
    text: data.text,
    createdAt: new Date(data.createdAt),
    agentName: data.agentName,
    isAgent: function () {
      return this.type === "agent-message" || this.type === "streaming-message";
    },
  };
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
    const serialized = messages.map((msg) => ({
      id: msg.id,
      type: msg.type,
      text: msg.text,
      createdAt: msg.createdAt.toISOString(),
      agentName: msg.agentName,
    }));

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
