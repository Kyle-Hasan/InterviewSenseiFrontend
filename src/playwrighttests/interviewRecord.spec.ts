import { test, expect } from '@playwright/test';

test.describe('InterviewRecord Page Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the GET request for question id 777
    await page.route('**/Question/777', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 777,
          body: "Test Interview Question",
          secondsPerAnswer: 30,
          nextQuestionId: 778,
          previousQuestionId: -1,
          interviewId: 207,
        }),
      });
    });

    // Intercept the POST request for sending a video response
    await page.route('**/Response/rateAnswer', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          positiveFeedback: "Good: Great answer that was very insightful...Extra info",
          negativeFeedback: "Needs Improvement: Your content could have been better",
          answer: "Mocked answer"
        }),
      });
    });

    // Navigate to the InterviewRecord page
    await page.goto('http://localhost:3000/interviews/207/questions/777');
  });

  test('loads InterviewRecord page and displays question', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Record Interview' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Question: Test Interview Question' })).toBeVisible();
  });

  test('submits a response and displays review', async ({ page }) => {
    // Click the send button in the VideoRecord component to simulate sending a video response
    await page.click('[data-testid="send-button"]');

    // Verify that the mocked answer is displayed in the review section
    await expect(page.locator('p', { hasText: 'Mocked answer' })).toBeVisible();

    // Check that the good feedback is rendered (it should strip the "Good: " header)
    await expect(page.locator('li', { hasText: 'Great answer that was very insightful' })).toBeVisible();

    // Check that the bad feedback is rendered (it should strip the "Needs Improvement: " header)
    await expect(page.locator('li', { hasText: 'Your content could have been better' })).toBeVisible();
  });
});
