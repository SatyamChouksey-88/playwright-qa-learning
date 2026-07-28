import path from 'path';
import { test, expect } from '@playwright/test';

const sample = path.join(__dirname, '../../fixtures/sample-upload.txt');
const fileName = 'sample-upload.txt';

test('@external ExpandTesting — upload a local file and see success', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/upload');

  const fileInput = page.locator('#fileInput, input[type="file"]').first();
  await expect(fileInput).toBeAttached();
  await fileInput.setInputFiles(sample);

  await page.getByRole('button', { name: /upload/i }).click();

  const result = page.locator('#uploaded-files, .uploaded-file, #file-upload-result, .container').filter({
    hasText: fileName,
  }).first();
  await expect(result).toBeVisible();
  await expect(result).toContainText(fileName);
  await expect(
    page.getByText(/successfully uploaded|file uploaded successfully|upload successful/i).first(),
  ).toBeVisible();
});
