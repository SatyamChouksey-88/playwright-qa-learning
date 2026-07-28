import { test, expect } from '@playwright/test';

test('TutorialsPoint — page has horizontal overflow content to scroll', async ({ page }) => {
  await page.goto('https://www.tutorialspoint.com/selenium/practice/horizontal-scroll.php');

  // Prefer a wide element / container — fall back to document scrollWidth check
  const hasOverflow = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll('div, section, main, body')];
    return candidates.some((el) => (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth + 20);
  });
  expect(hasOverflow).toBeTruthy();

  await page.evaluate(() => {
    const el = [...document.querySelectorAll('div, section, main')].find(
      (n) => (n as HTMLElement).scrollWidth > (n as HTMLElement).clientWidth + 20,
    ) as HTMLElement | undefined;
    if (el) el.scrollLeft = el.scrollWidth;
    else window.scrollBy(400, 0);
  });

  const scrolled = await page.evaluate(() => {
    const el = [...document.querySelectorAll('div, section, main')].find(
      (n) => (n as HTMLElement).scrollWidth > (n as HTMLElement).clientWidth + 20,
    ) as HTMLElement | undefined;
    return el ? el.scrollLeft > 0 : window.scrollX > 0;
  });
  expect(scrolled).toBeTruthy();
});
