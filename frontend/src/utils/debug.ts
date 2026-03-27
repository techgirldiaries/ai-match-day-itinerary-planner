/**
 * Debug logging utility
 * Provides conditional logging based on environment or configuration
 * Helps with development debugging while keeping production clean
 */

/**
 * Check if debug mode is enabled
 * Can be enabled via VITE_DEBUG environment variable or localStorage
 * @returns True if debug logging should be enabled
 */
export function isDebugEnabled(): boolean {
  // Check environment variable first (build-time)
  if (import.meta.env.VITE_DEBUG === "true") return true;

  // Check localStorage for runtime debug toggle
  try {
    return localStorage.getItem("debug_mode") === "true";
  } catch {
    return false;
  }
}

/**
 * Enable or disable debug mode in current session
 * @param enable - Whether to enable debug mode
 */
export function setDebugMode(enable: boolean): void {
  try {
    if (enable) {
      localStorage.setItem("debug_mode", "true");
    } else {
      localStorage.removeItem("debug_mode");
    }
  } catch (error) {
    console.error("Failed to set debug mode:", error);
  }
}

/**
 * Log a debug message if debug mode is enabled
 * @param message - Message to log
 * @param data - Optional data to include in log
 * @example
 * debugLog("Component mounted", { userId: 123 })
 */
export function debugLog(message: string, data?: unknown): void {
  if (isDebugEnabled()) {
    if (data !== undefined) {
      console.log(`[DEBUG] ${message}`, data);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  }
}

/**
 * Log a debug warning if debug mode is enabled
 * @param message - Warning message to log
 * @param data - Optional data to include in log
 */
export function debugWarn(message: string, data?: unknown): void {
  if (isDebugEnabled()) {
    if (data !== undefined) {
      console.warn(`[DEBUG WARN] ${message}`, data);
    } else {
      console.warn(`[DEBUG WARN] ${message}`);
    }
  }
}

/**
 * Log a debug error if debug mode is enabled
 * @param message - Error message to log
 * @param error - Optional error object
 */
export function debugError(message: string, error?: Error): void {
  if (isDebugEnabled()) {
    if (error) {
      console.error(`[DEBUG ERROR] ${message}`, error);
    } else {
      console.error(`[DEBUG ERROR] ${message}`);
    }
  }
}

/**
 * Log app initialization state (always logs in debug mode)
 * @param state - State object to log
 */
export function logAppState(state: Record<string, unknown>): void {
  debugLog("App State", state);
}

/**
 * Measure and log execution time of a function (debug mode only)
 * @param label - Label for the timing
 * @param fn - Function to measure
 * @returns The return value of fn
 * @example
 * const result = logTiming("API call", () => fetchData())
 */
export function logTiming<T>(label: string, fn: () => T): T {
  if (!isDebugEnabled()) return fn();

  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  console.log(`[DEBUG TIMING] ${label}: ${duration.toFixed(2)}ms`);
  return result;
}

/**
 * Async version of logTiming for async functions
 * @param label - Label for the timing
 * @param fn - Async function to measure
 * @returns Promise resolving to the return value of fn
 */
export async function logTimingAsync<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (!isDebugEnabled()) return fn();

  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  console.log(`[DEBUG TIMING] ${label}: ${duration.toFixed(2)}ms`);
  return result;
}
