import { test, expect } from '@playwright/test';

test.describe('InterviewList Component', () => {
 
  test.beforeEach(async ({ page }) => {
    
    await page.route('**/Interview/interviewList', async (route) => {
     
      const sampleInterviews = [
        {
          id: 1,
          name: 'Interview 1',
          createdDate: '2023-01-01',
        },
        {
          id: 2,
          name: 'Interview 2',
          createdDate: '2023-01-02',
        },
      ];


      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          pagination: JSON.stringify({ total: 2 }),
        },
        body: JSON.stringify(sampleInterviews),
      });
    });

    
    await page.route('**/Interview/*', async (route, request) => {
      if (request.method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else if (request.method() === 'PUT') {
        
        const body = await request.postDataJSON();
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      } else {
        route.continue();
      }
    });
  });

  test('displays list of interviews and supports sorting', async ({ page }) => {
   
    await page.goto('http://localhost:3000/interview-list');


    await expect(page.locator('text=Interview 1')).toBeVisible();
    await expect(page.locator('text=Interview 2')).toBeVisible();

   
    await page.click('text=Sort by date');
   
    await expect(page.locator('text=Sort by date')).toBeVisible();

    
    await page.click('text=Sort by name');
    await expect(page.locator('text=Sort by name')).toBeVisible();
  });

  test('filters interviews by search text', async ({ page }) => {
    await page.goto('http://localhost:3000/interview-list');

 
    const searchInput = page.locator('input[placeholder="Search by name"]');
    await searchInput.fill('Interview 1');

   
    await page.waitForTimeout(600);

  
    await expect(page.locator('text=Interview 1')).toBeVisible();
    await expect(page.locator('text=Interview 2')).not.toBeVisible();
  });

  test('deletes an interview', async ({ page }) => {
    await page.goto('http://localhost:3000/interview-list');

   
    await expect(page.locator('text=Interview 1')).toBeVisible();

    
    const deleteButton = page.locator('button:has(svg)').first();
    await deleteButton.click();

    
    await expect(page.locator('text=permanently delete')).toBeVisible();


    await page.click('text=Confirm');

   
    await expect(page.locator('text=Interview 1')).not.toBeVisible();
  });

  test('edits an interview', async ({ page }) => {
    await page.goto('http://localhost:3000/interview-list');

   
    await expect(page.locator('text=Interview 2')).toBeVisible();

  
    const editButton = page.locator('button:has(svg)').nth(1);
    await editButton.click();


    const editInput = page.locator('input');
    await editInput.fill('Interview 2 Edited');

   
    await page.click('text=Submit');

   
    await expect(page.locator('text=Interview 2 Edited')).toBeVisible();
  });
});
