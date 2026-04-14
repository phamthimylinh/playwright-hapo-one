import { test, expect } from '../../playwright-fixtures';

test.describe('API seed helpers', () => {
  test('seed user @seed-user', async ({ apiClient }) => {
    const timestamp = Date.now();
    const payload = {
      name: `Seed User ${timestamp}`,
      email: `seed+${timestamp}@example.com`,
      password: 'Password123!',
    };

    const response = await apiClient.createUser(payload);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('id');
  });
});
