// e2e/InterviewQuestions.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('InterviewQuestions Page', () => {
  test.beforeEach(async ({ page }) => {
    
    await page.goto('http://localhost:3000/interview-questions');
  });

  test('displays current question and navigates between questions', async ({ page }) => {
  
    await expect(page.locator('text=Test question')).toBeVisible();

   
    await page.click('text=Next Question');

    await expect(page.locator('text=Question 2')).toBeVisible();

    
    await page.click('text=Go Back');
    await expect(page.locator('text=Test question')).toBeVisible();
  });

  test('shows confirmation dialog when unsaved video exists', async ({ page }) => {

    await page.click('text=Next Question');

  
    await expect(page.locator('text=Unsaved response')).toBeVisible();

    
    await page.click('text=Confirm');

    await expect(page.locator('text=Question 2')).toBeVisible();
  });
});
