import { test, expect } from '@playwright/test';

test.describe('VideoRecord Component Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Stub getUserMedia and MediaRecorder to simulate recording
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async (constraints) => {
        return new MediaStream(); // Return a dummy stream
      };

      class DummyMediaRecorder {
        public state = 'inactive';
        public ondataavailable: (event: { data: Blob }) => void = () => {};
        public onstop: () => void = () => {};
        public onerror: (event: ErrorEvent) => void = () => {};
        constructor(stream: MediaStream) {}
        start() {
          this.state = 'recording';
          // Simulate data available after a short delay then stop
          setTimeout(() => {
            this.ondataavailable({ data: new Blob(['dummy video data'], { type: 'video/webm' }) });
            this.state = 'inactive';
            this.onstop();
          }, 500);
        }
        stop() {
          if (this.state === 'recording') {
            this.state = 'inactive';
            this.onstop();
          }
        }
      }
      (window as any).MediaRecorder = DummyMediaRecorder;
    });

    // Intercept the GET request for question id 777
    await page.route('**/Question/777', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 777,
          body: "Test Interview Question",
          secondsPerAnswer: 10, // Short duration for testing
          nextQuestionId: -1,
          previousQuestionId: -1,
          interviewId: 207,
        }),
      });
    });

    // Navigate to the InterviewRecord page
    await page.goto('http://localhost:3000/interviews/207/questions/777');
  });

  test('VideoRecord UI flows correctly', async ({ page }) => {
    // Verify initial state: preview text is visible
    await expect(page.locator('text=Press start recording to show video')).toBeVisible();

    // Click "Start Recording" using locator with hasText
    await page.locator('button', { hasText: 'Start Recording' }).click();

    // Verify recording UI: Time remaining and Stop Recording button appear
    await expect(page.locator('text=Time remaining:')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Stop Recording' })).toBeVisible();

    // Wait for the dummy recorder to simulate data and stop (stub stops after 500ms)
    await page.waitForTimeout(600);

    // After stopping, the UI should show the "Send for review" button
    await expect(page.locator('button', { hasText: 'Send for review' })).toBeVisible();

    // Click "Send for review"
    await page.locator('button', { hasText: 'Send for review' }).click();

    // Optionally: add assertions that validate state changes after submission
  });
});
