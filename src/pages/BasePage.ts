import { Page } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '') {
    const base = process.env.BASE_URL ?? '';
    const url = base ? new URL(path, base).toString() : path;
    await this.page.goto(url);
  }

  // Use after navigation or major actions that trigger multiple requests.
  // Prefer explicit waits (URL/locator/response) when possible to avoid slowing tests.
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}
