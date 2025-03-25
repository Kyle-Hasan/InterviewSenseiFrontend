// e2e/ViewInterviewClient.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ViewInterviewClient Page', () => {
  test.beforeEach(async ({ page }) => {
    
    await page.goto('http://localhost:3000/view-interview');
  });

  test('navigates to questions when "Go to Questions" is clicked', async ({ page }) => {
 
    await expect(page.locator('text=Go to Questions')).toBeVisible();

    
    await page.click('text=Go to Questions');

    await expect(page).toHaveURL(/\/interviews\/\d+\/questions\/\d+/);
  });
});
