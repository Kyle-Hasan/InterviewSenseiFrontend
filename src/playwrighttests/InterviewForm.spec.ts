import { test, expect } from '@playwright/test';

test.describe('InterviewForm Component - Comprehensive Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'refreshToken',
        value:
          'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoic3RyaW5nIiwidG9rZW5UeXBlIjoicmVmcmVzaCIsImV4cCI6MTc0Mjk3MTkwN30.eVCboSlpI6APMwyP-4SwSsFd_pKskaIxrCSeOJiy8p-VGx7Q_rEFyI_Aub16FmkatxcYl7EJ3-7iWaF5HxuqEw',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax'
      },
      {
        name: 'accessToken',
        value:
          'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoic3RyaW5nIiwidG9rZW5UeXBlIjoiYWNjZXNzIiwiaXNzIjoiYXBwIiwiaWF0IjoxNjg3OTc0NTYwLCJleHAiOjE3NDI5NzE5MDB9.PS4KJf4eHdL60x8ZKCm6Jdy1bSx3xRk8d9cVQX0x1AbcQGvph3dG5P9QkxZpXxYdJvFJ4WVZ2rPqSg4f4gHjYQ',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax'
      }
    ]);
    await page.goto('http://localhost:3000/generateInterviewForm');
  });

  // NON-LIVE: Valid submission
  test('Submits a valid NonLive interview', async ({ page }) => {
    // Fill out form
    await page.fill('input[placeholder="name"]', 'Valid NonLive Interview');
    // Select interview type: Non live
    await page.click('text=Select interview type');
    await page.click('text=Non live');
    // Set seconds per answer
    await page.fill('input[placeholder="0"]', '30');
    // Behavioral and technical questions
    await page.click('text=Select the number of behavioral questions');
    await page.click('text=2');
    await page.click('text=Select the number of technical questions');
    await page.click('text=3');
    // Fill descriptions
    const textareas = await page.locator('textarea').all();
    await textareas[0].fill('Job description valid test');
    if (textareas.length > 1) {
      await textareas[1].fill('Additional description valid test');
    }
    // Intercept submission response for NonLive interview
    await page.route('**/Interview/generateInterview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 101,
          type: "NonLive",
          questions: [{ id: 1, type: 'technical', body: 'Technical Question' }],
          name: 'Valid NonLive Interview',
          jobDescription: 'Job description valid test',
          additionalDescription: 'Additional description valid test',
          secondsPerAnswer: 30
        }),
      });
    });
    await page.click('text=Submit');
    await expect(page).toHaveURL(/\/interviews\/101\/questions\/1/);
  });

  // NON-LIVE: Error on zero questions (both behavioral and technical)
  test('Shows error when NonLive interview has zero questions', async ({ page }) => {
    // Fill form with zero questions
    await page.fill('input[placeholder="name"]', 'No Question Interview');
    await page.click('text=Select interview type');
    await page.click('text=Non live');
    await page.fill('input[placeholder="0"]', '30');
    // Set zero behavioral questions
    await page.click('text=Select the number of behavioral questions');
    await page.click('text=0');
    // Set zero technical questions
    await page.click('text=Select the number of technical questions');
    await page.click('text=0');
    const textareas = await page.locator('textarea').all();
    await textareas[0].fill('Job description no question');
    if (textareas.length > 1) {
      await textareas[1].fill('Additional description no question');
    }
    // Click submit and check error message
    await page.click('text=Submit');
    await expect(page.locator('text=Need more than 1 question')).toBeVisible();
  });

  // NON-LIVE: Error on missing name
  test('Shows error when interview name is missing', async ({ page }) => {
    // Leave name empty
    await page.fill('input[placeholder="name"]', '');
    await page.click('text=Select interview type');
    await page.click('text=Non live');
    await page.fill('input[placeholder="0"]', '30');
    // Set some questions
    await page.click('text=Select the number of behavioral questions');
    await page.click('text=2');
    await page.click('text=Select the number of technical questions');
    await page.click('text=3');
    const textareas = await page.locator('textarea').all();
    await textareas[0].fill('Job description missing name');
    if (textareas.length > 1) {
      await textareas[1].fill('Additional description missing name');
    }
    await page.click('text=Submit');
    await expect(page.locator('text=Interview needs a name')).toBeVisible();
  });

  // NON-LIVE: Error on seconds per answer out of range (<10)
  test('Shows error when seconds per answer is below allowed range', async ({ page }) => {
    await page.fill('input[placeholder="name"]', 'Invalid Seconds Interview');
    await page.click('text=Select interview type');
    await page.click('text=Non live');
    // Enter an invalid seconds value (<10)
    await page.fill('input[placeholder="0"]', '5');
    await page.click('text=Select the number of behavioral questions');
    await page.click('text=1');
    await page.click('text=Select the number of technical questions');
    await page.click('text=1');
    const textareas = await page.locator('textarea').all();
    await textareas[0].fill('Job description invalid seconds');
    if (textareas.length > 1) {
      await textareas[1].fill('Additional description invalid seconds');
    }
    await page.click('text=Submit');
    await expect(page.locator('text=Seconds per answer must be between 10 and 300')).toBeVisible();
  });

  // LIVE interview: Successful submission
  test('Submits a valid Live interview', async ({ page }) => {
    await page.fill('input[placeholder="name"]', 'Valid Live Interview');
    await page.click('text=Select interview type');
    await page.click('text=Live');
    // For live interview, seconds and questions may not be required
    const textareas = await page.locator('textarea').all();
    await textareas[0].fill('Job description live interview');
    if (textareas.length > 1) {
      await textareas[1].fill('Additional description live interview');
    }
    await page.route('**/Interview/generateInterview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 202,
          type: "Live",
          questions: [],
          name: 'Valid Live Interview',
          jobDescription: 'Job description live interview',
          additionalDescription: 'Additional description live interview',
          secondsPerAnswer: 0
        }),
      });
    });
    await page.click('text=Submit');
    await expect(page).toHaveURL(/\/liveInterview\/202/);
  });

  // CodeReview interview: Successful submission
  test('Submits a valid CodeReview interview', async ({ page }) => {
    await page.fill('input[placeholder="name"]', 'Valid CodeReview Interview');
    await page.click('text=Select interview type');
    await page.click('text=Code review');
    const textareas = await page.locator('textarea').all();
    await textareas[0].fill('Job description code review');
    if (textareas.length > 1) {
      await textareas[1].fill('Additional description code review');
    }
    await page.route('**/Interview/generateInterview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 303,
          type: "CodeReview",
          questions: [],
          name: 'Valid CodeReview Interview',
          jobDescription: 'Job description code review',
          additionalDescription: 'Additional description code review',
          secondsPerAnswer: 0
        }),
      });
    });
    await page.click('text=Submit');
    await expect(page).toHaveURL(/\/codingInterview\/303/);
  });

  // LiveCoding interview: Successful submission
  test('Submits a valid LiveCoding interview', async ({ page }) => {
    await page.fill('input[placeholder="name"]', 'Valid LiveCoding Interview');
    await page.click('text=Select interview type');
    await page.click('text=Live coding');
    const textareas = await page.locator('textarea').all();
    await textareas[0].fill('Job description live coding');
    if (textareas.length > 1) {
      await textareas[1].fill('Additional description live coding');
    }
    await page.route('**/Interview/generateInterview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 404,
          type: "LiveCoding",
          questions: [],
          name: 'Valid LiveCoding Interview',
          jobDescription: 'Job description live coding',
          additionalDescription: 'Additional description live coding',
          secondsPerAnswer: 0
        }),
      });
    });
    await page.click('text=Submit');
    await expect(page).toHaveURL(/\/codingInterview\/404/);
  });
});
