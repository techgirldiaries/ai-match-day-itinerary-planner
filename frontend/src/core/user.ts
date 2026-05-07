/**
 * Anonymous user session management
 * Generates a UUID for anonymous users and manages session metadata
 */

const USER_ID_STORAGE_KEY = "ltfc-anonymous-user-id";
const SESSION_METADATA_KEY = "ltfc-session-metadata";

/**
* Generate a v4 UUID using a cryptographically secure RNG
 */
function generateUUID(): string {
	if (typeof globalThis.crypto?.randomUUID === "function") {
    	return globalThis.crypto.randomUUID();
}
    const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);

  // RFC 4122 v4: set version and variant bits
  	bytes[6] = (bytes[6] & 0x0f) | 0x40;
  	bytes[8] = (bytes[8] & 0x3f) | 0x80;

  	const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
	}	
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
