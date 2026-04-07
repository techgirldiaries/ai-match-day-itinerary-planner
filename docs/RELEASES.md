# Release Updates & Changes

## April 7, 2026 - Dead Code Cleanup & Routing Fixes

**Removed unused files:**

- `frontend/src/utils/formatters/` — Unused data formatting utilities
- `frontend/src/utils/helpers/` — Removed: dateHelpers, formHelpers, formUtils, stringHelpers (all unused)
- `frontend/src/hooks/useCustomHooks.ts` — Unused custom hooks
- `frontend/src/core/api/` — Empty placeholder directory
- `frontend/src/prompts/*.ts` — Migrated to markdown in `docs/PROMPTS.md` and `docs/OPTIMISED_PROMPTS.md`
- `frontend/src/pages/agents/AppRouter.tsx` — Orphaned router component (routing consolidated into App.tsx)

**Routing fixes:**

- Fixed IntakeForm to ChatRoute navigation via correct `currentPage` signal
- Consolidated all routing logic into App.tsx
- Updated documentation to reflect current signal-based routing pattern

**Status:** Build verified (1555 modules), no broken imports, navigation flow operational

---

## Privacy & Data Governance

- **PII**: Store minimal user data; quiz answers are behavioral, not personally identifying
- **GDPR**: Quiz/segment data must have clear consent; provide export/deletion options
- **Lead Data**: Only raw segment tags sent to CRM; no raw quiz answers
- **Anonymisation**: For analytics/partner reports, aggregate by segment (never individual)
