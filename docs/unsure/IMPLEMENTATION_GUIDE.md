# Refactoring Implementation Guide

## Quick Start for Developers

### Understanding the New Architecture

The codebase has been refactored into a modular, maintainable structure. Here's how to work with each new module:

## 📦 New Modules Created

### 1. **Configuration Module** (`src/config/formConfig.ts`)

Contains all application constants and configuration.

```typescript
import {
  TRANSPORT_OPTIONS,
  INTEREST_OPTIONS,
  CSS_CLASSES,
} from "@/config/formConfig";

// Use in components
TRANSPORT_OPTIONS.map((opt) => opt.emoji); // Get all emojis
CSS_CLASSES.header; // Get header styling
LANGUAGES.find((l) => l.code === "en"); // Find language by code
```

**When to use:**

- Get form option definitions
- Access CSS class strings
- Get language definitions
- Access brand colors and theme
- Get storage key constants

---

### 2. **Form Helpers** (`src/utils/formHelpers.ts`)

Type-safe form operations and lookups.

```typescript
import {
  getFanTypeLabel,
  getTravelStyleEmoji,
  getTransportEmojiMap,
  isValidTransportMode,
} from "@/utils/formHelpers";

// Usage
const label = getFanTypeLabel("loyal_hatter"); // "The \"Loyal Hatter\""
const emoji = getTravelStyleEmoji("premium"); // "✨"
const isValid = isValidTransportMode("train"); // true
```

**When to use:**

- Need to display form field labels
- Getting emojis for options
- Validating user input
- Building emoji maps
- Creating option lookups

---

### 3. **Date Utilities** (`src/utils/dateHelpers.ts`)

Type-safe date conversion and formatting.

```typescript
import {
  isoToGB,
  gbToISO,
  isValidISODate,
  getCurrentISODate,
} from "@/utils/dateHelpers";

// Usage
const gbDate = isoToGB("2024-12-25"); // "25/12/2024"
const isoDate = gbToISO("25/12/2024"); // "2024-12-25"
const valid = isValidISODate("2024-12-25"); // true
const today = getCurrentISODate(); // "2024-12-19"
```

**When to use:**

- Converting between date formats
- Validating date strings
- Getting current date
- Displaying dates to users in GB format

---

### 4. **String Utilities** (`src/utils/stringHelpers.ts`)

Text manipulation and formatting.

```typescript
import {
  truncate,
  toTitleCase,
  joinWithConjunction,
  pluralize,
  cleanWhitespace,
} from "@/utils/stringHelpers";

// Usage
truncate("Hello World Example", 11); // "Hello Wo..."
toTitleCase("hello world"); // "Hello World"
joinWithConjunction(["apples", "oranges", "bananas"]); // "apples, oranges, and bananas"
pluralize("person", 1); // "person"
pluralize("person", 2, "people"); // "people"
```

**When to use:**

- Formatting text for display
- Truncating long strings
- Converting case
- Joining lists naturally
- Smart pluralization

---

### 5. **Debug Logging** (`src/utils/debug.ts`)

Conditional debug logging system.

```typescript
import {
  debugLog,
  debugWarn,
  debugError,
  setDebugMode,
  logTiming,
} from "@/utils/debug";

// Usage
debugLog("Component mounted", { userId: 123 }); // Only if debug enabled
debugWarn("Deprecated API used"); // Warning in debug mode
debugError("Network error", networkError); // Error logging

// Performance measurement
const result = logTiming("API call", () => fetchData());

// Enable/disable debug at runtime
setDebugMode(true); // Enable debug logging for session
setDebugMode(false); // Disable debug logging

// Check debug status
if (isDebugEnabled()) {
  /* debug-only code */
}
```

**When to use:**

- Logging app state for debugging
- Performance monitoring
- Error investigation
- Development-only logging

**Enabling Debug Mode:**

```bash
# Build-time: Set environment variable
VITE_DEBUG=true npm run dev

# Runtime: Toggle in browser console
localStorage.setItem('debug_mode', 'true')
```

---

### 6. **Message Storage** (`src/storage/messageStorage.ts`)

Persistent message storage abstraction.

```typescript
import {
  getStoredSessionMessages,
  saveSessionMessages,
  getStoredMessageCount,
  clearSessionMessages,
  hydrateMessage,
} from "@/storage/messageStorage";

// Usage
const messages = getStoredSessionMessages(); // Retrieve chat history
saveSessionMessages(updatedMessages); // Persist messages
const count = getStoredMessageCount(); // How many messages saved
clearSessionMessages(); // Clear all stored messages
```

**When to use:**

- Loading/saving chat messages
- Accessing stored message count
- Clearing message history
- Message hydration

---

### 7. **Preference Storage** (`src/storage/preferenceStorage.ts`)

User preference management.

```typescript
import {
  getDarkModePreference,
  setDarkModePreference,
  getLanguagePreference,
  setLanguagePreference,
  clearAllPreferences,
} from "@/storage/preferenceStorage";

// Usage
const isDark = getDarkModePreference(); // Get dark mode state
setDarkModePreference(true); // Save dark mode preference
const lang = getLanguagePreference(); // Get chosen language
setLanguagePreference("es"); // Save language choice
clearAllPreferences(); // Reset all preferences
```

**When to use:**

- Getting user preferences
- Saving theme preference
- Saving language preference
- Resetting user preferences

---

### 8. **Custom Hooks** (`src/hooks/useCustomHooks.ts`)

Reusable component logic patterns.

```typescript
import {
  useField,
  useAsync,
  useToggle,
  usePrevious,
  useDebounce,
  useLocalStorage,
} from "@/hooks/useCustomHooks";

// Form field with validation
const field = useField("", (val) => val.length > 0 ? "" : "Required");
<input value={field.value} onInput={e => field.setValue(e.target.value)} />
{field.error && <p>{field.error}</p>}

// Async operations
const { data, loading, error, execute } = useAsync(fetchData);
<button onClick={execute}>Load</button>

// Toggle state
const { value: isOpen, toggle } = useToggle(false);

// Track previous value
const prevCount = usePrevious(count);

// Debounce
const debouncedSearch = useDebounce((q) => search(q), 300);

// localStorage integration
const [theme, setTheme] = useLocalStorage("theme", "light");
```

---

## 🔄 Refactored Components

### Modified Files

#### `intake-form.tsx`

- **Removed:** 5 hardcoded option arrays
- **Added:** Imports from `formConfig`
- **Benefit:** Reduced duplication, easier maintenance

#### `header.tsx`

- **Removed:** LANGUAGES array and inline CSS classes
- **Added:** Imports from `formConfig` (CSS_CLASSES, LANGUAGES)
- **Benefit:** Centralized styling and configuration

#### `app.tsx`

- **Removed:** Raw console.log statements
- **Added:** Debug utility imports
- **Benefit:** Professional logging, easier debugging

#### `signals.ts`

- **Removed:** Inline hydration and storage logic
- **Added:** messageStorage and preferenceStorage imports
- **Benefit:** Separated concerns, improved testability

---

## 🧪 Testing with New Modules

### Testing Form Helpers

```typescript
describe("formHelpers", () => {
  it("should get fan type label", () => {
    expect(getFanTypeLabel("loyal_hatter")).toBe('The "Loyal Hatter"');
  });

  it("should validate transport modes", () => {
    expect(isValidTransportMode("train")).toBe(true);
    expect(isValidTransportMode("invalid")).toBe(false);
  });
});
```

### Testing Date Utilities

```typescript
describe("dateHelpers", () => {
  it("should convert ISO to GB format", () => {
    expect(isoToGB("2024-12-25")).toBe("25/12/2024");
  });

  it("should validate ISO dates", () => {
    expect(isValidISODate("2024-12-25")).toBe(true);
    expect(isValidISODate("invalid")).toBe(false);
  });
});
```

### Testing Debug Logging

```typescript
describe("debug", () => {
  it("should log when debug enabled", () => {
    setDebugMode(true);
    const spy = jest.spyOn(console, "log");
    debugLog("test");
    expect(spy).toHaveBeenCalled();
  });

  it("should not log when debug disabled", () => {
    setDebugMode(false);
    const spy = jest.spyOn(console, "log");
    debugLog("test");
    expect(spy).not.toHaveBeenCalled();
  });
});
```

---

## 📋 Common Tasks

### Adding a New Transport Mode

1. Update `formConfig.ts` TRANSPORT_OPTIONS
2. Add translation keys in `i18n/translations/*.json`
3. No component changes needed!

### Adding a New Language

1. Add language to LANGUAGES in `formConfig.ts`
2. Create translation JSON file in `i18n/translations/`
3. Update `i18n/translations.ts` to import new language

### Using Dark Mode Preference

```typescript
import { isDarkMode } from "@/signals";
import { setDarkModePreference } from "@/storage/preferenceStorage";

// Access signal
const isDark = isDarkMode.value;

// Toggle with persistence
isDarkMode.value = !isDarkMode.value; // Signal update triggers preference save
```

### Logging Debug Information

```typescript
import { debugLog, setDebugMode } from "@/utils/debug";

// Enable debug for development
setDebugMode(true);

// Log structured data
debugLog("User action", {
  action: "login",
  userId: 123,
  timestamp: new Date(),
});
```

---

## 🚀 Performance Tips

### Debug Logging

- Default off in production (enable with VITE_DEBUG)
- Use `debugLog()` instead of `console.log()`
- No performance impact when disabled

### Storage Operations

- Storage modules batch updates when possible
- Error handling prevents undefined behavior
- Use `getStoredMessageCount()` for validation

### Custom Hooks

- `useDebounce()` prevents excessive API calls
- `useLocalStorage()` caches values efficiently
- `usePrevious()` enables change detection

---

## ⚠️ Common Mistakes

### ❌ Wrong: Hardcoded option in component

```typescript
const options = [{ value: "train", label: "Train" }];
```

### ✅ Right: Import from config

```typescript
import { TRANSPORT_OPTIONS } from "@/config/formConfig";
```

### ❌ Wrong: String manipulation

```typescript
const gbDate = iso.split("-").reverse().join("/");
```

### ✅ Right: Use date helper

```typescript
import { isoToGB } from "@/utils/dateHelpers";
const gbDate = isoToGB(iso);
```

### ❌ Wrong: Direct localStorage access

```typescript
localStorage.setItem("darkMode", JSON.stringify(isDark));
```

### ✅ Right: Use storage module

```typescript
import { setDarkModePreference } from "@/storage/preferenceStorage";
setDarkModePreference(isDark);
```

---

## 📚 File Organization

```
frontend/src/
├── config/
│   └── formConfig.ts           # Application constants
├── utils/
│   ├── formHelpers.ts          # Form utilities
│   ├── dateHelpers.ts          # Date conversion
│   ├── stringHelpers.ts        # String utilities
│   └── debug.ts                # Debug logging
├── storage/
│   ├── messageStorage.ts       # Message persistence
│   └── preferenceStorage.ts    # Preference management
├── hooks/
│   └── useCustomHooks.ts       # Reusable patterns
└── components/
    ├── intake-form.tsx         # Refactored - uses config
    ├── header.tsx              # Refactored - uses config
    └── app.tsx                 # Refactored - uses debug
```

---

## 🔗 Module Dependency Graph

```
Components
    ↓
formHelpers, dateHelpers, stringHelpers
    ↓
formConfig, debug, storage modules
    ↓
External (localStorage, @preact/signals)
```

---

## 📖 Further Reading

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/)
- [Preact Signals Documentation](https://preactjs.com/guide/v10/signals)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Last Updated:** 2024
**Refactoring Version:** 1.0
**Status:** ✅ All modules compiled and tested
