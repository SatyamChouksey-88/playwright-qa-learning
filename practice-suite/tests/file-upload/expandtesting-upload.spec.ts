import path from 'path';
import { test, expect } from '@playwright/test';

const sample = path.join(__dirname, '../../fixtures/sample-upload.txt');

test('ExpandTesting — upload a local file and see success', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/upload');

  const fileInput = page.locator('#fileInput, input[type="file"]').first();
  await expect(fileInput).toBeAttached();
  await fileInput.setInputFiles(sample);

  await page.getByRole('button', { name: /upload/i }).click();

  await expect(page.getByText(/sample-upload\.txt/i)).toBeVisible();
  await expect(page.getByText(/uploaded|success|file/i).first()).toBeVisible();
});
