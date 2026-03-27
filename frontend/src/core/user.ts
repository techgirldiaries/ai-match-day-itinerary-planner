/**
 * Anonymous user session management
 * Generates a UUID for anonymous users and manages session metadata
 */

const USER_ID_STORAGE_KEY = "ltfc-anonymous-user-id";
const SESSION_METADATA_KEY = "ltfc-session-metadata";

/**
 * Generate a v4 UUID
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create an anonymous user ID
 */
export function getOrCreateUserId(): string {
  let userId = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem(USER_ID_STORAGE_KEY, userId);
    recordSessionStart(userId);
  }
  return userId;
}

/**
 * Get the current user ID without creating one
 */
export function getCurrentUserId(): string | null {
  return localStorage.getItem(USER_ID_STORAGE_KEY);
}

/**
 * Record session metadata for analytics
 */
function recordSessionStart(userId: string): void {
  const metadata = {
    userId,
    sessionStartedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };
  sessionStorage.setItem(SESSION_METADATA_KEY, JSON.stringify(metadata));
}

/**
 * Get session metadata
 */
export function getSessionMetadata() {
  const stored = sessionStorage.getItem(SESSION_METADATA_KEY);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Clear user session (for logout in future auth phase)
 */
export function clearUserSession(): void {
  localStorage.removeItem(USER_ID_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_METADATA_KEY);
}
