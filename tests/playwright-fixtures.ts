import { test as base } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { ApiClient } from '../src/api/ApiClient';

type TestFixtures = {
  loginPage: LoginPage;
  apiClient: ApiClient;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});

export { expect } from '@playwright/test';
