/**
 * Message storage and persistence management
 * Handles serialization, deserialization, and localStorage operations for chat messages
 */

import type { Message } from "@/core/types";
import { STORAGE_KEYS } from "@/config/formConfig";

/**
 * Hydrate a chat message from stored JSON format
 * Reconstructs a Message object from parsed JSON data
 * @param data - Raw message data from storage
 * @returns Reconstructed Message object
 */
export function hydrateMessage(data: {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
  agentName?: string;
}): Message {
  return {
    id: data.id,
    role: data.role,
    content: data.content,
    timestamp: data.timestamp,
    agentName: data.agentName,
  };
}

/**
 * Retrieve stored session messages from localStorage
 * Safely handles missing or corrupted data with error recovery
 * @returns Array of hydrated Message objects
 */
export function getStoredSessionMessages(): Message[] {
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
 * @param messages - Array of Message objects to save
 */
export function saveSessionMessages(messages: Message[]): void {
  try {
    const serialized = messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
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
