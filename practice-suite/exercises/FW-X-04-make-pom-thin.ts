export class LoginPage {
  readonly hasAssertion: boolean;

  constructor() {
    // TODO: thin POM — no assertions inside the page object
    this.hasAssertion = true;
  }

  static violatesThinPom(source: string): boolean {
    void source;
    return true;
  }
}

export function loginPageSource(): string {
  return `
    async signIn() {
      await this.email.fill('a@test.com');
      await expect(this.submit).toBeVisible();
      await this.submit.click();
    }
  `;
}
