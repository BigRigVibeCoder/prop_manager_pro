import { test, expect } from '@playwright/test';

test('has title and renders core heading', async ({ page }) => {
    // Navigate to the root URL (configured in playwright.config.ts)
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/PropManage Pro/);

    // Expect the main heading to be visible
    const heading = page.getByRole('heading', { name: 'PropManage Pro' });
    await expect(heading).toBeVisible();
});
