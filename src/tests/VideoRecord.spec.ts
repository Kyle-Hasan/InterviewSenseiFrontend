
import { test, expect } from '@playwright/test';

test.describe('VideoRecord Component', () => {
  test.beforeEach(async ({ page }) => {

    await page.goto('http://localhost:3000/video-record');
  });

  test('allows starting, stopping, and sending a recording', async ({ page }) => {
    
    await expect(page.locator('text=Start Recording')).toBeVisible();


    await page.click('text=Start Recording');

 
    await expect(page.locator('text=Stop Recording')).toBeVisible();

    
    await page.click('text=Stop Recording');

    
    await expect(page.locator('text=Send for review')).toBeVisible();

    
    await page.click('text=Send for review');
  });
});
