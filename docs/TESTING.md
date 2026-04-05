# Testing Procedures

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests for specific workspace
npm test -w frontend
npm test -w backend

# Run tests with coverage
npm run test:coverage
```

## Frontend Testing

### Unit Tests (Jest/Vitest)

```bash
npm test -w frontend
```

Test files: `**/*.test.ts` or `**/*.test.tsx`

Example test structure:

```typescript
// src/utils/dateHelpers.test.ts
import { formatDate, getFutureDates } from "./dateHelpers";

describe("dateHelpers", () => {
  it("should format date correctly", () => {
    const result = formatDate(new Date("2026-04-06"));
    expect(result).toContain("Apr");
  });

  it("should calculate future dates", () => {
    const dates = getFutureDates(3);
    expect(dates.length).toBe(3);
  });
});
```

### Component Tests

```typescript
// src/components/my-component.test.tsx
import { render, screen } from '@testing-library/preact';
import MyComponent from './my-component';

describe('MyComponent', () => {
  it('should render text', () => {
    render(<MyComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```bash
npm run test:e2e        # Run E2E tests
npm run test:e2e:ui     # Run with UI (visual debugging)
```

Test files: `frontend/playwright.config.js` configured for <http://localhost:5173>

Example E2E test:

```typescript
// e2e/chat.spec.ts
import { test, expect } from "@playwright/test";

test("should send message and receive response", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.fill('input[placeholder="Type message"]', "Test message");
  await page.click('button[type="submit"]');

  await expect(page.locator('[data-testid="agent-message"]')).toBeVisible();
});
```

**Before running E2E tests:** Ensure dev servers are running

```bash
npm run dev &
npm run test:e2e
```

## Backend Testing

### Unit Tests (Jest/Vitest)

```bash
npm test -w backend
```

Test files: `**/*.test.ts`

Example backend test:

```typescript
// src/services/shareService.test.ts
import { createShare, getShare } from "./shareService";

describe("shareService", () => {
  it("should create and retrieve share", async () => {
    const share = await createShare({ participants: 2 });
    expect(share.id).toBeDefined();

    const retrieved = await getShare(share.id);
    expect(retrieved.participants).toBe(2);
  });
});
```

### API Tests

```typescript
// e2e/api.spec.ts
import { test, expect } from "@playwright/test";

test("POST /api/shares should create share", async ({ request }) => {
  const response = await request.post("http://localhost:3000/api/shares", {
    data: { participants: 2 },
  });

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.id).toBeDefined();
});
```

## Coverage Reports

```bash
npm run test:coverage
```

View HTML coverage report:

- Frontend: `frontend/coverage/index.html`
- Backend: `backend/coverage/index.html`

Minimum coverage thresholds (enforced in CI):

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Test Tips

- **Keep tests focused**: One assertion or behavior per test
- **Use descriptive names**: `should format date as DD/MM/YYYY` not `test date`
- **Mock external APIs**: Use jest mocks for Relevance AI SDK calls
- **Test user interactions**: E2E tests should simulate real user workflows
- **Run tests before commit**: `npm test && npm run type-check`

## Continuous Integration

Tests are automatically run on push/PR via GitHub Actions. All tests must pass before merging:

- Linting: `npm run lint`
- Type-check: `npm run type-check`
- Unit tests: `npm test`
- Coverage gates: Must meet minimum thresholds

Ensure all tests pass locally before pushing:

```bash
npm run lint:fix       # Auto-fix linting issues
npm run type-check     # Check TypeScript
npm test               # Run all tests
```
