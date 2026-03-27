# MANUAL TASKS CHECKLIST - What You Need to Do

> **Auto-completed items**: ✅ 9/15 done by automation
> **Remaining manual items**: ⏳ 6/15 require your action
>
> **Estimated time**: 30-45 minutes

---

## 🔒 CRITICAL SECURITY TASKS (Do First!)

### ⏳ Task 1: Remove Exposed Files

**Priority**: 🔴 CRITICAL - Must do before pushing to GitHub

**What**: Delete two files containing hardcoded credentials

**Files to delete**:

```
❌ frontend/src/lib/grp4_agent.rai                 (Contains IDs, project, region)
❌ frontend/.env                                   (Duplicate credentials)
```

**How**:

1. Open VS Code
2. Navigate to `frontend/src/lib/grp4_agent.rai`
3. Right-click → Delete
4. Navigate to `frontend/.env`
5. Right-click → Delete

**Verify**:

```bash
# Run this in terminal - should return empty (no errors)
ls frontend/src/lib/grp4_agent.rai 2>&1      # Should error: file not found ✓
ls frontend/.env 2>&1                        # Should error: file not found ✓
```

**Status**: ⏳ **PENDING** - You need to do this

---

## 🚀 DEPLOYMENT TASKS

### ⏳ Task 2: Deploy Optimized Prompt to Relevance AI

**Priority**: 🟠 HIGH - Core feature deployment

**What**: Update the system prompt used by the LTFC agent

**Steps**:

1. Navigate to https://relevance.ai
2. Sign in with your account
3. Go to "Agents" section
4. Find "LTFC Fan Itinerary Planner" (ID: 33cc59cb-3135-48c9-9ce6-9858d9cc54b6)
5. Click to open the agent
6. Look for "System Prompt" or "Instructions" section
7. Open `frontend/src/prompts/system-prompt-optimized.ts` in VS Code
8. Copy the content of `OPTIMIZED_SYSTEM_PROMPT` variable (everything in the backticks)
9. Back in Relevance AI, select all existing prompt text
10. Paste the new prompt content
11. Click "Save" or "Update"
12. Note the "Last Updated" timestamp

**Verify**:

```bash
# In browser, test a basic request
"I'm going to Luton from London next Sunday, 2 people, £100"
# Should respond in 15-18 seconds with core itinerary
```

**Expected**: Privacy notice appears at end with "UK GDPR" and "Data Protection Act"

**Status**: ⏳ **PENDING** - You need to do this

---

## 🧪 TESTING TASKS

### ⏳ Task 3: Run Core Feature Tests

**Priority**: 🟠 HIGH - Verify everything works

**What**: Test 6 feature detection scenarios

**Test A - Core Response (No Features)**

```
User message: "Simple request - going to Luton from London Sunday, 2 people"
Expected response:
- Time: 12-18 seconds
- Content: Match details + 3 transport options + venues + cost
- Console log: Initialization messages only, NO [Enable features: ...]
✓ Pass if: Gets response within time limit
```

**Test B - Group Feature**

```
User message: "5 of us want to go as a group and split costs"
Expected response:
- Time: 15-22 seconds
- Content: Core response PLUS group coordination section
- Console log: [Enable features: group]
✓ Pass if: Group section appears with cost splitting details
```

**Test C - Loyalty Feature**

```
User message: "I'm LTFC member, what discounts available?"
Expected response:
- Time: 15-22 seconds
- Content: Core response PLUS member benefits section
- Console log: [Enable features: loyalty]
✓ Pass if: Loyalty section shows perks and exclusive offers
```

**Test D - International Feature**

```
User message: "Flying from France, need visa information"
Expected response:
- Time: 18-26 seconds
- Content: Core response PLUS international support section
- Console log: [Enable features: international]
✓ Pass if: Visa requirements and embassy contacts appear
```

**Test E - Multiple Features**

```
User message: "Group of 3 from Germany, we're members, need booking"
Expected response:
- Time: 22-28 seconds
- Content: Core + all matching features (group, loyalty, international, booking)
- Console log: [Enable features: group, loyalty, international, booking]
✓ Pass if: Multiple sections appear correctly
```

**Test F - GDPR Notice Verification**

```
User message: [Any request from above]
Expected response:
- MUST END with "DATA PROTECTION & PRIVACY NOTICE"
- MUST include "UK GDPR" and "Data Protection Act"
- MUST show user rights: access, deletion, portability, objection
✓ Pass if: Full privacy notice appears at end of EVERY response
```

**How to run tests**:

1. `npm run dev:frontend` (start dev server)
2. Open http://localhost:5173
3. Open browser console (F12)
4. Type each message above
5. Check response time (Network tab) and content
6. Check console for `[Enable features: ...]` messages

**Status**: ⏳ **PENDING** - You need to do this

---

## ✅ VERIFICATION TASKS

### ⏳ Task 4: Verify No Hardcoded Credentials

**Priority**: 🟡 MEDIUM - Security verification

**What**: Confirm no credentials are hardcoded in code

**Commands to run**:

```bash
# All three should return: (empty - no results)
# If they return anything, credentials are still exposed!

grep -r "33cc59cb-3135-48c9-9ce6-9858d9cc54b6" frontend/src --include="*.ts"
# Expected: (empty line, no matches)

grep -r "1abe2539-ac6d-4ec9-bfc0-b47ac54bdfd1" frontend/src --include="*.ts"
# Expected: (empty line, no matches)

grep -r "d7b62b" frontend/src --include="*.ts"
# Expected: (empty line, no matches)
```

**If commands return results**:

- Those files have hardcoded credentials
- Fix: Replace with `import.meta.env.VITE_*` references
- Contact: Need help? Check `SECURITY_IMPLEMENTATION.md`

**Status**: ⏳ **PENDING** - You need to verify

---

### ⏳ Task 5: Verify .gitignore Protection

**Priority**: 🟡 MEDIUM - Security verification

**What**: Confirm .env and \*.rai files are in .gitignore

**Commands to run**:

```bash
# Both lines MUST exist
grep "^\.env$" .gitignore && echo "✅ .env protected"
grep "^\*\.rai$" .gitignore && echo "✅ *.rai protected"

# Expected output:
# ✅ .env protected
# ✅ *.rai protected
```

**If commands fail**:

- Edit `.gitignore` manually
- Add lines (if missing):
  ```
  .env
  *.rai
  ```
- Save file

**Status**: ⏳ **PENDING** - You need to verify

---

### ⏳ Task 6: Verify Build Succeeds

**Priority**: 🟡 MEDIUM - Quality check

**What**: Ensure no TypeScript or build errors

**Run**:

```bash
npm run build:frontend
```

**Expected**:

```
✓ built in 12.45s
```

**If errors occur**:

- Check TypeScript errors: `npm run type-check:frontend`
- Check for missing imports in new files
- Verify all `import` statements exist

**Status**: ⏳ **PENDING** - You need to do this

---

## 📤 GIT PUSH TASKS

### ⏳ Task 7: Push to GitHub

**Priority**: 🟠 HIGH - Final deployment step

**What**: Commit and push all changes to GitHub

**Pre-push checklist** (do these first):

- ✅ Removed `frontend/src/lib/grp4_agent.rai` (Task 1)
- ✅ Removed `frontend/.env` (Task 1)
- ✅ Verified no hardcoded credentials (Task 4)
- ✅ Verified .gitignore is correct (Task 5)
- ✅ Build succeeds (Task 6)
- ✅ All tests pass (Task 3)

**Git commands**:

```bash
# 1. Check status - .env should NOT be listed, *.rai should be deleted
git status

# 2. Add all changes
git add .

# 3. Verify .env is NOT staged
git status | grep -i ".env"
# Expected: (empty - no "modified: .env")

# 4. Commit
git commit -m "feat: implement optimized prompts with secure configuration"

# 5. Push
git push origin main
```

**Verify after push**:

1. Go to GitHub repository
2. Check recent commits show your message
3. Verify `.env` file is NOT in repo
4. Verify `grp4_agent.rai` is NOT in repo (only `grp4_agent.rai.example`)

**Status**: ⏳ **PENDING** - You need to do this after all tasks complete

---

## 📊 TASK PROGRESS

| #         | Task                            | Type         | Est. Time  | Status          |
| --------- | ------------------------------- | ------------ | ---------- | --------------- |
| 1         | Remove exposed files            | Security     | 2 min      | ⏳              |
| 2         | Deploy prompt to Relevance AI   | Deployment   | 10 min     | ⏳              |
| 3         | Run 6 test scenarios            | Testing      | 15 min     | ⏳              |
| 4         | Verify no hardcoded credentials | Verification | 2 min      | ⏳              |
| 5         | Verify .gitignore               | Verification | 1 min      | ⏳              |
| 6         | Verify build succeeds           | Verification | 3 min      | ⏳              |
| 7         | Push to GitHub                  | Deployment   | 2 min      | ⏳              |
| **TOTAL** |                                 |              | **35 min** | **0% complete** |

---

## ✅ COMPLETED TASKS (Already Done)

| #   | Task                           | Details                                           |
| --- | ------------------------------ | ------------------------------------------------- |
| ✅  | Created optimized prompt       | `frontend/src/prompts/system-prompt-optimized.ts` |
| ✅  | Created secure config          | `frontend/src/config/agent-config-secure.ts`      |
| ✅  | Created security guide         | `SECURITY_IMPLEMENTATION.md`                      |
| ✅  | Created integration guide      | `INTEGRATION_GUIDE.md`                            |
| ✅  | Created deployment summary     | `DEPLOYMENT_SUMMARY.md`                           |
| ✅  | Verified environment variables | `constant.ts` uses `import.meta.env`              |
| ✅  | Verified credential masking    | `client.ts` masks with `***`                      |
| ✅  | Feature detection implemented  | `useSendMessage.ts` has keyword patterns          |
| ✅  | Timeout handling implemented   | `useSendMessage.ts` has 3-level fallback          |

---

## 🎯 Success Criteria

**All tasks complete when**:

1. ✅ No exposed files in codebase
2. ✅ Prompt deployed to Relevance AI
3. ✅ All 6 tests pass
4. ✅ No hardcoded credentials in code
5. ✅ .gitignore protects .env and \*.rai
6. ✅ Build succeeds with no errors
7. ✅ Changes pushed to GitHub

---

## 📞 Quick Reference

**Need help?** Check these files:

- `SECURITY_IMPLEMENTATION.md` - Security procedures
- `INTEGRATION_GUIDE.md` - Deployment & testing
- `DEPLOYMENT_SUMMARY.md` - Overview & status

**Test with messages**:

- Group: "Group of 5 split costs"
- Loyalty: "I'm member what discounts"
- International: "Visa from France"

**Check status**:

```bash
git status                    # What changed
npm run build:frontend        # Build check
npm run dev:frontend          # Start dev server
```

---

## 🏁 Final Checklist

Before you finish:

- [ ] Read through all tasks above
- [ ] Complete Task 1 (remove files) - CRITICAL
- [ ] Complete Task 2 (deploy prompt) - HIGH
- [ ] Complete Task 3 (run tests) - HIGH
- [ ] Complete Tasks 4-6 (verify) - MEDIUM
- [ ] Complete Task 7 (push) - HIGH
- [ ] Open this checklist when starting work
- [ ] Mark tasks complete as you finish them

---

**Questions?** Check `INTEGRATION_GUIDE.md` → Troubleshooting section

**Ready?** Start with Task 1 above! 🚀
