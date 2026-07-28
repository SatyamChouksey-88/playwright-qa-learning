import path from 'path';
import { test, expect } from '@playwright/test';

const sample = path.join(__dirname, '../../fixtures/sample-upload.txt');

test('DemoQA — upload a file and assert the path appears', async ({ page }) => {
  await page.goto('https://demoqa.com/upload-download');
  await page.locator('#close-fixedban').click({ timeout: 3000 }).catch(() => {});

  const input = page.locator('#uploadFile');
  await expect(input).toBeAttached();
  await input.setInputFiles(sample);

  await expect(page.locator('#uploadedFilePath')).toContainText(/sample-upload\.txt/);
});
