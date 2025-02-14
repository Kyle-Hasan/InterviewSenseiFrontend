// e2e/InterviewForm.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('InterviewForm Component', () => {
  test.beforeEach(async ({ page }) => {
 
    await page.goto('http://localhost:3000/interview-form');
  });

  test('fills out and submits the interview form', async ({ page }) => {
    
    await page.fill('input[placeholder="name"]', 'Test Interview');

    
    await page.fill('input[placeholder="0"]', '30');

  
    await page.click('text=Select the number of behavioral questions');
    await page.click('text=2');

    
    await page.click('text=Select the number of technical questions');
    await page.click('text=3');

   
    const textareas = await page.locator('textarea').all();
    await textareas[0].fill('Job description test');
    if (textareas.length > 1) {
      await textareas[1].fill('Additional description test');
    }

  
    await page.route('**/Interview/generateInterview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 123,
          questions: [{ id: 1, type: 'technical', body: 'Question 1' }],
          name: 'Test Interview',
          jobDescription: 'Job description test',
          additionalDescription: 'Additional description test',
          secondsPerAnswer: 30,
        }),
      });
    });

   
    await page.click('text=Submit');

   
    await expect(page).toHaveURL(/\/interviews\/123\/questions\/1/);
  });
});
