
import { test, expect } from '@playwright/test';

test('InterviewRecord page integration', async ({ page }) => {

  await page.route('**/Response/rateAnswer', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        feedback:
          "ignored@u5W$Good: Great answer that was very insightful...Extra info@u5W$Needs Improvement: Your content could have been better",
        answer: "Mocked answer"
      }),
    });
  });

  
  await page.goto('http://localhost:3000/interview');

  
  await expect(page.locator('h2', { hasText: 'Record Interview' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Question:' })).toBeVisible();


  await page.click('[data-testid="send-button"]');


  await expect(page.locator('p', { hasText: 'Mocked answer' })).toBeVisible();
  await expect(page.locator('li', { hasText: 'Great answer that was very insightful' })).toBeVisible();
  await expect(page.locator('li', { hasText: 'Your content could have been better' })).toBeVisible();
});
