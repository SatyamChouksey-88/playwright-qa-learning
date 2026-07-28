/* Practice challenges for Mistakes / Tabs / Clipboard — live UI + Playwright solutions */
window.SKILLS_PRACTICE = {
  mistakes: {
    title: "Practice — fix the anti-pattern",
    lead: "Use each live mini-app, then reveal the Playwright solution. Mark practiced when you can explain the wrong instinct out loud.",
    challenges: [
      {
        id: "sk-sleep",
        name: "Sleep vs web-first assert",
        goal: "Click Load. A chart appears after ~1.2s. Practise waiting the Playwright way (not a blind sleep).",
        traps: "waitForTimeout(3000) is slow when fast and flaky when CI is slower.",
        recipe: `await page.getByRole('button', { name: 'Load chart' }).click();\nawait expect(page.getByTestId('chart')).toBeVisible();\nawait expect(page.getByTestId('chart')).toContainText('Revenue');`,
      },
      {
        id: "sk-overlay",
        name: "Overlay blocks the click (don’t force)",
        goal: "The Save button is covered by a loading overlay. Dismiss/wait for the overlay, then click Save — never force through it.",
        traps: "{ force: true } hides the same bug users hit.",
        recipe: `await expect(page.getByTestId('loading-overlay')).toBeHidden();\nawait page.getByRole('button', { name: 'Save' }).click();\nawait expect(page.getByRole('status')).toHaveText('Saved');`,
      },
      {
        id: "sk-oneshot",
        name: "One-shot isVisible vs expect().toBeVisible",
        goal: "Pick which assertion style retries. Then run the live delayed toast and see why one-shot flakes.",
        traps: "expect(await loc.isVisible()).toBe(true) has no retry.",
        recipe: `// ❌ expect(await page.getByRole('status').isVisible()).toBe(true);\n// ✅\nawait expect(page.getByRole('status')).toBeVisible();\nawait expect(page.getByRole('status')).toHaveText('Payment complete');`,
      },
      {
        id: "sk-strict",
        name: "Strict mode — two Save buttons",
        goal: "Two Save buttons exist. Scope to the dialog (or filter by name) instead of .first().",
        traps: "Reflexive .first() silences strict mode and clicks the wrong control.",
        recipe: `const dialog = page.getByRole('dialog', { name: 'Edit profile' });\nawait dialog.getByRole('button', { name: 'Save' }).click();\n// or: page.getByRole('button', { name: 'Save' }).filter({ hasText: 'Save' }) inside a scoped parent`,
      },
      {
        id: "sk-response",
        name: "waitForResponse ordering",
        goal: "Choose the correct order: register waiter → click → await. Then try the live Load data button.",
        traps: "Awaiting the waiter before click blocks; clicking then waiting can miss a fast response.",
        recipe: `const resP = page.waitForResponse(r => r.url().includes('/api/stats') && r.ok());\nawait page.getByRole('button', { name: 'Load data' }).click();\nawait resP;\nawait expect(page.getByTestId('stats')).toContainText('42');`,
      },
      {
        id: "sk-pickfix",
        name: "Spot the better snippet (quiz pack)",
        goal: "For each scenario, pick the Playwright-native fix. Score yourself before revealing solutions.",
        traps: "Old Selenium habits feel “safe” but fight auto-wait.",
        recipe: `// Prefer:\nawait expect(locator).toBeVisible();\npage.getByRole(...)\ntrace: 'on-first-retry'\nunique data + fresh context\n// Avoid: waitForTimeout, force:true, shared accounts, networkidle as ready`,
      },
    ],
  },

  frames: {
    title: "Practice — tabs & popups",
    lead: "Simulate popup / multi-tab flows in the browser, then study the Playwright Page-switching recipes.",
    challenges: [
      {
        id: "sk-popup",
        name: "Open popup, act, return",
        goal: "Open the docs popup, click Accept inside it, assert the main page shows “Docs opened”, then close the popup.",
        traps: "Waiting for popup after click can miss a fast open — use Promise.all.",
        recipe: `const [popup] = await Promise.all([\n  page.waitForEvent('popup'),\n  page.getByRole('link', { name: 'Open docs' }).click(),\n]);\nawait popup.waitForLoadState();\nawait popup.getByRole('button', { name: 'Accept' }).click();\nawait page.bringToFront();\nawait expect(page.getByText('Docs opened')).toBeVisible();\nawait popup.close();`,
      },
      {
        id: "sk-tabs",
        name: "Switch between two tabs",
        goal: "Open a second “tab”, change something there, switch back with bringToFront-style focus, and assert the original tab still has its state.",
        traps: "Asserting on the wrong Page object; forgetting same-context cookies are shared.",
        recipe: `const page2 = await context.newPage();\nawait page2.goto('/admin');\nawait expect(page2.getByRole('heading', { name: 'Admin' })).toBeVisible();\nawait page.bringToFront();\nawait page.getByRole('button', { name: 'Refresh' }).click();`,
      },
      {
        id: "sk-dialog-vs-popup",
        name: "Native dialog vs HTML modal vs popup",
        goal: "Trigger each type and use the correct API: dialog event, getByRole('dialog'), or waitForEvent('popup').",
        traps: "Treating every “popup” as page.on('dialog').",
        recipe: `// Native confirm\npage.once('dialog', d => d.accept());\nawait page.getByRole('button', { name: 'Delete' }).click();\n\n// HTML modal\nawait page.getByRole('dialog').getByRole('button', { name: 'OK' }).click();\n\n// New window/tab\nconst [popup] = await Promise.all([page.waitForEvent('popup'), click]);`,
      },
    ],
  },

  clipboard: {
    title: "Practice — copy & paste",
    lead: "Practise keyboard copy/paste and clipboard seeding — the same flows you’d automate with permissions + Control/Meta shortcuts.",
    challenges: [
      {
        id: "sk-clip-copy",
        name: "Copy invite code → paste",
        goal: "Copy the invite code (button or select+copy), paste into the field, submit, and see success.",
        traps: "Wrong modifier on macOS (Meta vs Control); missing clipboard permissions in real Playwright.",
        recipe: `await page.getByRole('button', { name: 'Copy code' }).click();\nconst input = page.getByLabel('Paste invite code');\nawait input.click();\nconst mod = process.platform === 'darwin' ? 'Meta' : 'Control';\nawait page.keyboard.press(\`\${mod}+V\`);\nawait page.getByRole('button', { name: 'Apply' }).click();\nawait expect(page.getByRole('status')).toHaveText(/accepted/i);`,
      },
      {
        id: "sk-clip-seed",
        name: "Seed clipboard then paste",
        goal: "Use “Seed clipboard” (simulates navigator.clipboard.writeText), focus the editor, paste, assert text appears.",
        traps: "fill() may skip paste handlers — use real paste when the app listens for paste events.",
        recipe: `await page.evaluate(async (t) => navigator.clipboard.writeText(t), 'Hello from clipboard');\nawait page.locator('[contenteditable=\"true\"]').click();\nawait page.keyboard.press('Control+V');\nawait expect(page.locator('[contenteditable=\"true\"]')).toContainText('Hello from clipboard');`,
      },
      {
        id: "sk-clip-read",
        name: "Assert what the app copied",
        goal: "Click Copy link, then verify the shared URL was placed on the clipboard (read path).",
        traps: "NotAllowedError without clipboard-read permission.",
        recipe: `await page.getByRole('button', { name: 'Copy link' }).click();\nconst clip = await page.evaluate(() => navigator.clipboard.readText());\nexpect(clip).toContain('https://app.example.com/share/');`,
      },
    ],
  },
};
