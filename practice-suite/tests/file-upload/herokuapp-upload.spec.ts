import path from 'path';
import { test, expect } from '@playwright/test';

const sample = path.join(__dirname, '../../fixtures/sample-upload.txt');

test('The Internet — upload a file and assert filename on result page', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/upload');

  await page.locator('#file-upload').setInputFiles(sample);
  await page.getByRole('button', { name: 'Upload' }).click();

  await expect(page.getByRole('heading', { name: 'File Uploaded!' })).toBeVisible();
  await expect(page.locator('#uploaded-files')).toHaveText(/sample-upload\.txt/);
});
