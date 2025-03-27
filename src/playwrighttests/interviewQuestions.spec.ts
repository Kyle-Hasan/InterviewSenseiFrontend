import { test, expect } from '@playwright/test';

test.describe('InterviewQuestions Page', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept GET /Question/616 and return mocked data for the first question
    await page.route('**/Question/616', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 616,
          body: "Test question",
          secondsPerAnswer: 30,
          nextQuestionId: 617,
          previousQuestionId: -1,
          interviewId: 148,
        }),
      });
    });

    // Intercept GET /Question/617 and return mocked data for the second question
    await page.route('**/Question/617', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 617,
          body: "Question 2",
          secondsPerAnswer: 30,
          nextQuestionId: -1,
          previousQuestionId: 616,
          interviewId: 148,
        }),
      });
    });

    // Go directly to the first question URL
    await page.goto('http://localhost:3000/interviews/148/questions/616');
  });

  test('displays current question and navigates between questions', async ({ page }) => {
    // The mocked question (id: 616) should be visible
    await expect(page.locator('text=Test question')).toBeVisible();

    // Click "Next Question" to navigate; this triggers a GET to /Question/617
    await page.click('text=Next Question');
    await expect(page.locator('text=Question 2')).toBeVisible();

    // Click "Go Back" to navigate to the previous question
    await page.click('text=Go Back');
    await expect(page.locator('text=Test question')).toBeVisible();
  });

  test('shows confirmation dialog when unsaved video exists', async ({ page }) => {
    // Simulate unsaved video by invoking an exposed testing hook
    // (Ensure your component sets window.__setUnsavedVideo for testing purposes)

    // Clicking "Next Question" should now trigger the confirmation dialog
    await page.click('text=Next Question');
    await expect(page.locator('text=Unsaved response')).toBeVisible();

    // Confirm the dialog so that it navigates to the next question
    await page.click('text=Confirm');
    await expect(page.locator('text=Question 2')).toBeVisible();
  });
});
