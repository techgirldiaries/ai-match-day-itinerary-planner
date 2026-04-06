# Critical Incompatibilities: Prompt vs. Codebase

## 1. Message Interface Mismatch

### Current Implementation (core/types.ts)

```typescript
export interface ChatMessage {
  id: string;
  type: "user-message" | "agent-message" | "streaming-message";
  text: string;
  createdAt: Date;
  agentName?: string;
  isAgent: () => boolean;
}
```

### Prompt Expects

```typescript
interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
  isThinking?: boolean;
}
```

### Impact

- Complete interface restructuring required
- Change `type` enum → `role` union type
- Change `text` → `content`
- Change `createdAt: Date` → `timestamp: number`
- Remove `isAgent()` method, replace with exhaustive `role` type narrowing
- Remove `agentName` (passed separately)

---

## 2. Duplicate Message Bug Is Present

### Location

`src/components/hooks/useSendMessage.ts` lines 101-177

### Problem

```typescript
// Line 101-131: First user message
if (initialAttempt) {
  messages.value = [...messages.value, { id: "optimistic", ... }];
}

// Lines 153-177: Retry creates system + user message
messages.value = [...messages.value, { id: `system-retry-${msgHash}`, ... }];
messages.value = [...messages.value, { id: `retry-user-${msgHash}`, ... }];
```

### Root Cause

- Uses ref-based retry tracking: `retryCount.current[msgHash]`
- If `sendMessage()` called again before retry completes, UUID-style deduplication fails
- No guard against `initialAttempt=true` state resetting during retry

### Fix Required

- Implement Set-based message ID deduplication before appending
- Add strict guard: `if (!messages.value.some(m => m.id === userMessage.id))`

---

## 3. Missing `isSending` Mutex Signal

### Current Pattern (signals.ts)

```typescript
export const isAgentTyping = signal(false);

// In useSendMessage.ts:
if (isAgentTyping.value) return;
isAgentTyping.value = true; // Mutex + UI indicator mixed
```

### Prompt Requires

```typescript
export const isSending = signal<boolean>(false); // Mutex only
export const isAgentThinking = signal<boolean>(false); // UI indicator only
```

### Impact

- Separates transport concerns from UI rendering
- Prevents UI from becoming invisible during message processing
- Enables independent timeout handling

---

## 4. ID Generation Pattern Mismatch

### Current Code (useSendMessage.ts)

```typescript
{
  id: "optimistic",  // ← String literal, not unique
  type: "user-message",
  // ...
}
```

### Prompt Requires

```typescript
{
  id: crypto.randomUUID(),  // Unique UUID for every message
  role: 'user',
  // ...
}
```

### Impact

- "optimistic" ID reused across all messages → merge/dedup failures
- UUID required for global uniqueness guarantee
- UUID needed for reliable deduplication guards

---

## 5. Type-Based Role Checking vs. Method Dispatch

### Current Pattern (chat-route.tsx)

```typescript
<For each={messages}>
  {(m) =>
    m.isAgent() ? (
      <AgentMessage message={m} />
    ) : (
      <UserMessage message={m} />
    )
  }
</For>
```

### Prompt Requires (Strict TypeScript)

```typescript
{messages.value.map((message: Message) => {
  // Exhaustive handling of union type role
  if (message.role === 'agent') {
    return <AgentMessage message={message} />;
  } else if (message.role === 'user') {
    return <UserMessage message={message} />;
  }
  // TypeScript enforces all branches covered
})}
```

### Impact

- Method dispatch (`isAgent()`) doesn't enable strict type narrowing
- Union type on `role` property enforces exhaustive handling at compile time
- Prevents silent failures from missing role types

---

## 6. Thinking Bubble Component (Partially Misaligned)

### Current Implementation (agent-typing.tsx)

```typescript
export function AgentTyping() {
  return (
    <output class="flex items-start gap-x-2 ...">
      {/* Full agent avatar + name + message */}
    </output>
  );
}
```

### Prompt Expects (Minimal)

```typescript
const AgentThinkingBubble: FunctionComponent = () => (
  <div class="flex items-center gap-2 p-3 rounded-lg ...">
    <Loader2 class="w-4 h-4 animate-spin text-orange-500" />
    <span class="text-sm text-gray-400">Hatters AI is thinking...</span>
  </div>
);
```

### Impact

- Current version is feature-complete but bloated for thinking state
- Prompt expects lightweight placeholder (no avatar, no agent name)
- However, current approach IS correct (not in messages array)—just style difference

---

## Summary of Changes Required

| File                                               | Changes                                                                                                                            | Severity     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **src/core/types.ts**                              | Rename `ChatMessage` → `Message`; change `type` → `role`; `text` → `content`; `createdAt` → `timestamp`; remove `isAgent()` method | **CRITICAL** |
| **src/core/signals.ts**                            | Add separate `isSending` and `isAgentThinking` signals; keep `isAgentTyping` for UI                                                | **HIGH**     |
| **src/components/hooks/useSendMessage.ts**         | Refactor deduplication logic with UUID generation; update retry handling; use new signal names                                     | **HIGH**     |
| **src/components/pages/app-routes/chat-route.tsx** | Update message rendering loop; use exhaustive `role` type narrowing                                                                | **MEDIUM**   |
| **src/components/user-message.tsx**                | Update prop interface; use new `Message` shape                                                                                     | **MEDIUM**   |
| **src/components/agent-message.tsx**               | Update prop interface; use new `Message` shape                                                                                     | **MEDIUM**   |

---

## Estimated Effort

- **Lines changed**: 80–120 across 6 files
- **Test updates**: Yes (retry logic, dedup guards)
- **Risk**: Medium (affects core chat state machine)
- **Breaking**: Yes (interface refactor)
