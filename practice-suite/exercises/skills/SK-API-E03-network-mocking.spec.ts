import { test, expect } from '@playwright/test';
import { mockJsonRoute } from './SK-API-E03-network-mocking';

test('@skills SK-API-E03 mock handler', async ({ page }) => {
  await page.route('**/api/x', mockJsonRoute({ ok: true }));
  await page.setContent('<script>fetch("/api/x").then(r=>r.json()).then(d=>document.body.textContent=String(d.ok))</script>');
  await expect(page.locator('body')).toHaveText('true');
});
