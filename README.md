# Playwright automation framework (starter)

This repository contains a small, reusable Playwright + TypeScript automation test framework scaffold.

What's included
- `playwright.config.ts` — base Playwright config (already present)
- `tsconfig.json` — TypeScript configuration for tests and page objects
- `src/pages` — Page Object Model classes (BasePage, LoginPage)
- `src/api` — lightweight API helper client (`ApiClient`)
- `src/utils` — small utilities (test data generator)
- `tests/playwright-fixtures.ts` — shared fixtures that inject page objects and API client into tests
- `tests/example.spec.ts` — basic Playwright smoke examples
- `tests/api/seed.spec.ts` — entrypoint to run all seed suites
- `tests/api/seeds/*.seed.ts` — seed suites by entity (user, product, etc.)
- `.env.example` — example env vars

Getting started
1. Install dependencies:

```bash
npm install
npx playwright install
```

2. Copy `.env.example` to `.env` and update `BASE_URL` and credentials.

3. Run tests:

```bash
npm test
```

Run only API seed test:

```bash
npx playwright test tests/api/seed.spec.ts
```

Run only user seed:

```bash
npx playwright test tests/api/seed.spec.ts --grep "@seed-user"
```

Run only product seed:

```bash
npx playwright test tests/api/seed.spec.ts --grep "@seed-product"
```

Helpful tips
- Keep selectors in page objects; avoid using them directly in tests.
- Use `tests/playwright-fixtures.ts` to add more fixtures (e.g., API helpers, DB cleanup).
- Add test tags and projects in `playwright.config.ts` for CI matrix runs.
