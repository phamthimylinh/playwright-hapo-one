import { expect, Page } from '@playwright/test';
import { test } from './playwright-fixtures';

const GOOGLE_ACCOUNT_EMAIL = process.env.TEST_USER_EMAIL || 'linh.ptm@haposoft.com';
const GOOGLE_ACCOUNT_PASSWORD = process.env.TEST_USER_PASSWORD || '';

test('login with Google redirects to attendance page', async ({ page, context, loginPage }) => {
  // Increase test timeout to 5 minutes to allow for manual 2FA confirmation
  test.setTimeout(300000);

  await loginPage.goto();

  // We use Promise.race to instantly detect if it's a popup OR a same-page redirect without waiting a full 5 seconds.
  const popupPromise = context.waitForEvent('page').catch(() => null);
  await loginPage.loginWithGoogle();

  let googlePopup: Page | null = null;
  try {
    const result = await Promise.race([
      popupPromise,
      page.waitForURL(/accounts\.google/, { timeout: 10000 }).then(() => 'REDIRECT')
    ]);
    if (result !== 'REDIRECT') {
      googlePopup = result as Page | null;
    }
  } catch {
    // Ignore wait timeout
  }

  const targetPage = googlePopup || page;

  // It's safer to wait for the locators to appear directly rather than domcontentloaded
  // because if it is a same-page navigation, domcontentloaded might resolve for the old page immediately.
  const emailInput = targetPage.locator('input[type="email"]');
  const accountOption = targetPage.getByText(GOOGLE_ACCOUNT_EMAIL);

  try {
    // Wait up to 15s to cover slow networks and navigations
    await emailInput.or(accountOption.first()).waitFor({ state: 'visible', timeout: 15000 });
  } catch {
    console.log('Timeout waiting for Google login elements');
  }

  if (await emailInput.isVisible()) {
    // Input email and press Next
    await emailInput.fill(GOOGLE_ACCOUNT_EMAIL);
    await targetPage.locator('#identifierNext button').click();

    // Wait for password input to appear if required
    // NOTE: We use `input[name="Passwd"]` because Google login has a hidden `input[type="password"]` that breaks strict mode.
    const passwordInput = targetPage.locator('input[name="Passwd"]');
    try {
      await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      if (GOOGLE_ACCOUNT_PASSWORD) {
        await passwordInput.fill(GOOGLE_ACCOUNT_PASSWORD);
        await targetPage.locator('#passwordNext button').click();

        // 🚀 ĐOẠN NÀY ĐÃ ĐƯỢC TỐI ƯU: Không dùng `await` để tránh bị block 10 giây nếu 2FA KHÔNG xuất hiện.
        // Tiến trình theo dõi 2FA sẽ chạy ngầm, nếu thấy 2FA thì in console, nếu nhảy trang luôn thì catch im lặng.
        targetPage.locator('text=/2-Step Verification|Xác minh 2 bước/i').first()
          .waitFor({ state: 'visible', timeout: 10000 })
          .then(() => console.log('📱 Vui lòng kiểm tra điện thoại để xác thực 2 bước (2FA)...'))
          .catch(() => { });
      } else {
        console.warn('⚠️ Google requires a password but GOOGLE_ACCOUNT_PASSWORD is not provided or empty in your variables!');
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.log('Password input did not appear or skipped:', errorMsg);
    }
  } else if (await accountOption.isVisible()) {
    // Click on existing account option
    await accountOption.first().click();
  }

  // Increase timeout to 240 seconds (4 minutes) to give enough time for manual 2FA phone confirmation
  await expect(page).toHaveURL(/\/attendance(?:\/)?(?:\?.*)?$/, { timeout: 240000 });
})