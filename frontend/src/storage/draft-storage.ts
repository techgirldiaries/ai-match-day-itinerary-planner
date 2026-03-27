/**
 * Draft itinerary persistence
 * Saves and retrieves draft itineraries from localStorage
 */

import type { ChatMessage } from "@/core/types";

const DRAFTS_STORAGE_KEY = "ltfc-draft-itineraries";
const CURRENT_DRAFT_KEY = "ltfc-current-draft";

export interface SavedDraft {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  exportedAt?: string;
}

interface SerializedChatMessage {
  id: string;
  type: string;
  text: string;
  createdAt: string;
}

interface SerializedDraft {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: SerializedChatMessage[];
  exportedAt?: string;
}

function hydrateMessage(raw: SerializedChatMessage): ChatMessage {
  return {
    id: raw.id,
    type: raw.type as "user-message" | "agent-message" | "streaming-message",
    text: raw.text,
    createdAt: new Date(raw.createdAt),
    isAgent: () => raw.type === "agent-message",
  };
}

function serializeMessage(message: ChatMessage): SerializedChatMessage {
  return {
    id: message.id,
    type: message.type,
    text: message.text,
    createdAt: message.createdAt.toISOString(),
  };
}

function deserializeDraft(raw: SerializedDraft): SavedDraft {
  return {
    id: raw.id,
    title: raw.title,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    messages: Array.isArray(raw.messages)
      ? raw.messages.map(hydrateMessage)
      : [],
    exportedAt: raw.exportedAt,
  };
}

function serializeDraft(draft: SavedDraft): SerializedDraft {
  return {
    id: draft.id,
    title: draft.title,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    messages: draft.messages.map(serializeMessage),
    exportedAt: draft.exportedAt,
  };
}

/**
 * Save current chat conversation as a draft
 */
export function saveDraft(messages: ChatMessage[], title?: string): SavedDraft {
  const draftId = `draft-${Date.now()}`;
  const now = new Date().toISOString();

  const draft: SavedDraft = {
    id: draftId,
    title: title || `Itinerary ${new Date().toLocaleDateString()}`,
    createdAt: now,
    updatedAt: now,
    messages,
  };

  // Add to drafts list
  const drafts = getAllDrafts();
  drafts.push(draft);
  localStorage.setItem(
    DRAFTS_STORAGE_KEY,
    JSON.stringify(drafts.map(serializeDraft)),
  );

  // Also update current draft for quick access
  localStorage.setItem(
    CURRENT_DRAFT_KEY,
    JSON.stringify(serializeDraft(draft)),
  );

  return draft;
}

/**
 * Get all saved drafts
 */
export function getAllDrafts(): SavedDraft[] {
  try {
    const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as SerializedDraft[]) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(deserializeDraft);
  } catch (_) {
    return [];
  }
}

/**
 * Get current draft (most recent)
 */
export function getCurrentDraft(): SavedDraft | null {
  try {
    const stored = localStorage.getItem(CURRENT_DRAFT_KEY);
    if (!stored) return null;
    return deserializeDraft(JSON.parse(stored) as SerializedDraft);
  } catch (_) {
    return null;
  }
}

/**
 * Get a specific draft by ID
 */
export function getDraftById(id: string): SavedDraft | null {
  const drafts = getAllDrafts();
  return drafts.find((d) => d.id === id) || null;
}

/**
 * Update draft title
 */
export function updateDraftTitle(
  id: string,
  newTitle: string,
): SavedDraft | null {
  const drafts = getAllDrafts();
  const draft = drafts.find((d) => d.id === id);
  if (!draft) return null;

  draft.title = newTitle;
  draft.updatedAt = new Date().toISOString();
  localStorage.setItem(
    DRAFTS_STORAGE_KEY,
    JSON.stringify(drafts.map(serializeDraft)),
  );

  if (getCurrentDraft()?.id === id) {
    localStorage.setItem(
      CURRENT_DRAFT_KEY,
      JSON.stringify(serializeDraft(draft)),
    );
  }

  return draft;
}

/**
 * Delete a draft
 */
export function deleteDraft(id: string): boolean {
  const drafts = getAllDrafts();
  const filtered = drafts.filter((d) => d.id !== id);
  localStorage.setItem(
    DRAFTS_STORAGE_KEY,
    JSON.stringify(filtered.map(serializeDraft)),
  );

  if (getCurrentDraft()?.id === id) {
    localStorage.removeItem(CURRENT_DRAFT_KEY);
  }

  return filtered.length < drafts.length;
}

/**
 * Mark draft as exported (for email export tracking)
 */
export function markDraftExported(id: string): SavedDraft | null {
  const drafts = getAllDrafts();
  const draft = drafts.find((d) => d.id === id);
  if (!draft) return null;

  draft.exportedAt = new Date().toISOString();
  localStorage.setItem(
    DRAFTS_STORAGE_KEY,
    JSON.stringify(drafts.map(serializeDraft)),
  );
  return draft;
}
