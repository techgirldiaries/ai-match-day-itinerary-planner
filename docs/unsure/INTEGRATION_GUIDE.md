/\*\*

- INTEGRATION GUIDE - New Optimized Prompt
- How to integrate the new prompt with your Relevance AI agent and codebase
  \*/

export const INTEGRATION_GUIDE = `

# Integration Guide: Optimized LTFC Itinerary Planner Prompt

## Files Created

1. **agent-prompt-integrated.ts** - New optimized prompt with tool references
2. **relevance-ai-config.ts** - Configuration mapping for Relevance AI tools & stadiums
3. **This guide** - Integration instructions

---

## 🎯 Step 1: Update Relevance AI Agent (Platform)

### Copy New Prompt to Agent

1. Open https://relevance.ai
2. Navigate to: Your Project → LTFC Fan Itinerary Planner agent
3. Go to **"System Prompt"** or **"Instructions"** section
4. Copy the complete content from \`frontend/src/agent-prompt-integrated.ts\`
   - Look for the \`INTEGRATED_AGENT_PROMPT\` constant
5. Paste to replace the existing prompt
6. **Save** changes (should auto-apply)
7. **Test** with sample requests

---

## ✅ Step 2: Verify Frontend Integration

### Files Already In Place

The following files are ready and don't need changes:

- \`frontend/src/cache-routes-venues.ts\` ✅ (pre-computed data)
- \`frontend/src/components/hooks/useSendMessage.ts\` ✅ (timeout handling)
- \`frontend/src/TIMEOUT_OPTIMIZATION.ts\` ✅ (documentation)

### New Files to Use

- \`frontend/src/agent-prompt-integrated.ts\` ← Copy prompt from this
- \`frontend/src/relevance-ai-config.ts\` ← Reference for tool IDs & config

---

## 🔌 Step 3: Update Frontend to Use Config (Optional Enhancement)

### Import Configuration in Your Components

\`\`\`typescript
// In useSendMessage.ts or other components that need tool references
import { RELEVANCE_AI_CONFIG, RELEVANCE_TOOLS } from '@/relevance-ai-config';

// Example: Log tool configuration
console.log('Agent ID:', RELEVANCE_AI_CONFIG.agentId);
console.log('Timeout:', RELEVANCE_AI_CONFIG.timeoutMs);
console.log('Available tools:', Object.keys(RELEVANCE_TOOLS));
\`\`\`

### Example: Conditional Tool Usage

\`\`\`typescript
// Use tool strategy from config
import { TOOL_STRATEGY } from '@/relevance-ai-config';

// Respect max tool calls
if (parallelToolCalls.length <= TOOL_STRATEGY.maxToolCalls) {
executeInParallel(parallelToolCalls);
} else {
executeSequential(parallelToolCalls);
}
\`\`\`

---

## 📋 Testing Checklist

### Core Response (15-20 seconds target)

- [ ] "I'm going to Luton from London next Sunday, 2 people, £100 budget"
  - Expected: Match details + 3 transport options + venues + costs + privacy notice
  - Time: ~10-15 seconds

### Group Features

- [ ] "5 of us want to go as a group and split costs"
  - Expected: Core + group coordination + cost split + WhatsApp option
  - Time: ~15-22 seconds

### Loyalty Features

- [ ] "I'm an LTFC member, what discounts do I get?"
  - Expected: Core + loyalty section + member perks
  - Time: ~15-22 seconds

### International Request

- [ ] "I'm flying from France, need visa info"
  - Expected: Core + international section + visa requirements + currency
  - Time: ~20-28 seconds

### Real-Time Features

- [ ] "Can you set a reminder for the match?"
  - Expected: Core + calendar integration + reminder setup
  - Time: ~18-25 seconds

### Booking Request

- [ ] "Book everything for me - transport, hotel, match tickets"
  - Expected: Core + booking section + payment options + confirmations
  - Time: ~20-28 seconds

### Timeout Handling (Stress Test)

- [ ] Send multiple complex requests in succession
  - Expected: Some may retry, all should respond within 30s
  - Fallback: At least core response always visible

---

## 🚀 Deployment Steps

### Backend (if applicable)

If your backend needs to know about the agent config:

\`\`\`typescript
// backend/src/services/agentService.ts (example)
import { RELEVANCE_AI_CONFIG } from '../frontend-shared/relevance-ai-config';

const getAgentConfig = () => {
return {
agentId: RELEVANCE_AI_CONFIG.agentId,
projectId: RELEVANCE_AI_CONFIG.projectId,
timeout: RELEVANCE_AI_CONFIG.timeoutMs,
};
};
\`\`\`

### Frontend Build

\`\`\`bash

# Run dev server to test

npm run dev:frontend

# Build for production (if needed)

npm run build:frontend
\`\`\`

### Platform Verification

1. Go to Relevance AI agent
2. Check "Last Updated" timestamp
3. Send test message from chat interface
4. Monitor response time (should be <30s)
5. Check browser console for logs

---

## 📊 Performance Monitoring

### What to Watch

Monitor these metrics after deployment:

| Metric             | Target | Alert Threshold |
| ------------------ | ------ | --------------- |
| Core response time | 15-20s | >25s            |
| Advanced features  | 20-28s | >29s            |
| Timeout failures   | <2%    | >5%             |
| Tool calls         | 2 max  | >3              |
| Cache hit rate     | >80%   | <70%            |

### Browser Console Logs

The frontend logs optimization events (check F12):

\`\`\`
✅ "[Enable features: group, loyalty]" - Features detected
⏱️ "Agent timeout (attempt 1), retrying..." - First timeout
⚠️ "Using cached fallback data" - Fallback triggered
\`\`\`

---

## 🔑 Key Differences from Previous Prompt

| Feature           | Before           | Now                                   |
| ----------------- | ---------------- | ------------------------------------- |
| Tool references   | Abstract         | Concrete IDs from platform            |
| Core response     | 20s target       | 15-20s target                         |
| Advanced features | Optional mention | Explicit conditional triggers         |
| Data protection   | End section only | Always included                       |
| Timeout handling  | Agent-only       | Agent + Frontend retry logic          |
| Configuration     | Hardcoded        | Centralized in relevance-ai-config.ts |

---

## 🆘 Troubleshooting

### Prompt not working on platform?

1. Check tool IDs match (compare with agent config)
2. Ensure {{_actions.XXXXX}} format is correct
3. Verify agent name/ID in Relevance AI (should be 33cc59cb-3135-48c9-9ce6-9858d9cc54b6)
4. Clear agent cache: Agent settings → Reset cache
5. Try a simple test request first

### Tools not being called?

1. Check tool IDs in prompt match actual action IDs
2. View agent logs: Agent → Conversation logs
3. Verify keywords are detected (check user message)
4. Check tool availability: Agent configuration → Actions tab

### Still getting timeouts?

1. Enable graceful degradation (already in prompt)
2. Reduce number of parallel tool calls
3. Use more cached data vs API calls
4. Check if specific tool is slow (review logs)

### Privacy notice not showing?

1. Verify data protection section is in system prompt
2. Check if it's being cut off (view full response)
3. Ensure "Always: Include privacy notice" is followed
4. Test with simple basic request

---

## 📚 Files & Their Purpose

| File                       | Purpose                    | When to Edit                   |
| -------------------------- | -------------------------- | ------------------------------ |
| agent-prompt-integrated.ts | Main optimized prompt      | When prompt needs updates      |
| relevance-ai-config.ts     | Tool IDs, stadiums, routes | When config changes            |
| cache-routes-venues.ts     | Pre-computed data          | When venues/routes change      |
| useSendMessage.ts          | Frontend timeout handling  | When retry logic needs changes |
| agent-prompt-v2.ts         | Original simplified prompt | Keep for reference only        |

---

## ✨ Next Steps

1. **Immediate**: Copy \`INTEGRATED_AGENT_PROMPT\` to Relevance AI platform
2. **Test**: Run 6 test scenarios from checklist above
3. **Monitor**: Watch response times for next 24 hours
4. **Optimize**: If timeouts occur, review tool usage in logs
5. **Document**: Update your README with new prompt version

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Review Relevance AI agent logs
3. Verify all tool IDs match current agent configuration
4. Test with simple requests before complex ones

---

**Version**: 2.0-integrated  
**Updated**: 2026-03-27  
**Status**: Ready for deployment
`;

export default INTEGRATION_GUIDE;
