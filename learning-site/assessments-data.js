/* Bank Assessments workbook — scenarios + expected + Playwright hints (self-contained) */
window.ASSESSMENTS_DATA = {
  hub: {
    title: "Assessments — Apex Trust Bank workbook",
    lead: "Run these cases against the live Bank Demo on this site. Mark each case practiced. Selector hints map to elements in the demo.",
  },
  cases: [
    { id: "BANK-AUTH-01", module: "Authentication", type: "Positive", difficulty: "Basic", priority: "P3",
      objective: "Login succeeds with valid credentials",
      steps: "Open Bank Demo → username apex_user → password Password123! → Sign In",
      data: "apex_user / Password123!",
      expected: "Dashboard shows Welcome back, Apex User",
      hints: 'input[name="username"], input[name="password"], button:has-text("Sign In"), #welcome-banner',
      solution: `await page.getByLabel('Username').or(page.locator('[name="username"]')).fill('apex_user');
await page.getByLabel('Password').or(page.locator('[name="password"]')).fill('Password123!');
await page.getByRole('button', { name: 'Sign In' }).click();
await expect(page.locator('#welcome-banner')).toContainText('Apex User');` },
    { id: "BANK-AUTH-02", module: "Authentication", type: "Negative", difficulty: "Basic", priority: "P3",
      objective: "Login fails with invalid password",
      steps: "Enter apex_user + WrongPass → Sign In",
      data: "apex_user / WrongPass",
      expected: "Error: Invalid username or password; stay on login",
      hints: '[data-testid="error-alert"], .error-message',
      solution: `await page.locator('[name="username"]').fill('apex_user');
await page.locator('[name="password"]').fill('WrongPass');
await page.getByRole('button', { name: 'Sign In' }).click();
await expect(page.getByTestId('error-alert')).toHaveText(/Invalid username or password/i);` },
    { id: "BANK-AUTH-03", module: "Authentication", type: "Negative", difficulty: "Basic", priority: "P3",
      objective: "Login fails for unregistered user",
      steps: "ghost_user + any password → Sign In",
      data: "ghost_user",
      expected: "Invalid username or password",
      hints: ".error-message",
      solution: `await page.locator('[name="username"]').fill('ghost_user');
await page.locator('[name="password"]').fill('x');
await page.getByRole('button', { name: 'Sign In' }).click();
await expect(page.locator('.error-message')).toBeVisible();` },
    { id: "BANK-AUTH-04", module: "Authentication", type: "Positive", difficulty: "Intermediate", priority: "P2",
      objective: "Forgot password shows OTP sent state",
      steps: "Forgot Password? → enter email → Send OTP",
      data: "any email",
      expected: "Simulated OTP sent banner/toast",
      hints: "#forgot-link, [name='reset-email'], #send-otp, .otp-sent",
      solution: `await page.locator('#forgot-link').click();
await page.locator('[name="reset-email"]').fill('user@example.com');
await page.locator('#send-otp').click();
await expect(page.locator('.otp-sent')).toBeVisible();` },
    { id: "BANK-AUTH-05", module: "Authentication", type: "Positive", difficulty: "Advanced", priority: "P1",
      objective: "2FA login with OTP 123456",
      steps: "apex_2fa / Password2FA! → enter OTP 123456 → Verify",
      data: "apex_2fa / Password2FA! / 123456",
      expected: "Dashboard welcome",
      hints: ".otp-input, #verify-2fa, #welcome-banner",
      solution: `await page.locator('[name="username"]').fill('apex_2fa');
await page.locator('[name="password"]').fill('Password2FA!');
await page.getByRole('button', { name: 'Sign In' }).click();
const digits = '123456';
const inputs = page.locator('.otp-input');
for (let i = 0; i < 6; i++) await inputs.nth(i).fill(digits[i]);
await page.locator('#verify-2fa').click();
await expect(page.locator('#welcome-banner')).toBeVisible();` },
    { id: "BANK-DASH-01", module: "Dashboard", type: "Positive", difficulty: "Basic", priority: "P3",
      objective: "Checking and Savings balances display",
      steps: "Login → read balances",
      data: "$4,250.00 / $18,400.00",
      expected: "Checking $4,250.00 and Savings $18,400.00",
      hints: '[data-account="checking"] .balance, [data-account="savings"] .balance',
      solution: `await expect(page.locator('[data-account="checking"] .balance')).toHaveText('$4,250.00');
await expect(page.locator('[data-account="savings"] .balance')).toHaveText('$18,400.00');` },
    { id: "BANK-DASH-02", module: "Dashboard", type: "Positive", difficulty: "Basic", priority: "P3",
      objective: "Recent transactions table has rows",
      steps: "Login → assert transactions table",
      data: "N/A",
      expected: "At least 3 transaction rows",
      hints: "#transactions-table tbody tr",
      solution: `await expect(page.locator('#transactions-table tbody tr')).not.toHaveCount(0);
await expect(page.locator('#transactions-table tbody tr')).toHaveCount(3);` },
    { id: "BANK-DASH-03", module: "Dashboard", type: "Positive", difficulty: "Basic", priority: "P3",
      objective: "Net worth visibility toggle",
      steps: "Click eye toggle → net worth masked → click again",
      data: "N/A",
      expected: "Shows $****** then reveals amount",
      hints: ".toggle-visibility-btn, .net-worth-val",
      solution: `await page.locator('.toggle-visibility-btn').click();
await expect(page.locator('.net-worth-val')).toHaveText('$******');
await page.locator('.toggle-visibility-btn').click();
await expect(page.locator('.net-worth-val')).not.toHaveText('$******');` },
    { id: "BANK-TRSF-01", module: "Fund Transfer", type: "Positive", difficulty: "Intermediate", priority: "P2",
      objective: "Add beneficiary successfully",
      steps: "Transfers → Add Beneficiary → fill → Save",
      data: "John Doe / 9876543210 / Chase Bank",
      expected: "John Doe appears in list",
      hints: "#add-beneficiary, #bene-name, #bene-account, #bene-bank, .beneficiary-item",
      solution: `await page.getByRole('button', { name: 'Transfers' }).click();
await page.locator('#add-beneficiary').click();
await page.locator('#bene-name').fill('John Doe');
await page.locator('#bene-account').fill('9876543210');
await page.locator('#bene-bank').selectOption('Chase Bank');
await page.getByRole('button', { name: 'Save Beneficiary' }).click();
await expect(page.getByText('John Doe')).toBeVisible();` },
    { id: "BANK-TRSF-02", module: "Fund Transfer", type: "Negative", difficulty: "Intermediate", priority: "P2",
      objective: "Duplicate beneficiary blocked",
      steps: "Add beneficiary with account 1234567890",
      data: "1234567890",
      expected: "Beneficiary with this account number already exists",
      hints: ".bene-error-alert",
      solution: `await page.getByRole('button', { name: 'Transfers' }).click();
await page.locator('#add-beneficiary').click();
await page.locator('#bene-name').fill('Dup');
await page.locator('#bene-account').fill('1234567890');
await page.getByRole('button', { name: 'Save Beneficiary' }).click();
await expect(page.locator('.bene-error-alert')).toContainText(/already exists/i);` },
    { id: "BANK-TRSF-05", module: "Fund Transfer", type: "Positive", difficulty: "Intermediate", priority: "P2",
      objective: "Internal transfer Checking → Savings $500",
      steps: "Between My Accounts → Execute Transfer 500",
      data: "500",
      expected: "Success; balances update",
      hints: "#from-acc, #to-acc, #transfer-amount, #exec-transfer, .transfer-success-msg",
      solution: `await page.getByRole('button', { name: 'Transfers' }).click();
await page.locator('#transfer-type').selectOption('Between My Accounts');
await page.locator('#from-acc').selectOption('Checking');
await page.locator('#to-acc').selectOption('Savings');
await page.locator('#transfer-amount').fill('500');
await page.locator('#exec-transfer').click();
await expect(page.locator('.transfer-success-msg')).toBeVisible();` },
    { id: "BANK-TRSF-06", module: "Fund Transfer", type: "Negative", difficulty: "Intermediate", priority: "P2",
      objective: "Insufficient funds blocked",
      steps: "Transfer 5000 from Checking",
      data: "5000",
      expected: "Insufficient funds in the source account",
      hints: ".transfer-error-msg",
      solution: `await page.getByRole('button', { name: 'Transfers' }).click();
await page.locator('#transfer-amount').fill('5000');
await page.locator('#exec-transfer').click();
await expect(page.locator('.transfer-error-msg')).toContainText(/Insufficient funds/i);` },
    { id: "BANK-TRSF-07", module: "Fund Transfer", type: "Positive", difficulty: "Advanced", priority: "P1",
      objective: "External wire with OTP",
      steps: "Add bene if needed → External Wire → Initiate Wire → enter shown OTP → Submit",
      data: "1000 + OTP from UI",
      expected: "Wire transfer … complete",
      hints: "#initiate-wire, .sim-otp, #submit-otp, .transfer-success-msg",
      solution: `await page.getByRole('button', { name: 'Transfers' }).click();
await page.locator('#transfer-type').selectOption('External Wire');
await page.locator('#transfer-amount').fill('1000');
await page.locator('#to-acc').selectOption({ label: /Existing Bene|John/ });
await page.locator('#initiate-wire').click();
const otp = await page.locator('.sim-otp').innerText();
await page.getByLabel('Wire OTP').fill(otp.trim());
await page.locator('#submit-otp').click();
await expect(page.locator('.transfer-success-msg')).toContainText(/Wire transfer/i);` },
    { id: "BANK-LOAN-01", module: "Loan Center", type: "Positive", difficulty: "Basic", priority: "P3",
      objective: "EMI calculator Personal Loan 10000 / 12% / 24m",
      steps: "Loans → set values → Calculate EMI",
      data: "10000, 12, 24",
      expected: "Monthly EMI around $470.73",
      hints: "#loan-amount, #loan-rate, #loan-term, .emi-output",
      solution: `await page.getByRole('button', { name: 'Loans' }).click();
await page.locator('#loan-amount').fill('10000');
await page.locator('#loan-rate').fill('12');
await page.locator('#loan-term').fill('24');
await page.getByRole('button', { name: 'Calculate EMI' }).click();
await expect(page.locator('.emi-output')).toContainText(/470\\.73/);` },
    { id: "BANK-LOAN-03", module: "Loan Center", type: "Positive", difficulty: "Intermediate", priority: "P2",
      objective: "Loan application Under Review",
      steps: "Apply with income 75000 amount 25000",
      data: "75000 / 25000",
      expected: "Status Under Review + loan-ref-id",
      hints: "#app-income, #submit-loan-app, .loan-ref-id",
      solution: `await page.getByRole('button', { name: 'Loans' }).click();
await page.locator('#app-name').fill('Ada');
await page.locator('#app-income').fill('75000');
await page.locator('#app-amount').fill('25000');
await page.locator('#submit-loan-app').click();
await expect(page.getByText('Under Review')).toBeVisible();
await expect(page.locator('.loan-ref-id').first()).toBeVisible();` },
    { id: "BANK-LOAN-04", module: "Loan Center", type: "Negative", difficulty: "Intermediate", priority: "P2",
      objective: "Reject when income too low vs amount",
      steps: "Income 5000 amount 50000",
      data: "5000 / 50000",
      expected: "Rejected",
      hints: ".loan-status-rejected",
      solution: `await page.getByRole('button', { name: 'Loans' }).click();
await page.locator('#app-income').fill('5000');
await page.locator('#app-amount').fill('50000');
await page.locator('#submit-loan-app').click();
await expect(page.locator('.loan-status-rejected').first()).toContainText('Rejected');` },
    { id: "BANK-CARD-01", module: "Cards", type: "Positive", difficulty: "Basic", priority: "P3",
      objective: "Freeze card shows FROZEN",
      steps: "Cards → Freeze Card",
      data: "N/A",
      expected: "Overlay FROZEN / status Locked",
      hints: "#freeze-switch, .card-status, .frozen-overlay",
      solution: `await page.getByRole('button', { name: 'Cards' }).click();
await page.locator('#freeze-switch').check();
await expect(page.locator('.card-status')).toHaveText('Locked');
await expect(page.locator('.frozen-overlay')).toHaveText('FROZEN');` },
    { id: "BANK-CARD-02", module: "Cards", type: "Positive", difficulty: "Intermediate", priority: "P2",
      objective: "Update daily limit to 1500",
      steps: "Move slider → Save Limits",
      data: "1500",
      expected: "Limits updated successfully toast",
      hints: "#limit-slider, #save-limits, .bank-toast",
      solution: `await page.getByRole('button', { name: 'Cards' }).click();
await page.locator('#limit-slider').fill('1500');
await page.locator('#save-limits').click();
await expect(page.locator('.bank-toast')).toContainText(/Limits updated/i);` },
    { id: "BANK-SUPP-01", module: "Support", type: "Positive", difficulty: "Intermediate", priority: "P2",
      objective: "Create support ticket with attachment",
      steps: "Fill subject/category/details → optional file → Submit",
      data: "Transaction discrepancy",
      expected: "Open ticket row appears",
      hints: "#ticket-subject, #ticket-file, #submit-ticket, .ticket-row",
      solution: `await page.getByRole('button', { name: 'Support' }).click();
await page.locator('#ticket-subject').fill('Transaction discrepancy');
await page.locator('#ticket-details').fill('Unauthorized charge');
await page.locator('#ticket-file').setInputFiles({
  name: 'screenshot.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgo=', 'base64')
});
await page.locator('#submit-ticket').click();
await expect(page.getByText('Transaction discrepancy')).toBeVisible();` },
    { id: "BANK-SETT-01", module: "Settings", type: "Positive", difficulty: "Basic", priority: "P3",
      objective: "Update phone number",
      steps: "Settings → change phone → Update Profile",
      data: "+1 (555) 987-6543",
      expected: "Profile updated successfully",
      hints: "#profile-phone, #save-profile, .toast-success / .bank-toast",
      solution: `await page.getByRole('button', { name: 'Settings' }).click();
await page.locator('#profile-phone').fill('+1 (555) 987-6543');
await page.locator('#save-profile').click();
await expect(page.locator('.bank-toast')).toContainText(/Profile updated/i);` },
  ]
};
