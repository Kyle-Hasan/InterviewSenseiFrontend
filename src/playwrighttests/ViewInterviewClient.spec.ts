import { test, expect } from '@playwright/test';

test.describe('ViewInterview Page Integration', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set authentication cookies
    await context.addCookies([
      {
        name: 'refreshToken',
        value: 'valid-refresh-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
      {
        name: 'accessToken',
        value: 'valid-access-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // If using signed URLs, intercept the resume URL API call.
    // For example, if NEXT_PUBLIC_SIGNED_URLS is "true" and the interview.resumeLink is provided,
    // you might do something like this:
    //
    // await page.route('**/Interview/getPdf/123_resume.pdf', async (route) => {
    //   await route.fulfill({
    //     status: 200,
    //     contentType: 'application/json',
    //     body: JSON.stringify({ result: 'http://localhost:3000/static/123_resume.pdf' }),
    //   });
    // });
    //
    // In this test we'll assume that NEXT_PUBLIC_SIGNED_URLS is "false", so no interception is needed.

    // Navigate to the ViewInterview page
    await page.goto('http://localhost:3000/viewInterview/193');
  });

  test('renders disabled InterviewForm with correct values and navigates on button click', async ({ page }) => {
    // Verify that the "Go to Questions" button is visible for a NonLive interview
    const buttonLocator = page.locator('button', { hasText: 'Go to Questions' });
    await expect(buttonLocator).toBeVisible();

    // Verify that the InterviewForm is rendered in disabled state.
    // For example, check the input for interview name.
    const nameInput = page.locator('input[placeholder="name"]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toBeDisabled();
    // Assuming the interview name is "Test Interview"
    await expect(nameInput).toHaveValue('Test Interview');

    // Optionally, check that the resume name is rendered.
    // The InterviewForm converts the resume URL into a name. For instance,
    // if the resume link is "http://localhost:3000/Interview/getPdf/123_resume.pdf",
    // the component extracts the part after the underscore.
    const resumeName = page.locator('text', { hasText: 'resume.pdf' });
    await expect(resumeName).toBeVisible();

    // Click the "Go to Questions" button
    await buttonLocator.click();

    // Verify that the router navigates to the first question.
    // According to your component, it should navigate to:
    // `/interviews/${interview.id}/questions/${interview.questions[0].id}`
    // For our test, this is expected to be /interviews/193/questions/777.
    await expect(page).toHaveURL(/\/interviews\/193\/questions\/777/);
  });
});
