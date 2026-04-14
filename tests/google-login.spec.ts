import { expect } from '@playwright/test';
import { test } from './playwright-fixtures';

const GOOGLE_ACCOUNT_EMAIL = process.env.TEST_USER_EMAIL || 'linh.ptm@haposoft.com';
const GOOGLE_ACCOUNT_PASSWORD = process.env.TEST_USER_PASSWORD || '';

test('login with Google redirects to attendance page', async ({ page, context, loginPage }) => {
  await loginPage.goto();

  const popupPromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);
  await loginPage.loginWithGoogle();
  const googlePopup = await popupPromise;

  const targetPage = googlePopup || page;

  // It's safer to wait for the locators to appear directly rather than domcontentloaded
  // because if it is a same-page navigation, domcontentloaded might resolve for the old page immediately.
  const emailInput = targetPage.locator('input[type="email"]');
  const accountOption = targetPage.getByText(GOOGLE_ACCOUNT_EMAIL);

  try {
    // Wait up to 15s to cover slow networks and navigations
    await emailInput.or(accountOption.first()).waitFor({ state: 'visible', timeout: 15000 });
  } catch (e) {
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

        // Wait to see if 2-Step Verification screen appears
        try {
          // Both "2-Step Verification" and "Xác minh 2 bước" (Vietnamese) might appear
          const twoFactorPrompt = targetPage.locator('text=/2-Step Verification|Xác minh 2 bước/i');
          await twoFactorPrompt.first().waitFor({ state: 'visible', timeout: 10000 });
          console.log('📱 Vui lòng kiểm tra điện thoại để xác thực 2 bước (2FA)...');
        } catch (e) {
          // 2FA screen might not appear or it redirected quickly
        }
      } else {
        console.warn('⚠️ Google requires a password but GOOGLE_ACCOUNT_PASSWORD is not provided or empty in your variables!');
      }
    } catch (e: any) {
      console.log('Password input did not appear or skipped:', e.message);
    }
  } else if (await accountOption.isVisible()) {
    // Click on existing account option
    await accountOption.first().click();
  }

  // Increase timeout to 120 seconds to give enough time for manual 2FA phone confirmation
  await expect(page).toHaveURL(/\/attendance(?:\/)?(?:\?.*)?$/, { timeout: 120000 });
});
